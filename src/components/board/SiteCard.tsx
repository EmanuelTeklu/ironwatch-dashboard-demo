// ---------------------------------------------------------------------------
// SiteCard — card for a single site on Tonight's Board grid view.
// Site name is the primary header; guard name is secondary.
// Color-coded left border by SiteBoardStatus.
// ---------------------------------------------------------------------------

import { Building2, Shield, Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SiteBoardCard } from "@/lib/types";
import type { GuardScanState, ScanComplianceStatus } from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const BORDER_COLORS: Record<string, string> = {
  callout: "border-l-red-500",
  uncovered: "border-l-orange-500",
  "late-checkin": "border-l-yellow-500",
  "on-post": "border-l-green-500",
};

const STATUS_LABELS: Record<string, string> = {
  callout: "Callout",
  uncovered: "Uncovered",
  "late-checkin": "Late Check-in",
  "on-post": "On Post",
};

const STATUS_BADGE_STYLES: Record<string, string> = {
  callout: "border-red-500/30 bg-red-500/10 text-red-600",
  uncovered: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  "late-checkin": "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  "on-post": "border-green-500/30 bg-green-500/10 text-green-600",
};

const COMPLIANCE_DOT: Record<ScanComplianceStatus, string> = {
  compliant: "bg-green-500",
  warning: "bg-yellow-500",
  approaching: "bg-orange-500",
  overdue: "bg-red-500",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SiteCardProps {
  readonly card: SiteBoardCard;
  readonly scanState: GuardScanState | undefined;
  readonly onClick: () => void;
}

export function SiteCard({ card, scanState, onClick }: SiteCardProps) {
  const { site, guard, status, calloutActive, calloutReason } = card;
  const complianceStatus = scanState?.status ?? "compliant";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border-l-4 border border-border bg-card p-4",
        "text-left transition-all duration-150",
        "hover:shadow-md hover:border-border/80 hover:bg-accent/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        BORDER_COLORS[status],
      )}
    >
      {/* Header: site name + badges */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground truncate">
              {site.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              Tier {site.tier}
            </Badge>
            {site.armed && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-red-500/30 bg-red-500/10 text-red-600"
              >
                Armed
              </Badge>
            )}
          </div>
        </div>

        {/* Status badge */}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1.5 py-0 shrink-0",
            STATUS_BADGE_STYLES[status],
          )}
        >
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      {/* Guard row */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Shield className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {guard ? guard.name : "Unassigned"}
          </span>
          {guard && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              GRS {guard.grs}
            </span>
          )}
        </div>
        {scanState && (
          <div
            className={cn(
              "h-2.5 w-2.5 rounded-full shrink-0",
              COMPLIANCE_DOT[complianceStatus],
            )}
            title={`Scan: ${complianceStatus}`}
          />
        )}
      </div>

      {/* Status strip: check-in + scans */}
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border/50 pt-3">
        <StatusIndicator
          label="Checked In"
          active={card.checkedIn}
          icon={<Clock className="h-3 w-3" />}
        />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Scans
          </p>
          <p className="mt-0.5 text-xs font-medium text-foreground">
            {scanState?.scanCount ?? 0}
          </p>
        </div>
      </div>

      {/* Callout banner */}
      {calloutActive && (
        <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0" />
            <span className="text-xs font-semibold text-red-600">
              Active Callout
            </span>
          </div>
          {calloutReason && (
            <p className="mt-1 text-[11px] text-red-600/80 truncate">
              {calloutReason}
            </p>
          )}
          {card.fillTime != null && (
            <p className="mt-0.5 text-[10px] text-red-600/70">
              Fill: {card.fillTime} min
            </p>
          )}
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Sub-component
// ---------------------------------------------------------------------------

interface StatusIndicatorProps {
  readonly label: string;
  readonly active: boolean;
  readonly icon: React.ReactNode;
}

function StatusIndicator({ label, active, icon }: StatusIndicatorProps) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div
        className={cn(
          "mt-0.5 flex items-center gap-1",
          active ? "text-green-600" : "text-muted-foreground",
        )}
      >
        {icon}
        <span className="text-xs font-medium">{active ? "Yes" : "No"}</span>
      </div>
    </div>
  );
}
