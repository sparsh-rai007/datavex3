import express, { Response } from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireRole, AuthRequest } from "../middleware/auth";
import Groq from "groq-sdk";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const JINA_API_KEY = process.env.JINA_API_KEY || "";
const JINA_READER_PREFIX = "https://r.jina.ai/";
const JINA_FETCH_TIMEOUT_MS = Number(process.env.JINA_FETCH_TIMEOUT_MS || 30000);

const REVIEW_MODEL = "llama-3.1-8b-instant";
const EDIT_MODEL = "llama-3.3-70b-versatile"; // better quality for rewrites

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

      // Defensive normalisation
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
// Inline AI text rewrite — now with URL scraping support
// ---------------------------------------------------------------------------

const URL_REGEX_NL = /https?:\/\/[^\s,;)}\]]+/gi;

async function scrapeUrlNl(url: string): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "text/markdown",
    "X-Return-Format": "markdown",
  };
  if (JINA_API_KEY) {
    headers.Authorization = `Bearer ${JINA_API_KEY}`;
  }
  try {
    console.log(`🌐 [Edit Snippet] Scraping URL: ${url}`);
    const response = await axios.get(`${JINA_READER_PREFIX}${url}`, {
      headers,
      timeout: JINA_FETCH_TIMEOUT_MS,
    });
    const content = typeof response.data === "string" ? response.data : String(response.data);
    console.log(`✅ [Edit Snippet] Scraped ${content.length} chars from ${url}`);
    return content;
  } catch (err: any) {
    console.warn(`⚠️  [Edit Snippet] Failed to scrape ${url}: ${err.message}`);
    return "";
  }
}

