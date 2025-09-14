export function emitEvent(name: string, payload?: Record<string, unknown>): void {
  try {
    if (import.meta.env.DEV) {
      // Replace with real analytics later
      // eslint-disable-next-line no-console
      console.log('[telemetry]', name, payload || {})
    }
  } catch {}
}


