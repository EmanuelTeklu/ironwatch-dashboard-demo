// ---------------------------------------------------------------------------
// Default Pegasus threads — pre-seeded operational questions for new users
// These are created when no threads exist in localStorage.
// ---------------------------------------------------------------------------

import { createThread, type PegasusThread } from "./thread-types";

// ---------------------------------------------------------------------------
// Default thread definitions
// ---------------------------------------------------------------------------

interface DefaultThreadDef {
  readonly title: string;
  readonly seedMessage: string;
}

const DEFAULT_THREAD_DEFS: readonly DefaultThreadDef[] = [
  {
    title: "Tonight's callout situation",
    seedMessage:
      "Hey Pegasus, what's the callout situation tonight? Who called out, which sites got hit, and are we covered everywhere?",
  },
  {
    title: "Anything I should worry about?",
    seedMessage:
      "Anything I should be worried about this shift? Armed sites, pattern flags, unreliable guards — give me the honest rundown.",
  },
  {
    title: "How's our coverage looking?",
    seedMessage:
      "How's our staffing looking right now? Who's confirmed, who's still pending, and do we have enough bench if another callout comes in?",
  },
];

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function buildDefaultThreads(): readonly PegasusThread[] {
  return DEFAULT_THREAD_DEFS.map((def) => {
    const thread = createThread(def.title);
    return {
      ...thread,
      messages: [
        {
          id: `seed-${thread.id}`,
          role: "manager" as const,
          content: def.seedMessage,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          type: "info" as const,
        },
      ],
      history: [{ role: "user" as const, content: def.seedMessage }],
    };
  });
}
