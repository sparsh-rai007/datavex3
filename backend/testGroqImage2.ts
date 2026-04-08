import Groq from "groq-sdk";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompt = `You are an expert tech blog writer. Write a structured, polished tech blog post based on the provided scraped Markdown content.

Rules you MUST follow:
1. Output clean Markdown only.
2. Start with a compelling H1 title (# Title) on the very first line.
3. Use clear H2 (##) and H3 (###) headings to organize sections.
4. Keep ALL code blocks exactly as they appear — do not modify or paraphrase code.
5. CRITICAL IMAGE RULE: The source text contains markdown images \`![alt](url)\`. You must evaluate every image. ONLY keep images that are highly relevant to the technical topic (e.g., architecture diagrams, code screenshots, charts, or UI previews). You MUST delete any images that look like logos, author portraits, social media icons, or generic decorative stock photos. Place the retained images near the paragraphs they illustrate.
6. Write in a clear, engaging, authoritative tone for a technical audience.`;

const userPrompt = `Transform the following scraped content into a complete, polished tech blog post.

Scraped Content:
# Understanding Cloud Storage
Cloud storage is amazing. Here is an architecture diagram that explains it perfectly:

![Architecture diagram showing AWS S3 buckets connecting to EC2 instances](https://example.com/aws-diagram.png)

Now let's talk about pricing. It can be expensive.
![Profile picture of the author John Doe](https://example.com/author.jpg)

Also follow us on Twitter!
![Twitter Logo](https://example.com/twitter.png)`;

async function run() {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: "llama-3.3-70b-versatile",
  });
  
  fs.writeFileSync("out.json", JSON.stringify({ output: completion.choices[0]?.message?.content }, null, 2));
}

run().catch(console.error);
