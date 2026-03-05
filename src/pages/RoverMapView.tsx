import { useRovers } from "@/hooks/use-rovers";
import { QueryLoading, QueryError } from "@/components/QueryState";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Phone, AlertTriangle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Rover, RoverStatus } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SITES_PER_ZONE = 6;

const ZONE_ORDER: readonly string[] = ["North", "East", "South", "West"];

const STATUS_CONFIG: Record<RoverStatus, {
  readonly label: string;
  readonly dotClass: string;
  readonly badgeClass: string;
}> = {
  patrolling: {
    label: "Patrolling",
    dotClass: "bg-success",
    badgeClass: "border-success/30 bg-success/10 text-success",
  },
  "en-route": {
    label: "En Route",
    dotClass: "bg-amber-500",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600",
  },
  covering: {
    label: "Covering",
    dotClass: "bg-destructive",
    badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
  },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { readonly status: RoverStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant="outline" className={cn("gap-1.5", config.badgeClass)}>
      <span className={cn("inline-block h-2 w-2 rounded-full", config.dotClass)} />
      {config.label}
    </Badge>
  );
}

function RoverCard({ rover }: { readonly rover: Rover }) {
  const isCovering = rover.status === "covering";

  return (
    <Card className={cn(isCovering && "border-destructive/40")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg font-semibold text-foreground">
              {rover.zone}
            </span>
          </div>
          <StatusBadge status={rover.status} />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Car className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{rover.name}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button variant="outline" size="sm" className="w-full gap-2" asChild>
          <a href={`tel:${rover.phone}`}>
            <Phone className="h-3.5 w-3.5" />
            Call {rover.name}
          </a>
        </Button>

        {isCovering && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">
              Rover pulled from patrol &mdash; {rover.zone} zone coverage degraded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ZoneDiagram({ rovers }: { readonly rovers: readonly Rover[] }) {
  const roverByZone: Record<string, Rover | undefined> = {};
  for (const rover of rovers) {
    roverByZone[rover.zone] = rover;
  }

  const quadrants: readonly [string, string][] = [
    ["North", "East"],
    ["South", "West"],
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <span className="text-sm font-semibold text-foreground">
          Zone Coverage Diagram
        </span>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-md border border-border">
          {quadrants.map(([left, right], rowIndex) => (
            <div
              key={`${left}-${right}`}
              className={cn(
                "grid grid-cols-2",
                rowIndex === 0 && "border-b border-border",
              )}
            >
              {[left, right].map((zone, colIndex) => {
                const rover = roverByZone[zone];
                const isPatrolling = rover?.status === "patrolling";
                const isCovering = rover?.status === "covering";
                const isEnRoute = rover?.status === "en-route";

                return (
                  <div
                    key={zone}
                    className={cn(
                      "flex flex-col items-center justify-center px-4 py-5",
                      colIndex === 0 && "border-r border-border",
                      isPatrolling && "bg-success/5",
                      isCovering && "bg-destructive/5",
                      isEnRoute && "bg-amber-500/5",
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground">
                      {zone}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {SITES_PER_ZONE} sites
                    </span>
                    {rover && (
                      <StatusBadge status={rover.status} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeStats(rovers: readonly Rover[]) {
  const total = rovers.length;
  const onPatrol = rovers.filter((r) => r.status === "patrolling").length;
  const covering = rovers.filter((r) => r.status === "covering").length;
  return { total, onPatrol, covering } as const;
}

function sortByZoneOrder(rovers: readonly Rover[]): readonly Rover[] {
  return [...rovers].sort(
    (a, b) => ZONE_ORDER.indexOf(a.zone) - ZONE_ORDER.indexOf(b.zone),
  );
}

// ---------------------------------------------------------------------------
// Main View
// ---------------------------------------------------------------------------

export default function RoverMapView() {
  const { data: rovers, isLoading, error, refetch } = useRovers();

  if (isLoading) {
    return <QueryLoading message="Loading rovers..." />;
  }

  if (error) {
    return (
      <QueryError
        message={error.message}
        onRetry={() => { refetch(); }}
      />
    );
  }

  if (!rovers || rovers.length === 0) {
    return <QueryError message="No rover data available" />;
  }

  const sorted = sortByZoneOrder(rovers);
  const { total, onPatrol, covering } = computeStats(rovers);

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total Rovers" value={total} />
        <StatCard label="On Patrol" value={onPatrol} />
        <StatCard label="Covering" value={covering} />
      </div>

      {/* Rover cards — 2x2 grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sorted.map((rover) => (
          <RoverCard key={rover.id} rover={rover} />
        ))}
      </div>

      {/* Zone coverage diagram */}
      <ZoneDiagram rovers={rovers} />
    </div>
  );
}
