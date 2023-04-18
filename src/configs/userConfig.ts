/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { Language, languages } from 'countries-list'
import { defaults } from 'lodash-es'
import { v4 as uuidv4 } from 'uuid'
import Browser from 'webextension-polyfill'
import { BracesIcon, CardHeadingIcon, ChatSquareDotsIcon, TranslateIcon } from '../misc/Icons'

interface CustomLanguage {
  name: string
  native: string
}

interface LanguageList {
  [key: string]: Language
  auto: CustomLanguage
}

export const languageList: LanguageList = {
  auto: { name: 'Auto', native: 'Auto' },
  ...languages,
}

export async function getUILanguage() {
  return languageList[navigator.language.substring(0, 2)].name
}

export enum TriggerMode {
  Automatically = 'automatically',
  Manually = 'manually',
}

export const TiggerModeText = {
  [TriggerMode.Automatically]: {
    title: 'Automatically',
    desc: 'ChatGPT preloads the contents of a page and waits for questions',
  },
  [TriggerMode.Manually]: {
    title: 'Manually',
    desc: 'ChatGPT is queried when you manually click a button',
  },
}

export enum ThemeMode {
  Auto = 'auto',
  Light = 'light',
  Dark = 'dark',
}

export enum LanguageMode {
  Auto = 'Auto',
  English = 'English',
  Korean = 'Korean',
}

type ModelInfo = {
  value: string
  desc: string
}

export interface ModelConfig {
  modelName: string
  modelInfo: ModelInfo
}

export const Models: Record<string, ModelInfo> = {
  chatgptFree35: { value: 'text-davinci-002-render-sha', desc: 'ChatGPT (Web)' },
  chatgptPlus4: { value: 'gpt-4', desc: 'ChatGPT (Web, GPT-4)' },
  chatgptApi35: { value: 'gpt-3.5-turbo', desc: 'ChatGPT (GPT-3.5-turbo)' },
  chatgptApi4_8k: { value: 'gpt-4', desc: 'ChatGPT (GPT-4-8k)' },
  chatgptApi4_32k: { value: 'gpt-4-32k', desc: 'ChatGPT (GPT-4-32k)' },
  gptApiDavinci: { value: 'text-davinci-003', desc: 'GPT-3.5' },
}

export const chatgptWebModelKeys: string[] = ['chatgptFree35', 'chatgptPlus4']
export const gptApiModelKeys: string[] = ['gptApiDavinci']
export const chatgptApiModelKeys: string[] = ['chatgptApi35', 'chatgptApi4_8k', 'chatgptApi4_32k']

export const maxResponseTokenLength = 1000

type ActionType = {
  icon: any
  label: string
  genPrompt: (selection: string) => Promise<string>
}

export type ActionConfigType = {
  explain: ActionType
  summarize: ActionType
  explain_code: ActionType
  translate: ActionType
}

export const actionConfig: ActionConfigType = {
  explain: {
    icon: ChatSquareDotsIcon,
    label: 'Explain',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Explain the following in ${preferredLanguage}:\n"${selection}"`
    },
  },
  summarize: {
    icon: CardHeadingIcon,
    label: 'Summarize',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Summarize the following as concisely as possible in ${preferredLanguage}:\n"${selection}"`
    },
  },
  explain_code: {
    icon: BracesIcon,
    label: 'Explain Code',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Explain the following code in ${preferredLanguage}:\n"${selection}"`
    },
  },
  translate: {
    icon: TranslateIcon,
    label: 'Translate',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return (
        `Translate the following into ${preferredLanguage} and only show me the translated content. ` +
        `If it is already in ${preferredLanguage}, ` +
        `translate it into English and only show me the translated content:\n"${selection}"`
      )
    },
  },
}

type UserConfigType = {
  triggerMode: TriggerMode
  themeMode: ThemeMode
  chatLanguage: LanguageMode
  uiLanguage: string
  modelName: string
  apiKey: string
  accessToken: string
  ChatGptWebApiUrl: string
  ChatGptWebApiPath: string
  OpenAiApiUrl: string
  //
  activeAction: Array<keyof ActionConfigType>
  lockWhenAnswer: boolean
  tokenSavedOn: number
  messageId: string | null
  conversationId: string | null
  conversationTitle: string | null
}

export const defaultConfig: UserConfigType = {
  triggerMode: TriggerMode.Automatically,
  themeMode: ThemeMode.Auto,
  chatLanguage: LanguageMode.Auto,
  uiLanguage: navigator.language.substring(0, 2),
  modelName: 'chatgptFree35',
  apiKey: '',
  accessToken: '',
  ChatGptWebApiUrl: 'https://chat.openai.com',
  ChatGptWebApiPath: '/backend-api/conversation',
  OpenAiApiUrl: 'https://api.openai.com',
  //
  activeAction: Object.keys(actionConfig) as Array<keyof ActionConfigType>,
  lockWhenAnswer: false,
  tokenSavedOn: 0,
  messageId: uuidv4(),
  conversationId: null,
  conversationTitle: null,
}

export async function getUserConfig(): Promise<UserConfigType> {
  const result = await Browser.storage.local.get(Object.keys(defaultConfig))
  return defaults(result, defaultConfig)
}

export async function updateUserConfig(updates: Partial<UserConfigType>) {
  console.debug('update configs', updates)
  return Browser.storage.local.set(updates)
}

export async function getPreferredLanguage() {
  return getUserConfig().then((config) => {
    if (config.chatLanguage === 'Auto') {
      return getUILanguage()
    }
    return config.chatLanguage
  })
}

export function isUsingApiKey(config: UserConfigType) {
  return (
    config.modelName &&
    Models[config.modelName] &&
    (gptApiModelKeys.includes(config.modelName) || chatgptApiModelKeys.includes(config.modelName))
  )
}
