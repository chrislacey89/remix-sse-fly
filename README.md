## Development

- Initial setup:

  ```sh
  npm install
  ```

- Start dev server:

  ```sh
  npm run dev
  ```

This starts your app in development mode, rebuilding assets on file changes.

### Relevant code:

This project is more of a tech demo to see how we can use resource routes and
server sent events (SSEs) to build a real-time chat application. I've only seen this
done with websockets, but I wanted to see if we could do it with SSEs.

The main files of interest are:

- A resource route that creates a readable stream, emitting events for the
  client to consume [./app/routes/live.chat.ts](./app/routes/live.chat.ts)
- A custom hook that is wired up to the resource route that listens for new
  server sent events [./app/useEventStream.ts](./app/useEventStream.ts)


### Remix Indie Stack
This project was bootstrapped using the [Remix Indie Stack](https://github.com/remix-run/indie-stack):
![The Remix Indie Stack](https://repository-images.githubusercontent.com/465928257/a241fa49-bd4d-485a-a2a5-5cb8e4ee0abf)
