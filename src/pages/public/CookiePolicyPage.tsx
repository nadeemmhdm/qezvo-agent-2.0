import { Cookie } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export default function CookiePolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="brand" className="mb-3">
            <Cookie className="h-3 w-3 mr-1" />
            Compliance
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">Cookie Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none space-y-8 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device to ensure core application functionality, maintain your active authenticated session, and save your UI appearance preferences (such as light or dark theme).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">2. Strictly Necessary Cookies</h2>
            <p>
              We utilize essential authentication session cookies (such as Firebase Auth and CSRF tokens) required for you to navigate the dashboard and perform authorized administrative actions. These cookies cannot be deactivated.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">3. Zero Advertising or Tracking Cookies</h2>
            <p>
              Qezvo Agent does not use third-party behavioral advertising cookies, data broker trackers, or cross-site tracking beacons. Your usage inside the platform is never shared with advertiser networks.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
