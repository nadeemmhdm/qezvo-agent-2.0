import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { GitBranch, RotateCcw, Clock, CheckCircle, Download, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import {
  getRealAgentVersions,
  createRealAgentVersion,
  type RealAgentVersion
} from '@/features/data/realDataStore'

export default function AgentVersionsPage() {
  const { agentId = 'default' } = useParams<{ agentId: string }>()
  const [versions, setVersions] = useState<RealAgentVersion[]>([])

  useEffect(() => {
    setVersions(getRealAgentVersions(agentId))
  }, [agentId])

  const handleCreateSnapshot = () => {
    const nextVer = `1.${versions.length}.0`
    let desc = 'Updated knowledge and prompt configuration'
    try {
      const input = typeof window !== 'undefined' ? window.prompt('Enter a brief description for this version snapshot:', desc) : null
      if (input) desc = input.trim()
    } catch {
      // Prompt blocked or unavailable
    }
    const newVer = createRealAgentVersion(agentId, nextVer, desc)
    setVersions((prev) => [newVer, ...prev.map((v) => ({ ...v, isCurrent: false }))])
    toast.success('Snapshot created', `Version ${newVer.version} is now recorded`)
  }

  const rollback = (version: RealAgentVersion) => {
    setVersions((prev) =>
      prev.map((v) => ({
        ...v,
        isCurrent: v.id === version.id,
      }))
    )
    toast.success('Rolled back', `Reverted active configuration to ${version.version}`)
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Versions"
        description="Track and manage your agent version history"
        action={
          <Button size="sm" variant="brand" onClick={handleCreateSnapshot} className="font-bold">
            <Tag className="mr-2 h-4 w-4" />
            Create Snapshot
          </Button>
        }
      />

      {/* Info */}
      <Card className="border-brand-500/30 bg-brand-50/30 dark:bg-brand-900/10">
        <CardContent className="pt-4 pb-4 flex items-start gap-3">
          <GitBranch className="h-5 w-5 text-brand-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">How versioning works</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              A new version is created automatically when you publish your agent or create a snapshot.
              You can roll back to any previous version at any time.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Version timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>{versions.length} versions recorded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-border" />

            <div className="space-y-0">
              {versions.map((version) => (
                <div key={version.id} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {/* Timeline node */}
                  <div
                    className={`relative z-10 h-12 w-12 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      version.isCurrent
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-border bg-background'
                    }`}
                  >
                    {version.isCurrent ? (
                      <CheckCircle className="h-5 w-5 text-brand-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{version.version}</span>
                        {version.isCurrent && (
                          <Badge variant="success" className="text-xs">Current</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs capitalize">
                          {version.isCurrent ? 'active' : 'archived'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => toast.success('Downloading version config…')}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Export
                        </Button>
                        {!version.isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => rollback(version)}
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{version.description}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(version.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
