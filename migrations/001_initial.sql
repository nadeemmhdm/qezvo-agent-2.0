-- ============================================================
-- AgentForge D1 Migration 001: Initial Schema
-- ============================================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,                    -- UUID
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  email_verified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Organizations
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',               -- free | pro | business
  stripe_customer_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Organization Members
CREATE TABLE IF NOT EXISTS organization_members (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer',             -- owner | admin | editor | viewer
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id, user_id)
);

-- Agents
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',            -- draft | training | ready | published | unpublished | failed
  avatar_url TEXT,
  language TEXT NOT NULL DEFAULT 'en',
  current_version INTEGER NOT NULL DEFAULT 0,
  published_version_id TEXT,
  knowledge_source_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT,
  UNIQUE(organization_id, slug)
);

-- Agent Settings (JSONB-like: one row per agent, config stored as JSON TEXT)
CREATE TABLE IF NOT EXISTS agent_settings (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT UNIQUE NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  -- Behavior
  personality TEXT NOT NULL DEFAULT '',
  tone TEXT NOT NULL DEFAULT 'professional',
  response_style TEXT NOT NULL DEFAULT 'concise',
  instructions TEXT NOT NULL DEFAULT '',
  language TEXT NOT NULL DEFAULT 'en',
  fallback_behavior TEXT NOT NULL DEFAULT 'I don''t have information about that. Please contact support.',
  citations_enabled INTEGER NOT NULL DEFAULT 1,
  citation_style TEXT NOT NULL DEFAULT 'inline',
  -- Model
  provider TEXT NOT NULL DEFAULT 'ollama',
  model_id TEXT NOT NULL DEFAULT '',
  temperature REAL NOT NULL DEFAULT 0.7,
  max_tokens INTEGER NOT NULL DEFAULT 1024,
  top_p REAL NOT NULL DEFAULT 0.9,
  system_instructions TEXT NOT NULL DEFAULT '',
  context_size INTEGER NOT NULL DEFAULT 4096,
  retrieval_top_k INTEGER NOT NULL DEFAULT 5,
  -- Display
  display_name TEXT NOT NULL DEFAULT '',
  welcome_message TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
  placeholder TEXT NOT NULL DEFAULT 'Ask me anything...',
  suggested_questions TEXT NOT NULL DEFAULT '[]',  -- JSON array
  typing_indicator INTEGER NOT NULL DEFAULT 1,
  streaming_enabled INTEGER NOT NULL DEFAULT 1,
  markdown_enabled INTEGER NOT NULL DEFAULT 1,
  code_blocks_enabled INTEGER NOT NULL DEFAULT 1,
  -- Appearance
  theme TEXT NOT NULL DEFAULT 'auto',
  primary_color TEXT NOT NULL DEFAULT '#6366F1',
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  user_message_color TEXT NOT NULL DEFAULT '#6366F1',
  agent_message_color TEXT NOT NULL DEFAULT '#F3F4F6',
  font_family TEXT NOT NULL DEFAULT 'Inter',
  font_size TEXT NOT NULL DEFAULT 'base',
  border_radius TEXT NOT NULL DEFAULT 'md',
  widget_width INTEGER NOT NULL DEFAULT 380,
  widget_height INTEGER NOT NULL DEFAULT 600,
  widget_position TEXT NOT NULL DEFAULT 'bottom-right',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Knowledge Sources
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL,
  type TEXT NOT NULL,                              -- file | website | sitemap | clipboard
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',          -- pending | processing | indexed | failed | deleted
  document_count INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  url TEXT,
  file_type TEXT,
  file_size_bytes INTEGER,
  supabase_path TEXT,                              -- temp storage path (cleared after processing)
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at TEXT
);

-- Knowledge Documents (one per page/file/url)
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id TEXT PRIMARY KEY NOT NULL,
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  title TEXT NOT NULL,
  page_number INTEGER,
  url TEXT,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Knowledge Chunks (FTS5 virtual table for search)
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL DEFAULT 0,
  page_number INTEGER,
  url TEXT,
  source_title TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_chunks_fts USING fts5(
  id UNINDEXED,
  agent_id UNINDEXED,
  source_id UNINDEXED,
  document_id UNINDEXED,
  content,
  source_title,
  url UNINDEXED,
  page_number UNINDEXED,
  content='knowledge_chunks',
  content_rowid='rowid'
);

-- Training Jobs
CREATE TABLE IF NOT EXISTS training_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',           -- queued | processing | completed | failed | cancelled | interrupted
  current_step TEXT NOT NULL DEFAULT 'created',
  progress INTEGER NOT NULL DEFAULT 0,
  document_count INTEGER NOT NULL DEFAULT 0,
  chunk_count INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  sandbox_job_id TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Crawl Jobs
CREATE TABLE IF NOT EXISTS crawl_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  root_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  max_depth INTEGER NOT NULL DEFAULT 3,
  max_pages INTEGER NOT NULL DEFAULT 50,
  same_domain_only INTEGER NOT NULL DEFAULT 1,
  include_subdomains INTEGER NOT NULL DEFAULT 0,
  respect_robots_txt INTEGER NOT NULL DEFAULT 1,
  request_delay_ms INTEGER NOT NULL DEFAULT 1000,
  total_pages INTEGER NOT NULL DEFAULT 0,
  processed_pages INTEGER NOT NULL DEFAULT 0,
  failed_pages INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
