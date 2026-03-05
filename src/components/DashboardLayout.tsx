import { useEffect, useState, useCallback, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PegasusFeed } from "@/components/PegasusFeed";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { useLocation } from "react-router-dom";
import {
  Clock,
  MessageSquare,
  PanelRightClose,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PEGASUS_PANEL_KEY = "ironwatch:pegasus-open";

const VIEW_TITLES: Record<string, string> = {
  "/": "Tonight's Board",
  "/callouts": "Call-Outs",
  "/simulation": "Live Sim",
  "/guards": "Guard Pool",
};

const PANEL_WIDTH = 380;

// ---------------------------------------------------------------------------
// View-specific Pegasus context strings
// ---------------------------------------------------------------------------

const VIEW_CONTEXTS: Record<string, string> = {
  "/": "You are assisting the manager while they view Tonight's Board — a live grid of 24 Dittmar sites showing guard assignments, ConnectTeams confirmation status, Therms check-in status, rover status strip, and one-tap calling. Focus on real-time site monitoring, flag any issues, and help the manager stay on top of all 24 sites.",
  "/callouts":
    "You are assisting the manager while they view the Call-Outs panel — showing active and historical callouts, fill times, cost impact, and response comparisons. Focus on helping the manager fill uncovered shifts, run the cascade process, and optimize response times.",
  "/guards":
    "You are assisting the manager while they view the Guard Pool — showing all guards with GRS scores, hours, site familiarity, and availability. Help with guard selection, coverage questions, and workforce insights.",
};

const VIEW_CONTEXT_LABELS: Record<string, string> = {
  "/": "Watching Tonight's Board",
  "/callouts": "Monitoring Call-Outs",
  "/guards": "Reviewing Guard Pool",
};

const VIEW_PLACEHOLDERS: Record<string, string> = {
  "/": "Ask about site status, check-ins...",
  "/callouts": "Ask about callouts, fill coverage...",
  "/guards": "Ask about guard availability, GRS...",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readPanelPref(): boolean {
  try {
    const stored = localStorage.getItem(PEGASUS_PANEL_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

function writePanelPref(open: boolean): void {
  try {
    localStorage.setItem(PEGASUS_PANEL_KEY, String(open));
  } catch {
    // localStorage unavailable -- silently ignore
  }
}

function formatSimTime(time24: string): string {
  const parts = time24.split(":");
  const h = Number(parts[0]);
  const m = parts[1] ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}

// ---------------------------------------------------------------------------
// Simulation Controls Component
// ---------------------------------------------------------------------------

interface SimControlsProps {
  readonly simTime: string;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly phase: string;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onReset: () => void;
}

function SimControls({
  simTime,
  isRunning,
  isPaused,
  phase,
  onPause,
  onResume,
  onReset,
}: SimControlsProps) {
  if (!isRunning && !isPaused) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1.5">
      {/* Sim time display */}
      <span className="font-mono text-xs font-semibold text-primary">
        SIM {formatSimTime(simTime)}
      </span>

      {/* Phase badge */}
      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary/80">
        {phase}
      </span>

      {/* Pause / Resume */}
      <button
        onClick={isPaused ? onResume : onPause}
        className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title={isPaused ? "Resume simulation" : "Pause simulation"}
      >
        {isPaused ? (
          <Play className="h-3 w-3" />
        ) : (
          <Pause className="h-3 w-3" />
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        title="Reset simulation"
      >
        <RotateCcw className="h-3 w-3" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [time, setTime] = useState(new Date());
  const [pegasusOpen, setPegasusOpen] = useState(readPanelPref);
  const location = useLocation();
  const {
    messages,
    isStreaming,
    streamingThinking,
    sendMessage,
    simulation,
    setViewContext,
  } = usePegasusContext();

  useEffect(() => {
    const i = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  // Sync view context to PegasusContext whenever the route changes
  useEffect(() => {
    const ctx = VIEW_CONTEXTS[location.pathname] ?? "";
    setViewContext(ctx);
  }, [location.pathname, setViewContext]);

  const togglePanel = useCallback(() => {
    setPegasusOpen((prev) => {
      const next = !prev;
      writePanelPref(next);
      return next;
    });
  }, []);

  const title = VIEW_TITLES[location.pathname] || "Dashboard";

  const pegasusPlaceholder = useMemo(
    () => VIEW_PLACEHOLDERS[location.pathname] ?? "Ask Pegasus anything...",
    [location.pathname],
  );

  const pegasusContextLabel = useMemo(
    () => VIEW_CONTEXT_LABELS[location.pathname] ?? "",
    [location.pathname],
  );

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top bar */}
          <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  {title}
                </h1>
                <p className="text-[11px] text-muted-foreground">
                  Dittmar Company ·{" "}
                  {time.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Simulation controls */}
              <SimControls
                simTime={simulation.simTime}
                isRunning={simulation.isRunning}
                isPaused={simulation.isPaused}
                phase={simulation.phase}
                onPause={simulation.pause}
                onResume={simulation.resume}
                onReset={simulation.reset}
              />

              {/* Pegasus panel toggle */}
              <button
                onClick={togglePanel}
                className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                title={
                  pegasusOpen ? "Close Pegasus panel" : "Open Pegasus panel"
                }
              >
                {pegasusOpen ? (
                  <PanelRightClose className="h-3.5 w-3.5" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                <span className="text-[11px] font-medium">Pegasus</span>
              </button>

              {/* Clock */}
              <div className="flex items-center gap-2 rounded-md border border-border bg-secondary px-3 py-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-mono text-xs text-foreground">
                  {time.toLocaleTimeString("en-US", { hour12: false })}
                </span>
              </div>
            </div>
          </header>

          {/* Content + Pegasus Panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Main content */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>

            {/* Pegasus feed panel */}
            {pegasusOpen && (
              <aside
                className="flex flex-col border-l border-border bg-card"
                style={{ width: PANEL_WIDTH, minWidth: PANEL_WIDTH }}
              >
                <PegasusFeed
                  messages={messages}
                  isStreaming={isStreaming}
                  streamingThinking={streamingThinking}
                  onSendMessage={sendMessage}
                  className="flex-1 rounded-none border-0"
                  placeholder={pegasusPlaceholder}
                  contextLabel={pegasusContextLabel}
                />
              </aside>
            )}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
