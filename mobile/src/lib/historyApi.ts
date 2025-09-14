import { apiRequest } from './apiClient'
import { z } from 'zod'
export async function rollbackChangeApi(baseUrl: string | undefined, _auth: { apiKey?: string; apiSecret?: string } | undefined, changeId: string): Promise<void> {
  if (!baseUrl) {
    await new Promise((r) => setTimeout(r, 400))
    return
  }
  const json = await apiRequest<any>({ method: 'POST', path: '/history/rollback', body: { changeId } })
  const schema = z.object({ ok: z.boolean().optional() }).optional()
  schema.safeParse(json)
}


