import Browser from 'webextension-polyfill'

Browser.runtime.sendMessage({ type: 'OPEN_LECTURE' })
