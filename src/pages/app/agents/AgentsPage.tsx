import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bot, Plus, Search, MoreHorizontal, Eye, Edit, Trash2, Copy,
  Globe, CheckCircle, Clock, Loader2, AlertCircle, Rocket, ExternalLink
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAgents, useDeleteAgent, useDuplicateAgent, usePublishAgent } from '@/features/agents/hooks/useAgents'
import { getRealAgents } from '@/features/data/realDataStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton, PageHeader, EmptyState } from '@/components/ui/misc'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils'
import type { Agent } from '@/types'

const statusConfig: Record<string, {
  label: string
  variant: 'success' | 'info' | 'warning' | 'secondary' | 'destructive'
  icon: LucideIcon
}> = {
  published: { label: 'Published', variant: 'success', icon: CheckCircle },
  ready: { label: 'Ready', variant: 'info', icon: CheckCircle },
  training: { label: 'Training…', variant: 'warning', icon: Loader2 },
  draft: { label: 'Draft', variant: 'secondary', icon: Clock },
  unpublished: { label: 'Unpublished', variant: 'secondary', icon: Clock },
  failed: { label: 'Failed', variant: 'destructive', icon: AlertCircle },
}

function AgentCard({ agent }: { agent: Agent }) {
  const navigate = useNavigate()
  const deleteAgent = useDeleteAgent(agent.id)
  const duplicateAgent = useDuplicateAgent(agent.id)
  const publishAgent = usePublishAgent(agent.id)

  const config = statusConfig[agent.status] ?? statusConfig.draft!
  const StatusIcon = config.icon
  const isTraining = agent.status === 'training'

  const handleDelete = async () => {
    if (!confirm(`Delete "${agent.name}"? This cannot be undone.`)) return
    await deleteAgent.mutateAsync()
    navigate('/app/agents')
  }

  return (
    <Card className="group hover:shadow-md hover:border-border/80 transition-all duration-200 overflow-hidden">
      {/* Card content */}
      <div
        className="p-5 cursor-pointer"
        onClick={() => navigate(`/app/agents/${agent.id}/overview`)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/agents/${agent.id}/overview`)}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
              {agent.avatarUrl ? (
                <img src={agent.avatarUrl} alt={agent.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                <Bot className="h-5 w-5 text-brand-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{agent.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">/{agent.slug}</p>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                size="icon-sm"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Agent actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/agents/${agent.id}/overview`) }}>
                <Edit className="h-4 w-4" /> Edit agent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/agents/${agent.id}/test`) }}>
                <Eye className="h-4 w-4" /> Test agent
              </DropdownMenuItem>
              {agent.status === 'published' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/a/${agent.slug}`, '_blank') }}>
                  <ExternalLink className="h-4 w-4" /> View public page
                </DropdownMenuItem>
              )}
              {['ready', 'draft', 'unpublished'].includes(agent.status) && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); publishAgent.mutate() }}>
                  <Rocket className="h-4 w-4" /> Publish agent
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); duplicateAgent.mutate() }}>
                <Copy className="h-4 w-4" /> Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={(e) => { e.stopPropagation(); handleDelete() }}>
                <Trash2 className="h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {agent.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{agent.description}</p>
        )}

        {/* Status + Stats */}
        <div className="flex items-center justify-between">
          <Badge variant={config.variant} className="gap-1 text-xs">
            <StatusIcon className={`h-3 w-3 ${isTraining ? 'animate-spin' : ''}`} />
            {config.label}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{agent.knowledgeSourceCount} source{agent.knowledgeSourceCount !== 1 ? 's' : ''}</span>
            <span>{formatRelativeTime(agent.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom quick actions */}
      <div className="border-t px-5 py-2.5 flex items-center gap-2 bg-muted/30">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/app/agents/${agent.id}/test`)}
        >
          <Eye className="h-3 w-3" /> Test
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => navigate(`/app/agents/${agent.id}/knowledge`)}
        >
          <Globe className="h-3 w-3" /> Knowledge
        </Button>
        {agent.status === 'published' && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs gap-1 text-muted-foreground hover:text-foreground ml-auto"
            onClick={() => window.open(`/a/${agent.slug}`, '_blank')}
          >
            <ExternalLink className="h-3 w-3" /> View live
          </Button>
        )}
      </div>
    </Card>
  )
}

function AgentCardSkeleton() {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-start gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </Card>
  )
}

export default function AgentsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { data, isLoading } = useAgents()

  const rawAgents: Agent[] = Array.isArray(data)
    ? data
    : Array.isArray((data as any)?.items)
    ? (data as any).items
    : getRealAgents()
  const agents: Agent[] = rawAgents.length > 0 ? rawAgents : getRealAgents()
  const filtered = search
    ? agents.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.description?.toLowerCase().includes(search.toLowerCase())
      )
    : agents

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <PageHeader
        title="My Agents"
        description={`${agents.length} agent${agents.length !== 1 ? 's' : ''} in your organization`}
        action={
          <Button onClick={() => navigate('/app/agents/new')} id="agents-create-btn">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        }
      />

      {/* Search */}
      {!isLoading && agents.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search agents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-sm rounded-lg border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            id="agents-search"
          />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <AgentCardSkeleton key={i} />)
          : filtered.length > 0
          ? filtered.map((agent) => <AgentCard key={agent.id} agent={agent} />)
          : search
          ? (
            <div className="col-span-full">
              <EmptyState
                icon={<Search className="h-5 w-5" />}
                title="No agents match your search"
                description={`No agents found for "${search}". Try a different search term.`}
                action={<Button variant="ghost" onClick={() => setSearch('')}>Clear search</Button>}
              />
            </div>
          ) : (
            <div className="col-span-full">
              <EmptyState
                icon={<Bot className="h-5 w-5" />}
                title="No agents yet"
                description="Create your first AI agent to start building intelligent experiences from your data."
                action={
                  <Button onClick={() => navigate('/app/agents/new')} id="agents-empty-create-btn">
                    <Plus className="h-4 w-4" />
                    Create your first agent
                  </Button>
                }
              />
            </div>
          )}
      </div>
    </div>
  )
}
