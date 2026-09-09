import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { secureHeaders } from 'hono/secure-headers'

import agentsRouter from './routes/agents'
import knowledgeRouter from './routes/knowledge'
import trainingRouter from './routes/training'
import usageRouter from './routes/usage'
import teamRouter from './routes/team'
import apiKeysRouter from './routes/api-keys'
import domainsRouter from './routes/domains'
import chatRouter from './routes/chat'
import webhooksRouter from './routes/webhooks'
import authRouter from './routes/auth'
import crawlRouter from './routes/crawl'
import emailRouter from './routes/email'

import type { Env } from './types/env'

export { default as TrainingDO } from './durable-objects/TrainingDO'
export { default as CrawlDO } from './durable-objects/CrawlDO'

const app = new Hono<{ Bindings: Env }>()

// ── Global Middleware ──
app.use('*', logger())
app.use('*', prettyJSON())
app.use('*', secureHeaders())

// CORS — configured from env or defaults
app.use('/api/*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS
    ? c.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:4173']

  return cors({
    origin: (origin) => {
      if (!origin) return null
      if (allowedOrigins.includes(origin)) return origin
      // Allow wildcard for subdomain embeds
      if (c.env.NODE_ENV !== 'production') return origin
      return null
    },
    allowHeaders: ['Content-Type', 'Authorization', 'X-Api-Key', 'X-Widget-Token'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['X-Request-Id', 'X-RateLimit-Remaining'],
    credentials: true,
    maxAge: 86400,
  })(c, next)
})

// ── Health ──
app.get('/healthz', (c) => c.json({ ok: true, ts: Date.now() }))

// ── API Routes ──
app.route('/api/auth', authRouter)
app.route('/api/agents', agentsRouter)
app.route('/api/knowledge', knowledgeRouter)
app.route('/api/training', trainingRouter)
app.route('/api/crawl', crawlRouter)
app.route('/api/usage', usageRouter)
app.route('/api/team', teamRouter)
app.route('/api/api-keys', apiKeysRouter)
app.route('/api/domains', domainsRouter)
app.route('/api/chat', chatRouter)
app.route('/api/webhooks', webhooksRouter)
app.route('/api/email', emailRouter)

// ── 404 handler ──
app.notFound((c) => {
  return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404)
})

// ── Error handler ──
app.onError((err, c) => {
  console.error('[API Error]', err)
  const status = 'status' in err && typeof err.status === 'number' ? err.status : 500
  return c.json(
    {
      success: false,
      error: {
        code: status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : 'INTERNAL_ERROR',
        message: c.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      },
    },
    status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500
  )
})

export default app
