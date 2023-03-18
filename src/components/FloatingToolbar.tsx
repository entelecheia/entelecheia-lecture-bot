/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import Browser from 'webextension-polyfill'
import { actionConfig, ActionConfigType } from '../configs/actionConfig'
import { defaultConfig, getUserConfig } from '../configs/userConfig'
import { useClampWindowSize } from '../hooks/use-clamp-window-size'
import { isMobile } from '../utils/is-mobile'
import { setElementPositionInViewport } from '../utils/set-element-position-in-viewport'
import BotCard from './BotCard'

const favicon = Browser.runtime.getURL('favicon.png')

interface FloatingToolbarProps {
  session: any
  selection: string
  position: any
  container: any
  triggered?: boolean
  closeable?: boolean
  onClose?: () => void
  prompt?: string
}

function FloatingToolbar(props: FloatingToolbarProps) {
  const [selection, setSelection] = useState(props.selection)
  const [prompt, setPrompt] = useState(props.prompt)
  const [triggered, setTriggered] = useState(props.triggered)
  const [config, setConfig] = useState(defaultConfig)
  const [render, setRender] = useState(false)
  const [position, setPosition] = useState(props.position)
  const [virtualPosition, setVirtualPosition] = useState({ x: 0, y: 0 })
  const windowSize = useClampWindowSize([750, 1500], [0, Infinity])

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

    return (
      <div data-theme={config.theme}>
        <Draggable
          handle=".dragbar"
          onDrag={dragEvent.onDrag}
          onStop={dragEvent.onStop}
          position={virtualPosition}
        >
          <div className="bot-selection-window" style={{ width: windowSize[0] * 0.4 + 'px' }}>
            <div className="lecture-bot-container">
              <BotCard
                session={props.session}
                question={prompt}
                draggable={true}
                closeable={props.closeable}
                onClose={props.onClose}
                onUpdate={() => {
                  updatePosition()
                }}
              />
            </div>
          </div>
        </Draggable>
      </div>
    )
  } else {
    if (config.activeAction.length === 0) return <div />
    const actions = []

    for (const key in actionConfig) {
      if (config.activeAction.includes(key as keyof ActionConfigType)) {
        const action = actionConfig[key as keyof ActionConfigType]
        const IconComponent = action.icon
        actions.push(
          <IconComponent
            width={20}
            height={20}
            className="bot-selection-toolbar-button"
            title={action.label}
            onClick={async () => {
              setPrompt(await action.genPrompt(selection))
              setTriggered(true)
            }}
          />,
        )
      }
    }

    return (
      <div data-theme={config.theme}>
        <div className="bot-selection-toolbar">
          <img src={favicon} width="24" height="24" style={{ userSelect: 'none' }} />
          {actions}
        </div>
      </div>
    )
  }
}

export default FloatingToolbar
