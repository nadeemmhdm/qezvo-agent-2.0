import { useParams } from 'react-router-dom'
import {
  Brain, FileText, Globe, ClipboardCopy, TrendingUp,
  CheckCircle, AlertCircle, Clock, Loader2, BookOpen, Map
} from 'lucide-react'
import { useAgent } from '@/features/agents/hooks/useAgent'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/misc'
import { getAgentKnowledgeData } from '@/features/data/realDataStore'

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  published: { label: 'Published', color: 'text-green-500', icon: CheckCircle },
  ready: { label: 'Ready', color: 'text-blue-500', icon: CheckCircle },
  training: { label: 'Training…', color: 'text-yellow-500', icon: Loader2 },
  draft: { label: 'Draft', color: 'text-muted-foreground', icon: Clock },
  unpublished: { label: 'Unpublished', color: 'text-muted-foreground', icon: Clock },
  failed: { label: 'Failed', color: 'text-destructive', icon: AlertCircle },
}

export default function AgentOverviewPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const { data: agent, isLoading } = useAgent(agentId!)
  const knowledge = agentId ? getAgentKnowledgeData(agentId) : null

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Agent not found</p>
      </div>
    )
  }

  const status = statusConfig[agent.status] ?? statusConfig.draft!
  const StatusIcon = status.icon

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-brand-600/10 flex items-center justify-center">
            <Brain className="h-7 w-7 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{agent.name}</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{agent.description || 'No description'}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusIcon className={`h-4 w-4 ${status.color} ${agent.status === 'training' ? 'animate-spin' : ''}`} />
              <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
              <span className="text-muted-foreground text-xs">·</span>
              <span className="text-xs text-muted-foreground">v{agent.currentVersion}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {agent.status === 'published' && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/a/${agent.slug}`} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                View Live
              </a>
            </Button>
          )}
          <Badge variant={agent.status === 'published' ? 'success' : 'secondary'}>
            {agent.status}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{knowledge ? knowledge.totalCount : agent.knowledgeSourceCount}</p>
                <p className="text-xs text-muted-foreground">Knowledge Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">v{agent.currentVersion}</p>
                <p className="text-xs text-muted-foreground">Current Version</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold capitalize">{agent.status}</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Knowledge Sources Quick View */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(!knowledge || knowledge.totalCount === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No knowledge sources added yet.</p>
                <p className="text-xs mt-1">Add files, websites, or clipboard text to train your agent.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {[
                  { icon: FileText, label: 'Files', count: knowledge.filesCount, color: 'text-blue-500' },
                  { icon: Globe, label: 'Websites', count: knowledge.websitesCount, color: 'text-green-500' },
                  { icon: Map, label: 'Sitemap', count: knowledge.sitemapsCount, color: 'text-orange-500' },
                  { icon: ClipboardCopy, label: 'Clipboard / Text', count: knowledge.clipboardsCount, color: 'text-purple-500' },
                ].map(({ icon: Icon, label, count, color }) => (
                  <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-sm font-semibold">{label}</span>
                    </div>
                    <span className="text-sm font-bold font-mono text-foreground">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Agent ID', value: agent.id },
              { label: 'Slug', value: agent.slug },
              { label: 'Language', value: agent.language.toUpperCase() },
              { label: 'Created', value: new Date(agent.createdAt).toLocaleDateString() },
              { label: 'Last Updated', value: new Date(agent.updatedAt).toLocaleDateString() },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="text-sm font-mono font-medium truncate">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
