import { apiRequest } from './apiClient'
import { z } from 'zod'
export type CsvUploadValidateResponse = {
  uploadId: string
  status: 'received' | 'validating' | 'queued'
  stats: { rowsTotal: number; rowsParsable: number; rowsInvalid: number }
  errorsCsvUrl: string | null
}

export type CsvUploadApplyResponse = {
  uploadId: string
  status: 'queued'
  estimateSeconds?: number
}

export type CsvStatusResponse = {
  uploadId: string
  status: 'validating' | 'processing' | 'completed' | 'failed' | 'partial'
  progress: number
  results?: { applied: number; skipped: number; failed: number }
  errorsCsvUrl?: string | null
}

export async function csvUpload(baseUrl: string | undefined, auth: { apiKey?: string; apiSecret?: string } | undefined, file: File, storeId: string, mode: 'validate' | 'apply' = 'validate') {
  if (!baseUrl) return mockCsvUpload(file, storeId, mode)
  // Fallback to regular fetch for multipart to avoid body encoding in apiClient
  const url = new URL('/csv/upload', baseUrl)
  const form = new FormData()
  form.append('file', file)
  form.append('storeId', storeId)
  form.append('mode', mode)
  const headers: Record<string, string> = {}
  if (auth?.apiKey && auth?.apiSecret) headers['Authorization'] = 'Basic ' + btoa(auth.apiKey + ':' + auth.apiSecret)
  const res = await fetch(url.toString(), { method: 'POST', body: form, headers })
  if (mode === 'apply' && res.status === 202) return (await res.json()) as CsvUploadApplyResponse
  if (!res.ok) throw new Error(`Upload failed (${res.status})`)
  const json = await res.json()
  const schema = z.object({ uploadId: z.string(), status: z.enum(['received', 'validating', 'queued']), stats: z.object({ rowsTotal: z.number(), rowsParsable: z.number(), rowsInvalid: z.number() }), errorsCsvUrl: z.string().nullable() })
  const parsed = schema.safeParse(json)
  if (!parsed.success) throw new Error('Invalid CSV validate response')
  return parsed.data as CsvUploadValidateResponse
}

export async function csvStatus(baseUrl: string | undefined, _auth: { apiKey?: string; apiSecret?: string } | undefined, uploadId: string) {
  if (!baseUrl) return mockCsvStatus(uploadId)
  const json = await apiRequest<any>({ method: 'GET', path: `/csv/status?uploadId=${encodeURIComponent(uploadId)}` })
  const schema = z.object({ uploadId: z.string(), status: z.enum(['validating', 'processing', 'completed', 'failed', 'partial']), progress: z.number(), results: z.object({ applied: z.number(), skipped: z.number(), failed: z.number() }).optional(), errorsCsvUrl: z.string().nullable().optional() })
  const parsed = schema.safeParse(json)
  if (!parsed.success) throw new Error('Invalid CSV status response')
  return parsed.data as CsvStatusResponse
}

export function downloadErrorsCsv(errorsCsvUrl: string): void {
  const a = document.createElement('a')
  a.href = errorsCsvUrl
  a.download = 'errors.csv'
  a.target = '_blank'
  a.rel = 'noopener'
  a.click()
}

// Mock implementations
async function mockCsvUpload(_file: File, _storeId: string, mode: 'validate' | 'apply') {
  await new Promise((r) => setTimeout(r, 500))
  if (mode === 'apply') {
    return { uploadId: 'ul_mock', status: 'queued', estimateSeconds: 10 } as CsvUploadApplyResponse
  }
  return {
    uploadId: 'ul_mock',
    status: 'received',
    stats: { rowsTotal: 245, rowsParsable: 242, rowsInvalid: 3 },
    errorsCsvUrl: 'data:text/csv,line,sku,field,value,error\n3,TS-001,price,-5,"Min price is 0.00"',
  } as CsvUploadValidateResponse
}

async function mockCsvStatus(_uploadId: string) {
  // Return a progressing status ending in completed
  const start = Date.now()
  await new Promise((r) => setTimeout(r, 600))
  const elapsed = (Date.now() - start) / 1000
  if (elapsed < 5) {
    return { uploadId: 'ul_mock', status: 'processing', progress: 0.5, results: { applied: 120, skipped: 2, failed: 5 }, errorsCsvUrl: null } as CsvStatusResponse
  }
  return { uploadId: 'ul_mock', status: 'completed', progress: 1, results: { applied: 220, skipped: 5, failed: 17 }, errorsCsvUrl: 'data:text/csv,line,sku,field,value,error\n3,TS-001,price,-5,"Min price is 0.00"' } as CsvStatusResponse
}


