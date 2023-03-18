import { useState } from 'react'
import { TriggerMode } from '../configs/userConfig'
import BotCard from './BotCard'
import { QueryStatus } from './chatgpt/ChatGPTQuery'

interface Props {
  question: string
  triggerMode: TriggerMode
}

function BotContainer(props: Props) {
  const [, setQueryStatus] = useState<QueryStatus>()
  return (
    <>
      <div className="chat-gpt-card">
        <BotCard
          question={props.question}
          triggerMode={props.triggerMode}
          onStatusChange={setQueryStatus}
        />
      </div>
    </>
  )
}

export default BotContainer
