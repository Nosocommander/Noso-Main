import { type PropsWithChildren } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../lib/queryClient'

export const ReactQueryProvider = ({ children }: PropsWithChildren): React.ReactElement => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}



