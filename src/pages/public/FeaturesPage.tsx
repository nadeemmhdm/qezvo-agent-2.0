import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bot, BookOpen, Globe, Shield, Code2, Sparkles, Cpu, Layers,
  FileSearch, CheckCircle2, Lock, ArrowRight, Server, Zap, RefreshCw, Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const FEATURE_CATEGORIES = [
  {
    id: 'knowledge',
    name: 'Knowledge Engine',
    icon: BookOpen,
    tagline: 'Connect any data source in seconds',
    features: [
      {
        title: 'Deep Website & Sitemap Crawling',
        description: 'Point your agent to any domain or sitemap.xml. Qezvo Agent automatically extracts, sanitizes, and indexes pages while adhering to robots.txt and depth boundaries.',
        icon: Globe,
      },
      {
        title: 'Document & Scanned PDF OCR',
        description: 'Upload PDF, Word, EPUB, and TXT files. Embedded OCR automatically turns scanned physical documents and receipts into searchable vector embeddings.',
        icon: FileSearch,
      },
      {
        title: 'Instant Clipboard & Raw Text',
        description: 'Quickly paste FAQs, internal support manuals, or proprietary tables. Content is instantly parsed, tokenized, and made queryable.',
        icon: Layers,
      },
      {
        title: 'Automatic Content Resynchronization',
        description: 'Set scheduled crawl schedules (daily, weekly) so your agent is always armed with the latest docs, product updates, and pricing revisions.',
        icon: RefreshCw,
      },
    ],
  },
  {
    id: 'models',
    name: 'AI & Inference Hub',
    icon: Cpu,
    tagline: 'Powered by industry-leading open & private models',
    features: [
      {
        title: 'State-of-the-Art Model Selection',
        description: 'Switch between Llama 3.3, DeepSeek V3, Qwen 2.5, and Mistral with one click. Optimize for lightning speed or deep reasoning tasks.',
        icon: Sparkles,
      },
      {
        title: 'Custom Ollama Private Endpoints',
        description: 'Keep your weights completely private. Connect your self-hosted Ollama or vLLM server via secured endpoint tunneling with zero public exposure.',
        icon: Server,
      },
      {
        title: 'Prompt Engineering & System Personas',
        description: 'Define your agent persona, tone of voice, boundaries, and fallback actions. Control temperature, top_p, and frequency penalties with visual sliders.',
        icon: Bot,
      },
      {
        title: 'Context Window & Chunk Overlap Control',
        description: 'Fine-tune document chunk sizes (256–2048 tokens) and chunk overlap to balance retrieval precision and contextual coherence.',
        icon: Layers,
      },
    ],
  },
  {
    id: 'distribution',
    name: 'Deployment & Widgets',
    icon: Code2,
    tagline: 'Deliver your agent wherever your customers are',
    features: [
      {
        title: 'Single-Tag Web Embed Widget',
        description: 'Add a single line of script to your website, Shopify, or WordPress store. Enjoy a sleek, responsive floating chat bubble with zero layout shift.',
        icon: Code2,
      },
      {
        title: 'White-Label Custom Domains',
        description: 'Host your agent on your own domain (e.g. support.yourcompany.com). Automated SSL issuance and Cloudflare Edge caching included.',
        icon: Globe,
      },
      {
        title: 'Complete Visual Customizer',
        description: 'Customize colors, avatar, launcher icons, welcome greetings, quick suggested questions, and CSS themes to match your brand style guide.',
        icon: Sparkles,
      },
      {
        title: 'Public Shareable Links',
        description: 'Generate public or password-protected stand-alone web URLs for beta testing, internal company wikis, or client demonstrations.',
        icon: Zap,
      },
    ],
  },
  {
    id: 'security',
    name: 'Security & Governance',
    icon: Shield,
    tagline: 'Built for enterprise privacy and zero data leakage',
    features: [
      {
        title: 'SSRF & Internal Network Protection',
        description: 'All web crawler requests pass through strict egress gateways blocking private RFC 1918 subnets, AWS metadata endpoints, and loopback ranges.',
        icon: Lock,
      },
      {
        title: 'Zero Chat Logging Architecture',
        description: 'We never store your or your users\' chat interactions in databases. Queries exist solely in transient memory during response streaming.',
        icon: Shield,
      },
      {
        title: 'Granular API Keys & Rate Limiting',
        description: 'Generate scoped API tokens for headless programmatic querying. Enforce IP allowlists, monthly token quotas, and instant revocations.',
        icon: Key,
      },
      {
        title: 'Role-Based Team Collaboration',
        description: 'Invite team members with Admin, Editor, and Viewer roles. Maintain audit logs of model changes, training jobs, and domain updates.',
        icon: CheckCircle2,
      },
    ],
  },
]

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState('knowledge')
  const activeCategory = FEATURE_CATEGORIES.find((c) => c.id === activeTab) ?? FEATURE_CATEGORIES[0]

  return (
    <div className="py-16 md:py-24">
      {/* ── Hero Section ── */}
      <div className="container max-w-5xl mx-auto px-4 text-center mb-16">
        <Badge variant="brand" className="mb-4">
          <Zap className="h-3 w-3 mr-1.5" />
          Enterprise Feature Suite
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          Everything you need to deploy <br className="hidden sm:inline" />
          <span className="gradient-text">production AI agents</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Qezvo Agent handles the ingestion, vector indexing, inference orchestration, and client widgets so you can build customer-facing AI in minutes.
        </p>
      </div>

      {/* ── Interactive Category Tabs ── */}
      <div className="container max-w-6xl mx-auto px-4 mb-20">
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-muted/60 backdrop-blur-sm rounded-2xl border border-border max-w-3xl mx-auto mb-12">
          {FEATURE_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected = activeTab === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isSelected
                    ? 'bg-background text-foreground shadow-sm shadow-black/5 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-brand-500' : ''}`} />
                {cat.name}
              </button>
            )
          })}
        </div>

        {/* Tab Detail View */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold">{activeCategory.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{activeCategory.tagline}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeCategory.features.map((feature) => {
              const Icon = feature.icon
              return (
                <Card key={feature.title} className="border-border/80 hover:border-brand-500/50 transition-colors">
                  <CardHeader>
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed mt-2 text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Architecture Diagram Section ── */}
      <div className="container max-w-5xl mx-auto px-4 mb-24">
        <div className="rounded-3xl border border-border bg-card p-8 md:p-12 relative overflow-hidden">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="outline" className="mb-3">
              Production Architecture
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">How the data pipeline operates</h2>
            <p className="text-muted-foreground text-sm mt-2">
              From raw documents to real-time streaming inference at the edge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="rounded-2xl border bg-background p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">1. Ingest &amp; Sanitize</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PDFs, web pages, and sitemaps are cleansed with SSRF safety, stripped of boilerplate, and split into chunks.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">2. Vector Search</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                High-dimensional embeddings index your knowledge. Hybrid cosine similarity retrieves the most relevant context.
              </p>
            </div>

            <div className="rounded-2xl border bg-background p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-base">3. Streamed Inference</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Queries are enriched with context and streamed via server-sent events to your web widget in real time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Call to Action Banner ── */}
      <div className="container max-w-5xl mx-auto px-4">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-background p-10 md:p-12 text-center space-y-5">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Build your first AI Agent in under 3 minutes
          </h2>
          <p className="text-muted-foreground text-sm max-w-lg mx-auto">
            Experience the easiest way to train and embed custom AI without writing machine learning code.
          </p>
          <div className="pt-2 flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="brand">
                Get started free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing">
              <Button size="lg" variant="outline">
                View all plans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
