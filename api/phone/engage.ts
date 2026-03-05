import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: "Twilio credentials not configured" });
  }

  const { phone } = req.body as { phone?: string };

  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "phone is required" });
  }

  // Basic E.164 validation
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number. Use E.164 format (e.g., +12025551234)" });
  }

  try {
    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: "This is Pegasus, IronWatch's AI Operations Manager. You've been connected to tonight's operations demo. Reply to this message and I'll respond with real-time operational intelligence.",
      from: fromNumber,
      to: phone,
    });

    return res.status(200).json({
      sid: message.sid,
      status: message.status,
      phone,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: errorMessage });
  }
}
