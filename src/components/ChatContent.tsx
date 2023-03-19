/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react'
import ChatItemData from '../data/ChatItemData'
import ChatItem from './ChatItem'

interface ChatContentProps {
  chatItemData: ChatItemData[]
  session: any
  port: any
  windowSize: [number, number]
  config: any
}

function ChatContent(props: ChatContentProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [props.session])

  useEffect(() => {
    if (props.config.lockWhenAnswer && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [props.chatItemData, props.config.lockWhenAnswer])

  return (
    <div
      ref={bodyRef}
      className="markdown-body"
      style={{ maxHeight: props.windowSize[1] * 0.75 + 'px' }}
    >
      {props.chatItemData.map((data, idx) => (
        <ChatItem
          content={data.content}
          key={idx}
          type={data.type}
          session={data.session}
          done={data.done}
          port={props.port}
        />
      ))}
    </div>
  )
}

export default ChatContent
