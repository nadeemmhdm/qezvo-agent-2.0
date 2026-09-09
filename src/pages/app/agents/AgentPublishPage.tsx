import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAgent } from '@/features/agents/hooks/useAgent'
import { usePublishAgent, useUnpublishAgent } from '@/features/agents/hooks/useAgents'
import {
  Rocket, Globe, AlertTriangle, CheckCircle, Loader2,
  ExternalLink, ArrowLeft, Shield, Clock, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/misc'
import { updateRealAgent, getAgentKnowledgeData } from '@/features/data/realDataStore'

interface CheckItem {
  id: string
  label: string
  pass: boolean
  description: string
}

export default function AgentPublishPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { data: agent, isLoading } = useAgent(agentId!)
  const publishAgent = usePublishAgent(agentId!)
  const unpublishAgent = useUnpublishAgent(agentId!)
  const [confirmUnpublish, setConfirmUnpublish] = useState(false)

  const isPublished = agent?.status === 'published'

  const [knowledgeData, setKnowledgeData] = useState(() => (agentId ? getAgentKnowledgeData(agentId) : null))

  useEffect(() => {
    if (!agentId) return
    const update = () => setKnowledgeData(getAgentKnowledgeData(agentId))
    update()
    window.addEventListener('storage', update)
    return () => window.removeEventListener('storage', update)
  }, [agentId])

  const totalKnowledgeCount = Math.max(agent?.knowledgeSourceCount ?? 0, knowledgeData?.totalCount ?? 0)

  // Sync knowledge source count to real agent if not yet persisted
  useEffect(() => {
    if (agentId && totalKnowledgeCount > (agent?.knowledgeSourceCount ?? 0)) {
      updateRealAgent(agentId, {
        knowledgeSourceCount: totalKnowledgeCount,
        status: agent?.status === 'draft' ? 'ready' : agent?.status,
      })
    }
  }, [agentId, totalKnowledgeCount, agent?.knowledgeSourceCount, agent?.status])

  // Pre-publish checks
  const checks: CheckItem[] = [
    {
      id: 'name',
      label: 'Agent has a name',
      pass: !!agent?.name,
      description: 'Your agent needs a name before publishing',
    },
    {
      id: 'knowledge',
      label: totalKnowledgeCount > 0
        ? `Knowledge base configured (${totalKnowledgeCount} source${totalKnowledgeCount === 1 ? '' : 's'})`
        : 'Knowledge base configured',
      pass: totalKnowledgeCount > 0,
      description: totalKnowledgeCount > 0
        ? `${totalKnowledgeCount} knowledge source(s) trained & indexed`
        : 'Add at least one knowledge source (Clipboard, Files, Websites, or Sitemap) to train your agent',
    },
    {
      id: 'status',
      label: 'Training complete',
      pass: agent?.status !== 'training' && agent?.status !== 'failed',
      description: 'Wait for training to complete before publishing',
    },
    {
      id: 'model',
      label: 'Model configured',
      pass: true, // default model is always set
      description: 'An AI model must be selected',
    },
  ]

  const allChecksPassed = checks.every((c) => c.pass)
  const failedChecks = checks.filter((c) => !c.pass)

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Rocket className="h-5 w-5 text-brand-500" />
            Publish Agent
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isPublished ? 'Your agent is live and accessible' : 'Make your agent available to users'}
          </p>
        </div>
        {isPublished && (
          <Badge variant="success" className="ml-auto">
            <Globe className="h-3 w-3 mr-1" />
            Live
          </Badge>
        )}
      </div>

      {/* Live Agent Card (if published) */}
      {isPublished && (
        <Card className="border-green-500/30 bg-green-50/30 dark:bg-green-900/10">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{agent?.name} is live!</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Users can now interact with your agent at:
                  </p>
                  <a
                    href={`/a/${agent?.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-brand-600 hover:underline flex items-center gap-1 mt-1"
                  >
                    qezvo.in/a/{agent?.slug}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive/30 text-destructive hover:bg-destructive/5 shrink-0"
                onClick={() => setConfirmUnpublish(true)}
              >
                Unpublish
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unpublish confirmation */}
      {confirmUnpublish && (
        <Card className="border-destructive/40">
          <CardContent className="pt-5 pb-5 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">Unpublish this agent?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will immediately take your agent offline. Users will no longer be able to
                  access it via the public URL or widget embeds.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                disabled={unpublishAgent.isPending}
                onClick={() => {
                  unpublishAgent.mutate()
                  setConfirmUnpublish(false)
                }}
              >
                {unpublishAgent.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Confirm Unpublish'
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmUnpublish(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pre-publish checklist */}
      {!isPublished && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pre-publish Checklist</CardTitle>
              <CardDescription>
                Resolve all issues before publishing your agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {checks.map((check) => (
                  <div key={check.id} className="flex items-start gap-3 py-2 border-b border-border/40 last:border-0">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      check.pass
                        ? 'bg-green-500/15 text-green-500'
                        : 'bg-destructive/15 text-destructive'
                    }`}>
                      {check.pass ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${check.pass ? '' : 'text-destructive'}`}>
                        {check.label}
                      </p>
                      {!check.pass && (
                        <p className="text-xs text-muted-foreground mt-0.5">{check.description}</p>
                      )}
                    </div>
                    {check.pass && (
                      <Badge variant="success" className="ml-auto text-xs">Pass</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Failed checks summary */}
          {failedChecks.length > 0 && (
            <Card className="border-yellow-500/30 bg-yellow-50/30 dark:bg-yellow-900/10">
              <CardContent className="pt-4 pb-4 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Resolve {failedChecks.length} issue{failedChecks.length !== 1 ? 's' : ''} before publishing.
                </p>
              </CardContent>
            </Card>
          )}

          {/* What happens when published */}
          <Card>
            <CardHeader>
              <CardTitle>What happens when you publish?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { icon: Globe, label: 'Public URL created', description: 'A shareable link is generated for your agent' },
                  { icon: Zap, label: 'Widget embed enabled', description: 'Your agent can be embedded on any website' },
                  { icon: Shield, label: 'Security applied', description: 'Your configured rate limits and access controls are enforced' },
                  { icon: Clock, label: 'Version snapshot saved', description: 'Current configuration is saved as a version' },
                ].map(({ icon: Icon, label, description }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4 text-brand-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publish button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-10 gap-2"
              disabled={!allChecksPassed || publishAgent.isPending}
              onClick={() => publishAgent.mutate()}
            >
              {publishAgent.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Publishing…
                </>
              ) : (
                <>
                  <Rocket className="h-5 w-5" />
                  Publish Agent
                </>
              )}
            </Button>
          </div>
          {!allChecksPassed && (
            <p className="text-center text-xs text-muted-foreground">
              Complete the checklist above to enable publishing
            </p>
          )}
        </>
      )}
    </div>
  )
}
