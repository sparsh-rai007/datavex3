import express, { Response } from "express";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import { pool } from "../db/connection";
import {
  generateFromKeyword,
} from "../services/newsletterGenerator";

const router = express.Router();

/**
 * Generate a URL-safe slug from a title.
 */
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

/**
 * POST /api/newsletter/force-run
 *
 * Manual trigger for daily newsletter generation.
 * This simulates the overnight cron job.
 */
router.post(
  "/force-run",
  authenticateToken,
  requireRole("admin", "editor"),
  async (req: AuthRequest, res: Response) => {
    try {
      console.log(`🤖 Force-run Daily Tech Newsletter for today...`);

      // Mock scanning RSS feeds by using a broad keyword for now
      const result = await generateFromKeyword("Latest Tech Trends and News Analysis", "human");

      // Save as draft for today
      const slug = slugify(result.title) + "-" + Date.now();
      const authorId = req.user?.id || null;

      const saved = await pool.query(
        `INSERT INTO blogs (
            title, slug, excerpt, content, generation_method, status, author_id
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *`,
        [
          result.title,
          slug,
          `Daily Tech Briefing: ${result.title.slice(0, 100)}...`,
          result.content,
          "newsletter",
          "draft",
          authorId
        ]
      );

      console.log(`✅ Automated Daily Newsletter draft created: "${result.title}"`);
      return res.status(200).json({
        message: "Newsletter generated successfully",
        newsletter: saved.rows[0],
      });
    } catch (error: any) {
      console.error("❌ Force-run newsletter error:", error.message);
      return res.status(500).json({
        error: error.message || "Failed to generate newsletter content",
      });
    }
  }
);

export default router;
