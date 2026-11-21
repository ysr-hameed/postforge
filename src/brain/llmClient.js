export function llmConfig() {
  const key = process.env.POSTFORGE_LLM_KEY || "";
  const base = (process.env.POSTFORGE_LLM_BASE_URL || "").replace(/\/+$/, "");
  const model = process.env.POSTFORGE_LLM_MODEL || "";
  return { enabled: Boolean(key && base && model), key, base, model };
}

// Accepts plain JSON or an SSE stream ("data: {...}" lines), so it works either way.
function extractText(raw) {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    const j = JSON.parse(trimmed);
    return j.choices?.[0]?.message?.content ?? j.choices?.[0]?.text ?? "";
  }
  let out = "";
  for (const line of raw.split("\n")) {
    const l = line.trim();
    if (!l.startsWith("data:")) continue;
    const payload = l.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const j = JSON.parse(payload);
      out += j.choices?.[0]?.delta?.content ?? j.choices?.[0]?.message?.content ?? "";
    } catch { /* skip malformed chunk */ }
  }
  return out;
}

export async function writeBodyLLM({ system, user }) {
  const { base, key, model } = llmConfig();
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.8,
      max_tokens: 1200,
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`LLM ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const text = extractText(await res.text());
  return text.replace(/^\s*```(?:html)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
}
