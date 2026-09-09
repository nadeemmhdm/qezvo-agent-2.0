import { useState, useEffect } from 'react'
import {
  Key, Plus, Copy, Eye, EyeOff, Trash2, Clock,
  Shield, AlertTriangle, Loader2, ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import {
  getRealApiKeys,
  createRealApiKey,
  deleteRealApiKey,
  type RealApiKey
} from '@/features/data/realDataStore'

type ApiKey = RealApiKey

const SCOPES = [
  { value: 'full', label: 'Full Access', description: 'Read, write, and chat' },
  { value: 'read', label: 'Read Only', description: 'List and read agents' },
  { value: 'chat', label: 'Chat Only', description: 'Send chat messages only' },
] as const

function KeyRow({
  apiKey,
  onDelete,
}: {
  apiKey: ApiKey
  onDelete: (id: string) => void
}) {
  const [revealed, setRevealed] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    await new Promise((r) => setTimeout(r, 400))
    onDelete(apiKey.id)
    toast.success('API key deleted')
  }

  const maskKey = `${apiKey.prefix}${'•'.repeat(28)}`

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-muted/20">
      <div className="h-10 w-10 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
        <Key className="h-5 w-5 text-brand-500" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold">{apiKey.name}</p>
          <Badge
            variant={
              apiKey.scope === 'full' ? 'destructive'
              : apiKey.scope === 'chat' ? 'info'
              : 'secondary'
            }
            className="text-xs"
          >
            {apiKey.scope}
          </Badge>
          {apiKey.secret && (
            <Badge variant="warning" className="text-xs">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Copy now — won't be shown again
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
            {revealed && apiKey.secret ? apiKey.secret : maskKey}
          </code>
          {apiKey.secret && (
            <button
              onClick={() => setRevealed(!revealed)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={revealed ? 'Hide' : 'Reveal'}
            >
              {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          )}
          <button
            onClick={() => {
              navigator.clipboard.writeText(revealed && apiKey.secret ? apiKey.secret : maskKey)
              toast.success('Copied to clipboard')
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Copy"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Created {new Date(apiKey.createdAt).toLocaleDateString()}
          </span>
          {apiKey.lastUsed && (
            <span>Last used {new Date(apiKey.lastUsed).toLocaleDateString()}</span>
          )}
          {!apiKey.lastUsed && <span className="text-yellow-600 dark:text-yellow-400">Never used</span>}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
        title="Delete key"
      >
        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      </button>
    </div>
  )
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [newKeyScope, setNewKeyScope] = useState<'full' | 'read' | 'chat'>('chat')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    setKeys(getRealApiKeys())
  }, [])

  const handleCreate = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    await new Promise((r) => setTimeout(r, 400))

    const newKey = createRealApiKey(newKeyName, newKeyScope)
    setKeys((k) => [newKey, ...k])
    setNewKeyName('')
    setShowCreate(false)
    setCreating(false)
    toast.success('API key generated', 'Be sure to copy your secret key now')
  }

  const deleteKey = (id: string) => {
    deleteRealApiKey(id)
    setKeys((k) => k.filter((key) => key.id !== id))
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access to your agents"
        action={
          <Button size="sm" onClick={() => setShowCreate(!showCreate)}>
            <Plus className="mr-2 h-4 w-4" />
            New API Key
          </Button>
        }
      />

      {/* Security notice */}
      <Card className="border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-900/10">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Shield className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Keep your API keys secure. Never expose them in client-side code or public repositories.
            Keys with <strong>Full Access</strong> can create, edit, and delete agents.
          </p>
        </CardContent>
      </Card>

      {/* Create form */}
      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              The secret key will only be shown once. Store it securely.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Key Name</label>
              <Input
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production Server, GitHub Actions"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scope</label>
              <div className="space-y-2">
                {SCOPES.map((scope) => (
                  <label key={scope.value} className="cursor-pointer block">
                    <div
                      onClick={() => setNewKeyScope(scope.value as 'full' | 'read' | 'chat')}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        newKeyScope === scope.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div className={`h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        newKeyScope === scope.value ? 'border-brand-500' : 'border-muted-foreground/40'
                      }`}>
                        {newKeyScope === scope.value && (
                          <div className="h-2 w-2 rounded-full bg-brand-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{scope.label}</p>
                        <p className="text-xs text-muted-foreground">{scope.description}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button onClick={handleCreate} disabled={!newKeyName.trim() || creating}>
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</>
                ) : (
                  'Create Key'
                )}
              </Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys list */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys ({keys.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {keys.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Key className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No API keys yet</p>
              <p className="text-xs mt-1">Create a key to access the Qezvo Agent API</p>
            </div>
          ) : (
            <div className="space-y-3">
              {keys.map((key) => (
                <KeyRow key={key.id} apiKey={key} onDelete={deleteKey} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Docs link */}
      <Card>
        <CardContent className="pt-4 pb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">API Documentation</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Learn how to integrate your agents via REST API
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/api" target="_blank">
              View Docs <ChevronDown className="ml-1 h-3 w-3 rotate-[-90deg]" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
