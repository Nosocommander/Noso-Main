import { IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/react'

export const CatalogSkeleton = ({ rows = 10 }: { rows?: number }) => {
  return (
    <IonList aria-label="Loading products">
      {Array.from({ length: rows }).map((_, i) => (
        <IonItem key={i} lines="full">
          <IonSkeletonText animated={true} style={{ width: 48, height: 48 }} slot="start" />
          <div className="flex w-full items-center gap-3">
            <div className="min-w-0 flex-1">
              <IonLabel className="text-xs text-gray-500">SKU</IonLabel>
              <IonSkeletonText animated={true} style={{ width: '80%', height: 16 }} />
            </div>
            <div className="min-w-0 flex-1">
              <IonLabel className="text-xs text-gray-500">Name</IonLabel>
              <IonSkeletonText animated={true} style={{ width: '90%', height: 16 }} />
            </div>
            <div className="w-24">
              <IonLabel className="text-xs text-gray-500">Price</IonLabel>
              <IonSkeletonText animated={true} style={{ width: '60%', height: 16 }} />
            </div>
            <div className="w-24">
              <IonLabel className="text-xs text-gray-500">Stock</IonLabel>
              <IonSkeletonText animated={true} style={{ width: '60%', height: 16 }} />
            </div>
          </div>
        </IonItem>
      ))}
    </IonList>
  )
}


