-- ============================================================
-- AgentForge D1 Migration 002: Indexes
-- ============================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Organizations
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- Organization Members
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON organization_members(user_id);

-- Agents
CREATE INDEX IF NOT EXISTS idx_agents_org_id ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON agents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_deleted_at ON agents(deleted_at);

-- Knowledge Sources
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_agent_id ON knowledge_sources(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_org_id ON knowledge_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_status ON knowledge_sources(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_type ON knowledge_sources(type);

-- Knowledge Documents
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_id ON knowledge_documents(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_agent_id ON knowledge_documents(agent_id);

-- Knowledge Chunks
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_agent_id ON knowledge_chunks(agent_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_source_id ON knowledge_chunks(source_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);

-- Training Jobs
CREATE INDEX IF NOT EXISTS idx_training_jobs_agent_id ON training_jobs(agent_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_source_id ON training_jobs(source_id);
CREATE INDEX IF NOT EXISTS idx_training_jobs_status ON training_jobs(status);
CREATE INDEX IF NOT EXISTS idx_training_jobs_created_at ON training_jobs(created_at DESC);

-- Crawl Jobs
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_agent_id ON crawl_jobs(agent_id);
CREATE INDEX IF NOT EXISTS idx_crawl_jobs_status ON crawl_jobs(status);
