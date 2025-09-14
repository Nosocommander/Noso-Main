import { createContext, useCallback, useContext, useMemo, useRef, useState, type PropsWithChildren } from 'react'

type EditStateContextValue = {
  hasPending: boolean
  setHasPending: (v: boolean) => void
  registerSaveHandler: (fn: (() => Promise<void>) | null) => void
  registerDiscardHandler: (fn: (() => void) | null) => void
  invokeSave: () => Promise<void>
  invokeDiscard: () => void
}

const EditStateContext = createContext<EditStateContextValue | undefined>(undefined)

export const EditStateProvider = ({ children }: PropsWithChildren): React.ReactElement => {
  const [hasPending, setHasPending] = useState(false)
  const saveRef = useRef<null | (() => Promise<void>)>(null)
  const discardRef = useRef<null | (() => void)>(null)

  const registerSaveHandler = useCallback((fn: (() => Promise<void>) | null) => {
    saveRef.current = fn
  }, [])
  const registerDiscardHandler = useCallback((fn: (() => void) | null) => {
    discardRef.current = fn
  }, [])
  const invokeSave = useCallback(async () => {
    if (saveRef.current) await saveRef.current()
  }, [])
  const invokeDiscard = useCallback(() => {
    if (discardRef.current) discardRef.current()
  }, [])

  const value = useMemo<EditStateContextValue>(() => ({
    hasPending,
    setHasPending,
    registerSaveHandler,
    registerDiscardHandler,
    invokeSave,
    invokeDiscard,
  }), [hasPending, registerSaveHandler, registerDiscardHandler, invokeSave, invokeDiscard])

  return <EditStateContext.Provider value={value}>{children}</EditStateContext.Provider>
}

export function useEditState(): EditStateContextValue {
  const ctx = useContext(EditStateContext)
  if (!ctx) throw new Error('useEditState must be used within EditStateProvider')
  return ctx
}


