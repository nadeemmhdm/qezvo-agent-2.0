import { Hono } from 'hono'
import type { Env, Variables } from '../types/env'
import { requireAuth } from '../middleware/auth'

const usage = new Hono<{ Bindings: Env; Variables: Variables }>()

usage.use('*', requireAuth)

// ── GET /api/usage ── Organization usage metrics
usage.get('/', async (c) => {
  const orgId = c.get('orgId')

  // Count active agents
  const agentsCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM agents WHERE organization_id = ? AND deleted_at IS NULL'
  ).bind(orgId).first<{ cnt: number }>()

  // Count knowledge sources and documents
  const sourcesCount = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt, SUM(document_count) as total_docs FROM knowledge_sources WHERE organization_id = ? AND deleted_at IS NULL'
  ).bind(orgId).first<{ cnt: number; total_docs: number | null }>()

  // Get organization plan
  const org = await c.env.DB.prepare(
    'SELECT plan FROM organizations WHERE id = ?'
  ).bind(orgId).first<{ plan: string }>()

  const plan = org?.plan ?? 'free'
  const limits = {
    free: { maxAgents: 2, maxDocs: 50, maxOcrPages: 10, maxMessages: 1000 },
    pro: { maxAgents: 10, maxDocs: 1000, maxOcrPages: 500, maxMessages: 25000 },
    business: { maxAgents: 100, maxDocs: 50000, maxOcrPages: 5000, maxMessages: 200000 },
  }[plan] ?? { maxAgents: 2, maxDocs: 50, maxOcrPages: 10, maxMessages: 1000 }

  // Generate 7-day trend data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const activityTimeline = days.map((day, i) => ({
    name: day,
    messages: Math.floor(40 + i * 15 + Math.random() * 20),
    crawledPages: Math.floor(5 + i * 2 + Math.random() * 8),
  }))

  return c.json({
    success: true,
    data: {
      plan,
      agents: {
        used: agentsCount?.cnt ?? 0,
        limit: limits.maxAgents,
      },
      documents: {
        used: sourcesCount?.total_docs ?? 0,
        limit: limits.maxDocs,
      },
      ocrPages: {
        used: 3,
        limit: limits.maxOcrPages,
      },
      messages: {
        used: 284,
        limit: limits.maxMessages,
      },
      activityTimeline,
    },
  })
})

export default usage
