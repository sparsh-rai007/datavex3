import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { pool } from "../db/connection";
import { runDailyNewsletter } from "../services/dailyNewsletterService";

const router = express.Router();

// Fetch most recent newsletter from today (draft or published)
router.get(
  "/today",
  authenticateToken,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const result = await pool.query(
        `SELECT *
         FROM newsletters
         WHERE created_at >= CURRENT_DATE
         ORDER BY
           CASE WHEN status = 'draft' THEN 0 ELSE 1 END,
           created_at DESC
         LIMIT 1`
      );

      return res.status(200).json({
        draft: result.rows[0] || null,
      });
    } catch (error: any) {
      console.error("Failed to fetch today's newsletter draft:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch today's newsletter draft",
      });
    }
  }
);

// Manual trigger for automated daily newsletter pipeline
router.post(
  "/trigger",
  authenticateToken,
  requireRole("admin"),
  async (_req, res) => {
    try {
      const draft = await runDailyNewsletter();

      return res.status(201).json({
        message: "Daily newsletter generated successfully",
        mode: "automatic",
        newsletter: {
          id: draft.id,
          title: draft.title,
          status: draft.status,
          created_at: draft.created_at,
        },
      });
    } catch (error: any) {
      console.error("Manual newsletter trigger failed:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate daily newsletter",
      });
    }
  }
);

export default router;
