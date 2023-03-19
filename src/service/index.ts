/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Browser from 'webextension-polyfill'
import { actionConfig, ActionConfigType } from '../configs/actionConfig'
import { getProviderConfigs, ProviderType } from '../configs/userConfig'
import { Provider } from '../utils/interfaces'
import { ChatGPTProvider, getChatGPTAccessToken, sendMessageFeedback } from './apis/chatgpt'
import { OpenAIProvider } from './apis/openai'

async function generateAnswers(port: Browser.Runtime.Port, question: string) {
  const providerConfigs = await getProviderConfigs()

  let provider: Provider
  if (providerConfigs.provider === ProviderType.ChatGPT) {
    const token = await getChatGPTAccessToken()
    provider = new ChatGPTProvider(token)
  } else if (providerConfigs.provider === ProviderType.GPT3) {
    const { apiKey, model } = providerConfigs.configs[ProviderType.GPT3]!
    provider = new OpenAIProvider(apiKey, model)
  } else {
    throw new Error(`Unknown provider ${providerConfigs.provider}`)
  }

  const controller = new AbortController()
  port.onDisconnect.addListener(() => {
    controller.abort()
    cleanup?.()
  })

  const { cleanup } = await provider.generateAnswer({
    prompt: question,
    signal: controller.signal,
    onEvent(event) {
      if (event.type === 'done') {
        port.postMessage({ event: 'DONE' })
        return
      }
      port.postMessage(event.data)
    },
  })
}

Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug('received msg', msg)
    try {
      await generateAnswers(port, msg.question)
    } catch (err: any) {
      console.error(err)
      port.postMessage({ error: err.message })
    }
  })
})

Browser.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'FEEDBACK') {
    const token = await getChatGPTAccessToken()
    await sendMessageFeedback(token, message.data)
  } else if (message.type === 'OPEN_OPTIONS_PAGE') {
    Browser.runtime.openOptionsPage()
  } else if (message.type === 'GET_ACCESS_TOKEN') {
    return getChatGPTAccessToken()
  } else if (message.type === 'OPEN_LECTURE') {
    Browser.tabs.create({ url: 'https://lecture.entelecheia.ai' })
  }
})

Browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    Browser.runtime.openOptionsPage()
  }
})

Browser.contextMenus.removeAll().then(() => {
  const menuId = 'LectureBot-Menu'
  Browser.contextMenus.create({
    id: menuId,
    title: 'ἐντελέχεια.αι',
    contexts: ['all'],
  })

  for (const key of Object.keys(actionConfig) as (keyof ActionConfigType)[]) {
    const action = actionConfig[key]
    Browser.contextMenus.create({
      id: menuId + key,
      parentId: menuId,
      title: action.label,
      contexts: ['selection'],
    })
  }

  Browser.contextMenus.onClicked.addListener((info, tab) => {
    const itemId =
      info.menuItemId === menuId ? 'new' : (info.menuItemId as string).replace(menuId, '')
    const message = {
      itemId: itemId,
      selectionText: info.selectionText,
    }
    console.debug('menu clicked', message)
    if (tab && tab.id !== undefined) {
      Browser.tabs.sendMessage(tab.id, {
        type: 'MENU',
        data: message,
      })
    }
  })
})
