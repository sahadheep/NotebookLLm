export async function embedText(
  text: string,
  _taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[]> {
  const key = process.env.GROK_API_KEY;
  if (!key)
    throw new Error(
      "Missing GROK_API_KEY. Set it in .env.local (server-side only).",
    );

  const base = process.env.GROK_BASE_URL;
  if (!base) {
    throw new Error(
      "Grok base URL not configured. Set GROK_BASE_URL in .env.local to use Grok.",
    );
  }

  const url = base.replace(/\/$/, "") + "/embeddings";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ input: text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[Grok Error] ${res.status} ${body}`);
  }

  const data = await res.json();
  const vector = data?.data?.[0]?.embedding;
  if (!vector || !Array.isArray(vector)) {
    throw new Error("Embedding response missing vector values from Grok.");
  }
  return vector;
}

export async function generateAnswer(
  systemPrompt: string,
  question: string,
): Promise<string> {
  const key = process.env.GROK_API_KEY;
  if (!key)
    throw new Error(
      "Missing GROK_API_KEY. Set it in .env.local (server-side only).",
    );

  const candidates = process.env.GROK_BASE_URL
    ? [process.env.GROK_BASE_URL]
    : [
        "https://api.grok.ai/v1",
        "https://api.grok.com/v1",
        "https://grok.com/api/v1",
      ];

  const prompt = `${systemPrompt}\n\nUser: ${question}`;
  const errors: string[] = [];

  for (const base of candidates) {
    try {
      const url = base.replace(/\/$/, "") + "/generate";
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const body = await res.text();
        errors.push(`[${base}] ${res.status} ${body}`);
        continue;
      }

      const data = await res.json();
      const text = data?.text ?? data?.output ?? data?.data?.[0]?.text;
      if (!text || typeof text !== "string") {
        errors.push(`[${base}] invalid generation shape`);
        continue;
      }
      return String(text).trim();
    } catch (err: unknown) {
      errors.push(`[${base}] fetch error: ${String(err)}`);
      continue;
    }
  }

  throw new Error(`Grok generation failed. Attempts:\n${errors.join("\n")}`);
}
