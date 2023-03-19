import { SearchIcon } from '@primer/octicons-react'
import { useState } from 'preact/hooks'
import { TriggerMode } from '../configs/userConfig'
import BotQuery, { QueryStatus } from './BotQuery'

interface Props {
  question: string
  triggerMode: TriggerMode
  onStatusChange?: (status: QueryStatus) => void
}

function BotCard(props: Props) {
  const [triggered, setTriggered] = useState(false)

  if (props.triggerMode === TriggerMode.Automatically) {
    return <BotQuery question={props.question} onStatusChange={props.onStatusChange} />
  }

  if (triggered) {
    return <BotQuery question={props.question} onStatusChange={props.onStatusChange} />
  }

  return (
    <p className="icon-and-text cursor-pointer" onClick={() => setTriggered(true)}>
      <SearchIcon size="small" /> Ask ChatGPT for this query
    </p>
  )
}

export default BotCard
