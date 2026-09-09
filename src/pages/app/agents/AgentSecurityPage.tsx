import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Shield, Lock, Globe, Key, Copy, Eye, EyeOff, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${
          checked ? 'bg-brand-600' : 'bg-muted-foreground/30'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

export default function AgentSecurityPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [security, setSecurity] = useState({
    publicAccess: true,
    widgetEnabled: true,
    apiEnabled: false,
    rateLimitPerMinute: 30,
    passwordProtected: false,
    password: '',
    allowedOrigins: '',
    sourceVisibility: 'private' as 'public' | 'private',
    citationVisibility: 'public' as 'public' | 'private',
  })

  const set = <K extends keyof typeof security>(key: K, value: typeof security[K]) =>
    setSecurity((s) => ({ ...s, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    toast.success('Security settings saved')
  }

  const copyShareUrl = () => {
    navigator.clipboard.writeText(`https://www.qezvo.in/a/${agentId}`)
    toast.success('Share URL copied')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Security"
        description="Control who can access and interact with your agent"
        action={
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
            ) : (
              <><Save className="mr-2 h-4 w-4" />Save</>
            )}
          </Button>
        }
      />

      {/* Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Access Control
          </CardTitle>
          <CardDescription>
            Configure who can interact with your agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Toggle
            checked={security.publicAccess}
            onChange={(v) => set('publicAccess', v)}
            label="Public Access"
            description="Allow anyone with the link to use your agent"
          />
          <Toggle
            checked={security.widgetEnabled}
            onChange={(v) => set('widgetEnabled', v)}
            label="Widget Embed"
            description="Allow this agent to be embedded as a widget"
          />
          <Toggle
            checked={security.apiEnabled}
            onChange={(v) => set('apiEnabled', v)}
            label="API Access"
            description="Allow API key–based access to this agent"
          />
        </CardContent>
      </Card>

      {/* Password Protection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Password Protection
          </CardTitle>
          <CardDescription>
            Require a password to access the public agent URL
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Toggle
            checked={security.passwordProtected}
            onChange={(v) => set('passwordProtected', v)}
            label="Enable Password Protection"
          />
          {security.passwordProtected && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Access Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={security.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="Set a strong password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Rate Limiting
          </CardTitle>
          <CardDescription>
            Prevent abuse by limiting requests per minute
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Max Requests per Minute
              <span className="ml-2 font-mono font-bold text-brand-600">{security.rateLimitPerMinute}</span>
            </label>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={security.rateLimitPerMinute}
              onChange={(e) => set('rateLimitPerMinute', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5/min</span>
              <span>200/min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allowed Origins (CORS) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Allowed Origins (CORS)
          </CardTitle>
          <CardDescription>
            Restrict which domains can embed or call this agent (leave empty to allow all)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            value={security.allowedOrigins}
            onChange={(e) => set('allowedOrigins', e.target.value)}
            placeholder="https://example.com&#10;https://app.mysite.com"
            className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none font-mono"
          />
          <p className="text-xs text-muted-foreground">One origin per line. Empty = allow all.</p>
        </CardContent>
      </Card>

      {/* Share URL */}
      <Card>
        <CardHeader>
          <CardTitle>Public Agent URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={`https://www.qezvo.in/a/${agentId}`}
              readOnly
              className="font-mono text-sm bg-muted"
            />
            <Button variant="outline" size="icon" onClick={copyShareUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
