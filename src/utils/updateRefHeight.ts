interface RefObject {
  current: HTMLElement | null
}

export function updateRefHeight(ref: RefObject): void {
  if (ref.current) {
    ref.current.style.height = 'auto'
    const computed = window.getComputedStyle(ref.current)
    const height =
      parseInt(computed.getPropertyValue('border-top-width'), 10) +
      parseInt(computed.getPropertyValue('padding-top'), 10) +
      ref.current.scrollHeight +
      parseInt(computed.getPropertyValue('padding-bottom'), 10) +
      parseInt(computed.getPropertyValue('border-bottom-width'), 10)
    ref.current.style.height = `${height}px`
  }
}
