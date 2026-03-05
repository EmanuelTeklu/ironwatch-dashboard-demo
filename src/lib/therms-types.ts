// ---------------------------------------------------------------------------
// THERMS (Thermal/Scan Tracking) Type Definitions
// ---------------------------------------------------------------------------

/** A single scan event recorded by the THERMS system. */
export interface ThermsScanEvent {
  readonly guardId: number;
  readonly timestamp: number; // epoch ms
  readonly checkpoint: string;
  readonly shiftDate: string; // YYYY-MM-DD
}

/** Aggregated scan state for a single guard during a shift. */
export interface GuardScanState {
  readonly guardId: number;
  readonly scans: readonly ThermsScanEvent[];
  readonly lastScanTime: number | null; // epoch ms
  readonly lastCheckpoint: string | null;
  readonly scanCount: number;
  readonly status: ScanComplianceStatus;
  readonly minutesSinceLastScan: number;
}

/** Visual compliance levels based on time since last scan. */
export type ScanComplianceStatus =
  | "compliant" // 0-10 min, green
  | "warning" // 10-15 min, yellow
  | "approaching" // 15-20 min, orange
  | "overdue"; // 20+ min, red

/** Guard status on the board — what they are doing right now. */
export type GuardShiftStatus =
  | "on-post"
  | "break"
  | "called-out"
  | "late"
  | "en-route"
  | "checked-in";

// ---------------------------------------------------------------------------
// Checkpoint locations used by the scan simulation
// ---------------------------------------------------------------------------

export const SCAN_CHECKPOINTS: readonly string[] = [
  "Building A - North Entry",
  "Building A - South Entry",
  "Building B - Main Lobby",
  "Building B - Rear Exit",
  "Parking Garage L1",
  "Parking Garage L2",
  "Parking Garage L3",
  "Main Lobby",
  "Pool Area Gate",
  "Courtyard - East",
  "Courtyard - West",
  "Loading Dock",
  "Stairwell A - Ground",
  "Stairwell B - Ground",
  "Fitness Center",
  "Rooftop Access Door",
  "Perimeter Fence - North",
  "Perimeter Fence - South",
  "Dumpster Enclosure",
  "Management Office",
] as const;
