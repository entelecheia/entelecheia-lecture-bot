/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render } from 'preact'
import '../../styles/base.css'
import '../../styles/styles.scss'
import ChatContainer from '../components/ChatContainer'
import FloatingToolbar from '../components/FloatingToolbar'
import { SiteConfiguration } from '../configs/siteConfig'
import { createElementAtPosition } from '../utils/createElementAtPosition'
import { initSession } from '../utils/initSession'

async function mountChatContainer(question: string, siteConfig: SiteConfiguration) {
  const container = document.createElement('div')
  container.className = 'lecture-chat-container'

  render(
    <ChatContainer
      session={initSession()}
      question={question}
      siteConfig={siteConfig}
      container={container}
    />,
    container,
  )
}

let toolbarContainer: HTMLElement | null = null

async function attachToolbar(): Promise<void> {
  document.addEventListener('mouseup', (e: MouseEvent) => {
    if (toolbarContainer && toolbarContainer.contains(e.target as Node)) return
    if (
      toolbarContainer &&
      window.getSelection()?.rangeCount &&
      toolbarContainer.contains(
        window.getSelection()?.getRangeAt(0).endContainer.parentElement ?? null,
      )
    )
      return

    if (toolbarContainer) toolbarContainer.remove()
    setTimeout(() => {
      const selection = window.getSelection()?.toString()
      if (selection) {
        const position = { x: e.clientX + 15, y: e.clientY - 15 }
        toolbarContainer = createElementAtPosition(position.x, position.y)
        toolbarContainer.className = 'chatgptbox-toolbar-container'
        render(
          <FloatingToolbar
            session={initSession()}
            selection={selection}
            position={position}
            container={toolbarContainer}
          />,
          toolbarContainer,
        )
      }
    })
  })
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (toolbarContainer && toolbarContainer.contains(e.target as Node)) return

    document.querySelectorAll('.chatgptbox-toolbar-container').forEach((e) => e.remove())
  })
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (
      (toolbarContainer &&
        !toolbarContainer.contains(e.target as Node) &&
        (e.target as HTMLElement).nodeName === 'INPUT') ||
      (e.target as HTMLElement).nodeName === 'TEXTAREA'
    ) {
      setTimeout(() => {
        if (!window.getSelection()?.toString()) toolbarContainer?.remove()
      })
    }
  })
}

const siteRegex = /lecture\.entelecheia\.ai/
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = {
  bodyContainerQuery: ['.bd-article'],
  sidebarContainerQuery: ['.bd-sidebar-secondary.bd-toc'],
  appendContainerQuery: [],
  // appendContainerQuery: ['.sidebar-secondary-items.sidebar-secondary__inner'],
}

function getBodyContent() {
  const bodyElement = document.querySelector(siteConfig.bodyContainerQuery[0])
  if (bodyElement) {
    const maxLength = 1000 // Set the desired max length of the content
    const bodyContent = bodyElement.textContent || ''
    const trimmedContent =
      bodyContent.length > maxLength ? bodyContent.slice(0, maxLength) + '...' : bodyContent

    // Append the limiting message
    const limitingMessage =
      'Summarize the conent in a few words. Please keep the discussion within the scope of this conten.'
    const initialMessage = `${trimmedContent}\n\n${limitingMessage}`

    return initialMessage
  }
  return ''
}

async function run() {
  console.debug('Mount ChatGPT on', siteName)
  const initialQuestion = getBodyContent()
  // mountBotContainer(initialQuestion, siteConfig)
  mountChatContainer(initialQuestion, siteConfig)
  attachToolbar()
}

run()
