// https://stackoverflow.com/questions/19014250/rerender-view-on-browser-resize-with-react

import { useLayoutEffect, useState } from 'react'

export function useWindowSize() {
  const [size, setSize] = useState([0, 0])
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight])
    }
    window.addEventListener('resize', updateSize)
    updateSize()
    return () => window.removeEventListener('resize', updateSize)
  }, [])
  return size
}

export function useClampWindowSize(widthRange = [0, Infinity], heightRange = [0, Infinity]) {
  const windowSize = useWindowSize()
  windowSize[0] = Math.min(widthRange[1], Math.max(windowSize[0], widthRange[0]))
  windowSize[1] = Math.min(heightRange[1], Math.max(windowSize[1], heightRange[0]))
  return windowSize
}
