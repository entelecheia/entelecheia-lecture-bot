/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button, Input, Select, Text, useInput, useToasts } from '@geist-ui/core'
import { useCallback } from 'preact/hooks'
import { useEffect, useState } from 'react'
import { Models } from '../configs/apiConfig'
import { defaultConfig, getUserConfig, updateUserConfig, UserConfig } from '../configs/userConfig'

function ApiSelect() {
  const [config, setConfig] = useState(defaultConfig)
  const { setToast } = useToasts()
  const { bindings: apiKeyBindings } = useInput(config.apiKey ?? '')

  useEffect(() => {
    getUserConfig().then(setConfig)
  }, [])

  const updateConfig = useCallback(
    (value: Partial<UserConfig>) => {
      updateUserConfig(value)
      setConfig((prevConfig) => ({ ...prevConfig, ...value })) // Update local state
      setToast({ text: 'Changes saved', type: 'success' })
    },
    [setToast],
  )

  const saveApiKey = useCallback(() => {
    if (!apiKeyBindings.value) {
      alert('Please enter your OpenAI API key')
      return
    }
    updateConfig({ apiKey: apiKeyBindings.value })
  }, [apiKeyBindings.value, updateConfig])

  const onModelChange = useCallback(
    (modelName: string) => {
      updateConfig({ modelName })
    },
    [updateConfig],
  )

  return (
    <>
      <Text className="my-1">
        ChatGPT (Web) is free, but sometimes unstable. OpenAI official API is more stable, but
        charge by usage.
      </Text>
      <div className="flex flex-row gap-2">
        <Select
          value={config.modelName && Models[config.modelName] ? Models[config.modelName].desc : ''}
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
        <Button scale={2 / 3} ghost style={{ width: 10 }} type="success" onClick={saveApiKey}>
          Save
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

export default ApiSelect
