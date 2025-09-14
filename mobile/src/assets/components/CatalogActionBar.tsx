import { IonButton, IonFooter, IonToolbar } from '@ionic/react'
import { useKeyboard } from '../../hooks/useKeyboard'

type Props = {
  pendingCount: number
  isSaving: boolean
  onReview: () => void
  onUndoAll: () => void
  onSave: () => void
}

export const CatalogActionBar = ({ pendingCount, isSaving, onReview, onUndoAll, onSave }: Props) => {
  const { isOpen, bottomInset } = useKeyboard()
  if (pendingCount === 0) return null
  return (
    <IonFooter className="!fixed left-0 right-0 z-50" style={{ bottom: isOpen ? bottomInset : 0 }}>
      <IonToolbar>
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <button className="text-sm text-gray-600 underline" onClick={onUndoAll} aria-label="Undo all">
            ⟲ Undo all
          </button>
          <div className="text-sm">{pendingCount} changes pending</div>
          <div className="flex items-center gap-2">
            <IonButton aria-label="Review changes" onClick={onReview} disabled={isSaving} fill="outline" size="small">
              Review
            </IonButton>
            <IonButton aria-label="Batch Save" onClick={onSave} disabled={pendingCount === 0 || isSaving} size="small">
              {isSaving ? 'Saving…' : 'Batch Save'}
            </IonButton>
          </div>
        </div>
      </IonToolbar>
    </IonFooter>
  )
}


