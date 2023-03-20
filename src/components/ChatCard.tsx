/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon } from '@primer/octicons-react'
import FileSaver from 'file-saver'
import { render } from 'preact'
import { Key, memo, SetStateAction, useCallback, useEffect, useRef, useState } from 'react'
import { WindowDesktop, XLg } from 'react-bootstrap-icons'
import Browser from 'webextension-polyfill'
import { defaultConfig, getUserConfig } from '../configs/userConfig'
import ChatItemData from '../data/ChatItemData'
import { useClampWindowSize } from '../hooks/useClampWindowSize'
import { createElementAtPosition } from '../utils/createElementAtPosition'
import { ConversationRecord, initSession, Session } from '../utils/initSession'
import { isSafari } from '../utils/isSafari'
import ChatInputBox from './ChatInputBox'
import ChatItem from './ChatItem'
import FloatingToolbar from './FloatingToolbar'

const favicon = Browser.runtime.getURL('favicon.png')

interface ChatCardProps {
  session: Session
  question: string
  onUpdate?: () => void
  draggable?: boolean
  closeable?: boolean
  onClose?: () => void
}

function ChatCard(props: ChatCardProps) {
  const [isReady, setIsReady] = useState(!props.question)
  const [port, setPort] = useState(() => Browser.runtime.connect())
  const [session, setSession] = useState(props.session)
  const windowSize = useClampWindowSize([0, Infinity], [250, 1100])
  const bodyRef = useRef<HTMLDivElement>(null)
  const [chatItemData, setChatItemData] = useState(() => {
    if (props.session.conversationRecords?.length === 0) {
      if (props.question) {
        return [new ChatItemData('answer', '<p class="chat-loading">Waiting for response...</p>')]
      } else return []
    } else {
      const ret = []
      for (const record of props.session.conversationRecords || []) {
        ret.push(new ChatItemData('question', record.question + '\n<hr/>', props.session, true))
        ret.push(new ChatItemData('answer', record.answer + '\n<hr/>', props.session, true))
      }
      return ret
    }
  })
  const [config, setConfig] = useState(defaultConfig)

  useEffect(() => {
    getUserConfig().then(setConfig)
  }, [])

  useEffect(() => {
    if (props.onUpdate) props.onUpdate()
  })

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
    (value: unknown, appended: boolean, newType: ChatItemData['type'], done = false) => {
      setChatItemData((old: any) => {
        const copy = [...old]
        const index = copy.reverse().findIndex((v: { type: string }) => v.type === 'answer')
        if (index === -1) return copy.reverse()
        copy[copy.length - 1 - index] = new ChatItemData(
          newType,
          appended ? copy[copy.length - 1 - index].content + value : value,
        )
        copy[copy.length - 1 - index].session = { ...session }
        copy[copy.length - 1 - index].done = done
        return copy.reverse()
      })
    },
    [session],
  )

  useEffect(() => {
    const listener = () => {
      setPort(Browser.runtime.connect())
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
        UpdateAnswer('\n<hr/>', true, 'answer', true)
        setIsReady(true)
      }
      if (msg.error) {
        switch (msg.error) {
          case 'UNAUTHORIZED':
            UpdateAnswer(
              `UNAUTHORIZED<br>Please login at https://chat.openai.com first${
                isSafari() ? '<br>Then open https://chat.openai.com/api/auth/session' : ''
              }<br>And refresh this page or type you question again` +
                `<br><br>Consider creating an api key at https://platform.openai.com/account/api-keys<hr>`,
              false,
              'error',
            )
            break
          case 'CLOUDFLARE':
            UpdateAnswer(
              `OpenAI Security Check Required<br>Please open ${
                isSafari() ? 'https://chat.openai.com/api/auth/session' : 'https://chat.openai.com'
              }<br>And refresh this page or type you question again` +
                `<br><br>Consider creating an api key at https://platform.openai.com/account/api-keys<hr>`,
              false,
              'error',
            )
            break
          default:
            setChatItemData([...chatItemData, new ChatItemData('error', msg.error + '\n<hr/>')])
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

  return (
    <div className="chat-inner">
      <div className="chat-header">
        {!props.closeable ? (
          <img
            src={favicon}
            width="20"
            height="20"
            style={{ margin: '5px 15px 0px', userSelect: 'none' }}
          />
        ) : (
          <XLg
            className="chat-util-icon"
            style={{ margin: '5px 15px 0px' }}
            title="Close the Window"
            size={16}
            onClick={() => {
              if (props.onClose) props.onClose()
            }}
          />
        )}
        {props.draggable ? (
          <div className="dragbar" />
        ) : (
          <WindowDesktop
            className="chat-util-icon"
            title="Float the Window"
            size={16}
            onClick={() => {
              const position = { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 200 }
              const toolbarContainer = createElementAtPosition(position.x, position.y)
              toolbarContainer.className = 'toolbar-container-not-queryable'
              render(
                <FloatingToolbar
                  session={session}
                  selection=""
                  position={position}
                  container={toolbarContainer}
                  closeable={true}
                  triggered={true}
                  onClose={() => toolbarContainer.remove()}
                />,
                toolbarContainer,
              )
            }}
          />
        )}
        <span
          title="Save Conversation"
          className="chat-util-icon"
          style={{ margin: '15px 15px 10px' }}
          onClick={() => {
            let output = ''
            session.conversationRecords?.forEach((data: ConversationRecord) => {
              output += `Question:\n\n${data.question}\n\nAnswer:\n\n${data.answer}\n\n<hr/>\n\n`
            })
            const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
            FileSaver.saveAs(blob, 'conversation.md')
          }}
        >
          <DownloadIcon size={16} />
        </span>
      </div>
      <hr />
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
          const newQuestion = new ChatItemData('question', question + '\n<hr/>')
          const newAnswer = new ChatItemData(
            'answer',
            '<p class="chat-loading">Waiting for response...</p>',
          )
          setChatItemData([...chatItemData, newQuestion, newAnswer])
          setIsReady(false)

          const newSession = { ...session, question }
          setSession(newSession)
          try {
            port.postMessage({ session: newSession })
          } catch (e) {
            UpdateAnswer(e, false, 'error')
          }
        }}
      />
    </div>
  )
}

export default memo(ChatCard)
