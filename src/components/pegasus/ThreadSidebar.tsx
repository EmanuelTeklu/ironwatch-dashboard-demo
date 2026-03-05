// ---------------------------------------------------------------------------
// ThreadSidebar — left panel for managing Pegasus conversation threads
// ---------------------------------------------------------------------------

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeft,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { PegasusThread } from "@/lib/thread-types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ThreadSidebarProps {
  readonly threads: readonly PegasusThread[];
  readonly activeThreadId: string | null;
  readonly onCreateThread: () => void;
  readonly onSwitchThread: (id: string) => void;
  readonly onRenameThread: (id: string, title: string) => void;
  readonly onDeleteThread: (id: string) => void;
  readonly onOpenPhone?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getLastMessagePreview(thread: PegasusThread): string {
  if (thread.messages.length === 0) return "No messages yet";
  const last = thread.messages[thread.messages.length - 1];
  const text = last.content.slice(0, 80);
  return text.length < last.content.length ? `${text}...` : text;
}

function sortByUpdated(
  threads: readonly PegasusThread[],
): readonly PegasusThread[] {
  return [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

// ---------------------------------------------------------------------------
// Thread item with inline rename
// ---------------------------------------------------------------------------

interface ThreadItemProps {
  readonly thread: PegasusThread;
  readonly isActive: boolean;
  readonly onClick: () => void;
  readonly onRename: (title: string) => void;
  readonly onDelete: () => void;
}

function ThreadItem({
  thread,
  isActive,
  onClick,
  onRename,
  onDelete,
}: ThreadItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(thread.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartRename = useCallback(() => {
    setMenuOpen(false);
    setIsRenaming(true);
    setRenameValue(thread.title);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [thread.title]);

  const handleFinishRename = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== thread.title) {
      onRename(trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, thread.title, onRename]);

  const handleRenameKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleFinishRename();
      } else if (e.key === "Escape") {
        setIsRenaming(false);
      }
    },
    [handleFinishRename],
  );

  const handleDelete = useCallback(() => {
    setMenuOpen(false);
    onDelete();
  }, [onDelete]);

  return (
    <div
      className={cn(
        "group relative rounded-lg px-3 py-2.5 transition-colors cursor-pointer",
        isActive
          ? "bg-purple-500/15 border border-purple-500/30"
          : "hover:bg-secondary/50 border border-transparent",
      )}
      onClick={isRenaming ? undefined : onClick}
    >
      {/* Title */}
      {isRenaming ? (
        <input
          ref={inputRef}
          value={renameValue}
          onChange={(e) => setRenameValue(e.target.value)}
          onBlur={handleFinishRename}
          onKeyDown={handleRenameKeyDown}
          className="w-full rounded bg-secondary px-1.5 py-0.5 text-sm text-foreground outline-none ring-1 ring-purple-500/40"
        />
      ) : (
        <p
          className={cn(
            "truncate text-sm font-medium",
            isActive ? "text-purple-300" : "text-foreground",
          )}
        >
          {thread.title}
        </p>
      )}

      {/* Preview + time */}
      <p className="mt-0.5 truncate text-[11px] text-muted-foreground/70">
        {getLastMessagePreview(thread)}
      </p>
      <p className="mt-0.5 text-[10px] text-muted-foreground/50">
        {formatRelativeTime(thread.updatedAt)}
      </p>

      {/* Menu button */}
      {!isRenaming && (
        <div className="absolute right-2 top-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-opacity",
              "hover:bg-secondary hover:text-foreground",
              menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-7 z-50 w-32 rounded-md border border-border bg-card py-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartRename();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
                >
                  <Pencil className="h-3 w-3" />
                  Rename
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ThreadSidebar({
  threads,
  activeThreadId,
  onCreateThread,
  onSwitchThread,
  onRenameThread,
  onDeleteThread,
  onOpenPhone,
}: ThreadSidebarProps) {
  const navigate = useNavigate();
  const sorted = sortByUpdated(threads);

  return (
    <div className="flex h-full w-[280px] min-w-[280px] flex-col border-r border-border bg-card/50">
      {/* Header with logo + new thread button */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <img
            src="/ironwatch-logo.png"
            alt="IronWatch"
            className="h-6 w-auto object-contain"
          />
        </div>
        <Button
          onClick={onCreateThread}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
          title="New conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Click + to start one
            </p>
          </div>
        )}
        {sorted.map((thread) => (
          <ThreadItem
            key={thread.id}
            thread={thread}
            isActive={thread.id === activeThreadId}
            onClick={() => onSwitchThread(thread.id)}
            onRename={(title) => onRenameThread(thread.id, title)}
            onDelete={() => onDeleteThread(thread.id)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Operations
        </button>
        {onOpenPhone && (
          <button
            onClick={onOpenPhone}
            className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-purple-500/10 hover:text-purple-300"
            title="Phone engagement"
          >
            <Phone className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
