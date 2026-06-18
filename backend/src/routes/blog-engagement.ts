import { Router, Request, Response } from 'express';
import { pool } from '../db/connection';
import crypto from 'crypto';

const router = Router();

// Helper to generate a unique hash for a visitor based on IP and User-Agent
function getVisitorHash(req: Request): string {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
}

/**
 * POST /api/blogs/public/:slug/view
 * Record a unique view for a blog post
 */
router.post('/public/:slug/view', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const visitorHash = getVisitorHash(req);

  try {
    // Get the blog ID first
    const blogResult = await pool.query('SELECT id FROM blogs WHERE slug = $1', [slug]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    const blogId = blogResult.rows[0].id;

    // Insert view (ignores if already exists due to UNIQUE constraint)
    await pool.query(`
      INSERT INTO blog_views (blog_id, visitor_hash)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [blogId, visitorHash]);

    res.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/blogs/public/:slug/like
 * Toggle a like for a blog post
 */
router.post('/public/:slug/like', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const visitorHash = getVisitorHash(req);

  try {
    const blogResult = await pool.query('SELECT id FROM blogs WHERE slug = $1', [slug]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    const blogId = blogResult.rows[0].id;

    // Check if like exists
    const checkResult = await pool.query(`
      SELECT 1 FROM blog_likes WHERE blog_id = $1 AND visitor_hash = $2
    `, [blogId, visitorHash]);

    let liked = false;
    if (checkResult.rows.length > 0) {
      // Remove like
      await pool.query(`
        DELETE FROM blog_likes WHERE blog_id = $1 AND visitor_hash = $2
      `, [blogId, visitorHash]);
    } else {
      // Add like
      await pool.query(`
        INSERT INTO blog_likes (blog_id, visitor_hash)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [blogId, visitorHash]);
      liked = true;
    }

    res.json({ success: true, liked });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/blogs/public/:slug/engagement
 * Get view count, like count, and whether current visitor has liked
 */
router.get('/public/:slug/engagement', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const visitorHash = getVisitorHash(req);

  try {
    const blogResult = await pool.query('SELECT id FROM blogs WHERE slug = $1', [slug]);
    if (blogResult.rows.length === 0) {
      return res.status(404).json({ error: 'Blog not found' });
    }
    const blogId = blogResult.rows[0].id;

    const viewsResult = await pool.query('SELECT COUNT(*) FROM blog_views WHERE blog_id = $1', [blogId]);
    const likesResult = await pool.query('SELECT COUNT(*) FROM blog_likes WHERE blog_id = $1', [blogId]);
    const userLikeResult = await pool.query('SELECT 1 FROM blog_likes WHERE blog_id = $1 AND visitor_hash = $2', [blogId, visitorHash]);

    res.json({
      views: parseInt(viewsResult.rows[0].count, 10),
      likes: parseInt(likesResult.rows[0].count, 10),
      hasLiked: userLikeResult.rows.length > 0
    });
  } catch (error) {
    console.error('Error getting engagement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/blogs/public/engagement/bulk
 * Get engagement stats for multiple blogs by comma-separated slugs
 */
router.get('/public/engagement/bulk', async (req: Request, res: Response) => {
  const slugsParam = req.query.slugs as string;
  if (!slugsParam) return res.json({});

  const slugs = slugsParam.split(',').map(s => s.trim()).filter(Boolean);
  if (slugs.length === 0) return res.json({});

  try {
    const result = await pool.query(`
      SELECT 
        b.slug,
        (SELECT COUNT(*) FROM blog_views v WHERE v.blog_id = b.id) as views,
        (SELECT COUNT(*) FROM blog_likes l WHERE l.blog_id = b.id) as likes
      FROM blogs b
      WHERE b.slug = ANY($1)
    `, [slugs]);

    const stats: Record<string, { views: number, likes: number }> = {};
    for (const row of result.rows) {
      stats[row.slug] = {
        views: parseInt(row.views, 10),
        likes: parseInt(row.likes, 10)
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Error getting bulk engagement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
