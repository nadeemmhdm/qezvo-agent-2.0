import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { Toaster } from '@/hooks/use-toast'
import { Analytics } from '@vercel/analytics/react'
import Router from '@/app/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors
        if (
          error &&
          typeof error === 'object' &&
          'error' in error &&
          typeof (error as { error?: { code?: string } }).error?.code === 'string'
        ) {
          const code = (error as { error: { code: string } }).error.code
          if (['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'].includes(code)) {
            return false
          }
        }
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
        <Analytics />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AuthProvider>
    </QueryClientProvider>
  )
}
