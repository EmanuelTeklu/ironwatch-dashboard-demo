// ---------------------------------------------------------------------------
// ActiveThreadPanel — main chat area for the active Pegasus thread
// ---------------------------------------------------------------------------

import { useState, useCallback, type KeyboardEvent } from "react";
import { Pencil, Check, X } from "lucide-react";
import { PegasusFeed } from "@/components/PegasusFeed";
import type { PegasusMessage } from "@/lib/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ActiveThreadPanelProps {
  readonly threadTitle: string;
  readonly messages: readonly PegasusMessage[];
  readonly isStreaming: boolean;
  readonly streamingThinking?: string;
  readonly onSendMessage: (content: string) => void;
  readonly onRenameThread: (title: string) => void;
}

// ---------------------------------------------------------------------------
// Editable title component
// ---------------------------------------------------------------------------

function EditableTitle({
  title,
  onRename,
}: {
  readonly title: string;
  readonly onRename: (title: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const startEditing = useCallback(() => {
    setEditValue(title);
    setIsEditing(true);
  }, [title]);

  const finishEditing = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  }, [editValue, title, onRename]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        finishEditing();
      } else if (e.key === "Escape") {
        cancelEditing();
      }
    },
    [finishEditing, cancelEditing],
  );

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          className="rounded bg-secondary px-2 py-1 text-lg font-semibold text-foreground outline-none ring-1 ring-purple-500/40"
        />
        <button
          onClick={finishEditing}
          className="flex h-6 w-6 items-center justify-center rounded text-success hover:bg-success/10"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancelEditing}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-secondary"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      <button
        onClick={startEditing}
        className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({ onStart }: { readonly onStart: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8">
      <img
        src="/pegasus.png"
        alt="Pegasus"
        className="mb-6 h-16 w-16 object-contain opacity-40"
      />
      <h2 className="text-xl font-semibold text-foreground">
        Start a new conversation with Pegasus
      </h2>
      <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
        Ask about tonight's operations, guard availability, site history, or any
        operational question.
      </p>
      <button
        onClick={onStart}
        className="mt-6 rounded-lg bg-purple-500/20 px-6 py-2.5 text-sm font-medium text-purple-300 transition-colors hover:bg-purple-500/30"
      >
        New conversation
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ActiveThreadPanel({
  threadTitle,
  messages,
  isStreaming,
  streamingThinking,
  onSendMessage,
  onRenameThread,
}: ActiveThreadPanelProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Thread title bar */}
      <div className="flex items-center border-b border-border/60 px-6 py-3">
        <EditableTitle title={threadTitle} onRename={onRenameThread} />
      </div>

      {/* Chat feed */}
      <PegasusFeed
        messages={messages}
        isStreaming={isStreaming}
        streamingThinking={streamingThinking}
        onSendMessage={onSendMessage}
        className="flex-1 rounded-none border-0"
        placeholder="Message Pegasus..."
      />
    </div>
  );
}

export { EmptyState };
