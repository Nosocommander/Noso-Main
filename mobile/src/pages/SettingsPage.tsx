import { IonBackButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react'
import { useEffect, useState } from 'react'
import { App } from '@capacitor/app'
import { useLocation } from 'react-router-dom'
import { z } from 'zod'
import { setApiConfig, getApiConfig, type ApiConfig } from '../lib/settings'
import { useToast } from '../providers/ToastProvider'

const schema = z.object({
  baseUrl: z
    .string()
    .min(1, 'Base URL is required')
    .url('Must be a valid URL')
    .refine((u) => u.startsWith('https://'), 'Must be https')
    .transform((u) => u.replace(/\/$/, '')),
  apiKey: z.string().min(1, 'API key is required'),
  apiSecret: z.string().min(1, 'API secret is required'),
  defaultStoreId: z.string().optional().default(''),
})

const SettingsPage = () => {
  const { showToast } = useToast()
  const loc = useLocation()
  const fromGate = new URLSearchParams(loc.search).get('fromGate') === '1'
  const [form, setForm] = useState<{ baseUrl: string; apiKey: string; apiSecret: string; defaultStoreId: string }>({
    baseUrl: '',
    apiKey: '',
    apiSecret: '',
    defaultStoreId: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [appInfo, setAppInfo] = useState<{ name?: string; id?: string; version?: string; build?: string | number }>({})

  useEffect(() => {
    ;(async () => {
      const cfg = await getApiConfig()
      if (cfg) setForm((f) => ({ ...f, baseUrl: cfg.baseUrl, apiKey: cfg.apiKey || '', apiSecret: cfg.apiSecret || '', defaultStoreId: cfg.defaultStoreId || '' }))
      try {
        const info = await App.getInfo()
        setAppInfo(info)
      } catch {}
    })()
  }, [])

  const save = async () => {
    setErrors({})
    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as string
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      showToast({ message: 'Fix form errors', color: 'warning' })
      return
    }
    const value = parsed.data
    await setApiConfig({ baseUrl: value.baseUrl, apiKey: value.apiKey, apiSecret: value.apiSecret, defaultStoreId: value.defaultStoreId })
    showToast({ message: 'Settings saved', color: 'success' })
  }

  const testConnection = async () => {
    setLoading(true)
    try {
      const parsed = schema.safeParse(form)
      if (!parsed.success) throw new Error('Invalid settings')
      const cfg: ApiConfig = { baseUrl: parsed.data.baseUrl, apiKey: parsed.data.apiKey, apiSecret: parsed.data.apiSecret }
      const url = new URL('/products', cfg.baseUrl)
      url.searchParams.set('page', '1')
      url.searchParams.set('pageSize', '1')
      const headers: Record<string, string> = {}
      if (cfg.apiKey && cfg.apiSecret) {
        headers['Authorization'] = 'Basic ' + btoa(cfg.apiKey + ':' + cfg.apiSecret)
      }
      const res = await fetch(url.toString(), { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      showToast({ message: 'Connection OK', color: 'success' })
    } catch (e: any) {
      showToast({ message: `Connection failed: ${e?.message || e}`, color: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {fromGate && (
          <div className="mb-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            Setup required to continue. Enter your WooCommerce HTTPS Base URL and REST API credentials below, then tap Save. You can Test Connection to verify.
          </div>
        )}
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Base URL</IonLabel>
            <IonInput value={form.baseUrl} onIonChange={(e) => setForm({ ...form, baseUrl: e.detail.value || '' })} />
          </IonItem>
          {errors.baseUrl && <div className="px-4 text-sm text-red-600">{errors.baseUrl}</div>}
          <IonItem>
            <IonLabel position="stacked">API Key</IonLabel>
            <IonInput value={form.apiKey} onIonChange={(e) => setForm({ ...form, apiKey: e.detail.value || '' })} />
          </IonItem>
          {errors.apiKey && <div className="px-4 text-sm text-red-600">{errors.apiKey}</div>}
          <IonItem>
            <IonLabel position="stacked">API Secret</IonLabel>
            <IonInput value={form.apiSecret} onIonChange={(e) => setForm({ ...form, apiSecret: e.detail.value || '' })} />
          </IonItem>
          {errors.apiSecret && <div className="px-4 text-sm text-red-600">{errors.apiSecret}</div>}
        </IonList>
        <div className="mt-4 flex gap-2">
          <IonButton onClick={save}>Save</IonButton>
          <IonButton fill="outline" onClick={testConnection} disabled={loading}>
            {loading ? 'Testing…' : 'Test Connection'}
          </IonButton>
          <IonButton fill="clear" routerLink="/privacy">Privacy Policy</IonButton>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500">
          {(appInfo.name || 'Noso Woo')} • {(appInfo.id || 'com.noso.woo')} • {(appInfo.version || '')}{appInfo.build ? ` (build ${appInfo.build})` : ''}
        </div>
        <div className="mt-4 text-xs text-gray-500">Default Store ID (optional)</div>
        <IonItem>
          <IonLabel position="stacked">Default Store ID</IonLabel>
          <IonInput value={form.defaultStoreId} onIonChange={(e) => setForm({ ...form, defaultStoreId: e.detail.value || '' })} />
        </IonItem>
      </IonContent>
    </IonPage>
  )
}

export default SettingsPage



