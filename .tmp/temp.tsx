/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon } from '@primer/octicons-react'
import FileSaver from 'file-saver'
import { render } from 'preact'
import PropTypes from 'prop-types'
import { memo, useEffect, useRef, useState } from 'react'
import { WindowDesktop, XLg } from 'react-bootstrap-icons'
import Browser from 'webextension-polyfill'
import ChatItem from '../src/components/ChatItem'
import FloatingToolbar from '../src/components/FloatingToolbar'
import InputBox from '../src/components/InputBox'
import { defaultConfig, getUserConfig } from '../src/configs/userConfig'
import { useClampWindowSize } from '../src/hooks/useClampWindowSize'
import { createElementAtPosition } from '../src/utils/createElementAtPosition'
import { initSession } from '../src/utils/initSession'
import { isSafari } from '../src/utils/isSafari'

const favicon = Browser.runtime.getURL('favicon.png')

class ChatItemData extends Object {
  type: any
  content: any
  session: null
  done: boolean
  constructor(type: any, content: any, session = null, done = false) {
    super()
    this.type = type
    this.content = content
    this.session = session
    this.done = done
  }
}

function ChatCard(props) {
  const [isReady, setIsReady] = useState(!props.question)
  const [port, setPort] = useState(() => Browser.runtime.connect())
  const [session, setSession] = useState(props.session)
  const windowSize = useClampWindowSize([0, Infinity], [250, 1100])
  const bodyRef = useRef(null)
  const [ChatItemData, setChatItemData] = useState(
    (() => {
      if (props.session.conversationRecords.length === 0)
        if (props.question)
          return [new ChatItemData('answer', '<p class="gpt-loading">Waiting for response...</p>')]
        else return []
      else {
        const ret = []
        for (const record of props.session.conversationRecords) {
          ret.push(new ChatItemData('question', record.question + '\n<hr/>', props.session, true))
          ret.push(new ChatItemData('answer', record.answer + '\n<hr/>', props.session, true))
        }
        return ret
      }
    })(),
  )
  const [config, setConfig] = useState(defaultConfig)

  useEffect(() => {
    getUserConfig().then(setConfig)
  }, [])

  useEffect(() => {
    if (props.onUpdate) props.onUpdate()
  })

  useEffect(() => {
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [session])

  useEffect(() => {
    if (config.lockWhenAnswer) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [ChatItemData])

  useEffect(() => {
    // when the page is responsive, session may accumulate redundant data and needs to be cleared after remounting and before making a new request
    if (props.question) {
      const newSession = initSession({ question: props.question })
      setSession(newSession)
      port.postMessage({ session: newSession })
    }
  }, [props.question]) // usually only triggered once

  /**
   * @param {string} value
   * @param {boolean} appended
   * @param {'question'|'answer'|'error'} newType
   * @param {boolean} done
   */
  const UpdateAnswer = (value, appended, newType, done = false) => {
    setChatItemData((old) => {
      const copy = [...old]
      const index = copy.findLastIndex((v) => v.type === 'answer')
      if (index === -1) return copy
      copy[index] = new ChatItemData(newType, appended ? copy[index].content + value : value)
      copy[index].session = { ...session }
      copy[index].done = done
      return copy
    })
  }

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
    const listener = (msg) => {
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
            setChatItemData([...ChatItemData, new ChatItemData('error', msg.error + '\n<hr/>')])
            break
        }
        setIsReady(true)
      }
    }
    port.onMessage.addListener(listener)
    return () => {
      port.onMessage.removeListener(listener)
    }
  }, [ChatItemData])

  return (
    <div className="gpt-inner">
      <div className="gpt-header">
        {!props.closeable ? (
          <img src={favicon} width="20" height="20" style="margin:5px 15px 0px;user-select:none;" />
        ) : (
          <XLg
            className="gpt-util-icon"
            style="margin:5px 15px 0px;"
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
            className="gpt-util-icon"
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
          className="gpt-util-icon"
          style="margin:15px 15px 10px;"
          onClick={() => {
            let output = ''
            session.conversationRecords.forEach((data) => {
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
        {ChatItemData.map((data, idx) => (
          <ChatItem
            content={data.content}
            key={idx}
            type={data.type}
            session={data.session}
            done={data.done}
            port={port}
          />
        ))}
      </div>
      <InputBox
        enabled={isReady}
        onSubmit={(question) => {
          const newQuestion = new ChatItemData('question', question + '\n<hr/>')
          const newAnswer = new ChatItemData(
            'answer',
            '<p class="gpt-loading">Waiting for response...</p>',
          )
          setChatItemData([...ChatItemData, newQuestion, newAnswer])
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

ChatCard.propTypes = {
  session: PropTypes.object.isRequired,
  question: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
  draggable: PropTypes.bool,
  closeable: PropTypes.bool,
  onClose: PropTypes.func,
}

export default memo(ChatCard)
