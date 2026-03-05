import { useGuards } from "@/hooks/use-guards";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Shield, Info } from "lucide-react";

export default function GuardPoolView() {
  const { data: guards, isLoading, error, refetch } = useGuards();

  if (isLoading) {
    return <QueryLoading message="Loading guard pool..." />;
  }

  if (error) {
    return <QueryError message={error.message} onRetry={refetch} />;
  }

  if (!guards || guards.length === 0) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total Guards" value={0} />
          <StatCard label="Armed" value={0} />
          <StatCard label="At Capacity" value={0} />
          <StatCard label="On Duty" value={0} />
        </div>
        <p className="text-center text-sm text-muted-foreground py-8">
          No guards in the pool.
        </p>
      </div>
    );
  }

  const activeGuards = guards.filter((g) => g.status !== "inactive");
  const armedCount = guards.filter((g) => g.armed).length;
  const cappedCount = guards.filter((g) => g.hrs >= g.max).length;
  const onDutyCount = guards.filter((g) => g.status === "on-duty").length;

  const sorted = [...activeGuards].sort((a, b) => b.grs - a.grs);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Guards" value={activeGuards.length} />
        <StatCard label="Armed" value={armedCount} />
        <StatCard label="At Capacity" value={cappedCount} />
        <StatCard label="On Duty" value={onDutyCount} />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[40px_1fr_120px_60px_120px_90px] gap-2 border-b border-border px-4 py-2.5">
          {["#", "Guard", "Role", "GRS", "Hours", "Status"].map((h) => (
            <p
              key={h}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((g, i) => (
          <div
            key={g.id}
            className="grid grid-cols-[40px_1fr_120px_60px_120px_90px] gap-2 items-center border-b border-border/50 px-4 py-2.5 hover:bg-secondary/30 transition-colors"
          >
            <p className="font-mono text-xs text-muted-foreground">{i + 1}</p>
            <div>
              <p className="text-sm font-medium text-foreground">{g.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                #{g.id}
              </p>
            </div>
            <div>
              {g.armed ? (
                <Badge
                  variant="outline"
                  className="border-armed/30 bg-armed/10 text-armed text-[10px] px-1.5 py-0"
                >
                  <Shield className="mr-1 h-3 w-3" /> Armed
                </Badge>
              ) : g.role === "Supervisor" ? (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-primary text-[10px] px-1.5 py-0"
                >
                  Supervisor
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Unarmed</span>
              )}
            </div>
            <p
              className={cn(
                "font-mono text-sm font-bold",
                g.grs >= 90
                  ? "text-success"
                  : g.grs >= 80
                    ? "text-info"
                    : g.grs >= 70
                      ? "text-warning"
                      : "text-muted-foreground",
              )}
            >
              {g.grs}
            </p>
            <div className="space-y-1">
              <p className="font-mono text-[11px] text-muted-foreground">
                {g.hrs}/{g.max}
              </p>
              <Progress value={(g.hrs / g.max) * 100} className="h-1.5" />
            </div>
            <div>
              <span
                className={cn(
                  "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium",
                  g.status === "on-duty" && "bg-success/10 text-success",
                  g.status === "off-duty" &&
                    "bg-secondary text-muted-foreground",
                  g.status === "training" && "bg-info/10 text-info",
                )}
              >
                {g.status === "on-duty"
                  ? "On Duty"
                  : g.status === "training"
                    ? "Training"
                    : "Off Duty"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cascade rules */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Cascade Rules</p>
        </div>
        <ul className="space-y-1.5 text-xs text-muted-foreground">
          <li>
            <span className="text-foreground font-medium">Armed filter</span> —
            armed sites cascade only to armed-certified guards
          </li>
          <li>
            <span className="text-foreground font-medium">Rest</span> — 8hr
            minimum since last clock-out
          </li>
          <li>
            <span className="text-foreground font-medium">Overtime</span> — 40hr
            weekly cap, no assignments beyond
          </li>
          <li>
            <span className="text-foreground font-medium">Rank</span> — GRS
            score &rarr; hours under cap &rarr; preference match
          </li>
          <li>
            <span className="text-foreground font-medium">Urgency</span> — time
            uncovered &times; tier weight (A = 3&times;, B = 2&times;)
          </li>
        </ul>
      </div>
    </div>
  );
}
