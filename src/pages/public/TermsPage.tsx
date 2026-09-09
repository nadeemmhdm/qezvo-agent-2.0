import { ShieldCheck, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const SECTIONS = [
  {
    num: '01',
    title: 'Agreement to Terms',
    content: 'By accessing or using the Qezvo Agent platform ("Service", accessible at www.qezvo.in), developed and managed by Affogato Solutions (Kerala, India), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services or APIs.',
  },
  {
    num: '02',
    title: 'Account Registration and Security',
    content: 'You are responsible for maintaining the confidentiality of your account credentials, Firebase session tokens, and scoped API keys. You agree to notify us immediately at team@qezvo.in of any unauthorized access or use of your organization workspace.',
  },
  {
    num: '03',
    title: 'Acceptable Use & Prohibited Actions',
    content: 'You agree not to use Qezvo Agent to crawl unauthorized internal private networks (RFC 1918), bypass SSRF protections, generate malicious payloads, or conduct automated denial of service attacks against external domains. All web crawling must comply with applicable site terms and robots.txt directives.',
  },
  {
    num: '04',
    title: 'Intellectual Property & Ownership',
    content: 'You retain all rights, title, and intellectual property ownership in the data, files, and knowledge materials you upload to Qezvo Agent. We claim no ownership over your proprietary documents or trained agent weights.',
  },
  {
    num: '05',
    title: 'Service Availability & SLA',
    content: 'While we engineer our distributed vector indexing and inference cluster for 99.9% uptime, the Service is provided "as is". Paid Enterprise plans are covered by specific Service Level Agreements and dedicated support channels.',
  },
  {
    num: '06',
    title: 'Legal Inquiries & Governing Law',
    content: 'For any questions concerning these Terms, contact our legal and compliance team at team@qezvo.in. Qezvo Agent is an open-source product developed and managed by Affogato Solutions under Indian laws and regulations (Kerala jurisdiction).',
  },
]

export default function TermsPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="warning" className="mb-4">
            <Scale className="h-3.5 w-3.5 mr-1 text-black" />
            Legal Agreement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-muted-foreground text-sm font-semibold">
            Last updated: September 1, 2026 • Version 2.4
          </p>
        </div>

        {/* Commitment box */}
        <div className="rounded-2xl border-2 border-border bg-[#FFE600] text-black p-6 shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))] mb-12 flex items-start gap-4">
          <ShieldCheck className="h-7 w-7 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-black text-base uppercase tracking-tight">Our Core Commitment to Customers</h3>
            <p className="text-sm font-medium leading-relaxed">
              We will never claim ownership over your knowledge data, we will never use your private documents to train global public models, and we enforce a strict Zero-Storage chat architecture across all user interactions.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {SECTIONS.map((sec) => (
            <div
              key={sec.num}
              className="rounded-2xl border-2 border-border bg-card p-6 md:p-8 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] transition-transform hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))]"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-primary text-white border-2 border-border shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]">
                  {sec.num}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">{sec.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed pl-1">
                {sec.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
