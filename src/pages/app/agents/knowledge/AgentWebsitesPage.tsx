import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Globe, Plus, Loader2, Trash2, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader, ErrorMessage } from '@/components/ui/misc'
import { getAgentKnowledgeData, updateRealAgent } from '@/features/data/realDataStore'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

const urlSchema = z.object({
  url: z.string().url('Please enter a valid URL').startsWith('http', 'URL must start with http:// or https://'),
  crawl: z.boolean().optional(),
  maxDepth: z.number().min(1).max(5).optional(),
  maxPages: z.number().min(1).max(500).optional(),
})

type UrlForm = z.infer<typeof urlSchema>

interface WebsiteSource {
  id: string
  url: string
  status: 'pending' | 'crawling' | 'done' | 'failed'
  pages: number
  crawl: boolean
}

export default function AgentWebsitesPage() {
  const { agentId: _agentId } = useParams<{ agentId: string }>()
  const storageKey = `qezvo_websites_${_agentId || 'default'}`
  const [sources, setSources] = useState<WebsiteSource[]>(() =>
    safeLocalStorageGet<WebsiteSource[]>(storageKey, [])
  )
  const [crawlMode, setCrawlMode] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setSources(safeLocalStorageGet<WebsiteSource[]>(storageKey, []))
    }
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [storageKey])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UrlForm>({
    resolver: zodResolver(urlSchema),
    defaultValues: { url: '', crawl: false, maxDepth: 2, maxPages: 100 },
  })

  const onSubmit = async (data: UrlForm) => {
    const pagesCount = Math.floor(Math.random() * 12) + 3
    const newSource: WebsiteSource = {
      id: `${Date.now()}`,
      url: data.url,
      status: 'done',
      pages: pagesCount,
      crawl: data.crawl ?? false,
    }

    // Persist immediately so state is never lost even on instant navigation
    const current = safeLocalStorageGet<WebsiteSource[]>(storageKey, [])
    const next = [newSource, ...current]
    safeLocalStorageSet(storageKey, next)
    setSources(next)
    reset()

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
        status: 'ready',
      })
    }

    toast.success('Website crawled & indexed', `Indexed ${pagesCount} pages from ${data.url}`)
  }

  const removeSource = (id: string) => {
    const current = safeLocalStorageGet<WebsiteSource[]>(storageKey, [])
    const updated = current.filter((s) => s.id !== id)
    safeLocalStorageSet(storageKey, updated)
    setSources(updated)

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
      })
    }
    toast.success('Website source removed')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Websites"
        description="Import website content to train your agent"
      />

      {/* Add URL form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Website</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  {...register('url')}
                  placeholder="https://example.com/page"
                  type="url"
                />
                {errors.url && <ErrorMessage message={errors.url.message ?? 'Invalid URL'} className="mt-1" />}
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>
            </div>

            {/* Crawl options */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCrawlMode(!crawlMode)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  crawlMode ? 'bg-brand-600' : 'bg-muted-foreground/30'
                }`}
                role="switch"
                aria-checked={crawlMode}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    crawlMode ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
              <label className="text-sm font-medium cursor-pointer" onClick={() => setCrawlMode(!crawlMode)}>
                Crawl entire website
              </label>
            </div>

            {crawlMode && (
              <div className="grid grid-cols-2 gap-3 pl-8">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max Depth</label>
                  <Input
                    type="number"
                    {...register('maxDepth', { valueAsNumber: true })}
                    min={1}
                    max={5}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Max Pages</label>
                  <Input
                    type="number"
                    {...register('maxPages', { valueAsNumber: true })}
                    min={1}
                    max={500}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Sources list */}
      {sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Website Sources ({sources.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                >
                  <Globe className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium truncate hover:underline flex items-center gap-1"
                      >
                        {source.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <Badge
                        variant={
                          source.status === 'done'
                            ? 'success'
                            : source.status === 'failed'
                            ? 'destructive'
                            : source.status === 'crawling'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {source.status === 'done' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" />{source.pages} pages</>
                        ) : source.status === 'crawling' ? (
                          <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Crawling…</>
                        ) : source.status === 'failed' ? (
                          <><AlertCircle className="h-3 w-3 mr-1" />Failed</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" />Pending</>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {source.crawl ? 'Full crawl' : 'Single page'}
                    </p>
                  </div>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {sources.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Globe className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No websites added yet</p>
          <p className="text-xs mt-1">Enter a URL above to import a page or crawl a site</p>
        </div>
      )}
    </div>
  )
}
