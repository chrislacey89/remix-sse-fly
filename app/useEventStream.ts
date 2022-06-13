import { useEffect, useState } from "react";

interface ChatMessage {
  user: string;
  message: string;
}

export function useEventStream(href: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  useEffect(() => {
    const eventSource = new EventSource(href);

    eventSource.addEventListener("message", handler);
    eventSource.addEventListener("user-joined", handler);
    eventSource.addEventListener("user-left", handler);
    function handler(event: MessageEvent) {
      const { user, message, users } = JSON.parse(event.data);

      setMessages((messages) => [
        ...messages,
        { user: user, message: message },
      ]);
      setUsers([...users]);
    }

    return () => {
      eventSource.removeEventListener("message", handler);
      eventSource.removeEventListener("user-joined", handler);
      eventSource.removeEventListener("user-left", handler);

      eventSource.close()};
  }, [href]);

  return { messages, users };
}
