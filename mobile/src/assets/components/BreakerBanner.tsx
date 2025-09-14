import { IonButton } from '@ionic/react'
import { breakerStatus, breakerProbeNow } from '../../lib/apiClient'
import { useEffect, useState } from 'react'

export const BreakerBanner = (): React.ReactElement | null => {
  const [state, setState] = useState<'closed' | 'open' | 'half-open'>(breakerStatus().state)
  const [canProbe, setCanProbe] = useState<boolean>(breakerStatus().canProbe)
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = breakerStatus()
      setState(s.state)
      setCanProbe(s.canProbe)
    }, 1000)
    return () => window.clearInterval(id)
  }, [])
  if (state === 'closed') return null
  return (
    <div className="w-full bg-amber-100 px-3 py-2 text-center text-sm text-amber-900">
      {state === 'open' ? 'Service temporarily unavailable. ' : 'Checking service… '}
      {canProbe && (
        <IonButton size="small" fill="outline" onClick={() => breakerProbeNow()}>
          Retry now
        </IonButton>
      )}
    </div>
  )
}


