import { useState, useMemo, useEffect, useCallback } from "react";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { useSites } from "@/hooks/use-sites";
import { useGuards } from "@/hooks/use-guards";
import { useSchedule } from "@/hooks/use-schedule";
import { useRovers } from "@/hooks/use-rovers";
import { useThermsScans } from "@/hooks/use-therms-scan";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { cn } from "@/lib/utils";
import { RoverStrip } from "@/components/board/RoverStrip";
import { SiteCard } from "@/components/board/SiteCard";
import { SiteDetailPanel } from "@/components/board/SiteDetailPanel";
import { ScanComplianceSummary } from "@/components/board/ScanComplianceSummary";
import { OperationalMetricsBar } from "@/components/board/OperationalMetricsBar";
import type {
  Site,
  Guard,
  ScheduleEntry,
  Rover,
  SiteBoardCard,
  SiteBoardStatus,
} from "@/lib/types";
import type { SiteSimStatus } from "@/lib/simulation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BoardFilter = "all" | "armed" | "at-risk" | "callouts";

// ---------------------------------------------------------------------------
// Helpers (pure functions)
// ---------------------------------------------------------------------------

const STATUS_PRIORITY: Record<SiteBoardStatus, number> = {
  callout: 0,
  uncovered: 1,
  unconfirmed: 2,
  "late-checkin": 3,
  confirmed: 4,
};

function deriveBoardStatus(
  guard: Guard | null,
  confirmed: boolean,
  checkedIn: boolean,
  simStatus: SiteSimStatus | undefined,
): SiteBoardStatus {
  if (simStatus?.calloutActive) return "callout";
  if (!guard) return "uncovered";
  if (!confirmed) return "unconfirmed";
  if (simStatus?.status === "yellow" && !checkedIn) return "late-checkin";
  return "confirmed";
}

function buildSiteBoardCards(
  sites: readonly Site[],
  guards: readonly Guard[],
  schedule: readonly ScheduleEntry[],
  siteStatuses?: ReadonlyMap<number, SiteSimStatus>,
): readonly SiteBoardCard[] {
  const guardMap = new Map(guards.map((g) => [g.id, g]));
  const scheduleMap = new Map(schedule.map((s) => [s.siteId, s]));

  return sites.map((site) => {
    const entry = scheduleMap.get(site.id) ?? null;
    const guard = entry ? (guardMap.get(entry.guardId) ?? null) : null;
    const simStatus = siteStatuses?.get(site.id);
    const confirmed =
      simStatus?.connectTeamsConfirmed ?? entry?.connectTeamsConfirmed ?? false;
    const checkedIn = simStatus?.guardCheckedIn ?? false;
    const status = deriveBoardStatus(guard, confirmed, checkedIn, simStatus);

    return {
      site,
      guard,
      confirmed,
      checkedIn,
      status,
      calloutActive: simStatus?.calloutActive ?? false,
      calloutReason: simStatus?.calloutReason ?? null,
      guardResponse: simStatus?.guardResponse ?? null,
      fillTime: simStatus?.fillTimeMinutes ?? null,
      replacementGuard: simStatus?.coveredBy ?? null,
    };
  });
}

function filterCards(
  cards: readonly SiteBoardCard[],
  filter: BoardFilter,
): readonly SiteBoardCard[] {
  switch (filter) {
    case "armed":
      return cards.filter((c) => c.site.armed);
    case "at-risk":
      return cards.filter((c) => c.status !== "confirmed");
    case "callouts":
      return cards.filter((c) => c.calloutActive);
    default:
      return cards;
  }
}

function sortCards(cards: readonly SiteBoardCard[]): readonly SiteBoardCard[] {
  return [...cards].sort(
    (a, b) => (STATUS_PRIORITY[a.status] ?? 4) - (STATUS_PRIORITY[b.status] ?? 4),
  );
}

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

// ---------------------------------------------------------------------------
// Filter pills
// ---------------------------------------------------------------------------

interface FilterPillsProps {
  readonly filter: BoardFilter;
  readonly onFilterChange: (f: BoardFilter) => void;
  readonly counts: {
    readonly total: number;
    readonly armed: number;
    readonly atRisk: number;
    readonly callouts: number;
  };
}

