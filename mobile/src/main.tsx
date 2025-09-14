import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@ionic/react/css/core.css'
import '@ionic/react/css/normalize.css'
import '@ionic/react/css/structure.css'
import '@ionic/react/css/typography.css'
import '@ionic/react/css/display.css'
import '@ionic/react/css/padding.css'
import '@ionic/react/css/float-elements.css'
import '@ionic/react/css/text-alignment.css'
import '@ionic/react/css/text-transformation.css'
import '@ionic/react/css/flex-utils.css'
import '@ionic/react/css/display.css'
import App from './App.tsx'
import { ReactQueryProvider } from './providers/ReactQueryProvider'
import { listenForOnlineFlush } from './lib/retryQueue'
import { ToastProvider } from './providers/ToastProvider'
import { ErrorBoundaryWithToast } from './providers/ErrorBoundary.tsx'
import { SplashScreen } from '@capacitor/splash-screen'
import { StoreProvider } from './providers/StoreProvider'
import { EditStateProvider } from './providers/EditStateProvider'

function Root() {
  useEffect(() => {
    // Hide splash once app is ready
    void SplashScreen.hide()
    listenForOnlineFlush()
  }, [])
  return (
    <ReactQueryProvider>
      <StoreProvider>
        <EditStateProvider>
          <ToastProvider>
            <ErrorBoundaryWithToast>
              <App />
            </ErrorBoundaryWithToast>
          </ToastProvider>
        </EditStateProvider>
      </StoreProvider>
    </ReactQueryProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
