import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react'
import { settingsOutline } from 'ionicons/icons'
import { Link, useHistory } from 'react-router-dom'
import { useStore } from '../providers/StoreProvider'
import { useConnectionStatus } from '../lib/hooks/useConnectionStatus'

const HomePage = () => {
  const history = useHistory()
  const { storeId } = useStore()
  const { status, checking, checkNow } = useConnectionStatus()
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Noso Woo Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="mb-3 rounded border p-3 text-sm">
          <div className="font-medium">Active Store: {storeId || 'default'}</div>
          <div className="mt-1 text-gray-600">Connection: {status === 'idle' ? 'Unknown' : status === 'ok' ? 'OK' : 'Fail'}</div>
          <IonButton size="small" fill="outline" className="mt-2" onClick={() => void checkNow()} disabled={checking}>{checking ? 'Checking…' : 'Check Now'}</IonButton>
        </div>
        <div className="flex flex-col gap-3">
          <Link to="/catalog">
            <IonButton expand="block">Catalog</IonButton>
          </Link>
          <Link to="/analytics">
            <IonButton expand="block">Analytics</IonButton>
          </Link>
          <Link to="/csv">
            <IonButton expand="block">CSV Upload</IonButton>
          </Link>
          <Link to="/history">
            <IonButton expand="block">History</IonButton>
          </Link>
          {import.meta.env.DEV && (
            <Link to="/diagnostics">
              <IonButton expand="block">Diagnostics</IonButton>
            </Link>
          )}
          <Link to="/settings">
            <IonButton expand="block">
              <IonIcon icon={settingsOutline} slot="start" />
              Settings
            </IonButton>
          </Link>
          <IonButton expand="block" fill="outline" onClick={() => {
            const id = window.prompt('Enter Store ID', storeId || '') || storeId
            if (id) history.push('/settings')
          }}>Switch Store</IonButton>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default HomePage



