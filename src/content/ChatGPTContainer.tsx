import { Fragment, h } from 'preact'
import { useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { TriggerMode } from '../config'
import ChatGPTCard from './ChatGPTCard'
import { QueryStatus } from './ChatGPTQuery'

interface Props {
  question: string
  triggerMode: TriggerMode
}

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const query = useSWRImmutable(queryStatus === 'success' ? 'promotion' : undefined, {
    shouldRetryOnError: false,
  })
  return (
    <Fragment>
      <div className="chat-gpt-card">
        <ChatGPTCard
          question={props.question}
          triggerMode={props.triggerMode}
          onStatusChange={setQueryStatus}
        />
      </div>
      {query.data}
    </Fragment>
  )
}

export default ChatGPTContainer
