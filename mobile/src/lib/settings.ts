import { Preferences } from '@capacitor/preferences'

export type ApiConfig = {
  baseUrl: string
  apiKey?: string
  apiSecret?: string
  defaultStoreId?: string
}

const KEYS = {
  baseUrl: 'settings_base_url',
  apiKey: 'settings_api_key',
  apiSecret: 'settings_api_secret',
  defaultStoreId: 'settings_default_store_id',
}

export async function getApiConfig(): Promise<ApiConfig | null> {
  try {
    const [baseUrl, apiKey, apiSecret, defaultStoreId] = await Promise.all([
      Preferences.get({ key: KEYS.baseUrl }),
      Preferences.get({ key: KEYS.apiKey }),
      Preferences.get({ key: KEYS.apiSecret }),
      Preferences.get({ key: KEYS.defaultStoreId }),
    ])
    const url = baseUrl.value || ''
    if (!url) return null
    return { baseUrl: url.replace(/\/$/, ''), apiKey: apiKey.value || undefined, apiSecret: apiSecret.value || undefined, defaultStoreId: defaultStoreId.value || undefined }
  } catch {
    return null
  }
}

export async function setApiConfig(cfg: ApiConfig): Promise<void> {
  await Preferences.set({ key: KEYS.baseUrl, value: cfg.baseUrl })
  if (cfg.apiKey != null) await Preferences.set({ key: KEYS.apiKey, value: cfg.apiKey })
  if (cfg.apiSecret != null) await Preferences.set({ key: KEYS.apiSecret, value: cfg.apiSecret })
  if (cfg.defaultStoreId != null) await Preferences.set({ key: KEYS.defaultStoreId, value: cfg.defaultStoreId })
}


