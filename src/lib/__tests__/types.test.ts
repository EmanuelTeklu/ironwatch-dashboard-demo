import { describe, it, expect } from "vitest";
import type {
  Site,
  Guard,
  SiteFamiliarity,
  CallOutRecord,
  ThermsRecord,
  CallOut,
  Rover,
  RoverStatus,
  SimEvent,
  SimEventType,
  SimLogEntry,
  PegasusMessage,
  PegasusRole,
  PegasusMessageType,
  DemoConfig,
  SiteStatus,
  SiteRow,
  ScheduleEntry,
  ViewId,
} from "../types";

// ---------------------------------------------------------------------------
// Helpers — construct valid objects of each type
// ---------------------------------------------------------------------------

function makeSite(overrides: Partial<Site> = {}): Site {
  return {
    id: 1001,
    name: "Test Site",
    addr: "123 Main St",
    armed: false,
    tier: "B",
    phone: "555-0100",
    shiftStart: "18:00",
    shiftEnd: "06:00",
    notes: "Front gate code 1234",
    ...overrides,
  };
}

function makeSiteFamiliarity(
  overrides: Partial<SiteFamiliarity> = {},
): SiteFamiliarity {
  return {
    siteId: 1001,
    siteName: "Test Site",
    visits: 12,
    ...overrides,
  };
}

function makeCallOutRecord(
  overrides: Partial<CallOutRecord> = {},
): CallOutRecord {
  return {
    date: "2026-03-01",
    day: "Sun",
    siteId: 1001,
    reason: "sick",
    ...overrides,
  };
}

function makeGuard(overrides: Partial<Guard> = {}): Guard {
  return {
    id: 1438,
    name: "A. Gueye",
    role: "Unarmed Officer",
    armed: false,
    grs: 88,
    hrs: 32,
    max: 40,
    lastOut: "19:00",
    status: "on-duty",
    phone: "555-0200",
    familiarity: [makeSiteFamiliarity()],
    calloutHistory: [makeCallOutRecord()],
    thermsAvgCheckin: 4.2,
    thermsLateStarts: 1,
    thermsPatrolRate: 0.95,
    ...overrides,
  };
}

function makeThermsRecord(
  overrides: Partial<ThermsRecord> = {},
): ThermsRecord {
  return {
    siteId: 1001,
    checkinTime: "18:05",
    patrolsCompleted: 3,
    patrolsExpected: 4,
    lateStart: false,
    ...overrides,
  };
}

function makeCallOut(overrides: Partial<CallOut> = {}): CallOut {
  return {
    day: "Mon",
    site: "Courtland Towers",
    guard: "A. Lyles",
    time: "23:00",
    armed: false,
    resolved: true,
    fill: 22,
    by: "A. Gueye",
    ...overrides,
  };
}

function makeRover(overrides: Partial<Rover> = {}): Rover {
  return {
    id: 1,
    name: "Rover Alpha",
    phone: "555-0300",
    zone: "North",
    status: "patrolling",
    ...overrides,
  };
}

function makeSimEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    time: "18:00",
    type: "shift-start",
    siteId: 1001,
    guardId: 1438,
    data: {},
    ...overrides,
  };
}

function makeSimLogEntry(
  overrides: Partial<SimLogEntry> = {},
): SimLogEntry {
  return {
    t: "18:00",
    msg: "Shift started",
    type: "info",
    ...overrides,
  };
}

function makePegasusMessage(
  overrides: Partial<PegasusMessage> = {},
): PegasusMessage {
  return {
    id: "msg-001",
    role: "pegasus",
    content: "All sites confirmed for tonight.",
    timestamp: "2026-03-05T18:00:00Z",
    type: "info",
    ...overrides,
  };
}

function makeDemoConfig(overrides: Partial<DemoConfig> = {}): DemoConfig {
  return {
    managerPhone: "555-0400",
    guardPhone: "555-0500",
    managerName: "Manny",
    guardName: "A. Gueye",
    ...overrides,
  };
}

function makeSiteRow(overrides: Partial<SiteRow> = {}): SiteRow {
  return {
    ...makeSite(),
    guardName: "A. Gueye",
    st: "covered",
    clockIn: "17:55",
    connectTeamsConfirmed: true,
    thermsCheckedIn: true,
    lastPatrolTime: "20:30",
    ...overrides,
  };
}

