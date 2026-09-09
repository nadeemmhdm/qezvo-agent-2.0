import { Link } from 'react-router-dom'
import {
  Bot, BookOpen, Globe, Cpu, Paintbrush, Code, Share2, BarChart2,
  Shield, CheckCircle, ArrowRight, Zap, Upload,
  MessageSquare, Rocket, ChevronRight, Gauge
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Mini Dashboard Preview (Neobrutalism) ──
function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border-2 border-border bg-card shadow-[8px_8px_0px_0px_hsl(var(--neo-shadow))] overflow-hidden">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-muted/80">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-black/40" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-black/40" />
          <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-black/40" />
        </div>
        <div className="px-6 py-0.5 rounded-md bg-background border-2 border-border text-xs font-mono font-bold text-foreground">
          app.qezvo.in/dashboard
        </div>
        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase">LIVE</div>
      </div>

      <div className="flex" style={{ minHeight: 320 }}>
        {/* Sidebar */}
        <div className="w-44 border-r-2 border-border bg-sidebar-background p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2 rounded-lg bg-black text-white dark:bg-white dark:text-black border border-border">
            <Bot className="h-4 w-4 shrink-0 text-yellow-400 dark:text-yellow-600" />
            <span className="text-xs font-black tracking-tight">Qezvo Agent</span>
          </div>
          {[
            { icon: BarChart2, label: 'Dashboard', active: true },
            { icon: Bot, label: 'Agents' },
            { icon: Globe, label: 'Domains' },
            { icon: Cpu, label: 'Ollama Cloud' },
          ].map(({ icon: Icon, label, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all ${
                active
                  ? 'bg-[#FFE600] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Overview</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ollama Cloud Connected
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Active Agents', value: '5', color: 'bg-[#00F0FF]/15' },
              { label: 'Cloud Stream', value: '142 t/s', color: 'bg-[#FFE600]/25' },
              { label: 'Sources', value: '34 docs', color: 'bg-[#23F074]/15' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`rounded-xl border-2 border-border p-2.5 ${color} shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]`}>
                <p className="text-lg font-black tabular-nums tracking-tight">{value}</p>
                <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          {/* Agents list */}
          <div className="rounded-xl border-2 border-border bg-background divide-y-2 divide-border overflow-hidden shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
            {[
              { name: 'Support Concierge', status: 'LIVE', model: 'gpt-oss:120b', speed: '14ms TTFT' },
              { name: 'Sales Assistant', status: 'READY', model: 'deepseek-v4-flash', speed: '9ms TTFT' },
              { name: 'Code Analyst', status: 'INDEXING', model: 'qwen3.5:397b', speed: 'Cloud GPU' },
            ].map(({ name, status, model, speed }) => (
              <div key={name} className="flex items-center justify-between px-3 py-2 text-xs font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-foreground">{name}</span>
                  <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">{model}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-muted-foreground font-bold">{speed}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#FFE600] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                    {status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Feature Card ──
function FeatureCard({
  icon: Icon, title, description, badge
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  badge?: string
}) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-6 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))] transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
            <Icon className="h-6 w-6 stroke-[2.5]" />
          </div>
          {badge && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-[#00F0FF] text-black border-2 border-black rounded shadow-[2px_2px_0px_0px_#000]">
              {badge}
            </span>
          )}
        </div>
        <h3 className="font-black text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

// ── Pricing Card ──
function PricingCard({
  name, price, description, features, cta, highlighted = false
}: {
  name: string
  price: string
  description: string
  features: string[]
  cta: string
  highlighted?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border-2 border-border p-8 flex flex-col transition-all ${
        highlighted
          ? 'bg-[#FFE600] text-black shadow-[8px_8px_0px_0px_#000] scale-105 z-10'
          : 'bg-card text-foreground shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))]'
      }`}
    >
      {highlighted && (
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-wider rounded border border-black shadow-[2px_2px_0px_0px_#fff]">
            ★ Most Popular Plan
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="font-black text-2xl tracking-tight">{name}</h3>
        <p className={`text-sm mt-1 font-semibold ${highlighted ? 'text-black/80' : 'text-muted-foreground'}`}>
          {description}
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-5xl font-black tracking-tight">{price}</span>
          {price !== 'Free' && (
            <span className={`text-sm mb-1.5 font-bold ${highlighted ? 'text-black/80' : 'text-muted-foreground'}`}>/month</span>
          )}
        </div>
      </div>
      <ul className="space-y-3 flex-1 mb-8">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm font-semibold">
            <CheckCircle className={`h-5 w-5 shrink-0 stroke-[2.5] ${highlighted ? 'text-black' : 'text-emerald-500'}`} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link to="/signup" className="w-full">
        <Button
          className={`w-full font-black text-sm uppercase tracking-wider ${
            highlighted
              ? 'bg-black text-white hover:bg-neutral-900 border-2 border-black shadow-[4px_4px_0px_0px_#fff]'
              : 'bg-primary text-primary-foreground'
          }`}
          size="lg"
          id={`pricing-${name.toLowerCase()}-btn`}
        >
          {cta}
        </Button>
      </Link>
    </div>
  )
}

// ── Step Card ──
function StepCard({ step, title, description, icon: Icon }: {
  step: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border-2 border-border bg-card p-5 text-center flex flex-col items-center justify-between shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
      <div className="relative mb-3">
        <div className="w-12 h-12 rounded-xl bg-[#00F0FF]/30 text-foreground border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]">
          <Icon className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#FFE600] text-black border-2 border-black text-xs font-black flex items-center justify-center shadow-[1px_1px_0px_0px_#000]">
          {step}
        </div>
      </div>
      <h3 className="font-black text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground font-semibold leading-tight">{description}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="bg-background">
      {/* ── Hero ── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE600] text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] mb-6">
                <Zap className="h-4 w-4 fill-black" />
                <span>Ollama Cloud API Integrated • 10x Response Speed</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground text-balance">
                Build &amp; Deploy AI Agents With{' '}
                <span className="underline decoration-[#FFE600] decoration-8 underline-offset-8">Zero Hardware Lag</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground font-medium leading-relaxed text-balance">
                Turn your PDFs, docs, and live website crawls into streaming AI agents. Connect to Ollama Cloud for high-throughput 120+ tokens/s inference with zero chat logging.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
                <Link to="/signup">
                  <Button size="xl" variant="brand" id="hero-cta-primary" className="font-black tracking-wide text-base">
                    Create Agent Free
                    <ArrowRight className="h-5 w-5 ml-1 stroke-[3]" />
                  </Button>
                </Link>
                <Link to="/documentation">
                  <Button size="xl" variant="outline" id="hero-cta-secondary" className="font-black text-base">
                    Ollama Setup Guide
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-bold text-muted-foreground">
                {[
                  'No credit card required',
                  'Ollama Cloud Ready',
                  'Zero conversation storage',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative">
              <DashboardPreview />
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 bg-[#23F074] text-black border-2 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-black stroke-[3]" />
                <span className="text-xs font-black uppercase tracking-wider">Streaming Live</span>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#00F0FF] text-black border-2 border-black rounded-xl px-4 py-2 shadow-[4px_4px_0px_0px_#000] flex items-center gap-2">
                <Gauge className="h-4 w-4 text-black stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider">120+ Tokens / Sec</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ollama Cloud Speed Showcase Banner ── */}
      <section className="py-16 border-y-2 border-border bg-card">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border-2 border-border bg-[#00F0FF]/15 p-6 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <div className="text-3xl font-black text-foreground mb-1">10x Speed</div>
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Cloud Offload</div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Offload compute to Ollama Cloud API clusters. Zero thermal throttling and near-instant Time-To-First-Token.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-[#FFE600]/25 p-6 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <div className="text-3xl font-black text-foreground mb-1">675B+ Models</div>
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Flagship Intelligence</div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Run GPT-OSS 120B, DeepSeek V4 Flash, and Mistral Large 3 without requiring hundreds of gigabytes of local VRAM.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-border bg-[#23F074]/20 p-6 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <div className="text-3xl font-black text-foreground mb-1">Zero Key Exposure</div>
              <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Server-Side Proxy</div>
              <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                Your <code className="font-bold">OLLAMA_API_KEY</code> resides exclusively in backend environment variables, never leaked to the browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow Steps ── */}
      <section className="py-24">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-muted border-2 border-border text-foreground font-black uppercase text-xs tracking-wider rounded mb-3 shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]">
              Rapid Deployment
            </div>
            <h2 className="text-3xl md:text-4xl font-black">
              From Raw Data to Embedded Agent in 7 Steps
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto font-medium text-sm">
              No machine learning engineers needed. Ingest your knowledge, connect your model, and deploy instantly.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              { step: 1, title: 'Upload Data', description: 'PDFs, OCR, docs', icon: Upload },
              { step: 2, title: 'Analyze', description: 'SSRF clean scrape', icon: Zap },
              { step: 3, title: 'Train', description: 'Vector indexing', icon: BookOpen },
              { step: 4, title: 'Customize', description: 'Neobrutal styling', icon: Paintbrush },
              { step: 5, title: 'Test', description: 'Live SSE playground', icon: MessageSquare },
              { step: 6, title: 'Publish', description: 'Versioned release', icon: Rocket },
              { step: 7, title: 'Share', description: 'Embed & widgets', icon: Share2 },
            ].map((item) => (
              <StepCard key={item.step} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section className="py-24 border-y-2 border-border bg-muted/40">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-[#FFE600] text-black border-2 border-black font-black uppercase text-xs tracking-wider rounded mb-3 shadow-[2px_2px_0px_0px_#000]">
              Full Suite Architecture
            </div>
            <h2 className="text-3xl md:text-4xl font-black">
              Everything Needed to Scale AI Agents
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={BookOpen}
              title="Multi-Source Knowledge"
              description="Upload PDFs, DOCX, CSV, Markdown, and scanned documents with automated OCR and semantic chunking."
              badge="OCR READY"
            />
            <FeatureCard
              icon={Globe}
              title="Stateless Website Crawler"
              description="Scan sitemap.xml files or crawl individual domains with built-in SSRF blocklists and robots.txt honoring."
              badge="SSRF PROTECTED"
            />
            <FeatureCard
              icon={Cpu}
              title="Ollama Cloud Integration"
              description="Directly connect to ollama.com via Bearer tokens for accelerated response rates and enterprise models."
              badge="10X SPEED"
            />
            <FeatureCard
              icon={Paintbrush}
              title="Neobrutalist Widgets"
              description="Match your website identity with bold borders, hard offset shadows, high contrast, and dark mode."
              badge="NEW THEME"
            />
            <FeatureCard
              icon={Code}
              title="Single-Script Embed"
              description="Drop one line of JavaScript before </body> or load via React/Vue/Svelte SDK with full isolation."
            />
            <FeatureCard
              icon={Shield}
              title="Zero Chat Retention"
              description="Prompts and responses are processed in memory and never stored in any database, ensuring full privacy."
              badge="GDPR/SOC2"
            />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-24">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-[#00F0FF] text-black border-2 border-black font-black uppercase text-xs tracking-wider rounded mb-3 shadow-[2px_2px_0px_0px_#000]">
              Transparent Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-black">
              Start Free, Accelerate When You Scale
            </h2>
            <p className="text-muted-foreground mt-3 font-medium text-sm">No surprise overages. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            <PricingCard
              name="Starter"
              price="Free"
              description="For developers and testing ideas"
              features={[
                '3 AI agents',
                '1,000 requests/month',
                '10 knowledge sources',
                'Local Ollama support',
                'Public widget embed',
              ]}
              cta="Get Started Free"
            />
            <PricingCard
              name="Pro"
              price="$29"
              description="For companies and high-speed chatbots"
              features={[
                '25 AI agents',
                '50,000 requests/month',
                'Ollama Cloud high-speed API',
                'Unlimited documents & OCR',
                'Custom domains & SSL',
                '5 Team members',
              ]}
              cta="Start Pro Trial"
              highlighted
            />
            <PricingCard
              name="Business"
              price="$99"
              description="For enterprise security and scale"
              features={[
                'Unlimited agents',
                '500,000 requests/month',
                'Dedicated Ollama Cloud routing',
                'Unlimited team members',
                'Webhooks & Signed Events',
                'SLA 99.9% guarantee',
              ]}
              cta="Contact Sales"
            />
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 border-t-2 border-border bg-muted/40">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: 'How does Ollama Cloud increase response speed?',
                a: 'Ollama Cloud offloads inference to dedicated enterprise GPU clusters. Instead of queuing on local or consumer GPUs that overheat or lack VRAM, requests stream directly from Ollama servers with sub-50ms first-token latency and 120+ tokens/second.',
              },
              {
                q: 'Is my Ollama API key secure?',
                a: 'Yes. Your OLLAMA_API_KEY is stored strictly in backend server environment variables or encrypted database credentials. It is never transmitted to the browser or visible in frontend network requests.',
              },
              {
                q: 'Do you store our end-user conversations?',
                a: 'Never. Qezvo Agent operates on an ephemeral in-memory pipeline. When the chat stream closes, conversation memory is discarded immediately. We do not maintain any chat history tables.',
              },
              {
                q: 'How do I embed the agent on my website?',
                a: 'Every published agent includes a copy-paste script snippet. Simply paste <script src="https://cdn.qezvo.in/widget.js" data-agent-id="..." defer></script> onto your site.',
              },
            ].map(({ q, a }) => (
              <details key={q} className="group rounded-2xl border-2 border-border bg-card p-5 cursor-pointer shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
                <summary className="flex items-center justify-between font-black text-sm list-none gap-4">
                  {q}
                  <ChevronRight className="h-5 w-5 shrink-0 transition-transform group-open:rotate-90 text-foreground stroke-[3]" />
                </summary>
                <p className="mt-3 text-sm text-muted-foreground font-medium leading-relaxed">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 border-t-2 border-border relative bg-[#FFE600] text-black">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-balance">
            Start Building Lightning-Fast AI Agents
          </h2>
          <p className="mt-4 text-lg font-bold text-black/80 max-w-xl mx-auto">
            Connect your content, configure your model, and embed on your site in minutes.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="xl" className="bg-black text-white hover:bg-neutral-900 border-2 border-black font-black shadow-[4px_4px_0px_0px_#fff]" id="final-cta-btn">
                Create Free Agent
                <ArrowRight className="h-5 w-5 ml-1 stroke-[3]" />
              </Button>
            </Link>
            <Link to="/documentation">
              <Button size="xl" variant="outline" className="bg-white text-black border-2 border-black font-black shadow-[4px_4px_0px_0px_#000]" id="final-contact-btn">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

