import { useState } from 'react'
import {
  CreditCard, Check, Zap, Building, Star,
  ArrowRight, Download, AlertTriangle, TrendingUp, ShieldCheck, QrCode
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/ui/misc'
import { toast } from '@/hooks/use-toast'
import { triggerRazorpayCheckout, type RazorpaySuccessResponse } from '@/features/billing/razorpayService'
import { getRealInvoices, type RealInvoice } from '@/features/data/realDataStore'

type PlanId = 'free' | 'pro' | 'business'

interface Plan {
  id: PlanId
  name: string
  priceUsd: number
  priceInr: number
  icon: React.ElementType
  color: string
  description: string
  features: string[]
  limits: {
    agents: number | 'unlimited'
    messages: number | 'unlimited'
    sources: number | 'unlimited'
    teamMembers: number | 'unlimited'
  }
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceUsd: 0,
    priceInr: 0,
    icon: Zap,
    color: 'text-muted-foreground',
    description: 'Perfect for personal projects and experimentation',
    features: [
      '1 agent',
      '500 messages/month',
      '5 knowledge sources',
      'Community support',
      'Public agent URL',
      'Zero chat retention',
    ],
    limits: { agents: 1, messages: 500, sources: 5, teamMembers: 1 },
  },
  {
    id: 'pro',
    name: 'Pro',
    priceUsd: 29,
    priceInr: 1999,
    icon: Star,
    color: 'text-brand-500',
    description: 'For professionals and growing projects',
    features: [
      '10 agents',
      '20,000 messages/month',
      '100 knowledge sources',
      'Custom domains (CNAME)',
      'Widget embed',
      'Priority support',
      'Full analytics',
      'Razorpay instant billing',
    ],
    limits: { agents: 10, messages: 20000, sources: 100, teamMembers: 3 },
  },
  {
    id: 'business',
    name: 'Business',
    priceUsd: 99,
    priceInr: 6999,
    icon: Building,
    color: 'text-purple-500',
    description: 'For teams and high-traffic applications',
    features: [
      'Unlimited agents',
      'Unlimited messages',
      'Unlimited sources',
      'Custom domains',
      'Team workspace management',
      'Ollama Cloud API access',
      'SSO & advanced security',
      'Dedicated 99.9% SLA support',
    ],
    limits: {
      agents: 'unlimited',
      messages: 'unlimited',
      sources: 'unlimited',
      teamMembers: 'unlimited',
    },
  },
]

