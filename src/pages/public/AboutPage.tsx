import { Target, Shield, Award, ArrowRight, ExternalLink, Code2, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const VALUES = [
    {
      icon: Shield,
      title: 'Zero Chat Logging & Privacy',
      description: 'We believe you shouldn\'t have to sacrifice data sovereignty to utilize modern AI. We engineer zero-retention chat systems from the foundation up.',
      tag: 'PRIVACY FIRST',
      color: 'bg-[#23F074]/20',
    },
    {
      icon: Code2,
      title: '100% Open-Source Codebase',
      description: 'Qezvo Agent is fully open-source. Anyone can audit our crawler, inspect chunking algorithms, or self-host without closed-source lock-in.',
      tag: 'OPEN SOURCE',
      color: 'bg-[#00F0FF]/20',
    },
    {
      icon: Target,
      title: 'Third-Party Ollama Speed Boost',
      description: 'Users bring their own Ollama API Key to bypass consumer hardware bottlenecks, unlocking 120+ tokens/s streaming speeds and enterprise reasoning models.',
      tag: '10X PERFORMANCE',
      color: 'bg-[#FFE600]/25',
    },
    {
      icon: Award,
      title: 'Production Quality First',
      description: 'Engineered in Kerala, India for global enterprises with SSRF isolation, custom DNS routing, and resilient cloud infrastructure.',
      tag: 'ENTERPRISE READY',
      color: 'bg-[#FF5F56]/15',
    },
  ]

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#FFE600] text-black border-2 border-black rounded-lg text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] mb-4">
            <span>🇮🇳 Proudly Developed in Kerala, India</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
            Democratizing Intelligent AI Agents For Everyone
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            <strong className="text-foreground">Qezvo Agent</strong> (<a href="https://www.qezvo.in" target="_blank" rel="noreferrer" className="underline text-primary font-bold">www.qezvo.in</a>) is an open-source, high-throughput AI agent builder platform developed and managed by <strong className="text-foreground">Affogato Solutions</strong>.
          </p>
        </div>

        {/* Affogato Solutions & Kerala Heritage Banner */}
        <div className="rounded-2xl border-2 border-border bg-card p-8 md:p-10 mb-16 shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b-2 border-border">
            <div>
              <div className="inline-block px-3 py-1 bg-black text-white dark:bg-white dark:text-black font-black uppercase text-xs tracking-wider rounded mb-2">
                Parent Engineering Organization
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-foreground">
                Developed &amp; Managed by Affogato Solutions
              </h2>
              <p className="text-sm text-muted-foreground font-semibold mt-1">
                Headquartered in God's Own Country — Kerala, India.
              </p>
            </div>
            <a
              href="https://affogato.solutions"
              target="_blank"
              rel="noreferrer"
              className="inline-block"
            >
              <Button className="font-black text-xs uppercase tracking-wider bg-[#FFE600] text-black hover:bg-yellow-400 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
                <span>Visit affogato.solutions</span>
                <ExternalLink className="h-4 w-4 ml-1.5 stroke-[2.5]" />
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm font-medium text-muted-foreground leading-relaxed">
            <p>
              Affogato Solutions created Qezvo Agent to eliminate the steep infrastructure barrier required to build custom AI assistants. By combining high-accuracy vector search, OCR scanning, and sitemap crawling with an intuitive Neobrutalist interface, any company or developer can launch custom agents in minutes.
            </p>
            <p>
              Qezvo Agent is engineered with a strict <strong className="text-foreground">Zero Chat Retention</strong> architecture. In accordance with strict privacy standards, we never archive customer prompts or LLM responses to databases.
            </p>
          </div>
        </div>

        {/* Story & Third-party Ollama Model Speed */}
        <div className="rounded-2xl border-2 border-border bg-[#00F0FF]/15 p-8 md:p-10 mb-16 shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))] space-y-4">
          <div className="inline-block px-3 py-1 bg-black text-white font-black text-xs uppercase tracking-wider rounded">
            ⚡ Powered by Ollama Cloud
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Why We Use Ollama Cloud As Third-Party AI Engine
          </h2>
          <p className="text-sm font-medium text-foreground/90 leading-relaxed">
            Self-hosting local language models often bottlenecks startups and small businesses due to expensive GPU instances, thermal throttling, and slow Time-To-First-Token. With Qezvo Agent, users provide their own third-party <strong className="text-foreground">Ollama API Key</strong> (<code className="font-bold">OLLAMA_API_KEY</code>). This leverages Ollama's high-memory cloud clusters to achieve 120+ tokens/second streaming speeds with 120B to 675B parameter flagship models.
          </p>
        </div>

        {/* Core Values Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <div className="inline-block px-3 py-1 bg-muted border-2 border-border text-foreground font-black uppercase text-xs tracking-wider rounded mb-3 shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]">
              Foundational Pillars
            </div>
            <h2 className="text-3xl font-black">Our Guiding Engineering Principles</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.title} className={`rounded-2xl border-2 border-border ${v.color} p-6 space-y-3 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]`}>
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-card border-2 border-border flex items-center justify-center shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]">
                      <Icon className="h-6 w-6 stroke-[2.5] text-foreground" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-black text-white dark:bg-white dark:text-black rounded border border-border">
                      {v.tag}
                    </span>
                  </div>
                  <h3 className="font-black text-lg text-foreground">{v.title}</h3>
                  <p className="text-sm text-foreground/85 font-medium leading-relaxed">{v.description}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Made with Heart in Kerala */}
        <div className="rounded-2xl border-2 border-border bg-[#FFE600] text-black p-8 text-center shadow-[6px_6px_0px_0px_#000] space-y-4">
          <div className="flex items-center justify-center gap-2 font-black text-lg">
            <span>Engineered with</span>
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <span>in Kerala, India</span>
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            Ready to build open-source AI agents with Qezvo Agent?
          </h2>
          <p className="text-sm font-bold text-black/80 max-w-md mx-auto">
            Get started in seconds. Ingest your documents and websites, configure your Ollama cloud model, and embed your widget anywhere.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-black text-white hover:bg-neutral-900 border-2 border-black font-black shadow-[3px_3px_0px_0px_#fff]">
                Get Started Free
                <ArrowRight className="h-4 w-4 ml-2 stroke-[3]" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
