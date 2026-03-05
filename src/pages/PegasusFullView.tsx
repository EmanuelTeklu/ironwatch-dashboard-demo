// ---------------------------------------------------------------------------
// PegasusFullView — operations center with live feed + chat sidebar
// LEFT/CENTER: Live operational event feed from the simulation
// RIGHT: Pegasus AI chat sidebar for asking operational questions
// ---------------------------------------------------------------------------

import { useState } from "react";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { ThreadSidebar } from "@/components/pegasus/ThreadSidebar";
import {
  ActiveThreadPanel,
  EmptyState,
} from "@/components/pegasus/ActiveThreadPanel";
import { OperationsFeed } from "@/components/pegasus/OperationsFeed";
import { PhoneEngagement } from "@/components/PhoneEngagement";
import { SuggestionButtons } from "@/components/pegasus/SuggestionButtons";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHAT_SIDEBAR_WIDTH = 420;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

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
    simulation,
    suggestions,
  } = usePegasusContext();

  const [phoneOpen, setPhoneOpen] = useState(false);

  const handleCreateThread = () => {
    createThread();
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Thread sidebar (narrow left) */}
      <ThreadSidebar
        threads={threads}
        activeThreadId={activeThreadId}
        onCreateThread={handleCreateThread}
        onSwitchThread={switchThread}
        onRenameThread={renameThread}
        onDeleteThread={deleteThread}
        onOpenPhone={() => setPhoneOpen(true)}
      />

      {/* Center: Live operations feed */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <OperationsFeed
          messages={messages}
          simTime={simulation.simTime}
          phase={simulation.phase}
          isRunning={simulation.isRunning}
          isPaused={simulation.isPaused}
          onPause={simulation.pause}
          onResume={simulation.resume}
          onReset={simulation.reset}
        />
      </div>

      {/* Right sidebar: Pegasus chat */}
      <div
        className="flex flex-col border-l border-border bg-card/50"
        style={{ width: CHAT_SIDEBAR_WIDTH, minWidth: CHAT_SIDEBAR_WIDTH }}
      >
        {activeThread ? (
          <ActiveThreadPanel
            threadTitle={activeThread.title}
            messages={messages}
            isStreaming={isStreaming}
            streamingThinking={streamingThinking}
            onSendMessage={sendMessage}
            onRenameThread={(title) => renameThread(activeThread.id, title)}
            suggestions={
              <SuggestionButtons
                phase={simulation.phase}
                siteStatuses={simulation.siteStatuses}
                isStreaming={isStreaming}
                onSend={sendMessage}
              />
            }
          />
        ) : (
          <EmptyState onStart={handleCreateThread} />
        )}
      </div>

      {/* Phone engagement modal */}
      <PhoneEngagement isOpen={phoneOpen} onClose={() => setPhoneOpen(false)} />
    </div>
  );
}
