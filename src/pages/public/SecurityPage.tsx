import { Shield, Lock, EyeOff, Server, CheckCircle2, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export default function SecurityPage() {
  const SECURITY_PILLARS = [
    {
      title: 'SSRF & Egress Protection',
      icon: Shield,
      description: 'Our web ingestion pipeline validates all domain lookups at the DNS resolution stage to prevent Server-Side Request Forgery.',
      rules: [
        'Blocks loopback (127.0.0.0/8, ::1)',
        'Blocks link-local metadata (169.254.169.254 AWS/GCP/Azure)',
        'Blocks RFC 1918 private subnets (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)',
        'Protects against DNS rebinding via immediate socket connection pinning',
      ],
    },
    {
      title: 'Zero Chat Logging Architecture',
      icon: EyeOff,
      description: 'Your and your users’ conversation queries are treated as strictly ephemeral and are never written to long-term storage.',
      rules: [
        'Conversations streamed via server-sent events (SSE) solely in RAM',
        'No relational database tables or data lakes retain message contents',
        'Zero risk of user chat leakages in data breaches',
        'Complies inherently with GDPR Right to be Forgotten and HIPAA guidelines',
      ],
    },
    {
      title: 'Credential & Key Isolation',
      icon: Lock,
      description: 'API tokens, Ollama private connection keys, and administrative secrets are isolated behind hardened edge workers.',
      rules: [
        'Client browsers never receive Ollama API keys or model backend tokens',
        'Encrypted at rest using AES-256-GCM authenticated encryption',
        'Scoped API keys with token expiry and CIDR IP restrictions',
        'Automated rotation support for production team keys',
      ],
    },
    {
      title: 'Data Encryption & Transmission',
      icon: Server,
      description: 'End-to-end security throughout every layer of network transit and physical storage.',
      rules: [
        'Enforced TLS 1.3 encryption across all public and API endpoints',
        'HSTS preloaded headers with perfect forward secrecy (PFS)',
        'Vector knowledge embeddings encrypted at rest with hardware security modules (HSM)',
        'Cloudflare Edge DDoS mitigation with automatic rate limiting',
      ],
    },
  ]

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            <Shield className="h-3 w-3 mr-1" />
            Security &amp; Compliance
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Security Engineered into Every Layer
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            Qezvo Agent is designed from the ground up for strict data isolation, zero conversation logging, and robust network defenses.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {SECURITY_PILLARS.map((p) => {
            const Icon = p.icon
            return (
              <Card key={p.title} className="border-border/80">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{p.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed mt-1">
                    {p.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    {p.rules.map((rule) => (
                      <li key={rule} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Responsible Disclosure & Reporting */}
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold">Vulnerability Disclosure Program</h3>
            <p className="text-sm text-muted-foreground max-w-xl">
              We value the security community. If you identify a vulnerability or security risk, please report it immediately to our security response team.
            </p>
          </div>
          <Link to="/contact">
            <Button variant="outline" className="shrink-0">
              <Mail className="h-4 w-4 mr-2" />
              Report Security Issue
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
