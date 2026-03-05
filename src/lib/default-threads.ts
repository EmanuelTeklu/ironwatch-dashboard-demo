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
    title: "How many called out tonight?",
    seedMessage:
      "Give me a quick summary of tonight's callouts so far. How many guards called out, which sites were affected, and are they all covered?",
  },
  {
    title: "Security concerns this shift",
    seedMessage:
      "Are there any security concerns I should be aware of this shift? Flag any armed sites with issues, pattern alerts, or guards with reliability flags.",
  },
  {
    title: "Staffing coverage overview",
    seedMessage:
      "What does my staffing coverage look like right now? How many sites are confirmed, how many are still pending, and do I have enough backup in the pool if someone else calls out?",
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
