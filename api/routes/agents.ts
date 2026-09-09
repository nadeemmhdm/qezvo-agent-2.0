import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env, Variables } from '../types/env'
import { requireAuth, requireRole } from '../middleware/auth'
import { nanoid } from 'nanoid'

const agents = new Hono<{ Bindings: Env; Variables: Variables }>()

// ── Helpers ──
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

const agentCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().default(''),
  language: z.string().default('en'),
})

const agentUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  language: z.string().optional(),
})

// ── Apply auth to all routes ──
agents.use('*', requireAuth)

// ── GET /api/agents ── List agents for org
agents.get('/', async (c) => {
  const orgId = c.get('orgId')
  const page = Math.max(1, parseInt(c.req.query('page') ?? '1'))
  const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') ?? '20')))
  const limit = parseInt(c.req.query('limit') ?? '0')
  const sort = c.req.query('sort') ?? 'updated'
  const offset = (page - 1) * pageSize

  const orderBy = sort === 'created' ? 'a.created_at DESC' : 'a.updated_at DESC'
  const limitClause = limit > 0 ? `LIMIT ${limit}` : `LIMIT ${pageSize} OFFSET ${offset}`

  const rows = await c.env.DB.prepare(`
    SELECT a.id, a.name, a.description, a.slug, a.status, a.avatar_url,
           a.language, a.current_version, a.knowledge_source_count,
           a.created_at, a.updated_at
    FROM agents a
    WHERE a.organization_id = ? AND a.deleted_at IS NULL
    ORDER BY ${orderBy}
    ${limitClause}
  `).bind(orgId).all()

  if (limit > 0) {
    return c.json({ success: true, data: rows.results })
  }

  const total = await c.env.DB.prepare(
    'SELECT COUNT(*) as cnt FROM agents WHERE organization_id = ? AND deleted_at IS NULL'
  ).bind(orgId).first<{ cnt: number }>()

  return c.json({
    success: true,
    data: rows.results,
    pagination: {
      page,
      pageSize,
      total: total?.cnt ?? 0,
      totalPages: Math.ceil((total?.cnt ?? 0) / pageSize),
    },
  })
})

// ── POST /api/agents ── Create agent
agents.post('/', zValidator('json', agentCreateSchema), async (c) => {
  const orgId = c.get('orgId')
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const id = nanoid()
  const baseSlug = slugify(body.name)
  // Ensure unique slug
  let slug = baseSlug
  const existing = await c.env.DB.prepare(
    'SELECT id FROM agents WHERE organization_id = ? AND slug = ? AND deleted_at IS NULL'
  ).bind(orgId, slug).first()
  if (existing) slug = `${baseSlug}-${nanoid(4).toLowerCase()}`

  await c.env.DB.prepare(`
    INSERT INTO agents (id, organization_id, created_by, name, description, slug, language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(id, orgId, userId, body.name, body.description, slug, body.language).run()

  // Create default settings row
  const settingsId = nanoid()
  await c.env.DB.prepare(`
    INSERT INTO agent_settings (id, agent_id, display_name)
    VALUES (?, ?, ?)
  `).bind(settingsId, id, body.name).run()

  // Create default security row
  const secId = nanoid()
  await c.env.DB.prepare(`
    INSERT INTO agent_security (id, agent_id) VALUES (?, ?)
  `).bind(secId, id).run()

  const agent = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ?'
  ).bind(id).first()

  return c.json({ success: true, data: agent }, 201)
})

// ── GET /api/agents/:id ── Get single agent
agents.get('/:id', async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('id')

  const agent = await c.env.DB.prepare(`
    SELECT a.*, s.*
    FROM agents a
    LEFT JOIN agent_settings s ON s.agent_id = a.id
    WHERE a.id = ? AND a.organization_id = ? AND a.deleted_at IS NULL
  `).bind(agentId, orgId).first()

  if (!agent) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  return c.json({ success: true, data: agent })
})

// ── PUT /api/agents/:id ── Update agent
agents.put('/:id', zValidator('json', agentUpdateSchema), async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('id')
  const body = c.req.valid('json')

  // Verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT id FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first()

  if (!existing) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  const fields: string[] = ['updated_at = ?']
  const values: unknown[] = [new Date().toISOString()]

  if (body.name !== undefined) { fields.push('name = ?'); values.push(body.name) }
  if (body.description !== undefined) { fields.push('description = ?'); values.push(body.description) }
  if (body.language !== undefined) { fields.push('language = ?'); values.push(body.language) }

  values.push(agentId)

  await c.env.DB.prepare(
    `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run()

  const agent = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ?'
  ).bind(agentId).first()

  return c.json({ success: true, data: agent })
})

