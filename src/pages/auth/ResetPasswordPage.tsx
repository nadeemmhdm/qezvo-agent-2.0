import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { applyActionCode, confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth'
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorMessage, SuccessMessage, Spinner } from '@/components/ui/misc'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const oobCode = searchParams.get('oobCode') ?? ''
  const mode = searchParams.get('mode') ?? ''

  const [verifying, setVerifying] = useState(true)
  const [codeValid, setCodeValid] = useState(false)
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  useEffect(() => {
    const verifyCode = async () => {
      if (!oobCode) {
        setVerifying(false)
        return
      }
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode)
          window.location.href = '/app/dashboard'
          return
        }
        const verifiedEmail = await verifyPasswordResetCode(auth, oobCode)
        setEmail(verifiedEmail)
        setCodeValid(true)
      } catch {
        setCodeValid(false)
      } finally {
        setVerifying(false)
      }
    }
    verifyCode()
  }, [oobCode, mode])

  const onSubmit = async (data: ResetPasswordFormData) => {
    setAuthError(null)
    try {
      await confirmPasswordReset(auth, oobCode, data.password)
      setSuccess(true)
    } catch {
      setAuthError('Failed to reset password. The link may have expired. Please request a new one.')
    }
  }

  if (verifying) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <Spinner size="lg" />
          <p className="text-sm text-muted-foreground">Verifying reset link…</p>
        </div>
      </div>
    )
  }

  if (!oobCode || !codeValid) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link to="/forgot-password">
          <Button className="w-full" size="lg" id="reset-request-new-btn">
            Request a new reset link
          </Button>
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Password reset!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Your password has been updated successfully.
          </p>
        </div>
        <SuccessMessage message="You can now sign in with your new password." />
        <Button className="w-full" size="lg" onClick={() => navigate('/login')} id="reset-signin-btn">
          Sign in now
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 mb-4">
          <Lock className="h-6 w-6 text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
        {email && (
          <p className="text-sm text-muted-foreground mt-1">
            For <span className="font-medium text-foreground">{email}</span>
          </p>
        )}
      </div>

      {authError && <ErrorMessage message={authError} />}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('password')}
          type={showPassword ? 'text' : 'password'}
          label="New password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          id="reset-password"
        />
        <Input
          {...register('confirmPassword')}
          type={showConfirm ? 'text' : 'password'}
          label="Confirm new password"
          placeholder="Repeat your new password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="text-muted-foreground hover:text-foreground"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
          id="reset-confirm-password"
        />
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          id="reset-submit-btn"
        >
          Reset password
        </Button>
      </form>
    </div>
  )
}
