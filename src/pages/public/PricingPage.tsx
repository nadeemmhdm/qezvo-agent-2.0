import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, HelpCircle, ArrowRight, Zap, Shield, Sparkles, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface PricingTier {
  id: string
  name: string
  icon: typeof User
  description: string
  monthlyPrice: number
  annualPrice: number
  popular?: boolean
  badge?: string
  ctaText: string
  ctaVariant: 'brand' | 'outline' | 'default'
  features: string[]
  limits: {
    agents: string
    documents: string
    ocrPages: string
    crawls: string
    domains: string
    teamMembers: string
    support: string
  }
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter',
    icon: User,
    description: 'Perfect for exploring and creating personal AI agents with your documents.',
    monthlyPrice: 0,
    annualPrice: 0,
    ctaText: 'Start for free',
    ctaVariant: 'outline',
    features: [
      '2 Active AI Agents',
      '50 Knowledge documents',
      '10 Web pages crawl limit',
      'Standard Ollama models (Llama 3, Mistral)',
      'Basic web embed widget',
      'Community support',
      'Zero-storage chat privacy',
    ],
    limits: {
      agents: '2',
      documents: '50 files',
      ocrPages: '10 pages / mo',
      crawls: '10 pages / crawl',
      domains: 'None (forge.app subpath)',
      teamMembers: '1 seat',
      support: 'Community forum',
    },
  },
  {
    id: 'pro',
    name: 'Professional',
    icon: Sparkles,
    description: 'For fast-growing companies and creators wanting full customization and custom domains.',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: true,
    badge: 'Most Popular',
    ctaText: 'Start 14-day free trial',
    ctaVariant: 'brand',
    features: [
      '10 Active AI Agents',
      '1,000 Knowledge documents',
      'Unlimited website crawls & sitemaps',
      '500 OCR pages included / mo',
      'All AI Models (Llama 3.3, Qwen 2.5, DeepSeek)',
      'Custom domains (CNAME with auto SSL)',
      'Custom CSS widget white-labeling',
      'Full REST API & webhook triggers',
      'Priority email support',
    ],
    limits: {
      agents: '10',
      documents: '1,000 files',
      ocrPages: '500 pages / mo',
      crawls: '500 pages / crawl',
      domains: '3 Custom domains',
      teamMembers: '5 seats',
      support: 'Priority email (< 6h)',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    description: 'High-volume organizations requiring dedicated capacity, SS0, and custom SLA agreements.',
    monthlyPrice: 199,
    annualPrice: 159,
    ctaText: 'Upgrade to Enterprise',
    ctaVariant: 'default',
    features: [
      'Unlimited Active AI Agents',
      '100,000+ Knowledge documents',
      'High-throughput OCR with dedicated queue',
      'Private dedicated inference worker instances',
      'Unlimited custom domains & white-labeling',
      'SSO (SAML, Okta, Azure AD) integration',
      'Role-based access control & audit logs',
      'Custom SLA & dedicated account manager',
      'Custom data processing addendum (DPA)',
    ],
    limits: {
      agents: 'Unlimited',
      documents: 'Unlimited',
      ocrPages: '5,000+ pages / mo',
      crawls: 'Unlimited',
      domains: 'Unlimited',
      teamMembers: 'Unlimited seats',
      support: '24/7 Phone & Slack channel',
    },
  },
]

