// OpenDP feedback + "Report a problem" for the public website.
// Set FEEDBACK_WEBHOOK_URL to a Discord channel webhook (Server settings → Integrations → Webhooks)
// and every report arrives in that channel.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const url = process.env.FEEDBACK_WEBHOOK_URL;
  if (!url) return res.status(503).json({ error: "feedback not configured" });
  const b = req.body || {};
  const lines = b.kind === "report"
    ? [`🚩 **Problem report** — ${b.subject || ""} \`${b.qid || ""}\``, String(b.text || "").slice(0, 1500)]
    : ["⭐ **Beta feedback**", "Ratings: " + Object.entries(b.ratings || {}).map(([k, v]) => `${k} ${v}/5`).join(", "), "Best: " + String(b.good || "—").slice(0, 600), "Broken/confusing: " + String(b.bad || "—").slice(0, 800), "Add: " + String(b.add || "—").slice(0, 600)];
  lines.push(`_page ${String(b.page || "").slice(0, 120)} · ${b.at || ""}_`);
  try {
    const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ content: lines.join("\n").slice(0, 1900) }) });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch { return res.status(502).json({ ok: false }); }
};
