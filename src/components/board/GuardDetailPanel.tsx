// ---------------------------------------------------------------------------
// GuardDetailPanel — slide-out sheet showing expanded guard information
// when a card is clicked on Tonight's Board.
// Shows scan history, checkpoint locations, notes, and timeline view.
// ---------------------------------------------------------------------------

import { Shield, MapPin, Clock, Radio, Phone, AlertTriangle } from "lucide-react";
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
import type { Guard, Site } from "@/lib/types";
import type {
  GuardScanState,
  ThermsScanEvent,
  ScanComplianceStatus,
} from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<ScanComplianceStatus, { label: string; className: string }> = {
  compliant: {
    label: "Compliant",
    className: "border-green-500/30 bg-green-500/10 text-green-600",
  },
  warning: {
    label: "Warning",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  },
  approaching: {
    label: "Approaching Limit",
    className: "border-orange-500/30 bg-orange-500/10 text-orange-600",
  },
  overdue: {
    label: "Overdue",
    className: "border-red-500/30 bg-red-500/10 text-red-600",
  },
};

function formatScanTimestamp(timestampMs: number): string {
  return new Date(timestampMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(minutes: number): string {
  if (minutes < 1) return "< 1 min";
  if (minutes < 60) return `${Math.floor(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}h ${mins}m`;
}

/** Get unique checkpoints from scan events. */
function getUniqueCheckpoints(scans: readonly ThermsScanEvent[]): readonly string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const scan of scans) {
    if (!seen.has(scan.checkpoint)) {
      seen.add(scan.checkpoint);
      result.push(scan.checkpoint);
    }
  }
  return result;
}

/** Calculate time gaps between scans for the timeline. */
function calculateScanGaps(
  scans: readonly ThermsScanEvent[],
): readonly { readonly fromTime: number; readonly toTime: number; readonly gapMinutes: number }[] {
  if (scans.length < 2) return [];
  const gaps: { fromTime: number; toTime: number; gapMinutes: number }[] = [];
  for (let i = 1; i < scans.length; i++) {
    const gap = (scans[i].timestamp - scans[i - 1].timestamp) / 60_000;
    gaps.push({
      fromTime: scans[i - 1].timestamp,
      toTime: scans[i].timestamp,
      gapMinutes: Math.round(gap * 10) / 10,
    });
  }
  return gaps;
}

function getGapColor(gapMinutes: number): string {
  if (gapMinutes <= 10) return "text-green-600";
  if (gapMinutes <= 15) return "text-yellow-600";
  if (gapMinutes <= 20) return "text-orange-600";
  return "text-red-600";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface GuardDetailPanelProps {
  readonly guard: Guard | null;
  readonly site: Site | null;
  readonly scanState: GuardScanState | undefined;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function GuardDetailPanel({
  guard,
  site,
  scanState,
  open,
  onClose,
}: GuardDetailPanelProps) {
  if (!guard || !site) return null;

  const status = scanState?.status ?? "compliant";
  const badgeInfo = STATUS_BADGE[status];
  const scans = scanState?.scans ?? [];
  const checkpoints = getUniqueCheckpoints(scans);
  const gaps = calculateScanGaps(scans);
  const longestGap = gaps.length > 0 ? Math.max(...gaps.map((g) => g.gapMinutes)) : 0;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {guard.name}
          </SheetTitle>
          <SheetDescription>{guard.role} at {site.name}</SheetDescription>
        </SheetHeader>

        <ScrollArea className="mt-4 h-[calc(100vh-10rem)]">
          <div className="space-y-6 pr-4">
            {/* Status overview */}
            <StatusOverview
              guard={guard}
              site={site}
              scanState={scanState}
              badgeInfo={badgeInfo}
              longestGap={longestGap}
            />

            <Separator />

            {/* Checkpoint locations */}
            <CheckpointSection checkpoints={checkpoints} />

            <Separator />

            {/* Scan timeline */}
            <ScanTimeline scans={scans} gaps={gaps} />

            <Separator />

            {/* Guard notes */}
            <GuardNotes guard={guard} site={site} />
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface StatusOverviewProps {
  readonly guard: Guard;
  readonly site: Site;
  readonly scanState: GuardScanState | undefined;
  readonly badgeInfo: { label: string; className: string };
  readonly longestGap: number;
}

function StatusOverview({
  guard,
  site,
  scanState,
  badgeInfo,
  longestGap,
}: StatusOverviewProps) {
  return (
    <div className="space-y-4">
      {/* Status + compliance */}
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={badgeInfo.className}>
          {badgeInfo.label}
        </Badge>
        {guard.armed && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[10px]">
            Armed
          </Badge>
        )}
        {site.armed && (
          <Badge variant="outline" className="border-red-500/30 bg-red-500/10 text-red-600 text-[10px]">
            Armed Post
          </Badge>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatMini label="Total Scans" value={String(scanState?.scanCount ?? 0)} />
        <StatMini
          label="Last Scan"
          value={
            scanState?.lastScanTime
              ? formatScanTimestamp(scanState.lastScanTime)
              : "---"
          }
        />
        <StatMini
          label="Time Since"
          value={formatDuration(scanState?.minutesSinceLastScan ?? 0)}
        />
        <StatMini
          label="Longest Gap"
          value={longestGap > 0 ? `${Math.round(longestGap)} min` : "---"}
          alert={longestGap > 20}
        />
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
    </div>
  );
}

interface StatMiniProps {
  readonly label: string;
  readonly value: string;
  readonly alert?: boolean;
}

function StatMini({ label, value, alert = false }: StatMiniProps) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-semibold",
          alert ? "text-red-600" : "text-foreground",
        )}
      >
        {alert && <AlertTriangle className="mr-1 inline h-3 w-3" />}
        {value}
      </p>
    </div>
  );
}

