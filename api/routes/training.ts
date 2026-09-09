import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth } from '../middleware/auth'

const training = new Hono<{ Bindings: Env; Variables: Variables }>()

training.use('*', requireAuth)

const startTrainingSchema = z.object({
  agentId: z.string().min(1),
  sourceId: z.string().optional(),
})

// ── POST /api/training/start ──
training.post('/start', zValidator('json', startTrainingSchema), async (c) => {
  const orgId = c.get('orgId')
  const { agentId, sourceId } = c.req.valid('json')

  // Verify agent exists
  const agent = await c.env.DB.prepare(
    'SELECT id FROM agents WHERE id = ? AND organization_id = ? AND deleted_at IS NULL'
  ).bind(agentId, orgId).first()

  if (!agent) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Agent not found' } }, 404)
  }

  const jobId = nanoid()
  const now = new Date().toISOString()

  await c.env.DB.prepare(`
    INSERT INTO training_jobs (id, agent_id, source_id, status, current_step, progress, started_at)
    VALUES (?, ?, ?, 'processing', 'indexing_vectors', 10, ?)
  `).bind(jobId, agentId, sourceId ?? agentId, now).run()

  // Update agent status to training
  await c.env.DB.prepare(
    "UPDATE agents SET status = 'training', updated_at = datetime('now') WHERE id = ?"
  ).bind(agentId).run()

  return c.json({
    success: true,
    data: {
      id: jobId,
      agentId,
      status: 'processing',
      progress: 10,
      currentStep: 'indexing_vectors',
      startedAt: now,
    },
  }, 201)
})

// ── GET /api/training/:agentId ── List jobs for agent
training.get('/:agentId', async (c) => {
  const agentId = c.req.param('agentId')

  const rows = await c.env.DB.prepare(`
    SELECT id, agent_id, status, current_step, progress, document_count, chunk_count,
           error_message, started_at, completed_at, created_at
    FROM training_jobs
    WHERE agent_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).bind(agentId).all()

  return c.json({ success: true, data: rows.results })
})

export default training
