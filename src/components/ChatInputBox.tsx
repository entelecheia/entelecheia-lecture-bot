import { KeyboardEvent, useEffect, useRef, useState } from 'react'
import { updateRefHeight } from '../utils/updateRefHeight'

interface ChatInputBoxProps {
  onSubmit: (value: string) => void
  enabled?: boolean
}

export function ChatInputBox({ onSubmit, enabled }: ChatInputBoxProps) {
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      updateRefHeight(inputRef)
    }
  })

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === 'Enter' && e.shiftKey === false) {
      e.preventDefault()
      if (!value) return
      onSubmit(value)
      setValue('')
    }
  }

  return (
    <textarea
      ref={inputRef}
      disabled={!enabled}
      className="interact-input"
      placeholder={
        enabled
          ? 'Type your question here\nEnter to send, shift + enter to break line'
          : 'Wait for the answer to finish and then continue here'
      }
      value={value}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={onKeyDown}
    />
  )
}

export default ChatInputBox
