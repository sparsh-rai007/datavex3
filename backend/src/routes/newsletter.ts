import express, { Response } from "express";
import { pool } from "../db/connection";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  requireRole("admin", "editor", "viewer"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT * FROM newsletters ORDER BY created_at DESC`
      );

      return res.json({ newsletters: result.rows });
    } catch (error) {
      console.error("Get newsletters error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/public/all", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, status, sent_at, created_at
       FROM newsletters
       WHERE status = 'published'
       ORDER BY created_at DESC`
    );

    return res.json({ newsletters: result.rows });
  } catch (error) {
    console.error("Public newsletters error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, status, sent_at, created_at
       FROM newsletters
       WHERE id = $1 AND status = 'published'`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Newsletter not found" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Public newsletter error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get(
  "/today",
  authenticateToken,
  requireRole("admin", "editor", "viewer"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT *
         FROM newsletters
         WHERE created_at >= CURRENT_DATE
         ORDER BY created_at DESC
         LIMIT 1`
      );

      return res.json({ draft: result.rows[0] || null });
    } catch (error) {
      console.error("Get today's newsletter error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.put(
  "/:id/publish",
  authenticateToken,
  requireRole("admin", "editor"),
  async (req: AuthRequest, res: Response) => {
    try {
      const newsletterId = req.params.id;
      const content =
        typeof req.body?.content === "string" ? req.body.content : null;
      const title =
        typeof req.body?.title === "string" ? req.body.title : null;

      const result = await pool.query(
        `UPDATE newsletters
         SET
           title = COALESCE($2, title),
           content = COALESCE($3, content),
           status = 'published',
           sent_at = NOW()
         WHERE id = $1
         RETURNING *`,
        [newsletterId, title, content]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Newsletter not found" });
      }

      return res.status(200).json({ newsletter: result.rows[0] });
    } catch (error) {
      console.error("Publish newsletter error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
