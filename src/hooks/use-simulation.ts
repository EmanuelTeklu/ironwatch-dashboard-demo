// ---------------------------------------------------------------------------
// useSimulation — React hook for the nightly operations simulation engine
// Wires the simulation engine to PegasusContext (feed messages) and SMS API.
// ---------------------------------------------------------------------------

import { useState, useRef, useCallback, useEffect } from "react";
import { SIM_TIMELINE } from "@/lib/data";
import {
  createSimulation,
  type SimulationInstance,
  type SimulationCallbacks,
  type SimulationConfig,
  type SiteSimStatus,
} from "@/lib/simulation";
import type { PegasusMessageType, DemoConfig } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UseSimulationOptions {
  /** Callback to post a message to the Pegasus feed */
  readonly addSystemMessage: (
    content: string,
    type?: PegasusMessageType,
    timestamp?: string,
  ) => void;
  /** Optional DemoConfig for real SMS dispatch */
  readonly demoConfig?: DemoConfig | null;
  /** Speed multiplier (default: 300) */
  readonly speed?: number;
}

interface UseSimulationReturn {
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
// SMS sender (calls the Twilio API route)
// ---------------------------------------------------------------------------

async function sendSmsViaApi(to: string, body: string): Promise<void> {
  const response = await fetch("/api/sms/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, body }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`SMS send failed: ${response.status} ${errorText}`);
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useSimulation(
  options: UseSimulationOptions,
): UseSimulationReturn {
  const { addSystemMessage, demoConfig = null, speed = 300 } = options;

  // --- React state ---
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [simTime, setSimTime] = useState(SIM_TIMELINE[0]?.time ?? "16:00");
  const [phase, setPhase] = useState("pre-shift");
  const [siteStatuses, setSiteStatuses] = useState<
    ReadonlyMap<number, SiteSimStatus>
  >(new Map());

  // --- Refs (stable across renders) ---
  const simRef = useRef<SimulationInstance | null>(null);
  const addSystemMessageRef = useRef(addSystemMessage);

  // Keep the callback ref up to date without re-creating the simulation
  useEffect(() => {
    addSystemMessageRef.current = addSystemMessage;
  }, [addSystemMessage]);

  // --- Build the simulation instance on mount (or when speed/demoConfig changes) ---
  useEffect(() => {
    const callbacks: SimulationCallbacks = {
      onMessage: (content: string, type: PegasusMessageType, timestamp: string) => {
        addSystemMessageRef.current(content, type, timestamp);
        setSimTime(timestamp);
      },
      onSendSms: sendSmsViaApi,
      onSiteStatusChange: (_siteId: number, status: SiteSimStatus) => {
        setSiteStatuses((prev) => {
          const next = new Map(prev);
          next.set(status.siteId, status);
          return next;
        });
      },
      onPhaseChange: (newPhase: string) => {
        setPhase(newPhase);
      },
      onComplete: () => {
        setIsRunning(false);
        setIsPaused(false);
      },
    };

    const config: SimulationConfig = {
      speed,
      demoConfig,
    };

    simRef.current = createSimulation(SIM_TIMELINE, config, callbacks);

    // Cleanup: reset on unmount to clear any pending timeouts
    return () => {
      simRef.current?.reset();
      simRef.current = null;
    };
  }, [speed, demoConfig]);

  // --- Control functions ---

  const start = useCallback(() => {
    if (!simRef.current) return;
    setIsRunning(true);
    setIsPaused(false);
    setSimTime(SIM_TIMELINE[0]?.time ?? "16:00");
    setPhase("pre-shift");
    setSiteStatuses(new Map());
    simRef.current.start();
  }, []);

  const pause = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.resume();
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    if (!simRef.current) return;
    simRef.current.reset();
    setIsRunning(false);
    setIsPaused(false);
    setSimTime(SIM_TIMELINE[0]?.time ?? "16:00");
    setPhase("pre-shift");
    setSiteStatuses(new Map());
  }, []);

  return {
    start,
    pause,
    resume,
    reset,
    isRunning,
    isPaused,
    simTime,
    phase,
    siteStatuses,
  };
}
