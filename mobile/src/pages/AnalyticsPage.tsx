import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from '@ionic/react'
import { ErrorCard } from '../assets/components/ErrorCard'
import { useEffect, useState } from 'react'
import { getApiConfig } from '../lib/settings'
import { useSettingsGate } from '../hooks/useSettingsGate'

type Summary = { totalProducts: number; totalVariations: number; totalStock: number; lowStock: number }

const AnalyticsPage = () => {
  useSettingsGate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const cfg = await getApiConfig()
        if (!cfg?.baseUrl) {
          setSummary({ totalProducts: 200, totalVariations: 400, totalStock: 12345, lowStock: 12 })
        } else {
          const url = new URL('/analytics/summary', cfg.baseUrl)
          const headers: Record<string, string> = {}
          if (cfg.apiKey && cfg.apiSecret) headers['Authorization'] = 'Basic ' + btoa(cfg.apiKey + ':' + cfg.apiSecret)
          const res = await fetch(url.toString(), { headers })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const json = await res.json()
          setSummary({ totalProducts: json.totalProducts, totalVariations: json.totalVariations, totalStock: json.totalStock, lowStock: json.lowStock })
        }
      } catch (e: any) {
        setError(e?.message || 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Analytics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <p className="text-gray-600">Loading…</p>
        ) : error ? (
          <ErrorCard message={error} />
        ) : summary ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded border p-3"><div className="text-xs text-gray-500">Products</div><div className="text-xl">{summary.totalProducts}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-gray-500">Variations</div><div className="text-xl">{summary.totalVariations}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-gray-500">Total Stock</div><div className="text-xl">{summary.totalStock}</div></div>
            <div className="rounded border p-3"><div className="text-xs text-gray-500">Low Stock</div><div className="text-xl">{summary.lowStock}</div></div>
          </div>
        ) : (
          <div className="mt-6 max-w-md">
            <div className="mb-2 text-sm text-gray-600">No analytics available.</div>
          </div>
        )}
      </IonContent>
    </IonPage>
  )
}

export default AnalyticsPage


