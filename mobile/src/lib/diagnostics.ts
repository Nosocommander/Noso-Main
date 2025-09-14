export type ApiLogKind = 'api_req' | 'api_res' | 'cb_open' | 'cb_half_open' | 'cb_closed'
export type ApiLogEntry = {
  kind: ApiLogKind
  ts: number
  method: string
  path: string
  storeId?: string
  correlationId: string
  status?: number
  durationMs?: number
}

const MAX_ENTRIES = 50
const ring: ApiLogEntry[] = []

export function logApi(entry: ApiLogEntry): void {
  if (!import.meta.env.DEV) return
  ring.push(entry)
  if (ring.length > MAX_ENTRIES) ring.shift()
}

export function getApiLogs(): ApiLogEntry[] {
  return [...ring]
}


