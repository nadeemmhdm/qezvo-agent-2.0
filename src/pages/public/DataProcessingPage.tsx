import { FileCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function DataProcessingPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">
            <FileCheck className="h-3 w-3 mr-1" />
            GDPR Compliance
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Data Processing Addendum (DPA)</h1>
          <p className="text-muted-foreground text-sm">
            Standard Contractual Clauses &amp; GDPR Data Protection Addendum
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. Overview &amp; Roles</h2>
            <p>
              This Data Processing Addendum ("DPA") supplements the Terms of Service between Qezvo Agent ("Data Processor") and the customer ("Data Controller").
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Scope of Processing</h2>
            <p>
              The Processor processes uploaded documents, sitemaps, and text exclusively to generate high-dimensional vector embeddings and provide semantic search answers on behalf of the Controller. The Processor does not retain end-user conversational interactions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Security Measures &amp; Audits</h2>
            <p>
              The Processor maintains technical and organizational measures to ensure a level of security appropriate to the risk, including AES-256 encryption at rest, TLS 1.3 encryption in transit, multi-factor authentication for administrative access, and regular vulnerability audits.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">4. Sub-Processors</h2>
            <p>
              The Processor engages infrastructure sub-processors (such as Cloudflare and AWS for edge distribution and secure GPU clusters) subject to strict written data protection obligations at least as restrictive as those in this DPA.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
