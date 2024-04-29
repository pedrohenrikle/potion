import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes'

import './styles.css'
import { queryClient } from './lib/react-query'
import { RouterProvider } from 'react-router-dom'

export function App(): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
