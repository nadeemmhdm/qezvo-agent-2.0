import { useState, useEffect } from 'react'
import {
  Globe, Plus, Check, X, Loader2, ExternalLink,
  Shield, AlertCircle, RefreshCw, Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'

type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed'

function DomainStatusBadge({ status }: { status: DomainStatus }) {
  switch (status) {
    case 'active':
      return <Badge variant="success"><Check className="h-3 w-3 mr-1" />Active</Badge>
    case 'verifying':
      return <Badge variant="warning"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Verifying</Badge>
    case 'failed':
      return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Failed</Badge>
    default:
      return <Badge variant="secondary">Pending Setup</Badge>
  }
}

import {
  getRealCustomDomains,
  addRealCustomDomain,
  verifyRealCustomDomain,
  deleteRealCustomDomain,
  type RealCustomDomain
} from '@/features/data/realDataStore'

export default function DomainsPage() {
  const [domains, setDomains] = useState<RealCustomDomain[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  useEffect(() => {
    setDomains(getRealCustomDomains())
  }, [])

  const handleAdd = async () => {
    const domain = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '')
    if (!domain) return

    setAdding(true)
    await new Promise((r) => setTimeout(r, 500))

    const entry = addRealCustomDomain(domain)
    setDomains((prev) => [entry, ...prev])
    setNewDomain('')
    setShowAdd(false)
    setAdding(false)
    setSelectedDomain(entry.id)
    toast.success('Domain added', 'Set up your DNS records to verify the domain')
  }

  const handleVerify = async (id: string) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'verifying' } : d))
    )
    await new Promise((r) => setTimeout(r, 1000))
    const updated = verifyRealCustomDomain(id)
    if (updated) {
      setDomains((prev) => prev.map((d) => (d.id === id ? updated : d)))
      toast.success('Domain verified and SSL active!')
    }
  }

  const handleDelete = (id: string) => {
    deleteRealCustomDomain(id)
    setDomains((prev) => prev.filter((d) => d.id !== id))
    if (selectedDomain === id) setSelectedDomain(null)
    toast.success('Domain removed')
  }



  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Custom Domains"
        description="Connect your own domain to your AI agents"
        action={
          <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Domain
          </Button>
        }
      />

      {/* Info card */}
      <Card className="border-brand-500/30 bg-brand-50/30 dark:bg-brand-900/10">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <Globe className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
          <p className="text-sm text-brand-700 dark:text-brand-300">
            Custom domains let you host your agent at <strong>chat.yourcompany.com</strong> instead
            of the default Qezvo Agent URL. SSL is provisioned automatically.
          </p>
        </CardContent>
      </Card>

      {/* Add domain form */}
      {showAdd && (
        <Card>
          <CardHeader>
            <CardTitle>Add Custom Domain</CardTitle>
            <CardDescription>Enter the domain you want to use for your agent</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="chat.yourcompany.com"
                autoFocus
              />
              <Button onClick={handleAdd} disabled={!newDomain.trim() || adding}>
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain list */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No custom domains yet</p>
              <p className="text-xs mt-1">Add a domain to brand your agent's URL</p>
            </div>
          ) : (
            <div className="space-y-3">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex items-start gap-3 p-4 rounded-lg border border-border/50 hover:bg-muted/20 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <Globe className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <a
                          href={`https://${domain.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium hover:underline flex items-center gap-1 truncate"
                        >
                          {domain.domain}
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                      <DomainStatusBadge status={domain.status} />
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        SSL: {domain.sslStatus}
                      </span>
                      {domain.agentSlug && (
                        <span className="text-xs text-muted-foreground">
                          → /a/{domain.agentSlug}
                        </span>
                      )}
                    </div>
                    {domain.status === 'pending' && (
                      <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/50">
                        <p className="text-xs font-medium mb-1.5">DNS Configuration Required</p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Add this CNAME record to your DNS provider:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="bg-background rounded px-2 py-1 border border-border/50">
                            <span className="text-muted-foreground">Name:</span> {domain.domain.split('.')[0]}
                          </div>
                          <div className="bg-background rounded px-2 py-1 border border-border/50">
                            <span className="text-muted-foreground">Value:</span> cname.qezvo.in
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 h-7 text-xs"
                          onClick={() => handleVerify(domain.id)}
                        >
                          <RefreshCw className="mr-1.5 h-3 w-3" />
                          Verify DNS
                        </Button>
                      </div>
                    )}
                    {domain.status === 'failed' && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <AlertCircle className="h-3 w-3" />
                        DNS verification failed. Check your records and try again.
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(domain.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
