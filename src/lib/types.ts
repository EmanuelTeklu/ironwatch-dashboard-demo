// ---------------------------------------------------------------------------
// IronWatch + Pegasus Type Definitions
// ---------------------------------------------------------------------------

// --- Site -------------------------------------------------------------------

export interface Site {
  id: number;
  name: string;
  addr: string;
  armed: boolean;
  tier: "A" | "B";
  phone: string;
  shiftStart: string;
  shiftEnd: string;
  notes: string;
}

// --- Guard ------------------------------------------------------------------

export interface SiteFamiliarity {
  siteId: number;
  siteName: string;
  visits: number;
}

export interface CallOutRecord {
  date: string;
  day: string;
  siteId: number;
  reason: string;
}

export interface Guard {
  id: number;
  name: string;
  role: string;
  armed: boolean;
  grs: number;
  hrs: number;
  max: number;
  lastOut: string | null;
  status: "on-duty" | "off-duty" | "training" | "inactive";
  phone: string;
  familiarity: SiteFamiliarity[];
  calloutHistory: CallOutRecord[];
  thermsAvgCheckin: number;
  thermsLateStarts: number;
  thermsPatrolRate: number;
}

// --- Therms -----------------------------------------------------------------

export interface ThermsRecord {
  siteId: number;
  checkinTime: string;
  patrolsCompleted: number;
  patrolsExpected: number;
  lateStart: boolean;
}

// --- CallOut (existing — used by callouts view) -----------------------------

export interface CallOut {
  day: string;
  site: string;
  guard: string;
  time: string;
  armed: boolean;
  resolved: boolean;
  fill: number | null;
  by: string | null;
}

// --- Rover ------------------------------------------------------------------

export type RoverStatus = "patrolling" | "covering" | "en-route";

export interface Rover {
  id: number;
  name: string;
  phone: string;
  zone: string;
  status: RoverStatus;
}

// --- Simulation -------------------------------------------------------------

export type SimEventType =
  | "shift-start"
  | "confirmation-sent"
  | "confirmation-reply"
  | "therms-checkin"
  | "therms-patrol"
  | "therms-late"
  | "callout-received"
  | "cascade-start"
  | "cascade-text-sent"
  | "cascade-reply"
  | "site-covered"
  | "pattern-flag"
  | "all-clear"
  | "night-summary";

export interface SimEvent {
  time: string;
  type: SimEventType;
  siteId?: number;
  guardId?: number;
  roverId?: number;
  data: Record<string, unknown>;
}

export interface SimLogEntry {
  t: string;
  msg: string;
  type: "info" | "warn" | "danger" | "success" | "ai" | "muted";
}

// --- Pegasus Chat -----------------------------------------------------------

export type PegasusRole = "pegasus" | "manager" | "system";

export type PegasusMessageType =
  | "info"
  | "warning"
  | "danger"
  | "success"
  | "ai"
  | "action";

export interface PegasusMessage {
  id: string;
  role: PegasusRole;
  content: string;
  timestamp: string;
  type: PegasusMessageType;
}

// --- Demo Config ------------------------------------------------------------

export interface DemoConfig {
  managerPhone: string;
  guardPhone: string;
  managerName: string;
  guardName: string;
}

// --- Site Dashboard ---------------------------------------------------------

export type SiteStatus = "covered" | "confirming" | "alert";

export interface SiteRow extends Site {
  guardName: string | null;
  st: SiteStatus;
  clockIn: string | null;
  connectTeamsConfirmed: boolean;
  thermsCheckedIn: boolean;
  lastPatrolTime: string | null;
}

// --- Schedule ---------------------------------------------------------------

export interface ScheduleEntry {
  siteId: number;
  guardId: number;
  connectTeamsConfirmed: boolean;
}

// --- Navigation -------------------------------------------------------------

export type ViewId = "sites" | "callouts" | "cascade" | "pool" | "pegasus";
