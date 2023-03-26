/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { LightBulbIcon, SearchIcon } from '@primer/octicons-react'
import { useCallback, useEffect, useState } from 'react'
import Browser from 'webextension-polyfill'
import { defaultConfig, getUserConfig, SiteConfiguration } from '../configs'
import { getPossibleElementByQuerySelector, Session } from '../utils'
import ChatCard from './ChatCard'

interface ChatContainerProps {
  session: Session
  question: string
  siteConfig: SiteConfiguration
  container: HTMLElement
}

function ChatContainer(props: ChatContainerProps) {
  const [triggered, setTriggered] = useState(false)
  const [config, setConfig] = useState(defaultConfig)
  const [render, setRender] = useState(false)
  const [question, setQuestion] = useState(props.question || '')

  useEffect(() => {
    getUserConfig()
      .then(setConfig)
      .then(() => setRender(true))
  }, [])

  useEffect(() => {
    setQuestion(question || '')
  }, [question])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'NEW_PROMPT') {
        const newPrompt = event.data.prompt
        setQuestion(newPrompt)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  useEffect(() => {
    const listener = (changes: Browser.Storage.StorageAreaOnChangedChangesType<any, any>) => {
      const changedItems = Object.keys(changes)
      const newConfig: Record<string, unknown> = {}
      for (const key of changedItems) {
        newConfig[key] = changes[key].newValue!
      }
      setConfig({ ...config, ...newConfig })
    }
    Browser.storage.local.onChanged.addListener(listener)
    return () => {
      Browser.storage.local.onChanged.removeListener(listener)
    }
  }, [config])

  const updatePosition = useCallback(() => {
    if (!render) return

    const container = props.container
    const siteConfig = props.siteConfig
    container.classList.remove('lecture-chat-sidebar-free')

    if (!siteConfig) return

    const sidebarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
    if (sidebarContainer) {
      sidebarContainer.append(container)
    } else {
      const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
      if (appendContainer) {
        container.classList.add('lecture-chat-sidebar-free')
        appendContainer.appendChild(container)
      }
    }
  }, [render, props])

  useEffect(() => updatePosition(), [config, updatePosition])

  return (
    <>
      {render && (
        <div data-theme={config.themeMode}>
          {(() => {
            if (question)
              switch (config.triggerMode) {
                case 'automatically':
                  return <ChatCard session={props.session} question={question} />
                case 'manually':
                  if (triggered) {
                    return <ChatCard session={props.session} question={question} />
                  }
                  return (
                    <p
                      className="chat-inner manual-btn icon-and-text"
                      onClick={() => setTriggered(true)}
                    >
                      <SearchIcon size="small" /> Ask ChatGPT
                    </p>
                  )
              }
            else
              return (
                <p className="chat-inner icon-and-text">
                  <LightBulbIcon size="small" /> No Input Found
                </p>
              )
          })()}
        </div>
      )}
    </>
  )
}

export default ChatContainer
