// ---------------------------------------------------------------------------
// Simulation Engine — drives the nightly operations demo
// Processes SIM_TIMELINE events at accelerated pace, posts messages to the
// Pegasus feed, and triggers SMS at cascade moments.
// ---------------------------------------------------------------------------

import type { SimEvent, PegasusMessageType, DemoConfig } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SiteSimStatus {
  readonly siteId: number;
  readonly guardCheckedIn: boolean;
  readonly connectTeamsConfirmed: boolean;
  readonly patrolsCompleted: number;
  readonly status: "green" | "yellow" | "red";
  readonly coveredBy: string | null;
}

export interface SimulationState {
  readonly running: boolean;
  readonly paused: boolean;
  readonly currentEventIndex: number;
  readonly simTime: string;
  readonly speed: number;
  readonly siteStatuses: ReadonlyMap<number, SiteSimStatus>;
}

export interface SimulationCallbacks {
  readonly onMessage: (
    content: string,
    type: PegasusMessageType,
    timestamp: string,
  ) => void;
  readonly onSendSms: (to: string, body: string) => Promise<void>;
  readonly onSiteStatusChange: (
    siteId: number,
    status: SiteSimStatus,
  ) => void;
  readonly onPhaseChange: (phase: string) => void;
  readonly onComplete: () => void;
}

export interface SimulationConfig {
  readonly speed: number;
  readonly demoConfig: DemoConfig | null;
}

export interface SimulationInstance {
  readonly start: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly reset: () => void;
  readonly getState: () => SimulationState;
}

// ---------------------------------------------------------------------------
// Time helpers (exported for testing)
// ---------------------------------------------------------------------------

export function parseSimTime(time: string): number {
  const parts = time.split(":");
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  return h * 60 + m;
}

export function simMinutesBetween(t1: string, t2: string): number {
  const m1 = parseSimTime(t1);
  let m2 = parseSimTime(t2);
  // Handle overnight wrap (e.g., 23:00 to 01:00)
  if (m2 < m1) {
    m2 += 24 * 60;
  }
  return m2 - m1;
}

// ---------------------------------------------------------------------------
// Event-to-message-type mapping
// ---------------------------------------------------------------------------

function messageTypeForEvent(eventType: SimEvent["type"]): PegasusMessageType {
  switch (eventType) {
    case "shift-start":
      return "info";
    case "confirmation-sent":
      return "info";
    case "confirmation-reply":
      return "success";
    case "therms-checkin":
      return "info";
    case "therms-patrol":
      return "info";
    case "therms-late":
      return "warning";
    case "callout-received":
      return "danger";
    case "cascade-start":
      return "warning";
    case "cascade-text-sent":
      return "action";
    case "cascade-reply":
      return "success";
    case "site-covered":
      return "success";
    case "pattern-flag":
      return "warning";
    case "all-clear":
      return "success";
    case "night-summary":
      return "info";
    default:
      return "info";
  }
}

// Refine cascade-reply type based on acceptance
function refineCascadeReplyType(
  event: SimEvent,
): PegasusMessageType {
  if (event.type !== "cascade-reply") {
    return messageTypeForEvent(event.type);
  }
  const accepted = event.data.accepted;
  return accepted === true ? "success" : "warning";
}

// ---------------------------------------------------------------------------
// Phase detection
// ---------------------------------------------------------------------------

function phaseForTime(simTime: string): string {
  const minutes = parseSimTime(simTime);
  if (minutes < 16 * 60) {
    // Before 16:00 on the next day (after midnight)
    if (minutes < 5 * 60) return "late-night";
    return "shift-end";
  }
  if (minutes < 21 * 60) return "pre-shift";
  if (minutes < 24 * 60) return "active";
  return "active"; // Should not reach here given our timeline
}

// ---------------------------------------------------------------------------
// Site status helpers (immutable updates)
// ---------------------------------------------------------------------------

function createDefaultSiteStatus(siteId: number): SiteSimStatus {
  return {
    siteId,
    guardCheckedIn: false,
    connectTeamsConfirmed: false,
    patrolsCompleted: 0,
    status: "yellow",
    coveredBy: null,
  };
}

function updateSiteStatus(
  current: SiteSimStatus,
  updates: Partial<SiteSimStatus>,
): SiteSimStatus {
  return { ...current, ...updates };
}

function cloneStatuses(
  map: Map<number, SiteSimStatus>,
): Map<number, SiteSimStatus> {
  return new Map(map);
}

// ---------------------------------------------------------------------------
// Process a single event's side effects on site statuses
// ---------------------------------------------------------------------------

function processSiteEffects(
  event: SimEvent,
  statuses: Map<number, SiteSimStatus>,
): Map<number, SiteSimStatus> {
  const siteId = event.siteId;
  if (siteId == null) return statuses;

  const next = cloneStatuses(statuses);
  const current = next.get(siteId) ?? createDefaultSiteStatus(siteId);

  switch (event.type) {
    case "therms-checkin": {
      next.set(
        siteId,
        updateSiteStatus(current, {
          guardCheckedIn: true,
          status: "green",
        }),
      );
      break;
    }
    case "callout-received": {
      next.set(
        siteId,
        updateSiteStatus(current, {
          status: "red",
          coveredBy: null,
        }),
      );
      break;
    }
    case "site-covered": {
      const coveredBy =
        typeof event.data.message === "string"
          ? extractGuardName(event.data.message as string)
          : null;
      next.set(
        siteId,
        updateSiteStatus(current, {
          status: "green",
          coveredBy,
        }),
      );
      break;
    }
    case "therms-late": {
      next.set(
        siteId,
        updateSiteStatus(current, { status: "yellow" }),
      );
      break;
    }
    case "confirmation-reply": {
      next.set(
        siteId,
        updateSiteStatus(current, { connectTeamsConfirmed: true }),
      );
      break;
    }
    default:
      break;
  }

  return next;
}

