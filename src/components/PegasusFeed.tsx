import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronDown, ChevronRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Left-border accent color per message type */
const BORDER_COLORS: Record<PegasusMessageType, string> = {
  info: "border-l-gray-500",
  warning: "border-l-orange-400",
  danger: "border-l-red-500",
  success: "border-l-green-500",
  ai: "border-l-purple-400",
  action: "border-l-blue-400",
};

/** Matches US phone numbers in +1XXXXXXXXXX format */
const PHONE_REGEX = /(\+1\d{10})/g;

/** Minimum distance from bottom (px) before we consider "scrolled up" */
const SCROLL_THRESHOLD = 80;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PegasusFeedProps {
  readonly messages: readonly PegasusMessage[];
  readonly isStreaming: boolean;
  readonly streamingThinking?: string;
  readonly onSendMessage: (content: string) => void;
  readonly className?: string;
  readonly placeholder?: string;
  readonly contextLabel?: string;
  /** When true, hides the top "Pegasus" header bar (e.g. when embedded in a panel that already has its own title) */
  readonly hideHeader?: boolean;
  /** Optional suggestion buttons rendered above the input bar */
  readonly suggestions?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Renders message content with phone numbers as tappable links */
function MessageContent({ content }: { readonly content: string }) {
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

/** iMessage-style three pulsing dots */
function ThinkingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-1.5 w-1.5 rounded-full bg-purple-400"
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [0.85, 1.15, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/** Collapsible section for Claude's extended thinking */
function ThinkingSection({ thinking }: { readonly thinking: string }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!thinking) return null;

  return (
    <div className="mb-1">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 text-[10px] text-purple-400/70 transition-colors hover:text-purple-400"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        Pegasus reasoning
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-1 max-h-40 overflow-y-auto rounded border border-purple-500/20 bg-purple-500/5 px-2.5 py-2 font-mono text-[11px] leading-relaxed text-purple-300/70">
              {thinking}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Individual message bubble with slide-in animation */
function MessageBubble({
  message,
  isActiveStream,
  thinking,
}: {
  readonly message: PegasusMessage;
  readonly isActiveStream?: boolean;
  readonly thinking?: string;
}) {
  const isManager = message.role === "manager";
  const borderColor = BORDER_COLORS[message.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn("flex flex-col gap-0.5", isManager && "items-end")}
    >
      {/* Thinking section — shown above Pegasus messages when available */}
      {!isManager && thinking && <ThinkingSection thinking={thinking} />}

      <div
        className={cn(
          "max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
          "border-l-2 shadow-sm",
          borderColor,
          isManager
            ? "bg-primary/10 text-foreground"
            : "border border-border bg-card text-foreground",
          isActiveStream && "pegasus-streaming-glow",
        )}
      >
        <MessageContent content={message.content} />
      </div>

      <span className="px-1 text-[10px] text-muted-foreground/50">
        {message.timestamp}
      </span>
    </motion.div>
  );
}

/** "Thinking" placeholder bubble before content arrives */
function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-0.5"
    >
      <div className="max-w-[85%] rounded-xl border border-border border-l-2 border-l-purple-400 bg-card px-3.5 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <ThinkingDots />
          <span className="pegasus-shimmer text-[11px] text-purple-400/80">
            Pegasus is thinking...
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/** Floating "scroll to bottom" button */
function ScrollToBottomButton({ onClick }: { readonly onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2"
    >
      <Button
        onClick={onClick}
        size="sm"
        variant="secondary"
        className="h-7 gap-1 rounded-full px-3 text-[11px] shadow-lg"
      >
        <ArrowDown className="h-3 w-3" />
        New messages
      </Button>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function PegasusFeed({
  messages,
  isStreaming,
  streamingThinking,
  onSendMessage,
  className,
  placeholder,
  contextLabel,
  hideHeader = false,
  suggestions,
}: PegasusFeedProps) {
  const [input, setInput] = useState("");
  const [userScrolledUp, setUserScrolledUp] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // -----------------------------------------------------------------------
  // Scroll management
  // -----------------------------------------------------------------------

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

  /** Determine whether the last message is still being streamed */
  const lastMessage =
    messages.length > 0 ? messages[messages.length - 1] : null;
  const showThinkingBubble =
    isStreaming && (!lastMessage || lastMessage.role === "manager");

  // Auto-scroll when new content arrives and user hasn't scrolled up
  useEffect(() => {
    if (!userScrolledUp) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolledUp, isStreaming]);

  // -----------------------------------------------------------------------
  // Input handling
  // -----------------------------------------------------------------------

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setInput("");
    setUserScrolledUp(false);
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

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-xl border border-border",
        "bg-card/80 backdrop-blur-md",
        className,
      )}
    >
      {/* Header (hidden when embedded in a panel with its own title bar) */}
      {!hideHeader && (
        <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
          <img
            src="/pegasus.png"
            alt="Pegasus"
            className="h-5 w-5 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Pegasus
            </span>
            {contextLabel && (
              <span className="text-[10px] text-muted-foreground/70">
                {contextLabel}
              </span>
            )}
          </div>
          {isStreaming && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-auto flex items-center gap-1.5"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
              <span className="text-[10px] text-purple-400/80">streaming</span>
            </motion.span>
          )}
        </div>
      )}

      {/* Message feed */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3.5 py-3"
        style={{ minHeight: 0 }}
      >
        <div className="flex flex-col gap-3">
          {messages.map((msg, idx) => {
            const isLast = idx === messages.length - 1;
            const isActivelyStreaming =
              isLast && isStreaming && msg.role !== "manager";
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                isActiveStream={isActivelyStreaming}
                thinking={isActivelyStreaming ? streamingThinking : undefined}
              />
            );
          })}

          {/* Thinking bubble: shown when streaming but no AI content yet */}
          <AnimatePresence>
            {showThinkingBubble && <ThinkingBubble key="__thinking__" />}
          </AnimatePresence>
          <div ref={bottomRef} className="h-px" />
        </div>
      </div>

      {/* Scroll-to-bottom overlay */}
      <AnimatePresence>
        {userScrolledUp && <ScrollToBottomButton onClick={scrollToBottom} />}
      </AnimatePresence>

      {/* Suggestion buttons (hidden during streaming) */}
      {suggestions}

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-border/60 px-3.5 py-3">
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "Ask Pegasus anything..."}
          disabled={isStreaming}
          className={cn(
            "h-10 rounded-lg border-0 bg-secondary/50 text-sm",
            "placeholder:text-muted-foreground/50",
            "focus-visible:ring-1 focus-visible:ring-purple-500/40",
            "focus-visible:shadow-[0_0_8px_rgba(168,85,247,0.15)]",
            "transition-shadow duration-200",
            isStreaming && "opacity-60",
          )}
        />
        <Button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          size="icon"
          variant="ghost"
          className={cn(
            "h-10 w-10 shrink-0 rounded-lg text-primary",
            "transition-all duration-200",
            "hover:bg-primary/10 hover:shadow-[0_0_8px_rgba(168,85,247,0.2)]",
            "disabled:opacity-40",
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
