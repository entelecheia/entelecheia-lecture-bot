/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
// import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from '../apis/chatgpt'
// import { OpenAIProvider } from '../apis/openai'
// import { Provider } from '../utils/interfaces'
// import { getProviderConfigs, ProviderType } from '../configs/userConfig'
import { generateAnswersWithChatgptWebApi, sendMessageFeedback } from '../apis/chatgpt-web'
import {
  generateAnswersWithChatgptApi,
  generateAnswersWithGptCompletionApi,
} from '../apis/openai-api'
import { chatgptApiModelKeys, chatgptWebModelKeys, gptApiModelKeys } from '../configs/apiConfig'
import { getUserConfig, isUsingApiKey } from '../configs/userConfig'
import { cache, getAccessToken, KEY_ACCESS_TOKEN } from '../utils/getAccessToken'

// async function generateAnswers(port: Browser.Runtime.Port, question: string) {
//   const providerConfigs = await getProviderConfigs()

//   let provider: Provider
//   if (providerConfigs.provider === ProviderType.ChatGPT) {
//     const token = await getChatGPTAccessToken()
//     provider = new ChatGPTProvider(token)
//   } else if (providerConfigs.provider === ProviderType.GPT3) {
//     const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]!
//     provider = new OpenAIProvider(apiKey, model)
//   } else {
//     throw new Error(`Unknown provider ${providerConfigs.provider}`)
//   }

//   const controller = new AbortController()
//   port.onDisconnect.addListener(() => {
//     controller.abort()
//     cleanup?.()
//   })

//   const { cleanup } = await provider.generateAnswer({
//     prompt: question,
//     signal: controller.signal,
//     onEvent(event) {
//       if (event.type === 'done') {
//         port.postMessage({ event: 'DONE' })
//         return
//       }
//       port.postMessage(event.data)
//     },
//   })
// }

// Browser.runtime.onConnect.addListener((port) => {
//   port.onMessage.addListener(async (msg) => {
//     console.debug('received msg', msg)
//     try {
//       await generateAnswers(port, msg.question)
//     } catch (err: any) {
//       console.error(err)
//       port.postMessage({ error: err.message })
//     }
//   })
// })

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
          session.parentMessageId = uuidv4()
        }
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
      console.error(err)
      if (err instanceof Error && !err.message.includes('aborted')) {
        port.postMessage({ error: err.message })
        cache.delete(KEY_ACCESS_TOKEN)
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
  }
})

// Browser.runtime.onInstalled.addListener((details) => {
//   if (details.reason === 'install') {
//     Browser.runtime.openOptionsPage()
//   }
// })
