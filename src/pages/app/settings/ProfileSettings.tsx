import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Camera, Loader2, Save, Shield } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader, ErrorMessage, SuccessMessage } from '@/components/ui/misc'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function ProfileSettings() {
  const { user } = useAuth()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.displayName ?? '',
      email: user?.email ?? '',
    },
  })

  const onSubmit = async (_data: ProfileForm) => {
    setError('')
    setSuccess('')
    try {
      // In a real app, this would call an API to update the profile
      await new Promise((resolve) => setTimeout(resolve, 500))
      setSuccess('Profile updated successfully')
    } catch {
      setError('Failed to update profile. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your personal information and account details"
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-brand-600 flex items-center justify-center text-white text-2xl font-bold">
                {user?.displayName?.[0]?.toUpperCase() ?? <User className="h-8 w-8" />}
              </div>
              <button className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors">
                <Camera className="h-3.5 w-3.5" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">Profile Photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                JPG, PNG or GIF. Max 2MB.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Upload Photo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="fullName">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  placeholder="John Doe"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="email">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="you@example.com"
                  disabled
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Email changes require re-verification.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} id="profile-save-btn">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication Status Card */}
      <Card className="border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-black flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Two-Factor Authentication (TOTP 2FA)
            </CardTitle>
            <Badge variant="outline" className="font-bold">
              Standard RFC 6238
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border">
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">
                Protect your account with an Authenticator App
              </p>
              <p className="text-xs text-muted-foreground font-semibold">
                Generate rolling 6-digit TOTP verification codes on Google Authenticator, Microsoft Authenticator, Authy, or 1Password.
              </p>
            </div>
            <Link to="/app/settings/security">
              <Button variant="brand" size="sm" className="font-black shrink-0">
                Configure 2FA
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
