import { useCallback, useLayoutEffect, useRef, useState } from 'react'

interface IndicatorRect {
  left: number
  top: number
  width: number
  height: number
}

/**
 * Tracks the position/size of the DOM node registered under `activeKey` (via `setItemRef`)
 * relative to `containerRef`, so callers can render a sliding "pill" behind chip/tab groups
 * instead of just swapping colors. Recomputes on resize/wrap since chips can reflow on mobile.
 */
export function useSlidingIndicator(activeKey: string | null) {
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [rect, setRect] = useState<IndicatorRect | null>(null)

  const setItemRef = useCallback(
    (key: string) => (node: HTMLElement | null) => {
      if (node) itemRefs.current.set(key, node)
      else itemRefs.current.delete(key)
    },
    []
  )

  useLayoutEffect(() => {
    const container = containerRef.current
    const activeEl = activeKey ? itemRefs.current.get(activeKey) : null
    if (!container || !activeEl) {
      setRect(null)
      return
    }

    const update = () => {
      const containerBox = container.getBoundingClientRect()
      const activeBox = activeEl.getBoundingClientRect()
      setRect({
        left: activeBox.left - containerBox.left,
        top: activeBox.top - containerBox.top,
        width: activeBox.width,
        height: activeBox.height,
      })
    }

    update()

    const observer = new ResizeObserver(update)
    observer.observe(container)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [activeKey])

  return { containerRef, setItemRef, rect }
}
