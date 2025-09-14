import { IonButton } from '@ionic/react'

type Props = {
  icon?: React.ReactNode
  title: string
  message: string
  primaryAction?: { label: string; onClick: () => void }
}

export const EmptyState = ({ icon, title, message, primaryAction }: Props): React.ReactElement => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded border p-6 text-center">
      {icon}
      <div className="text-base font-medium">{title}</div>
      <div className="text-sm text-gray-600">{message}</div>
      {primaryAction && (
        <IonButton className="mt-2" onClick={primaryAction.onClick}>
          {primaryAction.label}
        </IonButton>
      )}
    </div>
  )
}


