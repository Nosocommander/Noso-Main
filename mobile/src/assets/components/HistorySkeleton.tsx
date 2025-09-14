import { IonItem, IonLabel, IonList, IonSkeletonText } from '@ionic/react'

export const HistorySkeleton = ({ rows = 10 }: { rows?: number }) => {
  return (
    <IonList aria-label="Loading history">
      {Array.from({ length: rows }).map((_, i) => (
        <IonItem key={i} lines="full">
          <IonLabel>
            <IonSkeletonText animated={true} style={{ width: '40%', height: 16 }} />
            <IonSkeletonText animated={true} style={{ width: '60%', height: 14 }} />
            <IonSkeletonText animated={true} style={{ width: '30%', height: 12 }} />
          </IonLabel>
        </IonItem>
      ))}
    </IonList>
  )
}


