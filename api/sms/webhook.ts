import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

// In-memory store for demo (resets on cold start)
const replies: Array<{
  from: string;
  body: string;
  timestamp: string;
  direction: "inbound" | "outbound";
}> = [];

// Track engaged phone numbers
const engagedPhones = new Set<string>();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method === "POST") {
    const from = req.body.From || req.body.from;
    const body = req.body.Body || req.body.body;

    if (from && body) {
      replies.push({
        from,
        body,
        timestamp: new Date().toISOString(),
        direction: "inbound",
      });

      // Auto-reply via Claude if phone is engaged
      if (engagedPhones.has(from) && process.env.ANTHROPIC_API_KEY) {
        try {
          const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

          // Build conversation history from this phone
          const phoneHistory = replies
            .filter((r) => r.from === from || r.direction === "outbound")
            .map((r) => ({
              role: (r.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
              content: r.body,
            }));

          const response = await client.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 256,
            system: "You are Pegasus, IronWatch's AI Operations Manager. You're texting with someone who has connected to tonight's operations demo. Be brief (SMS-length responses, under 160 chars when possible). Be professional but friendly. Share operational insights about the 24-site Dittmar contract in Arlington, VA.",
            messages: phoneHistory,
          });

          const aiReply = response.content[0].type === "text" ? response.content[0].text : "";

          if (aiReply) {
            replies.push({
              from,
              body: aiReply,
              timestamp: new Date().toISOString(),
              direction: "outbound",
            });

            // Send SMS reply via Twilio if configured
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const fromNumber = process.env.TWILIO_PHONE_NUMBER;

            if (accountSid && authToken && fromNumber) {
              const twilio = await import("twilio");
              const client = twilio.default(accountSid, authToken);
              await client.messages.create({
                body: aiReply,
                from: fromNumber,
                to: from,
              });
            }
          }
        } catch {
          // Auto-reply failure is non-fatal
        }
      }
    }

    res.setHeader("Content-Type", "text/xml");
    return res.status(200).send("<Response></Response>");
  }

  if (req.method === "GET") {
    const since = req.query.since as string | undefined;
    const phone = req.query.phone as string | undefined;

    let filtered = since
      ? replies.filter((r) => r.timestamp > since)
      : replies;

    if (phone) {
      filtered = filtered.filter((r) => r.from === phone || r.direction === "outbound");
    }

    return res.status(200).json({ replies: filtered });
  }

  if (req.method === "PUT") {
    // Register a phone as engaged
    const { phone } = req.body as { phone?: string };
    if (phone) {
      engagedPhones.add(phone);
    }
    return res.status(200).json({ engaged: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
