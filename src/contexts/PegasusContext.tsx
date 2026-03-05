import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { usePegasus } from "@/hooks/use-pegasus";
import { useSimulation } from "@/hooks/use-simulation";
import { useThreadManager } from "@/hooks/use-thread-manager";
import {
  SITES,
  GUARDS,
  ROVERS,
  TONIGHT_SCHEDULE,
  CALLOUT_HISTORY,
} from "@/lib/data";
import type {
  PegasusMessage,
  PegasusMessageType,
  DemoConfig,
} from "@/lib/types";
import type { SiteSimStatus } from "@/lib/simulation";
import type { PegasusThread } from "@/lib/thread-types";

// ---------------------------------------------------------------------------
// Simulation state exposed via context
// ---------------------------------------------------------------------------

interface SimulationState {
  readonly start: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly reset: () => void;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly simTime: string;
  readonly phase: string;
  readonly siteStatuses: ReadonlyMap<number, SiteSimStatus>;
}

// ---------------------------------------------------------------------------
// Context value type — now thread-aware
// ---------------------------------------------------------------------------

interface PegasusContextValue {
  // Thread CRUD
  readonly threads: readonly PegasusThread[];
  readonly activeThread: PegasusThread | null;
  readonly activeThreadId: string | null;
  readonly createThread: (title?: string) => PegasusThread;
  readonly switchThread: (id: string) => void;
  readonly deleteThread: (id: string) => void;
  readonly renameThread: (id: string, title: string) => void;

  // Active thread chat
  readonly messages: PegasusMessage[];
  readonly isStreaming: boolean;
  readonly streamingThinking: string;
  readonly sendMessage: (content: string) => Promise<void>;
  readonly addSystemMessage: (
    content: string,
    type?: PegasusMessageType,
    timestamp?: string,
  ) => PegasusMessage;
  readonly clearMessages: () => void;

  // Simulation
  readonly simulation: SimulationState;

  // Demo config
  readonly demoConfig: DemoConfig;
  readonly setDemoConfig: (config: DemoConfig, speed?: number) => void;

  // View context
  readonly viewContext: string;
  readonly setViewContext: (viewContext: string) => void;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const PegasusContext = createContext<PegasusContextValue | null>(null);

const DEFAULT_SIM_SPEED = 6;

const DEFAULT_DEMO_CONFIG: DemoConfig = {
  managerName: "Manager",
  guardName: "Guard",
  managerPhone: "",
  guardPhone: "",
};

export function PegasusProvider({ children }: { children: React.ReactNode }) {
  const [demoConfig, setDemoConfigState] =
    useState<DemoConfig>(DEFAULT_DEMO_CONFIG);
  const [simSpeed, setSimSpeed] = useState(DEFAULT_SIM_SPEED);
  const [viewContext, setViewContext] = useState("");
  const autoStarted = useRef(false);

  // Thread manager
  const threadManager = useThreadManager();

  const context = useMemo(
    () => ({
      sites: SITES,
      guards: GUARDS,
      rovers: ROVERS,
      schedule: TONIGHT_SCHEDULE,
      calloutHistory: CALLOUT_HISTORY,
    }),
    [],
  );

  // Pegasus hook — operates on active thread's history
  const pegasus = usePegasus({
    context,
    viewContext,
    threadId: threadManager.activeThreadId ?? undefined,
    threadHistory: threadManager.activeThread?.history,
    onThreadUpdate: threadManager.updateThreadData,
  });

  const simulation = useSimulation({
    addSystemMessage: pegasus.addSystemMessage,
    demoConfig,
    speed: simSpeed,
  });

  // Auto-start simulation on mount and ensure an operations thread exists
  useEffect(() => {
    if (!autoStarted.current) {
      autoStarted.current = true;

      // Create or reuse a "Tonight's Operations" thread for sim messages
      const existingOpsThread = threadManager.threads.find(
        (t) => t.title === "Tonight's Operations",
      );
      if (!existingOpsThread) {
        threadManager.createThread("Tonight's Operations");
      } else if (!threadManager.activeThreadId) {
        threadManager.switchThread(existingOpsThread.id);
      }

      simulation.start();
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setDemoConfig = useCallback((config: DemoConfig, speed?: number) => {
    if (speed != null && speed > 0) {
      setSimSpeed(speed);
    }
    setDemoConfigState(config);
  }, []);

  const value: PegasusContextValue = useMemo(
    () => ({
      // Thread CRUD
      threads: threadManager.threads,
      activeThread: threadManager.activeThread,
      activeThreadId: threadManager.activeThreadId,
      createThread: threadManager.createThread,
      switchThread: threadManager.switchThread,
      deleteThread: threadManager.deleteThread,
      renameThread: threadManager.renameThread,

      // Chat
      ...pegasus,

      // Simulation
      simulation,

      // Demo config
      demoConfig,
      setDemoConfig,

      // View context
      viewContext,
      setViewContext,
    }),
    [
      threadManager.threads,
      threadManager.activeThread,
      threadManager.activeThreadId,
      threadManager.createThread,
      threadManager.switchThread,
      threadManager.deleteThread,
      threadManager.renameThread,
      pegasus,
      simulation,
      demoConfig,
      setDemoConfig,
      viewContext,
    ],
  );

  return (
    <PegasusContext.Provider value={value}>{children}</PegasusContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePegasusContext() {
  const ctx = useContext(PegasusContext);
  if (!ctx)
    throw new Error("usePegasusContext must be used within PegasusProvider");
  return ctx;
}