export default function BillingPage() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<PlanId>('free')
  const [upgrading, setUpgrading] = useState<PlanId | null>(null)
  const [invoices, setInvoices] = useState<RealInvoice[]>(getRealInvoices())

  const usage = {
    agents: { used: 0, limit: 1 },
    messages: { used: 0, limit: 500 },
    sources: { used: 0, limit: 5 },
  }

  const handleUpgradeWithRazorpay = async (planId: PlanId) => {
    setUpgrading(planId)
    try {
      await triggerRazorpayCheckout({
        planId,
        userEmail: user?.email ?? 'team@qezvo.in',
        userName: user?.displayName ?? 'Workspace Owner',
        currency: 'INR',
        onSuccess: (res: RazorpaySuccessResponse) => {
          setCurrentPlan(planId)
          setInvoices(getRealInvoices())
          setUpgrading(null)
          toast.success(
            'Plan Activated!',
            `Your workspace is now running on the ${planId.toUpperCase()} plan via Razorpay (${res.razorpay_payment_id}).`
          )
        },
        onError: (err) => {
          setUpgrading(null)
          toast.error('Payment Failed', err.message)
        },
        onDismiss: () => {
          setUpgrading(null)
        },
      })
    } catch {
      setUpgrading(null)
    }
  }

  const plan = PLANS.find((p) => p.id === currentPlan)!

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Billing & Subscription Plans"
        description="Manage your subscription, Razorpay payment gateway, and invoices"
      />

      {/* Gateway Notice Banner */}
      <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-black dark:border-yellow-600 rounded-lg shadow-[3px_3px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-400 border border-black rounded text-black font-bold">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-black dark:text-yellow-200">
              Official Payment Gateway: Razorpay
            </p>
            <p className="text-xs text-black/80 dark:text-yellow-300/80">
              Supports UPI (GPay, PhonePe, Paytm), RuPay, Credit/Debit Cards, & NetBanking across India & Global.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-black bg-white dark:bg-black font-mono text-xs font-bold shrink-0">
          Razorpay Secured 🔒
        </Badge>
      </div>

      {/* Current plan + usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-2 border-black shadow-[4px_4px_0px_#000]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Workspace Plan</CardTitle>
              <Badge variant="success" className="font-bold text-xs uppercase px-2.5 py-0.5">
                {plan.name} Tier
              </Badge>
            </div>
            <CardDescription>
              Flexible billing powered by Razorpay. Zero hidden charges.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black">
                {plan.priceInr === 0 ? '₹0' : `₹${plan.priceInr.toLocaleString('en-IN')}`}
              </span>
              <span className="text-sm text-muted-foreground font-semibold">
                ({plan.priceUsd === 0 ? '$0' : `$${plan.priceUsd}`})/month
              </span>
            </div>

            {/* Usage meters */}
            <div className="space-y-3 pt-2">
              {Object.entries(usage).map(([key, { used, limit }]) => {
                const pct = (used / limit) * 100
                const isWarning = pct > 80
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize font-semibold">{key}</span>
                      <span className={isWarning ? 'text-yellow-600 font-bold' : 'text-muted-foreground'}>
                        {used.toLocaleString()} / {limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden border border-black/20">
                      <div
                        className={`h-full transition-all ${
                          isWarning ? 'bg-yellow-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {Object.values(usage).some(({ used, limit }) => (used / limit) > 0.8) && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-100 border border-black text-xs font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-700" />
                You're approaching plan limits. Upgrade instantly with Razorpay to keep agents running without interruption.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Razorpay Gateway Card */}
        <Card className="border-2 border-black shadow-[4px_4px_0px_#000]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Payment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/40 border-2 border-black space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gateway</span>
                <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Razorpay Live
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <p className="text-xs font-medium">UPI, Cards, Netbanking</p>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Managed by Affogato Solutions, Kerala, India.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full font-bold border-2 border-black shadow-[2px_2px_0px_#000]"
              onClick={() => handleUpgradeWithRazorpay('pro')}
            >
              Pay with Razorpay
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plan comparison */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_#000]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Select a Plan
          </CardTitle>
          <CardDescription>
            Upgrade instantly using Razorpay UPI, Cards, or NetBanking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLANS.map((p) => {
              const Icon = p.icon
              const isCurrent = p.id === currentPlan
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border-2 p-5 space-y-4 transition-all ${
                    isCurrent
                      ? 'border-black bg-yellow-50 dark:bg-yellow-950/20 shadow-[4px_4px_0px_#000]'
                      : 'border-black/30 hover:border-black shadow-[2px_2px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${p.color}`} />
                      <span className="font-black text-base">{p.name}</span>
                    </div>
                    {isCurrent && (
                      <Badge variant="success" className="text-xs font-bold border border-black">
                        Active
                      </Badge>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black">
                        {p.priceInr === 0 ? '₹0' : `₹${p.priceInr.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-muted-foreground text-xs font-bold">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {p.priceUsd === 0 ? 'Free forever' : `Approx. $${p.priceUsd} USD`}
                    </p>
                  </div>

                  <ul className="space-y-1.5 pt-2 border-t border-border/50">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs font-medium text-foreground/80">
                        <Check className="h-3.5 w-3.5 text-green-600 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {!isCurrent ? (
                    <Button
                      size="sm"
                      variant={p.id === 'business' ? 'default' : 'outline'}
                      className="w-full font-bold border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px]"
                      disabled={upgrading === p.id}
                      onClick={() => handleUpgradeWithRazorpay(p.id)}
                    >
                      {upgrading === p.id ? (
                        'Opening Razorpay…'
                      ) : (
                        <>
                          Pay with Razorpay
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-full font-bold opacity-60 border-2 border-black"
                    >
                      Current Plan
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice history */}
      <Card className="border-2 border-black shadow-[4px_4px_0px_#000]">
        <CardHeader>
          <CardTitle className="text-base">Razorpay Invoice & Transaction History</CardTitle>
          <CardDescription>
            All completed payments and subscriptions are recorded here with official transaction IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold">No Razorpay transactions yet</p>
              <p className="text-xs mt-1">
                When you upgrade a plan using Razorpay, your receipt and invoice will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-semibold">{inv.plan} — {inv.date}</p>
                      <p className="text-xs font-mono text-muted-foreground">{inv.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black">{inv.amount}</span>
                    <Badge variant="success" className="text-xs font-bold border border-black">
                      {inv.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => toast.info('Receipt', `Invoice ${inv.id} downloaded.`)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
