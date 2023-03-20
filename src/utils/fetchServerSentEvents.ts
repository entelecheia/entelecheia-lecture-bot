/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createParser } from 'eventsource-parser'
import { streamAsyncIterable } from './streamAsyncIterable.js'

export async function fetchServerSentEvents(
  resource: string,
  options: RequestInit & { onMessage: (message: string) => void } & {
    onStart: (message: string) => void
  } & { onEnd: () => void } & { onError: (resp: Response | Error) => void },
) {
  const { onMessage, onStart, onEnd, onError, ...fetchOptions } = options
  const resp = await fetch(resource, fetchOptions).catch(async (err) => {
    await onError(err)
  })
  if (!resp) return
  if (!resp.ok) {
    await onError(resp)
    return
  }

  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })
  let hasStarted = false
  for await (const chunk of streamAsyncIterable(resp.body!)) {
    const str = new TextDecoder().decode(chunk)
    parser.feed(str)

    if (!hasStarted) {
      hasStarted = true
      await onStart(str)
    }
  }
  await onEnd()
}
