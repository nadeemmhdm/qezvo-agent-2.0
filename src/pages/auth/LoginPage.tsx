import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { loginSchema, type LoginFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator, ErrorMessage } from '@/components/ui/misc'
import { usePlatformMaintenance, ADMIN_EMAIL, isAdminEmail } from '@/features/admin/platformStore'

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, signInWithGitHub } = useAuth()
  const { maintenance } = usePlatformMaintenance()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from ?? '/app/dashboard'

  const [showPassword, setShowPassword] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null)
    if (maintenance.enabled && !isAdminEmail(data.email)) {
      setAuthError(`Platform Maintenance Mode Active: Public sign-ins are temporarily paused. Only the administrator (${ADMIN_EMAIL}) may sign in during updates.`)
      return
    }

    try {
      await signInWithEmail(data.email, data.password)
      navigate(from, { replace: true })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign-in failed')
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    if (maintenance.enabled) {
      setAuthError(`Platform Maintenance Active: OAuth sign-ins are temporarily paused during scheduled maintenance.`)
      return
    }
    setOauthLoading('google')
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in failed')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleGitHubSignIn = async () => {
    setAuthError(null)
    if (maintenance.enabled) {
      setAuthError(`Platform Maintenance Active: OAuth sign-ins are temporarily paused during scheduled maintenance.`)
      return
    }
    setOauthLoading('github')
    try {
      await signInWithGitHub()
      navigate(from, { replace: true })
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'GitHub sign-in failed')
    } finally {
      setOauthLoading(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FFE600] text-black border-2 border-black mb-4 font-black shadow-[3px_3px_0px_0px_#000]">
          ⚡
        </div>
        <h1 className="text-2xl font-black tracking-tight">Welcome back to Qezvo Agent</h1>
        <p className="text-xs text-muted-foreground mt-1 font-semibold">
          Sign in to your Qezvo Agent workspace
        </p>
      </div>

      {/* Maintenance Mode Notice */}
      {maintenance.enabled && (
        <div className="p-4 rounded-xl border-2 border-black bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000] space-y-1.5">
          <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" />
            <span>Platform Maintenance Mode Active</span>
          </div>
          <p className="text-xs font-semibold leading-relaxed">
            {maintenance.message}
          </p>
          <div className="text-[10px] font-mono font-bold pt-1 text-black/80">
            Note: Only Administrator accounts ({ADMIN_EMAIL}) are authorized to sign in.
          </div>
        </div>
      )}

      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={handleGoogleSignIn}
          loading={oauthLoading === 'google'}
          disabled={!!oauthLoading || isSubmitting}
          id="login-google-btn"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          onClick={handleGitHubSignIn}
          loading={oauthLoading === 'github'}
          disabled={!!oauthLoading || isSubmitting}
          id="login-github-btn"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 mr-2" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          GitHub
        </Button>
      </div>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-1/2 bg-background px-2 text-xs text-muted-foreground">
          or continue with email
        </span>
      </div>

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('email')}
          type="email"
          label="Email address"
          placeholder="alex@example.com"
          autoComplete="email"
          error={errors.email?.message}
          leftIcon={<Mail className="h-4 w-4" />}
          id="login-email"
        />

        <div>
          <Input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            placeholder="Your password"
            autoComplete="current-password"
            error={errors.password?.message}
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
            id="login-password"
          />
          <div className="flex justify-end mt-1.5">
            <Link
              to="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
              id="forgot-password-link"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          id="login-submit-btn"
        >
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-primary font-medium hover:underline">
          Create one for free
        </Link>
      </p>
    </div>
  )
}
