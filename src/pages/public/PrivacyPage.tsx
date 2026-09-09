import { Shield, EyeOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function PrivacyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">
            <Shield className="h-3 w-3 mr-1" />
            Data Protection
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last revised: September 1, 2026 • Version 2.4
          </p>
        </div>

        {/* Commitment Highlight */}
        <div className="p-6 rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)] mb-12 space-y-2">
          <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
            <EyeOff className="h-5 w-5" />
            <span>Zero-Storage Ephemeral Chat Architecture</span>
          </div>
          <p className="text-xs font-medium text-foreground/85 leading-relaxed">
            Qezvo Agent (<a href="https://www.qezvo.in" target="_blank" rel="noreferrer" className="underline font-bold">www.qezvo.in</a>), developed and managed by Affogato Solutions in Kerala, India, enforces an uncompromising architectural guarantee: we do not store, log, retain, or monetize the conversation messages exchanged between your users and your AI agents. All message exchanges are processed strictly in ephemeral system memory during real-time streaming inference and are immediately purged.
          </p>
        </div>

        <div className="space-y-8 text-sm text-muted-foreground font-medium leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-xl font-black text-foreground">1. Information We Collect</h2>
            <p>
              To provide the Qezvo Agent service, we collect basic account credentials (such as your email address and authentication tokens), and the knowledge base materials you intentionally upload (such as website URLs, documentation files, PDFs, and text snippets).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-black text-foreground">2. How We Use Knowledge Base Data</h2>
            <p>
              The documents and URLs you submit are parsed, chunked, and transformed into mathematical vector embeddings strictly for the purpose of powering your private agent's retrieval queries. Your knowledge base is never shared with third parties, never used to train global foundation models, and remains completely isolated in your organization tenant.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-black text-foreground">3. Third-Party Ollama Cloud Inference Isolation</h2>
            <p>
              When an AI model generates responses, your prompts stream through isolated server edge proxies. Your third-party Ollama API Key (<code className="font-bold">OLLAMA_API_KEY</code>) is stored securely on the server and is never surfaced to client web browsers or logged to database tables.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-black text-foreground">4. Compliance with GDPR, CCPA, and Indian DPDP Act</h2>
            <p>
              You maintain full rights to access, export, or permanently delete your account, uploaded knowledge files, and agents at any time through the dashboard settings.
            </p>
          </section>

          <section className="space-y-2 p-5 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
            <h2 className="text-xl font-black text-foreground">5. Contact Our Privacy Team</h2>
            <p>
              For any questions regarding data handling, terms, or privacy inquiries, contact our dedicated team at:{' '}
              <a href="mailto:team@qezvo.in" className="font-mono font-bold text-foreground underline">
                team@qezvo.in
              </a>
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Affogato Solutions, Kerala, India • General Support:{' '}
              <a href="mailto:support@qezvo.in" className="underline font-mono">support@qezvo.in</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
