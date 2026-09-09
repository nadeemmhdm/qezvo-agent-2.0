import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FileText, Globe, Map, ClipboardCopy, Plus, TrendingUp, Trash2, CheckCircle2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import { getAgentKnowledgeData, deleteAgentKnowledgeSource, type RealKnowledgeSourceItem } from '@/features/data/realDataStore'

export default function AgentKnowledgePage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const [knowledge, setKnowledge] = useState(() => getAgentKnowledgeData(agentId || ''))

  const refreshData = () => {
    if (agentId) {
      setKnowledge(getAgentKnowledgeData(agentId))
    }
  }

  useEffect(() => {
    refreshData()
    const handleUpdate = () => refreshData()
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [agentId])

  const handleDelete = (item: RealKnowledgeSourceItem) => {
    if (!agentId) return
    deleteAgentKnowledgeSource(agentId, item.id, item.type)
    refreshData()
    toast.success('Knowledge source removed', `"${item.title}" was deleted.`)
  }

  const knowledgeSources = [
    {
      icon: FileText,
      label: 'Files & Documents',
      description: 'Upload PDFs, Word docs, Excel sheets, CSVs, and more',
      href: 'files',
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      count: knowledge.filesCount,
    },
    {
      icon: Globe,
      label: 'Websites',
      description: 'Import and crawl entire websites or individual pages',
      href: 'websites',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      count: knowledge.websitesCount,
    },
    {
      icon: Map,
      label: 'Sitemap',
      description: 'Scan a sitemap.xml to discover and import all pages',
      href: 'sitemap',
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      count: knowledge.sitemapsCount,
    },
    {
      icon: ClipboardCopy,
      label: 'Clipboard / Text',
      description: 'Paste any text directly to use as knowledge',
      href: 'clipboard',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      count: knowledge.clipboardsCount,
    },
  ]

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'website':
        return <Globe className="h-4 w-4 text-green-500" />
      case 'sitemap':
        return <Map className="h-4 w-4 text-orange-500" />
      default:
        return <ClipboardCopy className="h-4 w-4 text-purple-500" />
    }
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Knowledge Base"
        description="Add knowledge sources to train your agent with your real data"
        action={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate(`/app/agents/${agentId}/clipboard`)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Knowledge
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Sources', value: String(knowledge.totalCount), icon: FileText },
          {
            label: 'Documents & URLs',
            value: String(knowledge.filesCount + knowledge.websitesCount + knowledge.sitemapsCount),
            icon: Globe,
          },
          {
            label: 'Estimated Chunks',
            value: knowledge.totalCount > 0 ? String(knowledge.totalCount * 14) : '0',
            icon: TrendingUp,
          },
          {
            label: 'Training Status',
            value: knowledge.totalCount > 0 ? 'Active & Ready' : 'Needs Data',
            icon: CheckCircle2,
          },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-lg font-bold leading-none">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Source types grid */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Add &amp; Manage Knowledge Sources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {knowledgeSources.map(({ icon: Icon, label, description, href, color, bg, count }) => (
            <Card
              key={href}
              className="group cursor-pointer hover:shadow-md hover:border-border/80 transition-all border-2 border-border"
              onClick={() => navigate(`/app/agents/${agentId}/${href}`)}
            >
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{label}</p>
                      <Badge variant={count > 0 ? 'success' : 'secondary'} className="text-xs font-bold font-mono">
                        {count} source{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All knowledge sources list / table */}
      <Card className="border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-black">All Indexed Knowledge Sources ({knowledge.totalCount})</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Trained content used by this agent to answer queries during test chat and widget conversations.
            </p>
          </div>
          {knowledge.totalCount > 0 && (
            <Badge variant="success" className="font-bold text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {knowledge.totalCount} Active Sources
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          {knowledge.items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">No knowledge sources added yet</p>
              <p className="text-xs mt-1 max-w-xs mx-auto">
                Add files, websites, or clipboard text to start training your agent.
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => navigate(`/app/agents/${agentId}/clipboard`)}
                >
                  <ClipboardCopy className="mr-1.5 h-4 w-4" />
                  Add Text Snippet
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/app/agents/${agentId}/websites`)}
                >
                  <Globe className="mr-1.5 h-4 w-4" />
                  Add Website URL
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y-2 divide-border border-2 border-border rounded-xl overflow-hidden">
              {knowledge.items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-muted border border-border shrink-0 mt-0.5">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">{item.title}</span>
                        <Badge variant="success" className="text-[10px] uppercase font-mono font-bold">
                          {item.status}
                        </Badge>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono font-bold">
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {item.detail} {item.sizeOrWords ? `• ${item.sizeOrWords}` : ''}
                      </p>
                      <span className="text-[10px] text-muted-foreground/80 font-mono">
                        Added: {new Date(item.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs font-bold hover:text-primary"
                      onClick={() => navigate(`/app/agents/${agentId}/${item.type === 'file' ? 'files' : item.type}`)}
                      title="Manage source"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      Manage
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 font-bold"
                      onClick={() => handleDelete(item)}
                      title="Delete source"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