router.post(
  "/edit-snippet",
  authenticateToken,
  requireRole("admin", "editor"),
  [
    body("original_text")
      .optional({ values: "falsy" })
      .isString()
      .isLength({ max: 5_000 }).withMessage("original_text too long (max 5000 chars)"),
    body("instruction")
      .notEmpty().withMessage("instruction is required")
      .isString()
      .isLength({ max: 1000 }).withMessage("instruction too long (max 1000 chars)"),
    body("full_content")
      .optional({ values: "falsy" })
      .isString()
      .isLength({ max: 50_000 }).withMessage("full_content too long"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { original_text, instruction, full_content } = req.body as {
      original_text?: string;
      instruction: string;
      full_content?: string;
    };

    const hasOriginal = !!original_text && original_text.trim().length > 0;
    const isGenerateMode = !hasOriginal;

    const blogContext = full_content && full_content.trim().length > 50
      ? full_content.slice(0, 8000)
      : "";
    const hasBlogContext = blogContext.length > 0;

    const detectedUrls = instruction.match(URL_REGEX_NL) || [];
    const cleanInstruction = instruction.replace(URL_REGEX_NL, "").trim();
    const hasUrls = detectedUrls.length > 0;

    console.log(`✏️  [Edit Snippet] mode=${isGenerateMode ? "GENERATE" : "REWRITE"} | instruction="${instruction.slice(0, 80)}" | ${(original_text || "").length} chars | URLs: ${detectedUrls.length} | blogContext: ${blogContext.length} chars`);

    let scrapedContext = "";
    if (hasUrls) {
      const uniqueUrls = [...new Set(detectedUrls.map(u => u.trim()))];
      const scrapeResults = await Promise.all(uniqueUrls.map(scrapeUrlNl));
      const sections = scrapeResults
        .map((content, i) => {
          if (!content || content.trim().length < 30) return null;
          return `--- Scraped from: ${uniqueUrls[i]} ---\n${content.slice(0, 4000)}`;
        })
        .filter(Boolean);
      if (sections.length > 0) {
        scrapedContext = sections.join("\n\n");
      }
    }

    const dedupeBlock = hasBlogContext
      ? `\n\nEXISTING BLOG CONTENT (for context — DO NOT repeat any of this):\n---\n${blogContext}\n---`
      : "";

    let systemPrompt: string;
    let userMessage: string;

    if (isGenerateMode) {
      if (hasUrls && scrapedContext) {
        if (cleanInstruction) {
          systemPrompt = `You are a precise inline editor working inside an existing blog post. The user wants to INSERT a small piece of content at the cursor position.

STRICT RULES:
- Do EXACTLY what the user's instruction says — nothing more, nothing less.
- Use the SCRAPED REFERENCE below as source material to fulfill the instruction.
- Output ONLY the raw text/markdown to insert. No greetings, no explanations, no meta-commentary.
- Keep it SHORT and focused: 1-3 paragraphs max unless the user explicitly asks for more.
- Do NOT generate a full article, blog post, or multi-section document.
- Do NOT add titles, introductions, or conclusions unless specifically asked.
- Do NOT repeat anything from the existing blog content.

SCRAPED REFERENCE:
${scrapedContext}${dedupeBlock}`;
          userMessage = cleanInstruction;
        } else {
          systemPrompt = `You are a precise inline editor working inside an existing blog post. The user has pasted a URL. Your job is to extract the single most relevant and interesting section from the scraped page and produce a focused, concise snippet to insert at the cursor.

STRICT RULES:
- Pick the MOST relevant section from the scraped page — don't summarize the entire page.
- Output 1-3 short paragraphs max. Be concise.
- Output ONLY the raw text/markdown to insert. No greetings, explanations, or meta-commentary.
- Do NOT generate a full article, blog post, or multi-section document.
- Do NOT add titles like "# Summary" or introductions like "Here's what we found".
- Do NOT repeat anything from the existing blog content.

SCRAPED REFERENCE:
${scrapedContext}${dedupeBlock}`;
          userMessage = `Extract the most relevant and useful content from the scraped reference above. Output a focused 1-3 paragraph snippet.`;
        }
      } else {
        systemPrompt = `You are a precise inline editor working inside an existing blog post. The user wants to INSERT content at the cursor position.

STRICT RULES:
- Do EXACTLY what the user says — nothing more, nothing less.
- Output ONLY the raw text/markdown to insert. No greetings, no explanations.
- Keep it SHORT: 1-3 paragraphs unless the user explicitly asks for a longer section.
- Do NOT generate a full article or multi-section document.
- Do NOT add titles, introductions, or conclusions unless specifically asked.
- Do NOT repeat anything from the existing blog content.${dedupeBlock}`;
        userMessage = instruction;
      }
    } else {
      if (hasUrls && scrapedContext) {
        if (cleanInstruction) {
          systemPrompt = `You are a precise inline editor. The user has selected text and wants it modified.

STRICT RULES:
- Do EXACTLY what the user's instruction says to the selected text.
- Use the SCRAPED REFERENCE below as source material if relevant to the instruction.
- Output ONLY the replacement text. No greetings, no explanations.
- Keep the output roughly the SAME LENGTH as the original unless the instruction says otherwise.
- Do NOT expand into a full article or add sections not asked for.
- Preserve existing Markdown formatting unless told otherwise.

SCRAPED REFERENCE:
${scrapedContext}${dedupeBlock}`;
          userMessage = `Instruction: ${cleanInstruction}\n\nSelected text to modify:\n${original_text}`;
        } else {
          systemPrompt = `You are a precise inline editor. The user has selected text and pasted a URL. Update the selected text by incorporating the most relevant information from the scraped page.

STRICT RULES:
- Update the selected text with relevant facts/data from the scraped reference.
- Keep the output roughly the SAME LENGTH as the original. Do not expand it into a full article.
- Output ONLY the replacement text. No greetings, no explanations.
- Preserve existing Markdown formatting and tone.
- Do NOT add new sections, titles, or conclusions.

SCRAPED REFERENCE:
${scrapedContext}${dedupeBlock}`;
          userMessage = `Selected text to update:\n${original_text}`;
        }
      } else {
        systemPrompt = `You are a precise inline editor. The user has selected text and wants it modified.

STRICT RULES:
- Do EXACTLY what the user's instruction says — nothing more, nothing less.
- Output ONLY the replacement text. No greetings, no explanations, no meta-commentary.
- Keep the output roughly the SAME LENGTH as the original unless the instruction says otherwise.
- Do NOT expand into a full article or add sections.
- Preserve existing Markdown formatting unless told otherwise.${dedupeBlock}`;
        userMessage = `Instruction: ${instruction}\n\nSelected text to modify:\n${original_text}`;
      }
    }

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: EDIT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.4,
        max_tokens: 2048,
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      const rewritten = completion.choices?.[0]?.message?.content?.trim() || "";

      console.log(`✅ [Edit Snippet] Done in ${duration}s | ${rewritten.length} chars returned${hasUrls ? " (URL-enhanced)" : ""}`);
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

const REPURPOSE_MODEL = "llama-3.3-70b-versatile";
const LINKEDIN_LIMIT = 3000;
const MEDIUM_LIMIT = 7000;
const X_LIMIT = 280;

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
    body("blog_url")
      .optional()
      .isString()
      .isLength({ max: 2000 }).withMessage("blog_url is too long"),
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, blog_url } = req.body as { title: string; content: string; blog_url?: string };
    const truncated = content.slice(0, 10_000);
    const blogUrl = typeof blog_url === "string" ? blog_url.trim() : "";

    console.log("\n" + "=".repeat(60));
    console.log(`📤 [Blog Repurpose] Generating social posts for "${title.slice(0, 50)}..."`);
    console.log("=".repeat(60));

    const systemPrompt = `You are an expert social media manager for a technical brand. The user will provide a technical blog post. You must repurpose this content for distribution.

CRITICAL INSTRUCTIONS:
1. **LinkedIn Post:** Write a highly engaging, punchy LinkedIn post summarizing the blog. Use a strong hook in the first line, 2-3 short bullet points covering key takeaways, a call-to-action to read the full blog, and 3-5 relevant hashtags. Keep it within ${LINKEDIN_LIMIT} characters.
2. **Medium Post:** Write a polished Medium/Dev.to style post excerpt or intro summary based on the blog. Keep it within ${MEDIUM_LIMIT} characters.
3. **X Post:** Write a concise, high-impact X post. Keep it within ${X_LIMIT} characters.
4. **Medium/Dev.to Metadata:** Extract a highly clickable SEO title (different from original if the original is weak), a compelling 1-sentence subtitle, and an array of exactly 5 relevant technical tags.
5. If a blog URL is provided, append it at the end of linkedin_post, medium_post, and x_post.

You MUST output your response strictly in the following JSON format:
{
  "linkedin_post": "The full text of the LinkedIn post with line breaks and emojis",
  "medium_post": "Repurposed Medium/Dev.to post body",
  "x_post": "Repurposed X post",
  "medium_title": "SEO optimized title",
  "medium_subtitle": "1-sentence compelling subtitle",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
}`;

    try {
      const groq = getGroqClient();
      const startTime = Date.now();

      const completion = await groq.chat.completions.create({
        model: REPURPOSE_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Title: ${title}\nBlog URL: ${blogUrl || "N/A"}\n\nBlog Content:\n${truncated}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
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
        linkedin_post:   appendLinkWithinLimit(typeof parsed?.linkedin_post === "string" ? parsed.linkedin_post : "", blogUrl, LINKEDIN_LIMIT),
        medium_post:     appendLinkWithinLimit(typeof parsed?.medium_post === "string" ? parsed.medium_post : truncated, blogUrl, MEDIUM_LIMIT),
        x_post:          appendLinkWithinLimit(typeof parsed?.x_post === "string" ? parsed.x_post : "", blogUrl, X_LIMIT),
        medium_title:    typeof parsed?.medium_title === "string" ? parsed.medium_title : title,
        medium_subtitle: typeof parsed?.medium_subtitle === "string" ? parsed.medium_subtitle : "",
        tags:            Array.isArray(parsed?.tags) ? parsed.tags.filter((t: any) => typeof t === "string").slice(0, 5) : [],
      };

      console.log(`📊 [Blog Repurpose] LinkedIn: ${safe.linkedin_post.length}/${LINKEDIN_LIMIT} | Medium: ${safe.medium_post.length}/${MEDIUM_LIMIT} | X: ${safe.x_post.length}/${X_LIMIT} | Tags: ${safe.tags.join(", ")}`);
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

function appendLinkWithinLimit(text: string, blogUrl: string, limit: number): string {
  const normalized = (text || "").trim();
  if (!blogUrl) return trimToLimit(normalized, limit);

  const url = blogUrl.trim();
  const withoutUrl = normalized.replace(new RegExp(escapeRegExp(url), "g"), "").trim();
  const suffix = `\n\n${url}`;
  const maxBodyLength = limit - suffix.length;

  if (maxBodyLength <= 0) return trimToLimit(url, limit);

  const trimmedBody = trimToLimit(withoutUrl, maxBodyLength);
  return `${trimmedBody}${suffix}`;
}

function trimToLimit(text: string, limit: number): string {
  if (!text) return "";
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd();
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default router;


