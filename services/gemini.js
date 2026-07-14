const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

/**
 * Calls the Gemini generateContent REST endpoint.
 * @param {string} prompt - the fully-built prompt to send
 * @param {object} [opts]
 * @param {boolean} [opts.json] - if true, asks Gemini to return raw JSON and parses it
 * @returns {Promise<string|object>}
 */
async function callGemini(prompt, opts = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    const err = new Error(
      "Missing GEMINI_API_KEY. Add it to your .env file (see .env.example)."
    );
    err.status = 500;
    throw err;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      ...(opts.json ? { responseMimeType: "application/json" } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `Gemini API error (${res.status}): ${text || res.statusText}`
    );
    err.status = res.status === 401 || res.status === 403 ? 401 : 502;
    throw err;
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ?? "";

  if (!text) {
    const err = new Error("Gemini returned an empty response.");
    err.status = 502;
    throw err;
  }

  if (opts.json) {
    const cleaned = text.replace(/^```json\s*|```\s*$/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      const err = new Error("Gemini returned invalid JSON.");
      err.status = 502;
      throw err;
    }
  }

  return text.trim();
}

module.exports = { callGemini };
