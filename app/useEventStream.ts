import { useEffect, useState } from "react";

interface ChatMessage {
  user: string;
  message: string;
}

export function useEventStream(href: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
    console.log('☠️☠️☠️')
    const eventSource = new EventSource(href);
    console.log("🚀 ~ file: useEventStream.ts ~ line 14 ~ eventSource", eventSource)

    eventSource.addEventListener("message", handler);
    eventSource.addEventListener("user-joined", handler);
    eventSource.addEventListener("user-left", handler);
    console.log("🚀 ~ file: useEventStream.ts ~ line 19 ~ eventSource", eventSource)
    function handler(event: MessageEvent) {
      console.log("🚀 ~ file: useEventStream.ts ~ line 18 ~ event", event);
      const { user, message, users } = JSON.parse(event.data);

      setMessages((messages) => [
        ...messages,
        { user: user, message: message },
      ]);
      setUsers([...users]);
    }

    return () => eventSource.close();
  }, [href]);

  return { messages, users };
}
