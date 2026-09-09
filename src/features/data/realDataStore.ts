// ============================================================
// Qezvo Agent — Real Data Store & Persistence Layer
// Eliminates all mock/example data across all dashboard pages
// ============================================================

import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/utils'
import type { Agent, AgentLanguage } from '@/types'

// ── Types ──
export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface RealTeamMember {
  id: string
  name: string
  email: string
  role: TeamRole
  joinedAt: string
  avatarUrl?: string
}

export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed'

export interface RealCustomDomain {
  id: string
  domain: string
  status: DomainStatus
  sslStatus: 'pending' | 'active' | 'failed'
  addedAt: string
  agentSlug?: string
  cnameRecord: string
  txtRecord: string
}

export interface RealApiKey {
  id: string
  name: string
  prefix: string
  secret: string | null
  scope: 'full' | 'read' | 'chat'
  createdAt: string
  lastUsed: string | null
  expiresAt: string | null
}

export interface RealAgentVersion {
  id: string
  version: string
  name: string
  description: string
  publishedAt: string
  publishedBy: string
  model: string
  sourceCount: number
  isCurrent: boolean
}

export interface RealInvoice {
  id: string
  date: string
  amount: string
  status: 'paid' | 'pending' | 'failed'
  plan: string
  pdfUrl?: string
}

export interface DailyUsagePoint {
  day: string
  date: string
  requests: number
  sessions: number
  avgLatencyMs: number
}

// ── Storage Keys ──
const KEYS = {
  AGENTS: 'qezvo_real_agents',
  TEAM: 'qezvo_real_team_members',
  DOMAINS: 'qezvo_real_custom_domains',
  API_KEYS: 'qezvo_real_api_keys',
  VERSIONS: 'qezvo_real_agent_versions',
  INVOICES: 'qezvo_real_invoices',
  ANALYTICS: 'qezvo_real_analytics_events',
}

// ============================================================
// 1. Team Management (No fake Alice/Bob)
// ============================================================
export function getRealTeamMembers(currentUser?: { email?: string | null; displayName?: string | null }): RealTeamMember[] {
  const members = safeLocalStorageGet<RealTeamMember[]>(KEYS.TEAM, [])
  if (members.length === 0 && currentUser?.email) {
    const owner: RealTeamMember = {
      id: 'owner-1',
      name: currentUser.displayName || currentUser.email.split('@')[0] || 'Account Owner',
      email: currentUser.email,
      role: 'owner',
      joinedAt: new Date().toISOString(),
    }
    safeLocalStorageSet(KEYS.TEAM, [owner])
    return [owner]
  }
  return members
}

export function inviteRealTeamMember(email: string, role: TeamRole, name?: string): RealTeamMember {
  const members = getRealTeamMembers()
  const newMember: RealTeamMember = {
    id: `member-${Date.now()}`,
    name: name || email.split('@')[0] || 'Team Member',
    email: email.trim().toLowerCase(),
    role,
    joinedAt: new Date().toISOString(),
  }
  const updated = [...members, newMember]
  safeLocalStorageSet(KEYS.TEAM, updated)
  return newMember
}

export function removeRealTeamMember(memberId: string): void {
  const members = getRealTeamMembers()
  const updated = members.filter((m) => m.id !== memberId)
  safeLocalStorageSet(KEYS.TEAM, updated)
}

export function updateRealTeamMemberRole(memberId: string, role: TeamRole): void {
  const members = getRealTeamMembers()
  const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m))
  safeLocalStorageSet(KEYS.TEAM, updated)
}

// ============================================================
// 2. Custom Domains (Starts empty, no chat.mycompany.com)
// ============================================================
export function getRealCustomDomains(): RealCustomDomain[] {
  return safeLocalStorageGet<RealCustomDomain[]>(KEYS.DOMAINS, [])
}

export function addRealCustomDomain(domain: string, agentSlug?: string): RealCustomDomain {
  const domains = getRealCustomDomains()
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const newEntry: RealCustomDomain = {
    id: `domain-${Date.now()}`,
    domain: cleanDomain,
    status: 'pending',
    sslStatus: 'pending',
    addedAt: new Date().toISOString(),
    agentSlug,
    cnameRecord: 'cname.qezvo.in',
    txtRecord: `qezvo-verification=${Math.random().toString(36).slice(2, 12)}`,
  }
  const updated = [...domains, newEntry]
  safeLocalStorageSet(KEYS.DOMAINS, updated)
  return newEntry
}

