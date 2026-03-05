import { useState, useMemo } from "react";
import { useSites } from "@/hooks/use-sites";
import { useGuards } from "@/hooks/use-guards";
import { useSchedule } from "@/hooks/use-schedule";
import { useRovers } from "@/hooks/use-rovers";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Clock, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Site, Guard, ScheduleEntry, Rover } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BoardFilter = "all" | "armed" | "at-risk";

interface BoardRow {
  readonly site: Site;
  readonly guard: Guard | null;
  readonly schedule: ScheduleEntry | null;
  readonly confirmed: boolean;
  readonly checkedIn: boolean;
  readonly covered: boolean;
}

// ---------------------------------------------------------------------------
// Helpers (pure functions)
// ---------------------------------------------------------------------------

function buildBoardRows(
  sites: readonly Site[],
  guards: readonly Guard[],
  schedule: readonly ScheduleEntry[],
): readonly BoardRow[] {
  const guardMap = new Map(guards.map((g) => [g.id, g]));
  const scheduleMap = new Map(schedule.map((s) => [s.siteId, s]));

  return sites.map((site) => {
    const entry = scheduleMap.get(site.id) ?? null;
    const guard = entry ? (guardMap.get(entry.guardId) ?? null) : null;
    const confirmed = entry?.connectTeamsConfirmed ?? false;
    // Pre-simulation: no one has checked in yet
    const checkedIn = false;
    const covered = guard !== null;

    return { site, guard, schedule: entry, confirmed, checkedIn, covered };
  });
}

function getRowBorderColor(row: BoardRow): string {
  if (!row.covered) return "border-l-destructive";
  if (row.confirmed && row.checkedIn) return "border-l-success";
  if (!row.confirmed) return "border-l-warning";
  return "border-l-border";
}

function getRowStatus(row: BoardRow): "confirmed" | "unconfirmed" | "uncovered" {
  if (!row.covered) return "uncovered";
  if (row.confirmed) return "confirmed";
  return "unconfirmed";
}

function filterRows(rows: readonly BoardRow[], filter: BoardFilter): readonly BoardRow[] {
  switch (filter) {
    case "armed":
      return rows.filter((r) => r.site.armed);
    case "at-risk":
      return rows.filter((r) => !r.confirmed || !r.covered);
    default:
      return rows;
  }
}

