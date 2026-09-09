import { useState } from 'react'
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Sales Inquiry',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            <Mail className="h-3 w-3 mr-1" />
            Get In Touch
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Contact Qezvo Agent
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Whether you have questions about custom enterprise deployment, pricing, or need technical assistance, our team is here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Contact Details */}
          <div className="md:col-span-5 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Let's talk about your AI roadmap</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Connect directly with our engineering and solutions architecture team to discuss high-throughput agent indexing, private LLM deployments, and enterprise security requirements.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
                <Mail className="h-5 w-5 text-[#FFE600] shrink-0 mt-0.5 fill-black stroke-black" />
                <div>
                  <h4 className="font-black text-foreground">Support &amp; Inquiries</h4>
                  <a href="mailto:support@qezvo.in" className="text-muted-foreground text-xs mt-0.5 hover:underline font-mono font-bold block">
                    support@qezvo.in
                  </a>
                  <p className="text-[10px] text-muted-foreground font-mono">Admin: qezvooffical@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
                <MapPin className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <h4 className="font-black text-foreground">Developed &amp; Managed By</h4>
                  <p className="text-foreground text-xs mt-0.5 font-bold">Affogato Solutions</p>
                  <p className="text-muted-foreground text-xs">Kerala, India 🇮🇳 • <a href="https://affogato.solutions" target="_blank" rel="noreferrer" className="underline font-bold text-primary">affogato.solutions</a></p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border-2 border-border bg-card shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
                <MessageSquare className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5 stroke-[2.5]" />
                <div>
                  <h4 className="font-black text-foreground">Official Website</h4>
                  <a href="https://www.qezvo.in" target="_blank" rel="noreferrer" className="text-muted-foreground text-xs mt-0.5 hover:underline font-mono font-bold block">
                    www.qezvo.in
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-7">
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-bold">Message received!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Thank you for reaching out. A solutions engineer will review your note and respond within 24 hours.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Name"
                      placeholder="Alex Morgan"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <Input
                      label="Work Email"
                      type="email"
                      placeholder="alex@company.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Inquiry Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Sales Inquiry">Sales &amp; Enterprise Plans</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Partnership">Technology Partnership</option>
                      <option value="Security">Security &amp; Compliance</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Message</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tell us about your project, expected usage, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <Button type="submit" variant="brand" className="w-full" size="lg">
                    <Send className="h-4 w-4 mr-2" />
                    Submit message
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
