import { useState } from 'react'
import { Terminal, Copy, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function ApiReferencePage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Badge variant="brand" className="mb-3">
            <Terminal className="h-3 w-3 mr-1" />
            Developer Platform
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">API Reference</h1>
          <p className="text-muted-foreground text-base">
            Complete specification for the Qezvo Agent REST and Streaming SSE Chat APIs.
          </p>
        </div>

        {/* Auth section */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 mb-10 space-y-4">
          <h2 className="text-2xl font-bold">Authentication</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All API requests must include your API Key in the <code>Authorization</code> header using the Bearer token scheme. API keys can be managed and scoped from the API Keys page inside your dashboard.
          </p>
          <div className="p-4 rounded-xl bg-muted/60 font-mono text-xs text-foreground">
            <code>Authorization: Bearer forge_live_sec_932948293482</code>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-8">
          {/* Chat streaming */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs px-2.5 py-1 rounded">
                POST
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">/v1/chat/completions</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Stream conversational responses enriched with vector retrieved knowledge chunks from your agent. Returns Server-Sent Events (SSE).
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Request Body (JSON)</h4>
              <div className="relative rounded-xl border bg-muted/60 p-4 font-mono text-xs">
                <button
                  type="button"
                  onClick={() =>
                    copyCode(
                      '{\n  "agentId": "ag_948194",\n  "message": "What is the return policy?",\n  "stream": true,\n  "history": []\n}',
                      'body-chat'
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border hover:bg-muted text-muted-foreground"
                >
                  {copiedId === 'body-chat' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <pre>{`{
  "agentId": "ag_948194",
  "message": "What is the return policy?",
  "stream": true,
  "history": []
}`}</pre>
              </div>
            </div>
          </div>

          {/* List agents */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-blue-500/10 text-blue-500 font-mono font-bold text-xs px-2.5 py-1 rounded">
                GET
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">/v1/agents</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              List all active AI agents associated with your organization.
            </p>
          </div>

          {/* Ingest document */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <span className="bg-emerald-500/10 text-emerald-500 font-mono font-bold text-xs px-2.5 py-1 rounded">
                POST
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">/v1/agents/:id/knowledge/documents</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Programmatically upload files or trigger OCR extraction jobs for an agent's knowledge library.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
