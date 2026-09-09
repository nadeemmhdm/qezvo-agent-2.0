import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth } from '../middleware/auth'

const auth = new Hono<{ Bindings: Env; Variables: Variables }>()

const syncUserSchema = z.object({
  firebaseUid: z.string().min(1),
  email: z.string().email(),
  fullName: z.string().optional().default(''),
  avatarUrl: z.string().optional(),
})

// ── POST /api/auth/sync ── Sync Firebase user to local D1
auth.post('/sync', zValidator('json', syncUserSchema), async (c) => {
  const { firebaseUid, email, fullName, avatarUrl } = c.req.valid('json')

  // Check if user already exists
  let user = await c.env.DB.prepare(
    'SELECT id, email, full_name, avatar_url FROM users WHERE firebase_uid = ?'
  ).bind(firebaseUid).first<{ id: string; email: string; full_name: string; avatar_url?: string }>()

  let organizationId = ''
  let role = 'owner'

  if (!user) {
    const userId = nanoid()
    organizationId = nanoid()
    const orgSlug = email.split('@')[0]!.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + nanoid(4).toLowerCase()

    // 1. Create User
    await c.env.DB.prepare(`
      INSERT INTO users (id, firebase_uid, email, full_name, avatar_url, email_verified)
      VALUES (?, ?, ?, ?, ?, 1)
    `).bind(userId, firebaseUid, email.toLowerCase(), fullName, avatarUrl ?? null).run()

    // 2. Create Default Organization
    await c.env.DB.prepare(`
      INSERT INTO organizations (id, name, slug, plan)
      VALUES (?, ?, ?, 'free')
    `).bind(organizationId, `${fullName || 'My'} Workspace`, orgSlug).run()

    // 3. Add user as Owner
    await c.env.DB.prepare(`
      INSERT INTO organization_members (id, organization_id, user_id, role)
      VALUES (?, ?, ?, 'owner')
    `).bind(nanoid(), organizationId, userId).run()

    user = { id: userId, email, full_name: fullName, avatar_url: avatarUrl }
  } else {
    // Find organization
    const member = await c.env.DB.prepare(
      'SELECT organization_id, role FROM organization_members WHERE user_id = ? LIMIT 1'
    ).bind(user.id).first<{ organization_id: string; role: string }>()

    organizationId = member?.organization_id ?? ''
    role = member?.role ?? 'viewer'
  }

  return c.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
      },
      organizationId,
      role,
    },
  })
})

// ── GET /api/auth/me ── Current user & org
auth.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId')
  const orgId = c.get('orgId')
  const role = c.get('userRole')

  const user = await c.env.DB.prepare(
    'SELECT id, email, full_name, avatar_url FROM users WHERE id = ?'
  ).bind(userId).first()

  const org = await c.env.DB.prepare(
    'SELECT id, name, slug, plan FROM organizations WHERE id = ?'
  ).bind(orgId).first()

  return c.json({
    success: true,
    data: {
      user,
      organization: org,
      role,
    },
  })
})

export default auth
