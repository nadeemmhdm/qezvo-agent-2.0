import { useState, useEffect } from 'react'

export const ADMIN_EMAILS = ['qezvooffical@gmail.com', 'qezvoofficial@gmail.com']
export const ADMIN_EMAIL = 'qezvoofficial@gmail.com'

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.trim().toLowerCase())
}

export interface ServiceStatusItem {
  id: string
  name: string
  status: 'Operational' | 'Degraded Performance' | 'Under Maintenance' | 'Major Outage'
  latency: string
  uptime: string
}

export interface IncidentItem {
  id: string
  title: string
  date: string
  severity: 'resolved' | 'monitoring' | 'investigating'
  description: string
}

export interface ManagedUser {
  id: string
  name: string
  email: string
  plan: 'Free' | 'Pro' | 'Business' | 'Enterprise'
  status: 'active' | 'suspended' | 'disabled'
  requestsCount: number
  requestsLimit: number
  agentsCount: number
  maxAgents: number
  joinedDate: string
}

export interface MaintenanceConfig {
  enabled: boolean
  message: string
  allowAdminOnly: boolean
  updatedAt: string
}

const DEFAULT_SERVICES: ServiceStatusItem[] = [
  { id: '1', name: 'Global Edge Ingestion & Crawler', status: 'Operational', latency: '42ms', uptime: '99.99%' },
  { id: '2', name: 'Vector Embedding & Search Cluster', status: 'Operational', latency: '18ms', uptime: '99.98%' },
  { id: '3', name: 'Ollama Cloud & LLM Inference', status: 'Operational', latency: '65ms', uptime: '99.96%' },
  { id: '4', name: 'Scanned Document OCR Workers', status: 'Operational', latency: '210ms', uptime: '99.92%' },
  { id: '5', name: 'Custom Domain SSL Auto-Provisioning', status: 'Operational', latency: '65ms', uptime: '100.0%' },
  { id: '6', name: 'Web Embed Widget CDN Delivery', status: 'Operational', latency: '12ms', uptime: '100.0%' },
  { id: '7', name: 'Management Dashboard & Auth API', status: 'Operational', latency: '35ms', uptime: '99.99%' },
]

const DEFAULT_INCIDENTS: IncidentItem[] = [
  {
    id: 'inc-1',
    title: 'Ollama Cloud Ingestion Engine Upgraded',
    date: 'September 5, 2026',
    severity: 'resolved',
    description: 'Upgraded cloud model routing to support Ollama Cloud high-speed direct tokens streaming with sub-50ms TTFT.',
  },
  {
    id: 'inc-2',
    title: 'Scheduled Edge Cluster Maintenance',
    date: 'August 24, 2026',
    severity: 'resolved',
    description: 'Routine firmware updates applied to edge indexing nodes in Mumbai and Frankfurt regions. Zero downtime incurred.',
  },
]

import { getRealAgents } from '@/features/data/realDataStore'

const DEFAULT_USERS: ManagedUser[] = [
  {
    id: 'usr-admin',
    name: 'Qezvo Super Admin',
    email: ADMIN_EMAIL,
    plan: 'Enterprise',
    status: 'active',
    requestsCount: 0,
    requestsLimit: 500000,
    agentsCount: 0,
    maxAgents: 999,
    joinedDate: '2026-01-01',
  },
]

const DEFAULT_MAINTENANCE: MaintenanceConfig = {
  enabled: false,
  message: 'Platform is currently undergoing scheduled infrastructure upgrades. AI Agents and APIs remain online.',
  allowAdminOnly: true,
  updatedAt: new Date().toISOString(),
}

// Global state keys for localStorage persistence
const STORAGE_KEYS = {
  MAINTENANCE: 'qezvo_platform_maintenance',
  SERVICES: 'qezvo_platform_services',
  INCIDENTS: 'qezvo_platform_incidents',
  USERS: 'qezvo_platform_users',
}

// Storage helpers
export function getStoredMaintenance(): MaintenanceConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MAINTENANCE)
    return raw ? JSON.parse(raw) : DEFAULT_MAINTENANCE
  } catch {
    return DEFAULT_MAINTENANCE
  }
}

export function setStoredMaintenance(config: MaintenanceConfig) {
  localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(config))
  window.dispatchEvent(new Event('qezvo_maintenance_change'))
}

export function getStoredServices(): ServiceStatusItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERVICES)
    return raw ? JSON.parse(raw) : DEFAULT_SERVICES
  } catch {
    return DEFAULT_SERVICES
  }
}

export function setStoredServices(services: ServiceStatusItem[]) {
  localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services))
  window.dispatchEvent(new Event('qezvo_services_change'))
}

export function getStoredIncidents(): IncidentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INCIDENTS)
    return raw ? JSON.parse(raw) : DEFAULT_INCIDENTS
  } catch {
    return DEFAULT_INCIDENTS
  }
}

export function setStoredIncidents(incidents: IncidentItem[]) {
  localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents))
  window.dispatchEvent(new Event('qezvo_incidents_change'))
}

const DEMO_EMAILS = [
  'rahul.varma@keralatech.io',
  'ananya@affogato.solutions',
  'devon.v@cloudscale.net',
  'sara.chen@globalai.org',
]

