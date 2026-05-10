export async function embedText(
  text: string,
  _taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY",
): Promise<number[]> {
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error(
      "Missing OPENAI_API_KEY. Set it in .env.local (server-side only).",
    );

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ model: "text-embedding-3-small", input: text }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[OpenAI Error] ${res.status} ${body}`);
  }

  const data = await res.json();
  const vector = data?.data?.[0]?.embedding;
  if (!vector || !Array.isArray(vector)) {
    throw new Error("Embedding response missing vector values from OpenAI.");
  }
  return vector;
}

export async function generateAnswer(
  systemPrompt: string,
  question: string,
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key)
    throw new Error(
      "Missing OPENAI_API_KEY. Set it in .env.local (server-side only).",
    );

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: question },
  ];

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`[OpenAI Error] ${res.status} ${body}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Invalid generation response from OpenAI.");
  }
  return String(text).trim();
}
