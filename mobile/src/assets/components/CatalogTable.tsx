import { IonItem, IonLabel, IonList, IonInput, IonAvatar, IonButton, IonIcon } from '@ionic/react'
import { addOutline, removeOutline } from 'ionicons/icons'
import { memo, useCallback } from 'react'
import { type Product, type Variation } from '../../lib/api'
import { type DirtyMap, type DirtyFields } from '../../hooks/useCatalogBatch'
import { useEditRepaintMetric } from '../../hooks/useEditRepaintMetric'

type Props = {
  items: Product[]
  dirty: DirtyMap
  onChange: (id: string, field: keyof DirtyFields, value: string | number) => void
  rowErrors: Record<string, { field: keyof DirtyFields; message: string }[]>
  expandedIds: Set<string>
  onToggleExpand: (id: string) => void
}

export const CatalogTable = memo(function CatalogTable({ items, dirty, onChange, rowErrors, expandedIds, onToggleExpand }: Props) {
  const handleChange = useCallback(onChange, [onChange])
  const { begin, end } = useEditRepaintMetric()
  return (
    <IonList>
      {items.map((p) => {
        const d = dirty[p.id] || {}
        const isDirty = Object.keys(d).length > 0
        const rowErr = rowErrors[p.id]
        const expanded = expandedIds.has(p.id)
        const VariationRow = ({ v }: { v: Variation }) => {
          const dv = dirty[v.id] || {}
          const isDirtyV = Object.keys(dv).length > 0
          const rowErrV = rowErrors[v.id]
          return (
            <IonItem key={v.id} className={(isDirtyV ? 'bg-yellow-50 ' : '') + '!pl-16'} lines="full">
              <div className="flex w-full items-center gap-3">
                <div className="min-w-0 flex-1">
                  <IonLabel className="text-xs text-gray-500">SKU</IonLabel>
                  <IonInput value={(dv.sku ?? v.sku) as string} onIonChange={(e) => { begin(); handleChange(v.id, 'sku', e.detail.value || ''); end() }} />
                  {rowErrV?.find((e) => e.field === 'sku') && (
                    <span className="text-xs text-red-600">{rowErrV.find((e) => e.field === 'sku')!.message}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <IonLabel className="text-xs text-gray-500">Name</IonLabel>
                  <IonInput value={(dv.name ?? v.name) as string} onIonChange={(e) => { begin(); handleChange(v.id, 'name', e.detail.value || ''); end() }} />
                  {rowErrV?.find((e) => e.field === 'name') && (
                    <span className="text-xs text-red-600">{rowErrV.find((e) => e.field === 'name')!.message}</span>
                  )}
                </div>
                <div className="w-24">
                  <IonLabel className="text-xs text-gray-500">Price</IonLabel>
                  <IonInput type="number" value={(dv.price ?? v.price) as number} onIonChange={(e) => { begin(); handleChange(v.id, 'price', Number(e.detail.value || 0)); end() }} />
                  {rowErrV?.find((e) => e.field === 'price') && (
                    <span className="text-xs text-red-600">{rowErrV.find((e) => e.field === 'price')!.message}</span>
                  )}
                </div>
                <div className="w-24">
                  <IonLabel className="text-xs text-gray-500">Stock</IonLabel>
                  <IonInput type="number" value={(dv.stock ?? v.stock) as number} onIonChange={(e) => { begin(); handleChange(v.id, 'stock', Number(e.detail.value || 0)); end() }} />
                  {rowErrV?.find((e) => e.field === 'stock') && (
                    <span className="text-xs text-red-600">{rowErrV.find((e) => e.field === 'stock')!.message}</span>
                  )}
                </div>
                {isDirtyV && <span className="text-xs text-amber-700">●</span>}
              </div>
            </IonItem>
          )
        }
        return (
          <>
            <IonItem key={p.id} data-row-id={p.id} className={isDirty ? 'bg-yellow-50' : ''} lines="full">
              {p.thumbnailUrl && (
                <IonAvatar slot="start">
                  <img src={p.thumbnailUrl} alt="thumb" />
                </IonAvatar>
              )}
              <div className="flex w-full items-center gap-3">
                <IonButton slot="start" onClick={() => onToggleExpand(p.id)} size="small" fill="clear" aria-label={expanded ? 'Collapse variations' : 'Expand variations'}>
                  <IonIcon icon={expanded ? removeOutline : addOutline} />
                </IonButton>
                <div className="min-w-0 flex-1">
                  <IonLabel className="text-xs text-gray-500">SKU</IonLabel>
                  <IonInput
                    value={(d.sku ?? p.sku) as string}
                    onIonChange={(e) => { begin(); handleChange(p.id, 'sku', e.detail.value || ''); end() }}
                  />
                  {rowErr?.find((e) => e.field === 'sku') && (
                    <span className="text-xs text-red-600">{rowErr.find((e) => e.field === 'sku')!.message}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <IonLabel className="text-xs text-gray-500">Name</IonLabel>
                  <IonInput
                    value={(d.name ?? p.name) as string}
                    onIonChange={(e) => { begin(); handleChange(p.id, 'name', e.detail.value || ''); end() }}
                  />
                  {rowErr?.find((e) => e.field === 'name') && (
                    <span className="text-xs text-red-600">{rowErr.find((e) => e.field === 'name')!.message}</span>
                  )}
                </div>
                <div className="w-24">
                  <IonLabel className="text-xs text-gray-500">Price</IonLabel>
                  <IonInput
                    type="number"
                    value={(d.price ?? p.price) as number}
                    onIonChange={(e) => { begin(); handleChange(p.id, 'price', Number(e.detail.value || 0)); end() }}
                  />
                  {rowErr?.find((e) => e.field === 'price') && (
                    <span className="text-xs text-red-600">{rowErr.find((e) => e.field === 'price')!.message}</span>
                  )}
                </div>
                <div className="w-24">
                  <IonLabel className="text-xs text-gray-500">Stock</IonLabel>
                  <IonInput
                    type="number"
                    value={(d.stock ?? p.stock) as number}
                    onIonChange={(e) => { begin(); handleChange(p.id, 'stock', Number(e.detail.value || 0)); end() }}
                  />
                  {rowErr?.find((e) => e.field === 'stock') && (
                    <span className="text-xs text-red-600">{rowErr.find((e) => e.field === 'stock')!.message}</span>
                  )}
                </div>
                {isDirty && <span className="text-xs text-amber-700">●</span>}
              </div>
            </IonItem>
            {expanded && (p.variations || []).map((v) => <VariationRow key={v.id} v={v} />)}
          </>
        )
      })}
    </IonList>
  )
})


