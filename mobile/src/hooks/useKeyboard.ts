import { useEffect, useState } from 'react'

export function useKeyboard(): { isOpen: boolean; bottomInset: number } {
  const [isOpen, setIsOpen] = useState(false)
  const [bottomInset, setBottomInset] = useState(0)

  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined
    if (!vv) return
    const handler = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setBottomInset(inset)
      setIsOpen(inset > 50)
    }
    vv.addEventListener('resize', handler)
    vv.addEventListener('scroll', handler)
    handler()
    return () => {
      vv.removeEventListener('resize', handler)
      vv.removeEventListener('scroll', handler)
    }
  }, [])

  return { isOpen, bottomInset }
}


