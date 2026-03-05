// ---------------------------------------------------------------------------
// useThreadManager — manages Pegasus conversation threads with localStorage
// ---------------------------------------------------------------------------

import { useState, useCallback } from "react";
import {
  createThread as makeThread,
  updateThread,
  type PegasusThread,
} from "@/lib/thread-types";

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ironwatch:pegasus-threads";
const ACTIVE_THREAD_KEY = "ironwatch:pegasus-active-thread";

function loadThreads(): readonly PegasusThread[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PegasusThread[]) : [];
  } catch {
    return [];
  }
}

function saveThreads(threads: readonly PegasusThread[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
  } catch {
    // localStorage unavailable — silently ignore
  }
}

function loadActiveThreadId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_THREAD_KEY);
  } catch {
    return null;
  }
}

function saveActiveThreadId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_THREAD_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_THREAD_KEY);
    }
  } catch {
    // localStorage unavailable
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseThreadManagerReturn {
  readonly threads: readonly PegasusThread[];
  readonly activeThreadId: string | null;
  readonly activeThread: PegasusThread | null;
  readonly createThread: (title?: string) => PegasusThread;
  readonly deleteThread: (id: string) => void;
  readonly switchThread: (id: string) => void;
  readonly renameThread: (id: string, title: string) => void;
  readonly updateThreadData: (
    id: string,
    updates: Partial<Pick<PegasusThread, "title" | "messages" | "history">>,
  ) => void;
  readonly setThreads: (threads: readonly PegasusThread[]) => void;
}

export function useThreadManager(): UseThreadManagerReturn {
  const [threads, setThreadsState] = useState<readonly PegasusThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadIdState] = useState<string | null>(loadActiveThreadId);

  const activeThread =
    threads.find((t) => t.id === activeThreadId) ?? null;

  const setThreads = useCallback((next: readonly PegasusThread[]) => {
    setThreadsState(next);
    saveThreads(next);
  }, []);

  const setActiveThreadId = useCallback((id: string | null) => {
    setActiveThreadIdState(id);
    saveActiveThreadId(id);
  }, []);

  const createThread = useCallback(
    (title?: string): PegasusThread => {
      const thread = makeThread(title);
      const next = [thread, ...threads];
      setThreads(next);
      setActiveThreadId(thread.id);
      return thread;
    },
    [threads, setThreads, setActiveThreadId],
  );

  const deleteThread = useCallback(
    (id: string) => {
      const next = threads.filter((t) => t.id !== id);
      setThreads(next);
      if (activeThreadId === id) {
        setActiveThreadId(next.length > 0 ? next[0].id : null);
      }
    },
    [threads, activeThreadId, setThreads, setActiveThreadId],
  );

  const switchThread = useCallback(
    (id: string) => {
      setActiveThreadId(id);
    },
    [setActiveThreadId],
  );

  const renameThread = useCallback(
    (id: string, title: string) => {
      const next = threads.map((t) =>
        t.id === id ? updateThread(t, { title }) : t,
      );
      setThreads(next);
    },
    [threads, setThreads],
  );

  const updateThreadData = useCallback(
    (
      id: string,
      updates: Partial<Pick<PegasusThread, "title" | "messages" | "history">>,
    ) => {
      const next = threads.map((t) =>
        t.id === id ? updateThread(t, updates) : t,
      );
      setThreads(next);
    },
    [threads, setThreads],
  );

  return {
    threads,
    activeThreadId,
    activeThread,
    createThread,
    deleteThread,
    switchThread,
    renameThread,
    updateThreadData,
    setThreads,
  };
}
