import { useState, useRef, useCallback } from "react";
import type { PegasusMessage, PegasusMessageType } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UsePegasusOptions {
  context?: Record<string, unknown>;
  viewContext?: string;
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
  const { context, viewContext } = options;

  const [messages, setMessages] = useState<PegasusMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingThinking, setStreamingThinking] = useState("");

  // Full conversation history for Claude context (role + content pairs)
  const historyRef = useRef<{ role: "user" | "assistant"; content: string }[]>(
    [],
  );

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
      return message;
    },
    [],
  );

  // -------------------------------------------------------------------------
  // sendMessage — send a manager message and stream the Claude response
  // -------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (userContent: string): Promise<void> => {
      if (!userContent.trim()) return;

      // 1. Add manager message to the feed (immutable append)
      const managerMsg: PegasusMessage = {
        id: nextId(),
        role: "manager",
        content: userContent.trim(),
        timestamp: nowTimestamp(),
        type: "info",
      };
      setMessages((prev) => [...prev, managerMsg]);

      // 2. Update conversation history for Claude
      historyRef.current = [
        ...historyRef.current,
        { role: "user", content: userContent.trim() },
      ];

      // 3. Create a placeholder for the streaming response
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
            messages: historyRef.current,
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

          // Process complete lines from the buffer
          const lines = buffer.split("\n");
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const chunk = parseSseLine(line);
            if (!chunk) continue;
            if (chunk.done) break;
            if (chunk.error) throw new Error(chunk.error);

            // Accumulate thinking content
            if (chunk.thinking) {
              thinkingAccumulator += chunk.thinking;
              setStreamingThinking(thinkingAccumulator);
            }

            if (chunk.text) {
              fullResponse += chunk.text;
              const updatedContent = fullResponse;

              // Immutable update: map over messages, replace content for streaming ID
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

        // Process any remaining buffer content
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
        historyRef.current = [
          ...historyRef.current,
          { role: "assistant", content: fullResponse },
        ];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error from Pegasus";

        // Add error as a danger message in the feed
        const errorMsg: PegasusMessage = {
          id: nextId(),
          role: "system",
          content: `Error: ${errorMessage}`,
          timestamp: nowTimestamp(),
          type: "danger",
        };
        setMessages((prev) => [...prev, errorMsg]);

        // Remove the empty AI placeholder if no content was streamed
        if (!fullResponse) {
          setMessages((prev) => prev.filter((msg) => msg.id !== aiMsgId));
        }
      } finally {
        setIsStreaming(false);
        setStreamingThinking("");
      }
    },
    [context, viewContext],
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
