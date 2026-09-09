import { ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function AcceptableUsePage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">
            <ShieldAlert className="h-3 w-3 mr-1" />
            Platform Standards
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Acceptable Use Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Purpose and Scope</h2>
            <p>
              This Acceptable Use Policy outlines the rules and prohibited conduct when using Qezvo Agent, its APIs, ingestion workers, and embedded agent widgets.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Prohibited Content and Conduct</h2>
            <p>You may not use Qezvo Agent to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Crawl or scan private internal networks, link-local addresses, or cloud metadata endpoints.</li>
              <li>Ingest or distribute malware, ransomware, exploit payloads, or malicious scripts.</li>
              <li>Generate deceptive impersonations, automated spam, or coordinated disinformation.</li>
              <li>Harvest personally identifiable financial, medical, or national identification credentials without authorization.</li>
              <li>Perform denial of service attacks, scrape target sites beyond reasonable rate boundaries, or disregard robots.txt prohibitions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Enforcement &amp; Account Termination</h2>
            <p>
              We reserve the right to immediately suspend or permanently terminate any agent or organization account identified as violating this policy, without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
