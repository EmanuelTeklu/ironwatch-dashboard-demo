import { Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Rover, RoverStatus } from "@/lib/types";

const STATUS_COLORS: Record<RoverStatus, string> = {
  patrolling: "bg-success/10 text-success border-success/30",
  "en-route": "bg-amber-500/10 text-amber-600 border-amber-500/30",
  covering: "bg-destructive/10 text-destructive border-destructive/30",
};

const DOT_COLORS: Record<RoverStatus, string> = {
  patrolling: "bg-success",
  "en-route": "bg-amber-500",
  covering: "bg-destructive",
};

interface RoverStripProps {
  readonly rovers: readonly Rover[];
}

export function RoverStrip({ rovers }: RoverStripProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {rovers.map((rover) => (
        <div
          key={rover.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {rover.name}
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {rover.zone}
            </span>
            <Badge
              variant="outline"
              className={cn("gap-1 text-[10px] px-1.5 py-0 shrink-0", STATUS_COLORS[rover.status])}
            >
              <span className={cn("inline-block h-1.5 w-1.5 rounded-full", DOT_COLORS[rover.status])} />
              {rover.status === "patrolling"
                ? "Patrolling"
                : rover.status === "en-route"
                  ? "En Route"
                  : "Covering"}
            </Badge>
          </div>
          <a
            href={`tel:${rover.phone}`}
            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title={`Call ${rover.name}`}
          >
            <Phone className="h-3.5 w-3.5" />
          </a>
        </div>
      ))}
    </div>
  );
}
