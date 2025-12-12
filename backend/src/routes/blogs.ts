import express, { Request, Response } from 'express';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create Blog
router.post(
  '/',
  authenticateToken,
  requireRole('admin', 'editor'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
  title,
  slug,
  excerpt,
  content,
  featured_image,
  meta_title,
  meta_description,
  status = 'draft',
  external_url
} = req.body;

const authorId = req.user?.id;

const result = await pool.query(
  `INSERT INTO blogs (
      title, slug, excerpt, content, featured_image,
      meta_title, meta_description, status, author_id, external_url
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  RETURNING *`,
  [
    title,
    slug,
    excerpt,
    content,
    featured_image,
    meta_title,
    meta_description,
    status,
    authorId,
    external_url
  ]
);


      res.status(201).json(result.rows[0]);
    } catch (error: any) {
      console.error("Create blog error:", error);
      if (error.code === "23505") {
        return res.status(409).json({ error: "Slug already exists" });
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get all blogs (Admin)
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'editor', 'viewer'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT * FROM blogs ORDER BY created_at DESC`
      );
      res.json({ blogs: result.rows });
    } catch (error) {
      console.error("Get blogs error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
router.get("/latest", async (req, res) => {
  try {
    const query = `
      SELECT id, title, slug, excerpt,author_id, created_at, featured_image, external_url
      FROM blogs
       WHERE status = 'published'
      ORDER BY created_at DESC
      LIMIT 3;
    `;

    const { rows } = await pool.query(query);
    return res.json(rows);
  } catch (error) {
    console.error("Error fetching latest blogs:", error);
    return res.status(500).json({ error: "Failed to load latest blogs" });
  }
});
// Get single blog (Admin)
router.get(
  '/:id',
  authenticateToken,
  requireRole('admin', 'editor', 'viewer'),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT * FROM blogs WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ error: "Blog not found" });

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Get blog error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);


// Update Blog
router.put(
  '/:id',
  authenticateToken,
  requireRole('admin', 'editor'),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
  title,
  slug,
  excerpt,
  content,
  featured_image,
  meta_title,
  meta_description,
  status,
  external_url
} = req.body;

const result = await pool.query(
  `UPDATE blogs SET
      title=$1,
      slug=$2,
      excerpt=$3,
      content=$4,
      featured_image=$5,
      meta_title=$6,
      meta_description=$7,
      status=$8,
      external_url=$9,
      updated_at=NOW()
    WHERE id=$10
    RETURNING *`,
  [
    title,
    slug,
    excerpt,
    content,
    featured_image,
    meta_title,
    meta_description,
    status,
    external_url,
    req.params.id
  ]
);


      if (result.rows.length === 0)
        return res.status(404).json({ error: "Blog not found" });

      res.json(result.rows[0]);
    } catch (error: any) {
      console.error("Update blog error:", error);

      if (error.code === "23505")
        return res.status(409).json({ error: "Slug already exists" });

      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Delete Blog
router.delete(
  '/:id',
  authenticateToken,
  requireRole('admin'),
  async (req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `DELETE FROM blogs WHERE id = $1 RETURNING id`,
        [req.params.id]
      );

      if (result.rows.length === 0)
        return res.status(404).json({ error: "Blog not found" });

      res.json({ message: "Blog deleted successfully" });
    } catch (error) {
      console.error("Delete blog error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get('/public/all', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
  `SELECT title, slug, excerpt, featured_image, created_at, external_url
   FROM blogs
   WHERE status = 'published'
   ORDER BY created_at DESC`
);


    res.json({ blogs: result.rows });
  } catch (error) {
    console.error("Public blogs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get('/public/:slug', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM blogs WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Blog not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Public blog error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
