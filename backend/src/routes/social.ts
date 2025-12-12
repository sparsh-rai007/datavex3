import express from "express";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import { SocialCredentials } from "../services/integrations/social/credentials";
import { SocialPublisher } from "../services/integrations/social/publisher";

const router = express.Router();

/**
 * GET /social/credentials
 * Returns ALL stored credentials in grouped format
 */
router.get(
  "/credentials",
  authenticateToken,
  requireRole("admin"),
  async (_req: AuthRequest, res) => {
    try {
      const creds = await SocialCredentials.getAll();
      res.json(creds);
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to load credentials" });
    }
  }
);

/**
 * POST /social/credentials
 * Saves all credentials for LinkedIn, Reddit, Instagram
 */
router.post(
  "/credentials",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const body = req.body;

      if (body.linkedin) {
        await SocialCredentials.save("linkedin", body.linkedin);
      }

      if (body.reddit) {
        await SocialCredentials.save("reddit", body.reddit);
      }

      if (body.instagram) {
        await SocialCredentials.save("instagram", body.instagram);
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: "Failed to save credentials" });
    }
  }
);

/**
 * POST /social/publish
 * Publishes a post to selected platforms
 */
router.post(
  "/publish",
  authenticateToken,
  requireRole("admin"),
  async (req: AuthRequest, res) => {
    try {
      const { platforms, title, content, url, imageUrl } = req.body;

      if (!platforms || platforms.length === 0) {
        return res.status(400).json({ error: "No platforms selected" });
      }

      const result = await SocialPublisher.publishToPlatforms({
        platforms,
        title,
        content,
        url,
        imageUrl,
      });

      res.json({ success: true, result });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