const FAQS = [
  {
    question: 'How does the 14-day trial work?',
    answer: 'You can test all Professional tier capabilities completely free for 14 days. No credit card is required to sign up and get started.',
  },
  {
    question: 'Do you store our customers’ chat messages or sensitive queries?',
    answer: 'No. Qezvo Agent is engineered with strict zero-knowledge architecture for chat transcripts. Conversation queries are streamed ephemerally through the inference pipeline and are never written to disk or database.',
  },
  {
    question: 'Can I bring my own Ollama server or custom model weights?',
    answer: 'Yes! In your agent settings, you can either select from our high-speed global inference cluster or configure a custom private Ollama/OpenAI-compatible inference endpoint URL with custom headers.',
  },
  {
    question: 'How do custom domains work?',
    answer: 'Once you add your custom domain (like `assistant.yourcompany.com`) in the Domains dashboard, Qezvo Agent provides DNS CNAME and TXT verification records and provisions automated Let\'s Encrypt SSL certificates.',
  },
  {
    question: 'Can I upgrade, downgrade, or cancel anytime?',
    answer: 'Yes, you can modify your subscription at any time directly from the Billing portal. When upgrading, prorated credits apply immediately.',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="py-16 md:py-24">
      {/* ── Header ── */}
      <div className="container max-w-5xl mx-auto px-4 text-center mb-16">
        <Badge variant="brand" className="mb-4">
          <Zap className="h-3 w-3 mr-1.5" />
          Predictable &amp; Transparent
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Simple pricing for teams of all sizes
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Deploy AI agents trained on your proprietary data. Start for free, upgrade when you need custom domains, team seats, or dedicated scale.
        </p>

        {/* Billing cycle switch */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <span className={`text-sm font-medium ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly billing
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual(!annual)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              annual ? 'bg-brand-500' : 'bg-muted'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                annual ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
            Annual billing
          </span>
          <Badge variant="success" className="text-xs ml-1 font-semibold">
            Save 20%
          </Badge>
        </div>
      </div>

      {/* ── Pricing Cards ── */}
      <div className="container max-w-6xl mx-auto px-4 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {TIERS.map((tier) => {
            const price = annual ? tier.annualPrice : tier.monthlyPrice
            const Icon = tier.icon

            return (
              <Card
                key={tier.id}
                className={`relative flex flex-col transition-all duration-300 ${
                  tier.popular
                    ? 'border-brand-500 shadow-xl shadow-brand-500/10 md:-translate-y-2'
                    : 'border-border/80 hover:border-border'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-brand-500 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <CardHeader className="pb-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                  <CardDescription className="min-h-[40px] text-sm mt-1.5">
                    {tier.description}
                  </CardDescription>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">${price}</span>
                    <span className="text-sm text-muted-foreground">
                      / month {annual && price > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground pt-2 border-t border-border">
                    What's included:
                  </div>
                  <ul className="space-y-2.5 text-sm">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/60">
                  <Link to={`/signup?plan=${tier.id}`} className="w-full">
                    <Button variant={tier.ctaVariant} className="w-full text-sm font-semibold" size="lg">
                      {tier.ctaText}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      {/* ── Feature Comparison Matrix Table ── */}
      <div className="container max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold">Compare all features &amp; resource quotas</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Detailed breakdown of resources included in every plan.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="py-4 px-6">Capability</th>
                <th className="py-4 px-6 text-center">Starter</th>
                <th className="py-4 px-6 text-center text-brand-500 bg-brand-500/5">Professional</th>
                <th className="py-4 px-6 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3.5 px-6 font-medium">Active AI Agents</td>
                <td className="py-3.5 px-6 text-center">2</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">10</td>
                <td className="py-3.5 px-6 text-center">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Knowledge Document Storage</td>
                <td className="py-3.5 px-6 text-center">50 files</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">1,000 files</td>
                <td className="py-3.5 px-6 text-center">100,000+ files</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">OCR Scanned PDF Processing</td>
                <td className="py-3.5 px-6 text-center">10 pages / mo</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">500 pages / mo</td>
                <td className="py-3.5 px-6 text-center">Custom / Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Web Scraping &amp; Sitemap Ingestion</td>
                <td className="py-3.5 px-6 text-center">10 pages</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">500 pages / crawl</td>
                <td className="py-3.5 px-6 text-center">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Custom Domains &amp; SSL</td>
                <td className="py-3.5 px-6 text-center">—</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">3 Domains</td>
                <td className="py-3.5 px-6 text-center">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Team Member Seats</td>
                <td className="py-3.5 px-6 text-center">1 seat</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">5 seats</td>
                <td className="py-3.5 px-6 text-center">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">SSRF URL Protection</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold">✓</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold bg-brand-500/5">✓</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Zero Chat Retention Guarantee</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold">✓</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold bg-brand-500/5">✓</td>
                <td className="py-3.5 px-6 text-center text-emerald-500 font-bold">✓</td>
              </tr>
              <tr>
                <td className="py-3.5 px-6 font-medium">Support SLA</td>
                <td className="py-3.5 px-6 text-center">Community</td>
                <td className="py-3.5 px-6 text-center font-semibold text-brand-500 bg-brand-500/5">&lt; 6h Email</td>
                <td className="py-3.5 px-6 text-center">24/7 Dedicated Slack</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── FAQ Section ── */}
      <div className="container max-w-4xl mx-auto px-4 mb-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-3">
            <HelpCircle className="h-3.5 w-3.5 mr-1" />
            Questions &amp; Answers
          </Badge>
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQS.map((faq) => (
            <div key={faq.question} className="p-6 rounded-2xl border border-border bg-card/60 space-y-2">
              <h3 className="font-semibold text-base">{faq.question}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Banner ── */}
      <div className="container max-w-5xl mx-auto px-4">
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-brand-500/5 to-background p-10 md:p-14 text-center relative overflow-hidden">
          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <Shield className="h-10 w-10 text-brand-500 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to create your custom AI agent?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base">
              Get started in under 3 minutes. Upload your docs, crawl your site, and share your assistant with the world.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" variant="brand" className="font-semibold shadow-lg shadow-brand-500/20">
                  Build your first agent now
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
