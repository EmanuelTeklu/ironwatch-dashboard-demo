import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseSimTime,
  simMinutesBetween,
  createSimulation,
} from "../simulation";
import type {
  SimulationCallbacks,
  SimulationConfig,
  SiteSimStatus,
} from "../simulation";
import type { SimEvent, PegasusMessageType } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeEvent(overrides: Partial<SimEvent> = {}): SimEvent {
  return {
    time: "21:00",
    type: "shift-start",
    data: { message: "Test event" },
    ...overrides,
  };
}

function makeCallbacks(
  overrides: Partial<SimulationCallbacks> = {},
): SimulationCallbacks {
  return {
    onMessage: vi.fn(),
    onSendSms: vi.fn().mockResolvedValue(undefined),
    onSiteStatusChange: vi.fn(),
    onPhaseChange: vi.fn(),
    onComplete: vi.fn(),
    ...overrides,
  };
}

function makeConfig(overrides: Partial<SimulationConfig> = {}): SimulationConfig {
  return {
    speed: 300,
    demoConfig: null,
    ...overrides,
  };
}

// Short timeline for tests
function makeTimeline(): SimEvent[] {
  return [
    makeEvent({ time: "16:00", type: "shift-start", data: { message: "Night begins" } }),
    makeEvent({ time: "16:01", type: "confirmation-sent", data: { message: "Texts sent to 5 guards" } }),
    makeEvent({ time: "16:12", type: "confirmation-reply", guardId: 2004, data: { message: "A. Lyles confirms" } }),
    makeEvent({ time: "21:00", type: "shift-start", data: { message: "All sites active" } }),
    makeEvent({ time: "22:47", type: "callout-received", guardId: 2008, siteId: 1002, data: { message: "M. Reyes calls out", sms: "Car trouble" } }),
    makeEvent({ time: "22:48", type: "cascade-text-sent", siteId: 1002, guardId: 2009, data: { message: "Texting E. Teklu", sms: "Can you cover?" } }),
    makeEvent({ time: "22:51", type: "cascade-reply", siteId: 1002, guardId: 2009, data: { message: "E. Teklu accepts", accepted: true } }),
    makeEvent({ time: "22:51", type: "site-covered", siteId: 1002, guardId: 2009, data: { message: "Clarendon Gate covered. E. Teklu activated from standby.", fillMinutes: 3 } }),
    makeEvent({ time: "05:00", type: "night-summary", data: { message: "Night complete", stats: { sitesTotal: 24 } } }),
  ];
}

// ---------------------------------------------------------------------------
// parseSimTime
// ---------------------------------------------------------------------------

describe("parseSimTime", () => {
  it("converts HH:MM to total minutes", () => {
    expect(parseSimTime("00:00")).toBe(0);
    expect(parseSimTime("01:30")).toBe(90);
    expect(parseSimTime("12:00")).toBe(720);
    expect(parseSimTime("21:00")).toBe(1260);
    expect(parseSimTime("23:59")).toBe(1439);
  });

  it("handles leading zeros correctly", () => {
    expect(parseSimTime("05:05")).toBe(305);
    expect(parseSimTime("09:00")).toBe(540);
  });
});

// ---------------------------------------------------------------------------
// simMinutesBetween
// ---------------------------------------------------------------------------

