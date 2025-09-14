import { Preferences } from '@capacitor/preferences'
import { Network } from '@capacitor/network'

type StorageLike = {
  getItem: (key: string) => Promise<string | null> | string | null
  setItem: (key: string, value: string) => Promise<void> | void
  removeItem: (key: string) => Promise<void> | void
}

type QueuedMutation = {
  key: string
  payload: unknown
}

const STORAGE_KEY = 'offlineRetryQueue'
let customFlushHandler: ((item: QueuedMutation) => Promise<void>) | null = null

function getWebStorage(): StorageLike {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return {
        getItem: (key) => window.localStorage.getItem(key),
        setItem: (key, value) => window.localStorage.setItem(key, value),
        removeItem: (key) => window.localStorage.removeItem(key),
      }
    }
  } catch {}
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  }
}

async function getPersistedList(): Promise<QueuedMutation[]> {
  try {
    const existing = await Preferences.get({ key: STORAGE_KEY })
    if (existing.value) return JSON.parse(existing.value)
  } catch {}
  const web = getWebStorage()
  const val = typeof web.getItem === 'function' ? await (web.getItem as any)(STORAGE_KEY) : null
  return val ? JSON.parse(val) : []
}

async function setPersistedList(list: QueuedMutation[]): Promise<void> {
  const value = JSON.stringify(list)
  try {
    await Preferences.set({ key: STORAGE_KEY, value })
  } catch {}
  try {
    const web = getWebStorage()
    await (web.setItem as any)(STORAGE_KEY, value)
  } catch {}
}

export async function enqueueMutation(mutation: QueuedMutation): Promise<void> {
  const list = await getPersistedList()
  list.push(mutation)
  await setPersistedList(list)
}

export async function flushQueue(): Promise<void> {
  const status = await Network.getStatus()
  if (!status.connected) return
  const list = await getPersistedList()
  if (!list.length) return
  const next: QueuedMutation[] = []
  for (const item of list) {
    try {
      if (customFlushHandler) {
        await customFlushHandler(item)
      } else {
        // If no handler registered, keep the item for later
        next.push(item)
      }
    } catch {
      // Keep failed item for a later retry
      next.push(item)
    }
  }
  await setPersistedList(next)
}

export function listenForOnlineFlush(): void {
  Network.addListener('networkStatusChange', (status) => {
    if (status.connected) {
      void flushQueue()
    }
  })
}

export function setRetryFlushHandler(handler: (item: QueuedMutation) => Promise<void>): void {
  customFlushHandler = handler
}



