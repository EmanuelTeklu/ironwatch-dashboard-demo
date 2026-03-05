import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePegasus } from "@/hooks/use-pegasus";
import { useSimulation } from "@/hooks/use-simulation";
import { SITES, GUARDS, ROVERS, TONIGHT_SCHEDULE, CALLOUT_HISTORY } from "@/lib/data";
import type { PegasusMessage, PegasusMessageType, DemoConfig } from "@/lib/types";
import type { SiteSimStatus } from "@/lib/simulation";

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
// Context value type
// ---------------------------------------------------------------------------

interface PegasusContextValue {
  readonly messages: PegasusMessage[];
  readonly isStreaming: boolean;
  readonly sendMessage: (content: string) => Promise<void>;
  readonly addSystemMessage: (
    content: string,
    type?: PegasusMessageType,
    timestamp?: string,
  ) => PegasusMessage;
  readonly clearMessages: () => void;
  readonly demoConfig: DemoConfig | null;
  readonly setDemoConfig: (config: DemoConfig, speed?: number) => void;
  readonly simulation: SimulationState;
}

// ---------------------------------------------------------------------------
// Context + Provider
// ---------------------------------------------------------------------------

const PegasusContext = createContext<PegasusContextValue | null>(null);

const DEFAULT_SIM_SPEED = 300;

export function PegasusProvider({ children }: { children: React.ReactNode }) {
  const [demoConfig, setDemoConfigState] = useState<DemoConfig | null>(null);
  const [simSpeed, setSimSpeed] = useState(DEFAULT_SIM_SPEED);

  const context = useMemo(() => ({
    sites: SITES,
    guards: GUARDS,
    rovers: ROVERS,
    schedule: TONIGHT_SCHEDULE,
    calloutHistory: CALLOUT_HISTORY,
  }), []);

  const pegasus = usePegasus({ context });

  const simulation = useSimulation({
    addSystemMessage: pegasus.addSystemMessage,
    demoConfig: demoConfig ?? undefined,
    speed: simSpeed,
  });

  // Auto-start simulation when demoConfig is set
  const demoConfigSet = demoConfig !== null;
  const simRunning = simulation.isRunning;
  useEffect(() => {
    if (demoConfigSet && !simRunning) {
      simulation.start();
    }
    // Only react to demoConfig being set, not to simulation reference changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoConfigSet]);

  const setDemoConfig = useMemo(
    () => (config: DemoConfig, speed?: number) => {
      if (speed != null && speed > 0) {
        setSimSpeed(speed);
      }
      setDemoConfigState(config);
    },
    [],
  );

  const value: PegasusContextValue = useMemo(
    () => ({
      ...pegasus,
      demoConfig,
      setDemoConfig,
      simulation,
    }),
    [pegasus, demoConfig, setDemoConfig, simulation],
  );

  return (
    <PegasusContext.Provider value={value}>
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
