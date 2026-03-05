import { useGuards } from "@/hooks/use-guards";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Shield, Info, Phone, AlertTriangle } from "lucide-react";

function formatFamiliarity(
  familiarity: { siteName: string; visits: number }[],
): { name: string; visits: number }[] {
  return [...familiarity]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 3)
    .map((f) => ({ name: f.siteName, visits: f.visits }));
}

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
        <div className="grid grid-cols-[40px_1fr_120px_60px_120px_1fr_90px_40px] gap-2 border-b border-border px-4 py-2.5">
          {["#", "Guard", "Role", "GRS", "Hours", "Site Familiarity", "Status", ""].map((h) => (
            <p
              key={h || "phone"}
              className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
            >
              {h}
            </p>
          ))}
        </div>

        {/* Rows */}
        {sorted.map((g, i) => {
          const hasCalloutPattern =
            g.calloutHistory && g.calloutHistory.length >= 3;
          const topSites = g.familiarity
            ? formatFamiliarity(g.familiarity)
            : [];

          return (
            <div
              key={g.id}
              className="grid grid-cols-[40px_1fr_120px_60px_120px_1fr_90px_40px] gap-2 items-center border-b border-border/50 px-4 py-2.5 hover:bg-secondary/30 transition-colors"
            >
              <p className="font-mono text-xs text-muted-foreground">
                {i + 1}
              </p>
              <div className="flex items-center gap-1.5">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {g.name}
                    </p>
                    {hasCalloutPattern && (
                      <span title="Callout pattern detected">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    #{g.id}
                  </p>
                </div>
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
              {/* Site Familiarity */}
              <div className="min-w-0">
                {topSites.length > 0 ? (
                  <p className="text-[11px] text-foreground truncate">
                    {topSites.map((s, idx) => (
                      <span key={s.name}>
                        {idx > 0 && ", "}
                        {s.name}{" "}
                        <span className="text-muted-foreground">({s.visits})</span>
                      </span>
                    ))}
                  </p>
                ) : (
                  <span className="text-[11px] text-muted-foreground">--</span>
                )}
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
              {/* Phone */}
              <div className="flex justify-center">
                {g.phone ? (
                  <a
                    href={`tel:${g.phone}`}
                    className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                    title={`Call ${g.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <span className="text-muted-foreground/40">
                    <Phone className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
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
