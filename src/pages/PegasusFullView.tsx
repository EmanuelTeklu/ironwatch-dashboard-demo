import { Bot } from "lucide-react";
import { usePegasusContext } from "@/contexts/PegasusContext";
import { PegasusFeed } from "@/components/PegasusFeed";

export default function PegasusFullView() {
  const { messages, isStreaming, streamingThinking, sendMessage } =
    usePegasusContext();

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
            <Bot className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Pegasus &mdash; General Operations
            </h1>
            <p className="text-sm text-muted-foreground">
              Ask about scheduling, guard availability, site history, or any
              operational question
            </p>
          </div>
        </div>
      </header>
      <PegasusFeed
        messages={messages}
        isStreaming={isStreaming}
        streamingThinking={streamingThinking}
        onSendMessage={sendMessage}
        className="flex-1"
      />
    </div>
  );
}
