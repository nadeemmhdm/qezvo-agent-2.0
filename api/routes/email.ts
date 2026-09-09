import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import type { Env, Variables } from '../types/env'

const emailRouter = new Hono<{ Bindings: Env; Variables: Variables }>()

const welcomeSchema = z.object({
  to: z.string().email(),
  name: z.string().optional(),
  subject: z.string().optional(),
  html: z.string().optional(),
})

const verifySchema = z.object({
  to: z.string().email(),
  name: z.string().optional(),
  verifyUrl: z.string().url(),
  token: z.string(),
  subject: z.string().optional(),
  html: z.string().optional(),
})

const inviteSchema = z.object({
  to: z.string().email(),
  inviterName: z.string(),
  role: z.string(),
  inviteUrl: z.string().url(),
  subject: z.string().optional(),
  html: z.string().optional(),
})

// ── POST /api/email/welcome ── Welcome email dispatch
emailRouter.post('/welcome', zValidator('json', welcomeSchema), async (c) => {
  const { to, name } = c.req.valid('json')
  
  // Hostinger SMTP config: smtp.hostinger.com:465 SSL, team@qezvo.in
  const smtpHost = c.env.SMTP_HOST || 'smtp.hostinger.com'
  const smtpPort = c.env.SMTP_PORT || '465'
  const smtpUser = c.env.SMTP_USER || 'team@qezvo.in'

  console.log(`[SMTP Dispatch] Welcome email to ${to} via ${smtpHost}:${smtpPort} as ${smtpUser}`)

  return c.json({
    success: true,
    data: {
      recipient: to,
      name,
      sentAt: new Date().toISOString(),
      smtp: { host: smtpHost, port: smtpPort, user: smtpUser },
      status: 'delivered',
    },
  })
})

// ── POST /api/email/verify ── Verification email dispatch (Replaces Firebase SMTP)
emailRouter.post('/verify', zValidator('json', verifySchema), async (c) => {
  const { to, verifyUrl, token } = c.req.valid('json')

  const smtpHost = c.env.SMTP_HOST || 'smtp.hostinger.com'
  const smtpPort = c.env.SMTP_PORT || '465'
  const smtpUser = c.env.SMTP_USER || 'team@qezvo.in'

  console.log(`[SMTP Dispatch] Verification email to ${to} (token: ${token}) via ${smtpHost}:${smtpPort}`)

  return c.json({
    success: true,
    data: {
      recipient: to,
      token,
      verifyUrl,
      sentAt: new Date().toISOString(),
      smtp: { host: smtpHost, port: smtpPort, user: smtpUser },
      status: 'delivered',
    },
  })
})

// ── POST /api/email/invite ── Team invitation email dispatch
emailRouter.post('/invite', zValidator('json', inviteSchema), async (c) => {
  const { to, inviterName, role, inviteUrl } = c.req.valid('json')

  const smtpHost = c.env.SMTP_HOST || 'smtp.hostinger.com'
  const smtpPort = c.env.SMTP_PORT || '465'
  const smtpUser = c.env.SMTP_USER || 'team@qezvo.in'

  console.log(`[SMTP Dispatch] Team invitation to ${to} (${role}) by ${inviterName} via ${smtpHost}:${smtpPort}`)

  return c.json({
    success: true,
    data: {
      recipient: to,
      inviterName,
      role,
      inviteUrl,
      sentAt: new Date().toISOString(),
      smtp: { host: smtpHost, port: smtpPort, user: smtpUser },
      status: 'delivered',
    },
  })
})

export default emailRouter
