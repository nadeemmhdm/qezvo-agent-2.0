import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth, requireRole } from '../middleware/auth'

const apiKeys = new Hono<{ Bindings: Env; Variables: Variables }>()

apiKeys.use('*', requireAuth)

const createApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default(['agents:read', 'chat:create']),
  expiresInDays: z.number().min(1).max(365).optional(),
})

// Hash raw API key using WebCrypto SHA-256
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(key)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ── GET /api/api-keys ── List keys for org
apiKeys.get('/', async (c) => {
  const orgId = c.get('orgId')

  const rows = await c.env.DB.prepare(`
    SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at
    FROM api_keys
    WHERE organization_id = ? AND revoked_at IS NULL
    ORDER BY created_at DESC
  `).bind(orgId).all()

  const data = rows.results.map((r: any) => ({
    id: r.id,
    name: r.name,
    prefix: r.key_prefix,
    scopes: typeof r.scopes === 'string' ? JSON.parse(r.scopes) : r.scopes,
    lastUsedAt: r.last_used_at,
    expiresAt: r.expires_at,
    createdAt: r.created_at,
  }))

  return c.json({ success: true, data })
})

// ── POST /api/api-keys ── Create key (Admin/Owner only)
apiKeys.post('/', requireRole('owner', 'admin'), zValidator('json', createApiKeySchema), async (c) => {
  const orgId = c.get('orgId')
  const userId = c.get('userId')
  const body = c.req.valid('json')

  const secret = nanoid(32)
  const prefix = `af_${nanoid(8)}`
  const rawKey = `${prefix}_${secret}`
  const keyHash = await hashApiKey(rawKey)

  const id = nanoid()
  const expiresAt = body.expiresInDays
    ? new Date(Date.now() + body.expiresInDays * 86400 * 1000).toISOString()
    : null

  await c.env.DB.prepare(`
    INSERT INTO api_keys (id, organization_id, user_id, name, key_hash, key_prefix, scopes, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    orgId,
    userId,
    body.name,
    keyHash,
    prefix,
    JSON.stringify(body.scopes),
    expiresAt
  ).run()

  // Return the raw key ONCE
  return c.json({
    success: true,
    data: {
      id,
      name: body.name,
      prefix,
      key: rawKey,
      scopes: body.scopes,
      expiresAt,
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// ── DELETE /api/api-keys/:id ── Revoke key
apiKeys.delete('/:id', requireRole('owner', 'admin'), async (c) => {
  const orgId = c.get('orgId')
  const id = c.req.param('id')

  await c.env.DB.prepare(`
    UPDATE api_keys
    SET revoked_at = datetime('now')
    WHERE id = ? AND organization_id = ?
  `).bind(id, orgId).run()

  return c.json({ success: true, data: { revoked: true } })
})

export default apiKeys
