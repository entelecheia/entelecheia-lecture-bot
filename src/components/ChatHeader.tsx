/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DownloadIcon } from '@primer/octicons-react'
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

function ChatHeader(props: ChatHeaderProps) {
  return (
    <div className="gpt-header">
      {!props.closeable ? (
        <img
          src={props.favicon}
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
          onClick={props.onClose}
        />
      )}
      {props.draggable ? (
        <div className="dragbar" />
      ) : (
        <WindowDesktop
          className="gpt-util-icon"
          title="Float the Window"
          size={16}
          onClick={props.onFloatWindow}
        />
      )}
      <span
        title="Save Conversation"
        className="gpt-util-icon"
        style={{ margin: '15px 15px 10px' }}
        onClick={props.onSaveConversation}
      >
        <DownloadIcon size={16} />
      </span>
    </div>
  )
}

export default ChatHeader
