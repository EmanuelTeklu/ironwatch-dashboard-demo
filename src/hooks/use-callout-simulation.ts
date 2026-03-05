// ---------------------------------------------------------------------------
// useCalloutSimulation — drives pre-shift callout events with voice + messages
// ---------------------------------------------------------------------------

import { useState, useRef, useCallback } from "react";
import {
  CALLOUT_TIMELINE,
  type CalloutEvent,
} from "@/lib/callout-simulation";
import { simMinutesBetween } from "@/lib/simulation";

interface UseCalloutSimulationOptions {
  readonly onCallout: (event: CalloutEvent) => void;
  readonly speed?: number;
}

interface UseCalloutSimulationReturn {
  readonly isRunning: boolean;
  readonly completedEvents: readonly CalloutEvent[];
  readonly start: () => void;
  readonly reset: () => void;
}

export function useCalloutSimulation(
  options: UseCalloutSimulationOptions,
): UseCalloutSimulationReturn {
  const { onCallout, speed = 6 } = options;

  const [isRunning, setIsRunning] = useState(false);
  const [completedEvents, setCompletedEvents] = useState<readonly CalloutEvent[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const indexRef = useRef(0);
  const onCalloutRef = useRef(onCallout);
  onCalloutRef.current = onCallout;

  const scheduleNext = useCallback(() => {
    if (indexRef.current >= CALLOUT_TIMELINE.length) {
      setIsRunning(false);
      return;
    }

    const event = CALLOUT_TIMELINE[indexRef.current];
    let delayMs = 0;

    if (indexRef.current > 0) {
      const prevTime = CALLOUT_TIMELINE[indexRef.current - 1].time;
      const gapMinutes = simMinutesBetween(prevTime, event.time);
      delayMs = gapMinutes * (1000 / speed);
    }

    timeoutRef.current = setTimeout(() => {
      onCalloutRef.current(event);
      setCompletedEvents((prev) => [...prev, event]);
      indexRef.current += 1;
      scheduleNext();
    }, delayMs);
  }, [speed]);

  const start = useCallback(() => {
    setIsRunning(true);
    setCompletedEvents([]);
    indexRef.current = 0;
    scheduleNext();
  }, [scheduleNext]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsRunning(false);
    setCompletedEvents([]);
    indexRef.current = 0;
  }, []);

  return { isRunning, completedEvents, start, reset };
}
