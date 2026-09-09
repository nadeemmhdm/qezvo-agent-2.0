import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ClipboardCopy, Loader2, Plus, Trash2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import { updateRealAgent, getAgentKnowledgeData } from '@/features/data/realDataStore'
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils'

const clipboardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(5, 'Content must be at least 5 characters'),
})

type ClipboardForm = z.infer<typeof clipboardSchema>

interface ClipboardEntry {
  id: string
  title: string
  content: string
  wordCount: number
  status: 'indexed' | 'processing'
  createdAt: string
}

export default function AgentClipboardPage() {
  const { agentId: _agentId } = useParams<{ agentId: string }>()
  const storageKey = `qezvo_clipboard_${_agentId || 'default'}`
  const [entries, setEntries] = useState<ClipboardEntry[]>(() =>
    safeLocalStorageGet<ClipboardEntry[]>(storageKey, [])
  )
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const handleUpdate = () => {
      setEntries(safeLocalStorageGet<ClipboardEntry[]>(storageKey, []))
    }
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [storageKey])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClipboardForm>({
    resolver: zodResolver(clipboardSchema),
    defaultValues: { title: '', content: '' },
  })

  const contentValue = watch('content', '')
  const wordCount = contentValue.trim().split(/\s+/).filter(Boolean).length

  const onSubmit = async (data: ClipboardForm) => {
    const entry: ClipboardEntry = {
      id: `${Date.now()}`,
      title: data.title.trim(),
      content: data.content.trim(),
      wordCount: data.content.trim().split(/\s+/).filter(Boolean).length,
      status: 'indexed',
      createdAt: new Date().toISOString(),
    }

    // Save immediately so state is never lost even on instant navigation
    const current = safeLocalStorageGet<ClipboardEntry[]>(storageKey, [])
    const next = [entry, ...current]
    safeLocalStorageSet(storageKey, next)
    setEntries(next)
    reset()
    setShowForm(false)

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
        status: 'ready',
      })
    }

    toast.success('Text indexed', `"${data.title}" has been added to your knowledge base`)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setValue('content', text, { shouldValidate: true, shouldDirty: true })
        const currentTitle = watch('title')
        if (!currentTitle) {
          const autoTitle = text.slice(0, 35).replace(/[\r\n]+/g, ' ').trim() || 'Pasted Content'
          setValue('title', autoTitle, { shouldValidate: true })
        }
        toast.info('Clipboard pasted', 'Text has been pasted into the content field')
      }
    } catch {
      toast.error('Cannot access clipboard', 'Please paste manually using Ctrl+V / Cmd+V')
    }
  }

  const removeEntry = (id: string) => {
    const current = safeLocalStorageGet<ClipboardEntry[]>(storageKey, [])
    const updated = current.filter((e) => e.id !== id)
    safeLocalStorageSet(storageKey, updated)
    setEntries(updated)

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
      })
    }
    toast.success('Entry removed')
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Clipboard / Text"
        description="Paste any text directly to use as knowledge"
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Text
          </Button>
        }
      />

      {/* Add form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add Text Knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor="clipboard-title">
                  Title
                </label>
                <Input
                  id="clipboard-title"
                  {...register('title')}
                  placeholder="e.g. Product FAQ, Company Policies, etc."
                  autoFocus
                />
                {errors.title && (
                  <p className="text-xs text-destructive">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" htmlFor="clipboard-content">
                    Content
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {wordCount} word{wordCount !== 1 ? 's' : ''}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={handlePaste}
                    >
                      <ClipboardCopy className="mr-1 h-3 w-3" />
                      Paste
                    </Button>
                  </div>
                </div>
                <textarea
                  id="clipboard-content"
                  {...register('content')}
                  placeholder="Paste or type your text here…"
                  className="flex min-h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
                />
                {errors.content && (
                  <p className="text-xs text-destructive">{errors.content.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { reset(); setShowForm(false) }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Knowledge
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Entries list */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Text Entries ({entries.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                >
                  <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{entry.title}</p>
                      <Badge variant={entry.status === 'indexed' ? 'success' : 'warning'}>
                        {entry.status === 'indexed' ? 'Indexed' : 'Processing…'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {entry.content.slice(0, 120)}…
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {entry.wordCount} words · {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {entries.length === 0 && !showForm && (
        <div className="text-center py-12 text-muted-foreground">
          <ClipboardCopy className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No text entries yet</p>
          <p className="text-xs mt-1">
            Paste FAQs, product descriptions, policies, or any text to train your agent
          </p>
          <Button size="sm" className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Entry
          </Button>
        </div>
      )}
    </div>
  )
}
