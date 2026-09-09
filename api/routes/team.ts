import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth, requireRole } from '../middleware/auth'

const team = new Hono<{ Bindings: Env; Variables: Variables }>()

team.use('*', requireAuth)

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
})

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'editor', 'viewer']),
})

// ── GET /api/team/members ── List members
team.get('/members', async (c) => {
  const orgId = c.get('orgId')

  const rows = await c.env.DB.prepare(`
    SELECT om.id, om.role, om.joined_at, u.id as user_id, u.email, u.full_name, u.avatar_url
    FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE om.organization_id = ?
    ORDER BY om.joined_at ASC
  `).bind(orgId).all()

  const data = rows.results.map((r: any) => ({
    id: r.id,
    userId: r.user_id,
    role: r.role,
    joinedAt: r.joined_at,
    user: {
      id: r.user_id,
      email: r.email,
      fullName: r.full_name,
      avatarUrl: r.avatar_url,
    },
  }))

  return c.json({ success: true, data })
})

// ── POST /api/team/invite ── Send invitation
team.post('/invite', requireRole('owner', 'admin'), zValidator('json', inviteSchema), async (c) => {
  const orgId = c.get('orgId')
  const userId = c.get('userId')
  const { email, role } = c.req.valid('json')

  const token = nanoid(32)
  const id = nanoid()
  const expiresAt = new Date(Date.now() + 7 * 86400 * 1000).toISOString()

  await c.env.DB.prepare(`
    INSERT INTO team_invitations (id, organization_id, invited_by, email, role, token, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(organization_id, email) DO UPDATE SET
      role = excluded.role,
      token = excluded.token,
      expires_at = excluded.expires_at
  `).bind(id, orgId, userId, email.toLowerCase(), role, token, expiresAt).run()

  return c.json({
    success: true,
    data: {
      id,
      email: email.toLowerCase(),
      role,
      expiresAt,
    },
  }, 201)
})

// ── PATCH /api/team/members/:id ── Update role
team.patch('/members/:id', requireRole('owner'), zValidator('json', updateRoleSchema), async (c) => {
  const orgId = c.get('orgId')
  const memberId = c.req.param('id')
  const { role } = c.req.valid('json')

  await c.env.DB.prepare(`
    UPDATE organization_members
    SET role = ?
    WHERE id = ? AND organization_id = ?
  `).bind(role, memberId, orgId).run()

  return c.json({ success: true, data: { updated: true, role } })
})

// ── DELETE /api/team/members/:id ── Remove member
team.delete('/members/:id', requireRole('owner', 'admin'), async (c) => {
  const orgId = c.get('orgId')
  const memberId = c.req.param('id')

  // Check if trying to remove last owner
  const member = await c.env.DB.prepare(
    'SELECT role FROM organization_members WHERE id = ? AND organization_id = ?'
  ).bind(memberId, orgId).first<{ role: string }>()

  if (member?.role === 'owner') {
    const ownerCount = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM organization_members WHERE organization_id = ? AND role = 'owner'"
    ).bind(orgId).first<{ count: number }>()

    if ((ownerCount?.count ?? 0) <= 1) {
      return c.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Cannot remove the sole owner of an organization' } }, 400)
    }
  }

  await c.env.DB.prepare(
    'DELETE FROM organization_members WHERE id = ? AND organization_id = ?'
  ).bind(memberId, orgId).run()

  return c.json({ success: true, data: { removed: true } })
})

export default team
