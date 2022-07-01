import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { getSessionUser, getUsers, sendMessage } from "~/chat.server";
import { destroySession, getSession } from "~/session.server";
import { useEventStream } from "~/useEventStream";

import { Button, Input, Title, Text } from "@mantine/core";

const MAX_MESSAGE_LENGTH = 256;

interface LoaderData {
  user: string;
  users: string[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getSessionUser(request);
  return json<LoaderData>({ user, users: getUsers() });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await getSessionUser(request);
  const formData = await request.formData();
  const action = String(formData.get("_action"));

  if (action === "logout") {
    const session = await getSession(request.headers.get("Cookie"));
    return redirect("/", {
      headers: { "Set-Cookie": await destroySession(session) },
    });
  }

  if (action === "send-message") {
    const message = String(formData.get("message")).slice(
      0,
      MAX_MESSAGE_LENGTH
    );
    if (message.length > 0) {
      sendMessage(user, message);
    }
  }

  return null;
};

export default function Chat() {
  const loaderData = useLoaderData<LoaderData>();
  const transition = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const { messages, users } = useEventStream("/live/chat");

  function getBackgroundColor(stringInput: string) {
    const stringUniqueHash = [...stringInput].reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return `hsl(${stringUniqueHash % 360}, 95%, 70%)`;
  }
  useEffect(() => {
    if (transition.state === "submitting") {
      formRef.current?.reset();
    }
  }, [transition.state]);

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <header style={{ marginBlock: "1rem" }}>
        <Title style={{ marginBlock: "0" }}>Remix Chat</Title>
        <Form method="post">
          <button type="submit" name="_action" value="logout" className="btn">
            Logout
          </button>
        </Form>
      </header>
      <section>
        <div>
          <Text>
            Logged in as <strong>{loaderData.user}</strong>
          </Text>
        </div>
        <div title={`Users: ${[...users].join(", ")}`}>
          <Text>
            <strong>{users.length}</strong> Logged in users
          </Text>
        </div>
      </section>
      <section>
        <ul className="list-none p-0 ">
          {messages.map(({ user, message }, index) => (
            <li
              className="w-fit rounded-2xl p-3"
              key={index}
              style={{ backgroundColor: getBackgroundColor(user) }}
            >
              <strong>{user}: </strong>
              {message}
            </li>
          ))}
        </ul>
        <Form ref={formRef} method="post" replace className="flex">
          <Input type="text" name="message" />
          <Button type="submit" name="_action" value="send-message">
            Send
          </Button>
        </Form>
      </section>
    </main>
  );
}
