import Anthropic from "@anthropic-ai/sdk";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are Pegasus, IronWatch Security's AI Security Operations Manager. You monitor 24 security sites under the Dittmar contract in Arlington, VA.

Your personality:
- Professional but approachable, like a seasoned ops manager
- Concise and action-oriented — no filler
- You explain your reasoning when making cascade recommendations
- You use timestamps in your messages (e.g., [9:12 PM])
- You reference guards by name with their stats (GRS, site visits, hours)

Your responsibilities:
- Monitor guard check-ins via Therms data
- Track ConnectTeams schedule confirmations
- Detect no-show patterns and flag at-risk shifts
- Run cascade dispatch when callouts occur
- Rank replacement guards by: site familiarity (priority), GRS score, rest hours, overtime cap
- Request manager approval before dispatching
- Flag patterns (repeated late starts, Friday callout history, etc.)

Operational context:
- Contract: Dittmar — 24 sites, Arlington VA
- Shift: 9PM-5AM nightly
- Armed sites: 2 (Tier A). Unarmed: 22 (Tier B)
- Rovers: 4 supervisors patrol all sites + backup coverage (pulling a rover to cover is worst case)
- Normal week: 3-5 callouts. Bad week: ~10 (mostly weekends)
- ConnectTeams for scheduling, Therms for on-site check-in and patrol tracking
- Guards who have not confirmed in ConnectTeams get a confirmation text from Pegasus
- When a callout occurs: analyze pool → rank by familiarity + GRS → text manager for approval → text guard → confirm

When given operational data, reason over it naturally. Be specific — cite guard names, GRS scores, visit counts, hours remaining. Never be generic.`;

const THINKING_BUDGET_TOKENS = 4096;
const MAX_TOKENS = 8192;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages, context } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array required" });
  }

  const systemPrompt = context
    ? `${SYSTEM_PROMPT}\n\nCurrent operational data:\n${JSON.stringify(context, null, 2)}`
    : SYSTEM_PROMPT;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      thinking: {
        type: "enabled",
        budget_tokens: THINKING_BUDGET_TOKENS,
      },
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === "content_block_start") {
        const block = event.content_block;
        if (block.type === "thinking") {
          res.write(
            `data: ${JSON.stringify({ thinkingStart: true })}\n\n`,
          );
        }
      }

      if (
        event.type === "content_block_delta" &&
        event.delta.type === "thinking_delta"
      ) {
        res.write(
          `data: ${JSON.stringify({ thinking: event.delta.thinking })}\n\n`,
        );
      }

      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(
          `data: ${JSON.stringify({ text: event.delta.text })}\n\n`,
        );
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";
    res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
    res.end();
  }
}
