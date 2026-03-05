// ---------------------------------------------------------------------------
// SuggestionButtons — contextual quick-action prompts below the chat input
// Changes based on simulation phase and current site statuses.
// Hidden during streaming.
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SiteSimStatus } from "@/lib/simulation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Suggestion {
  readonly label: string;
  readonly prompt: string;
}

interface SuggestionButtonsProps {
  readonly phase: string;
  readonly siteStatuses: ReadonlyMap<number, SiteSimStatus>;
  readonly isStreaming: boolean;
  readonly onSend: (prompt: string) => void;
}

// ---------------------------------------------------------------------------
// Suggestion generators per phase
// ---------------------------------------------------------------------------

function preShiftSuggestions(): readonly Suggestion[] {
  return [
    { label: "Run pre-shift check", prompt: "Run a pre-shift check on all 24 sites. Who's confirmed, who's still pending?" },
    { label: "Check unconfirmed guards", prompt: "Which guards haven't confirmed in ConnectTeams yet? Any pattern flags I should know about?" },
    { label: "Preview at-risk sites", prompt: "Which sites are at risk of a callout tonight based on guard history and patterns?" },
  ];
}

function activeQuietSuggestions(): readonly Suggestion[] {
  return [
    { label: "Run coverage analysis", prompt: "Give me a full coverage analysis. How are we looking across all 24 sites?" },
    { label: "Check THERMS compliance", prompt: "What's our THERMS compliance looking like? Any guards with late check-ins or low patrol rates?" },
    { label: "Predict tonight's risks", prompt: "Based on what you're seeing, what are the biggest risks for the rest of tonight's shift?" },
  ];
}

function activeCalloutSuggestions(
  redSiteNames: readonly string[],
): readonly Suggestion[] {
  const site = redSiteNames[0] ?? "the affected site";
  return [
    { label: `Status on ${site}`, prompt: `What's the latest status on the ${site} callout? Is it resolved?` },
    { label: `Who can cover ${site}?`, prompt: `Who's available to cover ${site}? Rank them by familiarity and GRS.` },
    { label: "Review cascade options", prompt: "Walk me through the current cascade options. Who's been contacted and who's responded?" },
  ];
}

function lateNightSuggestions(): readonly Suggestion[] {
  return [
    { label: "Midnight coverage check", prompt: "Give me a midnight coverage check. All sites still covered? Any issues?" },
    { label: "Review fill times", prompt: "How are our fill times tonight? Are we hitting our targets?" },
    { label: "Flag guards for review", prompt: "Which guards should I flag for review based on tonight's performance?" },
  ];
}

// ---------------------------------------------------------------------------
// Hook: compute suggestions from phase + statuses
// ---------------------------------------------------------------------------

function findRedSiteNames(
  statuses: ReadonlyMap<number, SiteSimStatus>,
): readonly string[] {
  const names: string[] = [];
  for (const s of statuses.values()) {
    if (s.status === "red" && s.siteId != null) {
      names.push(`Site ${s.siteId}`);
    }
  }
  return names;
}

export function computeSuggestions(
  phase: string,
  siteStatuses: ReadonlyMap<number, SiteSimStatus>,
): readonly Suggestion[] {
  switch (phase) {
    case "pre-shift":
      return preShiftSuggestions();
    case "active": {
      const redNames = findRedSiteNames(siteStatuses);
      return redNames.length > 0
        ? activeCalloutSuggestions(redNames)
        : activeQuietSuggestions();
    }
    case "late-night":
      return lateNightSuggestions();
    case "shift-end":
      return lateNightSuggestions();
    default:
      return activeQuietSuggestions();
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SuggestionButtons({
  phase,
  siteStatuses,
  isStreaming,
  onSend,
}: SuggestionButtonsProps) {
  const suggestions = useMemo(
    () => computeSuggestions(phase, siteStatuses),
    [phase, siteStatuses],
  );

  return (
    <AnimatePresence>
      {!isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          className="flex flex-wrap gap-2 px-3.5 pb-2"
        >
          {suggestions.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => onSend(s.prompt)}
              className={cn(
                "rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5",
                "text-[12px] text-muted-foreground",
                "transition-all duration-150",
                "hover:border-purple-500/40 hover:bg-purple-500/10 hover:text-purple-300",
              )}
            >
              {s.label}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
