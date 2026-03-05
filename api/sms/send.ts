import type { VercelRequest, VercelResponse } from "@vercel/node";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, body } = req.body;

  if (!to || !body) {
    return res.status(400).json({ error: "to and body required" });
  }

  try {
    const message = await client.messages.create({
      to,
      from: FROM_NUMBER,
      body,
    });
    return res.status(200).json({
      sid: message.sid,
      status: message.status,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "SMS send failed";
    return res.status(500).json({ error: msg });
  }
}
