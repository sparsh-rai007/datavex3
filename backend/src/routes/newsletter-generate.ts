import express, { Response } from "express";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import { pool } from "../db/connection";
import {
  runDailyNewsletter,
  cronStatus,
  hasRecentCronError,
} from "../services/dailyNewsletterService";

const router = express.Router();

/**
 * POST /api/newsletter/generate-daily
 * Manual trigger for the daily newsletter pipeline.
 */
router.post(
  "/generate-daily",
  authenticateToken,
  requireRole("admin", "editor"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const draft = await runDailyNewsletter();

      return res.status(201).json({
        message: "Newsletter generated successfully",
        newsletter: draft,
      });
    } catch (error: any) {
      console.error("Newsletter generate-daily error:", error.message);
      return res.status(500).json({
        error: error.message || "Failed to generate newsletter content",
      });
    }
  }
);

/**
 * GET /api/newsletter/cron-health
 * Returns current scheduler/runtime health for newsletter automation.
 */
router.get(
  "/cron-health",
  authenticateToken,
  requireRole("admin", "editor", "viewer"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const dbResult = await pool.query(
        `SELECT created_at FROM newsletters ORDER BY created_at DESC LIMIT 1`
      );

      const lastSuccessfulDbRecord = dbResult.rows[0]?.created_at || null;

      let status: "healthy" | "running" | "failed" = "healthy";
      if (cronStatus.isRunning) {
        status = "running";
      } else if (hasRecentCronError()) {
        status = "failed";
      }

      return res.status(200).json({
        status,
        is_currently_running: cronStatus.isRunning,
        last_successful_db_record: lastSuccessfulDbRecord,
        last_cron_execution: cronStatus.lastRunTimestamp,
        last_error: cronStatus.lastError,
      });
    } catch (error: any) {
      console.error("Newsletter cron health check failed:", error);
      return res.status(500).json({
        error: error.message || "Failed to fetch newsletter cron health",
      });
    }
  }
);

export default router;