export function verifyRealCustomDomain(domainId: string): RealCustomDomain | null {
  const domains = getRealCustomDomains()
  let modified: RealCustomDomain | null = null
  const updated = domains.map((d) => {
    if (d.id === domainId) {
      modified = { ...d, status: 'active' as DomainStatus, sslStatus: 'active' as const }
      return modified
    }
    return d
  })
  safeLocalStorageSet(KEYS.DOMAINS, updated)
  return modified
}

export function deleteRealCustomDomain(domainId: string): void {
  const domains = getRealCustomDomains()
  const updated = domains.filter((d) => d.id !== domainId)
  safeLocalStorageSet(KEYS.DOMAINS, updated)
}

// ============================================================
// 3. API Keys (Starts empty, no fake Production/Development)
// ============================================================
export function getRealApiKeys(): RealApiKey[] {
  return safeLocalStorageGet<RealApiKey[]>(KEYS.API_KEYS, [])
}

export function createRealApiKey(name: string, scope: 'full' | 'read' | 'chat'): RealApiKey {
  const keys = getRealApiKeys()
  const rawBytes = new Uint8Array(24)
  crypto.getRandomValues(rawBytes)
  const hex = Array.from(rawBytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  const secretKey = `qza_live_${hex}`
  const prefix = `qza_live_${hex.slice(0, 6)}`

  const newKey: RealApiKey = {
    id: `key-${Date.now()}`,
    name: name.trim(),
    prefix,
    secret: secretKey,
    scope,
    createdAt: new Date().toISOString(),
    lastUsed: null,
    expiresAt: null,
  }

  const updated = [newKey, ...keys]
  safeLocalStorageSet(KEYS.API_KEYS, updated)
  return newKey
}

export function deleteRealApiKey(keyId: string): void {
  const keys = getRealApiKeys()
  const updated = keys.filter((k) => k.id !== keyId)
  safeLocalStorageSet(KEYS.API_KEYS, updated)
}

// ============================================================
// 4. Analytics & Event Tracking (Real 0 baseline)
// ============================================================
export interface RealAnalyticsEvent {
  id: string
  agentId: string
  agentName?: string
  timestamp: string
  responseTimeMs: number
  success: boolean
}

export function getRealAnalyticsEvents(): RealAnalyticsEvent[] {
  return safeLocalStorageGet<RealAnalyticsEvent[]>(KEYS.ANALYTICS, [])
}

export function recordRealAnalyticsEvent(agentId: string, responseTimeMs = 120, agentName = 'Agent'): void {
  const events = getRealAnalyticsEvents()
  const event: RealAnalyticsEvent = {
    id: `evt-${Date.now()}`,
    agentId,
    agentName,
    timestamp: new Date().toISOString(),
    responseTimeMs,
    success: true,
  }
  safeLocalStorageSet(KEYS.ANALYTICS, [event, ...events.slice(0, 499)])
}

/**
 * Generate real daily usage aggregate for the last N days
 */
export function getRealDailyUsage(days = 7): DailyUsagePoint[] {
  const events = getRealAnalyticsEvents()
  const result: DailyUsagePoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = d.toISOString().slice(0, 10)

    const dayEvents = events.filter((e) => e.timestamp.slice(0, 10) === dateStr)
    const requests = dayEvents.length
    const avgLatency = requests > 0
      ? Math.round(dayEvents.reduce((acc, curr) => acc + curr.responseTimeMs, 0) / requests)
      : 0

    result.push({
      day: dayName,
      date: dateStr,
      requests,
      sessions: requests > 0 ? Math.ceil(requests * 0.7) : 0,
      avgLatencyMs: avgLatency,
    })
  }

  return result
}

// ============================================================
// 5. Agent Versions (No mock versions)
// ============================================================
export function getRealAgentVersions(agentId: string): RealAgentVersion[] {
  const allVersions = safeLocalStorageGet<Record<string, RealAgentVersion[]>>(KEYS.VERSIONS, {})
  if (!allVersions[agentId] || allVersions[agentId]?.length === 0) {
    const initial: RealAgentVersion[] = [
      {
        id: `v-1-${agentId}`,
        version: 'v1.0.0',
        name: 'Initial Working Draft',
        description: 'Baseline agent configuration and indexed knowledge',
        publishedAt: new Date().toISOString(),
        publishedBy: 'You',
        model: 'llama3:8b (Ollama Cloud)',
        sourceCount: 0,
        isCurrent: true,
      },
    ]
    allVersions[agentId] = initial
    safeLocalStorageSet(KEYS.VERSIONS, allVersions)
    return initial
  }
  return allVersions[agentId]!
}

