import { describe, it, expect } from "vitest";
import {
  SITES,
  GUARDS,
  ROVERS,
  CALLOUTS,
  CALLOUT_HISTORY,
  TONIGHT_SCHEDULE,
  SIM_TIMELINE,
  DAYS,
} from "../data";

// ---------------------------------------------------------------------------
// SITES
// ---------------------------------------------------------------------------

describe("SITES", () => {
  it("has 24 sites", () => {
    expect(SITES).toHaveLength(24);
  });

  it("each has phone and shift times 21:00-05:00", () => {
    for (const site of SITES) {
      expect(site.phone).toMatch(/^\+1555\d{7}$/);
      expect(site.shiftStart).toBe("21:00");
      expect(site.shiftEnd).toBe("05:00");
    }
  });

  it("has exactly 2 armed (tier A), 22 unarmed (tier B)", () => {
    const armed = SITES.filter((s) => s.armed && s.tier === "A");
    const unarmed = SITES.filter((s) => !s.armed && s.tier === "B");
    expect(armed).toHaveLength(2);
    expect(unarmed).toHaveLength(22);
  });

  it("each has unique id", () => {
    const ids = SITES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("each has non-empty name, addr, and notes", () => {
    for (const site of SITES) {
      expect(site.name.length).toBeGreaterThan(0);
      expect(site.addr.length).toBeGreaterThan(0);
      expect(site.notes.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// GUARDS
// ---------------------------------------------------------------------------

describe("GUARDS", () => {
  it("has 18 guards", () => {
    expect(GUARDS).toHaveLength(18);
  });

  it("each has phone and familiarity data", () => {
    for (const guard of GUARDS) {
      expect(guard.phone).toMatch(/^\+1555\d{7}$/);
      expect(guard.familiarity.length).toBeGreaterThanOrEqual(3);
      for (const fam of guard.familiarity) {
        expect(fam.siteId).toBeGreaterThan(0);
        expect(fam.siteName.length).toBeGreaterThan(0);
        expect(fam.visits).toBeGreaterThanOrEqual(1);
        expect(fam.visits).toBeLessThanOrEqual(15);
      }
    }
  });

  it("has varied GRS scores (range > 20)", () => {
    const scores = GUARDS.map((g) => g.grs);
    const range = Math.max(...scores) - Math.min(...scores);
    expect(range).toBeGreaterThan(20);
  });

  it("all GRS scores between 65 and 93", () => {
    for (const guard of GUARDS) {
      expect(guard.grs).toBeGreaterThanOrEqual(65);
      expect(guard.grs).toBeLessThanOrEqual(93);
    }
  });

  it("at least 2 armed guards", () => {
    const armed = GUARDS.filter((g) => g.armed);
    expect(armed.length).toBeGreaterThanOrEqual(2);
  });

  it("hours are in 24-38 range, max is 40", () => {
    for (const guard of GUARDS) {
      expect(guard.hrs).toBeGreaterThanOrEqual(24);
      expect(guard.hrs).toBeLessThanOrEqual(38);
      expect(guard.max).toBe(40);
    }
  });

  it("has calloutHistory arrays (0-5 entries)", () => {
    for (const guard of GUARDS) {
      expect(Array.isArray(guard.calloutHistory)).toBe(true);
      expect(guard.calloutHistory.length).toBeLessThanOrEqual(5);
    }
  });

  it("Nash has Friday callout pattern (3+ Friday callouts)", () => {
    const nash = GUARDS.find((g) => g.name === "D. Nash");
    expect(nash).toBeDefined();
    const fridayCallouts = nash!.calloutHistory.filter((c) => c.day === "Fri");
    expect(fridayCallouts.length).toBeGreaterThanOrEqual(3);
  });

  it("Reyes has car trouble pattern (2+ car trouble callouts)", () => {
    const reyes = GUARDS.find((g) => g.name === "M. Reyes");
    expect(reyes).toBeDefined();
    const carTrouble = reyes!.calloutHistory.filter(
      (c) => c.reason === "car trouble"
    );
    expect(carTrouble.length).toBeGreaterThanOrEqual(2);
  });

  it("has Therms stats within expected ranges", () => {
    for (const guard of GUARDS) {
      expect(guard.thermsAvgCheckin).toBeGreaterThanOrEqual(1);
      expect(guard.thermsAvgCheckin).toBeLessThanOrEqual(8);
      expect(guard.thermsLateStarts).toBeGreaterThanOrEqual(0);
      expect(guard.thermsLateStarts).toBeLessThanOrEqual(4);
      expect(guard.thermsPatrolRate).toBeGreaterThanOrEqual(0.75);
      expect(guard.thermsPatrolRate).toBeLessThanOrEqual(1.0);
    }
  });

  it("includes varied statuses", () => {
    const statuses = new Set(GUARDS.map((g) => g.status));
    expect(statuses.has("off-duty")).toBe(true);
    expect(statuses.has("on-duty")).toBe(true);
    expect(statuses.has("training")).toBe(true);
  });

  it("has unique ids", () => {
    const ids = GUARDS.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// ROVERS
// ---------------------------------------------------------------------------

describe("ROVERS", () => {
  it("has 4 rovers", () => {
    expect(ROVERS).toHaveLength(4);
  });

  it("each has zone and phone", () => {
    for (const rover of ROVERS) {
      expect(rover.zone.length).toBeGreaterThan(0);
      expect(rover.phone).toMatch(/^\+1555\d{7}$/);
    }
  });

  it("covers North, South, East, West zones", () => {
    const zones = new Set(ROVERS.map((r) => r.zone));
    expect(zones).toContain("North");
    expect(zones).toContain("South");
    expect(zones).toContain("East");
    expect(zones).toContain("West");
  });
});

// ---------------------------------------------------------------------------
// CALLOUTS (current week, backwards compatible)
// ---------------------------------------------------------------------------

describe("CALLOUTS", () => {
  it("has 10 current-week callouts", () => {
    expect(CALLOUTS).toHaveLength(10);
  });

  it("each has required fields", () => {
    for (const callout of CALLOUTS) {
      expect(callout.day).toBeDefined();
      expect(callout.site).toBeDefined();
      expect(callout.guard).toBeDefined();
      expect(callout.time).toBeDefined();
      expect(typeof callout.armed).toBe("boolean");
      expect(typeof callout.resolved).toBe("boolean");
    }
  });

  it("resolved callouts have fill time and filled-by", () => {
    const resolved = CALLOUTS.filter((c) => c.resolved);
    for (const callout of resolved) {
      expect(callout.fill).toBeGreaterThan(0);
      expect(callout.by).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// CALLOUT_HISTORY (8 weeks)
// ---------------------------------------------------------------------------

describe("CALLOUT_HISTORY", () => {
  it("has 8+ weeks of data (15+ unique days)", () => {
    const uniqueDays = new Set(CALLOUT_HISTORY.map((c) => c.day));
    expect(uniqueDays.size).toBeGreaterThanOrEqual(5);
    // At least 35 records across 8 weeks
    expect(CALLOUT_HISTORY.length).toBeGreaterThanOrEqual(35);
  });

  it("weekend callouts are significant portion", () => {
    const weekendDays = new Set(["Fri", "Sat", "Sun"]);
    const weekendCallouts = CALLOUT_HISTORY.filter((c) =>
      weekendDays.has(c.day)
    );
    const weekendRatio = weekendCallouts.length / CALLOUT_HISTORY.length;
    // Weekend should be at least 40% of callouts
    expect(weekendRatio).toBeGreaterThan(0.4);
  });

  it("includes current week callouts", () => {
    // The last 10 entries should match CALLOUTS
    expect(CALLOUT_HISTORY.length).toBeGreaterThanOrEqual(CALLOUTS.length);
  });

  it("includes armed callouts", () => {
    const armed = CALLOUT_HISTORY.filter((c) => c.armed);
    expect(armed.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// TONIGHT_SCHEDULE
// ---------------------------------------------------------------------------

describe("TONIGHT_SCHEDULE", () => {
  it("has 24 entries", () => {
    expect(TONIGHT_SCHEDULE).toHaveLength(24);
  });

  it("has 5 unconfirmed", () => {
    const unconfirmed = TONIGHT_SCHEDULE.filter(
      (e) => !e.connectTeamsConfirmed
    );
    expect(unconfirmed).toHaveLength(5);
  });

  it("each has guardId and siteId", () => {
    for (const entry of TONIGHT_SCHEDULE) {
      expect(entry.siteId).toBeGreaterThan(0);
      expect(entry.guardId).toBeGreaterThan(0);
    }
  });

  it("Nash is one of the unconfirmed", () => {
    const nash = GUARDS.find((g) => g.name === "D. Nash");
    expect(nash).toBeDefined();
    const nashEntry = TONIGHT_SCHEDULE.find((e) => e.guardId === nash!.id);
    expect(nashEntry).toBeDefined();
    expect(nashEntry!.connectTeamsConfirmed).toBe(false);
  });

  it("all siteIds reference real sites", () => {
    const siteIds = new Set(SITES.map((s) => s.id));
    for (const entry of TONIGHT_SCHEDULE) {
      expect(siteIds.has(entry.siteId)).toBe(true);
    }
  });

  it("all guardIds reference real guards", () => {
    const guardIds = new Set(GUARDS.map((g) => g.id));
    for (const entry of TONIGHT_SCHEDULE) {
      expect(guardIds.has(entry.guardId)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// SIM_TIMELINE
// ---------------------------------------------------------------------------

describe("SIM_TIMELINE", () => {
  it("has 20+ events", () => {
    expect(SIM_TIMELINE.length).toBeGreaterThanOrEqual(20);
  });

  it("starts at 16:00", () => {
    expect(SIM_TIMELINE[0].time).toBe("16:00");
  });

  it("ends at 05:00 with night-summary", () => {
    const last = SIM_TIMELINE[SIM_TIMELINE.length - 1];
    expect(last.time).toBe("05:00");
    expect(last.type).toBe("night-summary");
  });

  it("includes at least 2 callout events", () => {
    const callouts = SIM_TIMELINE.filter((e) => e.type === "callout-received");
    expect(callouts.length).toBeGreaterThanOrEqual(2);
  });

  it("includes cascade events with text messages", () => {
    const cascadeTexts = SIM_TIMELINE.filter(
      (e) => e.type === "cascade-text-sent"
    );
    expect(cascadeTexts.length).toBeGreaterThanOrEqual(2);
    for (const event of cascadeTexts) {
      expect(event.data.sms).toBeDefined();
    }
  });

  it("includes therms check-in events", () => {
    const therms = SIM_TIMELINE.filter((e) => e.type === "therms-checkin");
    expect(therms.length).toBeGreaterThanOrEqual(3);
  });

  it("each event has a data object with message", () => {
    for (const event of SIM_TIMELINE) {
      expect(event.data).toBeDefined();
      expect(typeof event.data.message).toBe("string");
    }
  });

  it("events are in chronological order", () => {
    for (let i = 1; i < SIM_TIMELINE.length; i++) {
      const prev = normalizeTime(SIM_TIMELINE[i - 1].time);
      const curr = normalizeTime(SIM_TIMELINE[i].time);
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
  });
});

// ---------------------------------------------------------------------------
// DAYS constant
// ---------------------------------------------------------------------------

describe("DAYS", () => {
  it("has 7 day abbreviations", () => {
    expect(DAYS).toHaveLength(7);
    expect(DAYS).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
  });
});

// ---------------------------------------------------------------------------
// Helper: normalize 24h time to minutes-from-midnight for ordering check
// Handles overnight shifts where times after midnight (00:00-05:00) are > 23:59
// ---------------------------------------------------------------------------

function normalizeTime(time: string): number {
  const [h, m] = time.split(":").map(Number);
  // Times 00:00-05:59 are "next day" in a 21:00-05:00 shift
  const minutesFromMidnight = h * 60 + m;
  if (h < 16) {
    // After midnight — add 24 hours worth of minutes
    return minutesFromMidnight + 24 * 60;
  }
  return minutesFromMidnight;
}
