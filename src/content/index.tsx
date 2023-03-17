/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { SiteConfiguration } from './siteConfig'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

async function mount(question: string, siteConfig: SiteConfiguration) {
  const container = document.createElement('div')
  container.className = 'chat-gpt-container'

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

  const sidebarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  if (sidebarContainer) {
    sidebarContainer.append(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  render(
    <ChatGPTContainer question={question} triggerMode={userConfig.triggerMode || 'always'} />,
    container,
  )
}

const siteRegex = /lecture\.entelecheia\.ai/
const siteName = location.hostname.match(siteRegex)![0]
const siteConfig = {
  bodyContainerQuery: ['#jb-print-docs-body.onlyprint'],
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
  mount(initialQuestion, siteConfig)
}

run()
