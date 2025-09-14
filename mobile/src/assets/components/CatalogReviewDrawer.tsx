import { IonButton, IonContent, IonHeader, IonModal, IonTitle, IonToolbar } from '@ionic/react'
import { type Product } from '../../lib/api'
import { type DirtyMap } from '../../hooks/useCatalogBatch'

type Props = {
  open: boolean
  onClose: () => void
  dirty: DirtyMap
  originals: Record<string, Product>
  onRemoveRow: (id: string) => void
  onClearAll: () => void
  onSave: () => void
  conflicts?: Record<string, { server?: Record<string, string | number>; local?: Record<string, string | number> }>
  onUseServer?: (id: string) => void
  onKeepLocalRetry?: (id: string) => void
}

export const CatalogReviewDrawer = ({ open, onClose, dirty, originals, onRemoveRow, onClearAll, onSave, conflicts, onUseServer, onKeepLocalRetry }: Props) => {
  const entries = Object.entries(dirty)
  const counts = { total: entries.length, conflicted: Object.keys(conflicts || {}).length, failed: 0 }
  return (
    <IonModal isOpen={open} onDidDismiss={onClose} initialBreakpoint={0.5} breakpoints={[0, 0.5, 0.9]}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Review Changes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {entries.length > 0 && (
          <div className="mb-3 text-sm text-gray-700">
            Summary: {counts.total - counts.conflicted} ready, {counts.conflicted} conflicted
          </div>
        )}
        {entries.length === 0 ? (
          <p className="text-gray-600">No changes.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {entries.map(([id, fields]) => {
              const p = originals[id]
              const conflict = conflicts?.[id]
              return (
                <div key={id} className="rounded border p-3">
                  <div className="mb-2 text-sm font-medium">{p?.name || id}</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(fields).map(([k, v]) => (
                      <div key={k}>
                        <div className="text-gray-500">{k}</div>
                        <div>
                          <span className="line-through opacity-60 mr-2">{String((p as Record<string, unknown>)[k])}</span>
                          <span>→ {String(v)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {conflict && (
                    <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-2 text-xs">
                      <div className="mb-1 font-medium text-amber-800">Conflict detected</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-gray-500">Server</div>
                          {Object.entries(conflict.server || {}).map(([k, v]) => (
                            <div key={k}>{k}: {String(v)}</div>
                          ))}
                        </div>
                        <div>
                          <div className="text-gray-500">Local</div>
                          {Object.entries(conflict.local || {}).map(([k, v]) => (
                            <div key={k}>{k}: {String(v)}</div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 flex gap-2">
                        {onUseServer && <IonButton size="small" fill="outline" onClick={() => onUseServer(id)}>Use Server</IonButton>}
                        {onKeepLocalRetry && <IonButton size="small" onClick={() => onKeepLocalRetry(id)}>Keep Local & Retry</IonButton>}
                      </div>
                    </div>
                  )}
                  <div className="mt-2 flex justify-end gap-2">
                    <IonButton size="small" fill="outline" onClick={() => onRemoveRow(id)}>
                      Remove change
                    </IonButton>
                  </div>
                </div>
              )
            })}
            <div className="flex justify-between">
              <IonButton fill="outline" onClick={onClearAll}>
                Clear all
              </IonButton>
              <IonButton onClick={onSave}>Save</IonButton>
            </div>
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}


