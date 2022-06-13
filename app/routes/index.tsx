import type { ActionFunction, LoaderFunction } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'

import { doesUserExist } from '~/chat.server'
import { commitSession, getSession } from '~/session.server'
import { Button, Input, Title, Card, Text } from '@mantine/core'
import reset from '../styles/reset.css'
interface ActionData {
  error?: string
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  if (session.has('user')) {
    throw redirect('/chat')
  }
  return null
}

export const links = () => {
  return [
    {
      rel: 'stylesheet',
      href: reset,
    },
  ]
}

const MAX_USERNAME_LENGTH = 20

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'))
  const formData = await request.formData()

  const user = String(formData.get('user')).slice(0, MAX_USERNAME_LENGTH)
  if (
    user.length <= 0 ||
    user.toLowerCase() === 'system' ||
    doesUserExist(user)
  ) {
    return json<ActionData>({
      error: 'Invalid username or user already exists',
    })
  }

  session.set('user', user)

  return redirect('/chat', {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  })
}

export default function Index() {
  const actionData = useActionData<ActionData>()

  return (
    <main className='grid place-content-center h-full bg-slate-400'>
      <Card shadow="sm" p="xl">
        <Title>Remix Chat</Title>
        <Text size="sm">
          Enter a username to start chatting with your friends.
        </Text>
        <Form method="post">
          <Input type="text" name="user" placeholder="Username" />
          <Button type="submit">Join</Button>
        </Form>
        {actionData?.error ? (
          <div style={{ color: 'red' }}>{actionData.error}</div>
        ) : null}
      </Card>
    </main>
  )
}
