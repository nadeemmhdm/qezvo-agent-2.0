import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { Spinner } from '@/components/ui/misc'
import { isAdminEmail } from '@/features/admin/platformStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireVerified?: boolean
}

/**
 * Protects routes that require authentication.
 * Optionally requires email verification.
 */
export function ProtectedRoute({ children, requireVerified = true }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isVerified } = useAuth()
  const location = useLocation()

  // Show spinner while Firebase resolves auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // Not authenticated → redirect to login, preserving the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // Authenticated but email not verified → send to verify page
  if (requireVerified && !isVerified) {
    // OAuth providers (Google, GitHub) are pre-verified
    const isOAuthUser = user?.providerData.some(
      (p) => p.providerId === 'google.com' || p.providerId === 'github.com'
    )
    if (!isOAuthUser) {
      return <Navigate to="/verify-email" replace />
    }
  }

  return <>{children}</>
}

/**
 * Redirects already-authenticated users away from auth pages.
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, isVerified, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    // Check if email-verified or OAuth user
    const isOAuthUser = user?.providerData.some(
      (p) => p.providerId === 'google.com' || p.providerId === 'github.com'
    )
    if (!isVerified && !isOAuthUser) {
      return <Navigate to="/verify-email" replace />
    }
    const from = (location.state as { from?: string })?.from ?? '/app/dashboard'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}

/**
 * Protects admin dashboard route so only qezvooffical@gmail.com can access it.
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  const isAdmin = isAdminEmail(user?.email)
  if (!isAdmin) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <>{children}</>
}
