/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
import {
  generateAnswersWithChatgptApi,
  generateAnswersWithChatgptWebApi,
  generateAnswersWithGptCompletionApi,
  sendMessageFeedback,
} from '../apis'
import {
  chatgptApiModelKeys,
  chatgptWebModelKeys,
  getUserConfig,
  gptApiModelKeys,
  isUsingApiKey,
} from '../configs'
import { cache, getAccessToken, initSession, KEY_ACCESS_TOKEN } from '../utils'

const sessionDataMap = new Map()
const sessionId = location.hostname

// async function deleteConversation(conversationId: string) {
//   const accessToken = await getAccessToken()
//   if (conversationId) {
//     await setConversationProperty(accessToken, conversationId, { is_visible: false })
//   }
// }

Browser.runtime.onConnect.addListener((port) => {
  console.debug('connected')
  port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg)
    const session = msg.session
    if (!session) return
    const config = await getUserConfig()
    if (session.useApiKey == null) {
      session.useApiKey = isUsingApiKey(config)
    }

    try {
      if (chatgptWebModelKeys.includes(config.modelName)) {
        const accessToken = await getAccessToken()
        session.messageId = uuidv4()
        if (session.parentMessageId == null) {
          session.parentMessageId = config.messageId
        }
        console.debug('session', session)
        await generateAnswersWithChatgptWebApi(port, session.question, session, accessToken)
      } else if (gptApiModelKeys.includes(config.modelName)) {
        await generateAnswersWithGptCompletionApi(
          port,
          session.question,
          session,
          config.apiKey,
          config.modelName,
        )
      } else if (chatgptApiModelKeys.includes(config.modelName)) {
        await generateAnswersWithChatgptApi(
          port,
          session.question,
          session,
          config.apiKey,
          config.modelName,
        )
      }
    } catch (err) {
      if (err instanceof Error && err.message === 'RETRY') {
        console.debug('retry')
        const accessToken = await getAccessToken()
        session.conversationId = null
        session.messageId = uuidv4()
        session.parentMessageId = uuidv4()
        console.debug('retry session', session)
        await generateAnswersWithChatgptWebApi(port, session.question, session, accessToken)
      } else {
        console.error(err)
        if (err instanceof Error && !err.message.includes('aborted')) {
          port.postMessage({ error: err.message })
          cache.delete(KEY_ACCESS_TOKEN)
        }
      }
    }
  })
})

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'FEEDBACK') {
    // const token = await getChatGPTAccessToken()
    const token = await getAccessToken()
    await sendMessageFeedback(token, message.data)
  } else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    // return getChatGPTAccessToken()
    return getAccessToken()
  } else if (message.type === 'OPEN_LECTURE') {
    Browser.tabs.create({ url: 'https://lecture.entelecheia.ai' })
    // } else if (message.type === 'DELETE_CONVERSATION') {
    //   deleteConversation(message.conversationId)
  } else if (message.type === 'GET_SESSION') {
    if (sessionDataMap.has(sessionId)) {
      const existingSession = sessionDataMap.get(sessionId)
      const config = await getUserConfig()
      const conversationId = config.conversationId
      existingSession.conversationId = conversationId
      console.debug('returning existing session', existingSession)
      return existingSession
    } else {
      const newSession = initSession()
      const config = await getUserConfig()
      const conversationId = config.conversationId
      newSession.conversationId = conversationId
      sessionDataMap.set(sessionId, newSession)
      console.debug('returning new session', newSession)
      return newSession
    }
  } else if (message.type === 'SET_SESSION') {
    console.debug('setting session', message.session)
    sessionDataMap.set(sessionId, message.session)
  }
})

// Browser.runtime.onInstalled.addListener((details) => {
//   if (details.reason === 'install') {
//     Browser.runtime.openOptionsPage()
//   }
// })
