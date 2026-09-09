import { CheckCircle2, AlertTriangle, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { usePlatformServices, usePlatformMaintenance } from '@/features/admin/platformStore'

export default function StatusPage() {
  const { services, incidents } = usePlatformServices()
  const { maintenance } = usePlatformMaintenance()

  const hasDegraded = services.some((s) => s.status !== 'Operational')

  return (
    <div className="py-16 md:py-24">
      <div className="container max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge
            variant={maintenance.enabled || hasDegraded ? 'warning' : 'success'}
            className="mb-4 font-black uppercase text-xs shadow-[2px_2px_0px_0px_#000]"
          >
            {maintenance.enabled ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                Scheduled Maintenance Active
              </>
            ) : hasDegraded ? (
              <>
                <Activity className="h-3.5 w-3.5 mr-1" />
                Active Advisory
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                All Systems Operational
              </>
            )}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
            Qezvo Agent System Status
          </h1>
          <p className="text-muted-foreground text-sm font-semibold">
            Real-time status updates, Ollama Cloud latency, and service metrics • <a href="https://www.qezvo.in" target="_blank" rel="noreferrer" className="underline font-bold">www.qezvo.in</a>
          </p>
        </div>

        {/* Maintenance / Global Status Banner */}
        {maintenance.enabled ? (
          <div className="rounded-2xl border-2 border-black bg-[#FFE600] text-black p-6 mb-10 shadow-[5px_5px_0px_0px_#000] space-y-2">
            <div className="flex items-center gap-2.5 font-black text-base uppercase tracking-tight">
              <AlertTriangle className="h-5 w-5" />
              <span>Platform Maintenance Mode in Effect</span>
            </div>
            <p className="text-xs font-semibold leading-relaxed">
              {maintenance.message}
            </p>
            <div className="text-[11px] font-bold text-black/80 pt-1">
              Note: Embedded AI agent chat widgets and streaming inference APIs continue serving queries without disruption.
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 p-5 mb-10 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(16,185,129,0.5)]">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse border border-black/40" />
              <span className="font-bold text-sm text-foreground">
                All core APIs, crawler workers, and Ollama Cloud streaming nodes are performing normally.
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-mono font-bold">Live Status</span>
          </div>
        )}

        {/* Services List */}
        <div className="rounded-2xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden mb-12 shadow-[5px_5px_0px_0px_hsl(var(--neo-shadow))]">
          <div className="p-4 bg-muted/60 font-black text-xs uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Component</span>
            <div className="flex items-center gap-10">
              <span className="hidden sm:inline">Telemetry</span>
              <span>Status</span>
            </div>
          </div>
          {services.map((s) => (
            <div key={s.id || s.name} className="p-4 md:p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className={`h-4 w-4 shrink-0 stroke-[2.5] ${
                  s.status === 'Operational' ? 'text-emerald-500' : 'text-amber-500'
                }`} />
                <span className="font-bold text-sm text-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span className="hidden sm:inline font-mono font-semibold">Latency: {s.latency}</span>
                <span className="hidden md:inline font-mono">90d SLA: {s.uptime}</span>
                <span className={`px-2.5 py-1 rounded-lg border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] ${
                  s.status === 'Operational'
                    ? 'bg-[#23F074] text-black'
                    : s.status === 'Degraded Performance'
                    ? 'bg-[#FFE600] text-black'
                    : s.status === 'Under Maintenance'
                    ? 'bg-[#00F0FF] text-black'
                    : 'bg-[#FF5F56] text-white'
                }`}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Past Incidents */}
        <div className="space-y-4">
          <h3 className="text-lg font-black tracking-tight">Active &amp; Past Incident History</h3>
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div key={inc.id} className="rounded-2xl border-2 border-border bg-card p-6 space-y-2 shadow-[3px_3px_0px_0px_hsl(var(--neo-shadow))]">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-black text-sm text-foreground">{inc.title}</span>
                  <span className="font-mono font-bold">{inc.date}</span>
                </div>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  {inc.description}
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px] font-black uppercase tracking-wider">
                    Status: {inc.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-muted-foreground font-semibold">
          Platform managed by Affogato Solutions (Kerala, India) • Contact support:{' '}
          <a href="mailto:support@qezvo.in" className="underline font-mono">support@qezvo.in</a>
        </div>
      </div>
    </div>
  )
}
