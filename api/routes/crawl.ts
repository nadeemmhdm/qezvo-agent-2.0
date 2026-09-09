import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth } from '../middleware/auth'

const crawl = new Hono<{ Bindings: Env; Variables: Variables }>()

crawl.use('*', requireAuth)

// ── SSRF Validation Helper ──
export function validateUrlForSSRF(rawUrl: string): { safe: boolean; error?: string; parsed?: URL } {
  try {
    const parsed = new URL(rawUrl)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, error: 'Only HTTP and HTTPS protocols are permitted' }
    }

    const hostname = parsed.hostname.toLowerCase()

    // Disallow loopback / local aliases
    if (
      hostname === 'localhost' ||
      hostname.endsWith('.localhost') ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname === '0.0.0.0'
    ) {
      return { safe: false, error: 'Access to loopback interfaces is strictly forbidden (SSRF protection)' }
    }

    // Disallow cloud metadata endpoints
    if (hostname === '169.254.169.254' || hostname === 'metadata.google.internal') {
      return { safe: false, error: 'Access to cloud instance metadata endpoints is strictly forbidden' }
    }

    // Disallow RFC 1918 private IP subnets
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
    if (ipv4Match) {
      const oct1 = parseInt(ipv4Match[1]!, 10)
      const oct2 = parseInt(ipv4Match[2]!, 10)

      if (oct1 === 10) {
        return { safe: false, error: 'Access to 10.0.0.0/8 private networks is forbidden' }
      }
      if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) {
        return { safe: false, error: 'Access to 172.16.0.0/12 private networks is forbidden' }
      }
      if (oct1 === 192 && oct2 === 168) {
        return { safe: false, error: 'Access to 192.168.0.0/16 private networks is forbidden' }
      }
    }

    return { safe: true, parsed }
  } catch {
    return { safe: false, error: 'Malformed URL provided' }
  }
}

const crawlRequestSchema = z.object({
  agentId: z.string().min(1),
  url: z.string().url(),
  maxDepth: z.number().min(1).max(5).default(2),
  maxPages: z.number().min(1).max(500).default(50),
})

// ── POST /api/crawl/validate ── SSRF check
crawl.post('/validate', zValidator('json', z.object({ url: z.string() })), (c) => {
  const { url } = c.req.valid('json')
  const result = validateUrlForSSRF(url)

  if (!result.safe) {
    return c.json({ success: false, error: { code: 'SSRF_BLOCKED', message: result.error } }, 400)
  }

  return c.json({ success: true, data: { safe: true, url: result.parsed?.href } })
})

// ── POST /api/crawl/start ── Trigger crawl job
crawl.post('/start', zValidator('json', crawlRequestSchema), async (c) => {
  const orgId = c.get('orgId')
  const { agentId, url, maxDepth, maxPages } = c.req.valid('json')

  const validation = validateUrlForSSRF(url)
  if (!validation.safe) {
    return c.json({ success: false, error: { code: 'SSRF_BLOCKED', message: validation.error } }, 400)
  }

  // Verify agent exists
  const agent = await c.env.DB.prepare(
    'SELECT id FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first()

  if (!agent) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  const jobId = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO crawl_jobs (id, agent_id, root_url, max_depth, max_pages, status)
    VALUES (?, ?, ?, ?, ?, 'processing')
  `).bind(jobId, agentId, validation.parsed!.href, maxDepth, maxPages).run()

  return c.json({
    success: true,
    data: {
      jobId,
      agentId,
      rootUrl: validation.parsed!.href,
      status: 'processing',
      progress: 0,
      processedPages: 0,
      totalPages: maxPages,
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// ── GET /api/crawl/:jobId ── Get status
crawl.get('/:jobId', async (c) => {
  const jobId = c.req.param('jobId')

  const job = await c.env.DB.prepare(
    'SELECT * FROM crawl_jobs WHERE id = ?'
  ).bind(jobId).first()

  if (!job) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Crawl job not found' } }, 404)
  }

  return c.json({ success: true, data: job })
})

export default crawl
