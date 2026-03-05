// ---------------------------------------------------------------------------
// ScanComplianceSummary — summary bar showing overall scan compliance stats.
// Displays counts for each compliance level across all guards.
// ---------------------------------------------------------------------------

import { cn } from "@/lib/utils";
import type { GuardScanState, ScanComplianceStatus } from "@/lib/therms-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComplianceCount {
  readonly status: ScanComplianceStatus;
  readonly label: string;
  readonly count: number;
  readonly color: string;
  readonly bgColor: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildComplianceCounts(
  scanStates: ReadonlyMap<number, GuardScanState>,
): readonly ComplianceCount[] {
  let compliant = 0;
  let warning = 0;
  let approaching = 0;
  let overdue = 0;

  for (const state of scanStates.values()) {
    switch (state.status) {
      case "compliant":
        compliant++;
        break;
      case "warning":
        warning++;
        break;
      case "approaching":
        approaching++;
        break;
      case "overdue":
        overdue++;
        break;
    }
  }

  return [
    {
      status: "compliant",
      label: "Compliant",
      count: compliant,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
    {
      status: "warning",
      label: "Warning",
      count: warning,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      status: "approaching",
      label: "Approaching",
      count: approaching,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
    },
    {
      status: "overdue",
      label: "Overdue",
      count: overdue,
      color: "text-red-600",
      bgColor: "bg-red-500/10",
    },
  ];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ScanComplianceSummaryProps {
  readonly scanStates: ReadonlyMap<number, GuardScanState>;
  readonly totalScans: number;
}

export function ScanComplianceSummary({
  scanStates,
  totalScans,
}: ScanComplianceSummaryProps) {
  const counts = buildComplianceCounts(scanStates);

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          THERMS Scan Compliance
        </h3>
        <span className="text-xs text-muted-foreground">
          {totalScans} total scans
        </span>
      </div>

      <div className="flex gap-2">
        {counts.map((c) => (
          <div
            key={c.status}
            className={cn(
              "flex-1 rounded-md border border-border px-2 py-1.5 text-center",
              c.count > 0 ? c.bgColor : "",
            )}
          >
            <p className={cn("text-lg font-bold", c.count > 0 ? c.color : "text-muted-foreground")}>
              {c.count}
            </p>
            <p className="text-[10px] text-muted-foreground">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
