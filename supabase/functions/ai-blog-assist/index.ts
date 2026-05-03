import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Action = "generate" | "enhance" | "summarize" | "suggest-tags" | "suggest-slug" | "write-bio" | "enhance-bio" | "write-newsletter";

interface RequestBody {
  action: Action;
  title?: string;
  tags?: string;
  content?: string;
}

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile"; // Best free model on Groq

const systemContext = `You are a technical writing assistant for a cybersecurity and fullstack development blog.
The blog belongs to a developer/security researcher. Posts are written in Markdown.
Write in a clear, technical, and direct style. Avoid fluff and marketing language.
Use proper Markdown: headings (##, ###), code fences (\`\`\`), inline code, bullet lists where appropriate.`;

function buildPrompt(body: RequestBody): string {
  switch (body.action) {
    case "generate":
      return `${systemContext}

Write a complete, well-structured blog post in Markdown for the following:
Title: ${body.title || "Untitled"}
Tags: ${body.tags || "none"}

Requirements:
- Start with a brief intro paragraph (no heading needed)
- Use ## for main sections, ### for subsections
- Include relevant code examples in fenced code blocks where appropriate
- End with a short conclusion or takeaway
- Do NOT include the title as a heading at the top (it's shown separately)
- Aim for 400-800 words`;

    case "enhance":
      return `${systemContext}

Enhance and improve the following Markdown blog post. Keep the author's voice and core ideas intact.
Improvements to make:
- Fix grammar, clarity, and flow
- Improve technical accuracy and depth where possible
- Add or improve code examples if relevant
- Ensure proper Markdown formatting (headings, code fences, lists)
- Do NOT change the overall structure drastically

Original content:
---
${body.content}
---

Return only the improved Markdown content, no explanations.`;

    case "summarize":
      return `${systemContext}

Write a concise excerpt (1-2 sentences, max 200 characters) for the following blog post.
The excerpt should hook the reader and summarize the core topic. Plain text only, no Markdown.

Title: ${body.title || ""}
Content:
---
${body.content?.slice(0, 2000) || ""}
---

Return only the excerpt text.`;

    case "suggest-tags":
      return `${systemContext}

Suggest 4-6 relevant tags for the following blog post.
Tags should be lowercase, single words or short hyphenated phrases.
Return ONLY a comma-separated list of tags, nothing else. Example: security, ctf, web-exploitation, writeup

Title: ${body.title || ""}
Content:
---
${body.content?.slice(0, 2000) || ""}
---`;

    case "suggest-slug":
      return `Generate a clean URL slug for this blog post title.
Rules:
- Lowercase only
- Hyphens instead of spaces
- No special characters
- Max 60 characters
- Descriptive and SEO-friendly
- Return ONLY the slug, nothing else

Title: ${body.title || ""}`;

    case "write-bio":
      return `Write a short professional bio (2-3 sentences, max 300 characters) for a cybersecurity and fullstack developer portfolio.
The bio should sound personal, technical, and confident — not corporate.
Context: ${body.content || "Developer and security researcher"}
Return only the bio text, no quotes or labels.`;

    case "enhance-bio":
      return `Improve the following developer bio. Keep it concise (2-3 sentences), personal, and technically credible.
Fix grammar, improve flow, make it more engaging. Return only the improved bio text.

Original bio:
${body.content || ""}`;

    case "write-newsletter":
      return `You are writing a newsletter email for a cybersecurity and fullstack developer portfolio site called "VNR610 Realm Codex".

Write a compelling newsletter email body for the following blog post. The email should:
- Open with a short punchy intro (1-2 sentences) that hooks the reader
- Summarize what the post is about in 2-3 sentences (no spoilers, build curiosity)
- Mention 1-2 key things the reader will learn or find interesting
- End with a clear call-to-action sentence like "Read the full writeup here →"
- Keep the total length to 3-4 short paragraphs
- Write in plain text (no Markdown, no HTML) — the email renderer handles formatting
- Tone: direct, technical, slightly personal — like a developer talking to other developers
- Do NOT include a subject line, greeting, or sign-off — just the body paragraphs

Blog post title: ${body.title || "Untitled"}
Blog post excerpt: ${body.content?.slice(0, 500) || "No excerpt provided"}
Tags: ${body.tags || "none"}

Return only the email body text.`;

    default:
      throw new Error(`Unknown action: ${body.action}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Require a valid Supabase JWT (must be signed in)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;

    if (!body.action) {
      return new Response(JSON.stringify({ error: "action is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(body);

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return new Response(JSON.stringify({ error: `Groq API error: ${err}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const groqData = await groqRes.json();
    const text = groqData?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ result: text.trim() }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
