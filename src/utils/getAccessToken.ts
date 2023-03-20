import ExpiryMap from 'expiry-map'
import { getUserConfig } from '../configs/userConfig'
import { isSafari } from './isSafari'

export const KEY_ACCESS_TOKEN = 'accessToken'
export const cache = new ExpiryMap(10 * 1000)

async function getAccessToken(): Promise<string> {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN)
  }
  if (isSafari()) {
    const userConfig = await getUserConfig()
    if (userConfig.accessToken) {
      cache.set(KEY_ACCESS_TOKEN, userConfig.accessToken)
    } else {
      throw new Error('UNAUTHORIZED')
    }
  } else {
    const resp = await fetch('https://chat.openai.com/api/auth/session')
    if (resp.status === 403) {
      throw new Error('CLOUDFLARE')
    }
    const data = await resp.json().catch(() => ({}))
    if (!data.accessToken) {
      throw new Error('UNAUTHORIZED')
    }
    cache.set(KEY_ACCESS_TOKEN, data.accessToken)
  }
  return cache.get(KEY_ACCESS_TOKEN)
}

export { getAccessToken }
