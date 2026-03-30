import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Use a fast, small model — perfect for structured JSON review tasks
const REVIEW_MODEL = "llama-3.1-8b-instant";

let _groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

export interface ReviewResult {
  score: number;
  factual_warnings: string[];
  formatting_errors: string[];
  general_feedback: string;
}

/**
 * POST /api/blog/review
 *
 * Audits a blog draft for factual accuracy, structural integrity,
 * and citation formatting. Returns a strict JSON review report.
 */
router.post(
  "/review",
  authenticateToken,
  requireRole("admin", "editor"),
  [
    body("content")
      .notEmpty().withMessage("content is required")
      .isString().withMessage("content must be a string")
      .isLength({ min: 50 }).withMessage("content is too short to review")
      .isLength({ max: 50_000 }).withMessage("content exceeds maximum length"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { content } = req.body as { content: string };

    // Truncate to ~12K chars to stay well within context limits
    const truncated = content.slice(0, 12_000);

    console.log("\n" + "=".repeat(60));
    console.log(`🔍 [Blog Review] Auditing draft (${content.length.toLocaleString()} chars)...`);
    console.log("=".repeat(60));

    const systemPrompt = `You are a ruthless, highly critical technical blog editor. Your job is to review the provided markdown blog draft.

Check for:
1. Factual inaccuracies or hallucinations — flag any specific claim that seems wrong or unverifiable.
2. Missing code blocks or broken markdown image links (e.g. \`![alt](url)\` with broken or generic URLs).
3. Missing per-section citations — the blog MUST have a reference line at the end of every H2 section, formatted exactly as: *Reference: [Title](URL)*. Flag every section that is missing this.

You MUST respond with ONLY a valid JSON object — no prose, no markdown, no explanation outside the JSON.

The JSON must have exactly these four keys:
{
  "score": <integer 1-100 based on overall quality and strict rule adherence>,
  "factual_warnings": ["list of specific factual errors or suspicious claims — be precise"],
  "formatting_errors": ["list of broken markdown, missing code blocks, or missing section references — be specific about which section"],
  "general_feedback": "<2-3 sentence summary of the draft quality and top priority fix>"
}`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: REVIEW_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: `Review this blog draft:\n\n${truncated}` },
        ],
        temperature: 0.2,        // Low temp for consistent, analytical output
        max_tokens: 1024,
        response_format: { type: "json_object" },  // Force JSON mode
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const rawJson = completion.choices?.[0]?.message?.content || "{}";

      console.log(`✅ [Blog Review] Complete in ${duration}s`);

      // Parse and validate the JSON
      let review: ReviewResult;
      try {
        review = JSON.parse(rawJson);
      } catch {
        console.error("❌ [Blog Review] Failed to parse Groq JSON response:", rawJson);
        return res.status(502).json({
          error: "The AI returned an unparseable response. Please try again.",
        });
      }

      // Ensure required keys exist (defensive fallback)
      const safeReview: ReviewResult = {
        score:              typeof review.score === "number" ? Math.min(100, Math.max(1, review.score)) : 50,
        factual_warnings:   Array.isArray(review.factual_warnings)  ? review.factual_warnings  : [],
        formatting_errors:  Array.isArray(review.formatting_errors) ? review.formatting_errors : [],
        general_feedback:   typeof review.general_feedback === "string" ? review.general_feedback : "No feedback generated.",
      };

      console.log(`📊 [Blog Review] Score: ${safeReview.score}/100 | Warnings: ${safeReview.factual_warnings.length} | Errors: ${safeReview.formatting_errors.length}`);

      return res.status(200).json(safeReview);

    } catch (err: any) {
      const isTimeout = err.message?.includes("timeout") || err.code === "ECONNABORTED";
      console.error(`❌ [Blog Review] Error: ${err.message}`);

      if (isTimeout) {
        return res.status(504).json({ error: "Review timed out. The blog may be too long. Try shortening it." });
      }

      return res.status(500).json({ error: "Failed to review blog. Please try again." });
    }
  }
);

export default router;