function makeScheduleEntry(
  overrides: Partial<ScheduleEntry> = {},
): ScheduleEntry {
  return {
    siteId: 1001,
    guardId: 1438,
    connectTeamsConfirmed: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Site", () => {
  it("constructs with all required fields", () => {
    const site = makeSite();
    expect(site.id).toBe(1001);
    expect(site.name).toBe("Test Site");
    expect(site.addr).toBe("123 Main St");
    expect(site.armed).toBe(false);
    expect(site.tier).toBe("B");
    expect(site.phone).toBe("555-0100");
    expect(site.shiftStart).toBe("18:00");
    expect(site.shiftEnd).toBe("06:00");
    expect(site.notes).toBe("Front gate code 1234");
  });

  it("accepts tier A", () => {
    const site = makeSite({ tier: "A", armed: true });
    expect(site.tier).toBe("A");
    expect(site.armed).toBe(true);
  });
});

describe("SiteFamiliarity", () => {
  it("constructs with all fields", () => {
    const fam = makeSiteFamiliarity();
    expect(fam.siteId).toBe(1001);
    expect(fam.siteName).toBe("Test Site");
    expect(fam.visits).toBe(12);
  });
});

describe("CallOutRecord", () => {
  it("constructs with all fields", () => {
    const rec = makeCallOutRecord();
    expect(rec.date).toBe("2026-03-01");
    expect(rec.day).toBe("Sun");
    expect(rec.siteId).toBe(1001);
    expect(rec.reason).toBe("sick");
  });
});

describe("Guard", () => {
  it("constructs with all required fields including new Pegasus fields", () => {
    const guard = makeGuard();
    expect(guard.id).toBe(1438);
    expect(guard.name).toBe("A. Gueye");
    expect(guard.phone).toBe("555-0200");
    expect(guard.familiarity).toHaveLength(1);
    expect(guard.familiarity[0].siteId).toBe(1001);
    expect(guard.calloutHistory).toHaveLength(1);
    expect(guard.calloutHistory[0].reason).toBe("sick");
    expect(guard.thermsAvgCheckin).toBe(4.2);
    expect(guard.thermsLateStarts).toBe(1);
    expect(guard.thermsPatrolRate).toBe(0.95);
  });

  it("supports all guard statuses", () => {
    const statuses: Guard["status"][] = [
      "on-duty",
      "off-duty",
      "training",
      "inactive",
    ];
    statuses.forEach((status) => {
      const guard = makeGuard({ status });
      expect(guard.status).toBe(status);
    });
  });

  it("allows null lastOut", () => {
    const guard = makeGuard({ lastOut: null });
    expect(guard.lastOut).toBeNull();
  });
});

describe("ThermsRecord", () => {
  it("constructs with all fields", () => {
    const rec = makeThermsRecord();
    expect(rec.siteId).toBe(1001);
    expect(rec.checkinTime).toBe("18:05");
    expect(rec.patrolsCompleted).toBe(3);
    expect(rec.patrolsExpected).toBe(4);
    expect(rec.lateStart).toBe(false);
  });

  it("handles a late start", () => {
    const rec = makeThermsRecord({ lateStart: true, checkinTime: "18:25" });
    expect(rec.lateStart).toBe(true);
  });
});

describe("CallOut (existing)", () => {
  it("preserves the original CallOut shape", () => {
    const co = makeCallOut();
    expect(co.day).toBe("Mon");
    expect(co.site).toBe("Courtland Towers");
    expect(co.guard).toBe("A. Lyles");
    expect(co.time).toBe("23:00");
    expect(co.armed).toBe(false);
    expect(co.resolved).toBe(true);
    expect(co.fill).toBe(22);
    expect(co.by).toBe("A. Gueye");
  });

  it("handles unresolved callout with null fill and by", () => {
    const co = makeCallOut({ resolved: false, fill: null, by: null });
    expect(co.resolved).toBe(false);
    expect(co.fill).toBeNull();
    expect(co.by).toBeNull();
  });
});

describe("Rover", () => {
  it("constructs with all fields", () => {
    const rover = makeRover();
    expect(rover.id).toBe(1);
    expect(rover.name).toBe("Rover Alpha");
    expect(rover.phone).toBe("555-0300");
    expect(rover.zone).toBe("North");
    expect(rover.status).toBe("patrolling");
  });

  it("supports all rover statuses", () => {
    const statuses: RoverStatus[] = ["patrolling", "covering", "en-route"];
    statuses.forEach((status) => {
      const rover = makeRover({ status });
      expect(rover.status).toBe(status);
    });
  });
});

