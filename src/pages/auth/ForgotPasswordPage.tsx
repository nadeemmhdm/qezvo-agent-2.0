import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ErrorMessage, SuccessMessage } from '@/components/ui/misc'

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [success, setSuccess] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null)
    try {
      await sendPasswordReset(data.email)
      setSuccess(true)
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Failed to send reset email')
    }
  }

  if (success) {
    return (
      <div className="w-full space-y-6 text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-muted-foreground mt-2 text-sm max-w-sm mx-auto">
            We sent a password reset link to{' '}
            <span className="font-medium text-foreground">{getValues('email')}</span>.
          </p>
        </div>
        <SuccessMessage message="Reset link sent! Check your inbox and spam folder." />
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Didn't receive it? Check your spam folder or try again.
          </p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSuccess(false)}
            id="forgot-try-again-btn"
          >
            Try a different email
          </Button>
          <Link to="/login">
            <Button variant="ghost" className="w-full text-muted-foreground" id="forgot-back-login-btn">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 mb-4">
          <Mail className="h-6 w-6 text-brand-500" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
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
          id="forgot-email"
        />
        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={isSubmitting}
          id="forgot-submit-btn"
        >
          Send reset link
        </Button>
      </form>

      <Link to="/login">
        <Button variant="ghost" className="w-full text-muted-foreground" size="lg">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Button>
      </Link>
    </div>
  )
}
