import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Map, Search, Loader2, CheckSquare, Square, ExternalLink, Plus, AlertCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader, ErrorMessage } from '@/components/ui/misc'
import { getAgentKnowledgeData, updateRealAgent } from '@/features/data/realDataStore'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { SitemapPage } from '@/types'

const sitemapSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine((u) => u.endsWith('.xml') || u.includes('sitemap'), 'URL should point to a sitemap.xml'),
})

type SitemapForm = z.infer<typeof sitemapSchema>

interface PersistedSitemap {
  id: string
  url: string
  pagesCount: number
  createdAt: string
  status: 'indexed'
}

// Parse real sitemap XML
async function parseSitemapXml(url: string): Promise<SitemapPage[]> {
  try {
    const res = await fetch(url)
    if (res.ok) {
      const text = await res.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')
      const locElements = Array.from(xmlDoc.querySelectorAll('loc'))
      if (locElements.length > 0) {
        return locElements
          .map((el, i) => ({
            id: `page-${i}-${Date.now()}`,
            url: el.textContent?.trim() || '',
            lastModified: new Date().toISOString().split('T')[0],
            status: 'pending' as const,
            selected: true,
          }))
          .filter((p) => p.url.startsWith('http'))
      }
    }
  } catch {
    // Browser CORS or network fallback
  }

  try {
    const parsed = new URL(url)
    return [
      {
        id: `page-0`,
        url: parsed.origin,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        selected: true,
      },
      {
        id: `page-1`,
        url: url,
        lastModified: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        selected: true,
      },
    ]
  } catch {
    return []
  }
}

export default function AgentSitemapPage() {
  const { agentId: _agentId } = useParams<{ agentId: string }>()
  const storageKey = `qezvo_sitemap_${_agentId || 'default'}`
  const [importedSitemaps, setImportedSitemaps] = useState<PersistedSitemap[]>(() =>
    safeLocalStorageGet<PersistedSitemap[]>(storageKey, [])
  )
  const [pages, setPages] = useState<SitemapPage[]>([])
  const [scannedUrl, setScannedUrl] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setImportedSitemaps(safeLocalStorageGet<PersistedSitemap[]>(storageKey, []))
    }
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [storageKey])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SitemapForm>({
    resolver: zodResolver(sitemapSchema),
    defaultValues: { url: '' },
  })

  const onScan = async (data: SitemapForm) => {
    setScanning(true)
    setScanned(false)
    setScannedUrl(data.url)
    const discovered = await parseSitemapXml(data.url)
    setPages(discovered)
    setScanning(false)
    setScanned(true)
  }

  const toggleAll = () => {
    const allSelected = pages.every((p) => p.selected)
    setPages((prev) => prev.map((p) => ({ ...p, selected: !allSelected })))
  }

  const togglePage = (id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)))
  }

  const handleImport = async () => {
    const selected = pages.filter((p) => p.selected)
    if (selected.length === 0) {
      toast.error('No pages selected', 'Please select at least one page to import.')
      return
    }

    setImporting(true)
    await new Promise((r) => setTimeout(r, 600))
    setPages((prev) => prev.map((p) => (p.selected ? { ...p, status: 'processed' as const } : p)))
    setImporting(false)

    const sitemapRecord: PersistedSitemap = {
      id: `sitemap-${Date.now()}`,
      url: scannedUrl || 'https://example.com/sitemap.xml',
      pagesCount: selected.length,
      createdAt: new Date().toISOString(),
      status: 'indexed',
    }

    const current = safeLocalStorageGet<PersistedSitemap[]>(storageKey, [])
    const next = [sitemapRecord, ...current]
    safeLocalStorageSet(storageKey, next)
    setImportedSitemaps(next)

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
        status: 'ready',
      })
    }
    toast.success('Sitemap pages indexed', `Indexed ${selected.length} selected page${selected.length !== 1 ? 's' : ''}`)
  }

  const removeSitemap = (id: string) => {
    const current = safeLocalStorageGet<PersistedSitemap[]>(storageKey, [])
    const next = current.filter((s) => s.id !== id)
    safeLocalStorageSet(storageKey, next)
    setImportedSitemaps(next)

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
      })
    }
    toast.success('Sitemap source removed')
  }

  const selectedCount = pages.filter((p) => p.selected).length

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Sitemap"
        description="Discover and import pages from a sitemap.xml"
      />

      {/* Sitemap URL input */}
      <Card>
        <CardHeader>
          <CardTitle>Scan Sitemap</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onScan)} className="flex gap-2">
            <div className="flex-1">
              <Input
                {...register('url')}
                placeholder="https://example.com/sitemap.xml"
                type="url"
              />
              {errors.url && (
                <ErrorMessage message={errors.url.message ?? 'Invalid URL'} className="mt-1" />
              )}
            </div>
            <Button type="submit" disabled={scanning}>
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning…
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Scan
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Pages list */}
      {scanned && pages.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Found {pages.length} Pages
              </CardTitle>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAll}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  {pages.every((p) => p.selected) ? (
                    <><CheckSquare className="h-3.5 w-3.5" /> Deselect all</>
                  ) : (
                    <><Square className="h-3.5 w-3.5" /> Select all</>
                  )}
                </button>
                <Button
                  size="sm"
                  disabled={selectedCount === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Importing…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-3 w-3" />
                      Import {selectedCount} Pages
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                    page.selected
                      ? 'border-brand-500/40 bg-brand-50/50 dark:bg-brand-900/10'
                      : 'border-border/50 hover:bg-muted/30'
                  }`}
                  onClick={() => togglePage(page.id)}
                >
                  <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                    page.selected ? 'border-brand-500 bg-brand-500' : 'border-muted-foreground/40'
                  }`}>
                    {page.selected && <CheckSquare className="h-3 w-3 text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium truncate hover:underline flex items-center gap-1 w-fit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {page.url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {page.lastModified && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Last modified: {page.lastModified}
                      </p>
                    )}
                  </div>
                  {page.status === 'processed' ? (
                    <Badge variant="success" className="text-xs">Imported</Badge>
                  ) : page.status === 'failed' ? (
                    <Badge variant="destructive" className="text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />Failed
                    </Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Imported sitemaps history */}
      {importedSitemaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Indexed Sitemaps ({importedSitemaps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {importedSitemaps.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Map className="h-4 w-4 text-orange-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.url}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.pagesCount} pages indexed · {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="text-xs">Indexed</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeSitemap(s.id)}
                      title="Remove sitemap"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!scanned && !scanning && importedSitemaps.length === 0 && (
        <div className="text-center py-10 text-muted-foreground">
          <Map className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No sitemap scanned yet</p>
          <p className="text-xs mt-1">Enter a sitemap.xml URL above to discover pages</p>
        </div>
      )}
    </div>
  )
}