function FilterPills({ filter, onFilterChange, counts }: FilterPillsProps) {
  const pills: readonly {
    id: BoardFilter;
    label: string;
    variant?: "destructive";
  }[] = [
    { id: "all", label: `All Sites ${counts.total}` },
    { id: "armed", label: `Armed ${counts.armed}` },
    { id: "at-risk", label: `At Risk ${counts.atRisk}`, variant: "destructive" },
    { id: "callouts", label: `Callouts ${counts.callouts}`, variant: "destructive" },
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

  if (sitesLoading || guardsLoading || scheduleLoading || roversLoading) {
    return <QueryLoading message="Loading tonight's board..." />;
  }

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

  // Detail panel state — tracks selected site ID
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  // Extract unique guard IDs for THERMS simulation
  const guardIds = useMemo(() => extractGuardIds(schedule), [schedule]);

  // THERMS scan simulation
  const { scanStates, allScans, isRunning, start } = useThermsScans(guardIds);

  // Auto-start scan simulation on mount
  useEffect(() => {
    if (!isRunning) {
      start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build site board cards
  const boardCards = useMemo(
    () => buildSiteBoardCards(sites, guards, schedule, simulation.siteStatuses),
    [sites, guards, schedule, simulation.siteStatuses],
  );

  // Guard -> scanState lookup via schedule
  const guardScanMap = useMemo(() => {
    const scheduleMap = new Map(schedule.map((s) => [s.siteId, s]));
    const result = new Map<number, number>(); // siteId -> guardId
    for (const entry of scheduleMap.values()) {
      result.set(entry.siteId, entry.guardId);
    }
    return result;
  }, [schedule]);

  // Computed counts
  const counts = useMemo(() => {
    const atRisk = boardCards.filter((c) => c.status !== "confirmed").length;
    const armed = boardCards.filter((c) => c.site.armed).length;
    const callouts = boardCards.filter((c) => c.calloutActive).length;
    return { total: boardCards.length, armed, atRisk, callouts };
  }, [boardCards]);

  // Filtered + sorted cards
  const displayCards = useMemo(
    () => sortCards(filterCards(boardCards, filter)),
    [boardCards, filter],
  );

  // Selected card for detail panel
  const selectedCard = useMemo(
    () =>
      selectedSiteId !== null
        ? boardCards.find((c) => c.site.id === selectedSiteId) ?? null
        : null,
    [boardCards, selectedSiteId],
  );

  const selectedScanState = useMemo(() => {
    if (selectedSiteId === null) return undefined;
    const guardId = guardScanMap.get(selectedSiteId);
    return guardId != null ? scanStates.get(guardId) : undefined;
  }, [selectedSiteId, guardScanMap, scanStates]);

  // Handlers
  const handleCardClick = useCallback((siteId: number) => {
    setSelectedSiteId(siteId);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedSiteId(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Operational metrics bar */}
      <OperationalMetricsBar cards={boardCards} scanStates={scanStates} />

      {/* THERMS scan compliance summary */}
      <ScanComplianceSummary
        scanStates={scanStates}
        totalScans={allScans.length}
      />

      {/* Filter pills */}
      <FilterPills
        filter={filter}
        onFilterChange={onFilterChange}
        counts={counts}
      />

      <RoverStrip rovers={rovers} />

      {/* Site card grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayCards.map((card) => {
          const guardId = guardScanMap.get(card.site.id);
          const scanState =
            guardId != null ? scanStates.get(guardId) : undefined;

          return (
            <SiteCard
              key={card.site.id}
              card={card}
              scanState={scanState}
              onClick={() => handleCardClick(card.site.id)}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {displayCards.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">
            No sites match the current filter.
          </p>
        </div>
      )}

      {/* Site detail slide-out panel */}
      <SiteDetailPanel
        card={selectedCard}
        scanState={selectedScanState}
        open={selectedSiteId !== null}
        onClose={handleCloseDetail}
      />
    </div>
  );
}