interface CheckpointSectionProps {
  readonly checkpoints: readonly string[];
}

function CheckpointSection({ checkpoints }: CheckpointSectionProps) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">
        Scan Locations ({checkpoints.length})
      </h4>
      {checkpoints.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground italic">
          No checkpoints scanned yet.
        </p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {checkpoints.map((cp) => (
            <div
              key={cp}
              className="flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1"
            >
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-foreground">{cp}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface ScanTimelineProps {
  readonly scans: readonly ThermsScanEvent[];
  readonly gaps: readonly { readonly fromTime: number; readonly toTime: number; readonly gapMinutes: number }[];
}

function ScanTimeline({ scans, gaps }: ScanTimelineProps) {
  // Show most recent first
  const reversedScans = [...scans].reverse();
  const gapLookup = new Map(gaps.map((g) => [g.toTime, g.gapMinutes]));

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">
        Scan History ({scans.length} scans)
      </h4>

      {reversedScans.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground italic">
          No scans recorded yet.
        </p>
      ) : (
        <div className="mt-3 space-y-0">
          {reversedScans.map((scan, idx) => {
            const gapFromPrevious = gapLookup.get(scan.timestamp);
            return (
              <TimelineEntry
                key={`${scan.timestamp}-${scan.checkpoint}`}
                scan={scan}
                gapMinutes={gapFromPrevious}
                isFirst={idx === 0}
                isLast={idx === reversedScans.length - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface TimelineEntryProps {
  readonly scan: ThermsScanEvent;
  readonly gapMinutes: number | undefined;
  readonly isFirst: boolean;
  readonly isLast: boolean;
}

function TimelineEntry({ scan, gapMinutes, isFirst, isLast }: TimelineEntryProps) {
  return (
    <div className="flex gap-3">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isFirst ? "bg-primary" : "bg-muted-foreground/50",
          )}
        />
        {!isLast && (
          <div className="w-px flex-1 bg-border" />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {formatScanTimestamp(scan.timestamp)}
          </span>
          {isFirst && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 border-primary/30 text-primary">
              Latest
            </Badge>
          )}
          {gapMinutes !== undefined && gapMinutes > 15 && (
            <span className={cn("text-[10px] font-medium", getGapColor(gapMinutes))}>
              {Math.round(gapMinutes)}m gap
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-center gap-1">
          <Radio className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground truncate">
            {scan.checkpoint}
          </span>
        </div>
      </div>
    </div>
  );
}

interface GuardNotesProps {
  readonly guard: Guard;
  readonly site: Site;
}

function GuardNotes({ guard, site }: GuardNotesProps) {
  const hasCallouts = guard.calloutHistory.length > 0;

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">Notes</h4>

      {/* Site notes */}
      <div className="mt-2 rounded-md border border-border bg-muted/50 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Site Instructions
        </p>
        <p className="text-xs text-foreground leading-relaxed">{site.notes}</p>
      </div>

      {/* Guard THERMS stats */}
      <div className="mt-3 rounded-md border border-border bg-muted/50 p-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
          Guard THERMS History
        </p>
        <div className="flex gap-4 text-xs text-foreground">
          <span>Avg check-in: {guard.thermsAvgCheckin} min</span>
          <span>Late starts: {guard.thermsLateStarts}</span>
          <span>Patrol rate: {Math.round(guard.thermsPatrolRate * 100)}%</span>
        </div>
      </div>

      {/* Recent callouts */}
      {hasCallouts && (
        <div className="mt-3 rounded-md border border-border bg-muted/50 p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Recent Call-Outs ({guard.calloutHistory.length})
          </p>
          <div className="space-y-1">
            {guard.calloutHistory.map((co) => (
              <div key={`${co.date}-${co.siteId}`} className="flex items-center gap-2 text-xs">
                <AlertTriangle className="h-3 w-3 text-warning shrink-0" />
                <span className="text-muted-foreground">{co.date}</span>
                <span className="text-foreground">{co.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