export function getStoredUsers(): ManagedUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS)
    const stored: ManagedUser[] = raw ? JSON.parse(raw) : DEFAULT_USERS
    
    // Purge any demo accounts that might be cached
    const realOnly = stored.filter(
      (u) => !DEMO_EMAILS.includes(u.email.toLowerCase()) && !u.email.includes('example.com')
    )

    // Ensure super admin exists with real agents count
    const realAgentsCount = getRealAgents().length
    const hasAdmin = realOnly.some((u) => u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase())
    
    if (!hasAdmin) {
      realOnly.unshift({
        id: 'usr-admin',
        name: 'Qezvo Super Admin',
        email: ADMIN_EMAIL,
        plan: 'Enterprise',
        status: 'active',
        requestsCount: 0,
        requestsLimit: 500000,
        agentsCount: realAgentsCount,
        maxAgents: 999,
        joinedDate: '2026-01-01',
      })
    } else {
      for (const u of realOnly) {
        if (u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          u.agentsCount = realAgentsCount
        }
      }
    }

    return realOnly
  } catch {
    return DEFAULT_USERS
  }
}

export function setStoredUsers(users: ManagedUser[]) {
  const clean = users.filter((u) => !DEMO_EMAILS.includes(u.email.toLowerCase()))
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(clean))
  window.dispatchEvent(new Event('qezvo_users_change'))
}

// React Hooks
export function usePlatformMaintenance() {
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>(getStoredMaintenance)

  useEffect(() => {
    const handleUpdate = () => setMaintenance(getStoredMaintenance())
    window.addEventListener('qezvo_maintenance_change', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('qezvo_maintenance_change', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const toggleMaintenance = (enabled: boolean, message?: string) => {
    const updated: MaintenanceConfig = {
      ...maintenance,
      enabled,
      message: message || maintenance.message,
      updatedAt: new Date().toISOString(),
    }
    setStoredMaintenance(updated)
    setMaintenance(updated)
  }

  return { maintenance, toggleMaintenance }
}

export function usePlatformServices() {
  const [services, setServices] = useState<ServiceStatusItem[]>(getStoredServices)
  const [incidents, setIncidents] = useState<IncidentItem[]>(getStoredIncidents)

  useEffect(() => {
    const handleServices = () => setServices(getStoredServices())
    const handleIncidents = () => setIncidents(getStoredIncidents())
    window.addEventListener('qezvo_services_change', handleServices)
    window.addEventListener('qezvo_incidents_change', handleIncidents)
    window.addEventListener('storage', handleServices)
    window.addEventListener('storage', handleIncidents)
    return () => {
      window.removeEventListener('qezvo_services_change', handleServices)
      window.removeEventListener('qezvo_incidents_change', handleIncidents)
      window.removeEventListener('storage', handleServices)
      window.removeEventListener('storage', handleIncidents)
    }
  }, [])

  const updateService = (id: string, updates: Partial<ServiceStatusItem>) => {
    const next = services.map((s) => (s.id === id ? { ...s, ...updates } : s))
    setStoredServices(next)
    setServices(next)
  }

  const addIncident = (incident: Omit<IncidentItem, 'id'>) => {
    const next = [{ ...incident, id: `inc-${Date.now()}` }, ...incidents]
    setStoredIncidents(next)
    setIncidents(next)
  }

  const updateIncident = (id: string, updates: Partial<IncidentItem>) => {
    const next = incidents.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
    setStoredIncidents(next)
    setIncidents(next)
  }

  const deleteIncident = (id: string) => {
    const next = incidents.filter((inc) => inc.id !== id)
    setStoredIncidents(next)
    setIncidents(next)
  }

  return { services, incidents, updateService, addIncident, updateIncident, deleteIncident }
}

export function usePlatformUsers() {
  const [users, setUsers] = useState<ManagedUser[]>(getStoredUsers)

  useEffect(() => {
    const handleUsers = () => setUsers(getStoredUsers())
    window.addEventListener('qezvo_users_change', handleUsers)
    window.addEventListener('storage', handleUsers)
    return () => {
      window.removeEventListener('qezvo_users_change', handleUsers)
      window.removeEventListener('storage', handleUsers)
    }
  }, [])

  const updateUserStatus = (userId: string, status: 'active' | 'suspended' | 'disabled') => {
    const next = users.map((u) => (u.id === userId ? { ...u, status } : u))
    setStoredUsers(next)
    setUsers(next)
  }

  const updateUserPlan = (
    userId: string,
    plan: 'Free' | 'Pro' | 'Business' | 'Enterprise',
    requestsLimit?: number,
    maxAgents?: number
  ) => {
    const next = users.map((u) => {
      if (u.id !== userId) return u
      const defaultReqs = plan === 'Free' ? 1000 : plan === 'Pro' ? 50000 : plan === 'Business' ? 500000 : 1000000
      const defaultAgents = plan === 'Free' ? 3 : plan === 'Pro' ? 25 : plan === 'Business' ? 100 : 999
      return {
        ...u,
        plan,
        requestsLimit: requestsLimit ?? defaultReqs,
        maxAgents: maxAgents ?? defaultAgents,
      }
    })
    setStoredUsers(next)
    setUsers(next)
  }

  return { users, updateUserStatus, updateUserPlan }
}