// ── DELETE /api/agents/:id ── Soft-delete agent
agents.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('id')

  const existing = await c.env.DB.prepare(
    'SELECT id FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first()

  if (!existing) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  await c.env.DB.prepare(
    'UPDATE agents SET deleted_at = ?, updated_at = ? WHERE id = ?'
  ).bind(new Date().toISOString(), new Date().toISOString(), agentId).run()

  return c.json({ success: true, data: null })
})

// ── POST /api/agents/:id/publish ── Publish agent
agents.post('/:id/publish', requireRole('owner', 'admin', 'editor'), async (c) => {
  const orgId = c.get('orgId')
  const userId = c.get('userId')
  const agentId = c.req.param('id')

  const agent = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first<{ status: string; current_version: number; name: string }>()

  if (!agent) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  if (agent.status === 'training') {
    return c.json({ success: false, error: { code: 'CONFLICT', message: 'Agent is currently training, cannot publish' } }, 409)
  }

  const newVersion = (agent.current_version ?? 0) + 1
  const versionId = nanoid()

  // Snapshot current settings
  const settings = await c.env.DB.prepare(
    'SELECT * FROM agent_settings WHERE agent_id = ?'
  ).bind(agentId).first()

  await c.env.DB.batch([
    c.env.DB.prepare(`
      INSERT INTO agent_versions (id, agent_id, version_number, settings_snapshot, published_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(versionId, agentId, newVersion, JSON.stringify(settings), new Date().toISOString(), userId),

    c.env.DB.prepare(`
      UPDATE agents
      SET status = 'published', current_version = ?, published_version_id = ?, updated_at = ?
      WHERE id = ?
    `).bind(newVersion, versionId, new Date().toISOString(), agentId),
  ])

  return c.json({ success: true, data: { version: newVersion, versionId } })
})

// ── POST /api/agents/:id/unpublish ──
agents.post('/:id/unpublish', requireRole('owner', 'admin', 'editor'), async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('id')

  await c.env.DB.prepare(
    'UPDATE agents SET status = \'unpublished\', updated_at = ? WHERE id = ? AND organization_id = ?'
  ).bind(new Date().toISOString(), agentId, orgId).run()

  return c.json({ success: true, data: null })
})

// ── POST /api/agents/:id/duplicate ──
agents.post('/:id/duplicate', async (c) => {
  const orgId = c.get('orgId')
  const userId = c.get('userId')
  const agentId = c.req.param('id')

  const original = await c.env.DB.prepare(
    'SELECT * FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first<{ name: string; description: string; language: string }>()

  if (!original) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  const newId = nanoid()
  const newName = `${original.name} (copy)`
  const newSlug = `${slugify(newName)}-${nanoid(4).toLowerCase()}`

  await c.env.DB.prepare(`
    INSERT INTO agents (id, organization_id, created_by, name, description, slug, language)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(newId, orgId, userId, newName, original.description, newSlug, original.language).run()

  // Copy settings
  const originalSettings = await c.env.DB.prepare(
    'SELECT * FROM agent_settings WHERE agent_id = ?'
  ).bind(agentId).first<Record<string, unknown>>()

  if (originalSettings) {
    const newSettingsId = nanoid()
    const { id: _id, agent_id: _aid, created_at: _ca, updated_at: _ua, ...rest } = originalSettings
    const cols = ['id', 'agent_id', ...Object.keys(rest)]
    const vals = [newSettingsId, newId, ...Object.values(rest)]
    await c.env.DB.prepare(
      `INSERT INTO agent_settings (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`
    ).bind(...vals).run()
  }

  const agent = await c.env.DB.prepare('SELECT * FROM agents WHERE id = ?').bind(newId).first()
  return c.json({ success: true, data: agent }, 201)
})

export default agents
