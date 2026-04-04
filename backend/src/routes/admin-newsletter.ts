import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { pool } from "../db/connection";
import { generateDailyNewsletter } from "../services/dailyNewsletterService";

const router = express.Router();

// Fetch most recent newsletter draft from today
router.get(
  "/today",
  authenticateToken,
  requireRole("admin"),
  async (_req, res) => {
    try {
      let result;
      try {
        result = await pool.query(
          `SELECT *
           FROM blogs
           WHERE type = 'newsletter'
             AND status = 'draft'
             AND created_at >= CURRENT_DATE
           ORDER BY created_at DESC
           LIMIT 1`
        );
      } catch (error: any) {
        // Backward compatibility if blogs.type has not been migrated yet.
        if (error?.code !== "42703") {
          throw error;
        }

        result = await pool.query(
          `SELECT *
           FROM blogs
           WHERE status = 'draft'
             AND generation_method IN ('ai_newsletter', 'newsletter')
             AND created_at >= CURRENT_DATE
           ORDER BY created_at DESC
           LIMIT 1`
        );
      }

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
      const draft = await generateDailyNewsletter();
      return res.status(201).json({
        message: "Daily newsletter generated successfully",
        newsletter: {
          id: draft.id,
          title: draft.title,
          slug: draft.slug,
          status: draft.status,
          type: draft.type,
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
