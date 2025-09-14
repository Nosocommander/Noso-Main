import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { useEffect, useMemo, useState } from 'react'
import { fetchCatalogPage, type Product, batchUpdateProducts, fetchProductById } from '../lib/api'
import { useCatalogBatch } from '../hooks/useCatalogBatch'
import { CatalogTable } from '../assets/components/CatalogTable'
import { CatalogActionBar } from '../assets/components/CatalogActionBar'
import { CatalogReviewDrawer } from '../assets/components/CatalogReviewDrawer'
import { useToast } from '../providers/ToastProvider'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { getApiConfig } from '../lib/settings'
import { useLeaveDirtyPrompt } from '../hooks/useLeaveDirtyPrompt'
import { useStore } from '../providers/StoreProvider'
import { useEditState } from '../providers/EditStateProvider'
import { emitCatalogFocus, onCatalogFocus, onCatalogUpdated } from '../lib/events'
import { useSettingsGate } from '../hooks/useSettingsGate'
import { BatchSummarySheet } from '../assets/components/BatchSummarySheet'
import { emitEvent } from '../lib/telemetry'
// import { getFlag } from '../lib/featureFlags'
import { setRetryFlushHandler } from '../lib/retryQueue'
import { CatalogSkeleton } from '../assets/components/CatalogSkeleton'
import { EmptyState } from '../assets/components/EmptyState'

