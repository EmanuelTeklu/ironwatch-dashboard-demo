import { useState } from "react";
import { CALLOUTS, DAYS } from "@/lib/data";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function CallOutsView() {
  const [dayFilter, setDayFilter] = useState("All");

  const filtered = dayFilter === "All" ? CALLOUTS : CALLOUTS.filter((c) => c.day === dayFilter);
  const avgFill = Math.round(
    CALLOUTS.filter((c) => c.fill).reduce((a, c) => a + (c.fill || 0), 0) /
      CALLOUTS.filter((c) => c.fill).length
  );
  const unresolvedCount = CALLOUTS.filter((c) => !c.resolved).length;
  const armedCount = CALLOUTS.filter((c) => c.armed).length;

  const maxBar = Math.max(...DAYS.map((d) => CALLOUTS.filter((c) => c.day === d).length), 1);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Call-Outs" value={CALLOUTS.length} />
        <StatCard label="Avg Fill Time" value={`${avgFill}m`} />
        <StatCard label="Unresolved" value={unresolvedCount} />
        <StatCard label="Armed Call-Outs" value={armedCount} />
      </div>

      {/* Bar chart */}
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Weekly Distribution
        </p>
        <div className="flex items-end gap-3 h-32">
          {DAYS.map((d) => {
            const cnt = CALLOUTS.filter((c) => c.day === d).length;
            const isWknd = ["Fri", "Sat", "Sun"].includes(d);
            const active = dayFilter === d;
            return (
              <button
                key={d}
                onClick={() => setDayFilter(d === dayFilter ? "All" : d)}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <div className="relative w-full flex items-end justify-center" style={{ height: 96 }}>
                  <div
                    className={cn(
                      "w-full max-w-8 rounded-t transition-all",
                      active
                        ? "bg-primary"
                        : isWknd
                        ? "bg-warning/40"
                        : "bg-secondary"
                    )}
                    style={{ height: `${(cnt / maxBar) * 100}%`, minHeight: cnt > 0 ? 8 : 0 }}
                  />
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground"
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
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          All
        </button>
        {DAYS.map((d) => {
          const cnt = CALLOUTS.filter((c) => c.day === d).length;
          if (cnt === 0) return null;
          return (
            <button
              key={d}
              onClick={() => setDayFilter(d)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                dayFilter === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {d} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Call-out cards */}
      <div className="space-y-2">
        {filtered.map((co, i) => (
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
                  <span className="text-sm font-medium text-foreground">{co.site}</span>
                  {co.armed && (
                    <Badge variant="outline" className="border-armed/30 bg-armed/10 text-armed text-[10px] px-1.5 py-0">
                      ARMED
                    </Badge>
                  )}
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
                    co.fill > 30 ? "text-warning" : "text-success"
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
        ))}
      </div>
    </div>
  );
}
