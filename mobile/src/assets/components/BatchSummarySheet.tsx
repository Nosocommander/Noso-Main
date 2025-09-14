import { IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react'

type Props = {
  open: boolean
  applied: number
  failed: string[]
  conflicted: string[]
  onClose: () => void
  onJumpFailed: (id: string) => void
  onJumpConflict: (id: string) => void
}

export const BatchSummarySheet = ({ open, applied, failed, conflicted, onClose, onJumpFailed, onJumpConflict }: Props) => {
  const firstFailed = failed[0]
  const firstConflict = conflicted[0]
  return (
    <IonModal isOpen={open} onDidDismiss={onClose} initialBreakpoint={0.3} breakpoints={[0, 0.3, 0.6]}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Save Summary</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="flex flex-col gap-2 text-sm">
          <div>✓ Applied: {applied}</div>
          <div>⚠︎ Failed: {failed.length}</div>
          <div>⇄ Conflicted: {conflicted.length}</div>
          <div className="mt-3 flex gap-2">
            <IonButton disabled={!firstFailed} onClick={() => firstFailed && onJumpFailed(firstFailed)}>Jump to first failed</IonButton>
            <IonButton disabled={!firstConflict} fill="outline" onClick={() => firstConflict && onJumpConflict(firstConflict)}>Jump to first conflict</IonButton>
          </div>
          <div className="mt-4">
            <IonButton fill="clear" onClick={onClose}>Dismiss</IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  )
}


