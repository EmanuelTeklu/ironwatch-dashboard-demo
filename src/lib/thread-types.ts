// ---------------------------------------------------------------------------
// Pegasus Thread Types — data model for threaded conversations
// ---------------------------------------------------------------------------

import type { PegasusMessage } from "./types";

// ---------------------------------------------------------------------------
// Thread
// ---------------------------------------------------------------------------

export interface PegasusThread {
  readonly id: string;
  readonly title: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly messages: readonly PegasusMessage[];
  readonly history: readonly { role: "user" | "assistant"; content: string }[];
}

// ---------------------------------------------------------------------------
// Thread operations (immutable)
// ---------------------------------------------------------------------------

export function createThread(title?: string): PegasusThread {
  const now = new Date().toISOString();
  return {
    id: `thread-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: title ?? "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
    history: [],
  };
}

export function updateThread(
  thread: PegasusThread,
  updates: Partial<Pick<PegasusThread, "title" | "messages" | "history">>,
): PegasusThread {
  return {
    ...thread,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
}

export function addMessageToThread(
  thread: PegasusThread,
  message: PegasusMessage,
): PegasusThread {
  return updateThread(thread, {
    messages: [...thread.messages, message],
  });
}

export function appendHistory(
  thread: PegasusThread,
  entry: { role: "user" | "assistant"; content: string },
): PegasusThread {
  return updateThread(thread, {
    history: [...thread.history, entry],
  });
}
