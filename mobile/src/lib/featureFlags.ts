import { Preferences } from '@capacitor/preferences'

const FLAG_PREFIX = 'ff_'

export type FeatureFlagKey = 'catalog_batch_save' | 'per_field_conflict_parser'

export async function getFlag(key: FeatureFlagKey, fallback: boolean = true): Promise<boolean> {
  try {
    const res = await Preferences.get({ key: FLAG_PREFIX + key })
    if (res.value == null) return fallback
    return res.value === 'true'
  } catch {
    return fallback
  }
}

export async function setFlag(key: FeatureFlagKey, value: boolean): Promise<void> {
  try {
    await Preferences.set({ key: FLAG_PREFIX + key, value: value ? 'true' : 'false' })
  } catch {}
}


