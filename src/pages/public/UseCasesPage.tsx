import { Headphones, BookOpen, ShoppingBag, FileText, Briefcase, GraduationCap, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const USE_CASES = [
  {
    icon: Headphones,
    title: 'Customer Support Concierge',
    tagline: 'Resolve up to 70% of routine inquiries instantly',
    description: 'Ingest knowledge bases, product manuals, refund terms, and warranty documentation to provide accurate, 24/7 answers with zero wait times.',
    metrics: '70% deflection rate • < 2s response time',
  },
  {
    icon: BookOpen,
    title: 'Interactive Technical Documentation',
    tagline: 'Turn static API docs and guides into conversational copilots',
    description: 'Help developers discover endpoints, debug code snippets, and navigate complex SDKs without hunting through hundreds of pages.',
    metrics: '5x faster developer onboarding',
  },
  {
    icon: ShoppingBag,
    title: 'E-Commerce Product Assistant',
    tagline: 'Personalized product recommendations on your store',
    description: 'Crawl product catalogs, size charts, and inventory descriptions to guide shoppers, suggest accessories, and reduce shopping cart abandonment.',
    metrics: '18% average order value uplift',
  },
  {
    icon: Briefcase,
    title: 'Internal Employee Knowledge Portal',
    tagline: 'Unify HR policies, IT troubleshooting, and company wikis',
    description: 'Empower remote teams to find standard operating procedures, medical benefits details, and onboarding tutorials securely and privately.',
    metrics: 'Eliminates repetitive internal Slack queries',
  },
  {
    icon: FileText,
    title: 'Legal & Contract Document Search',
    tagline: 'OCR and index hundreds of scanned agreements',
    description: 'Search across scanned PDF agreements, NDAs, and regulatory disclosures with semantic vector search and exact citation references.',
    metrics: 'Instant clause discovery across thousands of pages',
  },
  {
    icon: GraduationCap,
    title: 'Higher Education & Course Copilot',
    tagline: 'Interactive study assistance for students and faculty',
    description: 'Index course syllabi, lecture notes, and textbook excerpts to help students quiz themselves and understand difficult conceptual topics.',
    metrics: 'Available 24/7 during exam cycles',
  },
]

export default function UseCasesPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <Badge variant="brand" className="mb-3">
            Industry Solutions
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Built for Any Knowledge-Intensive Workflow
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover how leading organizations deploy specialized Qezvo Agent AI assistants to accelerate support, sales, and employee productivity.
          </p>
        </div>

        {/* Use cases grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon
            return (
              <Card key={uc.title} className="border-border/80 flex flex-col justify-between hover:border-brand-500/40 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{uc.title}</CardTitle>
                  <p className="text-xs font-semibold text-brand-500 mt-1">{uc.tagline}</p>
                  <CardDescription className="text-sm mt-3 leading-relaxed">
                    {uc.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs font-medium text-muted-foreground">
                    {uc.metrics}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Bottom banner */}
        <div className="rounded-3xl border border-border bg-card p-10 text-center space-y-4 max-w-4xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold">Have a unique use case?</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Our API and webhook integrations allow you to plug custom AI agents into virtually any enterprise pipeline or application.
          </p>
          <div className="pt-2">
            <Link to="/contact">
              <Button variant="brand" size="lg">
                Talk with our Solutions Team
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
