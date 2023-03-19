import { CheckIcon, CopyIcon } from '@primer/octicons-react'
import { useState } from 'react'

interface CopyButtonProps {
  contentFn: () => string
  size: number
  className?: string
}

function CopyButton({ className, contentFn, size }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const onClick = () => {
    navigator.clipboard
      .writeText(contentFn())
      .then(() => setCopied(true))
      .then(() =>
        setTimeout(() => {
          setCopied(false)
        }, 600),
      )
  }

  return (
    <span title="Copy" className={`gpt-util-icon ${className ? className : ''}`} onClick={onClick}>
      {copied ? <CheckIcon size={size} /> : <CopyIcon size={size} />}
    </span>
  )
}

export default CopyButton
