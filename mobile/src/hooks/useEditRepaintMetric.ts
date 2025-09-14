import { useCallback, useRef } from 'react'

export function useEditRepaintMetric() {
  const startRef = useRef<number | null>(null)
  const begin = useCallback(() => {
    if (!import.meta.env.DEV) return
    startRef.current = performance.now()
  }, [])
  const end = useCallback(() => {
    if (!import.meta.env.DEV) return
    const s = startRef.current
    startRef.current = null
    if (s != null) {
      const ms = Math.round(performance.now() - s)
      // eslint-disable-next-line no-console
      console.log('[perf] edit_repaint_ms', ms)
    }
  }, [])
  return { begin, end }
}


