import { useCallback, useEffect, useState } from 'react'
import { getApiConfig } from '../../lib/settings'

export function useConnectionStatus(): { status: 'idle' | 'ok' | 'fail'; checking: boolean; checkNow: () => Promise<void> } {
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [checking, setChecking] = useState(false)
  const run = useCallback(async () => {
    setChecking(true)
    try {
      const cfg = await getApiConfig()
      if (!cfg?.baseUrl) throw new Error('No baseUrl')
      const url = new URL('/products', cfg.baseUrl)
      url.searchParams.set('page', '1')
      url.searchParams.set('pageSize', '1')
      const headers: Record<string, string> = {}
      if (cfg.apiKey && cfg.apiSecret) headers['Authorization'] = 'Basic ' + btoa(cfg.apiKey + ':' + cfg.apiSecret)
      const controller = new AbortController()
      const id = window.setTimeout(() => controller.abort(), 3000)
      const res = await fetch(url.toString(), { headers, signal: controller.signal })
      window.clearTimeout(id)
      setStatus(res.ok ? 'ok' : 'fail')
    } catch {
      setStatus('fail')
    } finally {
      setChecking(false)
    }
  }, [])
  useEffect(() => { /* lazy */ }, [])
  return { status, checking, checkNow: run }
}


