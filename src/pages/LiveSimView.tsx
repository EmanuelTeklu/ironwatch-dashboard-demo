import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { SimLogEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Zap, Shield, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const PHASES = ["grace", "eta", "review", "cascade", "filled"] as const;
type Phase = (typeof PHASES)[number];

const LOG_COLORS: Record<SimLogEntry["type"], string> = {
  info: "text-muted-foreground",
  warn: "text-warning",
  danger: "text-destructive",
  success: "text-success",
  ai: "text-ai",
  muted: "text-muted-foreground/50",
};

interface LiveSimViewProps {
  managerName: string;
}

export default function LiveSimView({ managerName }: LiveSimViewProps) {
  const [simOn, setSimOn] = useState(false);
  const [phase, setPhase] = useState<Phase | null>(null);
  const [log, setLog] = useState<SimLogEntry[]>([]);
  const [mgrActed, setMgrActed] = useState(false);
  const logEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const addLog = useCallback((msg: string, type: SimLogEntry["type"] = "info") => {
    setLog((p) => [
      ...p,
      {
        t: new Date().toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        msg,
        type,
      },
    ]);
  }, []);

  const runSim = useCallback(() => {
    setSimOn(true);
    setPhase("grace");
    setLog([]);
    setMgrActed(false);
    addLog("Shift start 23:00 — Columbia Park", "info");
    addLog("Scheduled guard: G. Terrell (Armed Officer)", "info");
    addLog("ElevenLabs agent placing confirmation call…", "ai");
    setTimeout(() => {
      addLog('AI: "Hi George, confirming your 11PM shift at Columbia Park. Are you on your way?"', "ai");
      setTimeout(() => {
        addLog("No answer — call went to voicemail", "warn");
        addLog("Starting 10-minute grace window", "info");
        setTimeout(() => {
          addLog("5 min — no clock-in. Sending SMS ping…", "warn");
          addLog('SMS → G. Terrell: "Reply with ETA or OUT"', "info");
          setTimeout(() => {
            setPhase("eta");
            addLog("10 min — grace period expired", "danger");
            addLog("AI agent calling G. Terrell again…", "ai");
            setTimeout(() => {
              addLog('G. Terrell: "Can\'t make it, car won\'t start"', "danger");
              addLog("Guard confirmed OUT", "danger");
              setPhase("review");
              addLog(`Alert sent to ${managerName} — Columbia Park (Armed) uncovered`, "warn");
            }, 2200);
          }, 2000);
        }, 2500);
      }, 1800);
    }, 1600);
  }, [addLog, managerName]);

  const approveCascade = useCallback(() => {
    setMgrActed(true);
    setPhase("cascade");
    addLog(`${managerName} approved cascade`, "success");
    addLog("Filtering armed-certified pool…", "info");
    setTimeout(() => {
      addLog("B. Adams — GRS 91 · 34/40hr · rested ✓", "success");
      addLog("J. Herrera — GRS 87 · 30/40hr · rested ✓", "success");
      addLog("F. Amoako — GRS 86 · rest violation ✗", "muted");
      addLog("G. Terrell — called out ✗", "muted");
      addLog("Armed pool: 2 eligible", "info");
      setTimeout(() => {
        addLog("AI agent calling #1: B. Adams…", "ai");
        setTimeout(() => {
          addLog('AI: "We have an open armed shift at Columbia Park. Overtime rate. Can you take it?"', "ai");
          setTimeout(() => {
            addLog('B. Adams: "Yeah, 20 minutes out"', "success");
            addLog("Shift accepted — writing to Connecteam", "success");
            addLog("THERMS roster updated", "info");
            addLog(`${managerName} notified`, "info");
            setPhase("filled");
            addLog("Columbia Park filled — 14 min total response", "success");
          }, 2200);
        }, 1800);
      }, 1200);
    }, 1400);
  }, [addLog, managerName]);

  const reset = () => {
    setSimOn(false);
    setPhase(null);
    setLog([]);
    setMgrActed(false);
  };

  if (!simOn) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Intro */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Simulates the hardest scenario: armed site no-show on a Friday night.
            ElevenLabs AI agent handles confirmation calls and cascade outreach.
            The armed-eligible pool shrinks to 2 guards after filtering.
          </p>
        </div>

        {/* Scenario card */}
        <div className="rounded-lg border border-armed/20 bg-armed/5 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-armed" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-armed">
              ARMED
            </span>
            <span className="text-sm font-semibold text-foreground">Columbia Park</span>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>942 S Wakefield St, Arlington</p>
            <p>Friday 23:00 · G. Terrell scheduled</p>
            <p>Tier A — high priority</p>
          </div>
        </div>

        {/* Flow steps */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="mb-4 text-sm font-semibold text-foreground">Response Flow</p>
          <div className="space-y-3">
            {[
              ["AI Confirm", "Voice call 15 min before shift start"],
              ["10m Grace", "System monitors for clock-in"],
              ["ETA Ping", "SMS if no clock-in detected"],
              ["Manager Review", `${managerName} decides: wait or cascade`],
              ["Armed Cascade", "Ranked SMS/call to armed pool"],
              ["Auto-Assign", "Write to Connecteam + THERMS"],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-[10px] font-bold text-primary">
                    {i + 1}
                  </div>
                  {i < 5 && <div className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={runSim} className="w-full gap-2" size="lg">
          <Zap className="h-4 w-4" />
          Simulate Call-Out
        </Button>
      </div>
    );
  }

  // Running state
  const phaseIdx = phase ? PHASES.indexOf(phase) : -1;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Phase tracker */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-4">
        {PHASES.map((p, i) => {
          const done = i < phaseIdx;
          const active = p === phase;
          return (
            <div key={p} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all",
                  done && "border-success bg-success/20 text-success",
                  active && "border-primary bg-primary/20 text-primary scale-110",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-wider",
                  active ? "text-primary" : done ? "text-success" : "text-muted-foreground"
                )}
              >
                {p}
              </span>
            </div>
          );
        })}
      </div>

      {/* Manager action */}
      <AnimatePresence>
        {phase === "review" && !mgrActed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-lg border-2 border-warning/50 bg-warning/5 p-5 shadow-[0_0_30px_-10px] shadow-warning/20"
          >
            <p className="mb-2 text-sm font-bold text-warning">⚡ Action Required</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Columbia Park (Armed, Tier A) is uncovered. G. Terrell confirmed out. 2 armed guards
              available.
            </p>
            <Button onClick={approveCascade} className="w-full gap-2">
              <Zap className="h-4 w-4" />
              Start Armed Cascade
            </Button>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Auto-cascade in 5:00 if no action
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System log */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <p className="text-xs font-semibold text-foreground">System Log</p>
          {phase === "filled" && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-6 gap-1 px-2 text-[11px]">
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          <div className="space-y-1.5">
            {log.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3 font-mono text-[11px]"
              >
                <span className="shrink-0 text-muted-foreground/60">{e.t}</span>
                <span className={LOG_COLORS[e.type]}>{e.msg}</span>
              </motion.div>
            ))}
            {phase && phase !== "filled" && phase !== "review" && (
              <span className="ml-16 inline-block text-primary animate-blink font-mono text-sm">
                ▍
              </span>
            )}
            <div ref={logEnd} />
          </div>
        </div>
      </div>
    </div>
  );
}
