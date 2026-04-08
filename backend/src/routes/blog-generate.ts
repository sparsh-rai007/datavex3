import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import { pool } from "../db/connection";
import {
  generateFromUrl,
  generateFromKeyword,
} from "../services/blogGenerator";

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
 * POST /api/blog/generate
 *
 * AI Blog Generator endpoint.
 * Accepts { type: "keyword" | "url", query: string }
 * Generates content, saves as draft, and returns the saved blog row.
 */
router.post(
  "/generate",
  authenticateToken,
  requireRole("admin", "editor"),
  [
    body("type")
      .isIn(["keyword", "url"])
      .withMessage('type must be either "keyword" or "url"'),
    body("query")
      .notEmpty()
      .withMessage("query is required")
      .isString()
      .withMessage("query must be a string")
      .isLength({ min: 3, max: 2000 })
      .withMessage("query must be between 3 and 2000 characters"),
  ],
  async (req: AuthRequest, res: Response) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, query, tone } = req.body as {
        type: "keyword" | "url";
        query: string;
        tone?: any;
      };

      const authorId = req.user?.id || null;

      console.log(
        `🤖 Blog generation started: type=${type}, query="${query.slice(0, 80)}...", tone=${tone}`
      );

      let result;
      console.log("type", type);

      if (type === "url") {
        // Validate it looks like a URL
        try {
          console.log("urll one")
          new URL(query);
        } catch {
          return res.status(400).json({
            error: "Invalid URL format. Please provide a valid URL.",
          });
        }
        console.log("url one")
        result = await generateFromUrl(query, tone);

      } else {
        console.log("keyword one")
        result = await generateFromKeyword(query, tone);

      }

      console.log(`✅ Blog generated: "${result.title}"`);

      // ── Generate Unique Slug ──────────────────────────────────
      const slug = slugify(result.title) + "-" + Date.now();

      const saved = await pool.query(
        `INSERT INTO blogs (
          title, slug, content, status, generation_method, source_reference, author_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *`,
        [
          result.title,
          slug,
          result.content,
          "draft",
          result.generationMethod,
          result.sourceReference,
          authorId,
        ]
      );

      return res.status(200).json({
        message: "Blog content generated successfully",
        blog: saved.rows[0],
      });
    } catch (error: any) {
      console.error("❌ Blog generation error:", error.message);

      // Return a clean error message
      const statusCode = error.message?.includes("API key") ? 503 : 500;
      return res.status(statusCode).json({
        error: error.message || "Failed to generate blog content",
      });
    }
  }
);

export default router;
