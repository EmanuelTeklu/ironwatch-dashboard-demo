import { useState, useCallback } from "react";
import { Volume2, Play } from "lucide-react";
import { useCalloutSimulation } from "@/hooks/use-callout-simulation";
import { useElevenLabs } from "@/hooks/use-elevenlabs";
import { usePegasusContext } from "@/contexts/PegasusContext";
import type { CalloutEvent } from "@/lib/callout-simulation";
import { Button } from "@/components/ui/button";
import { useCallOuts } from "@/hooks/use-call-outs";
import { CALLOUT_HISTORY } from "@/lib/data";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Clock, Zap } from "lucide-react";
import type { CallOut } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const COST_PER_HOUR_ARMED = 85;
const COST_PER_HOUR_UNARMED = 55;

function calloutCost(co: CallOut): number {
  return co.armed ? COST_PER_HOUR_ARMED : COST_PER_HOUR_UNARMED;
}

export default function CallOutsView() {
  const [dayFilter, setDayFilter] = useState("All");
  const [rangeView, setRangeView] = useState<"week" | "8weeks">("week");
  const { data: weekCallOuts, isLoading, error, refetch } = useCallOuts();

  const { addSystemMessage } = usePegasusContext();
  const { speak, isPlaying } = useElevenLabs();

  const handleCallout = useCallback(
    (event: CalloutEvent) => {
      addSystemMessage(event.messageText, "danger", event.time);
      speak(event.voiceText);
    },
    [addSystemMessage, speak],
  );

  const calloutSim = useCalloutSimulation({
    onCallout: handleCallout,
    speed: 6,
  });

  if (isLoading) {
    return <QueryLoading message="Loading call-outs..." />;
  }

  if (error) {
    return <QueryError message={error.message} onRetry={refetch} />;
  }

  if (!weekCallOuts || weekCallOuts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Total Call-Outs" value={0} />
          <StatCard label="Avg Fill Time" value="--" />
          <StatCard label="Unresolved" value={0} />
          <StatCard label="Armed Call-Outs" value={0} />
          <StatCard label="Est. Cost Impact" value="$0" />
        </div>
        <p className="text-center text-sm text-muted-foreground py-8">
          No call-outs recorded.
        </p>
      </div>
    );
  }

  const callOuts = rangeView === "week" ? weekCallOuts : CALLOUT_HISTORY;

  const filtered =
    dayFilter === "All"
      ? callOuts
      : callOuts.filter((c) => c.day === dayFilter);
  const resolvedWithFill = callOuts.filter((c) => c.fill != null);
  const avgFill =
    resolvedWithFill.length > 0
      ? Math.round(
          resolvedWithFill.reduce((a, c) => a + (c.fill ?? 0), 0) /
            resolvedWithFill.length,
        )
      : 0;
  const unresolvedCount = callOuts.filter((c) => !c.resolved).length;
  const armedCount = callOuts.filter((c) => c.armed).length;
  const totalCost = callOuts.reduce((sum, co) => sum + calloutCost(co), 0);

  const maxBar = Math.max(
    ...DAYS.map((d) => callOuts.filter((c) => c.day === d).length),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Range toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            setRangeView("week");
            setDayFilter("All");
          }}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            rangeView === "week"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          This Week
        </button>
        <button
          onClick={() => {
            setRangeView("8weeks");
            setDayFilter("All");
          }}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            rangeView === "8weeks"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          8 Weeks
        </button>
      </div>

      {/* Pre-shift simulation */}
      <div className="flex items-center gap-3">
        <Button
          onClick={calloutSim.isRunning ? calloutSim.reset : calloutSim.start}
          variant={calloutSim.isRunning ? "destructive" : "default"}
          size="sm"
          className="gap-2"
        >
          <Play className="h-3.5 w-3.5" />
          {calloutSim.isRunning ? "Stop Pre-Shift Sim" : "Start Pre-Shift Sim"}
        </Button>
        {calloutSim.isRunning && (
          <span className="text-xs text-muted-foreground">
            {calloutSim.completedEvents.length} of 4 callouts
          </span>
        )}
      </div>

      {/* Live callout cards */}
      {calloutSim.completedEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Pre-Shift Callouts (Live)
          </p>
          {calloutSim.completedEvents.map((event) => (
            <div
              key={event.guardId}
              className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {event.siteName}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {event.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {event.guardName} — {event.reason}
                  </p>
                </div>
              </div>
              <button
                onClick={() => speak(event.voiceText)}
                disabled={isPlaying}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40"
                title="Replay voice"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Total Call-Outs" value={callOuts.length} />
        <StatCard label="Avg Fill Time" value={`${avgFill}m`} />
        <StatCard label="Unresolved" value={unresolvedCount} />
        <StatCard label="Armed Call-Outs" value={armedCount} />
        <StatCard
          label="Est. Cost Impact"
          value={`$${totalCost.toLocaleString()}`}
        />
      </div>

      {/* Response time comparison */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Response Time Comparison
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
            <Clock className="h-5 w-5 text-warning shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Manual avg</p>
              <p className="text-lg font-bold text-warning">34 min</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <Zap className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">Pegasus avg</p>
              <p className="text-lg font-bold text-primary">5 min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {rangeView === "week" ? "Weekly" : "8-Week"} Distribution
        </p>
        <div className="flex items-end gap-3 h-32">
          {DAYS.map((d) => {
            const cnt = callOuts.filter((c) => c.day === d).length;
            const isWknd = ["Fri", "Sat", "Sun"].includes(d);
            const active = dayFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDayFilter(d === dayFilter ? "All" : d)}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div
                  className="relative w-full flex items-end justify-center"
                  style={{ height: 96 }}
                >
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t transition-all",
                      active
                        ? "bg-primary"
                        : isWknd
                          ? "bg-warning/40"
                          : "bg-secondary",
                    )}
                    style={{
                      height: `${(cnt / maxBar) * 100}%`,
                      minHeight: cnt > 0 ? 8 : 0,
                    }}
                  />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {d}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setDayFilter("All")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            dayFilter === "All"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {DAYS.map((d) => {
          const cnt = callOuts.filter((c) => c.day === d).length;
          if (cnt === 0) return null;
          return (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                dayFilter === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {d} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Call-out cards */}
      <div className="space-y-2">
        {filtered.map((co, i) => {
          const cost = calloutCost(co);
          return (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                {co.resolved ? (
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {co.site}
                    </span>
                    {co.armed && (
                      <Badge
                        variant="outline"
                        className="border-armed/30 bg-armed/10 text-armed text-[10px] px-1.5 py-0"
                      >
                        ARMED
                      </Badge>
                    )}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      ${cost}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {co.day} {co.time} · {co.guard} called out
                    {co.by ? ` · Filled by ${co.by}` : ""}
                  </p>
                </div>
              </div>
              <div>
                {co.resolved && co.fill != null ? (
                  <span
                    className={cn(
                      "font-mono text-xs font-semibold",
                      co.fill > 30 ? "text-warning" : "text-success",
                    )}
                  >
                    {co.fill}m
                  </span>
                ) : (
                  <Badge variant="destructive" className="text-[10px]">
                    UNRESOLVED
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
