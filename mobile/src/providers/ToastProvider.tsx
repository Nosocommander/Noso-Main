import { IonToast } from '@ionic/react'
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from 'react'

type ToastOptions = {
  message: string
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'medium' | 'dark' | 'light'
  durationMs?: number
}

type ToastContextValue = {
  showToast: (options: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export const ToastProvider = ({ children }: PropsWithChildren): React.ReactElement => {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ToastOptions>({ message: '', color: 'primary', durationMs: 2000 })

  const showToast = useCallback((opts: ToastOptions) => {
    setOptions({ color: 'primary', durationMs: 2000, ...opts })
    setOpen(true)
  }, [])

  const ctxValue = useMemo<ToastContextValue>(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={ctxValue}>
      {children}
      <IonToast
        isOpen={open}
        message={options.message}
        color={options.color}
        duration={options.durationMs}
        onDidDismiss={() => setOpen(false)}
      />
    </ToastContext.Provider>
  )
}