describe("simMinutesBetween", () => {
  it("handles same-day gap", () => {
    expect(simMinutesBetween("16:00", "16:01")).toBe(1);
    expect(simMinutesBetween("21:00", "22:47")).toBe(107);
    expect(simMinutesBetween("16:00", "21:00")).toBe(300);
  });

  it("handles overnight wrap (e.g., 23:00 to 01:00)", () => {
    expect(simMinutesBetween("23:00", "01:00")).toBe(120);
    expect(simMinutesBetween("22:51", "05:00")).toBe(369);
  });

  it("returns 0 for identical times", () => {
    expect(simMinutesBetween("21:00", "21:00")).toBe(0);
    expect(simMinutesBetween("00:00", "00:00")).toBe(0);
  });

  it("handles full day wrap", () => {
    // 00:00 to 00:00 the next day would be 0 (same time)
    // But 23:59 to 00:00 should be 1 minute
    expect(simMinutesBetween("23:59", "00:00")).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// createSimulation — factory
// ---------------------------------------------------------------------------

describe("createSimulation", () => {
  it("returns an object with start, pause, resume, reset, getState", () => {
    const sim = createSimulation(makeTimeline(), makeConfig(), makeCallbacks());
    expect(typeof sim.start).toBe("function");
    expect(typeof sim.pause).toBe("function");
    expect(typeof sim.resume).toBe("function");
    expect(typeof sim.reset).toBe("function");
    expect(typeof sim.getState).toBe("function");
  });

  it("throws if timeline is empty", () => {
    expect(() =>
      createSimulation([], makeConfig(), makeCallbacks()),
    ).toThrow("Timeline must contain at least one event");
  });

  it("initial state is not running", () => {
    const sim = createSimulation(makeTimeline(), makeConfig(), makeCallbacks());
    const state = sim.getState();
    expect(state.running).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.currentEventIndex).toBe(0);
    expect(state.simTime).toBe("16:00");
  });
});

// ---------------------------------------------------------------------------
// Event processing (using fake timers)
// ---------------------------------------------------------------------------

describe("Simulation event processing", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("processes events in order", async () => {
    const cbs = makeCallbacks();
    const timeline = makeTimeline();
    const sim = createSimulation(timeline, makeConfig(), cbs);

    sim.start();

    // Advance through all timers (each event has a timeout)
    await vi.runAllTimersAsync();

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    expect(onMessage).toHaveBeenCalledTimes(timeline.length);

    // Verify order: first call should be the first event
    expect(onMessage.mock.calls[0][0]).toBe("Night begins");
    expect(onMessage.mock.calls[0][2]).toBe("16:00");

    // Last call should be the night summary
    const lastCall = onMessage.mock.calls[timeline.length - 1];
    expect(lastCall[0]).toBe("Night complete");
    expect(lastCall[2]).toBe("05:00");
  });

  it("calls onMessage for each event with correct type", async () => {
    const cbs = makeCallbacks();
    const timeline: SimEvent[] = [
      makeEvent({ time: "21:00", type: "shift-start", data: { message: "Active" } }),
      makeEvent({ time: "22:00", type: "callout-received", siteId: 1002, data: { message: "Callout" } }),
      makeEvent({ time: "22:01", type: "site-covered", siteId: 1002, data: { message: "Covered. A. Gueye activated." } }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];
    const sim = createSimulation(timeline, makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    // shift-start -> info
    expect(onMessage.mock.calls[0][1]).toBe("info");
    // callout-received -> danger
    expect(onMessage.mock.calls[1][1]).toBe("danger");
    // site-covered -> success
    expect(onMessage.mock.calls[2][1]).toBe("success");
    // night-summary -> info
    expect(onMessage.mock.calls[3][1]).toBe("info");
  });

  it("calls onComplete when timeline finishes", async () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    expect(cbs.onComplete).toHaveBeenCalledTimes(1);
  });

  it("fires onPhaseChange when phase transitions occur", async () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const onPhaseChange = cbs.onPhaseChange as ReturnType<typeof vi.fn>;
    // Should have been called at least for pre-shift and active
    expect(onPhaseChange).toHaveBeenCalled();
    // First call on start should be pre-shift (16:00)
    expect(onPhaseChange.mock.calls[0][0]).toBe("pre-shift");
  });

  it("updates site status on callout and coverage events", async () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const onSiteStatusChange = cbs.onSiteStatusChange as ReturnType<typeof vi.fn>;
    expect(onSiteStatusChange).toHaveBeenCalled();

    // Find the callout-received update for site 1002 (should be red)
    const statusCalls = onSiteStatusChange.mock.calls as [number, SiteSimStatus][];
    const calloutCall = statusCalls.find(
      ([siteId, status]) => siteId === 1002 && status.status === "red",
    );
    expect(calloutCall).toBeDefined();

    // Find the site-covered update for site 1002 (should be green)
    const coveredCall = statusCalls.find(
      ([siteId, status]) => siteId === 1002 && status.status === "green",
    );
    expect(coveredCall).toBeDefined();
  });

  it("pauses and resumes correctly", async () => {
    const cbs = makeCallbacks();
    const timeline = makeTimeline();
    const sim = createSimulation(timeline, makeConfig(), cbs);

    sim.start();

    // Advance to process the first event (delay is 0 for first)
    await vi.advanceTimersByTimeAsync(0);
    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    const callCountAfterFirst = onMessage.mock.calls.length;
    expect(callCountAfterFirst).toBeGreaterThanOrEqual(1);

    // Pause
    sim.pause();
    const pausedState = sim.getState();
    expect(pausedState.paused).toBe(true);
    expect(pausedState.running).toBe(true);

    // Advance time — no new events should fire
    await vi.advanceTimersByTimeAsync(100_000);
    expect(onMessage.mock.calls.length).toBe(callCountAfterFirst);

    // Resume
    sim.resume();
    await vi.runAllTimersAsync();

    // All events should have been processed now
    expect(onMessage).toHaveBeenCalledTimes(timeline.length);
  });

  it("reset returns to initial state", async () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.advanceTimersByTimeAsync(0);

    sim.reset();

    const state = sim.getState();
    expect(state.running).toBe(false);
    expect(state.paused).toBe(false);
    expect(state.currentEventIndex).toBe(0);
    expect(state.simTime).toBe("16:00");
    expect(state.siteStatuses.size).toBe(0);
  });

  it("start after reset processes all events again", async () => {
    const cbs = makeCallbacks();
    const timeline = makeTimeline();
    const sim = createSimulation(timeline, makeConfig(), cbs);

    // First run
    sim.start();
    await vi.runAllTimersAsync();

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    expect(onMessage).toHaveBeenCalledTimes(timeline.length);

    // Reset and run again
    sim.reset();
    sim.start();
    await vi.runAllTimersAsync();

    expect(onMessage).toHaveBeenCalledTimes(timeline.length * 2);
  });

  it("handles cascade-reply with accepted=true as success", async () => {
    const cbs = makeCallbacks();
    const timeline: SimEvent[] = [
      makeEvent({ time: "22:51", type: "cascade-reply", siteId: 1002, data: { message: "Accepted", accepted: true } }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];
    const sim = createSimulation(timeline, makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    // cascade-reply with accepted=true should be "success"
    expect(onMessage.mock.calls[0][1]).toBe("success");
  });

  it("handles cascade-reply with accepted=false as warning", async () => {
    const cbs = makeCallbacks();
    const timeline: SimEvent[] = [
      makeEvent({ time: "01:19", type: "cascade-reply", siteId: 1019, data: { message: "Declined", accepted: false } }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];
    const sim = createSimulation(timeline, makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    expect(onMessage.mock.calls[0][1]).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// SMS dispatch
// ---------------------------------------------------------------------------

describe("Simulation SMS dispatch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends SMS for cascade-text-sent when demoConfig is provided", async () => {
    const cbs = makeCallbacks();
    const config = makeConfig({
      demoConfig: {
        managerPhone: "+15550001111",
        guardPhone: "+15550002222",
        managerName: "Manager",
        guardName: "Guard",
      },
    });
    const timeline: SimEvent[] = [
      makeEvent({
        time: "22:48",
        type: "cascade-text-sent",
        siteId: 1002,
        guardId: 2009,
        data: { message: "Texting guard", sms: "Can you cover Clarendon Gate?" },
      }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];

    const sim = createSimulation(timeline, config, cbs);
    sim.start();
    await vi.runAllTimersAsync();

    expect(cbs.onSendSms).toHaveBeenCalledWith(
      "+15550002222",
      "Can you cover Clarendon Gate?",
    );
  });

  it("sends SMS for callout-received to manager phone", async () => {
    const cbs = makeCallbacks();
    const config = makeConfig({
      demoConfig: {
        managerPhone: "+15550001111",
        guardPhone: "+15550002222",
        managerName: "Manager",
        guardName: "Guard",
      },
    });
    const timeline: SimEvent[] = [
      makeEvent({
        time: "22:47",
        type: "callout-received",
        guardId: 2008,
        siteId: 1002,
        data: { message: "Callout received", sms: "Guard called out sick" },
      }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];

    const sim = createSimulation(timeline, config, cbs);
    sim.start();
    await vi.runAllTimersAsync();

    expect(cbs.onSendSms).toHaveBeenCalledWith(
      "+15550001111",
      "Guard called out sick",
    );
  });

  it("does not send SMS when demoConfig is null", async () => {
    const cbs = makeCallbacks();
    const timeline: SimEvent[] = [
      makeEvent({
        time: "22:48",
        type: "cascade-text-sent",
        siteId: 1002,
        data: { message: "Texting guard", sms: "Can you cover?" },
      }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];

    const sim = createSimulation(timeline, makeConfig(), cbs);
    sim.start();
    await vi.runAllTimersAsync();

    expect(cbs.onSendSms).not.toHaveBeenCalled();
  });

  it("does not send SMS when event has no sms field", async () => {
    const cbs = makeCallbacks();
    const config = makeConfig({
      demoConfig: {
        managerPhone: "+15550001111",
        guardPhone: "+15550002222",
        managerName: "Manager",
        guardName: "Guard",
      },
    });
    const timeline: SimEvent[] = [
      makeEvent({
        time: "22:48",
        type: "cascade-text-sent",
        siteId: 1002,
        data: { message: "Texting guard" }, // no sms field
      }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "Done" } }),
    ];

    const sim = createSimulation(timeline, config, cbs);
    sim.start();
    await vi.runAllTimersAsync();

    expect(cbs.onSendSms).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Speed / delay calculation
// ---------------------------------------------------------------------------

describe("Simulation speed control", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("first event fires with zero delay", async () => {
    const cbs = makeCallbacks();
    const timeline: SimEvent[] = [
      makeEvent({ time: "21:00", type: "shift-start", data: { message: "Start" } }),
      makeEvent({ time: "05:00", type: "night-summary", data: { message: "End" } }),
    ];
    const sim = createSimulation(timeline, makeConfig({ speed: 300 }), cbs);

    sim.start();
    // Process first event at 0ms delay
    await vi.advanceTimersByTimeAsync(0);

    const onMessage = cbs.onMessage as ReturnType<typeof vi.fn>;
    expect(onMessage).toHaveBeenCalledTimes(1);
    expect(onMessage.mock.calls[0][0]).toBe("Start");
  });

  it("getState reflects correct simTime after events", async () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const state = sim.getState();
    // After all events, simTime should be the last event time
    expect(state.simTime).toBe("05:00");
    expect(state.running).toBe(false); // night-summary stops the sim
  });

  it("uses default speed of 300 when speed is 0", () => {
    const cbs = makeCallbacks();
    const sim = createSimulation(
      makeTimeline(),
      makeConfig({ speed: 0 }),
      cbs,
    );
    const state = sim.getState();
    expect(state.speed).toBe(300);
  });
});

// ---------------------------------------------------------------------------
// State immutability
// ---------------------------------------------------------------------------

describe("Simulation state immutability", () => {
  it("getState returns a new object each call", () => {
    const sim = createSimulation(makeTimeline(), makeConfig(), makeCallbacks());
    const s1 = sim.getState();
    const s2 = sim.getState();
    expect(s1).not.toBe(s2);
    expect(s1).toEqual(s2);
  });

  it("siteStatuses map is a copy, not the internal reference", async () => {
    vi.useFakeTimers();
    const cbs = makeCallbacks();
    const sim = createSimulation(makeTimeline(), makeConfig(), cbs);

    sim.start();
    await vi.runAllTimersAsync();

    const state = sim.getState();
    const originalSize = state.siteStatuses.size;

    // Mutating the returned map should not affect internal state
    (state.siteStatuses as Map<number, SiteSimStatus>).clear();
    expect(state.siteStatuses.size).toBe(0);

    // Internal state should be unchanged
    const state2 = sim.getState();
    expect(state2.siteStatuses.size).toBe(originalSize);

    vi.useRealTimers();
  });
});
