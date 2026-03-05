// ---------------------------------------------------------------------------
// Pegasus Hourly Summaries — conversational check-in generator
// Used by the simulation engine to inject periodic status updates into the
// Pegasus feed at the top of each hour during active shift.
// ---------------------------------------------------------------------------

import type { SimEvent } from "./types";
import type { SiteSimStatus } from "./simulation";

// ---------------------------------------------------------------------------
// Summary schedule — one entry per hourly check-in
// ---------------------------------------------------------------------------

interface HourlySummaryDef {
  readonly time: string;
  readonly label: string;
}

const SUMMARY_SCHEDULE: readonly HourlySummaryDef[] = [
  { time: "22:00", label: "10 PM" },
  { time: "23:00", label: "11 PM" },
  { time: "00:00", label: "Midnight" },
  { time: "01:00", label: "1 AM" },
  { time: "02:00", label: "2 AM" },
  { time: "03:00", label: "3 AM" },
  { time: "04:00", label: "4 AM" },
];

// ---------------------------------------------------------------------------
// Summary generation helpers
// ---------------------------------------------------------------------------

function countCoveredSites(
  statuses: ReadonlyMap<number, SiteSimStatus>,
): number {
  let count = 0;
  for (const s of statuses.values()) {
    if (s.status === "green") count += 1;
  }
  return count;
}

function countRedSites(
  statuses: ReadonlyMap<number, SiteSimStatus>,
): number {
  let count = 0;
  for (const s of statuses.values()) {
    if (s.status === "red") count += 1;
  }
  return count;
}

function findRedSiteNames(
  statuses: ReadonlyMap<number, SiteSimStatus>,
  siteNames: ReadonlyMap<number, string>,
): readonly string[] {
  const names: string[] = [];
  for (const [id, s] of statuses) {
    if (s.status === "red") {
      names.push(siteNames.get(id) ?? `Site ${id}`);
    }
  }
  return names;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a conversational hourly summary message based on current
 * simulation state. Returns null if no summary is due at the given time.
 */
export function generateHourlySummary(
  time: string,
  totalSites: number,
  statuses: ReadonlyMap<number, SiteSimStatus>,
  siteNames: ReadonlyMap<number, string>,
  calloutsResolved: number,
): string | null {
  const def = SUMMARY_SCHEDULE.find((s) => s.time === time);
  if (!def) return null;

  const covered = countCoveredSites(statuses);
  const redCount = countRedSites(statuses);
  const redNames = findRedSiteNames(statuses, siteNames);

  if (redCount > 0) {
    const siteList = redNames.join(", ");
    return (
      `${def.label} check-in. ${covered} of ${totalSites} sites green — ` +
      `${siteList} still showing red. ${calloutsResolved} callout${calloutsResolved !== 1 ? "s" : ""} resolved so far tonight.`
    );
  }

  return (
    `${def.label} check-in. All ${totalSites} sites covered and green. ` +
    `${calloutsResolved} callout${calloutsResolved !== 1 ? "s" : ""} resolved tonight. Looking good.`
  );
}

/**
 * Creates a SimEvent for an hourly summary at the given time.
 * Returns null if the time doesn't match any scheduled summary.
 */
export function createHourlySummaryEvent(
  time: string,
  message: string,
): SimEvent {
  return {
    time,
    type: "hourly-summary",
    data: { message },
  };
}

export { SUMMARY_SCHEDULE };
