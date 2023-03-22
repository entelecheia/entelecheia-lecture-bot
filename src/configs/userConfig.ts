/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { BracesIcon, CardHeadingIcon, ChatSquareDotsIcon, TranslateIcon } from '../misc/Icons'

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

export enum Language {
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
      return `Reply in ${preferredLanguage}. Explain the following:\n"${selection}"`
    },
  },
  summarize: {
    icon: CardHeadingIcon,
    label: 'Summarize',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Reply in ${preferredLanguage}. Summarize the following as concisely as possible:\n"${selection}"`
    },
  },
  explain_code: {
    icon: BracesIcon,
    label: 'Explain Code',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return `Reply in ${preferredLanguage}. Explain the following code:\n"${selection}"`
    },
  },
  translate: {
    icon: TranslateIcon,
    label: 'Translate',
    genPrompt: async (selection: string) => {
      const preferredLanguage = await getPreferredLanguage()
      return (
        `Translate the following into ${preferredLanguage} and only show me the translated content.` +
        `If it is already in ${preferredLanguage},` +
        `translate it into English and only show me the translated content:\n"${selection}"`
      )
    },
  },
}

type UserConfigType = {
  triggerMode: TriggerMode
  themeMode: ThemeMode
  language: Language
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
}

export const defaultConfig: UserConfigType = {
  triggerMode: TriggerMode.Automatically,
  themeMode: ThemeMode.Auto,
  language: Language.Auto,
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
    if (config.language === 'Auto') {
      return Browser.i18n.getUILanguage()
    }
    return config.language
  })
}

export function isUsingApiKey(config: UserConfigType) {
  return (
    config.modelName &&
    Models[config.modelName] &&
    (gptApiModelKeys.includes(config.modelName) || chatgptApiModelKeys.includes(config.modelName))
  )
}