function sortRows(rows: readonly BoardRow[]): readonly BoardRow[] {
  const priority: Record<string, number> = { uncovered: 0, unconfirmed: 1, confirmed: 2 };
  return [...rows].sort(
    (a, b) => (priority[getRowStatus(a)] ?? 2) - (priority[getRowStatus(b)] ?? 2),
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface PhoneButtonProps {
  readonly phone: string | undefined;
  readonly label: string;
}

function PhoneButton({ phone, label }: PhoneButtonProps) {
  if (!phone) return null;

  return (
    <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-xs" asChild>
      <a href={`tel:${phone}`} aria-label={`Call ${label}`}>
        <Phone className="h-3 w-3" />
        {label}
      </a>
    </Button>
  );
}

interface SiteRowCardProps {
  readonly row: BoardRow;
  readonly roverPhone: string | undefined;
}

function SiteRowCard({ row, roverPhone }: SiteRowCardProps) {
  const { site, guard, confirmed } = row;
  const borderColor = getRowBorderColor(row);
  const status = getRowStatus(row);

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 border border-border bg-card px-4 py-3 transition-colors hover:border-border/80",
        borderColor,
      )}
    >
      {/* Top row: site info + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{site.name}</span>
            {site.armed && (
              <Badge
                variant="outline"
                className="border-armed/30 bg-armed/10 text-armed text-[10px] px-1.5 py-0"
              >
                Armed
              </Badge>
            )}
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] px-1.5 py-0",
                site.tier === "A"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-muted-foreground/30 bg-muted text-muted-foreground",
              )}
            >
              {site.tier}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{site.addr}</p>
        </div>

        {/* Status indicator */}
        <div className="flex-shrink-0">
          {status === "uncovered" && (
            <Badge variant="destructive" className="text-[10px]">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Uncovered
            </Badge>
          )}
        </div>
      </div>

      {/* Guard assignment + CT status */}
      <div className="mt-2 flex items-center gap-2">
        {guard ? (
          <>
            <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm text-foreground">{guard.name}</span>
            {confirmed ? (
              <CheckCircle className="h-3.5 w-3.5 text-success" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-warning" />
            )}
            <span className={cn("text-[10px]", confirmed ? "text-success" : "text-warning")}>
              {confirmed ? "CT Confirmed" : "CT Pending"}
            </span>
          </>
        ) : (
          <span className="text-sm italic text-muted-foreground">No guard assigned</span>
        )}
      </div>

      {/* Phone buttons */}
      <div className="mt-2 flex gap-1">
        <PhoneButton phone={site.phone} label="Site" />
        <PhoneButton phone={guard?.phone} label="Guard" />
        <PhoneButton phone={roverPhone} label="Rover" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter pills
// ---------------------------------------------------------------------------

interface FilterPillsProps {
  readonly filter: BoardFilter;
  readonly onFilterChange: (f: BoardFilter) => void;
  readonly atRiskCount: number;
  readonly armedCount: number;
  readonly totalCount: number;
}

function FilterPills({ filter, onFilterChange, atRiskCount, armedCount, totalCount }: FilterPillsProps) {
  const pills: readonly { id: BoardFilter; label: string; variant?: "destructive" }[] = [
    { id: "all", label: `All ${totalCount}` },
    { id: "armed", label: `Armed ${armedCount}` },
    { id: "at-risk", label: `At Risk ${atRiskCount}`, variant: "destructive" },
  ];

  return (
    <div className="flex gap-2">
      {pills.map((p) => (
        <button
          key={p.id}
          onClick={() => onFilterChange(p.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            filter === p.id
              ? p.variant === "destructive"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export default function TonightsBoardView() {
  const [filter, setFilter] = useState<BoardFilter>("all");

  const {
    data: sites,
    isLoading: sitesLoading,
    error: sitesError,
    refetch: refetchSites,
  } = useSites();

  const {
    data: guards,
    isLoading: guardsLoading,
    error: guardsError,
    refetch: refetchGuards,
  } = useGuards();

  const {
    data: schedule,
    isLoading: scheduleLoading,
    error: scheduleError,
    refetch: refetchSchedule,
  } = useSchedule();

  const {
    data: rovers,
    isLoading: roversLoading,
    error: roversError,
    refetch: refetchRovers,
  } = useRovers();

  // Loading state
  if (sitesLoading || guardsLoading || scheduleLoading || roversLoading) {
    return <QueryLoading message="Loading tonight's board..." />;
  }

  // Error state
  const firstError = sitesError ?? guardsError ?? scheduleError ?? roversError;
  if (firstError) {
    return (
      <QueryError
        message={firstError.message}
        onRetry={() => {
          refetchSites();
          refetchGuards();
          refetchSchedule();
          refetchRovers();
        }}
      />
    );
  }

  // No data
  if (!sites || !guards || !schedule || !rovers) {
    return <QueryError message="No data available" />;
  }

  return (
    <TonightsBoardContent
      sites={sites}
      guards={guards}
      schedule={schedule}
      rovers={rovers}
      filter={filter}
      onFilterChange={setFilter}
    />
  );
}

// ---------------------------------------------------------------------------
// Content (separated so hooks are above conditionals)
// ---------------------------------------------------------------------------

interface TonightsBoardContentProps {
  readonly sites: readonly Site[];
  readonly guards: readonly Guard[];
  readonly schedule: readonly ScheduleEntry[];
  readonly rovers: readonly Rover[];
  readonly filter: BoardFilter;
  readonly onFilterChange: (f: BoardFilter) => void;
}

function TonightsBoardContent({
  sites,
  guards,
  schedule,
  rovers,
  filter,
  onFilterChange,
}: TonightsBoardContentProps) {
  const boardRows = useMemo(
    () => buildBoardRows(sites, guards, schedule),
    [sites, guards, schedule],
  );

  const confirmedCount = useMemo(
    () => boardRows.filter((r) => r.confirmed).length,
    [boardRows],
  );

  const checkedInCount = useMemo(
    () => boardRows.filter((r) => r.checkedIn).length,
    [boardRows],
  );

  const atRiskCount = useMemo(
    () => boardRows.filter((r) => !r.confirmed || !r.covered).length,
    [boardRows],
  );

  const armedCount = useMemo(
    () => boardRows.filter((r) => r.site.armed).length,
    [boardRows],
  );

  const filteredRows = useMemo(
    () => sortRows(filterRows(boardRows, filter)),
    [boardRows, filter],
  );

  // Use the first rover's phone as the default rover contact
  const defaultRoverPhone = rovers.length > 0 ? rovers[0].phone : undefined;

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Sites" value={sites.length} />
        <StatCard label="Confirmed (CT)" value={confirmedCount} />
        <StatCard label="Checked In" value={checkedInCount} />
        <StatCard label="At Risk" value={atRiskCount} />
      </div>

      {/* Filter pills */}
      <FilterPills
        filter={filter}
        onFilterChange={onFilterChange}
        atRiskCount={atRiskCount}
        armedCount={armedCount}
        totalCount={sites.length}
      />

      {/* Site list */}
      <div className="space-y-2">
        {filteredRows.map((row) => (
          <SiteRowCard key={row.site.id} row={row} roverPhone={defaultRoverPhone} />
        ))}
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No sites match the current filter.</p>
        </div>
      )}
    </div>
  );
}
