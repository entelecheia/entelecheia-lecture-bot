import { SearchIcon } from '@primer/octicons-react'
import { useState } from 'preact/hooks'
import { TriggerMode } from '../configs/userConfig'
import BotItem, { QueryStatus } from './BotItem'

interface Props {
  question: string
  triggerMode: TriggerMode
  onStatusChange?: (status: QueryStatus) => void
}

function BotCard(props: Props) {
  const [triggered, setTriggered] = useState(false)

  if (props.triggerMode === TriggerMode.Automatically) {
    return <BotItem question={props.question} onStatusChange={props.onStatusChange} />
  }

  if (triggered) {
    return <BotItem question={props.question} onStatusChange={props.onStatusChange} />
  }

  return (
    <p className="icon-and-text cursor-pointer" onClick={() => setTriggered(true)}>
      <SearchIcon size="small" /> Ask ChatGPT for this query
    </p>
  )
}

export default BotCard
