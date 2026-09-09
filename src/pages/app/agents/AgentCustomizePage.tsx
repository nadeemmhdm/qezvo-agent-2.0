import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Palette, MessageSquare, Type, Eye, Save, Loader2 } from 'lucide-react'
import { useAgent } from '@/features/agents/hooks/useAgent'
import { useUpdateAgent } from '@/features/agents/hooks/useAgents'
import { getRealAgentSettings, saveRealAgentSettings } from '@/features/data/realDataStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface CustomizeConfig {
  displayName: string
  welcomeMessage: string
  placeholder: string
  suggestedQuestions: string
  primaryColor: string
  theme: 'light' | 'dark' | 'auto'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  fontSize: 'sm' | 'base' | 'lg'
  markdownEnabled: boolean
  typingIndicator: boolean
  streamingEnabled: boolean
}

const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'auto', label: 'Auto', icon: '⚡' },
] as const

const RADIUS_OPTIONS = [
  { value: 'none', label: 'Sharp' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'full', label: 'Pill' },
] as const

const FONT_SIZES = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
] as const

const COLOR_PRESETS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#06b6d4', '#64748b', '#1e293b',
]

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

export default function AgentCustomizePage() {
  const { agentId } = useParams<{ agentId: string }>()
  const { data: agent } = useAgent(agentId!)
  const updateAgent = useUpdateAgent(agentId!)

  const initial = getRealAgentSettings(agentId || 'default')

  const [config, setConfig] = useState<CustomizeConfig>({
    displayName: initial.displayName || agent?.name || 'Support Agent',
    welcomeMessage: initial.welcomeMessage || 'Hello! How can I help you today?',
    placeholder: initial.placeholder || 'Type your message…',
    suggestedQuestions: (initial.suggestedQuestions || [
      'What can you help me with?',
      'How do I get started?',
      'What are your pricing plans?',
    ]).join('\n'),
    primaryColor: initial.primaryColor || '#6366f1',
    theme: (initial.theme as any) || 'auto',
    borderRadius: (initial.borderRadius as any) || 'md',
    fontSize: (initial.fontSize as any) || 'base',
    markdownEnabled: initial.markdownEnabled ?? true,
    typingIndicator: initial.typingIndicator ?? true,
    streamingEnabled: initial.streamingEnabled ?? true,
  })

  const set = <K extends keyof CustomizeConfig>(key: K, value: CustomizeConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }))

  const handleSave = async () => {
    try {
      saveRealAgentSettings(agentId || 'default', {
        ...config,
        suggestedQuestions: config.suggestedQuestions.split('\n').filter(Boolean),
      })
      await updateAgent.mutateAsync({
        name: config.displayName,
        description: agent?.description,
      })
      toast.success('Customization saved', 'Color changes and appearance settings updated!')
    } catch {
      toast.error('Failed to save')
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-brand-500" />
            Customize Agent
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personalize how your agent looks and behaves
          </p>
        </div>
        <Button onClick={handleSave} disabled={updateAgent.isPending}>
          {updateAgent.isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Save</>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-5">
          {/* Identity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Identity & Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={config.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                  placeholder="Support Agent"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Welcome Message</label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => set('welcomeMessage', e.target.value)}
                  className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Hello! How can I help you today?"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Input Placeholder</label>
                <Input
                  value={config.placeholder}
                  onChange={(e) => set('placeholder', e.target.value)}
                  placeholder="Type your message…"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">
                  Suggested Questions
                  <span className="text-muted-foreground font-normal ml-1">(one per line)</span>
                </label>
                <textarea
                  value={config.suggestedQuestions}
                  onChange={(e) => set('suggestedQuestions', e.target.value)}
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="What can you help me with?&#10;How do I get started?"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => set('primaryColor', color)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        config.primaryColor === color
                          ? 'border-foreground scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="h-7 w-7 rounded-full border-0 cursor-pointer"
                    title="Custom color"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Theme</label>
                <div className="flex gap-2">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => set('theme', t.value)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                        config.theme === t.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Border Radius</label>
                <div className="flex gap-2">
                  {RADIUS_OPTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => set('borderRadius', r.value)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                        config.borderRadius === r.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5" /> Font Size
                </label>
                <div className="flex gap-2">
                  {FONT_SIZES.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => set('fontSize', f.value)}
                      className={`flex-1 py-1.5 text-sm rounded-lg border transition-colors ${
                        config.fontSize === f.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-medium'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Behavior */}
          <Card>
            <CardHeader>
              <CardTitle>Behavior</CardTitle>
              <CardDescription>Control how the chat widget behaves</CardDescription>
            </CardHeader>
            <CardContent>
              <Toggle
                checked={config.markdownEnabled}
                onChange={(v) => set('markdownEnabled', v)}
                label="Markdown Rendering"
                description="Render markdown formatting in responses"
              />
              <Toggle
                checked={config.typingIndicator}
                onChange={(v) => set('typingIndicator', v)}
                label="Typing Indicator"
                description="Show animated dots while the agent is thinking"
              />
              <Toggle
                checked={config.streamingEnabled}
                onChange={(v) => set('streamingEnabled', v)}
                label="Streaming Responses"
                description="Stream response tokens as they are generated"
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Live Preview */}
        <div className="sticky top-6 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl border border-border overflow-hidden shadow-md"
                style={{ fontFamily: 'inherit' }}
              >
                {/* Chat header */}
                <div
                  className="p-4 flex items-center gap-3"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                    {config.displayName[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{config.displayName || 'Agent'}</p>
                    <p className="text-xs text-white/70">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="bg-background p-4 space-y-3 min-h-[160px]">
                  <div className="flex gap-2">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: config.primaryColor }}>
                      {config.displayName[0]?.toUpperCase() ?? 'A'}
                    </div>
                    <div
                      className="text-xs bg-muted p-2.5 rounded-lg max-w-[80%]"
                      style={{ borderRadius: config.borderRadius === 'full' ? '1rem' : config.borderRadius === 'lg' ? '0.75rem' : config.borderRadius === 'none' ? '0' : '0.5rem' }}
                    >
                      {config.welcomeMessage || 'Hello! How can I help?'}
                    </div>
                  </div>

                  {config.suggestedQuestions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {config.suggestedQuestions.split('\n').filter(Boolean).slice(0, 2).map((q, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-full border cursor-pointer hover:bg-muted/50"
                          style={{ borderColor: config.primaryColor, color: config.primaryColor }}
                        >
                          {q}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-border p-3 flex items-center gap-2 bg-background">
                  <div className="flex-1 text-xs text-muted-foreground bg-muted rounded-full px-3 py-1.5">
                    {config.placeholder || 'Type your message…'}
                  </div>
                  <div
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    →
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
