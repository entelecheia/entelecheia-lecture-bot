/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon } from '@primer/octicons-react'
import React from 'react'
import { WindowDesktop, XLg } from 'react-bootstrap-icons'

interface ChatHeaderProps {
  favicon: string
  closeable: boolean
  draggable: boolean
  session: any
  onClose?: () => void
  onSaveConversation?: () => void
  onFloatWindow?: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  favicon,
  closeable,
  draggable,
  session,
  onClose,
  onSaveConversation,
  onFloatWindow,
}) => {
  return (
    <div className="gpt-header">
      {!closeable ? (
        <img
          src={favicon}
          width="20"
          height="20"
          style={{ margin: '5px 15px 0px', userSelect: 'none' }}
        />
      ) : (
        <XLg
          className="gpt-util-icon"
          style={{ margin: '5px 15px 0px' }}
          title="Close the Window"
          size={16}
          onClick={onClose}
        />
      )}
      {draggable ? (
        <div className="dragbar" />
      ) : (
        <WindowDesktop
          className="gpt-util-icon"
          title="Float the Window"
          size={16}
          onClick={onFloatWindow}
        />
      )}
      <span
        title="Save Conversation"
        className="gpt-util-icon"
        style={{ margin: '15px 15px 10px' }}
        onClick={onSaveConversation}
      >
        <DownloadIcon size={16} />
      </span>
    </div>
  )
}

export default ChatHeader
