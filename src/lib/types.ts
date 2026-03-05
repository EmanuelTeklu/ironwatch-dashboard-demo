export interface Site {
  id: number;
  name: string;
  addr: string;
  armed: boolean;
  tier: "A" | "B";
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
}

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

export type SiteStatus = "covered" | "confirming" | "alert";

export interface SiteRow extends Site {
  guardName: string | null;
  st: SiteStatus;
  clockIn: string | null;
}

export interface SimLogEntry {
  t: string;
  msg: string;
  type: "info" | "warn" | "danger" | "success" | "ai" | "muted";
}

export type ViewId = "sites" | "callouts" | "cascade" | "pool";
