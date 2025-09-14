import React, { type PropsWithChildren, type ReactNode } from 'react'
import { useToast } from './ToastProvider'

type ErrorBoundaryState = { hasError: boolean; error?: Error }

type ErrorBoundaryProps = PropsWithChildren<{
  onError?: (error: Error) => void
}>

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error): void {
    console.error('Unhandled error', error)
    if (this.props.onError) this.props.onError(error)
  }
  render(): ReactNode {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

export const ErrorBoundaryWithToast = ({ children }: PropsWithChildren): React.ReactElement => {
  const { showToast } = useToast()
  return (
    <ErrorBoundary onError={(error) => showToast({ message: error.message || 'Unexpected error', color: 'danger' })}>
      {children}
    </ErrorBoundary>
  )
}


