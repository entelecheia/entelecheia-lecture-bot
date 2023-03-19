/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react'
import ChatItemData from '../models/ChatItemData'
import ChatItem from './ChatItem'

interface ChatContentProps {
  chatItemData: ChatItemData[]
  session: any
  port: any
  windowSize: [number, number]
  config: any
}

const ChatContent: React.FC<ChatContentProps> = ({
  chatItemData,
  session,
  port,
  windowSize,
  config,
}) => {
  const bodyRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={bodyRef} className="markdown-body" style={{ maxHeight: windowSize[1] * 0.75 + 'px' }}>
      {chatItemData.map((data, idx) => (
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
  )
}

export default ChatContent
