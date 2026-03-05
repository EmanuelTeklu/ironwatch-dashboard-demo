import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_COLORS: Record<PegasusMessageType, string> = {
  info: "text-gray-400",
  warning: "text-orange-400",
  danger: "text-red-400",
  success: "text-green-400",
  ai: "text-purple-400",
  action: "text-blue-400",
};

/** Matches US phone numbers in +1XXXXXXXXXX format */
const PHONE_REGEX = /(\+1\d{10})/g;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PegasusFeedProps {
  messages: PegasusMessage[];
  isStreaming: boolean;
  onSendMessage: (content: string) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders message content with phone numbers as tappable links */
function MessageContent({ content }: { content: string }) {
  const parts = content.split(PHONE_REGEX);

  if (parts.length === 1) {
    return <span>{content}</span>;
  }

  return (
    <span>
      {parts.map((part, i) =>
        PHONE_REGEX.test(part) ? (
          <a
            key={i}
            href={`tel:${part}`}
            className="underline decoration-dotted underline-offset-2 hover:decoration-solid"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  );
}

function MessageBubble({ message }: { message: PegasusMessage }) {
  const isManager = message.role === "manager";
  const colorClass = MESSAGE_COLORS[message.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex flex-col gap-0.5",
        isManager && "items-end",
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed",
          isManager
            ? "bg-primary/15 text-foreground"
            : "bg-secondary/60",
          !isManager && colorClass,
        )}
      >
        <MessageContent content={message.content} />
      </div>
      <span className="px-1 text-[10px] text-muted-foreground/60">
        {message.timestamp}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PegasusFeed({
  messages,
  isStreaming,
  onSendMessage,
  className,
}: PegasusFeedProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
    inputRef.current?.focus();
  }, [input, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border border-border bg-card",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="text-sm" role="img" aria-label="Pegasus">
          🦅
        </span>
        <span className="text-xs font-semibold text-foreground">Pegasus</span>
        {isStreaming && (
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
            <span className="text-[10px] text-purple-400">thinking...</span>
          </span>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-3 py-3" style={{ height: "100%" }}>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Pegasus..."
          disabled={isStreaming}
          className="h-8 border-0 bg-secondary/50 text-sm placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/40"
        />
        <Button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0 text-primary hover:bg-primary/10"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