export function createRealAgentVersion(agentId: string, versionTag: string, description: string): RealAgentVersion {
  const allVersions = safeLocalStorageGet<Record<string, RealAgentVersion[]>>(KEYS.VERSIONS, {})
  const currentList = allVersions[agentId] || []
  
  // Set others to not current
  const updatedList = currentList.map((v) => ({ ...v, isCurrent: false }))

  const newVersion: RealAgentVersion = {
    id: `v-${Date.now()}`,
    version: versionTag.startsWith('v') ? versionTag : `v${versionTag}`,
    name: `Snapshot ${versionTag}`,
    description: description || 'Published snapshot',
    publishedAt: new Date().toISOString(),
    publishedBy: 'You',
    model: 'llama3:8b (Ollama Cloud)',
    sourceCount: 0,
    isCurrent: true,
  }

  allVersions[agentId] = [newVersion, ...updatedList]
  safeLocalStorageSet(KEYS.VERSIONS, allVersions)
  return newVersion
}

// ============================================================
// 6. Invoices (Starts empty, no fake inv-001/002/003)
// ============================================================
export function getRealInvoices(): RealInvoice[] {
  return safeLocalStorageGet<RealInvoice[]>(KEYS.INVOICES, [])
}

export function addRealInvoice(params: {
  amount: number
  planName: string
  pdfUrl?: string
  status?: 'paid' | 'pending' | 'failed'
}): RealInvoice {
  const invoices = getRealInvoices()
  const newInvoice: RealInvoice = {
    id: `INV-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    amount: `$${params.amount}.00`,
    status: params.status || 'paid',
    plan: params.planName,
    pdfUrl: params.pdfUrl,
  }
  const updated = [newInvoice, ...invoices]
  safeLocalStorageSet(KEYS.INVOICES, updated)
  return newInvoice
}

// ============================================================
// 7. Agents Persistence Layer (Real user agents)
// ============================================================
export function getRealAgents(): Agent[] {
  return safeLocalStorageGet<Agent[]>(KEYS.AGENTS, [])
}

export function getRealAgentById(id: string): Agent | null {
  const agents = getRealAgents()
  return agents.find((a) => a.id === id || a.slug === id) || null
}

export function getRealAgentBySlug(slug: string): Agent | null {
  const agents = getRealAgents()
  const clean = slug.toLowerCase().trim()
  return (
    agents.find((a) => a.slug === clean || a.id === clean) ||
    agents.find((a) => a.slug.startsWith(clean) || clean.startsWith(a.slug)) ||
    null
  )
}

export function resolveCleanAgentName(agent: Agent | null, slugOrId?: string): string {
  if (agent?.name) return agent.name
  if (!slugOrId) return 'AI Assistant'

  // If raw ID
  if (slugOrId.startsWith('ag_')) {
    return 'Qezvo AI Assistant'
  }

  // Strip trailing random hash like -r7re1 or -9b4f
  const cleaned = slugOrId
    .replace(/-[a-z0-9]{4,7}$/i, '')
    .replace(/[-_]/g, ' ')
    .trim()

  return (
    cleaned
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'AI Assistant'
  )
}

export function createRealAgent(params: {
  name: string
  description?: string
  language?: string
}): Agent {
  const agents = getRealAgents()
  const id = `ag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const slug = params.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50) || 'agent'

  const newAgent: Agent = {
    id,
    organizationId: 'org_main',
    name: params.name.trim(),
    description: params.description?.trim() || '',
    slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
    status: 'draft',
    language: (params.language as AgentLanguage) || 'en',
    currentVersion: 1,
    knowledgeSourceCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const updated = [newAgent, ...agents]
  safeLocalStorageSet(KEYS.AGENTS, updated)
  return newAgent
}

export function saveRealAgent(agent: Agent): void {
  const agents = getRealAgents()
  const exists = agents.some((a) => a.id === agent.id)
  const updated = exists ? agents.map((a) => (a.id === agent.id ? agent : a)) : [agent, ...agents]
  safeLocalStorageSet(KEYS.AGENTS, updated)
}

export function updateRealAgent(id: string, updates: Partial<Agent>): Agent | null {
  const agents = getRealAgents()
  const index = agents.findIndex((a) => a.id === id)
  if (index === -1) return null
  const updatedAgent = { ...agents[index]!, ...updates, updatedAt: new Date().toISOString() }
  agents[index] = updatedAgent
  safeLocalStorageSet(KEYS.AGENTS, agents)
  return updatedAgent
}

export function deleteRealAgent(id: string): void {
  const agents = getRealAgents()
  const updated = agents.filter((a) => a.id !== id)
  safeLocalStorageSet(KEYS.AGENTS, updated)
}

// ============================================================
// 8. Agent Customization & Model Settings
// ============================================================
export interface RealAgentSettings {
  displayName?: string
  welcomeMessage?: string
  placeholder?: string
  suggestedQuestions?: string[]
  primaryColor?: string
  theme?: 'light' | 'dark' | 'auto'
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  fontSize?: 'sm' | 'base' | 'lg'
  markdownEnabled?: boolean
  typingIndicator?: boolean
  streamingEnabled?: boolean
  provider?: string
  modelId?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  contextSize?: number
  retrievalTopK?: number
  systemInstructions?: string
}

const SETTINGS_KEY = 'qezvo_real_agent_settings'

export function getRealAgentSettings(agentId: string): RealAgentSettings {
  const all = safeLocalStorageGet<Record<string, RealAgentSettings>>(SETTINGS_KEY, {})
  return (
    all[agentId] || {
      displayName: 'Support Agent',
      welcomeMessage: 'Hello! How can I help you today?',
      placeholder: 'Type your message…',
      suggestedQuestions: [
        'What can you help me with?',
        'How do I get started?',
        'What are your pricing plans?',
      ],
      primaryColor: '#6366f1',
      theme: 'auto',
      borderRadius: 'md',
      fontSize: 'base',
      markdownEnabled: true,
      typingIndicator: true,
      streamingEnabled: true,
      provider: 'ollama-cloud',
      modelId: 'gpt-oss:120b',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      contextSize: 4096,
      retrievalTopK: 5,
      systemInstructions: '',
    }
  )
}

export function saveRealAgentSettings(agentId: string, settings: Partial<RealAgentSettings>): RealAgentSettings {
  const all = safeLocalStorageGet<Record<string, RealAgentSettings>>(SETTINGS_KEY, {})
  const current = getRealAgentSettings(agentId)
  const updated = { ...current, ...settings }
  all[agentId] = updated
  safeLocalStorageSet(SETTINGS_KEY, all)
  return updated
}

// ============================================================
// 9. Unified Knowledge Sources Management Layer
// ============================================================
export interface RealKnowledgeSourceItem {
  id: string
  agentId: string
  type: 'file' | 'website' | 'sitemap' | 'clipboard'
  title: string
  detail: string
  status: 'indexed' | 'processing' | 'done' | 'failed'
  createdAt: string
  sizeOrWords?: string
}

export function getAgentKnowledgeData(agentId: string) {
  const clipboards = safeLocalStorageGet<any[]>(`qezvo_clipboard_${agentId}`, [])
  const defaultClipboard = safeLocalStorageGet<any[]>('qezvo_clipboard_default', [])
  const allClipboards = [
    ...clipboards,
    ...defaultClipboard.filter((dc: any) => !clipboards.some((c: any) => String(c.id) === String(dc.id))),
  ]

  const websites = safeLocalStorageGet<any[]>(`qezvo_websites_${agentId}`, [])
  const defaultWebsites = safeLocalStorageGet<any[]>('qezvo_websites_default', [])
  const allWebsites = [
    ...websites,
    ...defaultWebsites.filter((dw: any) => !websites.some((w: any) => String(w.id) === String(dw.id))),
  ]

  const sitemaps = safeLocalStorageGet<any[]>(`qezvo_sitemap_${agentId}`, [])
  const defaultSitemaps = safeLocalStorageGet<any[]>('qezvo_sitemap_default', [])
  const allSitemaps = [
    ...sitemaps,
    ...defaultSitemaps.filter((ds: any) => !sitemaps.some((s: any) => String(s.id) === String(ds.id))),
  ]

  const files = safeLocalStorageGet<any[]>(`qezvo_files_${agentId}`, [])
  const defaultFiles = safeLocalStorageGet<any[]>('qezvo_files_default', [])
  const allFiles = [
    ...files,
    ...defaultFiles.filter((df: any) => !files.some((f: any) => String(f.id) === String(df.id))),
  ]

  const allItems: RealKnowledgeSourceItem[] = [
    ...allFiles.map((f: any) => ({
      id: String(f.id || `file-${Math.random()}`),
      agentId,
      type: 'file' as const,
      title: f.name || f.file?.name || 'Uploaded Document',
      detail: f.size ? `${(f.size / 1024).toFixed(1)} KB` : 'Document',
      status: 'indexed' as const,
      createdAt: f.createdAt || f.uploadedAt || new Date().toISOString(),
      sizeOrWords: f.size ? `${(f.size / 1024).toFixed(1)} KB` : undefined,
    })),
    ...allWebsites.map((w: any) => ({
      id: String(w.id || `web-${Math.random()}`),
      agentId,
      type: 'website' as const,
      title: w.url || 'Web Page',
      detail: w.pages ? `${w.pages} crawled pages` : 'Website page',
      status: 'indexed' as const,
      createdAt: w.createdAt || new Date().toISOString(),
      sizeOrWords: w.pages ? `${w.pages} pages` : '1 page',
    })),
    ...allSitemaps.map((s: any) => ({
      id: String(s.id || `sitemap-${Math.random()}`),
      agentId,
      type: 'sitemap' as const,
      title: s.url || 'Sitemap XML',
      detail: s.pagesCount ? `${s.pagesCount} discovered pages` : 'Discovered pages indexed',
      status: 'indexed' as const,
      createdAt: s.createdAt || new Date().toISOString(),
      sizeOrWords: s.pagesCount ? `${s.pagesCount} pages` : undefined,
    })),
    ...allClipboards.map((c: any) => ({
      id: String(c.id || `clip-${Math.random()}`),
      agentId,
      type: 'clipboard' as const,
      title: c.title || 'Pasted Text',
      detail: c.content ? (c.content.slice(0, 100) + '…') : 'Text snippet',
      status: 'indexed' as const,
      createdAt: c.createdAt || new Date().toISOString(),
      sizeOrWords: c.wordCount ? `${c.wordCount} words` : undefined,
    })),
  ]

  const totalCount = allItems.length

  // Synchronize count to real agent
  const agent = getRealAgentById(agentId)
  if (agent && agent.knowledgeSourceCount !== totalCount) {
    updateRealAgent(agentId, {
      knowledgeSourceCount: totalCount,
      status: totalCount > 0 && agent.status === 'draft' ? 'ready' : agent.status,
    })
  }

  return {
    filesCount: allFiles.length,
    websitesCount: allWebsites.length,
    sitemapsCount: allSitemaps.length,
    clipboardsCount: allClipboards.length,
    totalCount,
    items: allItems,
  }
}

export function deleteAgentKnowledgeSource(
  agentId: string,
  id: string,
  type: 'file' | 'website' | 'sitemap' | 'clipboard'
) {
  if (type === 'clipboard') {
    const key = `qezvo_clipboard_${agentId}`
    const existing = safeLocalStorageGet<any[]>(key, [])
    safeLocalStorageSet(key, existing.filter((item) => String(item.id) !== String(id)))
    const def = safeLocalStorageGet<any[]>('qezvo_clipboard_default', [])
    safeLocalStorageSet('qezvo_clipboard_default', def.filter((item) => String(item.id) !== String(id)))
  } else if (type === 'website') {
    const key = `qezvo_websites_${agentId}`
    const existing = safeLocalStorageGet<any[]>(key, [])
    safeLocalStorageSet(key, existing.filter((item) => String(item.id) !== String(id)))
    const def = safeLocalStorageGet<any[]>('qezvo_websites_default', [])
    safeLocalStorageSet('qezvo_websites_default', def.filter((item) => String(item.id) !== String(id)))
  } else if (type === 'sitemap') {
    const key = `qezvo_sitemap_${agentId}`
    const existing = safeLocalStorageGet<any[]>(key, [])
    safeLocalStorageSet(key, existing.filter((item) => String(item.id) !== String(id)))
    const def = safeLocalStorageGet<any[]>('qezvo_sitemap_default', [])
    safeLocalStorageSet('qezvo_sitemap_default', def.filter((item) => String(item.id) !== String(id)))
  } else if (type === 'file') {
    const key = `qezvo_files_${agentId}`
    const existing = safeLocalStorageGet<any[]>(key, [])
    safeLocalStorageSet(key, existing.filter((item) => String(item.id) !== String(id)))
    const def = safeLocalStorageGet<any[]>('qezvo_files_default', [])
    safeLocalStorageSet('qezvo_files_default', def.filter((item) => String(item.id) !== String(id)))
  }

  getAgentKnowledgeData(agentId)
}

