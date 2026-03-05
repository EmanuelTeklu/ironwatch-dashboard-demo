// ---------------------------------------------------------------------------
// useThermsScans — hook that runs THERMS scan simulation for all guards
// on tonight's schedule. Generates realistic scan events at 8-15 min
// intervals, with occasional longer gaps for realism.
// ---------------------------------------------------------------------------

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  ThermsScanEvent,
  GuardScanState,
} from "@/lib/therms-types";
import {
  getScanComplianceStatus,
  pickCheckpoint,
  calculateNextScanDelay,
  createScanEvent,
  minutesSince,
} from "@/lib/therms-scan-engine";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuardTimer {
  readonly guardId: number;
  timeoutId: ReturnType<typeof setTimeout> | null;
  lastCheckpoint: string | null;
}

interface UseThermsScansResult {
  /** Map of guardId -> current scan state. */
  readonly scanStates: ReadonlyMap<number, GuardScanState>;
  /** Full list of all scan events across all guards. */
  readonly allScans: readonly ThermsScanEvent[];
  /** Whether the simulation is running. */
  readonly isRunning: boolean;
  /** Start the scan simulation. */
  readonly start: () => void;
  /** Stop the scan simulation. */
  readonly stop: () => void;
}

// ---------------------------------------------------------------------------
// Build scan state for a single guard (pure)
// ---------------------------------------------------------------------------

function buildGuardScanState(
  guardId: number,
  scans: readonly ThermsScanEvent[],
  nowMs: number,
): GuardScanState {
  const guardScans = scans.filter((s) => s.guardId === guardId);
  const lastScan = guardScans.length > 0 ? guardScans[guardScans.length - 1] : null;
  const lastScanTime = lastScan?.timestamp ?? null;
  const lastCheckpoint = lastScan?.checkpoint ?? null;
  const msSinceLast = lastScanTime !== null ? minutesSince(lastScanTime, nowMs) : 0;
  const status = getScanComplianceStatus(msSinceLast);

  return {
    guardId,
    scans: guardScans,
    lastScanTime,
    lastCheckpoint,
    scanCount: guardScans.length,
    status,
    minutesSinceLastScan: Math.round(msSinceLast * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useThermsScans(guardIds: readonly number[]): UseThermsScansResult {
  const [allScans, setAllScans] = useState<readonly ThermsScanEvent[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const timersRef = useRef<GuardTimer[]>([]);
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stable ref to guard IDs for cleanup comparison
  const guardIdsRef = useRef(guardIds);
  guardIdsRef.current = guardIds;

  // Add a scan event (immutable append)
  const addScan = useCallback((event: ThermsScanEvent) => {
    setAllScans((prev) => [...prev, event]);
  }, []);

  // Schedule next scan for a guard
  const scheduleNextScan = useCallback(
    (timer: GuardTimer) => {
      const delay = calculateNextScanDelay();

      timer.timeoutId = setTimeout(() => {
        const checkpoint = pickCheckpoint(timer.lastCheckpoint);
        const event = createScanEvent(timer.guardId, checkpoint, Date.now());
        timer.lastCheckpoint = checkpoint;

        addScan(event);

        // Schedule the next one
        if (timersRef.current.includes(timer)) {
          scheduleNextScan(timer);
        }
      }, delay);
    },
    [addScan],
  );

  // Start simulation
  const start = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);

    // Generate an initial scan for each guard immediately with staggered timing
    const nowMs = Date.now();
    const initialScans: ThermsScanEvent[] = guardIds.map((guardId, index) => {
      const checkpoint = pickCheckpoint(null);
      // Stagger initial scans so they don't all start at exactly the same time
      const staggerMs = index * 500;
      return createScanEvent(guardId, checkpoint, nowMs - staggerMs);
    });

    setAllScans(initialScans);

    // Set up recurring timers per guard
    const timers: GuardTimer[] = guardIds.map((guardId, index) => {
      const timer: GuardTimer = {
        guardId,
        timeoutId: null,
        lastCheckpoint: initialScans[index].checkpoint,
      };
      return timer;
    });

    timersRef.current = timers;

    // Start all timers
    timers.forEach((timer) => scheduleNextScan(timer));

    // Tick every 15 seconds to update minutesSinceLastScan
    tickIntervalRef.current = setInterval(() => {
      setTick((t) => t + 1);
    }, 15_000);
  }, [isRunning, guardIds, scheduleNextScan]);

  // Stop simulation
  const stop = useCallback(() => {
    setIsRunning(false);

    // Clear all guard timers
    timersRef.current.forEach((timer) => {
      if (timer.timeoutId !== null) {
        clearTimeout(timer.timeoutId);
        timer.timeoutId = null;
      }
    });
    timersRef.current = [];

    // Clear tick interval
    if (tickIntervalRef.current !== null) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => {
        if (timer.timeoutId !== null) {
          clearTimeout(timer.timeoutId);
        }
      });
      if (tickIntervalRef.current !== null) {
        clearInterval(tickIntervalRef.current);
      }
    };
  }, []);

  // Build scan states (recomputes on tick or new scans)
  const scanStates = useMemo(() => {
    // tick is used only to trigger recomputation
    void tick;

    const nowMs = Date.now();
    const stateMap = new Map<number, GuardScanState>();

    for (const guardId of guardIds) {
      stateMap.set(guardId, buildGuardScanState(guardId, allScans, nowMs));
    }

    return stateMap as ReadonlyMap<number, GuardScanState>;
  }, [guardIds, allScans, tick]);

  return { scanStates, allScans, isRunning, start, stop };
}
