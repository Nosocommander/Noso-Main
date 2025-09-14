import type { Product } from './api'

type CatalogFocusDetail = { id: string }
type CatalogUpdatedDetail = { id: string; updated: Partial<Product> }

const bus = new EventTarget()

export function onCatalogFocus(handler: (id: string) => void): () => void {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<CatalogFocusDetail>
    handler(ce.detail.id)
  }
  bus.addEventListener('catalog:focus-row', listener as EventListener)
  return () => bus.removeEventListener('catalog:focus-row', listener as EventListener)
}

export function emitCatalogFocus(id: string): void {
  bus.dispatchEvent(new CustomEvent<CatalogFocusDetail>('catalog:focus-row', { detail: { id } }))
}

export function onCatalogUpdated(handler: (id: string, updated: Partial<Product>) => void): () => void {
  const listener = (e: Event) => {
    const ce = e as CustomEvent<CatalogUpdatedDetail>
    handler(ce.detail.id, ce.detail.updated)
  }
  bus.addEventListener('catalog:updated', listener as EventListener)
  return () => bus.removeEventListener('catalog:updated', listener as EventListener)
}

export function emitCatalogUpdated(id: string, updated: Partial<Product>): void {
  bus.dispatchEvent(new CustomEvent<CatalogUpdatedDetail>('catalog:updated', { detail: { id, updated } }))
}


