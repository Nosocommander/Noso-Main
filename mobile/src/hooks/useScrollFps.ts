import { useEffect, useRef } from 'react'

export function useScrollFps(enabled: boolean): void {
  const scrollingRef = useRef(false)
  const framesRef = useRef(0)
  const startRef = useRef(0)
  const rafId = useRef<number | null>(null)
  const reportId = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !import.meta.env.DEV) return
    const onScroll = () => {
      if (!scrollingRef.current) {
        scrollingRef.current = true
        framesRef.current = 0
        startRef.current = performance.now()
        const loop = () => {
          framesRef.current += 1
          rafId.current = requestAnimationFrame(loop)
        }
        rafId.current = requestAnimationFrame(loop)
        reportId.current = window.setInterval(() => {
          const elapsed = (performance.now() - startRef.current) / 1000
          if (elapsed > 0) {
            const fps = Math.round(framesRef.current / elapsed)
            // eslint-disable-next-line no-console
            console.log('[perf] catalog_scroll_fps', fps)
          }
          // reset window
          framesRef.current = 0
          startRef.current = performance.now()
        }, 1000)
      }
      clearTimeout((onScroll as any)._t)
      ;(onScroll as any)._t = setTimeout(() => {
        scrollingRef.current = false
        if (rafId.current) cancelAnimationFrame(rafId.current)
        if (reportId.current) clearInterval(reportId.current)
        rafId.current = null
        reportId.current = null
      }, 200)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll as any)
      if (rafId.current) cancelAnimationFrame(rafId.current)
      if (reportId.current) clearInterval(reportId.current)
    }
  }, [enabled])
}


