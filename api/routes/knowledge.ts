import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import type { Env, Variables } from '../types/env'
import { requireAuth } from '../middleware/auth'

const knowledge = new Hono<{ Bindings: Env; Variables: Variables }>()

knowledge.use('*', requireAuth)

const textSnippetSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(500000),
})

const websiteSourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url(),
})

// ── GET /api/knowledge/:agentId ── List sources
knowledge.get('/:agentId', async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('agentId')

  const rows = await c.env.DB.prepare(`
    SELECT id, agent_id, type, title, status, document_count, chunk_count, url, file_type, file_size_bytes, created_at
    FROM knowledge_sources
    WHERE agent_id = ? AND organization_id = ? AND deleted_at IS NULL
    ORDER BY created_at DESC
  `).bind(agentId, orgId).all()

  return c.json({ success: true, data: rows.results })
})

// ── POST /api/knowledge/:agentId/clipboard ── Add text snippet & index
knowledge.post('/:agentId/clipboard', zValidator('json', textSnippetSchema), async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('agentId')
  const { title, content } = c.req.valid('json')

  const sourceId = nanoid()
  const docId = nanoid()

  // Simple chunking (~500 characters per chunk)
  const rawChunks: string[] = []
  for (let i = 0; i < content.length; i += 500) {
    rawChunks.push(content.slice(i, i + 500))
  }

  // Insert knowledge source
  await c.env.DB.prepare(`
    INSERT INTO knowledge_sources (id, agent_id, organization_id, type, title, status, document_count, chunk_count)
    VALUES (?, ?, ?, 'clipboard', ?, 'indexed', 1, ?)
  `).bind(sourceId, agentId, orgId, title, rawChunks.length).run()

  // Insert document
  await c.env.DB.prepare(`
    INSERT INTO knowledge_documents (id, source_id, agent_id, title, chunk_count)
    VALUES (?, ?, ?, ?, ?)
  `).bind(docId, sourceId, agentId, title, rawChunks.length).run()

  // Insert chunks into storage & FTS
  for (let idx = 0; idx < rawChunks.length; idx++) {
    const chunkId = nanoid()
    const chunkText = rawChunks[idx]!

    await c.env.DB.prepare(`
      INSERT INTO knowledge_chunks (id, document_id, source_id, agent_id, content, chunk_index, source_title)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(chunkId, docId, sourceId, agentId, chunkText, idx, title).run()

    await c.env.DB.prepare(`
      INSERT INTO knowledge_chunks_fts (id, agent_id, source_id, document_id, content, source_title)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(chunkId, agentId, sourceId, docId, chunkText, title).run()
  }

  // Increment agent knowledge source count
  await c.env.DB.prepare(`
    UPDATE agents
    SET knowledge_source_count = knowledge_source_count + 1, updated_at = datetime('now')
    WHERE id = ?
  `).bind(agentId).run()

  return c.json({
    success: true,
    data: {
      id: sourceId,
      agentId,
      type: 'clipboard',
      title,
      status: 'indexed',
      chunkCount: rawChunks.length,
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// ── POST /api/knowledge/:agentId/website ── Register website URL
knowledge.post('/:agentId/website', zValidator('json', websiteSourceSchema), async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('agentId')
  const { title, url } = c.req.valid('json')

  const sourceId = nanoid()

  await c.env.DB.prepare(`
    INSERT INTO knowledge_sources (id, agent_id, organization_id, type, title, status, url)
    VALUES (?, ?, ?, 'website', ?, 'pending', ?)
  `).bind(sourceId, agentId, orgId, title, url).run()

  return c.json({
    success: true,
    data: {
      id: sourceId,
      agentId,
      type: 'website',
      title,
      url,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  }, 201)
})

// ── DELETE /api/knowledge/:agentId/:sourceId ── Remove source
knowledge.delete('/:agentId/:sourceId', async (c) => {
  const orgId = c.get('orgId')
  const agentId = c.req.param('agentId')
  const sourceId = c.req.param('sourceId')

  await c.env.DB.prepare(`
    UPDATE knowledge_sources
    SET deleted_at = datetime('now')
    WHERE id = ? AND agent_id = ? AND organization_id = ?
  `).bind(sourceId, agentId, orgId).run()

  // Clean up FTS chunks
  await c.env.DB.prepare(`
    DELETE FROM knowledge_chunks_fts
    WHERE source_id = ?
  `).bind(sourceId).run()

  await c.env.DB.prepare(`
    UPDATE agents
    SET knowledge_source_count = MAX(0, knowledge_source_count - 1), updated_at = datetime('now')
    WHERE id = ?
  `).bind(agentId).run()

  return c.json({ success: true, data: { deleted: true } })
})

export default knowledge
