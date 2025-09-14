import { IonCard, IonCardContent } from '@ionic/react'

type Props = { title?: string; message: string }

export const ErrorCard = ({ title = 'Something went wrong', message }: Props): React.ReactElement => {
  return (
    <IonCard className="border border-red-200 bg-red-50">
      <IonCardContent>
        <div className="text-sm font-medium text-red-800">{title}</div>
        <div className="text-sm text-red-700">{message}</div>
      </IonCardContent>
    </IonCard>
  )
}


