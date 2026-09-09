import { Sparkles, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface ChangelogRelease {
  version: string
  date: string
  title: string
  badge: 'Major' | 'Improvement' | 'Security'
  description: string
  changes: {
    type: 'Feature' | 'Improvement' | 'Fix' | 'Security'
    text: string
  }[]
}

const RELEASES: ChangelogRelease[] = [
  {
    version: 'v2.4.0',
    date: 'September 2026',
    title: 'DeepSeek V3 Model Support & High-Speed OCR Pipeline',
    badge: 'Major',
    description: 'Introducing support for DeepSeek V3 alongside Llama 3.3, plus a redesigned OCR pipeline capable of processing 20-page scanned documents in under 12 seconds.',
    changes: [
      { type: 'Feature', text: 'Added DeepSeek V3 with hybrid reasoning capabilities.' },
      { type: 'Feature', text: 'Scanned PDF OCR now automatically extracts tabular columns into markdown tables.' },
      { type: 'Improvement', text: 'Reduced widget initial bundle footprint to under 18 KB gzipped.' },
      { type: 'Security', text: 'Strengthened SSRF domain parser against DNS rebinding attacks.' },
    ],
  },
  {
    version: 'v2.3.1',
    date: 'August 2026',
    title: 'Automated Custom Domain SSL & CNAME Health Checks',
    badge: 'Improvement',
    description: 'Custom domains now benefit from automated ZeroSSL/Let’s Encrypt certificate issuance with 60-second DNS verification.',
    changes: [
      { type: 'Feature', text: 'Real-time DNS status detector on the Domains management page.' },
      { type: 'Improvement', text: 'Enhanced dark mode contrast on chat bubble embed launcher.' },
      { type: 'Fix', text: 'Resolved occasional session disconnect during long multi-paragraph streaming responses.' },
    ],
  },
  {
    version: 'v2.2.0',
    date: 'July 2026',
    title: 'Granular Scoped API Tokens & Audit Logging',
    badge: 'Security',
    description: 'Enterprise teams can now issue scoped API keys with fine-grained permissions (chat-only, read-knowledge, train-agent) and view full audit logs.',
    changes: [
      { type: 'Feature', text: 'Scoped API key generator with expiration and CIDR IP restrictions.' },
      { type: 'Feature', text: 'Team member role delegation: Admin, Editor, and Read-only Viewer.' },
      { type: 'Security', text: 'Enforced zero-storage chat privacy guarantee across all public routes.' },
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            <Sparkles className="h-3 w-3 mr-1" />
            Product Updates
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Qezvo Agent Changelog
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            New features, performance enhancements, and security upgrades shipped to Qezvo Agent.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative border-l border-border/80 pl-6 md:pl-10 space-y-12 ml-4 md:ml-6">
          {RELEASES.map((release) => (
            <div key={release.version} className="relative group">
              {/* Dot */}
              <div className="absolute -left-[31px] md:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-brand-500 ring-4 ring-background border-2 border-background flex items-center justify-center" />

              <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-brand-500">{release.version}</span>
                    <Badge variant={release.badge === 'Major' ? 'brand' : release.badge === 'Security' ? 'destructive' : 'outline'}>
                      {release.badge}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{release.date}</span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold">{release.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{release.description}</p>

                <div className="pt-2 border-t border-border/60">
                  <ul className="space-y-2 text-sm">
                    {release.changes.map((change, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            change.type === 'Feature'
                              ? 'bg-blue-500/10 text-blue-500'
                              : change.type === 'Improvement'
                              ? 'bg-purple-500/10 text-purple-500'
                              : change.type === 'Fix'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}
                        >
                          {change.type}
                        </span>
                        <span className="text-muted-foreground">{change.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Have a feature request or idea? We’d love to hear from you.
          </p>
          <Link to="/contact">
            <Button variant="outline" size="sm">
              Submit Feedback
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
