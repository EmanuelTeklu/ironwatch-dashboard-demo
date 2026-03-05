// ---------------------------------------------------------------------------
// OperationsFeed — live simulation event feed for the operations center view
// Shows real-time events from the nightly simulation in a scrollable log
// ---------------------------------------------------------------------------

import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Radio, Clock, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_COLORS: Record<PegasusMessageType, string> = {
  info: "text-muted-foreground",
  warning: "text-orange-400",
  danger: "text-red-400",
  success: "text-green-400",
  ai: "text-purple-400",
  action: "text-blue-400",
};

const TYPE_DOT_COLORS: Record<PegasusMessageType, string> = {
  info: "bg-muted-foreground",
  warning: "bg-orange-400",
  danger: "bg-red-500",
  success: "bg-green-500",
  ai: "bg-purple-400",
  action: "bg-blue-400",
};

const SCROLL_THRESHOLD = 80;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface OperationsFeedProps {
  readonly messages: readonly PegasusMessage[];
  readonly simTime: string;
  readonly phase: string;
  readonly isRunning: boolean;
  readonly isPaused: boolean;
  readonly onPause: () => void;
  readonly onResume: () => void;
  readonly onReset: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatSimTime(time24: string): string {
  const parts = time24.split(":");
  const h = Number(parts[0]);
  const m = parts[1] ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m} ${period}`;
}

function formatPhaseLabel(phase: string): string {
  switch (phase) {
    case "pre-shift":
      return "Pre-Shift";
    case "active":
      return "Active";
    case "late-night":
      return "Late Night";
    case "shift-end":
      return "Shift End";
    default:
      return phase;
  }
}

// ---------------------------------------------------------------------------
// Event row
// ---------------------------------------------------------------------------

function EventRow({ message }: { readonly message: PegasusMessage }) {
  const dotColor = TYPE_DOT_COLORS[message.type];
  const textColor = TYPE_COLORS[message.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      layout="position"
      className="flex gap-3 py-1.5"
    >
      <span className="mt-1.5 flex-shrink-0">
        <span className={cn("inline-block h-1.5 w-1.5 rounded-full", dotColor)} />
      </span>
      <div className="min-w-0 flex-1">
        <span className={cn("text-[13px] leading-relaxed", textColor)}>
          {message.content}
        </span>
      </div>
      <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground/50">
        {message.timestamp}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function OperationsFeed({
  messages,
  simTime,
  phase,
  isRunning,
  isPaused,
  onPause,
  onResume,
  onReset,
}: OperationsFeedProps) {
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setUserScrolledUp(false);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setUserScrolledUp(distanceFromBottom > SCROLL_THRESHOLD);
  }, []);

  // Auto-scroll when new messages arrive (if not scrolled up)
  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length, userScrolledUp]);

  // Filter to only show system messages (simulation events)
  const systemMessages = messages.filter((m) => m.role === "system");

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Radio className="h-4 w-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Live Operations Feed
            </span>
            <span className="text-[10px] text-muted-foreground/70">
              Dittmar Contract -- 24 Sites
            </span>
          </div>
        </div>

        {/* Sim controls */}
        <div className="flex items-center gap-2">
          {(isRunning || isPaused) && (
            <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-2.5 py-1">
              <Clock className="h-3 w-3 text-primary" />
              <span className="font-mono text-[11px] font-semibold text-primary">
                {formatSimTime(simTime)}
              </span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-primary/80">
                {formatPhaseLabel(phase)}
              </span>
              <button
                onClick={isPaused ? onResume : onPause}
                className="flex h-5 w-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title={isPaused ? "Resume" : "Pause"}
              >
                {isPaused ? (
                  <Play className="h-2.5 w-2.5" />
                ) : (
                  <Pause className="h-2.5 w-2.5" />
                )}
              </button>
              <button
                onClick={onReset}
                className="flex h-5 w-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                title="Reset"
              >
                <RotateCcw className="h-2.5 w-2.5" />
              </button>
            </div>
          )}
          {isRunning && !isPaused && (
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
              <span className="text-[10px] text-green-400/80">live</span>
            </span>
          )}
        </div>
      </div>

      {/* Event feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        <div className="space-y-0.5">
          <AnimatePresence initial={false}>
            {systemMessages.map((msg) => (
              <EventRow key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} className="h-px" />
        </div>

        {systemMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Radio className="mb-3 h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Waiting for simulation events...
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Events will appear here as the shift simulation runs
            </p>
          </div>
        )}
      </div>

      {/* Scroll-to-bottom overlay */}
      <AnimatePresence>
        {userScrolledUp && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
          >
            <Button
              onClick={scrollToBottom}
              size="sm"
              variant="secondary"
              className="h-7 gap-1 rounded-full px-3 text-[11px] shadow-lg"
            >
              <ArrowDown className="h-3 w-3" />
              Latest events
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
