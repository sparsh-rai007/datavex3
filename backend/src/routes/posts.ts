import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all posts
router.get('/', authenticateToken, requireRole('admin', 'editor', 'viewer'), async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT p.*, u.first_name || ' ' || u.last_name as author_name
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (status) {
      conditions.push(`p.status = $${params.length + 1}`);
      params.push(status);
    }

    if (search) {
      conditions.push(
        `(p.title ILIKE $${params.length + 1} OR p.content ILIKE $${params.length + 1} OR p.slug ILIKE $${params.length + 1})`
      );
      params.push(`%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(Number(limit), offset);

    const result = await pool.query(query, params);
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM posts${conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : ''}`,
      status || search ? params.slice(0, -2) : []
    );

    res.json({
      posts: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:id', authenticateToken, requireRole('admin', 'editor', 'viewer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT p.*, u.first_name || ' ' || u.last_name as author_name
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create post
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'editor'),
  [
    body('title').notEmpty().withMessage('Title is required').trim().isLength({ min: 1, max: 255 }),
    body('slug').notEmpty().withMessage('Slug is required').trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid slug format'),
    body('content').optional(),
    body('excerpt').optional().trim(),
    body('status').optional().isIn(['draft', 'published', 'archived']),
    body('meta_title').optional().trim(),
    body('meta_description').optional().trim(),
    body('meta_keywords').optional().trim(),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        slug,
        content,
        excerpt,
        status = 'draft',
        featured_image_url,
        meta_title,
        meta_description,
        meta_keywords,
      } = req.body;

      // Check if slug already exists
      const slugCheck = await pool.query('SELECT id FROM posts WHERE slug = $1', [slug]);
      if (slugCheck.rows.length > 0) {
        return res.status(409).json({ error: 'A post with this slug already exists' });
      }

      const result = await pool.query(
        `INSERT INTO posts (title, slug, content, excerpt, author_id, status, featured_image_url, meta_title, meta_description, meta_keywords, published_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          title,
          slug,
          content || null,
          excerpt || null,
          req.user?.id,
          status,
          featured_image_url || null,
          meta_title || null,
          meta_description || null,
          meta_keywords || null,
          status === 'published' ? new Date() : null,
        ]
      );

      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error('Create post error:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'A post with this slug already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update post
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'editor'),
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }),
    body('slug').optional().trim().matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Invalid slug format'),
    body('status').optional().isIn(['draft', 'published', 'archived']),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const updates = req.body;

      // Check if post exists
      const postCheck = await pool.query('SELECT * FROM posts WHERE id = $1', [id]);
      if (postCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check slug uniqueness if slug is being updated
      if (updates.slug && updates.slug !== postCheck.rows[0].slug) {
        const slugCheck = await pool.query('SELECT id FROM posts WHERE slug = $1 AND id != $2', [updates.slug, id]);
        if (slugCheck.rows.length > 0) {
          return res.status(409).json({ error: 'A post with this slug already exists' });
        }
      }

      // Build update query
      const setClause: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      const allowedFields = [
        'title', 'slug', 'content', 'excerpt', 'status', 'featured_image_url',
        'meta_title', 'meta_description', 'meta_keywords', 'seo_score',
      ];

      Object.keys(updates).forEach((key) => {
        if (allowedFields.includes(key)) {
          setClause.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      // Handle published_at
      if (updates.status === 'published' && postCheck.rows[0].status !== 'published') {
        setClause.push(`published_at = $${paramIndex}`);
        values.push(new Date());
        paramIndex++;
      }

      if (setClause.length === 0) {
        return res.status(400).json({ error: 'No valid fields to update' });
      }

      values.push(id);
      const query = `UPDATE posts SET ${setClause.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await pool.query(query, values);

      // Create revision
      if (updates.content || updates.title) {
        await pool.query(
          `INSERT INTO post_revisions (post_id, title, content, excerpt, author_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, result.rows[0].title, result.rows[0].content, result.rows[0].excerpt, req.user?.id]
        );
      }

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete post
router.delete('/:id', authenticateToken, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM posts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post revisions
router.get('/:id/revisions', authenticateToken, requireRole('admin', 'editor', 'viewer'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT pr.*, u.first_name || ' ' || u.last_name as author_name
       FROM post_revisions pr
       LEFT JOIN users u ON pr.author_id = u.id
       WHERE pr.post_id = $1
       ORDER BY pr.created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get revisions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;




