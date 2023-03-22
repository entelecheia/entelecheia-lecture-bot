/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CheckIcon, CopyIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'react'
import Browser from 'webextension-polyfill'
import { actionConfig, ActionConfigType, defaultConfig, getUserConfig } from '../configs'
import { isMobile, Session, setElementPositionInViewport } from '../utils'

interface FloatingToolbarProps {
  session: Session
  selection: string
  position: any
  container: HTMLElement
  triggered?: boolean
  closeable?: boolean
  onClose?: () => void
  prompt?: string
  onPromptGenerated?: (prompt: string) => void
}

function FloatingToolbar(props: FloatingToolbarProps) {
  const [selection, setSelection] = useState(props.selection)
  const [prompt, setPrompt] = useState(props.prompt || '')
  const [triggered, setTriggered] = useState(props.triggered)
  const [config, setConfig] = useState(defaultConfig)
  const [render, setRender] = useState(false)
  const [position, setPosition] = useState(props.position)
  const [virtualPosition, setVirtualPosition] = useState({ x: 0, y: 0 })
  const [copied, setCopied] = useState(false)
  // const windowSize = useClampWindowSize([750, 1500], [0, Infinity])

  useEffect(() => {
    getUserConfig()
      .then(setConfig)
      .then(() => setRender(true))
  }, [])

  useEffect(() => {
    const listener = (changes: any) => {
      const changedItems = Object.keys(changes)
      const newConfig: Partial<typeof defaultConfig> = {}
      for (const key of changedItems) {
        newConfig[key as keyof typeof defaultConfig] = changes[key].newValue
      }
      setConfig({ ...config, ...newConfig })
    }
    Browser.storage.local.onChanged.addListener(listener)
    return () => {
      Browser.storage.local.onChanged.removeListener(listener)
    }
  }, [config])

  useEffect(() => {
    if (isMobile()) {
      const selectionListener = () => {
        const currentSelection = window.getSelection()?.toString()
        if (currentSelection) setSelection(currentSelection)
      }
      document.addEventListener('selectionchange', selectionListener)
      return () => {
        document.removeEventListener('selectionchange', selectionListener)
      }
    }
  }, [])

  if (!render) return <div />

  if (triggered) {
    const updatePosition = () => {
      const newPosition = setElementPositionInViewport(props.container, position.x, position.y)
      if (position.x !== newPosition.x || position.y !== newPosition.y) setPosition(newPosition) // clear extra virtual position offset
    }

    const dragEvent = {
      onDrag: (e: any, ui: { deltaX: number; deltaY: number }) => {
        setVirtualPosition({ x: virtualPosition.x + ui.deltaX, y: virtualPosition.y + ui.deltaY })
      },
      onStop: () => {
        setPosition({ x: position.x + virtualPosition.x, y: position.y + virtualPosition.y })
        setVirtualPosition({ x: 0, y: 0 })
      },
    }

    if (virtualPosition.x === 0 && virtualPosition.y === 0) {
      updatePosition() // avoid jitter
    }

    return <div />
  } else {
    if (config.activeAction.length === 0) return <div />
    const actions = []
    actions.push(
      <div
        className="bot-selection-toolbar-button"
        title="Copy"
        onClick={async () => {
          navigator.clipboard
            .writeText(selection)
            .then(() => setCopied(true))
            .then(() =>
              setTimeout(() => {
                setCopied(false)
              }, 600),
            )
        }}
      >
        {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
      </div>,
    )

    for (const key in actionConfig) {
      if (config.activeAction.includes(key as keyof ActionConfigType)) {
        const action = actionConfig[key as keyof ActionConfigType]
        const IconComponent = action.icon
        actions.push(
          <div
            className="bot-selection-toolbar-button"
            title={action.label}
            onClick={async () => {
              const generatedPrompt = await action.genPrompt(selection)
              if (props.onPromptGenerated) {
                props.onPromptGenerated(generatedPrompt)
              }
              setPrompt(generatedPrompt)
              setTriggered(true)
            }}
          >
            <IconComponent width={16} height={16} />
          </div>,
        )
      }
    }

    return (
      <div data-theme={config.themeMode}>
        <div className="bot-selection-toolbar">{actions}</div>
      </div>
    )
  }
}

export default FloatingToolbar