describe("SimEvent", () => {
  it("constructs with required fields", () => {
    const event = makeSimEvent();
    expect(event.time).toBe("18:00");
    expect(event.type).toBe("shift-start");
    expect(event.siteId).toBe(1001);
    expect(event.guardId).toBe(1438);
    expect(event.data).toEqual({});
  });

  it("allows optional siteId, guardId, roverId", () => {
    const event = makeSimEvent({
      type: "night-summary",
      siteId: undefined,
      guardId: undefined,
      roverId: undefined,
      data: { totalSites: 24 },
    });
    expect(event.siteId).toBeUndefined();
    expect(event.guardId).toBeUndefined();
    expect(event.roverId).toBeUndefined();
    expect(event.data).toEqual({ totalSites: 24 });
  });

  it("supports all SimEventType values", () => {
    const types: SimEventType[] = [
      "shift-start",
      "confirmation-sent",
      "confirmation-reply",
      "therms-checkin",
      "therms-patrol",
      "therms-late",
      "callout-received",
      "cascade-start",
      "cascade-text-sent",
      "cascade-reply",
      "site-covered",
      "pattern-flag",
      "all-clear",
      "night-summary",
    ];
    types.forEach((t) => {
      const event = makeSimEvent({ type: t });
      expect(event.type).toBe(t);
    });
  });
});

describe("SimLogEntry", () => {
  it("constructs with all fields", () => {
    const entry = makeSimLogEntry();
    expect(entry.t).toBe("18:00");
    expect(entry.msg).toBe("Shift started");
    expect(entry.type).toBe("info");
  });

  it("supports all log entry types", () => {
    const types: SimLogEntry["type"][] = [
      "info",
      "warn",
      "danger",
      "success",
      "ai",
      "muted",
    ];
    types.forEach((type) => {
      const entry = makeSimLogEntry({ type });
      expect(entry.type).toBe(type);
    });
  });
});

describe("PegasusMessage", () => {
  it("constructs with all fields", () => {
    const msg = makePegasusMessage();
    expect(msg.id).toBe("msg-001");
    expect(msg.role).toBe("pegasus");
    expect(msg.content).toBe("All sites confirmed for tonight.");
    expect(msg.timestamp).toBe("2026-03-05T18:00:00Z");
    expect(msg.type).toBe("info");
  });

  it("supports all PegasusRole values", () => {
    const roles: PegasusRole[] = ["pegasus", "manager", "system"];
    roles.forEach((role) => {
      const msg = makePegasusMessage({ role });
      expect(msg.role).toBe(role);
    });
  });

  it("supports all PegasusMessageType values", () => {
    const types: PegasusMessageType[] = [
      "info",
      "warning",
      "danger",
      "success",
      "ai",
      "action",
    ];
    types.forEach((type) => {
      const msg = makePegasusMessage({ type });
      expect(msg.type).toBe(type);
    });
  });
});

describe("DemoConfig", () => {
  it("constructs with all fields", () => {
    const cfg = makeDemoConfig();
    expect(cfg.managerPhone).toBe("555-0400");
    expect(cfg.guardPhone).toBe("555-0500");
    expect(cfg.managerName).toBe("Manny");
    expect(cfg.guardName).toBe("A. Gueye");
  });
});

describe("SiteRow", () => {
  it("extends Site with dashboard fields", () => {
    const row = makeSiteRow();
    // Site fields
    expect(row.id).toBe(1001);
    expect(row.name).toBe("Test Site");
    expect(row.phone).toBe("555-0100");
    // SiteRow-specific fields
    expect(row.guardName).toBe("A. Gueye");
    expect(row.st).toBe("covered");
    expect(row.clockIn).toBe("17:55");
    expect(row.connectTeamsConfirmed).toBe(true);
    expect(row.thermsCheckedIn).toBe(true);
    expect(row.lastPatrolTime).toBe("20:30");
  });

  it("supports all SiteStatus values", () => {
    const statuses: SiteStatus[] = ["covered", "confirming", "alert"];
    statuses.forEach((st) => {
      const row = makeSiteRow({ st });
      expect(row.st).toBe(st);
    });
  });

  it("allows null guardName, clockIn, and lastPatrolTime", () => {
    const row = makeSiteRow({
      guardName: null,
      clockIn: null,
      lastPatrolTime: null,
    });
    expect(row.guardName).toBeNull();
    expect(row.clockIn).toBeNull();
    expect(row.lastPatrolTime).toBeNull();
  });
});

describe("ScheduleEntry", () => {
  it("constructs with all fields", () => {
    const entry = makeScheduleEntry();
    expect(entry.siteId).toBe(1001);
    expect(entry.guardId).toBe(1438);
    expect(entry.connectTeamsConfirmed).toBe(true);
  });

  it("handles unconfirmed schedule", () => {
    const entry = makeScheduleEntry({ connectTeamsConfirmed: false });
    expect(entry.connectTeamsConfirmed).toBe(false);
  });
});

describe("ViewId", () => {
  it("supports all view identifiers including new ones", () => {
    const views: ViewId[] = [
      "sites",
      "callouts",
      "cascade",
      "pool",
      "rovers",
      "pegasus",
    ];
    expect(views).toHaveLength(6);
    expect(views).toContain("rovers");
    expect(views).toContain("pegasus");
  });
});
