import express, { Request, Response } from 'express';
import { pool } from '../db/connection';
import { authenticateToken, requireRole, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/newsletter/today
 * Retrieves the most recent newsletter draft generated today.
 */
router.get(
  '/today',
  authenticateToken,
  requireRole('admin', 'editor', 'viewer'),
  async (req: AuthRequest, res: Response) => {
    try {
      // Find a draft from today with generation_method starting with 'ai_' or 'newsletter'
      const result = await pool.query(
        `SELECT * FROM blogs 
         WHERE status = 'draft' 
         AND created_at >= CURRENT_DATE 
         ORDER BY created_at DESC 
         LIMIT 1`
      );

      if (result.rows.length === 0) {
        return res.status(200).json({ draft: null });
      }

      res.json({ draft: result.rows[0] });
    } catch (error) {
      console.error("Get today's newsletter error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * GET /api/newsletter
 * List all newsletters (Admin)
 */
router.get(
  '/',
  authenticateToken,
  requireRole('admin', 'editor', 'viewer'),
  async (_req: AuthRequest, res: Response) => {
    try {
      const result = await pool.query(
        `SELECT * FROM blogs 
         WHERE generation_method = 'newsletter' OR title ILIKE '%Newsletter%'
         ORDER BY created_at DESC`
      );
      res.json({ newsletters: result.rows });
    } catch (error) {
      console.error("Get newsletters error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Reuse other blog CRUD as needed but specifically for newsletters
// For simplicity, we'll keep them compatible with the blogs table for now.

export default router;
