import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton, IonItem, IonLabel, IonList, IonButton, IonInfiniteScroll, IonInfiniteScrollContent, useIonActionSheet } from '@ionic/react'
import { useEffect, useState } from 'react'
import { useStore } from '../providers/StoreProvider'
import { createContext, useContext } from 'react'
import { useToast } from '../providers/ToastProvider'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { rollbackChangeApi } from '../lib/historyApi'
import { getApiConfig } from '../lib/settings'
import { emitCatalogFocus, emitCatalogUpdated } from '../lib/events'
import { useSettingsGate } from '../hooks/useSettingsGate'
import { HistorySkeleton } from '../assets/components/HistorySkeleton'

type HistoryEntry = {
  id: string
  productName: string
  field: 'name' | 'sku' | 'price' | 'stock'
  from: string | number
  to: string | number
  timestamp: string
  reverted?: boolean
}

async function fetchHistory(storeId: string, page: number): Promise<HistoryEntry[]> {
  await new Promise((r) => setTimeout(r, 300))
  return Array.from({ length: 20 }).map((_, i) => ({
    id: `${storeId}-${page}-${i}`,
    productName: `Product ${(page - 1) * 20 + i + 1}`,
    field: (['name', 'sku', 'price', 'stock'] as const)[i % 4],
    from: i % 4 === 2 ? 10 + i : i % 4 === 3 ? 100 - i : `Old ${(page - 1) * 20 + i + 1}`,
    to: i % 4 === 2 ? 12 + i : i % 4 === 3 ? 90 - i : `New ${(page - 1) * 20 + i + 1}`,
    timestamp: new Date(Date.now() - i * 3_600_000).toISOString(),
  }))
}

// placeholder removed (unused)

// lightweight event bridge to notify Catalog of updates
type CatalogUpdateEvent = { id: string }
const CatalogUpdateContext = createContext<(e: CatalogUpdateEvent) => void>(() => {})
export function useCatalogUpdate() { return useContext(CatalogUpdateContext) }

const HistoryPage = () => {
  useSettingsGate()
  const { storeId } = useStore()
  const { showToast } = useToast()
  const [present] = useIonActionSheet()
  const [items, setItems] = useState<HistoryEntry[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [hideReverted, setHideReverted] = useState(false)

  useEffect(() => {
    setItems([])
    setPage(1)
    setHasMore(true)
  }, [storeId])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const next = await fetchHistory(storeId || 'default', page)
      if (!cancelled) {
        setItems((prev) => [...prev, ...next])
        if (next.length < 20) setHasMore(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [storeId, page])

  const onRollback = (entry: HistoryEntry) => {
    present({
      header: `Revert ${entry.field}?`,
      buttons: [
        {
          text: `Revert to ${String(entry.from)}`,
          handler: async () => {
            await Haptics.impact({ style: ImpactStyle.Medium })
            try {
              const cfg = await getApiConfig()
              await rollbackChangeApi(cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, entry.id)
              showToast({ message: 'Rollback applied', color: 'success' })
              const live = document.getElementById('aria-live-region')
              if (live) live.textContent = 'Rollback completed'
              setItems((prev) => prev.map((it) => (it.id === entry.id ? { ...it, to: entry.from, reverted: true } : it)))
              emitCatalogUpdated(entry.id, { [entry.field]: entry.from } as any)
              emitCatalogFocus(entry.id)
            } catch (e: any) {
              showToast({ message: e?.message || 'Rollback failed', color: 'danger' })
            }
          },
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>History</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">History</div>
          <label className="text-sm">
            <input type="checkbox" checked={hideReverted} onChange={(e) => setHideReverted(e.target.checked)} /> Hide Reverted
          </label>
        </div>
        {items.length === 0 ? (
          <HistorySkeleton rows={10} />
        ) : (
          <IonList>
          {items.filter((e) => !hideReverted || !e.reverted).map((e) => (
            <IonItem key={e.id} lines="full" className={e.reverted ? 'opacity-60' : ''}>
              <IonLabel>
                <div className="text-sm font-medium">{e.productName}</div>
                <div className="text-xs text-gray-600">{e.field}: <span className="line-through opacity-60">{String(e.from)}</span> → {String(e.to)}</div>
                <div className="text-xs text-gray-500">{new Date(e.timestamp).toLocaleString()}</div>
                {e.reverted && <span className="mt-1 inline-block rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">Reverted</span>}
              </IonLabel>
              <IonButton slot="end" size="small" onClick={() => onRollback(e)} disabled={!!e.reverted}>
                Rollback
              </IonButton>
            </IonItem>
          ))}
          </IonList>
        )}
        {hasMore && (
          <IonInfiniteScroll
            threshold="100px"
            onIonInfinite={(e) => {
              setPage((p) => p + 1)
              ;(e.target as HTMLIonInfiniteScrollElement).complete()
            }}
          >
            <IonInfiniteScrollContent />
          </IonInfiniteScroll>
        )}
      </IonContent>
    </IonPage>
  )
}

export default HistoryPage


