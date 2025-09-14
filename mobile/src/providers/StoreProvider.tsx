import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { Preferences } from '@capacitor/preferences'

type StoreContextValue = {
  storeId: string
  setStoreId: (id: string) => Promise<void>
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined)

const ACTIVE_KEY = 'active_store_id'

export const StoreProvider = ({ children }: PropsWithChildren): React.ReactElement => {
  const [storeId, setStore] = useState<string>('default')

  useEffect(() => {
    ;(async () => {
      try {
        const active = await Preferences.get({ key: ACTIVE_KEY })
        if (active.value) {
          setStore(active.value)
          return
        }
        // fallback to default from settings if present
        const def = await Preferences.get({ key: 'settings_default_store_id' })
        if (def.value) setStore(def.value)
      } catch {}
    })()
  }, [])

  const setStoreId = useCallback(async (id: string) => {
    setStore(id)
    try {
      await Preferences.set({ key: ACTIVE_KEY, value: id })
    } catch {}
  }, [])

  const value = useMemo<StoreContextValue>(() => ({ storeId, setStoreId }), [storeId, setStoreId])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}


