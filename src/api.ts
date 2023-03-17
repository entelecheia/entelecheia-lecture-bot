export async function fetchExtensionConfigs(): Promise<{
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
