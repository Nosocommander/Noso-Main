import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react'

const PrivacyPolicyPage = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Privacy Policy</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p className="text-sm text-gray-700">
        Noso Woo does not collect analytics or personal data. Credentials are stored locally on your device using secure storage.
        Network requests are sent directly to your WooCommerce store. Diagnostics are DEV-only and never included in production builds.
        You may remove your data at any time by clearing app data.
      </p>
    </IonContent>
  </IonPage>
)

export default PrivacyPolicyPage


