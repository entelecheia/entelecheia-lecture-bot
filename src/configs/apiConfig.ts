import Browser from 'webextension-polyfill'

type ModelInfo = {
  value: string
  desc: string
}

export enum ProviderType {
  ChatGPT = 'chatgpt',
  OpenAI = 'openai',
}

interface GPT3ProviderConfig {
  model: string
  apiKey: string
}

export interface ProviderConfigs {
  provider: ProviderType
  configs: {
    [ProviderType.OpenAI]: GPT3ProviderConfig | undefined
  }
}

export async function getProviderConfigs(): Promise<ProviderConfigs> {
  const { provider = ProviderType.ChatGPT } = await Browser.storage.local.get('provider')
  const configKey = `provider:${ProviderType.OpenAI}`
  const result = await Browser.storage.local.get(configKey)
  return {
    provider,
    configs: {
      [ProviderType.OpenAI]: result[configKey],
    },
  }
}

export async function saveProviderConfigs(
  provider: ProviderType,
  configs: ProviderConfigs['configs'],
) {
  return Browser.storage.local.set({
    provider,
    [`provider:${ProviderType.OpenAI}`]: configs[ProviderType.OpenAI],
  })
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

export async function getApiConfigs(): Promise<{
  chatgpt_webapp_model_name: string
  openai_model_names: string[]
  openai_chat_model_names: string[]
}> {
  return {
    chatgpt_webapp_model_name: 'text-davinci-003-render',
    openai_model_names: ['text-davinci-003'],
    openai_chat_model_names: ['gpt-3.5-turbo'],
  }
}
