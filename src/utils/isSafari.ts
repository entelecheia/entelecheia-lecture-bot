export function isSafari(): boolean {
  const userAgent = navigator.userAgent
  const isAppleWebKit = userAgent.includes('AppleWebKit')
  const isSafari = userAgent.includes('Safari')
  const isChrome = userAgent.includes('Chrome')
  const isEdge = userAgent.includes('Edg')

  return isAppleWebKit && isSafari && !isChrome && !isEdge
}
