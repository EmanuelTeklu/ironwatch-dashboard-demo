import React, { createContext, useContext, useMemo } from "react";
import { usePegasus } from "@/hooks/use-pegasus";
import { SITES, GUARDS, ROVERS, TONIGHT_SCHEDULE, CALLOUT_HISTORY } from "@/lib/data";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------

interface PegasusContextValue {
  messages: PegasusMessage[];
  isStreaming: boolean;
  sendMessage: (content: string) => Promise<void>;
  addSystemMessage: (content: string, type?: PegasusMessageType, timestamp?: string) => PegasusMessage;
  clearMessages: () => void;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const PegasusContext = createContext<PegasusContextValue | null>(null);

export function PegasusProvider({ children }: { children: React.ReactNode }) {
  const context = useMemo(() => ({
    sites: SITES,
    guards: GUARDS,
    rovers: ROVERS,
    schedule: TONIGHT_SCHEDULE,
    calloutHistory: CALLOUT_HISTORY,
  }), []);

  const pegasus = usePegasus({ context });

  return (
    <PegasusContext.Provider value={pegasus}>
      {children}
    </PegasusContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePegasusContext() {
  const ctx = useContext(PegasusContext);
  if (!ctx) throw new Error("usePegasusContext must be used within PegasusProvider");
  return ctx;
}