// Extract a guard name from message text like "Courtland Park covered. A. Gueye activated..."
function extractGuardName(message: string): string | null {
  // Match pattern like ". X. Lastname " at word boundaries
  const match = message.match(
    /(?:covered|activated|en route)[.\s]+([A-Z]\.\s[A-Za-z]+)/i,
  );
  return match ? match[1] : null;
}

// ---------------------------------------------------------------------------
// Default configuration
// ---------------------------------------------------------------------------

const DEFAULT_SPEED = 300;

// ---------------------------------------------------------------------------
// Factory: createSimulation
// ---------------------------------------------------------------------------

export function createSimulation(
  timeline: readonly SimEvent[],
  config: SimulationConfig,
  callbacks: SimulationCallbacks,
): SimulationInstance {
  // Validate inputs
  if (timeline.length === 0) {
    throw new Error("Timeline must contain at least one event");
  }

  const speed = config.speed > 0 ? config.speed : DEFAULT_SPEED;

  // --- Mutable internal state (contained within closure) ---
  let running = false;
  let paused = false;
  let currentEventIndex = 0;
  let simTime = timeline[0].time;
  let siteStatuses = new Map<number, SiteSimStatus>();
  let currentPhase = phaseForTime(simTime);
  let pendingTimeout: ReturnType<typeof setTimeout> | null = null;

  // --- State snapshot (immutable) ---
  function getState(): SimulationState {
    return {
      running,
      paused,
      currentEventIndex,
      simTime,
      speed,
      siteStatuses: new Map(siteStatuses),
    };
  }

  // --- Process a single event ---
  function processEvent(event: SimEvent): void {
    simTime = event.time;

    // Determine message type
    const msgType =
      event.type === "cascade-reply"
        ? refineCascadeReplyType(event)
        : messageTypeForEvent(event.type);

    // Post to Pegasus feed
    const content =
      typeof event.data.message === "string"
        ? (event.data.message as string)
        : `[${event.type}]`;

    callbacks.onMessage(content, msgType, event.time);

    // Update site statuses
    const nextStatuses = processSiteEffects(event, siteStatuses);
    if (nextStatuses !== siteStatuses) {
      siteStatuses = nextStatuses;
      if (event.siteId != null) {
        const updated = siteStatuses.get(event.siteId);
        if (updated) {
          callbacks.onSiteStatusChange(event.siteId, updated);
        }
      }
    }

    // Phase change detection
    const newPhase = phaseForTime(event.time);
    if (newPhase !== currentPhase) {
      currentPhase = newPhase;
      callbacks.onPhaseChange(newPhase);
    }

    // SMS dispatch for cascade/confirmation events
    handleSmsDispatch(event);

    // Night summary = completion
    if (event.type === "night-summary") {
      running = false;
      callbacks.onComplete();
    }
  }

  // --- SMS dispatch logic ---
  function handleSmsDispatch(event: SimEvent): void {
    if (!config.demoConfig) return;

    const smsBody =
      typeof event.data.sms === "string" ? (event.data.sms as string) : null;
    if (!smsBody) return;

    const { managerPhone, guardPhone } = config.demoConfig;

    switch (event.type) {
      case "cascade-text-sent": {
        // Guard dispatch SMS
        if (guardPhone) {
          callbacks.onSendSms(guardPhone, smsBody).catch(() => {
            // SMS failure is non-fatal; message already posted to feed
          });
        }
        break;
      }
      case "callout-received": {
        // Manager notification
        if (managerPhone) {
          callbacks.onSendSms(managerPhone, smsBody).catch(() => {
            // SMS failure is non-fatal
          });
        }
        break;
      }
      default:
        break;
    }
  }

  // --- Schedule next event using setTimeout chaining ---
  function scheduleNext(): void {
    if (!running || paused) return;
    if (currentEventIndex >= timeline.length) {
      running = false;
      return;
    }

    const event = timeline[currentEventIndex];

    // Calculate delay based on time gap from previous event
    let delayMs = 0;
    if (currentEventIndex > 0) {
      const prevTime = timeline[currentEventIndex - 1].time;
      const gapMinutes = simMinutesBetween(prevTime, event.time);
      delayMs = gapMinutes * (1000 / speed);
    }

    pendingTimeout = setTimeout(() => {
      if (!running || paused) return;

      processEvent(event);
      currentEventIndex += 1;

      // Chain to next event
      if (running) {
        scheduleNext();
      }
    }, delayMs);
  }

  // --- Public controls ---
  function start(): void {
    if (running) return;
    running = true;
    paused = false;
    currentEventIndex = 0;
    simTime = timeline[0].time;
    siteStatuses = new Map();
    currentPhase = phaseForTime(simTime);

    callbacks.onPhaseChange(currentPhase);
    scheduleNext();
  }

  function pause(): void {
    if (!running || paused) return;
    paused = true;
    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
  }

  function resume(): void {
    if (!running || !paused) return;
    paused = false;
    scheduleNext();
  }

  function reset(): void {
    running = false;
    paused = false;
    if (pendingTimeout != null) {
      clearTimeout(pendingTimeout);
      pendingTimeout = null;
    }
    currentEventIndex = 0;
    simTime = timeline[0].time;
    siteStatuses = new Map();
    currentPhase = phaseForTime(simTime);
  }

  return { start, pause, resume, reset, getState };
}
