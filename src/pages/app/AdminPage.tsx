import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldAlert, ShieldCheck, Power, Activity, Users, CreditCard,
  AlertTriangle, Search, Save, Plus, ArrowLeft,
  Server, Cpu, Edit2, Trash2, X, Check
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  ADMIN_EMAIL,
  usePlatformMaintenance,
  usePlatformServices,
  usePlatformUsers
} from '@/features/admin/platformStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

export default function AdminPage() {
  const { user } = useAuth()
  const { maintenance, toggleMaintenance } = usePlatformMaintenance()
  const { services, incidents, updateService, addIncident, updateIncident, deleteIncident } = usePlatformServices()
  const { users, updateUserStatus, updateUserPlan } = usePlatformUsers()

  const [activeTab, setActiveTab] = useState<'maintenance' | 'status' | 'users' | 'plans'>('maintenance')
  const [maintenanceReason, setMaintenanceReason] = useState(maintenance.message)
  const [userSearch, setUserSearch] = useState('')

  // Incident form state
  const [showIncidentForm, setShowIncidentForm] = useState(false)
  const [incidentTitle, setIncidentTitle] = useState('')
  const [incidentSeverity, setIncidentSeverity] = useState<'resolved' | 'monitoring' | 'investigating'>('investigating')
  const [incidentDesc, setIncidentDesc] = useState('')

  // Incident editing state
  const [editingIncidentId, setEditingIncidentId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSeverity, setEditSeverity] = useState<'resolved' | 'monitoring' | 'investigating'>('investigating')
  const [editDesc, setEditDesc] = useState('')

  // Check admin authorization
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  if (!isAdmin) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <div className="rounded-2xl border-2 border-border bg-[#FF5F56]/15 p-8 shadow-[6px_6px_0px_0px_hsl(var(--neo-shadow))] space-y-4 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FF5F56] text-white border-2 border-black mx-auto flex items-center justify-center shadow-[3px_3px_0px_0px_#000]">
            <ShieldAlert className="h-8 w-8 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Admin Access Restricted</h2>
          <p className="text-sm font-medium text-muted-foreground leading-relaxed">
            This administration control panel is strictly restricted. Only the verified platform administrator email (<strong className="text-foreground">{ADMIN_EMAIL}</strong>) is permitted to manage Qezvo Agent system services, maintenance mode, and user accounts.
          </p>
          <div className="p-3 bg-card rounded-xl border-2 border-border font-mono text-xs font-bold text-muted-foreground">
            Current Authenticated User: {user?.email || 'Anonymous Guest'}
          </div>
          <div className="pt-2">
            <Link to="/app/dashboard">
              <Button variant="outline" className="font-black">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to My Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleMaintenanceToggle = () => {
    const nextState = !maintenance.enabled
    toggleMaintenance(nextState, maintenanceReason)
    toast.success(
      nextState ? 'Maintenance Mode Activated' : 'Maintenance Mode Deactivated',
      nextState
        ? 'Public logins and signups are now paused. Admin account and AI agents continue running.'
        : 'Platform is fully online for all users.'
    )
  }

  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault()
    if (!incidentTitle.trim()) return

    addIncident({
      title: incidentTitle,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      severity: incidentSeverity,
      description: incidentDesc,
    })

    setIncidentTitle('')
    setIncidentDesc('')
    setShowIncidentForm(false)
    toast.success('Incident Broadcasted', 'Status page has been updated with the new advisory.')
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.plan.toLowerCase().includes(userSearch.toLowerCase())
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black shadow-[3px_3px_0px_0px_#000]">
            <ShieldCheck className="h-7 w-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">Qezvo Agent Control Center</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black border border-border">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              Authorized session: <strong className="text-foreground">{user?.email}</strong> • Affogato Solutions Kerala
            </p>
          </div>
        </div>

        {/* Global Maintenance Quick Status */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_0px_#000] ${
            maintenance.enabled ? 'bg-[#FF5F56] text-white' : 'bg-[#23F074] text-black'
          }`}>
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            <span>{maintenance.enabled ? 'Maintenance ACTIVE' : 'Platform ONLINE'}</span>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'maintenance', label: 'Maintenance Mode', icon: Power },
          { id: 'status', label: 'Status Page & Services', icon: Activity },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'plans', label: 'Plans & Quotas', icon: CreditCard },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id as any)}
            className={`px-4 py-2 rounded-xl border-2 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
              activeTab === id
                ? 'bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_0px_#000]'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]'
            }`}
          >
            <Icon className="h-4 w-4 stroke-[2.5]" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: MAINTENANCE MODE ── */}
      {activeTab === 'maintenance' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 space-y-6">
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 font-black text-xl">
                    <Power className="h-5 w-5" />
                    Platform Maintenance Switch
                  </CardTitle>
                  <Button
                    onClick={handleMaintenanceToggle}
                    className={`font-black text-xs uppercase tracking-wider ${
                      maintenance.enabled
                        ? 'bg-[#23F074] text-black hover:bg-emerald-400 border-2 border-black shadow-[3px_3px_0px_0px_#000]'
                        : 'bg-[#FF5F56] text-white hover:bg-red-600 border-2 border-black shadow-[3px_3px_0px_0px_#000]'
                    }`}
                  >
                    {maintenance.enabled ? 'Turn OFF Maintenance' : 'Turn ON Maintenance'}
                  </Button>
                </div>
                <CardDescription className="text-xs font-semibold">
                  Enable or disable global maintenance mode across the entire Qezvo Agent SaaS.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Public Maintenance Notice
                  </label>
                  <Input
                    value={maintenanceReason}
                    onChange={(e) => setMaintenanceReason(e.target.value)}
                    placeholder="Describe maintenance work..."
                    className="font-semibold text-sm"
                  />
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toggleMaintenance(maintenance.enabled, maintenanceReason)
                        toast.success('Notice Updated', 'The public maintenance message was saved.')
                      }}
                      className="font-black text-xs"
                    >
                      <Save className="h-3.5 w-3.5 mr-1" />
                      Save Message
                    </Button>
                  </div>
                </div>

                {/* Behavioral Rules Alert */}
                <div className="p-4 rounded-xl border-2 border-border bg-[#FFE600]/20 space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    Maintenance Mode Rules &amp; Safeguards
                  </h4>
                  <ul className="text-xs font-medium text-foreground/90 space-y-1.5 list-disc pl-5">
                    <li><strong className="text-foreground">Sign In &amp; Registration:</strong> Regular users are blocked from logging in or registering new accounts while active.</li>
                    <li><strong className="text-foreground">Admin Account Safe Harbor:</strong> Your admin email (<code className="font-bold">{ADMIN_EMAIL}</code>) can always authenticate and access all controls.</li>
                    <li><strong className="text-foreground">Zero AI Agent Interruption:</strong> Live widgets, embedded chat windows, and public AI agent endpoints (<code className="font-bold">/a/:slug</code>) continue to respond normally.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-5 space-y-6">
            <Card className="border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <CardHeader>
                <CardTitle className="font-black text-lg flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Live Preview on Auth Pages
                </CardTitle>
                <CardDescription className="text-xs font-semibold">
                  What visitors see on <code className="font-bold">/login</code> and <code className="font-bold">/signup</code> right now.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-xl border-2 border-border bg-card shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${maintenance.enabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                    <span className="font-black text-sm">
                      {maintenance.enabled ? 'Maintenance Banner Displayed' : 'Normal Operations (No Banner)'}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {maintenance.enabled
                      ? `"${maintenance.message}"`
                      : 'Auth gates are open for regular users.'}
                  </p>
                  <div className="pt-2 flex gap-2">
                    <Link to="/login" target="_blank">
                      <Button variant="outline" size="sm" className="text-xs font-black">
                        Preview /login
                      </Button>
                    </Link>
                    <Link to="/signup" target="_blank">
                      <Button variant="outline" size="sm" className="text-xs font-black">
                        Preview /signup
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: STATUS PAGE & SERVICES ── */}
      {activeTab === 'status' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">System Status Management</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Manage operational states shown publicly on <Link to="/status" target="_blank" className="underline font-bold text-foreground">qezvo.in/status</Link>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowIncidentForm(!showIncidentForm)}
                className="font-black text-xs"
              >
                <Plus className="h-4 w-4 mr-1" />
                {showIncidentForm ? 'Cancel Notice' : 'Post Status Incident'}
              </Button>
              <Link to="/status" target="_blank">
                <Button size="sm" className="font-black text-xs">
                  View Public Status Page
                </Button>
              </Link>
            </div>
          </div>

          {/* New Incident Form */}
          {showIncidentForm && (
            <form onSubmit={handleAddIncident} className="p-5 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] space-y-4">
              <h3 className="font-black text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Broadcast Status Incident or Maintenance Advisory
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Incident Title</label>
                  <Input
                    required
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    placeholder="e.g. Scheduled Maintenance or Latency Resolution"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground">Severity Level</label>
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value as any)}
                    className="w-full h-10 px-3 py-2 text-sm rounded-xl border-2 border-border bg-card font-bold text-foreground"
                  >
                    <option value="investigating">Investigating</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  placeholder="Explain what steps the team is taking..."
                  className="w-full p-3 rounded-xl border-2 border-border bg-card text-xs font-semibold text-foreground focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowIncidentForm(false)} className="font-bold">
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-black">
                  Publish Advisory
                </Button>
              </div>
            </form>
          )}

          {/* Services Table */}
          <div className="rounded-2xl border-2 border-border bg-card divide-y-2 divide-border overflow-hidden shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
            <div className="p-4 bg-muted/60 flex items-center justify-between font-black text-xs uppercase tracking-wider text-muted-foreground">
              <span>Service Component</span>
              <div className="flex items-center gap-12 mr-4">
                <span>Latency</span>
                <span>Operational Status</span>
              </div>
            </div>
            {services.map((svc) => (
              <div key={svc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-black text-sm text-foreground">{svc.name}</div>
                  <div className="text-xs font-mono text-muted-foreground">90d SLA: {svc.uptime}</div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={svc.latency}
                    onChange={(e) => updateService(svc.id, { latency: e.target.value })}
                    className="w-20 px-2 py-1 text-xs font-mono font-bold rounded-lg border-2 border-border bg-card text-center"
                  />
                  <select
                    value={svc.status}
                    onChange={(e) => updateService(svc.id, { status: e.target.value as any })}
                    className={`h-9 px-3 rounded-xl border-2 border-black font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] ${
                      svc.status === 'Operational'
                        ? 'bg-[#23F074] text-black'
                        : svc.status === 'Degraded Performance'
                        ? 'bg-[#FFE600] text-black'
                        : svc.status === 'Under Maintenance'
                        ? 'bg-[#00F0FF] text-black'
                        : 'bg-[#FF5F56] text-white'
                    }`}
                  >
                    <option value="Operational">Operational</option>
                    <option value="Degraded Performance">Degraded Performance</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Major Outage">Major Outage</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* Incidents List */}
          <div className="space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground">Active &amp; Past Incident Logs ({incidents.length})</h3>
            <div className="space-y-2">
              {incidents.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-border rounded-xl text-xs font-semibold text-muted-foreground">
                  No incident logs recorded. All systems operational.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-xl border-2 border-border bg-card shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] space-y-2">
                    {editingIncidentId === inc.id ? (
                      <div className="space-y-3 pt-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-[11px] font-black uppercase text-muted-foreground">Title</label>
                            <Input
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="font-bold text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black uppercase text-muted-foreground">Severity</label>
                            <select
                              value={editSeverity}
                              onChange={(e) => setEditSeverity(e.target.value as any)}
                              className="w-full h-10 px-3 py-1 text-xs rounded-xl border-2 border-border bg-card font-bold text-foreground"
                            >
                              <option value="investigating">Investigating</option>
                              <option value="monitoring">Monitoring</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-black uppercase text-muted-foreground">Description</label>
                          <textarea
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full p-2.5 rounded-xl border-2 border-border bg-card text-xs font-medium text-foreground focus:outline-none"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingIncidentId(null)}
                            className="h-7 text-xs font-bold"
                          >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              updateIncident(inc.id, {
                                title: editTitle,
                                severity: editSeverity,
                                description: editDesc,
                              })
                              setEditingIncidentId(null)
                              toast.success('Incident Updated', `Advisory "${editTitle}" saved.`)
                            }}
                            className="h-7 text-xs font-black bg-[#23F074] text-black hover:bg-emerald-400 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" />
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-foreground">{inc.title}</span>
                            <Badge
                              variant={inc.severity === 'resolved' ? 'success' : inc.severity === 'monitoring' ? 'warning' : 'destructive'}
                              className="text-[10px] font-black uppercase"
                            >
                              {inc.severity}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-mono text-xs text-muted-foreground">{inc.date}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs hover:bg-muted font-bold text-foreground"
                              onClick={() => {
                                setEditingIncidentId(inc.id)
                                setEditTitle(inc.title)
                                setEditSeverity(inc.severity)
                                setEditDesc(inc.description)
                              }}
                              title="Edit incident"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs hover:bg-destructive/10 text-destructive font-bold"
                              onClick={() => {
                                deleteIncident(inc.id)
                                toast.success('Incident Deleted', `Advisory "${inc.title}" removed.`)
                              }}
                              title="Delete incident"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{inc.description}</p>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: USER MANAGEMENT (SUSPEND / DISABLE / ACTIVATE) ── */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">User Accounts Management</h2>
              <p className="text-xs font-semibold text-muted-foreground">
                Control active user accounts, suspend violations, or disable compromised users.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or email..."
                className="pl-9 font-semibold text-xs"
              />
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-card divide-y-2 divide-border overflow-x-auto shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 uppercase border-b-2 border-border font-black text-muted-foreground">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Plan</th>
                  <th className="p-3.5">Agents / Quota</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-border font-semibold">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-black text-sm text-foreground">{u.name}</div>
                      <div className="text-xs font-mono text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-md border-2 border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000] ${
                        u.plan === 'Enterprise'
                          ? 'bg-[#00F0FF] text-black'
                          : u.plan === 'Business'
                          ? 'bg-[#FFE600] text-black'
                          : u.plan === 'Pro'
                          ? 'bg-[#23F074] text-black'
                          : 'bg-muted text-foreground'
                      }`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-muted-foreground">
                      <div>{u.agentsCount} / {u.maxAgents} agents</div>
                      <div className="text-[11px]">{u.requestsCount.toLocaleString()} / {u.requestsLimit.toLocaleString()} requests</div>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={u.status === 'active' ? 'success' : u.status === 'suspended' ? 'warning' : 'destructive'}
                        className="uppercase text-[10px] font-black"
                      >
                        {u.status}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? (
                        <span className="text-[11px] font-black text-muted-foreground italic">
                          Protected Super Admin
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          {u.status !== 'active' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateUserStatus(u.id, 'active')
                                toast.success('Account Activated', `${u.email} is now fully active.`)
                              }}
                              className="text-[10px] font-black h-7 bg-[#23F074] text-black hover:bg-emerald-400 border-black"
                            >
                              Activate
                            </Button>
                          )}
                          {u.status !== 'suspended' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateUserStatus(u.id, 'suspended')
                                toast.warning('Account Suspended', `${u.email} has been suspended.`)
                              }}
                              className="text-[10px] font-black h-7 bg-[#FFE600] text-black hover:bg-yellow-400 border-black"
                            >
                              Suspend
                            </Button>
                          )}
                          {u.status !== 'disabled' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                updateUserStatus(u.id, 'disabled')
                                toast.error('Account Disabled', `${u.email} access has been terminated.`)
                              }}
                              className="text-[10px] font-black h-7 bg-[#FF5F56] text-white hover:bg-red-600 border-black"
                            >
                              Disable
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: USER PLANS & QUOTAS MANAGEMENT ── */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-black">Plan &amp; Quota Assignment</h2>
            <p className="text-xs font-semibold text-muted-foreground">
              Upgrade or modify plan tiers, Ollama Cloud streaming bandwidth, and agent quotas per user.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {users.filter(u => u.email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()).map((u) => (
              <div key={u.id} className="p-5 rounded-2xl border-2 border-border bg-card shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-black text-base text-foreground">{u.name}</h3>
                    <p className="text-xs font-mono text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="brand" className="font-black text-[10px]">
                    {u.plan}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Allowed Agents:</span>
                    <span className="font-bold font-mono">{u.maxAgents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Requests Limit:</span>
                    <span className="font-bold font-mono">{u.requestsLimit.toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-2 border-t-2 border-border space-y-2">
                  <label className="text-[11px] font-black uppercase text-muted-foreground">Assign Plan</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['Free', 'Pro', 'Business', 'Enterprise'] as const).map((plan) => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => {
                          updateUserPlan(u.id, plan)
                          toast.success('Plan Updated', `${u.name} upgraded to ${plan} tier.`)
                        }}
                        className={`px-2 py-1.5 rounded-lg border-2 text-[11px] font-black transition-all ${
                          u.plan === plan
                            ? 'bg-[#FFE600] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                            : 'border-border bg-muted/60 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Open Source & Ollama Engine Architecture Notice ── */}
      <div className="p-6 rounded-2xl border-2 border-border bg-[#00F0FF]/15 shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))] space-y-3">
        <div className="flex items-center gap-2 font-black text-sm text-foreground">
          <Cpu className="h-5 w-5" />
          <span>Qezvo Agent Open-Source Architecture &amp; Ollama Cloud BYOK Engine</span>
        </div>
        <p className="text-xs text-foreground/90 font-medium leading-relaxed">
          Qezvo Agent is an open-source AI agent SaaS developed by Affogato Solutions in Kerala, India. Each user connects their own Ollama Cloud API Key (<code className="font-bold">OLLAMA_API_KEY</code>) to run enterprise models (GPT-OSS 120B, DeepSeek V4 Flash, Qwen 3.5) with zero consumer GPU lag, instant Time-To-First-Token, and zero conversation data retention.
        </p>
      </div>
    </div>
  )
}
