import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useLoaderData, useTransition } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { getSessionUser, getUsers, sendMessage } from "~/chat.server";
import { destroySession, getSession } from "~/session.server";
import { useEventStream } from "~/useEventStream";
import DropDown from "~/components/DropDown";

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

  useEffect(() => {
    if (transition.state === "submitting") {
      formRef.current?.reset();
    }
  }, [transition.state]);

  return (
    <main className="grid h-full place-content-center">
      <div className="card prose">
        <div className="card-body bg-primary p-8">
          <header style={{ marginBlock: "1rem" }}>
            <Form className="flex items-center justify-between" method="post">
              <div className="card-actions">
                <button
                  type="submit"
                  name="_action"
                  value="logout"
                  className="btn"
                >
                  Logout
                </button>
              </div>
              <DropDown />
            </Form>
          </header>
          <section>
            <div>
              <p className="text-accent-content">
                Logged in as{" "}
                <strong className="text-accent-content">
                  {loaderData.user}
                </strong>
              </p>
            </div>
            <div title={`Users: ${[...users].join(", ")}`}>
              <p className="text-accent-content">
                <strong className="text-accent-content">{users.length}</strong>{" "}
                Logged in users
              </p>
            </div>
          </section>
          <section>
            <ul className="max-h-72 list-none overflow-auto p-0	">
              {messages.map(({ user, message }, index) => (
                <li
                  className="w-fit rounded-2xl bg-secondary p-3 text-accent-content"
                  key={index}
                >
                  <strong className="text-accent-content"> {user}: </strong>
                  {message}
                </li>
              ))}
            </ul>
            <Form ref={formRef} method="post" replace className="flex">
              <input
                type="text"
                name="message"
                className="input w-full max-w-xs"
              />
              <div className="card-actions">
                <button
                  className="btn btn-accent"
                  type="submit"
                  name="_action"
                  value="send-message"
                >
                  Send
                </button>
              </div>
            </Form>
          </section>
        </div>
      </div>
    </main>
  );
}
