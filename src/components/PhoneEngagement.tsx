// ---------------------------------------------------------------------------
// PhoneEngagement — modal for connecting a phone number to Pegasus
// ---------------------------------------------------------------------------

import { useState, useEffect, useCallback, useRef } from "react";
import { Phone, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type EngagementStatus = "idle" | "connecting" | "active" | "error";

interface SmsReply {
  readonly from: string;
  readonly body: string;
  readonly timestamp: string;
  readonly direction: "inbound" | "outbound";
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PhoneEngagementProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

// ---------------------------------------------------------------------------
// E.164 validation
// ---------------------------------------------------------------------------

function isValidE164(phone: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(phone);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PhoneEngagement({ isOpen, onClose }: PhoneEngagementProps) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<EngagementStatus>("idle");
  const [error, setError] = useState("");
  const [replies, setReplies] = useState<readonly SmsReply[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTimestampRef = useRef<string>("");

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  const startPolling = useCallback((phoneNumber: string) => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
    }

    pollRef.current = setInterval(async () => {
      try {
        const params = new URLSearchParams();
        if (lastTimestampRef.current) {
          params.set("since", lastTimestampRef.current);
        }
        params.set("phone", phoneNumber);

        const res = await fetch(`/api/sms/webhook?${params.toString()}`);
        if (!res.ok) return;

        const data = (await res.json()) as { replies: SmsReply[] };
        if (data.replies.length > 0) {
          setReplies((prev) => [...prev, ...data.replies]);
          lastTimestampRef.current =
            data.replies[data.replies.length - 1].timestamp;
        }
      } catch {
        // Polling failure is non-fatal
      }
    }, 3000);
  }, []);

  const handleConnect = useCallback(async () => {
    if (!isValidE164(phone)) {
      setError("Enter a valid phone number (e.g., +12025551234)");
      return;
    }

    setStatus("connecting");
    setError("");

    try {
      // Register phone as engaged
      await fetch("/api/sms/webhook", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      // Send intro SMS
      const res = await fetch("/api/phone/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Connection failed" }));
        throw new Error(data.error ?? "Connection failed");
      }

      setStatus("active");
      startPolling(phone);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [phone, startPolling]);

  const handleClose = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setStatus("idle");
    setPhone("");
    setError("");
    setReplies([]);
    lastTimestampRef.current = "";
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-foreground">
              Phone Engagement
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          {status === "idle" || status === "error" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter a phone number to connect someone to Pegasus via SMS.
                They'll receive an intro message and can text back for
                real-time operational intelligence.
              </p>
              <div className="space-y-2">
                <Input
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="+12025551234"
                  className="font-mono"
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
              <Button
                onClick={handleConnect}
                disabled={!phone.trim()}
                className="w-full gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                Connect
              </Button>
            </div>
          ) : status === "connecting" ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <p className="mt-3 text-sm text-muted-foreground">
                Sending intro message to {phone}...
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-xs font-medium text-success">
                  Active
                </span>
                <span className="text-xs text-muted-foreground">{phone}</span>
              </div>

              {/* Conversation */}
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border border-border bg-secondary/30 p-3">
                {replies.length === 0 ? (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Waiting for reply...
                  </p>
                ) : (
                  replies.map((reply, i) => (
                    <div
                      key={i}
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-xs",
                        reply.direction === "inbound"
                          ? "bg-card text-foreground"
                          : "ml-auto bg-purple-500/15 text-purple-200",
                      )}
                    >
                      {reply.body}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
