import express from "express";
import { authenticateToken, requireRole } from "../middleware/auth";
import { generateDailyNewsletter } from "../services/dailyNewsletterService";

const router = express.Router();

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
