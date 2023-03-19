/* eslint-disable @typescript-eslint/no-explicit-any */
class ChatItemData {
  type: 'question' | 'answer' | 'error'
  content: string
  session: object | null
  done: boolean

  constructor(
    type: 'question' | 'answer' | 'error',
    content: string,
    session: object | null = null,
    done = false,
  ) {
    this.type = type
    this.content = content
    this.session = session
    this.done = done
  }
}

export default ChatItemData
