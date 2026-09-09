import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Search, ChevronRight, Copy, Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DocSection {
  id: string
  category: string
  title: string
  content: React.ReactNode
}

export default function DocsPage() {
  const [selectedDocId, setSelectedDocId] = useState('quickstart')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const DOCS: DocSection[] = [
    {
      id: 'quickstart',
      category: 'Getting Started',
      title: 'Quickstart Guide',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Quickstart Guide</h2>
            <p className="text-muted-foreground mt-2">
              Create and embed your first intelligent AI agent in less than three minutes.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">1. Create a new Agent</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Navigate to the Qezvo Agent dashboard and click <strong className="text-foreground">"Create Agent"</strong>. Give your agent a name, description, and choose a starting persona (e.g. Customer Support, Technical Documentation Assistant, or Sales Concierge).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">2. Add Knowledge Sources</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your agent can ingest data from multiple sources simultaneously:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">Website Crawl:</strong> Enter your domain (e.g. <code>https://docs.yourcompany.com</code>) or upload a <code>sitemap.xml</code>.</li>
              <li><strong className="text-foreground">Document Uploads:</strong> Upload PDFs, DOCX files, or markdown guides. Scanned PDFs are automatically processed via OCR.</li>
              <li><strong className="text-foreground">Text &amp; FAQs:</strong> Paste company policies, internal checklists, or troubleshooting cheat sheets.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">3. Test in the Playground</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Head over to the <strong className="text-foreground">"Playground / Test"</strong> tab to verify that the agent cites the correct sources and responds with the expected tone of voice.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">4. Embed on your Website</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Copy the embed snippet and paste it right before the closing <code>&lt;/body&gt;</code> tag on any web page:
            </p>
            <div className="relative rounded-xl border bg-muted/70 p-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => copyToClipboard('<script src="https://cdn.qezvo.in/widget.js" data-agent-id="ag_live_948194" defer></script>', 'quick-embed')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border hover:bg-muted transition-colors text-muted-foreground"
              >
                {copiedCode === 'quick-embed' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="overflow-x-auto text-foreground">
                {`<script \n  src="https://cdn.qezvo.in/widget.js" \n  data-agent-id="ag_live_948194" \n  defer\n></script>`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'crawling-sitemaps',
      category: 'Knowledge Ingestion',
      title: 'Websites & Sitemaps',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Website &amp; Sitemap Ingestion</h2>
            <p className="text-muted-foreground mt-2">
              Ingest content directly from living websites with SSRF filtering and robots.txt compliance.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Crawler Behavior &amp; Constraints</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Qezvo Agent utilizes a stateless headless crawler that strips boilerplate HTML (navigation headers, footers, cookie banners) to extract clean Markdown text content.
            </p>
            <div className="p-4 rounded-xl border border-border bg-card space-y-2">
              <h4 className="font-semibold text-sm">Security &amp; SSRF Shielding</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                To prevent Server-Side Request Forgery (SSRF), all target URLs are resolved and validated against a strict blocklist. Requests targeting <code>127.0.0.1</code>, <code>169.254.169.254</code> (AWS metadata), <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, or <code>192.168.0.0/16</code> are blocked at DNS resolution time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Sitemap Discovery</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When providing a sitemap URL (e.g. <code>https://example.com/sitemap.xml</code>), the engine recursively parses both standard URLsets and nested Sitemap Indexes, queuing up to your plan's page limit.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'pdf-ocr',
      category: 'Knowledge Ingestion',
      title: 'PDF & Scanned Document OCR',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">PDF OCR Processing</h2>
            <p className="text-muted-foreground mt-2">
              Transform scanned contracts, manuals, and receipts into searchable vector knowledge.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Supported Document Types</h3>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-muted-foreground">
              <li><strong className="text-foreground">PDFs:</strong> Native digital text PDFs and raster scanned PDFs.</li>
              <li><strong className="text-foreground">Office Formats:</strong> DOCX, DOC, PPTX files.</li>
              <li><strong className="text-foreground">Plain Text:</strong> Markdown, TXT, CSV, JSON structured documentation.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">OCR Pipeline Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When a scanned PDF is uploaded, our background worker converts each page to a 300 DPI high-contrast grayscale image. Optical Character Recognition (OCR) extracts tabular text blocks, preserves bullet points, and discards graphical artifacts.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'widget-customization',
      category: 'Embeds & Widgets',
      title: 'Web Widget Customization',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Web Widget Customization</h2>
            <p className="text-muted-foreground mt-2">
              Tailor the chat bubble appearance, greetings, and behavior to seamlessly integrate into your website.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Configuration Parameters</h3>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 uppercase border-b font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Attribute</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3 font-mono font-semibold text-foreground">data-primary-color</td>
                    <td className="p-3 font-mono text-muted-foreground">string (HEX)</td>
                    <td className="p-3 text-muted-foreground">Sets button, message bubbles, and brand accents.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-foreground">data-position</td>
                    <td className="p-3 font-mono text-muted-foreground">'bottom-right' | 'bottom-left'</td>
                    <td className="p-3 text-muted-foreground">Position of floating launcher bubble.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-semibold text-foreground">data-greeting</td>
                    <td className="p-3 font-mono text-muted-foreground">string</td>
                    <td className="p-3 text-muted-foreground">Initial welcome greeting presented upon opening.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'api-reference',
      category: 'API & Developers',
      title: 'Headless REST API & Streaming',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Streaming Chat API</h2>
            <p className="text-muted-foreground mt-2">
              Query your trained agents programmatically with Server-Sent Events (SSE).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Authentication</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Include your API Key in the <code>Authorization</code> header with the <code>Bearer</code> prefix:
            </p>
            <div className="relative rounded-xl border bg-muted/70 p-4 font-mono text-xs">
              <button
                type="button"
                onClick={() => copyToClipboard('curl https://api.qezvo.in/v1/chat \\\n  -H "Authorization: Bearer qz_live_abc123" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"agentId": "ag_948194", "message": "How do I reset my password?", "stream": true}\'', 'curl-chat')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border hover:bg-muted transition-colors text-muted-foreground"
              >
                {copiedCode === 'curl-chat' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="overflow-x-auto text-foreground">
{`curl https://api.qezvo.in/v1/chat \\
  -H "Authorization: Bearer qz_live_abc123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "ag_948194",
    "message": "How do I reset my password?",
    "stream": true
  }'`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'security-privacy',
      category: 'Security & Compliance',
      title: 'Zero Chat Logging & Privacy',
      content: (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Zero Chat Retention Architecture</h2>
            <p className="text-muted-foreground mt-2">
              How Qezvo Agent guarantees total conversation privacy.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">Ephemeral Processing Pipeline</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Unlike traditional SaaS platforms that archive end-user conversations to relational databases for analytics, Qezvo Agent processes messages strictly in memory. Once the response stream closes, the conversation session buffer is immediately garbage-collected and destroyed.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
              <Shield className="h-5 w-5" />
              <span>SOC2 &amp; GDPR Compliant by Design</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Because conversations are never written to database tables or object storage, there is zero risk of data exposure via compromised database snapshots or inadvertent data leaks.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ollama-cloud-speed',
      category: 'AI Engine & Performance',
      title: 'Ollama Cloud API Key & Speed Boost',
      content: (
        <div className="space-y-6">
          <div>
            <div className="inline-block px-3 py-1 bg-yellow-300 text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000] mb-3">
              ⚡ 10x Inference Acceleration
            </div>
            <h2 className="text-3xl font-black tracking-tight">Ollama Cloud API Key Setup</h2>
            <p className="text-muted-foreground mt-2 font-medium">
              Accelerate streaming response speeds and run massive flagship models without local GPU bottlenecks using Ollama Cloud.
            </p>
          </div>

          {/* Speed Increase Callout */}
          <div className="p-5 rounded-2xl border-2 border-border bg-[#00F0FF]/15 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] space-y-3">
            <h3 className="text-lg font-black text-foreground flex items-center gap-2">
              <span>🚀 Why Ollama Cloud Increases Response Speed</span>
            </h3>
            <p className="text-sm text-foreground/90 leading-relaxed font-medium">
              Local self-hosted models are frequently bottlenecked by consumer GPU VRAM, slow thermal throttling, and multi-tenant CPU execution. Ollama Cloud runs models on dedicated high-memory enterprise clusters with instant TTFT (Time-To-First-Token) and sustained 120+ tokens/sec streaming.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">1. Obtain your Ollama API Key</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Visit <a href="https://ollama.com/settings/keys" target="_blank" rel="noreferrer" className="font-bold underline text-primary">ollama.com/settings/keys</a>, sign in or run <code className="bg-muted px-1.5 py-0.5 rounded border border-border font-bold">ollama signin</code> in your terminal, and generate a new API key.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold">2. Configure in Qezvo Agent</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You can configure the key either at the platform server level or in the individual Agent model settings:
            </p>
            <div className="relative rounded-xl border-2 border-border bg-card p-4 font-mono text-xs shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
              <button
                type="button"
                onClick={() => copyToClipboard('OLLAMA_API_KEY=ollama_live_your_cloud_key_here\nOLLAMA_HOST=https://ollama.com', 'env-key')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border-2 border-border hover:bg-muted transition-colors text-muted-foreground"
              >
                {copiedCode === 'env-key' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="overflow-x-auto text-foreground font-semibold">
{`# In your .env file
OLLAMA_API_KEY=ollama_live_your_cloud_key_here
OLLAMA_HOST=https://ollama.com`}
              </pre>
            </div>
          </div>

          {/* Supported Cloud Models Table */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Supported Flagship Cloud Models</h3>
            <div className="overflow-x-auto rounded-xl border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/80 uppercase border-b-2 border-border font-bold text-foreground">
                  <tr>
                    <th className="p-3">Model Tag</th>
                    <th className="p-3">Parameters / Architecture</th>
                    <th className="p-3">Best Used For</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-border font-medium">
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">gpt-oss:120b</td>
                    <td className="p-3">120 Billion Dense</td>
                    <td className="p-3">Flagship reasoning, multi-turn enterprise support</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">deepseek-v4-flash</td>
                    <td className="p-3">MoE High Speed</td>
                    <td className="p-3">Ultra-fast real-time chat widgets and code retrieval</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">qwen3.5:397b</td>
                    <td className="p-3">397B Multilingual</td>
                    <td className="p-3">Complex knowledge base indexing & multilingual queries</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-mono font-bold text-primary">mistral-large-3:675b</td>
                    <td className="p-3">675B Enterprise</td>
                    <td className="p-3">Contract analysis, legal compliance, complex PDF parsing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Code Tabs */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">API Access Examples</h3>
            <div className="relative rounded-xl border-2 border-border bg-card p-4 font-mono text-xs shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
              <button
                type="button"
                onClick={() => copyToClipboard(`curl https://ollama.com/api/chat \\
  -H "Authorization: Bearer $OLLAMA_API_KEY" \\
  -d '{
    "model": "gpt-oss:120b",
    "messages": [{"role": "user", "content": "Why is the sky blue?"}],
    "stream": true
  }'`, 'curl-ollama')}
                className="absolute top-3 right-3 p-1.5 rounded-lg bg-background border-2 border-border hover:bg-muted transition-colors text-muted-foreground"
              >
                {copiedCode === 'curl-ollama' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="overflow-x-auto text-foreground font-semibold">
{`curl https://ollama.com/api/chat \\
  -H "Authorization: Bearer $OLLAMA_API_KEY" \\
  -d '{
    "model": "gpt-oss:120b",
    "messages": [{"role": "user", "content": "Explain quantum computing"}],
    "stream": true
  }'`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const filteredDocs = searchQuery
    ? DOCS.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DOCS

  const activeDoc = DOCS.find((d) => d.id === selectedDocId) ?? DOCS[0]

  return (
    <div className="py-12 md:py-16">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header with Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b-2 border-border mb-8">
          <div>
            <div className="inline-block px-3 py-1 bg-brand-400 text-black border-2 border-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_#000] mb-2">
              📖 Documentation &amp; Architecture
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Qezvo Agent Knowledge Base</h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border-2 border-border bg-card text-foreground font-semibold placeholder:text-muted-foreground shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))] focus:outline-none focus:translate-x-[-1px] focus:translate-y-[-1px] focus:shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]"
            />
          </div>
        </div>

        {/* 2-Column layout: Sidebar + Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Sidebar */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="rounded-2xl border-2 border-border bg-card p-4 space-y-1.5 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between font-bold border-2 ${
                    selectedDocId === doc.id
                      ? 'bg-yellow-300 text-black border-black shadow-[3px_3px_0px_0px_#000]'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <span className="truncate">{doc.title}</span>
                  {selectedDocId === doc.id && <ChevronRight className="h-4 w-4 shrink-0 text-black stroke-[3]" />}
                </button>
              ))}
            </div>

            <div className="rounded-2xl border-2 border-border bg-muted/40 p-5 space-y-3 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Need Assistance?</h4>
              <p className="text-xs text-muted-foreground font-medium">
                Join our developer Discord or contact technical support for personalized integration guidance.
              </p>
              <Link to="/contact" className="block">
                <Button variant="outline" size="sm" className="w-full text-xs font-black">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-8 lg:col-span-9 rounded-2xl border-2 border-border bg-card p-8 md:p-10 shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))]">
            {activeDoc.content}
          </div>
        </div>
      </div>
    </div>
  )
}
