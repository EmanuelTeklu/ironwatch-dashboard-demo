import { describe, it, expect } from "vitest";
import { getRovers, getTonightSchedule, getSimTimeline } from "../../lib/api";

describe("API functions", () => {
  it("getRovers returns 4 rovers", async () => {
    const rovers = await getRovers();
    expect(rovers).toHaveLength(4);
    expect(rovers[0]).toHaveProperty("zone");
    expect(rovers[0]).toHaveProperty("phone");
  });

  it("getTonightSchedule returns 24 entries", async () => {
    const schedule = await getTonightSchedule();
    expect(schedule).toHaveLength(24);
    expect(schedule[0]).toHaveProperty("siteId");
    expect(schedule[0]).toHaveProperty("connectTeamsConfirmed");
  });

  it("getSimTimeline returns 20+ events", async () => {
    const timeline = await getSimTimeline();
    expect(timeline.length).toBeGreaterThan(20);
    expect(timeline[0]).toHaveProperty("time");
    expect(timeline[0]).toHaveProperty("type");
  });
});
