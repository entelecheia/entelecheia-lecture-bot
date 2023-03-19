/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronDownIcon, LinkExternalIcon, XCircleIcon } from '@primer/octicons-react'
import { memo, useState } from 'react'
import ChatFeedback from './ChatFeedback'
import CopyButton from './CopyButton'

interface ChatItemProps {
  type: 'question' | 'answer' | 'error'
  content: string
  session: any
  done: boolean
  port: any
}

function ChatItem({ type, content, session, done, port }: ChatItemProps) {
  const [collapsed, setCollapsed] = useState(false)

  switch (type) {
    case 'question':
      return (
        <div className={type} dir="auto">
          <div className="gpt-header">
            <p>You:</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <CopyButton contentFn={() => content} size={14} />
              {!collapsed ? (
                <span title="Collapse" className="gpt-util-icon" onClick={() => setCollapsed(true)}>
                  <XCircleIcon size={14} />
                </span>
              ) : (
                <span title="Expand" className="gpt-util-icon" onClick={() => setCollapsed(false)}>
                  <ChevronDownIcon size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
      )
    case 'answer':
      return (
        <div className={type} dir="auto">
          <div className="gpt-header">
            <p>{session ? 'ChatGPT:' : 'Loading...'}</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              {!done && (
                <button
                  type="button"
                  className="normal-button"
                  onClick={() => {
                    port.postMessage({ stop: true })
                  }}
                >
                  Stop
                </button>
              )}
              {done && session && session.conversationId && (
                <ChatFeedback
                  messageId={session.messageId}
                  conversationId={session.conversationId}
                />
              )}
              {session && session.conversationId && (
                <a
                  title="Continue on official website"
                  href={'https://chat.openai.com/chat/' + session.conversationId}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  style={{ color: 'inherit' }}
                >
                  <LinkExternalIcon size={14} />
                </a>
              )}
              {session && <CopyButton contentFn={() => content} size={14} />}
              {!collapsed ? (
                <span title="Collapse" className="gpt-util-icon" onClick={() => setCollapsed(true)}>
                  <XCircleIcon size={14} />
                </span>
              ) : (
                <span title="Expand" className="gpt-util-icon" onClick={() => setCollapsed(false)}>
                  <ChevronDownIcon size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
      )
    case 'error':
      return (
        <div className={type} dir="auto">
          <div className="gpt-header">
            <p>Error:</p>
            <div style={{ display: 'flex', gap: '15px' }}>
              <CopyButton contentFn={() => content} size={14} />
              {!collapsed ? (
                <span title="Collapse" className="gpt-util-icon" onClick={() => setCollapsed(true)}>
                  <XCircleIcon size={14} />
                </span>
              ) : (
                <span title="Expand" className="gpt-util-icon" onClick={() => setCollapsed(false)}>
                  <ChevronDownIcon size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
      )
  }
}
export default memo(ChatItem)
