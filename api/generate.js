export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, system, max_tokens } = req.body;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: max_tokens || 1000,
        system,
        messages,
      }),
    });

    const data = await response.json();
    // Pass Anthropic's status through so the app can tell a failure from an empty answer
    res.status(response.ok ? 200 : response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
