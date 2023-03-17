import { h, render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { SiteConfiguration } from './siteConfig'
import './styles.scss'

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

  const sidebarContainer = document.querySelector(siteConfig.sidebarContainerQuery)
  if (sidebarContainer) {
    sidebarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = document.querySelector(siteConfig.appendContainerQuery)
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
  sidebarContainerQuery: '.bd-sidebar-secondary.bd-toc',
  appendContainerQuery: '#jb-print-docs-body.onlyprint',
}

async function run() {
  console.debug('Mount ChatGPT on', siteName)
  const userConfig = await getUserConfig()
  mount('', siteConfig)
}

run()
