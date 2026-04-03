import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const REVIEW_MODEL = "llama-3.1-8b-instant";
const EDIT_MODEL = "llama-3.3-70b-versatile"; // better quality for rewrites
const REPURPOSE_MODEL = "llama-3.3-70b-versatile";

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
  structure_check:      CheckResult;
  tone_check:           CheckResult;
  hallucination_check:  CheckResult;
  reference_check:      CheckResult;
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

    const systemPrompt = `You are a highly critical technical blog editor. Review the provided markdown blog draft. You must evaluate the text on four strict criteria:

1. **Structure (structure_check):** Look for broken Markdown. Are there unclosed code blocks? Are headings mashed together with paragraphs? Are image tags malformed?
2. **AI Tone (tone_check):** Does this read like a robot wrote it? Flag robotic filler phrases like 'In conclusion', 'Delve into', 'It is important to note', or overly generic corporate speak.
3. **Hallucinations (hallucination_check):** Flag any technically inaccurate statements, fake statistics, or logic flaws.
4. **References (reference_check):** Ensure that EVERY main section ends with a blockquote reference formatted exactly like this: \`> Source: [Title](URL)\`. 

You MUST output your review strictly in the following JSON format. If a check passes, leave the issues array empty.
{
  "structure_check": { "passed": boolean, "issues": ["list of specific formatting errors"] },
  "tone_check": { "passed": boolean, "issues": ["list of robotic phrases found"] },
  "hallucination_check": { "passed": boolean, "issues": ["list of factual red flags"] },
  "reference_check": { "passed": boolean, "issues": ["list of sections missing the blockquote reference"] },
  "overall_score": <number 1-100>
}`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: REVIEW_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Review this blog draft:\n\n${truncated}` },
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

      const safe: ReviewResult = {
        structure_check:     normaliseCheck(parsed?.structure_check),
        tone_check:          normaliseCheck(parsed?.tone_check),
        hallucination_check: normaliseCheck(parsed?.hallucination_check),
        reference_check:     normaliseCheck(parsed?.reference_check),
        overall_score:       typeof parsed?.overall_score === "number"
          ? Math.min(100, Math.max(1, Math.round(parsed.overall_score)))
          : 50,
      };

      const totalPassed = [
        safe.structure_check,
        safe.tone_check,
        safe.hallucination_check,
        safe.reference_check,
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
// POST /api/blog/repurpose
// Generate social media versions of blog content using Groq JSON mode
// ---------------------------------------------------------------------------

router.post(
  "/repurpose",
  authenticateToken,
  requireRole("admin", "editor"),
  [
    body("title")
      .notEmpty().withMessage("title is required")
      .isString(),
    body("content")
      .notEmpty().withMessage("content is required")
      .isString()
      .isLength({ min: 50 }).withMessage("content is too short to repurpose"),
    body("url")
      .notEmpty().withMessage("The specific blog URL is required for repurposing")
      .isURL().withMessage("Must be a valid URL"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, url } = req.body as { title: string; content: string; url: string };
    const truncated = content.slice(0, 10_000);

    console.log("\n" + "=".repeat(60));
    console.log(`📤 [Blog Repurpose] Generating social posts for "${title.slice(0, 50)}..."`);
    console.log("=".repeat(60));

    const systemPrompt = `You are an expert social media manager for a technical brand. You must repurpose the provided blog post into three highly optimized formats. 

CRITICAL UNIVERSAL RULE: Output PURE PLAIN TEXT ONLY. You are strictly forbidden from using Markdown formatting syntax (no asterisks '**', no hash symbols for headers '##', no underscores '_', no backticks '\`'). 

CRITICAL URL RULE: You MUST include the exact Target URL (${url}) at the very end of the linkedin_post, the medium_body, and the x_post. This is an absolute requirement.

CRITICAL INSTRUCTIONS:
1. **LinkedIn:** Write a deeply insightful, long-form LinkedIn post. 
   - LENGTH: It MUST be around 3000 characters (approx 500-550 words). Do not write a short summary. Go into detail.
   - FORMATTING: Use plain text only. Use line breaks to separate thoughts.
   - LINK: End the post with a compelling call-to-action and the exact URL: ${url}
2. **Medium/Dev.to:** Re-write a massive, comprehensive version of the article for Medium.
   - LENGTH: The 'medium_body' MUST be incredibly detailed, aiming for around 7000 characters (approx 1200+ words). 
   - FORMATTING: PURE PLAIN TEXT. To create sub-sections or headers, simply write the section title in ALL CAPS on its own line (e.g., THE CHALLENGE) with double line breaks before and after. 
   - LINK: At the very end of the text, append exactly: "Read the original post here: ${url}"
3. **X (Twitter):** Write a punchy, viral-style X post. 
   - LENGTH: You MUST maximize the character limit, hitting exactly around 270-280 characters total. 
   - FORMATTING: You are allowed to use exactly 2 hashtags at the end. These are the ONLY '#' symbols allowed in your entire response.
   - LINK: The last thing in the post MUST be the exact URL: ${url}

You MUST output your response strictly in the following JSON format:
{
  "linkedin_post": "The full ~3000 character plain text of the LinkedIn post including the URL at the end",
  "medium_title": "SEO optimized title (no markdown)",
  "medium_subtitle": "1-sentence compelling subtitle (no markdown)",
  "medium_body": "The reimagined ~7000 character body in PLAIN TEXT. Section headers in ALL CAPS. URL at the end.",
  "x_post": "The ~280 character X post including the URL at the end",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: REPURPOSE_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Target URL: ${url}\n\nTitle: ${title}\n\nBlog Content:\n${truncated}` },
        ],
        temperature: 0.7,
        max_tokens: 8000, 
        response_format: { type: "json_object" },
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const rawJson = completion.choices?.[0]?.message?.content || "{}";
      console.log(`✅ [Blog Repurpose] Complete in ${duration}s`);

      let parsed: any;
      try {
        parsed = JSON.parse(rawJson);
      } catch {
        console.error("❌ [Blog Repurpose] JSON parse failed:", rawJson.slice(0, 200));
        return res.status(502).json({ error: "AI returned unparseable response. Please try again." });
      }

      // Defensive normalisation
      const safe = {
        linkedin_post:   typeof parsed?.linkedin_post === "string" ? parsed.linkedin_post : "",
        medium_title:    typeof parsed?.medium_title === "string" ? parsed.medium_title : title,
        medium_subtitle: typeof parsed?.medium_subtitle === "string" ? parsed.medium_subtitle : "",
        medium_body:     typeof parsed?.medium_body === "string" ? parsed.medium_body : "",
        x_post:          typeof parsed?.x_post === "string" ? parsed.x_post : "",
        tags:            Array.isArray(parsed?.tags) ? parsed.tags.filter((t: any) => typeof t === "string").slice(0, 5) : [],
      };

      console.log(`📊 [Blog Repurpose] LinkedIn: ${safe.linkedin_post.length} chars | Medium: ${safe.medium_body.length} chars | X: ${safe.x_post.length} chars`);
      return res.status(200).json(safe);

    } catch (err: any) {
      console.error(`❌ [Blog Repurpose] Error: ${err.message}`);
      const isTimeout = err.message?.includes("timeout") || err.code === "ECONNABORTED";
      return res.status(isTimeout ? 504 : 500).json({
        error: isTimeout
          ? "Repurpose timed out. Try shortening the content."
          : "Failed to generate social posts. Please try again.",
      });
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