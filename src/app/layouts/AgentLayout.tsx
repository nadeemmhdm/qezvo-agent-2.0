import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, FileText, Globe, Map, Clipboard,
  MessageSquare, Cpu, Paintbrush, Code, Shield, Share2, GitBranch, Rocket,
  ArrowLeft, MoreHorizontal, ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/misc'
import { useAgent } from '@/features/agents/hooks/useAgent'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const agentNavItems = [
  { to: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { to: 'knowledge', icon: BookOpen, label: 'Knowledge' },
  { to: 'files', icon: FileText, label: 'Files', sub: true },
  { to: 'websites', icon: Globe, label: 'Websites', sub: true },
  { to: 'sitemap', icon: Map, label: 'Sitemap', sub: true },
  { to: 'clipboard', icon: Clipboard, label: 'Clipboard', sub: true },
  { to: 'test', icon: MessageSquare, label: 'Test' },
  { to: 'model', icon: Cpu, label: 'AI Model' },
  { to: 'customize', icon: Paintbrush, label: 'Customize' },
  { to: 'widget', icon: Code, label: 'Widget' },
  { to: 'security', icon: Shield, label: 'Security' },
  { to: 'sharing', icon: Share2, label: 'Sharing' },
  { to: 'versions', icon: GitBranch, label: 'Versions' },
  { to: 'publish', icon: Rocket, label: 'Publish' },
]

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'info' | 'destructive' | 'secondary'> = {
  published: 'success',
  ready: 'info',
  training: 'warning',
  draft: 'secondary',
  unpublished: 'secondary',
  failed: 'destructive',
}

export default function AgentLayout() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { data: agent, isLoading } = useAgent(agentId!)

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Agent Sidebar ── */}
      <aside className="w-52 border-r bg-background shrink-0 flex flex-col overflow-y-auto">
        {/* Back button */}
        <div className="p-3 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => navigate('/app/agents')}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All agents
          </Button>
        </div>

        {/* Agent info */}
        <div className="p-3 border-b">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ) : agent ? (
            <div>
              <div className="flex items-start justify-between gap-1">
                <p className="text-sm font-semibold truncate">{agent.name}</p>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon-sm" variant="ghost" className="h-5 w-5 shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {agent.status === 'published' && (
                      <DropdownMenuItem onClick={() => window.open(`/a/${agent.slug}`, '_blank')}>
                        <ExternalLink className="h-4 w-4" /> View public page
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive>
                      Delete agent
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Badge
                variant={statusBadgeVariant[agent.status] ?? 'secondary'}
                className="mt-1 text-xs capitalize"
              >
                {agent.status}
              </Badge>
            </div>
          ) : null}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {agentNavItems.map(({ to, icon: Icon, label, sub }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors',
                  sub && 'ml-3 pl-2',
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
