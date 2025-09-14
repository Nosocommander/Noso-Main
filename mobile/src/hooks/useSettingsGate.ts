import { useEffect } from 'react'
import { useToast } from '../providers/ToastProvider'
import { getApiConfig } from '../lib/settings'
import { useHistory } from 'react-router-dom'

export function useSettingsGate(): void {
  const { showToast } = useToast()
  const history = useHistory()
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cfg = await getApiConfig()
      if (!cfg?.baseUrl) {
        if (!cancelled) {
          showToast({ message: 'Setup required: Add your WooCommerce URL and API keys in Settings.', color: 'warning' })
          // Navigate to Settings with intent param so the page can optionally show a highlight later
          history.replace('/settings?fromGate=1')
        }
        return
      }
      // Quick connectivity check (non-blocking): fetch 1 product
      const controller = new AbortController()
      const id = window.setTimeout(() => controller.abort(), 1500)
      try {
        const url = new URL('/products', cfg.baseUrl)
        url.searchParams.set('page', '1')
        url.searchParams.set('pageSize', '1')
        const headers: Record<string, string> = {}
        if (cfg.apiKey && cfg.apiSecret) headers['Authorization'] = 'Basic ' + btoa(cfg.apiKey + ':' + cfg.apiSecret)
        const res = await fetch(url.toString(), { headers, signal: controller.signal })
        if (!res.ok) throw new Error('Bad response')
      } catch {
        if (!cancelled) {
          showToast({ message: 'Connection failed. Check Settings (URL and credentials).', color: 'danger' })
          history.replace('/settings?fromGate=1')
        }
      } finally {
        window.clearTimeout(id)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [history, showToast])
}


