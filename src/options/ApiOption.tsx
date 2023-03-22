/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Input, Select, Text, useInput, useToasts } from '@geist-ui/core'
import { useCallback } from 'preact/hooks'
import { useEffect, useState } from 'react'
import { getUserConfig, Models, updateUserConfig } from '../configs'

function ApiOption() {
  const [modelDesc, setModelDesc] = useState(Models['chatgptFree35'].desc)
  const [apiKey, setApiKey] = useState('')
  const { setToast } = useToasts()
  const { bindings: apiKeyBindings } = useInput(apiKey)

  useEffect(() => {
    getUserConfig().then((config) => {
      setModelDesc(Models[config.modelName].desc)
      setApiKey(config.apiKey)
    })
  }, [])

  const onModelChange = useCallback(
    (modelDesc: string) => {
      const modelName = Object.entries(Models).find(([, model]) => model.desc === modelDesc)?.[0]
      updateUserConfig({ modelName })
      setToast({ text: 'Model changed to ' + modelDesc, type: 'success' })
    },
    [setToast],
  )

  const onSaveApiKey = useCallback(() => {
    if (!apiKeyBindings.value) {
      alert('Please enter your OpenAI API key')
      return
    }
    updateUserConfig({ apiKey: apiKeyBindings.value })
    setToast({ text: 'Changes saved', type: 'success' })
  }, [apiKeyBindings.value, setToast])

  return (
    <>
      <Text className="my-1">
        ChatGPT (Web) is free, but sometimes unstable. OpenAI official API is more stable, but
        charge by usage.
      </Text>
      <div className="flex flex-row gap-2">
        <Select
          value={modelDesc}
          placeholder="Choose one"
          onChange={(val) => onModelChange(val as string)}
        >
          {Object.entries(Models).map(([key, model]) => (
            <Select.Option key={key} value={model.desc}>
              {model.desc}
            </Select.Option>
          ))}
        </Select>
        <Input htmlType="password" label="API key" {...apiKeyBindings}></Input>
        <Button scale={2 / 3} ghost style={{ width: 10 }} type="success" onClick={onSaveApiKey}>
          Save Key
        </Button>
      </div>
      <span className="italic text-xs">
        You can find or create your API key{' '}
        <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noreferrer">
          here
        </a>
      </span>
    </>
  )
}

export default ApiOption
