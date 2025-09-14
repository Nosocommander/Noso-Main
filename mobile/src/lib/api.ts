import { apiRequest } from './apiClient'
import { z } from 'zod'
export type Product = {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  thumbnailUrl?: string
  variations?: Variation[]
  version?: string
}

export type Variation = {
  id: string
  sku: string
  name: string
  price: number
  stock: number
  parentId?: string
  version?: string
}

export type CatalogPageResponse = {
  items: Product[]
  page: number
  pageSize: number
  total: number
}

export type BatchUpdateRequest = {
  storeId: string
  updates: Array<{
    id: string
    kind: 'product' | 'variation'
    version?: string
    fields: Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>>
  }>
}

export type BatchUpdateResult = {
  id: string
  status: 'ok' | 'error'
  applied?: Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>>
  errors?: Record<string, string> | null
  message?: string
  reason?: 'version_mismatch' | string
  server?: Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>>
  local?: Partial<Pick<Product, 'sku' | 'name' | 'price' | 'stock'>>
  serverVersion?: string
}

export type BatchUpdateResponse = {
  success: boolean
  results: BatchUpdateResult[]
}

export async function fetchCatalogPage(page: number, pageSize: number, baseUrl?: string, _auth?: { apiKey?: string; apiSecret?: string }, storeId?: string): Promise<CatalogPageResponse> {
  if (!baseUrl) {
    // Fallback demo data
    const items: Product[] = Array.from({ length: pageSize }).map((_, idx) => {
      const id = String(page * pageSize + idx + 1)
      return { id, sku: `SKU-${id}`, name: `Product ${id}`, price: 10 + idx, stock: 100 - idx, variations: [], version: String(Date.now()) }
    })
    return { items, page, pageSize, total: 200 }
  }
  const json = await apiRequest<any>({ method: 'GET', path: `/products?page=${page + 1}&per_page=${pageSize}`, storeId })
  const productSchema = z.object({ id: z.string(), sku: z.string(), name: z.string(), price: z.number(), stock: z.number(), thumbUrl: z.string().optional(), version: z.string().optional(), variations: z.array(z.object({ id: z.string(), parentId: z.string().optional(), sku: z.string(), name: z.string(), price: z.number(), stock: z.number(), version: z.string().optional() })).optional() })
  const responseSchema = z.object({ items: z.array(productSchema), page: z.number(), pageSize: z.number(), total: z.number() })
  const parsed = responseSchema.safeParse(json)
  if (!parsed.success) throw new Error('Invalid products response')
  // Map server fields (thumbUrl -> thumbnailUrl)
  const data: CatalogPageResponse = {
    items: (parsed.data.items || []).map((p: any) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      stock: p.stock,
      thumbnailUrl: p.thumbUrl,
      version: p.version,
      variations: (p.variations || []).map((v: any) => ({ id: v.id, parentId: v.parentId, sku: v.sku, name: v.name, price: v.price, stock: v.stock, version: v.version })),
    })),
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    total: parsed.data.total,
  }
  return data
}

export async function fetchProductById(id: string, baseUrl?: string, _auth?: { apiKey?: string; apiSecret?: string }, storeId?: string): Promise<Product | null> {
  if (!baseUrl) return null
  const p = await apiRequest<any>({ method: 'GET', path: `/products/${id}`, storeId })
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    price: p.price,
    stock: p.stock,
    thumbnailUrl: p.thumbUrl,
    version: p.version,
    variations: (p.variations || []).map((v: any) => ({ id: v.id, parentId: v.parentId, sku: v.sku, name: v.name, price: v.price, stock: v.stock, version: v.version })),
  }
}

export async function batchUpdateProducts(payload: BatchUpdateRequest, baseUrl?: string, _auth?: { apiKey?: string; apiSecret?: string }): Promise<BatchUpdateResponse> {
  if (!baseUrl) {
    // Simulate partial failure if name contains "fail"
    const results: BatchUpdateResult[] = payload.updates.map((u) => {
      if ((u.fields.name ?? '').toString().toLowerCase().includes('fail')) {
        return { id: u.id, status: 'error', errors: { name: 'Name cannot contain "fail"' } }
      }
      return { id: u.id, status: 'ok', applied: u.fields }
    })
    return { success: true, results }
  }
  const json = await apiRequest<any>({ method: 'POST', path: '/products/batch-update', body: payload, storeId: payload.storeId })
  const resultSchema = z.object({ id: z.string(), status: z.enum(['ok', 'error']), applied: z.any().optional(), errors: z.any().nullable().optional(), message: z.string().optional(), reason: z.string().optional(), server: z.any().optional(), local: z.any().optional(), serverVersion: z.string().optional() })
  const responseSchema = z.object({ success: z.boolean(), results: z.array(resultSchema) })
  const parsed = responseSchema.safeParse(json)
  if (!parsed.success) throw new Error('Invalid batch-update response')
  return parsed.data as BatchUpdateResponse
}