const CatalogPage = () => {
  const pageSize = 20
  const [page] = useState(0)
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const { showToast } = useToast()
  const { storeId } = useStore()
  const { dirty, rowErrors, hasPending, pendingCount, isSaving, setField, clearRow, clearAll } = useCatalogBatch(storeId)
  const [reviewOpen, setReviewOpen] = useState(false)
  const { setHasPending, registerSaveHandler, registerDiscardHandler } = useEditState()
  const [conflicts, setConflicts] = useState<Record<string, { server?: any; local?: any }>>({})
  const [summaryOpen, setSummaryOpen] = useState(false)
  useSettingsGate()
  const [lastFailedIds, setLastFailedIds] = useState<string[]>([])
  const [lastConflictIds, setLastConflictIds] = useState<string[]>([])
  const [lastAppliedCount, setLastAppliedCount] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      const cfg = await getApiConfig()
      const res = await fetchCatalogPage(page, pageSize, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, cfg?.defaultStoreId)
      if (mounted) {
        setItems(res.items)
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [page, storeId])

  const originals = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items])
  useLeaveDirtyPrompt(hasPending)
  useEffect(() => { setHasPending(hasPending) }, [hasPending, setHasPending])
  useEffect(() => {
    // Register retry handler to process queued catalog batches when back online
    setRetryFlushHandler(async (item) => {
      if (item.key !== 'catalog-batch') return
      const payload = item.payload as { storeId: string; updates: Array<{ id: string; fields: any }> }
      const cfg = await getApiConfig()
      // Enrich queued items with latest versions before attempting
      const updatesWithMeta = (await Promise.all(
        payload.updates.map(async (u) => {
          const latest = await fetchProductById(u.id, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, cfg?.defaultStoreId)
          const kind: 'product' | 'variation' = latest && (latest as any).parentId ? 'variation' : 'product'
          return { id: u.id, kind, version: latest?.version, fields: u.fields }
        }),
      )) as Array<{ id: string; kind: 'product' | 'variation'; version?: string; fields: Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>> }>
      const res = await batchUpdateProducts({ storeId: payload.storeId, updates: updatesWithMeta }, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret })
      const okIds = res.results.filter((r) => r.status === 'ok').map((r) => r.id)
      if (okIds.length) {
        // Update local table if visible
        setItems((prev) => prev.map((p) => (okIds.includes(p.id) ? { ...p, ...Object.fromEntries((payload.updates.find((u) => u.id === p.id)?.fields ? Object.entries(payload.updates.find((u) => u.id === p.id)!.fields) : [])) } : p)))
        await Haptics.impact({ style: ImpactStyle.Medium })
        showToast({ message: `Outbox: applied ${okIds.length}`, color: 'success' })
      }
      const failed = res.results.filter((r) => r.status !== 'ok')
      if (failed.length) {
        await Haptics.notification({ type: 'ERROR' as any })
        showToast({ message: `Outbox: ${failed.length} still failed`, color: 'danger' })
        // Throw to keep failed item in queue (handled by retryQueue)
        throw new Error('Some queued updates failed')
      }
    })
    registerSaveHandler(async () => {
      await onSave()
    })
    registerDiscardHandler(() => {
      clearAll()
    })
    return () => {
      registerSaveHandler(null)
      registerDiscardHandler(null)
    }
  }, [registerSaveHandler, registerDiscardHandler, clearAll])

  // Focus a row when History emits an update
  useEffect(() => {
    const off = onCatalogFocus((id) => {
      const el = document.querySelector(`[data-row-id="${id}"]`)
      if (el) {
        ;(el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
        ;(el as HTMLElement).setAttribute('tabindex', '-1')
        ;(el as HTMLElement).focus()
        el.classList.add('bg-green-50')
        setTimeout(() => el.classList.remove('bg-green-50'), 1200)
      }
    })
    const off2 = onCatalogUpdated((id, updated) => {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)))
    })
    return () => { off(); off2() }
  }, [])

  const onSave = async () => {
    try {
      // const usePerField = await getFlag('per_field_conflict_parser', false)
      // Build updates with optional per-field conflict metadata if enabled later
      const updates = Object.entries(dirty).map(([id, fields]) => {
        const src = originals[id]
        const kind: 'product' | 'variation' = src?.id && (src as any).parentId ? 'variation' : 'product'
        return { id, kind, version: (src as any)?.version, fields }
      })
      const cfg = await getApiConfig()
      const res = await batchUpdateProducts({ storeId, updates }, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret })
      const okIds: string[] = []
      const errorIds: string[] = []
      const fieldErrors: Record<string, { field: any; message: string }[]> = {}
      for (const r of res.results) {
        if (r.status === 'ok') okIds.push(r.id)
        else {
          errorIds.push(r.id)
          if (r.errors && Object.keys(r.errors).length) {
            fieldErrors[r.id] = Object.entries(r.errors).map(([field, msg]) => ({ field: field as any, message: String(msg) }))
          } else if (r.message) {
            fieldErrors[r.id] = [{ field: 'name', message: r.message }]
          } else {
            fieldErrors[r.id] = [{ field: 'name', message: 'Error' }]
          }
          if (r.reason === 'version_mismatch' || r.reason === 'conflict') {
            setConflicts((prev) => ({ ...prev, [r.id]: { server: r.server, local: r.local } }))
          }
        }
      }
      // Reconcile
      if (okIds.length) {
        await Haptics.impact({ style: ImpactStyle.Medium })
        showToast({ message: `Saved ${okIds.length} changes`, color: 'success' })
      }
      if (errorIds.length) {
        await Haptics.notification({ type: 'ERROR' as any })
        showToast({ message: `${errorIds.length} failed`, color: 'danger' })
      }
      // Clear dirty rows that succeeded
      if (okIds.length) {
        // pull in hook methods via clearRow per id
        okIds.forEach((id) => clearRow(id))
      }
      // Apply field-level errors into the hook state by forcing a state update via setField no-op pattern
      // Here, we directly set local state by mapping through hook setters
      // In practice, the hook's submit would handle this; keeping logic inline for clarity here
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      if (okIds.length) {
        await Haptics.impact({ style: ImpactStyle.Medium })
        showToast({ message: `Saved ${okIds.length} changes`, color: 'success' })
      }
      if (errorIds.length) {
        await Haptics.notification({ type: 'ERROR' as any })
        showToast({ message: `${errorIds.length} failed`, color: 'danger' })
      }
      setLastAppliedCount(okIds.length)
      setLastFailedIds(errorIds)
      setLastConflictIds(Object.keys(conflicts))
      setSummaryOpen(true)
      emitEvent('catalog_batch_summary_shown', { applied: okIds.length, failed: errorIds.length, conflicted: Object.keys(conflicts).length })
      const live = document.getElementById('aria-live-region')
      if (live) {
        const msg = `Batch save completed. ${okIds.length} applied, ${errorIds.length} failed, ${Object.keys(conflicts).length} conflict.`
        live.textContent = msg
      }
      setReviewOpen(false)
    } catch (e) {
      showToast({ message: 'Saved to Outbox (offline)', color: 'warning' })
      setReviewOpen(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Catalog</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        {loading ? (
          <CatalogSkeleton rows={12} />
        ) : items.length === 0 ? (
          <EmptyState title="No products" message="Products will appear here once your store is connected and data is available." />
        ) : (
          <CatalogTable items={items} dirty={dirty} onChange={setField} rowErrors={rowErrors} expandedIds={expandedIds} onToggleExpand={toggleExpand} />
        )}
      </IonContent>
      <CatalogActionBar
        pendingCount={pendingCount}
        isSaving={isSaving}
        onReview={() => setReviewOpen(true)}
        onUndoAll={clearAll}
        onSave={onSave}
      />
      <BatchSummarySheet
        open={summaryOpen}
        applied={lastAppliedCount}
        failed={lastFailedIds}
        conflicted={lastConflictIds}
        onClose={() => setSummaryOpen(false)}
        onJumpFailed={(id) => {
          emitEvent('catalog_batch_jump_to_failed', { id })
          emitCatalogFocus(id)
        }}
        onJumpConflict={(id) => {
          emitEvent('catalog_batch_jump_to_conflict', { id })
          emitCatalogFocus(id)
        }}
      />
      <CatalogReviewDrawer
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        dirty={dirty}
        originals={originals}
        onRemoveRow={clearRow}
        onClearAll={clearAll}
        onSave={onSave}
        conflicts={conflicts}
        onUseServer={(id) => {
          const c = conflicts[id]
          if (!c) return
          const srv = c.server || {}
          Object.entries(srv).forEach(([k, v]) => setField(id, k as any, v as any))
          setConflicts((p) => {
            const n = { ...p }
            delete n[id]
            return n
          })
        }}
        onKeepLocalRetry={async (id) => {
          // refresh version for row then resubmit single-row change
          const cfg = await getApiConfig()
          const latest = await fetchProductById(id, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret }, cfg?.defaultStoreId)
          if (latest) {
            const fields = dirty[id]
            const kind: 'product' | 'variation' = (latest as any).parentId ? 'variation' : 'product'
            const updates = [{ id, kind, version: latest.version, fields }]
            const res = await batchUpdateProducts({ storeId, updates }, cfg?.baseUrl, { apiKey: cfg?.apiKey, apiSecret: cfg?.apiSecret })
            if (res.results[0]?.status === 'ok') {
              clearRow(id)
              setConflicts((p) => { const n = { ...p }; delete n[id]; return n })
              await Haptics.impact({ style: ImpactStyle.Medium })
              showToast({ message: 'Retried and saved', color: 'success' })
            } else {
              const r = res.results[0]
              if (r?.reason) setConflicts((p) => ({ ...p, [id]: { server: r.server, local: r.local } }))
              await Haptics.notification({ type: 'ERROR' as any })
              showToast({ message: 'Still conflicted', color: 'danger' })
            }
          }
        }}
      />
    </IonPage>
  )
}

export default CatalogPage


