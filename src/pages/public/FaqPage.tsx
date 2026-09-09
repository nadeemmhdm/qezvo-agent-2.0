import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface FAQItem {
  q: string
  a: string
  category: string
}

const ALL_FAQS: FAQItem[] = [
  {
    category: 'General',
    q: 'What is Qezvo Agent?',
    a: 'Qezvo Agent is a full-featured, open-source AI Agent Builder platform developed by Affogato Solutions in Kerala, India. It allows teams and creators to build, index, and deploy conversational AI assistants trained on their proprietary websites, documents, OCR-scanned PDFs, and knowledge bases without writing code.',
  },
  {
    category: 'General',
    q: 'Do I need machine learning expertise to use Qezvo Agent?',
    a: 'No. Everything from document parsing, vector indexing, OCR extraction, and Ollama Cloud model orchestration is handled automatically by our infrastructure.',
  },
  {
    category: 'Knowledge & Data',
    q: 'What data sources are supported?',
    a: 'You can connect live websites (with recursive crawling and sitemap.xml ingestion), upload documents (PDF, DOCX, Markdown, TXT), process physical scanned PDFs using our OCR pipeline, or paste raw text and FAQs.',
  },
  {
    category: 'Knowledge & Data',
    q: 'How frequently can my agents resynchronize knowledge?',
    a: 'Depending on your plan, you can trigger manual resyncs or schedule automated daily or weekly crawls to keep your agent’s answers synchronized with your latest documentation.',
  },
  {
    category: 'Privacy & Security',
    q: 'Do you store or sell customer chat queries?',
    a: 'Never. Qezvo Agent enforces a strict zero-retention chat architecture. Queries and conversation sessions exist solely in ephemeral memory during the real-time inference stream and are immediately wiped.',
  },
  {
    category: 'Privacy & Security',
    q: 'How does SSRF protection work?',
    a: 'Our web crawler enforces IP blocklists at the DNS resolution level, discarding all attempts to query internal IP addresses (RFC 1918), loopback interfaces, or cloud metadata endpoints (such as 169.254.169.254).',
  },
  {
    category: 'Models & Inference',
    q: 'What AI models can I use?',
    a: 'We support leading open-weights models including Llama 3.3, DeepSeek V3, Qwen 2.5, and Mistral NeMo. You can also connect your own private self-hosted Ollama server endpoint.',
  },
  {
    category: 'Billing & Plans',
    q: 'Can I cancel or change plans at any time?',
    a: 'Yes, you can upgrade, downgrade, or cancel your subscription whenever you wish directly from the Billing page in your dashboard.',
  },
]

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'General', 'Knowledge & Data', 'Privacy & Security', 'Models & Inference', 'Billing & Plans']

  const filteredFaqs = selectedCategory === 'All'
    ? ALL_FAQS
    : ALL_FAQS.filter((f) => f.category === selectedCategory)

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">
            <HelpCircle className="h-3 w-3 mr-1" />
            Support &amp; Answers
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            Everything you need to know about building, indexing, and deploying AI agents with Qezvo Agent.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3 mb-16">
          {filteredFaqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-border bg-card overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-base hover:text-brand-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Support Callout */}
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center space-y-4">
          <h3 className="text-xl font-bold">Have another question?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Can’t find the answer you’re looking for? Reach out to our technical support team and we’ll get back to you promptly.
          </p>
          <Link to="/contact">
            <Button variant="brand" size="sm">
              Get in Touch
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
