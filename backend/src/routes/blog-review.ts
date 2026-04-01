import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const REVIEW_MODEL = "llama-3.1-8b-instant";
const EDIT_MODEL   = "llama-3.3-70b-versatile"; // better quality for rewrites

let _groq: Groq | null = null;
function getGroqClient(): Groq {
  if (!_groq) {
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured");
    _groq = new Groq({ apiKey });
  }
  return _groq;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CheckResult {
  passed: boolean;
  issues: string[];
}

export interface ReviewResult {
  hallucination_check:  CheckResult;
  reference_check:      CheckResult;
  human_tone_check:     CheckResult;
  content_check:        CheckResult;
  overall_score:        number;
}

// ---------------------------------------------------------------------------
// POST /api/blog/review
// 4-step structured audit with JSON mode
// ---------------------------------------------------------------------------

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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { content } = req.body as { content: string };
    const truncated = content.slice(0, 12_000);

    console.log("\n" + "=".repeat(60));
    console.log(`🔍 [Blog Review] Auditing draft (${content.length.toLocaleString()} chars)...`);
    console.log("=".repeat(60));

    const systemPrompt = `You are a ruthless, highly critical technical blog editor. Review the provided blog draft against a strict 4-point checklist.

CHECKLIST:
1. hallucination_check — Find any fake stats, wrong dates, made-up product names, or unverifiable claims. Be specific.
2. reference_check — Every H2 section MUST end with a reference line formatted exactly as: *Reference: [Title](URL)*. Flag every section that is missing this or has a malformed reference.
3. human_tone_check — Detect AI-sounding patterns: excessive lists, generic phrasing like "In conclusion", "It's worth noting", "Delve into", "In today's world", robotic transitions, or lack of personality.
4. content_check — Evaluate overall structure, flow, heading hierarchy, and whether the intro and conclusion are present and effective.

You MUST respond with ONLY a valid JSON object — absolutely no text, prose, or markdown outside the JSON.

Output this exact structure:
{
  "hallucination_check": { "passed": boolean, "issues": ["specific issue 1", "specific issue 2"] },
  "reference_check":     { "passed": boolean, "issues": ["specific issue 1"] },
  "human_tone_check":    { "passed": boolean, "issues": ["specific issue 1"] },
  "content_check":       { "passed": boolean, "issues": ["specific issue 1"] },
  "overall_score":       number
}

Rules:
- "passed" is true only if there are ZERO issues for that check.
- "issues" must be a list of strings. Use an empty array [] if there are no issues.
- "overall_score" is an integer 1-100. Penalise heavily for failed checks.`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: REVIEW_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: `Review this blog draft:\n\n${truncated}` },
        ],
        temperature: 0.1,
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const rawJson = completion.choices?.[0]?.message?.content || "{}";
      console.log(`✅ [Blog Review] Complete in ${duration}s`);

      let parsed: ReviewResult;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        console.error("❌ [Blog Review] JSON parse failed:", rawJson.slice(0, 200));
        return res.status(502).json({ error: "AI returned unparseable response. Please try again." });
      }

      // Defensive normalisation
      const safe: ReviewResult = {
        hallucination_check: normaliseCheck(parsed?.hallucination_check),
        reference_check:     normaliseCheck(parsed?.reference_check),
        human_tone_check:    normaliseCheck(parsed?.human_tone_check),
        content_check:       normaliseCheck(parsed?.content_check),
        overall_score:       typeof parsed?.overall_score === "number"
          ? Math.min(100, Math.max(1, Math.round(parsed.overall_score)))
          : 50,
      };

      const totalPassed = [
        safe.hallucination_check,
        safe.reference_check,
        safe.human_tone_check,
        safe.content_check,
      ].filter(c => c.passed).length;

      console.log(`📊 [Blog Review] Score: ${safe.overall_score}/100 | Checks passed: ${totalPassed}/4`);
      return res.status(200).json(safe);

    } catch (err: any) {
      console.error(`❌ [Blog Review] Error: ${err.message}`);
      const isTimeout = err.message?.includes("timeout") || err.code === "ECONNABORTED";
      return res.status(isTimeout ? 504 : 500).json({
        error: isTimeout
          ? "Review timed out. Try shortening the content."
          : "Failed to review blog. Please try again.",
      });
    }
  }
);

// ---------------------------------------------------------------------------
// POST /api/blog/edit-snippet
// Inline AI text rewrite based on a natural language instruction
// ---------------------------------------------------------------------------

router.post(
  "/edit-snippet",
  authenticateToken,
  requireRole("admin", "editor"),
  [
    body("original_text")
      .notEmpty().withMessage("original_text is required")
      .isString()
      .isLength({ max: 5_000 }).withMessage("original_text too long (max 5000 chars)"),
    body("instruction")
      .notEmpty().withMessage("instruction is required")
      .isString()
      .isLength({ max: 500 }).withMessage("instruction too long (max 500 chars)"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { original_text, instruction } = req.body as {
      original_text: string;
      instruction: string;
    };

    console.log(`✏️  [Edit Snippet] instruction="${instruction.slice(0, 80)}" | ${original_text.length} chars`);

    const systemPrompt = `You are a precise technical editor. Your task is to rewrite the provided text according to the user's instruction. 
CRITICAL RULES:
- Output ONLY the rewritten text. 
- DO NOT include any conversational filler, greetings, or explanations. 
- Preserve any existing Markdown formatting (bolding, code blocks, links) unless the instruction explicitly asks you to change it.`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: EDIT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Instruction: ${instruction}\n\nOriginal Text: ${original_text}`,
          },
        ],
        temperature: 0.4,
        max_tokens: 1024,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const rewritten = completion.choices?.[0]?.message?.content?.trim() || "";

      console.log(`✅ [Edit Snippet] Done in ${duration}s | ${rewritten.length} chars returned`);
      return res.status(200).json({ rewritten_text: rewritten });

    } catch (err: any) {
      console.error(`❌ [Edit Snippet] Error: ${err.message}`);
      return res.status(500).json({ error: "Failed to rewrite text. Please try again." });
    }
  }
);

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function normaliseCheck(raw: any): CheckResult {
  return {
    passed: typeof raw?.passed === "boolean" ? raw.passed : true,
    issues: Array.isArray(raw?.issues) ? raw.issues.filter((i: any) => typeof i === "string") : [],
  };
}

export default router;
