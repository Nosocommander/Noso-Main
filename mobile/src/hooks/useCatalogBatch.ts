import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { batchUpdateProducts, type Product, type BatchUpdateRequest, type BatchUpdateResult } from '../lib/api'
import { enqueueMutation } from '../lib/retryQueue'

export type DirtyFields = Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>>

export type DirtyMap = Record<string, DirtyFields>

export type FieldError = { field: keyof DirtyFields; message: string }
export type RowErrors = Record<string, FieldError[]>
export type ConflictMap = Record<string, boolean>

export function useCatalogBatch(storeId: string) {
  const [dirty, setDirty] = useState<DirtyMap>({})
  const [rowErrors, setRowErrors] = useState<RowErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [conflicts, setConflicts] = useState<ConflictMap>({})
  const persistedRef = useRef(false)

  useEffect(() => {
    setPendingCount(Object.values(dirty).reduce((acc, fields) => acc + Object.keys(fields).length, 0))
  }, [dirty])

  // Persist dirty map while app backgrounded
  useEffect(() => {
    if (!persistedRef.current) {
      persistedRef.current = true
    }
    try {
      localStorage.setItem('catalog_dirty', JSON.stringify(dirty))
    } catch {}
  }, [dirty])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('catalog_dirty')
      if (saved) setDirty(JSON.parse(saved))
    } catch {}
  }, [])

  const setField = useCallback((productId: string, field: keyof DirtyFields, value: string | number) => {
    setDirty((prev) => {
      const next = { ...prev }
      const row = { ...(next[productId] || {}) }
      ;(row as any)[field] = value
      next[productId] = row
      return next
    })
  }, [])

  const clearRow = useCallback((productId: string) => {
    setDirty((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setRowErrors((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setConflicts((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }, [])

  const clearAll = useCallback(() => {
    setDirty({})
    setRowErrors({})
    setConflicts({})
  }, [])

  const hasPending = useMemo(() => Object.keys(dirty).length > 0, [dirty])

  const submit = useCallback(
    async (_originals: Record<string, Product>): Promise<{ okIds: string[]; errorIds: string[]; results: BatchUpdateResult[] }> => {
      setIsSaving(true)
      setRowErrors({})
      try {
        const updates = Object.entries(dirty).map(([id, fields]) => ({ id, kind: 'product' as const, fields }))
        const payload: BatchUpdateRequest = { storeId, updates }
        const res = await batchUpdateProducts(payload)
        const okIds: string[] = []
        const errorIds: string[] = []
        const nextErrors: RowErrors = {}
        for (const r of res.results) {
          if (r.status === 'ok') {
            okIds.push(r.id)
          } else {
            errorIds.push(r.id)
            nextErrors[r.id] = [{ field: 'name', message: r.message || 'Error' }]
          }
        }
        setRowErrors(nextErrors)
        setDirty((prev) => {
          const next = { ...prev }
          for (const id of okIds) {
            delete next[id]
          }
          return next
        })
        return { okIds, errorIds, results: res.results }
      } catch (e) {
        // Network loss: queue batch
        const updates = Object.entries(dirty).map(([id, fields]) => ({ id, kind: 'product' as const, fields }))
        await enqueueMutation({ key: 'catalog-batch', payload: { storeId, updates } })
        throw e
      } finally {
        setIsSaving(false)
      }
    },
    [dirty, storeId]
  )

  return { dirty, rowErrors, conflicts, hasPending, pendingCount, isSaving, setField, clearRow, clearAll, submit }
}


