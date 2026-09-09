import { useState } from 'react'
import { Bell, Mail, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader, SuccessMessage } from '@/components/ui/misc'

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'training_complete',
    label: 'Training Completed',
    description: 'When an agent finishes indexing knowledge',
    email: true,
    push: true,
  },
  {
    id: 'training_failed',
    label: 'Training Failed',
    description: 'When a training job encounters an error',
    email: true,
    push: true,
  },
  {
    id: 'agent_published',
    label: 'Agent Published',
    description: 'When an agent is successfully published',
    email: true,
    push: false,
  },
  {
    id: 'usage_limit',
    label: 'Usage Limit Reached',
    description: 'When you reach 80% or 100% of your plan limits',
    email: true,
    push: true,
  },
  {
    id: 'team_invite',
    label: 'Team Invitations',
    description: 'When someone invites you to a team',
    email: true,
    push: true,
  },
  {
    id: 'security_alert',
    label: 'Security Alerts',
    description: 'Suspicious login attempts or security events',
    email: true,
    push: true,
  },
  {
    id: 'billing',
    label: 'Billing Updates',
    description: 'Invoices, payment failures, plan changes',
    email: true,
    push: false,
  },
  {
    id: 'product_updates',
    label: 'Product Updates',
    description: 'New features, improvements, and announcements',
    email: false,
    push: false,
  },
]

export default function NotificationSettings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string, channel: 'email' | 'push') => {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: !s[channel] } : s))
    )
    setSaved(false)
  }

  const handleSave = async () => {
    // In production: call API to save notification preferences
    await new Promise((resolve) => setTimeout(resolve, 300))
    setSaved(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Choose how and when you receive notifications"
      />

      {saved && <SuccessMessage message="Notification preferences saved" />}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Control which notifications you receive via email or push
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {/* Header */}
            <div className="grid grid-cols-[1fr,80px,80px] gap-4 pb-3 border-b border-border text-xs font-medium text-muted-foreground">
              <span>Notification</span>
              <span className="flex items-center justify-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </span>
              <span className="flex items-center justify-center gap-1">
                <Smartphone className="h-3 w-3" /> Push
              </span>
            </div>

            {settings.map((setting) => (
              <div
                key={setting.id}
                className="grid grid-cols-[1fr,80px,80px] gap-4 py-4 border-b border-border/50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{setting.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {setting.description}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => toggle(setting.id, 'email')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                      setting.email ? 'bg-brand-600' : 'bg-muted-foreground/30'
                    }`}
                    role="switch"
                    aria-checked={setting.email}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        setting.email ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => toggle(setting.id, 'push')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
                      setting.push ? 'bg-brand-600' : 'bg-muted-foreground/30'
                    }`}
                    role="switch"
                    aria-checked={setting.push}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        setting.push ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSave}>Save Preferences</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
