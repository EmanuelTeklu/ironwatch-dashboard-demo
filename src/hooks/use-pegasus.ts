import { useState, useRef, useCallback, useEffect } from "react";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";
import type { PegasusThread } from "@/lib/thread-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsePegasusOptions {
  context?: Record<string, unknown>;
  viewContext?: string;
  threadId?: string;
  threadHistory?: PegasusThread["history"];
  onThreadUpdate?: (
    id: string,
    updates: Partial<Pick<PegasusThread, "title" | "messages" | "history">>,
  ) => void;
}

interface UsePegasusReturn {
  messages: PegasusMessage[];
  isStreaming: boolean;
  streamingThinking: string;
  addSystemMessage: (
    content: string,
    type?: PegasusMessageType,
    timestamp?: string,
  ) => PegasusMessage;
  sendMessage: (userContent: string) => Promise<void>;
  clearMessages: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let idCounter = 0;

function nextId(): string {
  idCounter += 1;
  return `peg-${idCounter}`;
}

function nowTimestamp(): string {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// SSE line parser — extracts JSON payloads from `data: ...` lines
// ---------------------------------------------------------------------------

interface SseChunk {
  done: boolean;
  text?: string;
  thinking?: string;
  thinkingStart?: boolean;
  error?: string;
}

function parseSseLine(line: string): SseChunk | null {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data: ")) return null;

  const payload = trimmed.slice(6);
  if (payload === "[DONE]") return { done: true };

  try {
    const parsed = JSON.parse(payload) as {
      text?: string;
      thinking?: string;
      thinkingStart?: boolean;
      error?: string;
    };
    if (parsed.error) return { done: false, error: parsed.error };
    return {
      done: false,
      text: parsed.text,
      thinking: parsed.thinking,
      thinkingStart: parsed.thinkingStart,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function usePegasus(options: UsePegasusOptions = {}): UsePegasusReturn {
  const { context, viewContext, threadId, threadHistory, onThreadUpdate } =
    options;

  const [messages, setMessages] = useState<PegasusMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingThinking, setStreamingThinking] = useState("");

  // Fallback history for non-thread mode (DashboardLayout sidebar usage)
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>(
    [],
  );

  // Track previous threadId so we can swap messages on thread switch
  const prevThreadIdRef = useRef<string | undefined>(threadId);

  // When the active thread changes, load that thread's messages
  useEffect(() => {
    if (threadId !== prevThreadIdRef.current) {
      prevThreadIdRef.current = threadId;
      // Messages are rebuilt from thread data — clear local state
      setMessages([]);
      setIsStreaming(false);
      setStreamingThinking("");
    }
  }, [threadId]);

  // Get the effective history for API calls
  const getHistory = useCallback((): {
    role: "user" | "assistant";
    content: string;
  }[] => {
    if (threadHistory) {
      return [...threadHistory];
    }
    return historyRef.current;
  }, [threadHistory]);

  // -------------------------------------------------------------------------
  // addSystemMessage — append a non-AI event message to the feed
  // -------------------------------------------------------------------------
  const addSystemMessage = useCallback(
    (
      content: string,
      type: PegasusMessageType = "info",
      timestamp?: string,
    ): PegasusMessage => {
      const message: PegasusMessage = {
        id: nextId(),
        role: "system",
        content,
        timestamp: timestamp ?? nowTimestamp(),
        type,
      };
      setMessages((prev) => [...prev, message]);

      // Persist to thread if active
      if (threadId && onThreadUpdate) {
        onThreadUpdate(threadId, {
          messages: [...messages, message],
        });
      }

      return message;
    },
    [threadId, onThreadUpdate, messages],
  );

  // -------------------------------------------------------------------------
  // sendMessage — send a manager message and stream the Claude response
  // -------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (userContent: string): Promise<void> => {
      if (!userContent.trim()) return;

      // 1. Add manager message to the feed
      const managerMsg: PegasusMessage = {
        id: nextId(),
        role: "manager",
        content: userContent.trim(),
        timestamp: nowTimestamp(),
        type: "info",
      };
      setMessages((prev) => [...prev, managerMsg]);

      // 2. Update conversation history
      const history = getHistory();
      const updatedHistory = [
        ...history,
        { role: "user" as const, content: userContent.trim() },
      ];

      if (!threadHistory) {
        historyRef.current = updatedHistory;
      }

      // 3. Create placeholder for streaming response
      const aiMsgId = nextId();
      const aiMsg: PegasusMessage = {
        id: aiMsgId,
        role: "pegasus",
        content: "",
        timestamp: nowTimestamp(),
        type: "ai",
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsStreaming(true);
      setStreamingThinking("");

      let fullResponse = "";
      let thinkingAccumulator = "";

      try {
        const res = await fetch("/api/pegasus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: updatedHistory,
            context,
            viewContext,
          }),
        });

        if (!res.ok) {
          throw new Error(`Pegasus API error: ${res.status} ${res.statusText}`);
        }

        if (!res.body) {
          throw new Error("No response body from Pegasus API");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const chunk = parseSseLine(line);
            if (!chunk) continue;
            if (chunk.done) break;
            if (chunk.error) throw new Error(chunk.error);

            if (chunk.thinking) {
              thinkingAccumulator += chunk.thinking;
              setStreamingThinking(thinkingAccumulator);
            }

            if (chunk.text) {
              fullResponse += chunk.text;
              const updatedContent = fullResponse;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, content: updatedContent }
                    : msg,
                ),
              );
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim()) {
          const chunk = parseSseLine(buffer);
          if (chunk && !chunk.done) {
            if (chunk.thinking) {
              thinkingAccumulator += chunk.thinking;
              setStreamingThinking(thinkingAccumulator);
            }
            if (chunk.text) {
              fullResponse += chunk.text;
              const updatedContent = fullResponse;
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiMsgId
                    ? { ...msg, content: updatedContent }
                    : msg,
                ),
              );
            }
          }
        }

        // 4. Record assistant response in conversation history
        const finalHistory = [
          ...updatedHistory,
          { role: "assistant" as const, content: fullResponse },
        ];

        if (!threadHistory) {
          historyRef.current = finalHistory;
        }

        // Persist to thread if active
        if (threadId && onThreadUpdate) {
          setMessages((currentMessages) => {
            onThreadUpdate(threadId, {
              messages: currentMessages,
              history: finalHistory,
            });
            return currentMessages;
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error from Pegasus";

        const errorMsg: PegasusMessage = {
          id: nextId(),
          role: "system",
          content: `Error: ${errorMessage}`,
          timestamp: nowTimestamp(),
          type: "danger",
        };
        setMessages((prev) => [...prev, errorMsg]);

        if (!fullResponse) {
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMsgId));
        }
      } finally {
        setIsStreaming(false);
        setStreamingThinking("");
      }
    },
    [context, viewContext, getHistory, threadId, threadHistory, onThreadUpdate],
  );

  // -------------------------------------------------------------------------
  // clearMessages — reset the feed and conversation history
  // -------------------------------------------------------------------------
  const clearMessages = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
  }, []);

  return {
    messages,
    isStreaming,
    streamingThinking,
    addSystemMessage,
    sendMessage,
    clearMessages,
  };
}
