import { useNavigate } from 'react-router-dom'
import {
  Bot, BookOpen, Cpu, Activity, Plus, Globe, MessageSquare,
  ArrowRight, CheckCircle, Clock, AlertCircle, Loader2, BarChart2
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton, PageHeader } from '@/components/ui/misc'
import { formatRelativeTime, formatNumber } from '@/lib/utils'
import type { Agent, TrainingJob, UsageSummary } from '@/types'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'

// ── Stat Card ──
function StatCard({
  title, value, subtitle, icon: Icon, trend, loading
}: {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; positive: boolean }
  loading?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-3xl font-bold mt-1 tabular-nums">{value}</p>
            )}
            {subtitle && !loading && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend && !loading && (
              <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-green-600' : 'text-muted-foreground'}`}>
                {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-brand-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Agent Status Icon ──
function StatusIcon({ status }: { status: string }) {
  if (status === 'published') return <CheckCircle className="h-3.5 w-3.5 text-green-500" />
  if (status === 'training') return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
  if (status === 'failed') return <AlertCircle className="h-3.5 w-3.5 text-destructive" />
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
}

import { getRealDailyUsage, getRealAgents } from '@/features/data/realDataStore'

export default function DashboardPage() {
  const dailyUsage = getRealDailyUsage(7)
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: usage, isLoading: usageLoading } = useQuery({
    queryKey: ['usage-summary'],
    queryFn: () => apiGet<UsageSummary>('/usage/summary'),
    staleTime: 1000 * 60 * 5,
  })

  const localAgents = getRealAgents()

  const { data: rawRecentAgents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', 'recent'],
    queryFn: async () => {
      try {
        const res = await apiGet<any>('/agents?limit=5&sort=updated')
        if (res) {
          if (Array.isArray(res)) return res
          if (Array.isArray(res.items)) return res.items
        }
      } catch (err) {
        console.warn('Dashboard agents fetch error:', err)
      }
      return getRealAgents().slice(0, 5)
    },
    staleTime: 1000 * 30,
  })

  const recentAgents: Agent[] = Array.isArray(rawRecentAgents)
    ? rawRecentAgents
    : Array.isArray((rawRecentAgents as any)?.items)
    ? (rawRecentAgents as any).items
    : localAgents.slice(0, 5)

  const displayedAgents = recentAgents.length > 0 ? recentAgents : localAgents.slice(0, 5)
  const totalAgentsCount = (usage?.agentsCount && usage.agentsCount > 0) ? usage.agentsCount : localAgents.length
  const totalSourcesCount = (usage?.knowledgeSourcesCount && usage.knowledgeSourcesCount > 0)
    ? usage.knowledgeSourcesCount
    : localAgents.reduce((sum, a) => sum + (a.knowledgeSourceCount || 0), 0)

  const { data: recentJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['training-jobs', 'recent'],
    queryFn: () => apiGet<TrainingJob[]>('/training/jobs?limit=5&sort=created'),
    staleTime: 1000 * 60,
  })

  const firstName = user?.displayName?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 space-y-8 max-w-7xl">
      {/* Greeting */}
      <PageHeader
        title={`${greeting}, ${firstName} 👋`}
        description="Here's what's happening with your AI agents today."
        action={
          <Button onClick={() => navigate('/app/agents/new')} id="dashboard-create-agent-btn">
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Agents"
          value={totalAgentsCount}
          icon={Bot}
          loading={usageLoading}
        />
        <StatCard
          title="Knowledge Sources"
          value={totalSourcesCount}
          icon={BookOpen}
          loading={usageLoading}
        />
        <StatCard
          title="AI Requests"
          value={formatNumber(usage?.requestsThisMonth ?? 0)}
          subtitle="This month"
          icon={Cpu}
          trend={{ value: 12, positive: true }}
          loading={usageLoading}
        />
        <StatCard
          title="Storage Used"
          value={`${(usage?.storageUsedGb ?? 0).toFixed(2)} GB`}
          icon={Activity}
          loading={usageLoading}
        />
      </div>

      {/* Charts + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Requests This Week</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/analytics')}>
              <BarChart2 className="h-3.5 w-3.5 mr-1" /> View analytics
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={dailyUsage}>
                <defs>
                  <linearGradient id="requestGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(243 85% 58%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(243 85% 58%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="hsl(243 85% 58%)"
                  strokeWidth={2}
                  fill="url(#requestGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Create Agent', icon: Bot, action: () => navigate('/app/agents/new'), id: 'qa-create-agent' },
              { label: 'Upload Knowledge', icon: BookOpen, action: () => navigate('/app/agents'), id: 'qa-upload' },
              { label: 'Scan Website', icon: Globe, action: () => navigate('/app/agents'), id: 'qa-scan' },
              { label: 'Test Agent', icon: MessageSquare, action: () => navigate('/app/agents'), id: 'qa-test' },
            ].map(({ label, icon: Icon, action, id }) => (
              <Button
                key={label}
                variant="outline"
                className="w-full justify-start gap-2 text-sm h-9"
                onClick={action}
                id={id}
              >
                <Icon className="h-3.5 w-3.5 text-brand-500" />
                {label}
                <ArrowRight className="h-3 w-3 ml-auto text-muted-foreground" />
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Agents + Training Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Recent Agents</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/app/agents')}>
              View all <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {agentsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : displayedAgents?.length ? (
              displayedAgents.map((agent) => (
                <button
                  key={agent.id}
                  className="flex items-center gap-3 w-full py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                  onClick={() => navigate(`/app/agents/${agent.id}/overview`)}
                >
                  <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {agent.knowledgeSourceCount} source{agent.knowledgeSourceCount !== 1 ? 's' : ''} · {formatRelativeTime(agent.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <StatusIcon status={agent.status} />
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No agents yet</p>
                <Button size="sm" className="mt-3" onClick={() => navigate('/app/agents/new')}>
                  <Plus className="h-3.5 w-3.5" /> Create your first agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Training Jobs */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">Training Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {usage?.trainingJobsThisMonth ?? 0} this month
            </Badge>
          </CardHeader>
          <CardContent className="space-y-1">
            {jobsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3.5 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : recentJobs?.length ? (
              recentJobs.map((job) => (
                <div key={job.id} className="flex items-center gap-3 py-2 px-2 rounded-lg">
                  <div className="shrink-0">
                    {job.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : job.status === 'processing' ? (
                      <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                    ) : job.status === 'failed' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium capitalize">{job.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.chunkCount} chunks · {formatRelativeTime(job.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No training activity yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Training jobs appear when you add knowledge
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status Banner */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardContent className="pt-4 pb-4 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            All systems operational
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-green-700 dark:text-green-400 text-xs"
            onClick={() => window.open('/status', '_blank')}
          >
            Status page <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
