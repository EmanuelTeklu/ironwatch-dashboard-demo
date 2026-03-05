import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

// ---------------------------------------------------------------------------
// Agent role definitions
// ---------------------------------------------------------------------------

interface AgentRole {
  readonly name: string;
  readonly systemPrompt: string;
}

const AGENT_ROLES: Record<string, AgentRole> = {
  dispatcher: {
    name: "Dispatcher",
    systemPrompt: `You are the IronWatch Dispatch Agent. Your role is to manage the cascade process when guards call out.

Given a callout event, you:
1. Identify the site that needs coverage
2. Analyze the available guard pool (GRS scores, hours, familiarity, distance)
3. Rank candidates by suitability
4. Recommend the top 3 guards to contact in order
5. Draft the SMS text for each candidate

Always prioritize: armed certification match, overtime limits, rest requirements, site familiarity, then GRS score.
Be concise and action-oriented. Format recommendations as numbered lists.`,
  },
  communicator: {
    name: "Communicator",
    systemPrompt: `You are the IronWatch Communications Agent. Your role is to engage with guards and stakeholders via SMS/phone.

You handle:
1. Responding to inbound SMS messages from guards
2. Drafting professional, friendly SMS messages
3. Managing conversation context for ongoing phone engagements
4. Escalating urgent issues to the operations manager

Keep messages under 160 characters when possible. Be professional but approachable.
Always identify yourself as Pegasus, IronWatch's AI Operations Manager.`,
  },
};

// ---------------------------------------------------------------------------
// In-memory conversation store (per agent, per session)
// ---------------------------------------------------------------------------

const conversations = new Map<
  string,
  Array<{ role: "user" | "assistant"; content: string }>
>();

function getConversationKey(agentId: string, sessionId: string): string {
  return `${agentId}:${sessionId}`;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const {
    agentId,
    sessionId = "default",
    message,
    context,
  } = req.body as {
    agentId?: string;
    sessionId?: string;
    message?: string;
    context?: Record<string, unknown>;
  };

  if (!agentId || !AGENT_ROLES[agentId]) {
    return res.status(400).json({
      error: `Invalid agentId. Valid agents: ${Object.keys(AGENT_ROLES).join(", ")}`,
    });
  }

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }

  const role = AGENT_ROLES[agentId];
  const key = getConversationKey(agentId, sessionId);

  // Get or create conversation history
  const history = conversations.get(key) ?? [];
  history.push({ role: "user", content: message });

  try {
    const client = new Anthropic({ apiKey });

    const systemPrompt = context
      ? `${role.systemPrompt}\n\nCurrent operational context:\n${JSON.stringify(context, null, 2)}`
      : role.systemPrompt;

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: systemPrompt,
      messages: history,
    });

    const assistantContent =
      response.content[0].type === "text" ? response.content[0].text : "";

    history.push({ role: "assistant", content: assistantContent });
    conversations.set(key, history);

    return res.status(200).json({
      agent: agentId,
      response: assistantContent,
      sessionId,
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error";
    return res.status(500).json({ error: errorMessage });
  }
}
