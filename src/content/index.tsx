/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render } from 'preact'
import Browser from 'webextension-polyfill'
import '../../styles/base.css'
import '../../styles/styles.scss'
import ChatContainer from '../components/ChatContainer'
import FloatingToolbar from '../components/FloatingToolbar'
import { SiteConfiguration, ThemeMode, updateUserConfig } from '../configs'
import { createElementAtPosition, initSession, Session } from '../utils'

async function mountChatContainer(
  session: Session,
  question: string,
  siteConfig: SiteConfiguration,
) {
  const container = document.createElement('div')
  container.className = 'lecture-chat-container'

  render(
    <ChatContainer
      session={session}
      question={question}
      siteConfig={siteConfig}
      container={container}
    />,
    container,
  )
}

let toolbarContainer: HTMLElement | null = null

async function attachToolbar(
  sesseion: Session,
  handlePromptGenerated: (prompt: string) => void,
): Promise<void> {
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
        toolbarContainer.className = 'lecture-bot-toolbar-container'
        render(
          <FloatingToolbar
            session={sesseion}
            selection={selection}
            position={position}
            container={toolbarContainer}
            onPromptGenerated={handlePromptGenerated}
          />,
          toolbarContainer,
        )
      }
    })
  })
  document.addEventListener('mousedown', (e: MouseEvent) => {
    if (toolbarContainer && toolbarContainer.contains(e.target as Node)) return

    document.querySelectorAll('.lecture-bot-toolbar-container').forEach((e) => e.remove())
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

// ...

function handleThemeSwitchButtonClick(event: MouseEvent) {
  const button = event.target as HTMLElement
  const themeSwitch = button.closest('.theme-switch')

  if (themeSwitch) {
    const mode = themeSwitch.getAttribute('data-mode') as ThemeMode
    updateUserConfig({ themeMode: mode })
    console.log('Theme mode changed:', mode)
  }
}

async function addThemeChangeListener() {
  document.addEventListener('click', (event) => {
    if (
      (event.target as HTMLElement).classList.contains('theme-switch-button') ||
      (event.target as HTMLElement).closest('.theme-switch-button')
    ) {
      handleThemeSwitchButtonClick(event)
    }
  })
}

async function run() {
  console.debug('Mount LectureBotfor ἐντελέχεια.άι on', siteName)
  const initialQuestion = getBodyContent()
  const session = initSession()

  function handlePromptGenerated(prompt: string) {
    window.postMessage({ type: 'NEW_PROMPT', prompt }, '*')
  }

  const onUrlChange = () => {
    // Send a message to the background script to delete the conversation when the context changes.
    const message = {
      type: 'DELETE_CONVERSATION',
      conversationId: session.conversationId,
    }
    Browser.runtime.sendMessage(message)
  }

  window.addEventListener('popstate', onUrlChange)

  // Call mountChatContainer with the initialQuestion as the initial prompt
  mountChatContainer(session, initialQuestion, siteConfig)
  attachToolbar(session, handlePromptGenerated)
  // Add theme change listener
  addThemeChangeListener()
}

run()
