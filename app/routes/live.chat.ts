// resource route - for more see: https://remix.run/docs/en/v1/guides/resource-routes
import type { LoaderFunction } from "@remix-run/node";
import type { ChatMessage } from "~/chat";

import {
  addUser,
  chat,
  doesUserExist,
  getSessionUser,
  getUsers,
  removeUser,
} from "~/chat.server";

import eventStream from "~/eventStream";

export const loader: LoaderFunction = async ({ request }) => {
  if (!request.signal) return new Response(null, { status: 500 });
  const user = await getSessionUser(request);
console.log('global', global)
  // For more on ReadableStreams: https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const handleChatMessage = ({ user, message }: ChatMessage) => {
        console.log("message", { user, message });
        controller.enqueue(encoder.encode("event: message\n"));
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ user, message })}\n\n`)
        );
      };

      const handleUserJoined = (user: string) => {
        console.log("user joined", { user });
        controller.enqueue(encoder.encode("event: user-joined\n"));
        controller.enqueue(encoder.encode(`data: ${user}\n\n`));
      };

      const handleUserLeft = (user: string) => {
        console.log("user left", { user });
        controller.enqueue(encoder.encode("event: user-left\n"));
        controller.enqueue(encoder.encode(`data: ${user}\n\n`));
      };

      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;

        chat.removeListener("message", handleChatMessage);
        chat.removeListener("user-joined", handleUserJoined);
        chat.removeListener("user-left", handleUserLeft);
        request.signal.removeEventListener("abort", close);
        controller.close();

        removeUser(user);
      };

      chat.addListener("message", handleChatMessage);
      chat.addListener("user-joined", handleUserJoined);
      chat.addListener("user-left", handleUserLeft);
      request.signal.addEventListener("abort", close);

      if (request.signal.aborted) {
        close();
        return;
      }

      if (!doesUserExist(user)) {
        addUser(user);
        console.log("users", getUsers());
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-transform",
    },
  });
};
