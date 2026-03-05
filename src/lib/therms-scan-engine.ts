// ---------------------------------------------------------------------------
// THERMS Scan Simulation Engine
// Generates realistic scan events for guards on shift.
// Guards scan every 8-15 minutes on average, with occasional longer gaps.
// ---------------------------------------------------------------------------

import type { ThermsScanEvent, ScanComplianceStatus } from "./therms-types";
import { SCAN_CHECKPOINTS } from "./therms-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Minimum scan interval in minutes (normal pace). */
const MIN_SCAN_INTERVAL_MS = 8 * 60 * 1000;

/** Maximum scan interval in minutes (normal pace). */
const MAX_SCAN_INTERVAL_MS = 15 * 60 * 1000;

/** Chance a guard goes longer than normal (for realism). */
const LONG_GAP_PROBABILITY = 0.12;

/** Long gap range: 16-25 minutes. */
const LONG_GAP_MIN_MS = 16 * 60 * 1000;
const LONG_GAP_MAX_MS = 25 * 60 * 1000;

// ---------------------------------------------------------------------------
// Compliance thresholds (minutes)
// ---------------------------------------------------------------------------

const COMPLIANT_MAX = 10;
const WARNING_MAX = 15;
const APPROACHING_MAX = 20;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Determine scan compliance status from minutes since last scan. */
export function getScanComplianceStatus(
  minutesSinceLastScan: number,
): ScanComplianceStatus {
  if (minutesSinceLastScan <= COMPLIANT_MAX) return "compliant";
  if (minutesSinceLastScan <= WARNING_MAX) return "warning";
  if (minutesSinceLastScan <= APPROACHING_MAX) return "approaching";
  return "overdue";
}

/** Pick a random checkpoint, avoiding the last one used. */
export function pickCheckpoint(lastCheckpoint: string | null): string {
  const available =
    lastCheckpoint !== null
      ? SCAN_CHECKPOINTS.filter((cp) => cp !== lastCheckpoint)
      : [...SCAN_CHECKPOINTS];
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

/** Calculate next scan delay in ms with realistic variation. */
export function calculateNextScanDelay(): number {
  const isLongGap = Math.random() < LONG_GAP_PROBABILITY;

  if (isLongGap) {
    return LONG_GAP_MIN_MS + Math.random() * (LONG_GAP_MAX_MS - LONG_GAP_MIN_MS);
  }

  return MIN_SCAN_INTERVAL_MS + Math.random() * (MAX_SCAN_INTERVAL_MS - MIN_SCAN_INTERVAL_MS);
}

/** Create a new scan event (immutable). */
export function createScanEvent(
  guardId: number,
  checkpoint: string,
  timestamp: number,
): ThermsScanEvent {
  const shiftDate = new Date(timestamp).toISOString().split("T")[0];
  return {
    guardId,
    timestamp,
    checkpoint,
    shiftDate,
  };
}

/** Calculate minutes since a given timestamp. */
export function minutesSince(timestampMs: number, nowMs: number): number {
  return Math.max(0, (nowMs - timestampMs) / 60_000);
}
