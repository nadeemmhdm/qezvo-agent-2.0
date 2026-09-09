import { useState, useEffect } from 'react'
import { Mail, RefreshCw, LogOut, CheckCircle2 } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { auth } from '@/lib/firebase'
import { applyActionCode, reload } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { ErrorMessage, SuccessMessage } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

export default function VerifyEmailPage() {
  const { user, sendVerificationEmail, refreshVerificationStatus, signOut, isVerified } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [resendLoading, setResendLoading] = useState(false)
  const [refreshLoading, setRefreshLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)
  const [tokenVerified, setTokenVerified] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResent, setLastResent] = useState<number>(0)

  // Redirect if already verified
  useEffect(() => {
    if (isVerified || auth.currentUser?.emailVerified) {
      navigate('/app/dashboard', { replace: true })
    }
  }, [isVerified, user?.emailVerified, navigate])

  // Handle Firebase email verification action code (?mode=verifyEmail&oobCode=...)
  useEffect(() => {
    const oobCode = searchParams.get('oobCode')
    const mode = searchParams.get('mode')
    const token = searchParams.get('token')

    if (oobCode && (mode === 'verifyEmail' || !mode)) {
      setRefreshLoading(true)
      applyActionCode(auth, oobCode)
        .then(async () => {
          if (auth.currentUser) {
            await reload(auth.currentUser)
          }
          await refreshVerificationStatus()
          setTokenVerified(true)
          toast.success('Email Verified Successfully', 'Your email has been verified! Redirecting to dashboard...')
          setTimeout(() => {
            navigate('/app/dashboard', { replace: true })
          }, 1200)
        })
        .catch((err) => {
          console.error('Action code verification failed:', err)
          setError(err instanceof Error ? err.message : 'Invalid or expired email verification link.')
        })
        .finally(() => {
          setRefreshLoading(false)
        })
    } else if (token) {
      setTokenVerified(true)
      toast.success('Email Verified Successfully', 'Your email has been verified.')
      setTimeout(() => {
        navigate('/app/dashboard', { replace: true })
      }, 1200)
    }
  }, [searchParams, navigate, refreshVerificationStatus])

  const handleResend = async () => {
    const now = Date.now()
    if (now - lastResent < 60_000) {
      setError('Please wait 60 seconds before requesting another verification email.')
      return
    }
    setError(null)
    setResendLoading(true)
    try {
      await sendVerificationEmail()
      setResendSuccess(true)
      setLastResent(now)
      toast.success('Verification email sent', 'Check your email inbox (and spam folder).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend verification email')
    } finally {
      setResendLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshLoading(true)
    setError(null)
    try {
      await refreshVerificationStatus()
      if (auth.currentUser?.emailVerified || isVerified) {
        toast.success('Email verified!', 'Redirecting to your dashboard...')
        navigate('/app/dashboard', { replace: true })
      } else {
        toast.info('Not yet verified', 'Please click the link sent to your email inbox, then click here.')
      }
    } catch {
      setError('Failed to check verification status')
    } finally {
      setRefreshLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.warn('Sign out notice:', err)
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="w-full space-y-6 text-center">
      {/* Icon */}
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-[#FFE600] border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
          <Mail className="h-8 w-8 text-black" />
        </div>
      </div>

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-black tracking-tight">Verify your email</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
          We sent a verification link to{' '}
          <span className="font-bold text-foreground">{user?.email || auth.currentUser?.email}</span>.
          Click the link in the email to activate your account.
        </p>
      </div>

      {/* Messages */}
      {tokenVerified && (
        <div className="p-4 bg-[#FFE600] border-2 border-black rounded-xl text-black font-bold flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#000]">
          <CheckCircle2 className="h-5 w-5 text-black" />
          Email successfully verified! Redirecting to dashboard…
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      {resendSuccess && (
        <SuccessMessage message="Verification email sent via Firebase! Please check your email inbox and spam folder." />
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Button
          onClick={handleRefresh}
          className="w-full"
          variant="default"
          size="lg"
          loading={refreshLoading}
          id="verify-check-btn"
        >
          <RefreshCw className="h-4 w-4" />
          I've verified my email
        </Button>

        <Button
          onClick={handleResend}
          variant="outline"
          className="w-full"
          size="lg"
          loading={resendLoading}
          id="verify-resend-btn"
        >
          <Mail className="h-4 w-4" />
          Resend verification email
        </Button>

        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full text-muted-foreground"
          size="lg"
          id="verify-signout-btn"
        >
          <LogOut className="h-4 w-4" />
          Sign out and use a different account
        </Button>
      </div>

      {/* Tips */}
      <div className="text-left rounded-xl border bg-muted/50 p-4 space-y-2">
        <p className="text-xs font-semibold text-foreground">Didn't receive the email?</p>
        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
          <li>Check your spam or junk folder</li>
          <li>Make sure you entered the correct email</li>
          <li>Wait a few minutes and check again</li>
          <li>Click "Resend" to get a new verification link</li>
        </ul>
      </div>
    </div>
  )
}
