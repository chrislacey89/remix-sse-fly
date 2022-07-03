import type {
  LinksFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";

import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useLocalStorage } from "@mantine/hooks";

import tailwindStylesheetUrl from "./styles/app.css";
import reset from "./styles/reset.css";
export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: reset },
  ];
};
export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1,maximum-scale=1",
});

export default function App() {
  const [selectedTheme] = useLocalStorage({
    key: "chat-theme",
  });

  return (
    <html data-theme={selectedTheme} lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
