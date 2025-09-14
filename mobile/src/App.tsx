import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonFab, IonFabButton, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Route, Redirect, Switch } from 'react-router-dom'
import HomePage from './pages/HomePage'
// DEV-only Diagnostics: import guarded for dev builds
const DiagnosticsPage = import.meta.env.DEV ? (await import('./pages/DiagnosticsPage')).default : (() => null as any)
import SettingsPage from './pages/SettingsPage'
import CatalogPage from './pages/CatalogPage'
import AnalyticsPage from './pages/AnalyticsPage'
import CsvPage from './pages/CsvPage'
import HistoryPage from './pages/HistoryPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import { useAndroidBackButton } from './hooks/useAndroidBackButton'
import { listOutline, statsChartOutline, documentTextOutline, timeOutline, settingsOutline, add } from 'ionicons/icons'
import { useKeyboard } from './hooks/useKeyboard'
import { useStore } from './providers/StoreProvider'
import { useToast } from './providers/ToastProvider'
import { useEditState } from './providers/EditStateProvider'
import { useScrollFps } from './hooks/useScrollFps'
import { BreakerBanner } from './assets/components/BreakerBanner'

setupIonicReact()

function App() {
  useAndroidBackButton()
  const { isOpen: kbOpen, bottomInset } = useKeyboard()
  const { storeId, setStoreId } = useStore()
  const { showToast } = useToast()
  const { hasPending, invokeSave, invokeDiscard } = useEditState()
  useScrollFps(true)
  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Switch>
              <Route exact path="/" component={HomePage} />
              {import.meta.env.DEV && <Route exact path="/diagnostics" component={DiagnosticsPage as any} />}
              <Route exact path="/catalog" component={CatalogPage} />
              <Route exact path="/analytics" component={AnalyticsPage} />
              <Route exact path="/csv" component={CsvPage} />
              <Route exact path="/history" component={HistoryPage} />
              <Route exact path="/settings" component={SettingsPage} />
              <Route exact path="/privacy" component={PrivacyPolicyPage} />
              <Redirect to="/home" />
            </Switch>
          </IonRouterOutlet>
          <IonTabBar slot="bottom" style={{ display: kbOpen ? 'none' : '' }}>
            <IonTabButton tab="catalog" href="/catalog">
              <IonIcon icon={listOutline} />
              <IonLabel>Catalog</IonLabel>
            </IonTabButton>
            <IonTabButton tab="analytics" href="/analytics">
              <IonIcon icon={statsChartOutline} />
              <IonLabel>Analytics</IonLabel>
            </IonTabButton>
            <IonTabButton tab="csv" href="/csv">
              <IonIcon icon={documentTextOutline} />
              <IonLabel>CSV</IonLabel>
            </IonTabButton>
            <IonTabButton tab="history" href="/history">
              <IonIcon icon={timeOutline} />
              <IonLabel>History</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={settingsOutline} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
      {/* Global store toggle placeholder in header + aria-live region */}
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Noso Woo</IonTitle>
          <IonButtons slot="end">
            <IonButton
              onClick={async () => {
                const id = window.prompt('Enter Store ID', storeId || '') || storeId
                if (!id || id === storeId) return
                if (hasPending) {
                  const choice = window.confirm('You have unsaved edits. OK=Save, Cancel=Discard')
                  // Using confirm as a simple 2-option modal; can be expanded to 3-option with IonAlert later
                  if (choice) {
                    try {
                      await invokeSave()
                      await setStoreId(id)
                      showToast({ message: `Store switched to ${id}`, color: 'primary' })
                      await (await import('@capacitor/haptics')).Haptics.impact({ style: (await import('@capacitor/haptics')).ImpactStyle.Light })
                    } catch {
                      showToast({ message: 'Save failed. Fix errors or discard.', color: 'danger' })
                      return
                    }
                  } else {
                    invokeDiscard()
                    await setStoreId(id)
                    showToast({ message: `Store switched to ${id}`, color: 'primary' })
                    await (await import('@capacitor/haptics')).Haptics.impact({ style: (await import('@capacitor/haptics')).ImpactStyle.Light })
                  }
                } else {
                  await setStoreId(id)
                  showToast({ message: `Store switched to ${id}`, color: 'primary' })
                  await (await import('@capacitor/haptics')).Haptics.impact({ style: (await import('@capacitor/haptics')).ImpactStyle.Light })
                }
              }}
            >
              Store: {storeId || 'default'}
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <BreakerBanner />
      <div aria-live="polite" aria-atomic="true" id="aria-live-region" className="sr-only" />
      <footer className="px-3 py-2 text-center text-xs text-gray-500">
        <a href="https://example.com/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
      </footer>
      {/* Catalog-only FAB */}
      <IonFab vertical="bottom" horizontal="end" slot="fixed" style={{ marginBottom: kbOpen ? bottomInset + 16 : 16 }}>
        <IonFabButton routerLink="/catalog" onClick={async () => { await (await import('@capacitor/haptics')).Haptics.impact({ style: (await import('@capacitor/haptics')).ImpactStyle.Medium }) }}>
          <IonIcon icon={add} />
        </IonFabButton>
      </IonFab>
    </IonApp>
  )
}

export default App
