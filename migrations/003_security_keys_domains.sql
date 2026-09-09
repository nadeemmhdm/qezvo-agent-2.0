-- ============================================================
-- AgentForge D1 Migration 003: Agents Sharing, API Keys, Custom Domains, Analytics, Versions
-- ============================================================

-- Agent Security Settings
CREATE TABLE IF NOT EXISTS agent_security (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT UNIQUE NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'public',       -- public | private | password
  password_hash TEXT,
  allowed_domains TEXT NOT NULL DEFAULT '[]',      -- JSON array of allowed referrer domains
  allowed_emails TEXT NOT NULL DEFAULT '[]',       -- JSON array of allowed email patterns
  require_email_capture INTEGER NOT NULL DEFAULT 0,
  max_messages_per_session INTEGER NOT NULL DEFAULT 50,
  max_messages_per_ip_per_hour INTEGER NOT NULL DEFAULT 100,
  enable_rate_limiting INTEGER NOT NULL DEFAULT 1,
  prompt_injection_protection INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Agent Versions
CREATE TABLE IF NOT EXISTS agent_versions (
  id TEXT PRIMARY KEY NOT NULL,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  label TEXT,
  description TEXT NOT NULL DEFAULT '',
  settings_snapshot TEXT NOT NULL DEFAULT '{}',   -- full JSON snapshot of agent_settings
  published_at TEXT,
  created_by TEXT NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(agent_id, version_number)
);

-- Custom Domains
CREATE TABLE IF NOT EXISTS custom_domains (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  domain TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',         -- pending | verifying | active | failed | deleted
  verification_token TEXT NOT NULL,
  ssl_status TEXT NOT NULL DEFAULT 'pending',     -- pending | provisioning | active | failed
  dns_verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,                  -- bcrypt hash of the actual key
  key_prefix TEXT NOT NULL,                        -- First 8 chars displayed to user
  scopes TEXT NOT NULL DEFAULT '["agents:read"]',  -- JSON array
  last_used_at TEXT,
  expires_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL,
  user_id TEXT,
  action TEXT NOT NULL,                           -- e.g. agent.create, agent.publish, api_key.create
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata TEXT NOT NULL DEFAULT '{}',             -- JSON
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Team Invitations
CREATE TABLE IF NOT EXISTS team_invitations (
  id TEXT PRIMARY KEY NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by TEXT NOT NULL REFERENCES users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL,
  accepted_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(organization_id, email)
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_org_id ON custom_domains(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_agent_id ON custom_domains(agent_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON api_keys(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
