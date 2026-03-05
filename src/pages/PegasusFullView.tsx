// ---------------------------------------------------------------------------
// PegasusFullView — full-screen threaded chat UI (no DashboardLayout)
// ---------------------------------------------------------------------------

import { useState } from "react";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { ThreadSidebar } from "@/components/pegasus/ThreadSidebar";
import {
  ActiveThreadPanel,
  EmptyState,
} from "@/components/pegasus/ActiveThreadPanel";
import { PhoneEngagement } from "@/components/PhoneEngagement";

export default function PegasusFullView() {
  const {
    threads,
    activeThread,
    activeThreadId,
    createThread,
    switchThread,
    deleteThread,
    renameThread,
    messages,
    isStreaming,
    streamingThinking,
    sendMessage,
  } = usePegasusContext();

  const [phoneOpen, setPhoneOpen] = useState(false);

  const handleCreateThread = () => {
    createThread();
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Thread sidebar */}
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onCreateThread={handleCreateThread}
        onSwitchThread={switchThread}
        onRenameThread={renameThread}
        onDeleteThread={deleteThread}
        onOpenPhone={() => setPhoneOpen(true)}
      />

      {/* Main panel */}
      {activeThread ? (
        <ActiveThreadPanel
          threadTitle={activeThread.title}
          messages={messages}
          isStreaming={isStreaming}
          streamingThinking={streamingThinking}
          onSendMessage={sendMessage}
          onRenameThread={(title) => renameThread(activeThread.id, title)}
        />
      ) : (
        <EmptyState onStart={handleCreateThread} />
      )}

      {/* Phone engagement modal */}
      <PhoneEngagement isOpen={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </div>
  );
}
