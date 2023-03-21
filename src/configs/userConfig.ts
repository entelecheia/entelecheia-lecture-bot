import { defaults } from 'lodash-es'
import Browser from 'webextension-polyfill'
import { actionConfig, ActionConfigType } from './actionConfig'
import { chatgptApiModelKeys, gptApiModelKeys } from './apiConfig'

export enum TriggerMode {
  Automatically = 'automatically',
  Manually = 'manually',
}

export const TRIGGER_MODE_TEXT = {
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

const userConfigWithDefaultValue: UserConfigType = {
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

export type UserConfig = typeof userConfigWithDefaultValue
export const defaultConfig = userConfigWithDefaultValue

export async function getUserConfig(): Promise<UserConfig> {
  const result = await Browser.storage.local.get(Object.keys(userConfigWithDefaultValue))
  return defaults(result, userConfigWithDefaultValue)
}

export async function updateUserConfig(updates: Partial<UserConfig>) {
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

export function isUsingApiKey(config: UserConfig) {
  return (
    gptApiModelKeys.includes(config.modelName) || chatgptApiModelKeys.includes(config.modelName)
  )
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  GPT3 = 'gpt3',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.GPT3]: GPT3ProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKey = `provider:${ProviderType.GPT3}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.GPT3]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.GPT3}`]: configs[ProviderType.GPT3],
  })
}
