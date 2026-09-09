import { BookOpen, Calendar, ArrowRight, Sparkles, Shield, Cpu } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

const POSTS = [
  {
    slug: 'zero-storage-ai-architecture',
    title: 'Why We Engineered a Zero-Retention Architecture for Enterprise AI',
    date: 'September 3, 2026',
    category: 'Security & Engineering',
    author: 'Chief Security Architect',
    snippet: 'Storing customer chat interactions creates toxic liability. Here is how ephemeral in-memory streaming allows high-precision RAG without persisting user queries.',
    icon: Shield,
  },
  {
    slug: 'scaling-ocr-for-scanned-pdfs',
    title: 'High-Throughput OCR: Processing 10,000 Scanned Documents in Parallel',
    date: 'August 28, 2026',
    category: 'Architecture',
    author: 'ML Platform Lead',
    snippet: 'How our distributed serverless OCR pipeline achieves sub-second page extraction with automated tabular column restoration and noise removal.',
    icon: Cpu,
  },
  {
    slug: 'deepseek-v3-vs-llama-3',
    title: 'Benchmarking DeepSeek V3 vs Llama 3.3 for Retrieval Augmented Generation',
    date: 'August 14, 2026',
    category: 'AI Research',
    author: 'AI Research Team',
    snippet: 'A deep comparative study on reasoning latency, token efficiency, and citation fidelity across real enterprise customer support datasets.',
    icon: Sparkles,
  },
]

export default function BlogPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="brand" className="mb-3">
            <BookOpen className="h-3 w-3 mr-1" />
            Engineering &amp; Insights
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            The Qezvo Agent Blog
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto">
            Deep dives into RAG systems, distributed vector indexing, OCR pipelines, and production AI security.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POSTS.map((post) => {
            const Icon = post.icon
            return (
              <Card key={post.slug} className="border-border/80 flex flex-col justify-between hover:border-brand-500/40 transition-colors">
                <CardHeader>
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                  <CardTitle className="text-xl font-bold leading-snug">{post.title}</CardTitle>
                  <CardDescription className="text-sm mt-3 leading-relaxed">
                    {post.snippet}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-brand-500 pt-4 border-t border-border/50">
                    <span>{post.category}</span>
                    <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read article <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
