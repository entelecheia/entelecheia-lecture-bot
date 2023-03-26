/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isEmpty } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { chatgptWebModelKeys, getUserConfig, Models, updateUserConfig } from '../configs'
import { fetchServerSentEvents, Session } from '../utils'

async function request(token: string, method: string, path: string, data?: unknown) {
  const apiUrl = (await getUserConfig()).ChatGptWebApiUrl
  const response = await fetch(`${apiUrl}/backend-api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  const responseText = await response.text()
  console.debug(`request: ${path}`, responseText)
  return { response, responseText }
}

export async function sendMessageFeedback(token: string, data: unknown) {
  await request(token, 'POST', '/conversation/message_feedback', data)
}

export async function setConversationProperty(
  token: string,
  conversationId: string,
  propertyObject: object,
) {
  await request(token, 'PATCH', `/conversation/${conversationId}`, propertyObject)
}

export async function sendModerations(
  token: string,
  question: string,
  conversationId: string,
  messageId: string,
) {
  await request(token, 'POST', `/moderations`, {
    conversation_id: conversationId,
    input: question,
    message_id: messageId,
    model: 'text-moderation-playground',
  })
}

// export async function getModels(token: string): Promise<string[] | undefined> {
//   const response = JSON.parse((await request(token, 'GET', '/models')).responseText)
//   if (response.models) return response.models.map((m: any) => m.slug)
// }
export async function getModels(
  token: string,
): Promise<{ slug: string; title: string; description: string; max_tokens: number }[]> {
  const resp = JSON.parse((await request(token, 'GET', '/models')).responseText)
  return resp.models
}

export async function generateAnswersWithChatgptWebApi(
  port: Browser.Runtime.Port,
  question: string,
  session: Session,
  accessToken: string,
): Promise<void> {
  // const deleteConversation = () => {
  //   if (session.conversationId) {
  //     setConversationProperty(accessToken, session.conversationId, { is_visible: false })
  //   }
  // }

  const controller = new AbortController()
  const stopListener = (msg: any) => {
    if (msg.stop) {
      console.debug('stop generating')
      port.postMessage({ done: true })
      controller.abort()
      port.onMessage.removeListener(stopListener)
    }
  }
  port.onMessage.addListener(stopListener)
  port.onDisconnect.addListener(() => {
    console.debug('port disconnected')
    controller.abort()
    // deleteConversation()
  })

  const models = await getModels(accessToken).catch(() => {
    port.onMessage.removeListener(stopListener)
  })
  console.debug('models', models)
  const config = await getUserConfig()
  const selectedModel = Models[config.modelName].value
  const usedModel =
    models && models.find((model) => model.slug === selectedModel)
      ? selectedModel
      : Models[chatgptWebModelKeys[0]].value
  console.debug('usedModel', usedModel)

  let answer = ''
  await fetchServerSentEvents(`${config.ChatGptWebApiUrl}${config.ChatGptWebApiPath}`, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: 'next',
      conversation_id: session.conversationId,
      messages: [
        {
          id: session.messageId,
          role: 'user',
          content: {
            content_type: 'text',
            parts: [question],
          },
        },
      ],
      model: usedModel,
      parent_message_id: session.parentMessageId,
    }),
    onMessage(message) {
      console.debug('sse message', message)
      if (message === '[DONE]') {
        if (!session.conversationRecords) session.conversationRecords = []
        session.conversationRecords.push({ question: question, answer: answer })
        console.debug('conversation history', { content: session.conversationRecords })
        port.postMessage({ answer: null, done: true, session: session })
        return
      }
      let data
      try {
        data = JSON.parse(message)
      } catch (error) {
        console.debug('json error', error)
        return
      }
      if (data.conversation_id) {
        session.conversationId = data.conversation_id
        updateUserConfig({ conversationId: data.conversation_id })
      }
      if (data.message?.id) {
        session.parentMessageId = data.message.id
        updateUserConfig({ messageId: data.message.id })
      }

      answer = data.message?.content?.parts?.[0]
      if (answer) {
        port.postMessage({ answer: answer, done: false, session: session })
      }
    },
    async onStart() {},
    async onEnd() {
      port.onMessage.removeListener(stopListener)
    },

    async onError(resp: Response | Error) {
      port.onMessage.removeListener(stopListener)
      if (resp instanceof Error) throw resp
      if (resp.status === 403) {
        throw new Error('CLOUDFLARE')
      }
      const error = await resp.json().catch(() => ({}))
      console.debug('resp', resp)
      if (!isEmpty(error)) console.debug('error', error)
      if (!isEmpty(error) && error.detail === 'Conversation not found') {
        console.debug('conversation not found')
        updateUserConfig({ conversationId: null, messageId: null })
        // retry
        throw new Error('RETRY')
      } else {
        throw new Error(
          !isEmpty(error) ? JSON.stringify(error) : `${resp.status} ${resp.statusText}`,
        )
      }
    },
  })
}
