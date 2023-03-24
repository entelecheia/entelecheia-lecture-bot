/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon, GearIcon } from '@primer/octicons-react'
import FileSaver from 'file-saver'
import { Key, memo, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import Browser from 'webextension-polyfill'
import { defaultConfig, getUserConfig } from '../configs/userConfig'
import { useClampWindowSize } from '../hooks/useClampWindowSize'
import { ConversationRecord, initSession, Session } from '../utils'
import ChatInputBox from './ChatInputBox'
import ChatItem from './ChatItem'

type ChatItemType = 'question' | 'answer' | 'error'

class ChatItemData {
  type: ChatItemType
  content: string
  session: Session | null
  done: boolean

  constructor(type: ChatItemType, content: string, session: Session | null = null, done = false) {
    this.type = type
    this.content = content
    this.session = session
    this.done = done
  }
}

interface ChatCardProps {
  session: Session
  question: string
  onUpdate?: () => void
  draggable?: boolean
  closeable?: boolean
  onClose?: () => void
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

function ChatCard(props: ChatCardProps) {
  // Component states
  const [isReady, setIsReady] = useState(!props.question)
  const [port, setPort] = useState(() => Browser.runtime.connect())
  const [session, setSession] = useState(props.session)
  const [config, setConfig] = useState(defaultConfig)

  const prevQuestion = usePrevious(props.question)
  const windowSize = useClampWindowSize([0, Infinity], [250, 1100])
  const bodyRef = useRef<HTMLDivElement>(null)

  // Load and set user configuration
  useEffect(() => {
    getUserConfig().then(setConfig)
  }, [])

  // Handle onUpdate callback if provided
  useEffect(() => {
    if (props.onUpdate) props.onUpdate()
  })

  // Initialize chatItemData
  const [chatItemData, setChatItemData] = useState<ChatItemData[]>(
    (() => {
      if (props.session.conversationRecords?.length === 0) {
        if (props.question) {
          return [new ChatItemData('answer', 'Waiting for response...', props.session)]
        } else return []
      } else {
        const ret = []
        for (const record of props.session.conversationRecords || []) {
          ret.push(new ChatItemData('question', record.question + '\n', props.session, true))
          ret.push(new ChatItemData('answer', record.answer + '\n', props.session, true))
        }
        return ret
      }
    })(),
  )

  useEffect(() => {
    if (props.question && (!prevQuestion || prevQuestion !== props.question) && isReady) {
      const newQuestion = new ChatItemData('question', props.question + '\n', session)
      const newAnswer = new ChatItemData('answer', 'Waiting for response...', session)
      setChatItemData([...chatItemData, newQuestion, newAnswer])
      setIsReady(false)
    }
  }, [props.question, isReady, prevQuestion, chatItemData, session])

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [session])

  useEffect(() => {
    if (config.lockWhenAnswer && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [chatItemData, config.lockWhenAnswer])

  useEffect(() => {
    // when the page is responsive, session may accumulate redundant data and needs to be cleared after remounting and before making a new request
    if (props.question) {
      const newSession = initSession({ question: props.question })
      setSession(newSession)
      port.postMessage({ session: newSession })
    }
  }, [port, props.question]) // usually only triggered once

  const UpdateAnswer = useCallback(
    (value: string, appended: boolean, newType: ChatItemType, done = false) => {
      setChatItemData((old) => {
        const copy = [...old]
        const index = copy.findLastIndex((v: ChatItemData) => v.type === 'answer')
        if (index === -1) return copy
        copy[index] = new ChatItemData(newType, appended ? copy[index].content + value : value)
        copy[index].session = { ...session }
        copy[index].done = done
        return copy
      })
    },
    [session],
  )

  useEffect(() => {
    const listener = () => {
      setPort(Browser.runtime.connect())
      setIsReady(true)
    }
    port.onDisconnect.addListener(listener)
    return () => {
      port.onDisconnect.removeListener(listener)
    }
  }, [port])

  useEffect(() => {
    const listener = (msg: {
      answer: any
      session: SetStateAction<Session> // Change the type here
      done: any
      error: string
    }) => {
      if (msg.answer) {
        UpdateAnswer(msg.answer, false, 'answer')
      }
      if (msg.session) {
        setSession(msg.session)
      }
      if (msg.done) {
        UpdateAnswer('\n', true, 'answer', true)
        setIsReady(true)
      }
      if (msg.error) {
        switch (msg.error) {
          case 'UNAUTHORIZED' || 'CLOUDFLARE':
            UpdateAnswer(
              `**ACCESS DENIED**: Kindly log in at [https://chat.openai.com](https://chat.openai.com) first.
              Afterward, refresh this webpage or re-enter your inquiry. 
              You may also want to create an API key at 
              [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
              for enhanced functionality.`,
              false,
              'error',
            )
            break
          default:
            setChatItemData([...chatItemData, new ChatItemData('error', msg.error + '\n')])
            break
        }
        setIsReady(true)
      }
    }
    port.onMessage.addListener(listener)
    return () => {
      port.onMessage.removeListener(listener)
    }
  }, [UpdateAnswer, chatItemData, port.onMessage])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  return (
    <div className="chat-inner">
      <div className="chat-header">
        <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
          <GearIcon size={14} />
        </span>
        <span className="font-bold">ἐντελέχεια.άι</span>
        <span
          title="Save Conversation"
          className="chat-util-icon"
          style={{ margin: '15px 15px 10px' }}
          onClick={() => {
            let output = ''
            session.conversationRecords?.forEach((data: ConversationRecord) => {
              output += `Question:\n\n${data.question}\n\nAnswer:\n\n${data.answer}\n\n`
            })
            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
            FileSaver.saveAs(blob, 'conversation.md')
          }}
        >
          <DownloadIcon size={16} />
        </span>
      </div>
      {/* <hr /> */}
      <div
        ref={bodyRef}
        className="markdown-body"
        style={{ maxHeight: windowSize[1] * 0.75 + 'px' }}
      >
        {chatItemData.map(
          (
            data: {
              content: string
              type: 'question' | 'answer' | 'error'
              session: any
              done: boolean
            },
            idx: Key | null | undefined,
          ) => (
            <ChatItem
              content={data.content}
              key={idx}
              type={data.type}
              session={data.session}
              done={data.done}
              port={port}
            />
          ),
        )}
      </div>
      <ChatInputBox
        enabled={isReady}
        onSubmit={(question) => {
          const newQuestion = new ChatItemData('question', question + '\n')
          const newAnswer = new ChatItemData('answer', 'Waiting for response...')
          setChatItemData([...chatItemData, newQuestion, newAnswer])
          setIsReady(false)

          const newSession = { ...session, question }
          setSession(newSession)
          try {
            port.postMessage({ session: newSession })
          } catch (e) {
            UpdateAnswer((e as Error).toString(), false, 'error')
          }
        }}
      />
    </div>
  )
}

export default memo(ChatCard)
