import { useState, useMemo, useEffect, useCallback } from "react";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { useSites } from "@/hooks/use-sites";
import { useGuards } from "@/hooks/use-guards";
import { useSchedule } from "@/hooks/use-schedule";
import { useRovers } from "@/hooks/use-rovers";
import { useThermsScans } from "@/hooks/use-therms-scan";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { cn } from "@/lib/utils";
import { RoverStrip } from "@/components/board/RoverStrip";
import { GuardCard } from "@/components/board/GuardCard";
import { GuardDetailPanel } from "@/components/board/GuardDetailPanel";
import { ScanComplianceSummary } from "@/components/board/ScanComplianceSummary";
import type { Site, Guard, ScheduleEntry, Rover } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BoardFilter = "all" | "armed" | "at-risk" | "overdue";

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
  siteStatuses?: ReadonlyMap<
    number,
    {
      guardCheckedIn: boolean;
      status: string;
      coveredBy: string | null;
      connectTeamsConfirmed: boolean;
    }
  >,
): readonly BoardRow[] {
  const guardMap = new Map(guards.map((g) => [g.id, g]));
  const scheduleMap = new Map(schedule.map((s) => [s.siteId, s]));

  return sites.map((site) => {
    const entry = scheduleMap.get(site.id) ?? null;
    const guard = entry ? (guardMap.get(entry.guardId) ?? null) : null;
    const simStatus = siteStatuses?.get(site.id);
    const confirmed =
      simStatus?.connectTeamsConfirmed ?? entry?.connectTeamsConfirmed ?? false;
    const checkedIn = simStatus?.guardCheckedIn ?? false;
    const covered = guard !== null;

    return { site, guard, schedule: entry, confirmed, checkedIn, covered };
  });
}

function getRowStatus(
  row: BoardRow,
): "confirmed" | "unconfirmed" | "uncovered" {
  if (!row.covered) return "uncovered";
  if (row.confirmed) return "confirmed";
  return "unconfirmed";
}

function filterRows(
  rows: readonly BoardRow[],
  filter: BoardFilter,
  overdueGuardIds: ReadonlySet<number>,
): readonly BoardRow[] {
  switch (filter) {
    case "armed":
      return rows.filter((r) => r.site.armed);
    case "at-risk":
      return rows.filter((r) => !r.confirmed || !r.covered);
    case "overdue":
      return rows.filter(
        (r) => r.guard !== null && overdueGuardIds.has(r.guard.id),
      );
    default:
      return rows;
  }
}

function sortRows(rows: readonly BoardRow[]): readonly BoardRow[] {
  const priority: Record<string, number> = {
    uncovered: 0,
    unconfirmed: 1,
    confirmed: 2,
  };
  return [...rows].sort(
    (a, b) =>
      (priority[getRowStatus(a)] ?? 2) - (priority[getRowStatus(b)] ?? 2),
  );
}

/** Extract unique guard IDs from the schedule. */
function extractGuardIds(schedule: readonly ScheduleEntry[]): readonly number[] {
  const seen = new Set<number>();
  const ids: number[] = [];
  for (const entry of schedule) {
    if (!seen.has(entry.guardId)) {
      seen.add(entry.guardId);
      ids.push(entry.guardId);
    }
  }
  return ids;
}

