import { ThumbsdownIcon, ThumbsupIcon } from '@primer/octicons-react'
import { memo, useCallback, useState } from 'react'
import Browser from 'webextension-polyfill'

interface Props {
  messageId: string
  conversationId: string
}

function ChatFeedback(props: Props) {
  const [action, setAction] = useState<'thumbsUp' | 'thumbsDown' | null>(null)

  const clickThumbsUp = useCallback(async () => {
    if (action) {
      return
    }
    setAction('thumbsUp')
    await Browser.runtime.sendMessage({
      type: 'FEEDBACK',
      data: {
        conversation_id: props.conversationId,
        message_id: props.messageId,
        rating: 'thumbsUp',
      },
    })
  }, [action, props.conversationId, props.messageId])

  const clickThumbsDown = useCallback(async () => {
    if (action) {
      return
    }
    setAction('thumbsDown')
    await Browser.runtime.sendMessage({
      type: 'FEEDBACK',
      data: {
        conversation_id: props.conversationId,
        message_id: props.messageId,
        rating: 'thumbsDown',
        text: '',
        tags: [],
      },
    })
  }, [action, props.conversationId, props.messageId])

  return (
    <div className="gpt-feedback">
      <span
        onClick={clickThumbsUp}
        className={action === 'thumbsUp' ? 'gpt-feedback-selected' : undefined}
      >
        <ThumbsupIcon size={14} />
      </span>
      <span
        onClick={clickThumbsDown}
        className={action === 'thumbsDown' ? 'gpt-feedback-selected' : undefined}
      >
        <ThumbsdownIcon size={14} />
      </span>
    </div>
  )
}

export default memo(ChatFeedback)
