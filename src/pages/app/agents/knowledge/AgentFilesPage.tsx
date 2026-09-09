import { useState, useCallback, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import {
  FileText, Upload, CheckCircle, AlertCircle, Loader2,
  File, FileSpreadsheet, FileImage, Trash2, RefreshCw
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/misc'
import { cn, safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { analyzeAndIndexFileWithSupabase, type AnalysisResult } from '@/lib/supabaseStorage'
import { getAgentKnowledgeData, updateRealAgent } from '@/features/data/realDataStore'

type UploadStatus = 'pending' | 'uploading' | 'processing' | 'done' | 'error'

interface PersistedFile {
  id: string
  name: string
  size: number
  mimeType: string
  status: UploadStatus
  progress: number
  uploadedAt: string
  analysis?: AnalysisResult
}

interface UploadFileItem {
  id: string
  name: string
  size: number
  mimeType: string
  file?: File
  status: UploadStatus
  progress: number
  error?: string
  analysis?: AnalysisResult
  uploadedAt: string
}

const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/csv': ['.csv'],
  'text/plain': ['.txt', '.md'],
  'application/json': ['.json'],
  'text/html': ['.html'],
  'application/xml': ['.xml'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
}

function getFileIcon(mimeType: string) {
  if (mimeType.includes('pdf')) return { Icon: FileText, color: 'text-red-500' }
  if (mimeType.includes('sheet') || mimeType.includes('csv') || mimeType.includes('excel'))
    return { Icon: FileSpreadsheet, color: 'text-green-500' }
  if (mimeType.includes('image')) return { Icon: FileImage, color: 'text-purple-500' }
  return { Icon: File, color: 'text-blue-500' }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function statusBadge(status: UploadStatus) {
  switch (status) {
    case 'done':
      return <Badge variant="success">Indexed</Badge>
    case 'processing':
      return <Badge variant="warning">Processing</Badge>
    case 'uploading':
      return <Badge variant="info">Uploading</Badge>
    case 'error':
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="secondary">Pending</Badge>
  }
}

export default function AgentFilesPage() {
  const { agentId: _agentId } = useParams<{ agentId: string }>()
  const storageKey = `qezvo_files_${_agentId || 'default'}`
  const [files, setFiles] = useState<UploadFileItem[]>(() => {
    const saved = safeLocalStorageGet<PersistedFile[]>(storageKey, [])
    return saved.map((s) => ({
      id: s.id,
      name: s.name,
      size: s.size,
      mimeType: s.mimeType,
      status: s.status,
      progress: s.progress,
      analysis: s.analysis,
      uploadedAt: s.uploadedAt,
    }))
  })

  useEffect(() => {
    const handleUpdate = () => {
      const saved = safeLocalStorageGet<PersistedFile[]>(storageKey, [])
      setFiles((prev) => {
        // preserve any active in-flight uploads with file object
        const inFlight = prev.filter((p) => p.status === 'uploading' || p.status === 'processing')
        const merged = saved.map((s) => ({
          id: s.id,
          name: s.name,
          size: s.size,
          mimeType: s.mimeType,
          status: s.status,
          progress: s.progress,
          analysis: s.analysis,
          uploadedAt: s.uploadedAt,
        }))
        return [...inFlight, ...merged.filter((m) => !inFlight.some((f) => f.id === m.id))]
      })
    }
    window.addEventListener('storage', handleUpdate)
    return () => window.removeEventListener('storage', handleUpdate)
  }, [storageKey])

  const handleFileUpload = useCallback(
    async (uploadFile: UploadFileItem) => {
      if (!uploadFile.file) return

      setFiles((prev) =>
        prev.map((f) => (f.id === uploadFile.id ? { ...f, status: 'uploading', progress: 15 } : f))
      )

      try {
        const result = await analyzeAndIndexFileWithSupabase(
          uploadFile.file,
          _agentId || 'default',
          (progress, stage) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id
                  ? {
                      ...f,
                      progress,
                      status: stage === 'uploading' ? 'uploading' : stage === 'indexed' ? 'done' : 'processing',
                    }
                  : f
              )
            )
          }
        )

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'done', progress: 100, analysis: result }
              : f
          )
        )

        // Persist to localStorage
        const persistedRecord: PersistedFile = {
          id: uploadFile.id,
          name: uploadFile.name,
          size: uploadFile.size,
          mimeType: uploadFile.mimeType,
          status: 'done',
          progress: 100,
          analysis: result,
          uploadedAt: new Date().toISOString(),
        }
        const currentSaved = safeLocalStorageGet<PersistedFile[]>(storageKey, [])
        const nextSaved = [persistedRecord, ...currentSaved.filter((f) => f.id !== persistedRecord.id)]
        safeLocalStorageSet(storageKey, nextSaved)

        if (_agentId) {
          const knowledge = getAgentKnowledgeData(_agentId)
          updateRealAgent(_agentId, {
            knowledgeSourceCount: knowledge.totalCount,
            status: 'ready',
          })
        }

        toast.success(
          'File indexed & Storage cleared',
          `"${uploadFile.name}" indexed (${result.wordCount} words). Temp file auto-deleted from Supabase.`
        )
      } catch (err) {
        console.error('File analysis error:', err)
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: 'error', error: 'Failed to process file.' }
              : f
          )
        )
        toast.error('Upload notice', 'Failed to analyze file.')
      }
    },
    [_agentId, storageKey]
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newFiles: UploadFileItem[] = accepted.map((file) => ({
        id: `${file.name}-${Date.now()}`,
        name: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        file,
        status: 'pending',
        progress: 0,
        uploadedAt: new Date().toISOString(),
      }))

      setFiles((prev) => [...prev, ...newFiles])

      // Start upload and analysis pipeline for each file
      newFiles.forEach((f) => handleFileUpload(f))
    },
    [handleFileUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (rejected) => {
      rejected.forEach(({ file, errors }) => {
        const msg = errors[0]?.code === 'file-too-large'
          ? `"${file.name}" is too large. Max 50MB.`
          : `"${file.name}" is not a supported file type.`
        toast.error('Upload failed', msg)
      })
    },
  })

  const removeFile = (id: string) => {
    const currentSaved = safeLocalStorageGet<PersistedFile[]>(storageKey, [])
    const nextSaved = currentSaved.filter((f) => f.id !== id)
    safeLocalStorageSet(storageKey, nextSaved)
    setFiles((prev) => prev.filter((f) => f.id !== id))

    if (_agentId) {
      const knowledge = getAgentKnowledgeData(_agentId)
      updateRealAgent(_agentId, {
        knowledgeSourceCount: knowledge.totalCount,
      })
    }
    toast.success('File removed from knowledge base')
  }

  const retryFile = (id: string) => {
    const file = files.find((f) => f.id === id)
    if (!file || !file.file) return
    handleFileUpload({ ...file, status: 'pending', progress: 0 })
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Files & Documents"
        description="Upload PDF, Word, Excel, CSV, and image files to train your agent"
      />

      {/* Ephemeral Supabase Storage Info Banner */}
      <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl flex items-center gap-3 text-xs">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <CheckCircle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">Zero-Retention Privacy Guarantee (Cloudflare D1 & Supabase Ephemeral)</p>
          <p className="text-muted-foreground mt-0.5">
            Files are temporarily staged in Supabase Storage for semantic vector parsing, indexed into Cloudflare D1 & vector memory, and automatically permanently deleted upon completion.
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all',
              isDragActive
                ? 'border-brand-500 bg-brand-500/5'
                : 'border-border/60 hover:border-brand-400/60 hover:bg-muted/30'
            )}
          >
            <input {...getInputProps()} />
            <div className="mx-auto h-14 w-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-4">
              <Upload className={cn('h-7 w-7', isDragActive ? 'text-brand-600' : 'text-brand-500')} />
            </div>
            {isDragActive ? (
              <p className="text-sm font-medium text-brand-600">Drop files here…</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Drop files here, or{' '}
                  <span className="text-brand-600 hover:underline">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, Word, Excel, CSV, TXT, MD, JSON, HTML, XML, PNG, JPG · Max 50MB per file
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File list */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((f) => {
                const { Icon, color } = getFileIcon(f.mimeType || f.file?.type || '')
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                  >
                    <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{f.name || f.file?.name}</p>
                        {statusBadge(f.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatBytes(f.size || f.file?.size || 0)}
                      </p>
                      {f.analysis && (
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle className="h-3 w-3" /> Auto-deleted from Supabase Storage (Zero Retention)
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {f.analysis.wordCount} words · {f.analysis.chunksCount} chunks indexed
                          </span>
                        </div>
                      )}
                      {f.status === 'uploading' && (
                        <div className="mt-1.5 h-1 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-150"
                            style={{ width: `${f.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {f.status === 'uploading' || f.status === 'processing' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : f.status === 'done' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : f.status === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4 text-destructive" />
                          <button
                            onClick={() => retryFile(f.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Retry"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={() => removeFile(f.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No files uploaded yet</p>
          <p className="text-xs mt-1">Drag and drop files above to get started</p>
        </div>
      )}

      {/* Supported formats */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Supported formats:</p>
        <div className="flex flex-wrap gap-1.5">
          {['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'MD', 'JSON', 'HTML', 'XML', 'PNG', 'JPG'].map(
            (fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 text-xs rounded bg-muted border border-border/50 font-mono"
              >
                {fmt}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
