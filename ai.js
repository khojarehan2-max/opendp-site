// OpenDP AI backend for the public website (Vercel serverless function).
// Turns on only when ANTHROPIC_API_KEY is set in the Vercel project settings.
// Every call costs money on YOUR Anthropic account — set a monthly spend limit in the Anthropic Console.
const LIMIT_PER_HOUR = Number(process.env.AI_CALLS_PER_HOUR || 40); // per visitor IP, best effort
const MODELS = {
  quick: process.env.MODEL_QUICK || "claude-haiku-5-5",
  default: process.env.MODEL_DEFAULT || "claude-sonnet-5-5",
  complex: process.env.MODEL_COMPLEX || process.env.MODEL_DEFAULT || "claude-sonnet-5-5",
};
const SYSTEM = "You are the AI inside OpenDP, a free IB Diploma revision website. Only help with studying, revision, marking practice answers and giving feedback on coursework against IB-style criteria. Never write a student's assessed coursework (IA, EE, TOK) for them. Politely decline unrelated requests.";
const hits = new Map();

module.exports = async (req, res) => {
  if (req.method === "GET") return res.status(200).json({ ok: !!process.env.ANTHROPIC_API_KEY });
  if (req.method !== "POST") return res.status(405).json({ error: "method" });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(503).json({ error: "AI is not configured" });
  // only accept calls from this site's own pages
  const origin = req.headers.origin || "", host = req.headers.host || "";
  if (origin && !origin.endsWith("://" + host)) return res.status(403).json({ error: "origin" });
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  const now = Date.now(), h = (hits.get(ip) || []).filter((t) => now - t < 3600e3);
  if (h.length >= LIMIT_PER_HOUR) return res.status(429).json({ error: "rate_limited" });
  h.push(now); hits.set(ip, h);

  const { input, tier } = req.body || {};
  const raw = JSON.stringify(input || "");
  if (!input || raw.length > 200000) return res.status(413).json({ error: "too large" });
  let messages = typeof input === "string" ? [{ role: "user", content: input }]
    : (Array.isArray(input) ? input : []).filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()).map((m) => ({ role: m.role, content: m.content }));
  // merge consecutive turns with the same role, as the API needs alternating roles
  messages = messages.reduce((out, m) => { const last = out[out.length - 1]; if (last && last.role === m.role) last.content += "\n\n" + m.content; else out.push({ ...m }); return out; }, []);
  if (!messages.length || messages[0].role !== "user" || messages[messages.length - 1].role !== "user") return res.status(400).json({ error: "bad input" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: MODELS[tier] || MODELS.default, max_tokens: 4096, system: SYSTEM, messages }),
    });
    if (r.status === 429) return res.status(429).json({ error: "rate_limited" });
    if (!r.ok) return res.status(502).json({ error: "upstream", status: r.status });
    const j = await r.json();
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text).join("");
    return res.status(200).json({ text, truncated: j.stop_reason === "max_tokens" });
  } catch (e) {
    return res.status(502).json({ error: "upstream" });
  }
};
