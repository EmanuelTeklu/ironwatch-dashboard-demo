import type { VercelRequest, VercelResponse } from "@vercel/node";

// In-memory store for demo (resets on cold start -- fine for demo)
const replies: Array<{
  from: string;
  body: string;
  timestamp: string;
}> = [];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === "POST") {
    // Twilio sends form-encoded or JSON data
    const from = req.body.From || req.body.from;
    const body = req.body.Body || req.body.body;

    if (from && body) {
      replies.push({
        from,
        body,
        timestamp: new Date().toISOString(),
      });
    }

    // Respond with empty TwiML (no auto-reply)
    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send("<Response></Response>");
  }

  if (req.method === "GET") {
    // Dashboard polls this to check for replies
    const since = req.query.since as string | undefined;
    const filtered = since
      ? replies.filter((r) => r.timestamp > since)
      : replies;
    return res.status(200).json({ replies: filtered });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
