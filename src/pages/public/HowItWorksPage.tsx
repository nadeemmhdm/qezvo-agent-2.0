import { Link } from 'react-router-dom'
import {
  UploadCloud, Cpu, Globe2, ShieldCheck, ArrowRight,
  Sparkles, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  {
    step: '01',
    title: 'Ingest & Index Your Knowledge',
    description: 'Feed your agent any type of enterprise content. Point it to your website URL, upload a sitemap.xml, upload raw PDF manuals (including scanned documents via automatic OCR), or paste text directly into your dashboard.',
    icon: UploadCloud,
    highlights: [
      'Stateless web crawler with automatic boilerplate removal',
      'High-speed OCR parses scanned documents & receipts',
      'SSRF safe: private IPs and internal AWS endpoints strictly blocked',
    ],
  },
  {
    step: '02',
    title: 'Select & Tune Your AI Model',
    description: 'Assign your preferred AI foundation model from top open-weights options like Llama 3.3, DeepSeek V3, and Qwen 2.5, or securely connect your own private Ollama instance.',
    icon: Cpu,
    highlights: [
      'Define custom system prompts, tone of voice & persona boundaries',
      'Configurable temperature, top_p, and context windows',
      'Zero model prompt injection leak protections',
    ],
  },
  {
    step: '03',
    title: 'Customize Look & Brand Styling',
    description: 'Match your agent’s appearance to your brand guidelines. Select custom primary brand colors, chat bubble icons, avatar graphics, welcome greetings, and interactive suggested prompt buttons.',
    icon: Sparkles,
    highlights: [
      'Live preview sandbox right inside the visual customizer',
      'Custom CSS support for pixel-perfect integration',
      'Responsive design across mobile, tablet, and widescreen monitors',
    ],
  },
  {
    step: '04',
    title: 'Deploy via Widget, Custom Domain or API',
    description: 'Embed on any website using a single line of script, link your custom domain (e.g. support.yourcompany.com) with automated SSL, or stream responses directly via headless REST APIs.',
    icon: Globe2,
    highlights: [
      'Single-tag embed (<script src="..."></script>)',
      'Zero-storage chat privacy guarantees SOC2 compliance',
      'Automated Let’s Encrypt SSL certificates for custom domains',
    ],
  },
]

export default function HowItWorksPage() {
  return (
    <div className="py-16 md:py-24">
      {/* Hero */}
      <div className="container max-w-5xl mx-auto px-4 text-center mb-20">
        <Badge variant="brand" className="mb-4">
          <Sparkles className="h-3 w-3 mr-1" />
          End-to-End Workflow
        </Badge>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          How Qezvo Agent Powers Your AI
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From raw unstructured documents to production-ready customer-facing conversational intelligence in four straightforward steps.
        </p>
      </div>

      {/* Steps List */}
      <div className="container max-w-5xl mx-auto px-4 space-y-16 mb-24">
        {STEPS.map((s, idx) => {
          const Icon = s.icon
          const isEven = idx % 2 === 1
          return (
            <div
              key={s.step}
              className={`flex flex-col lg:flex-row items-center gap-10 md:gap-14 ${
                isEven ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Text Side */}
              <div className="flex-1 space-y-4">
                <span className="font-mono text-4xl md:text-5xl font-black text-brand-500/20">
                  {s.step}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold">{s.title}</h2>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  {s.description}
                </p>
                <div className="pt-2 space-y-2.5">
                  {s.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-brand-500 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphic / Card Side */}
              <div className="flex-1 w-full max-w-md">
                <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 relative overflow-hidden group hover:border-brand-500/50 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted/60" />
                    <div className="h-3 w-5/6 rounded bg-muted/40" />
                  </div>
                  <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Workflow Step {s.step}</span>
                    <span className="text-emerald-500 font-semibold flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" /> Automated
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA */}
      <div className="container max-w-4xl mx-auto px-4 text-center">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-background p-10 md:p-14 space-y-5">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Ready to build your AI Agent?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto">
            Get started today with no coding and no machine learning infrastructure management required.
          </p>
          <div className="pt-2">
            <Link to="/signup">
              <Button size="lg" variant="brand">
                Get started for free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
