import { usePegasusContext } from "@/contexts/PegasusContext";
import { PegasusFeed } from "@/components/PegasusFeed";

export default function PegasusFullView() {
  const { messages, isStreaming, sendMessage } = usePegasusContext();

  return (
    <div className="flex flex-col h-full">
      <PegasusFeed
        messages={messages}
        isStreaming={isStreaming}
        onSendMessage={sendMessage}
        className="flex-1"
      />
    </div>
  );
}
