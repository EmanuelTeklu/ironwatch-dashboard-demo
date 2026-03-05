import { useState } from "react";
import { useSites } from "@/hooks/use-sites";
import { useGuards } from "@/hooks/use-guards";
import { QueryLoading, QueryError } from "@/components/QueryState";
import type { SiteRow } from "@/lib/types";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Filter = "all" | "armed" | "alert";

export default function SitesView() {
  const [filter, setFilter] = useState<Filter>("all");
  const { data: sites, isLoading: sitesLoading, error: sitesError, refetch: refetchSites } = useSites();
  const { data: guards, isLoading: guardsLoading, error: guardsError, refetch: refetchGuards } = useGuards();

  if (sitesLoading || guardsLoading) {
    return <QueryLoading message="Loading sites..." />;
  }

  if (sitesError || guardsError) {
    return (
      <QueryError
        message={sitesError?.message ?? guardsError?.message ?? "Unknown error"}
        onRetry={() => { refetchSites(); refetchGuards(); }}
      />
    );
  }

  if (!sites || !guards) {
    return <QueryError message="No data available" />;
  }

  const siteRows: SiteRow[] = sites.map((s, i) => {
    const g = guards[i % guards.length];
    let st: SiteRow["st"] = "covered";
    if (i === 5) st = "confirming";
    return {
      ...s,
      guardName: g?.name ?? null,
      st,
      clockIn: st === "covered" ? `${22 + (i % 3)}:${String((i * 7) % 60).padStart(2, "0")}` : null,
    };
  });

  const filtered = siteRows
    .filter((s) => {
      if (filter === "armed") return s.armed;
      if (filter === "alert") return s.st !== "covered";
      return true;
    })
    .sort((a, b) => {
      const p: Record<string, number> = { alert: 0, confirming: 1, covered: 2 };
      return (p[a.st] ?? 2) - (p[b.st] ?? 2);
    });

  const coveredCount = siteRows.filter((s) => s.st === "covered").length;
  const armedCount = sites.filter((s) => s.armed).length;
  const alertCount = siteRows.filter((s) => s.st !== "covered").length;

  const pills: { id: Filter; label: string; variant?: "destructive" }[] = [
    { id: "all", label: `All ${sites.length}` },
    { id: "armed", label: "Armed" },
    { id: "alert", label: "Alerts", variant: "destructive" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Sites" value={sites.length} />
        <StatCard label="Covered" value={coveredCount} />
        <StatCard label="Armed" value={armedCount} />
        <StatCard label="Alerts" value={alertCount} />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              filter === p.id
                ? p.variant === "destructive"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Site list */}
      <div className="space-y-2">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-border/80"
          >
            <div className="flex items-center gap-3">
              <StatusDot status={s.st} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{s.name}</span>
                  {s.armed && (
                    <Badge variant="outline" className="border-armed/30 bg-armed/10 text-armed text-[10px] px-1.5 py-0">
                      ARMED
                    </Badge>
                  )}
                  {s.tier === "A" && (
                    <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px] px-1.5 py-0">
                      TIER A
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{s.addr}</p>
              </div>
            </div>
            <div className="text-right">
              {s.st === "covered" && (
                <p className="text-sm text-foreground">{s.guardName}</p>
              )}
              {s.st === "confirming" && (
                <Badge variant="outline" className="border-ai/30 bg-ai/10 text-ai text-[10px]">
                  CONFIRMING
                </Badge>
              )}
              {s.st === "alert" && (
                <Badge variant="destructive" className="text-[10px]">
                  UNCOVERED
                </Badge>
              )}
              {s.clockIn && (
                <p className="font-mono text-[11px] text-muted-foreground">{s.clockIn}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDot({ status }: { status: SiteRow["st"] }) {
  return (
    <div className="relative flex h-3 w-3 items-center justify-center">
      <div
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          status === "covered" && "bg-success",
          status === "confirming" && "bg-ai",
          status === "alert" && "bg-destructive"
        )}
      />
      {status === "alert" && (
        <div className="absolute inset-0 rounded-full bg-destructive animate-pulse-ring" />
      )}
    </div>
  );
}
