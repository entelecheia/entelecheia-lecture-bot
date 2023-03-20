import { ConversationRecord } from './initSession'

type ConversationPair = { role: string; content: string }

export function getChatGptConversationPairs(records: ConversationRecord[]): ConversationPair[] {
  const pairs: ConversationPair[] = []

  for (const record of records) {
    pairs.push({ role: 'user', content: record.question })
    pairs.push({ role: 'assistant', content: record.answer })
  }

  return pairs
}

export function getNonChatGptConversationPairs(records: ConversationRecord[]): string {
  let pairs = ''

  for (const record of records) {
    pairs += 'Human:' + record.question + '\nAI:' + record.answer + '\n'
  }

  return pairs
}
