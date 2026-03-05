// ---------------------------------------------------------------------------
// SiteDetailPanel — slide-out sheet showing expanded site information
// when a card is clicked on Tonight's Board.
// Site-centric: site header first, then guard details, callout history, notes.
// ---------------------------------------------------------------------------

import {
  Building2,
  Shield,
  MapPin,
  Clock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Radio,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { SiteBoardCard } from "@/lib/types";
import type { GuardScanState, ScanComplianceStatus } from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const COMPLIANCE_BADGE: Record<ScanComplianceStatus, { label: string; className: string }> = {
  compliant: {
    label: "Compliant",
    className: "border-green-500/30 bg-green-500/10 text-green-600",
  },
  warning: {
    label: "Warning",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  },
  approaching: {
    label: "Approaching",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  },
  overdue: {
    label: "Overdue",
    className: "border-red-500/30 bg-red-500/10 text-red-600",
  },
};

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.floor(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

function formatScanTime(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface SiteDetailPanelProps {
  readonly card: SiteBoardCard | null;
  readonly scanState: GuardScanState | undefined;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function SiteDetailPanel({
  card,
  scanState,
  open,
  onClose,
}: SiteDetailPanelProps) {
  if (!card) return null;

  const { site, guard } = card;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            {site.name}
          </SheetTitle>
          <SheetDescription>{site.addr}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-4 h-[calc(100vh-10rem)]">
          <div className="space-y-6 pr-4">
            {/* Site header info */}
            <SiteOverview card={card} />

            <Separator />

            {/* Assigned guard section */}
            <GuardSection card={card} scanState={scanState} />

            <Separator />

            {/* Active callout */}
            {card.calloutActive && (
              <>
                <CalloutSection card={card} />
                <Separator />
              </>
            )}

            {/* Callout history for this site */}
            {guard && <CalloutHistory guardCallouts={guard.calloutHistory} siteId={site.id} />}

            <Separator />

            {/* Site notes */}
            <SiteNotes notes={site.notes} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SiteOverview({ card }: { readonly card: SiteBoardCard }) {
  const { site } = card;
  return (
    <div className="space-y-3">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-[10px]">
          Tier {site.tier}
        </Badge>
        {site.armed && (
          <Badge
            variant="outline"
            className="text-[10px] border-red-500/30 bg-red-500/10 text-red-600"
          >
            Armed Post
          </Badge>
        )}
      </div>

      {/* Shift times + address */}
      <div className="grid grid-cols-2 gap-3">
        <InfoMini
          icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Shift"
          value={`${site.shiftStart} - ${site.shiftEnd}`}
        />
        <InfoMini
          icon={<MapPin className="h-3.5 w-3.5 text-muted-foreground" />}
          label="Address"
          value={site.addr}
        />
      </div>

      {/* Confirmation + check-in status */}
      <div className="grid grid-cols-2 gap-3">
        <StatusMini label="Confirmed" active={card.confirmed} />
        <StatusMini label="Checked In" active={card.checkedIn} />
      </div>
    </div>
  );
}

function GuardSection({
  card,
  scanState,
}: {
  readonly card: SiteBoardCard;
  readonly scanState: GuardScanState | undefined;
}) {
  const { guard } = card;

  if (!guard) {
    return (
      <div>
        <h4 className="text-sm font-semibold text-foreground">Assigned Guard</h4>
        <p className="mt-2 text-xs text-muted-foreground italic">
          No guard assigned to this site.
        </p>
      </div>
    );
  }

  const complianceStatus = scanState?.status ?? "compliant";
  const badgeInfo = COMPLIANCE_BADGE[complianceStatus];

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-foreground">Assigned Guard</h4>

      {/* Guard identity */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{guard.name}</span>
        <span className="text-xs text-muted-foreground">{guard.role}</span>
        {guard.armed && (
          <Badge
            variant="outline"
            className="text-[10px] px-1.5 py-0 border-primary/30 bg-primary/10 text-primary"
          >
            Armed
          </Badge>
        )}
      </div>

      {/* Contact */}
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
        <a
          href={`tel:${guard.phone}`}
          className="text-sm text-primary hover:underline"
        >
          Call Guard
        </a>
        <span className="text-xs text-muted-foreground">
          GRS: {guard.grs} | {guard.hrs}/{guard.max} hrs
        </span>
      </div>

      {/* THERMS stats */}
      <div className="rounded-md border border-border bg-muted/50 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          THERMS Performance
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatMini label="Avg Check-in" value={`${guard.thermsAvgCheckin} min`} />
          <StatMini label="Late Starts" value={String(guard.thermsLateStarts)} />
          <StatMini
            label="Patrol Rate"
            value={`${Math.round(guard.thermsPatrolRate * 100)}%`}
          />
          <StatMini
            label="Scan Status"
            value={badgeInfo.label}
            className={badgeInfo.className}
          />
        </div>
      </div>

      {/* Scan summary */}
      {scanState && (
        <div className="rounded-md border border-border bg-muted/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Tonight's Scans
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-muted-foreground">Total</p>
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-medium">{scanState.scanCount}</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Last Scan</p>
              <p className="text-xs font-medium">
                {scanState.lastScanTime ? formatScanTime(scanState.lastScanTime) : "---"}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Since Scan</p>
              <p className="text-xs font-medium">
                {formatDuration(scanState.minutesSinceLastScan)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CalloutSection({ card }: { readonly card: SiteBoardCard }) {
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <h4 className="text-sm font-semibold text-red-600">Active Callout</h4>
      </div>
      {card.calloutReason && (
        <p className="text-xs text-red-600/80 mb-1">
          Reason: {card.calloutReason}
        </p>
      )}
      {card.guardResponse && (
        <p className="text-xs text-foreground mb-1">
          Response: {card.guardResponse}
        </p>
      )}
      {card.fillTime != null && (
        <p className="text-xs text-muted-foreground">
          Fill time: {card.fillTime} min
        </p>
      )}
      {card.replacementGuard && (
        <p className="text-xs text-foreground">
          Replacement: {card.replacementGuard}
        </p>
      )}
    </div>
  );
}

function CalloutHistory({
  guardCallouts,
  siteId,
}: {
  readonly guardCallouts: readonly { readonly date: string; readonly day: string; readonly siteId: number; readonly reason: string }[];
  readonly siteId: number;
}) {
  const siteCallouts = guardCallouts.filter((co) => co.siteId === siteId);

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">
        Site Callout History ({siteCallouts.length})
      </h4>
      {siteCallouts.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground italic">
          No callouts recorded for this site.
        </p>
      ) : (
        <div className="mt-2 space-y-1">
          {siteCallouts.map((co) => (
            <div key={`${co.date}-${co.siteId}`} className="flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3 w-3 text-orange-500 shrink-0" />
              <span className="text-muted-foreground">{co.date}</span>
              <span className="text-foreground">{co.reason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SiteNotes({ notes }: { readonly notes: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">Site Notes</h4>
      <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
        <p className="text-xs text-foreground leading-relaxed">{notes}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared mini components
// ---------------------------------------------------------------------------

function InfoMini({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-xs text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function StatusMini({
  label,
  active,
}: {
  readonly label: string;
  readonly active: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2
        className={cn("h-4 w-4", active ? "text-green-600" : "text-muted-foreground/40")}
      />
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-xs font-medium", active ? "text-green-600" : "text-muted-foreground")}>
          {active ? "Yes" : "No"}
        </p>
      </div>
    </div>
  );
}

function StatMini({
  label,
  value,
  className,
}: {
  readonly label: string;
  readonly value: string;
  readonly className?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn("text-xs font-medium text-foreground", className)}>
        {value}
      </p>
    </div>
  );
}
