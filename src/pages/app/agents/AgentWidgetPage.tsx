import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Code, Copy, Globe, Monitor, Smartphone, MessageCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

interface WidgetConfig {
  position: 'bottom-right' | 'bottom-left'
  primaryColor: string
  buttonText: string
  width: number
  height: number
  autoOpen: boolean
  openDelay: number
}

export default function AgentWidgetPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const [config, setConfig] = useState<WidgetConfig>({
    position: 'bottom-right',
    primaryColor: '#6366f1',
    buttonText: 'Chat with us',
    width: 380,
    height: 600,
    autoOpen: false,
    openDelay: 3,
  })

  const set = <K extends keyof WidgetConfig>(key: K, value: WidgetConfig[K]) =>
    setConfig((c) => ({ ...c, [key]: value }))

  const embedCode = `<script>
  window.QezvoAgentConfig = {
    agentId: "${agentId}",
    position: "${config.position}",
    primaryColor: "${config.primaryColor}",
    buttonText: "${config.buttonText}",
    width: ${config.width},
    height: ${config.height},
    autoOpen: ${config.autoOpen},
    openDelay: ${config.openDelay},
  };
</script>
<script src="https://cdn.qezvo.in/widget.js" async></script>`

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode)
    toast.success('Embed code copied')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Widget & Embed"
        description="Configure and embed your agent as a chat widget"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Widget Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Button Text</label>
                <Input
                  value={config.buttonText}
                  onChange={(e) => set('buttonText', e.target.value)}
                  placeholder="Chat with us"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="h-9 w-12 rounded cursor-pointer border border-input"
                  />
                  <Input
                    value={config.primaryColor}
                    onChange={(e) => set('primaryColor', e.target.value)}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <div className="flex gap-2">
                  {(['bottom-right', 'bottom-left'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => set('position', pos)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm transition-colors ${
                        config.position === pos
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 font-medium text-brand-700 dark:text-brand-300'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      {pos === 'bottom-right' ? '↘ Bottom Right' : '↙ Bottom Left'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input
                    type="number"
                    value={config.width}
                    onChange={(e) => set('width', parseInt(e.target.value))}
                    min={280}
                    max={600}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input
                    type="number"
                    value={config.height}
                    onChange={(e) => set('height', parseInt(e.target.value))}
                    min={400}
                    max={900}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Auto-open Widget</label>
                  <button
                    onClick={() => set('autoOpen', !config.autoOpen)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      config.autoOpen ? 'bg-brand-600' : 'bg-muted-foreground/30'
                    }`}
                    role="switch"
                    aria-checked={config.autoOpen}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${config.autoOpen ? 'translate-x-4' : 'translate-x-1'}`} />
                  </button>
                </div>
                {config.autoOpen && (
                  <div className="space-y-1.5 pl-4">
                    <label className="text-sm font-medium">Open Delay (seconds)</label>
                    <Input
                      type="number"
                      value={config.openDelay}
                      onChange={(e) => set('openDelay', parseInt(e.target.value))}
                      min={0}
                      max={30}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Embed Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Embed Code
              </CardTitle>
              <CardDescription>
                Paste this code before the closing &lt;/body&gt; tag
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap border border-border/50">
                  {embedCode}
                </pre>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-3 right-3"
                  onClick={copyCode}
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="sticky top-6 h-fit space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Widget Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl h-64 overflow-hidden border border-border/50">
                {/* Simulated page content */}
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-5/6" />
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-4/6" />
                </div>

                {/* Widget button */}
                <div
                  className={`absolute bottom-4 flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-sm font-medium shadow-lg cursor-pointer ${
                    config.position === 'bottom-right' ? 'right-4' : 'left-4'
                  }`}
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <MessageCircle className="h-4 w-4" />
                  {config.buttonText || 'Chat'}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                <Monitor className="h-3.5 w-3.5" />
                <span>{config.width}×{config.height}px</span>
                <span>·</span>
                <Smartphone className="h-3.5 w-3.5" />
                <span>Responsive</span>
                <Badge variant="secondary" className="ml-auto text-xs">Preview</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4">
              <h3 className="text-sm font-medium mb-3">Framework Guides</h3>
              <div className="space-y-2">
                {['React', 'Vue', 'Angular', 'Shopify', 'WordPress', 'Webflow'].map((fw) => (
                  <button
                    key={fw}
                    className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground py-1 transition-colors"
                  >
                    <span>{fw}</span>
                    <span className="text-xs">View guide →</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
