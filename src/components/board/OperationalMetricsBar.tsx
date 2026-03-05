// ---------------------------------------------------------------------------
// OperationalMetricsBar — top-of-board operational metrics summary.
// Shows key stats: Avg Response, Avg Fill, Coverage %, Active Callouts,
// Check-in Rate, and Scan Compliance.
// ---------------------------------------------------------------------------

import { cn } from "@/lib/utils";
import type { SiteBoardCard } from "@/lib/types";
import type { GuardScanState } from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeMetrics(
  cards: readonly SiteBoardCard[],
  scanStates: ReadonlyMap<number, GuardScanState>,
): readonly MetricItem[] {
  const total = cards.length;
  const coveredCount = cards.filter((c) => c.guard !== null).length;
  const checkedInCount = cards.filter((c) => c.checkedIn).length;
  const activeCallouts = cards.filter((c) => c.calloutActive).length;

  const coveragePct = total > 0 ? Math.round((coveredCount / total) * 100) : 0;
  const checkinPct = total > 0 ? Math.round((checkedInCount / total) * 100) : 0;

  // Avg fill time from resolved callouts
  const fillTimes = cards
    .filter((c) => c.fillTime != null)
    .map((c) => c.fillTime as number);
  const avgFill =
    fillTimes.length > 0
      ? Math.round(fillTimes.reduce((a, b) => a + b, 0) / fillTimes.length)
      : 0;

  // Scan compliance: % of guards in compliant state
  let compliantCount = 0;
  let totalGuards = 0;
  for (const state of scanStates.values()) {
    totalGuards++;
    if (state.status === "compliant") compliantCount++;
  }
  const scanPct =
    totalGuards > 0 ? Math.round((compliantCount / totalGuards) * 100) : 0;

  return [
    { label: "Coverage", value: `${coveragePct}%`, alert: coveragePct < 90 },
    { label: "Check-in Rate", value: `${checkinPct}%`, alert: checkinPct < 50 },
    { label: "Active Callouts", value: String(activeCallouts), alert: activeCallouts > 0 },
    { label: "Avg Fill Time", value: avgFill > 0 ? `${avgFill} min` : "---", alert: avgFill > 30 },
    { label: "Scan Compliance", value: `${scanPct}%`, alert: scanPct < 70 },
    { label: "Sites", value: `${coveredCount}/${total}`, alert: false },
  ];
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MetricItem {
  readonly label: string;
  readonly value: string;
  readonly alert: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OperationalMetricsBarProps {
  readonly cards: readonly SiteBoardCard[];
  readonly scanStates: ReadonlyMap<number, GuardScanState>;
}

export function OperationalMetricsBar({
  cards,
  scanStates,
}: OperationalMetricsBarProps) {
  const metrics = computeMetrics(cards, scanStates);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Operational Metrics
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={cn(
              "rounded-md border border-border px-2 py-1.5 text-center",
              m.alert ? "bg-red-500/5" : "",
            )}
          >
            <p
              className={cn(
                "text-lg font-bold",
                m.alert ? "text-red-600" : "text-foreground",
              )}
            >
              {m.value}
            </p>
            <p className="text-[10px] text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