/** Build a map from guardId -> site for quick lookup. */
function buildGuardSiteMap(
  schedule: readonly ScheduleEntry[],
  sites: readonly Site[],
): ReadonlyMap<number, Site> {
  const siteMap = new Map(sites.map((s) => [s.id, s]));
  const result = new Map<number, Site>();
  for (const entry of schedule) {
    const site = siteMap.get(entry.siteId);
    if (site) {
      result.set(entry.guardId, site);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Filter pills
// ---------------------------------------------------------------------------

interface FilterPillsProps {
  readonly filter: BoardFilter;
  readonly onFilterChange: (f: BoardFilter) => void;
  readonly atRiskCount: number;
  readonly armedCount: number;
  readonly overdueCount: number;
  readonly totalCount: number;
}

function FilterPills({
  filter,
  onFilterChange,
  atRiskCount,
  armedCount,
  overdueCount,
  totalCount,
}: FilterPillsProps) {
  const pills: readonly {
    id: BoardFilter;
    label: string;
    variant?: "destructive";
  }[] = [
    { id: "all", label: `All ${totalCount}` },
    { id: "armed", label: `Armed ${armedCount}` },
    { id: "at-risk", label: `At Risk ${atRiskCount}`, variant: "destructive" },
    { id: "overdue", label: `Overdue ${overdueCount}`, variant: "destructive" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
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
  const { simulation } = usePegasusContext();

  // Detail panel state
  const [selectedGuardId, setSelectedGuardId] = useState<number | null>(null);

  // Extract unique guard IDs for THERMS simulation
  const guardIds = useMemo(() => extractGuardIds(schedule), [schedule]);

  // THERMS scan simulation
  const { scanStates, allScans, isRunning, start } = useThermsScans(guardIds);

  // Auto-start scan simulation on mount
  useEffect(() => {
    if (!isRunning) {
      start();
    }
    // Only start once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build board rows
  const boardRows = useMemo(
    () => buildBoardRows(sites, guards, schedule, simulation.siteStatuses),
    [sites, guards, schedule, simulation.siteStatuses],
  );

  // Guard -> site mapping
  const guardSiteMap = useMemo(
    () => buildGuardSiteMap(schedule, sites),
    [schedule, sites],
  );

  // Computed counts
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

  // Overdue guard IDs (scan status === "overdue")
  const overdueGuardIds = useMemo(() => {
    const ids = new Set<number>();
    for (const [guardId, state] of scanStates) {
      if (state.status === "overdue") {
        ids.add(guardId);
      }
    }
    return ids;
  }, [scanStates]);

  const overdueCount = overdueGuardIds.size;

  // Filtered + sorted rows
  const filteredRows = useMemo(
    () => sortRows(filterRows(boardRows, filter, overdueGuardIds)),
    [boardRows, filter, overdueGuardIds],
  );

  // Selected guard data for detail panel
  const selectedGuard = useMemo(
    () => (selectedGuardId !== null
      ? guards.find((g) => g.id === selectedGuardId) ?? null
      : null),
    [guards, selectedGuardId],
  );

  const selectedSite = useMemo(
    () => (selectedGuardId !== null
      ? guardSiteMap.get(selectedGuardId) ?? null
      : null),
    [guardSiteMap, selectedGuardId],
  );

  const selectedScanState = selectedGuardId !== null
    ? scanStates.get(selectedGuardId)
    : undefined;

  // Handlers
  const handleCardClick = useCallback((guardId: number) => {
    setSelectedGuardId(guardId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedGuardId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Sites" value={sites.length} />
        <StatCard label="Confirmed (CT)" value={confirmedCount} />
        <StatCard label="Checked In" value={checkedInCount} />
        <StatCard label="At Risk" value={atRiskCount} />
      </div>

      {/* THERMS scan compliance summary */}
      <ScanComplianceSummary
        scanStates={scanStates}
        totalScans={allScans.length}
      />

      {/* Filter pills */}
      <FilterPills
        filter={filter}
        onFilterChange={onFilterChange}
        atRiskCount={atRiskCount}
        armedCount={armedCount}
        overdueCount={overdueCount}
        totalCount={sites.length}
      />

      <RoverStrip rovers={rovers} />

      {/* Guard card grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredRows.map((row) => {
          if (!row.guard) return null;

          const guardId = row.guard.id;
          const scanState = scanStates.get(guardId);

          return (
            <GuardCard
              key={row.site.id}
              guard={row.guard}
              scanState={scanState}
              siteName={row.site.name}
              onClick={() => handleCardClick(guardId)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No guards match the current filter.
          </p>
        </div>
      )}

      {/* Guard detail slide-out panel */}
      <GuardDetailPanel
        guard={selectedGuard}
        site={selectedSite}
        scanState={selectedScanState}
        open={selectedGuardId !== null}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
