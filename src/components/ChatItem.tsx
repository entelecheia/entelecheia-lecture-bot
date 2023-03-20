/* eslint-disable @typescript-eslint/no-explicit-any */
import { LinkExternalIcon } from '@primer/octicons-react'
import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import { Session } from '../utils/initSession'
import CopyButton from './CopyButton'

interface ChatItemProps {
  type: 'question' | 'answer' | 'error'
  content: string
  session: Session
  done: boolean
  port: any
}

function ChatItem({ type, content, session, done, port }: ChatItemProps) {
  switch (type) {
    case 'question':
      return (
        <div className={type} dir="auto">
          <div className="chat-header">
            <p>You:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CopyButton contentFn={() => content} size={12} />
            </div>
          </div>
          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {content}
          </ReactMarkdown>
        </div>
      )
    case 'answer':
      return (
        <div className={type} dir="auto">
          <div className="chat-header">
            <p>{session ? 'AI:' : 'Loading...'}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
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
              {session && <CopyButton contentFn={() => content} size={12} />}
            </div>
          </div>
          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {content}
          </ReactMarkdown>
        </div>
      )
    case 'error':
      return (
        <div className={type} dir="auto">
          <div className="chat-header">
            <p>Error:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <CopyButton contentFn={() => content} size={12} />
            </div>
          </div>
          <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
            {content}
          </ReactMarkdown>
        </div>
      )
  }
}

export default memo(ChatItem)

// {done && session && session.conversationId && (
//   <ChatFeedback
//     messageId={session.messageId || ''}
//     conversationId={session.conversationId}
//   />
// )}
