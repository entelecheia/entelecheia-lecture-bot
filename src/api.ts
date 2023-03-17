const API_HOST = 'https://lecture-bot.entelcheia.ai'

export async function fetchExtensionConfigs(): Promise<{
  chatgpt_webapp_model_name: string
  openai_model_names: string[]
}> {
  return fetch(`${API_HOST}/api/config.json`).then((r) => r.json())
}
