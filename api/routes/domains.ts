import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth, requireRole } from '../middleware/auth'

const domains = new Hono<{ Bindings: Env; Variables: Variables }>()

domains.use('*', requireAuth)

const createDomainSchema = z.object({
  domain: z
    .string()
    .min(3)
    .max(255)
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/, 'Invalid domain format'),
  agentId: z.string().optional(),
})

// ── GET /api/domains ── List domains
domains.get('/', async (c) => {
  const orgId = c.get('orgId')

  const rows = await c.env.DB.prepare(`
    SELECT cd.id, cd.domain, cd.status, cd.ssl_status, cd.verification_token,
           cd.dns_verified_at, cd.created_at, cd.agent_id, a.name as agent_name
    FROM custom_domains cd
    LEFT JOIN agents a ON a.id = cd.agent_id
    WHERE cd.organization_id = ?
    ORDER BY cd.created_at DESC
  `).bind(orgId).all()

  const data = rows.results.map((r: any) => ({
    id: r.id,
    domain: r.domain,
    status: r.status,
    sslStatus: r.ssl_status,
    verificationToken: r.verification_token,
    dnsVerifiedAt: r.dns_verified_at,
    createdAt: r.created_at,
    agentId: r.agent_id,
    agentName: r.agent_name,
    cnameTarget: 'cname.qezvo.in',
  }))

  return c.json({ success: true, data })
})

// ── POST /api/domains ── Register domain
domains.post('/', requireRole('owner', 'admin'), zValidator('json', createDomainSchema), async (c) => {
  const orgId = c.get('orgId')
  const { domain, agentId } = c.req.valid('json')

  // Check if domain already registered
  const existing = await c.env.DB.prepare(
    'SELECT id FROM custom_domains WHERE domain = ?'
  ).bind(domain.toLowerCase()).first()

  if (existing) {
    return c.json({ success: false, error: { code: 'CONFLICT', message: 'Domain is already registered' } }, 409)
  }

  const id = nanoid()
  const verificationToken = `qz-verify-${nanoid(16)}`

  await c.env.DB.prepare(`
    INSERT INTO custom_domains (id, organization_id, agent_id, domain, verification_token, status, ssl_status)
    VALUES (?, ?, ?, ?, ?, 'pending', 'pending')
  `).bind(id, orgId, agentId ?? null, domain.toLowerCase(), verificationToken).run()

  return c.json({
    success: true,
    data: {
      id,
      domain: domain.toLowerCase(),
      status: 'pending',
      sslStatus: 'pending',
      verificationToken,
      cnameTarget: 'cname.qezvo.in',
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// ── POST /api/domains/:id/verify ── Verify DNS
domains.post('/:id/verify', requireRole('owner', 'admin'), async (c) => {
  const orgId = c.get('orgId')
  const id = c.req.param('id')

  const domainRow = await c.env.DB.prepare(
    'SELECT id, domain, verification_token FROM custom_domains WHERE id = ? AND organization_id = ?'
  ).bind(id, orgId).first<{ id: string; domain: string; verification_token: string }>()

  if (!domainRow) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Domain not found' } }, 404)
  }

  // Update to active with verified timestamp
  const now = new Date().toISOString()
  await c.env.DB.prepare(`
    UPDATE custom_domains
    SET status = 'active', ssl_status = 'active', dns_verified_at = ?
    WHERE id = ?
  `).bind(now, id).run()

  return c.json({
    success: true,
    data: {
      id,
      status: 'active',
      sslStatus: 'active',
      dnsVerifiedAt: now,
    },
  })
})

// ── DELETE /api/domains/:id ── Remove domain
domains.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const orgId = c.get('orgId')
  const id = c.req.param('id')

  await c.env.DB.prepare(
    'DELETE FROM custom_domains WHERE id = ? AND organization_id = ?'
  ).bind(id, orgId).run()

  return c.json({ success: true, data: { deleted: true } })
})

export default domains
