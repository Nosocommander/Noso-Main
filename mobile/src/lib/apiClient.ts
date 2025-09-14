import { getApiConfig } from './settings'
import { logApi } from './diagnostics'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  path: string
  body?: unknown
  signal?: AbortSignal
  storeId?: string
  headers?: Record<string, string>
}

// reserved for future masking of richer logs

function genId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

async function sleep(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)) }

export async function apiRequest<T = unknown>(opts: RequestOptions): Promise<T> {
  // circuit breaker state (process-wide)
  if (breaker.state === 'open') {
    if (!breaker.allowProbe) {
      throw new Error('Circuit breaker open')
    }
    // consume single probe allowance; proceed with request
    breaker.allowProbe = false
  }
  const start = performance.now()
  const method: HttpMethod = opts.method || 'GET'
  const cfg = await getApiConfig()
  if (!cfg?.baseUrl || !cfg.baseUrl.startsWith('https://')) throw new Error('Invalid HTTPS Base URL')
  const url = new URL(opts.path, cfg.baseUrl)
  if (opts.storeId) url.searchParams.set('storeId', opts.storeId)
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(opts.headers || {}) }
  if (cfg.apiKey && cfg.apiSecret) headers.Authorization = 'Basic ' + btoa(cfg.apiKey + ':' + cfg.apiSecret)
  const correlationId = genId()
  headers['X-Correlation-Id'] = correlationId
  if (opts.path.includes('batch-update')) headers['X-Idempotency-Key'] = genId()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  const doFetch = async (): Promise<Response> => {
    logApi({ kind: 'api_req', ts: Date.now(), method, path: opts.path, storeId: opts.storeId, correlationId })
    return fetch(url.toString(), {
      method,
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal || controller.signal,
    })
  }

  try {
    const maxRetries = method === 'GET' ? 2 : 0
    let attempt = 0
    let res: Response | null = null
    while (attempt <= maxRetries) {
      try {
        res = await doFetch()
        if (res.status >= 500 && attempt < maxRetries) {
          attempt += 1
          await sleep(300 * Math.pow(2, attempt))
          continue
        }
        break
      } catch (e) {
        if (attempt < maxRetries) {
          attempt += 1
          await sleep(300 * Math.pow(2, attempt))
          continue
        }
        markFailure()
        throw e
      }
    }
    if (!res) throw new Error('No response')
    const durationMs = Math.round(performance.now() - start)
    logApi({ kind: 'api_res', ts: Date.now(), method, path: opts.path, storeId: opts.storeId, correlationId, status: res.status, durationMs })
    if (!res.ok) {
      if (res.status >= 500) markFailure()
      throw new Error(`HTTP ${res.status}`)
    }
    markSuccess()
    // Caller validates shape via zod
    return (await res.json()) as T
  } finally {
    clearTimeout(timeout)
  }
}

// Simple circuit breaker implementation
type BreakerState = 'closed' | 'open' | 'half-open'
const breaker: { state: BreakerState; failures: number; windowStart: number; openedAt: number; allowProbe: boolean } = {
  state: 'closed',
  failures: 0,
  windowStart: 0,
  openedAt: 0,
  allowProbe: false,
}

function markFailure(): void {
  const now = Date.now()
  // reset window after 60s
  if (now - breaker.windowStart > 60000) {
    breaker.windowStart = now
    breaker.failures = 0
  }
  if (breaker.windowStart === 0) breaker.windowStart = now
  breaker.failures += 1
  if (breaker.failures >= 5 && breaker.state === 'closed') {
    breaker.state = 'open'
    breaker.openedAt = now
    breaker.allowProbe = false
    logApi({ kind: 'cb_open', ts: now, method: 'N/A', path: 'breaker', correlationId: 'cb' })
  }
}

function markSuccess(): void {
  const now = Date.now()
  if (breaker.state === 'half-open' || breaker.state === 'open') {
    breaker.state = 'closed'
    breaker.failures = 0
    breaker.windowStart = now
    breaker.allowProbe = false
    logApi({ kind: 'cb_closed', ts: now, method: 'N/A', path: 'breaker', correlationId: 'cb' })
  }
}

export function breakerStatus(): { state: BreakerState; canProbe: boolean; sinceMs: number } {
  const now = Date.now()
  if (breaker.state === 'open' && now - breaker.openedAt >= 30000) {
    breaker.state = 'half-open'
    breaker.allowProbe = true
    logApi({ kind: 'cb_half_open', ts: now, method: 'N/A', path: 'breaker', correlationId: 'cb' })
  }
  return { state: breaker.state, canProbe: breaker.state !== 'closed' && breaker.allowProbe, sinceMs: now - (breaker.openedAt || breaker.windowStart) }
}

export function breakerProbeNow(): void {
  if (breaker.state === 'open' || breaker.state === 'half-open') {
    breaker.allowProbe = true
  }
}


