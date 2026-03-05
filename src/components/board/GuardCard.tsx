// ---------------------------------------------------------------------------
// GuardCard — card for a single guard on Tonight's Board grid view.
// Shows name, role, status, last scan time, and scan compliance indicator.
// Clickable to expand into the detail panel.
// ---------------------------------------------------------------------------

import { Shield, Clock, MapPin, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Guard } from "@/lib/types";
import type { GuardScanState, ScanComplianceStatus } from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Compliance color mapping
// ---------------------------------------------------------------------------

const COMPLIANCE_COLORS: Record<ScanComplianceStatus, string> = {
  compliant: "bg-green-500",
  warning: "bg-yellow-500",
  approaching: "bg-orange-500",
  overdue: "bg-red-500",
};

const COMPLIANCE_RING: Record<ScanComplianceStatus, string> = {
  compliant: "ring-green-500/30",
  warning: "ring-yellow-500/30",
  approaching: "ring-orange-500/30",
  overdue: "ring-red-500/30",
};

const COMPLIANCE_BORDER: Record<ScanComplianceStatus, string> = {
  compliant: "border-l-green-500",
  warning: "border-l-yellow-500",
  approaching: "border-l-orange-500",
  overdue: "border-l-red-500",
};

const COMPLIANCE_LABELS: Record<ScanComplianceStatus, string> = {
  compliant: "Compliant",
  warning: "Warning",
  approaching: "Approaching",
  overdue: "Overdue",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTimeSince(minutes: number): string {
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m ago`;
}

function formatLastScanTime(timestampMs: number | null): string {
  if (timestampMs === null) return "No scan yet";
  const date = new Date(timestampMs);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GuardCardProps {
  readonly guard: Guard;
  readonly scanState: GuardScanState | undefined;
  readonly siteName: string;
  readonly onClick: () => void;
}

export function GuardCard({
  guard,
  scanState,
  siteName,
  onClick,
}: GuardCardProps) {
  const status = scanState?.status ?? "compliant";
  const minutesSince = scanState?.minutesSinceLastScan ?? 0;
  const lastCheckpoint = scanState?.lastCheckpoint ?? "---";
  const scanCount = scanState?.scanCount ?? 0;
  const lastScanTime = scanState?.lastScanTime ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border-l-4 border border-border bg-card p-4",
        "text-left transition-all duration-150",
        "hover:shadow-md hover:border-border/80 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        COMPLIANCE_BORDER[status],
      )}
    >
      {/* Header: name + role */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground truncate">
              {guard.name}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground truncate">
            {guard.role}
          </p>
        </div>

        {/* Compliance indicator dot */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            className={cn(
              "h-3 w-3 rounded-full ring-2",
              COMPLIANCE_COLORS[status],
              COMPLIANCE_RING[status],
            )}
            title={COMPLIANCE_LABELS[status]}
          />
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0",
              status === "overdue"
                ? "border-red-500/30 bg-red-500/10 text-red-600"
                : status === "approaching"
                  ? "border-orange-500/30 bg-orange-500/10 text-orange-600"
                  : status === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600"
                    : "border-green-500/30 bg-green-500/10 text-green-600",
            )}
          >
            {COMPLIANCE_LABELS[status]}
          </Badge>
        </div>
      </div>

      {/* Site assignment */}
      <div className="mt-2 flex items-center gap-1.5">
        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground truncate">
          {siteName}
        </span>
      </div>

      {/* Scan info row */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border/50 pt-3">
        {/* Last scan */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Last Scan
          </p>
          <p className="mt-0.5 text-xs font-medium text-foreground truncate">
            {formatLastScanTime(lastScanTime)}
          </p>
        </div>

        {/* Time since */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Since Scan
          </p>
          <p className="mt-0.5 text-xs font-medium text-foreground">
            {formatTimeSince(minutesSince)}
          </p>
        </div>

        {/* Scan count */}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Scans
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <Radio className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">
              {scanCount}
            </span>
          </div>
        </div>
      </div>

      {/* Last checkpoint */}
      <div className="mt-2 flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="text-[11px] text-muted-foreground truncate">
          {lastCheckpoint}
        </span>
      </div>
    </button>
  );
}
