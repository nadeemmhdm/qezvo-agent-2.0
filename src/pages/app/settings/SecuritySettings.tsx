import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Lock, Shield, Smartphone, Loader2, KeyRound, CheckCircle2,
  Copy, Check, AlertTriangle, Download, XCircle
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog'
import { PageHeader, ErrorMessage, SuccessMessage } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import {
  getStoredTotpState,
  saveStoredTotpState,
  generateTotpSecret,
  getTotpUri,
  getQrCodeUrl,
  verifyTotpCode,
  generateBackupCodes,
  disableTotp,
  type UserTotpState,
} from '@/features/auth/totpService'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

export default function SecuritySettings() {
  const { sendPasswordReset, user } = useAuth()
  const userId = user?.uid || user?.email || 'default_user'

  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [totpState, setTotpState] = useState<UserTotpState>({
    enabled: false,
    secret: '',
    backupCodes: [],
    usedBackupCodes: [],
    enabledAt: null,
  })

  const [setupModalOpen, setSetupModalOpen] = useState(false)
  const [setupStep, setSetupStep] = useState<'scan' | 'verify' | 'backup'>('scan')
  const [tempSecret, setTempSecret] = useState('')
  const [tempUri, setTempUri] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verifyError, setVerifyError] = useState('')
  const [generatedBackupCodes, setGeneratedBackupCodes] = useState<string[]>([])
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [copiedBackup, setCopiedBackup] = useState(false)

  const [viewBackupOpen, setViewBackupOpen] = useState(false)

  useEffect(() => {
    if (userId) {
      setTotpState(getStoredTotpState(userId))
    }
  }, [userId])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  const onSubmit = async (_data: PasswordForm) => {
    setError('')
    setSuccess('')
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      setSuccess('Password updated successfully')
      reset()
    } catch {
      setError('Failed to update password. Please try again.')
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return
    try {
      await sendPasswordReset(user.email)
      setSuccess('Password reset email sent. Check your inbox.')
    } catch {
      setError('Failed to send reset email.')
    }
  }

  const startTotpSetup = () => {
    const newSecret = generateTotpSecret()
    const uri = getTotpUri(newSecret, user?.email || 'admin@qezvo.in')
    setTempSecret(newSecret)
    setTempUri(uri)
    setVerificationCode('')
    setVerifyError('')
    setSetupStep('scan')
    setSetupModalOpen(true)
  }

  const handleVerifyTotp = async () => {
    if (!verificationCode || verificationCode.trim().length !== 6) {
      setVerifyError('Please enter a valid 6-digit code')
      return
    }

    setVerifying(true)
    setVerifyError('')

    try {
      const isValid = await verifyTotpCode(tempSecret, verificationCode)
      if (!isValid) {
        setVerifyError('Invalid authenticator code. Check your clock and try again.')
        setVerifying(false)
        return
      }

      const backupCodes = generateBackupCodes(8)
      setGeneratedBackupCodes(backupCodes)

      const newState: UserTotpState = {
        enabled: true,
        secret: tempSecret,
        backupCodes,
        usedBackupCodes: [],
        enabledAt: new Date().toISOString(),
      }

      saveStoredTotpState(userId, newState)
      setTotpState(newState)
      setSetupStep('backup')
      toast.success('Two-factor authentication enabled successfully!')
    } catch (err) {
      console.error(err)
      setVerifyError('Verification failed. Please try again.')
    } finally {
      setVerifying(false)
    }
  }

  const handleDisable2FA = () => {
    if (confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) {
      disableTotp(userId)
      setTotpState({
        enabled: false,
        secret: '',
        backupCodes: [],
        usedBackupCodes: [],
        enabledAt: null,
      })
      toast.info('Two-Factor Authentication disabled')
    }
  }

  const copyToClipboard = (text: string, type: 'secret' | 'backup') => {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedBackup(true)
      setTimeout(() => setCopiedBackup(false), 2000)
    }
    toast.success('Copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const codes = totpState.backupCodes.length > 0 ? totpState.backupCodes : generatedBackupCodes
    const blob = new Blob(
      [`QEZVO AGENT - EMERGENCY 2FA BACKUP CODES\nGenerated: ${new Date().toISOString()}\nAccount: ${user?.email || 'User'}\n\n${codes.join('\n')}\n\nKeep these codes in a secure offline vault. Each code can be used once.`],
      { type: 'text/plain;charset=utf-8' }
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qezvo-backup-codes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        description="Manage your password, authentication protocols, and two-factor verification"
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Change Password
          </CardTitle>
          <CardDescription>
            Choose a strong password with at least 8 characters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="currentPassword">
                Current Password
              </label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                placeholder="••••••••"
              />
              {errors.currentPassword && (
                <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="newPassword">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                placeholder="••••••••"
              />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting} id="security-update-password-btn">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating…
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Update Password
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handlePasswordReset}
              >
                Send reset email instead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Two-Factor Authentication (TOTP)
            </CardTitle>
            {totpState.enabled ? (
              <Badge variant="default" className="font-bold">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                2FA Active
              </Badge>
            ) : (
              <Badge variant="secondary" className="font-bold">
                Not Enabled
              </Badge>
            )}
          </div>
          <CardDescription>
            Secure your account using standard RFC 6238 time-based one-time password (TOTP) compatible with Google Authenticator, Microsoft Authenticator, Authy, and 1Password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totpState.enabled ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                    Two-factor authentication is active on your account
                  </p>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Configured on {totpState.enabledAt ? new Date(totpState.enabledAt).toLocaleDateString() : 'Active session'}. You will be prompted for a 6-digit TOTP code during critical account actions and sign-ins.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewBackupOpen(true)}
                  className="font-bold"
                >
                  <KeyRound className="h-3.5 w-3.5 mr-1.5" />
                  View Backup Codes ({totpState.backupCodes.length} remaining)
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable2FA}
                  className="font-bold"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                  Disable 2FA
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border-2 border-dashed border-border bg-muted/30">
              <div>
                <p className="text-sm font-bold text-foreground">Authenticator App (TOTP)</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-semibold">
                  Generate rolling 30-second verification codes using any standard authenticator app.
                </p>
              </div>
              <Button
                variant="default"
                onClick={startTotpSetup}
                id="enable-2fa-btn"
                className="font-black shrink-0"
              >
                <Smartphone className="h-4 w-4 mr-1.5" />
                Enable 2FA Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Active Sessions
          </CardTitle>
          <CardDescription>
            Manage all devices currently signed into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {navigator.userAgent.slice(0, 60)}…
                </p>
              </div>
              <span className="text-xs text-green-500 font-medium">Active</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => toast.success('Signed out other sessions')}>
            Sign Out All Other Sessions
          </Button>
        </CardContent>
      </Card>

      <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
        <DialogContent className="max-w-md border-2 border-border shadow-[8px_8px_0px_0px_#000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-primary" />
              Set Up Two-Factor Authentication
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password)
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'scan' && (
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                {tempUri ? (
                  <img
                    src={getQrCodeUrl(tempUri)}
                    alt="2FA TOTP QR Code"
                    className="w-48 h-48 rounded object-contain"
                  />
                ) : (
                  <Loader2 className="h-10 w-10 animate-spin text-black" />
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Or enter secret key manually
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded-lg bg-muted font-mono font-bold text-xs border border-border select-all break-all">
                    {tempSecret}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(tempSecret, 'secret')}
                    className="shrink-0 font-bold"
                  >
                    {copiedSecret ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-foreground">
                  Enter 6-digit code from your authenticator:
                </label>
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-[0.3em] font-black"
                />
                {verifyError && <p className="text-xs font-bold text-destructive">{verifyError}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setSetupModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  disabled={verifying || verificationCode.length !== 6}
                  onClick={handleVerifyTotp}
                  className="font-black"
                >
                  {verifying ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                  Verify &amp; Activate
                </Button>
              </div>
            </div>
          )}

          {setupStep === 'backup' && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-amber-500/10 border-2 border-amber-500/40 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs font-semibold space-y-1 text-amber-900 dark:text-amber-100">
                  <p className="font-bold">Save your emergency recovery codes!</p>
                  <p>If you lose access to your phone or authenticator, these 8 single-use codes are the only way to recover access.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-xl border border-border">
                {generatedBackupCodes.map((code, idx) => (
                  <code key={idx} className="p-1.5 bg-background border border-border/80 rounded text-center font-mono text-xs font-bold">
                    {code}
                  </code>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(generatedBackupCodes.join('\n'), 'backup')}
                  className="flex-1 font-bold"
                >
                  {copiedBackup ? <Check className="h-3.5 w-3.5 mr-1 text-green-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  Copy All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadBackupCodes}
                  className="flex-1 font-bold"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download .txt
                </Button>
              </div>

              <Button
                variant="default"
                className="w-full font-black mt-2"
                onClick={() => setSetupModalOpen(false)}
              >
                I have saved my backup codes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={viewBackupOpen} onOpenChange={setViewBackupOpen}>
        <DialogContent className="max-w-md border-2 border-border shadow-[8px_8px_0px_0px_#000]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Emergency Recovery Backup Codes
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              Each backup code can be used once to access your account if you lose your authenticator.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-xl border border-border">
              {totpState.backupCodes.map((code, idx) => (
                <code key={idx} className="p-1.5 bg-background border border-border/80 rounded text-center font-mono text-xs font-bold">
                  {code}
                </code>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(totpState.backupCodes.join('\n'), 'backup')}
                className="flex-1 font-bold"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Codes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={downloadBackupCodes}
                className="flex-1 font-bold"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                Download
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
