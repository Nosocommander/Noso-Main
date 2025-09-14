import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem } from '@ionic/react'
import { getApiLogs } from '../lib/diagnostics'

const DiagnosticsPage = () => {
  if (!import.meta.env.DEV) return null
  const logs = getApiLogs().slice().reverse()
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Diagnostics</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {logs.map((l, idx) => (
            <IonItem key={idx} lines="full">
              <div className="text-xs">
                <div>{new Date(l.ts).toLocaleTimeString()} — {l.kind} {l.method} {l.path} [{l.status ?? ''}] {l.durationMs ? `${l.durationMs}ms` : ''}</div>
                <div className="text-gray-500">store={l.storeId || ''} corr={l.correlationId}</div>
              </div>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  )
}

export default DiagnosticsPage


