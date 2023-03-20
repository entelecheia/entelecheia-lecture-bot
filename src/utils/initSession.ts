export type ConversationRecord = {
  question: string
  answer: string
  error?: string
}

export interface Session {
  question: string | null
  conversationId: string | null
  messageId: string | null
  parentMessageId: string | null
  conversationRecords: ConversationRecord[] | null
  useApiKey: boolean | null
}

export function initSession({
  question = null,
  conversationId = null,
  messageId = null,
  parentMessageId = null,
  conversationRecords = [],
  useApiKey = null,
}: Partial<Session> = {}): Session {
  return {
    question,
    conversationId,
    messageId,
    parentMessageId,
    conversationRecords,
    useApiKey,
  }
}
