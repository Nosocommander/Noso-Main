import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { useIonRouter } from '@ionic/react'

export function useAndroidBackButton(): void {
  const ionRouter = useIonRouter()
  useEffect(() => {
    const listenerPromise = App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && ionRouter.canGoBack()) {
        ionRouter.goBack()
        return
      }
      App.exitApp()
    })
    return () => {
      listenerPromise.then((listener) => listener.remove())
    }
  }, [ionRouter])
}


