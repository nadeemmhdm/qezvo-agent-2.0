// ============================================================
// Qezvo Agent — Shared Types
// ============================================================

// ---- API Response Envelope ----
export interface ApiResponse<T = unknown> {
  success: true
  data: T
  requestId: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    requestId: string
    details?: Record<string, unknown>
  }
}

export type ApiResult<T = unknown> = ApiResponse<T> | ApiError

// ---- Pagination ----
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  nextCursor?: string
}

// ---- User & Organization ----
export interface User {
  id: string
  firebaseUid: string
  email: string
  fullName: string
  avatarUrl?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  avatarUrl?: string
  plan: PlanType
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: OrgRole
  joinedAt: string
  user: User
}

export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer'
export type PlanType = 'free' | 'pro' | 'business'

// ---- Agent ----
export type AgentStatus = 'draft' | 'training' | 'ready' | 'published' | 'unpublished' | 'failed'
export type AgentLanguage =
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'pt'
  | 'it'
  | 'nl'
  | 'pl'
  | 'ru'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'ar'
  | 'hi'

export interface Agent {
  id: string
  organizationId: string
  name: string
  description: string
  slug: string
  status: AgentStatus
  avatarUrl?: string
  language: AgentLanguage
  currentVersion: number
  publishedVersionId?: string
  knowledgeSourceCount: number
  createdAt: string
  updatedAt: string
}

export interface AgentVersion {
  id: string
  agentId: string
  version: number
  label?: string
  settings: AgentSettings
  isPublished: boolean
  publishedAt?: string
  createdAt: string
  createdBy: string
}

export interface AgentSettings {
  // Behavior
  personality: string
  tone: AgentTone
  responseStyle: ResponseStyle
  instructions: string
  language: AgentLanguage
  fallbackBehavior: string
  citationsEnabled: boolean
  citationStyle: CitationStyle

  // Model
  provider: 'ollama'
  modelId: string
  temperature: number
  maxTokens: number
  topP: number
  systemInstructions: string
  contextSize: number
  retrievalTopK: number

  // Customization
  displayName: string
  welcomeMessage: string
  placeholder: string
  suggestedQuestions: string[]
  typingIndicator: boolean
  streamingEnabled: boolean
  markdownEnabled: boolean
  codeBlocksEnabled: boolean

  // Appearance
  theme: 'light' | 'dark' | 'auto'
  primaryColor: string
  backgroundColor: string
  userMessageColor: string
  agentMessageColor: string
  fontFamily: string
  fontSize: 'sm' | 'base' | 'lg'
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  width: number
  height: number
  position: 'bottom-right' | 'bottom-left'
}

export type AgentTone = 'professional' | 'friendly' | 'casual' | 'formal' | 'empathetic'
export type ResponseStyle = 'concise' | 'detailed' | 'bullet-points' | 'conversational'
export type CitationStyle = 'inline' | 'footnote' | 'none'

// ---- Knowledge ----
export type KnowledgeSourceType = 'file' | 'website' | 'sitemap' | 'clipboard'
export type KnowledgeSourceStatus =
  | 'pending'
  | 'processing'
  | 'indexed'
  | 'failed'
  | 'deleted'

export interface KnowledgeSource {
  id: string
  agentId: string
  type: KnowledgeSourceType
  title: string
  status: KnowledgeSourceStatus
  documentCount: number
  chunkCount: number
  url?: string
  fileType?: string
  fileSizeBytes?: number
  createdAt: string
  updatedAt: string
}

export interface KnowledgeDocument {
  id: string
  sourceId: string
  agentId: string
  title: string
  pageNumber?: number
  url?: string
  chunkCount: number
  createdAt: string
}

export interface KnowledgeChunk {
  id: string
  documentId: string
  sourceId: string
  agentId: string
  content: string
  chunkIndex: number
  pageNumber?: number
  url?: string
  sourceTitle: string
  score?: number // for search results
}

export interface SearchResult {
  chunk: KnowledgeChunk
  score: number
}

// ---- Training Jobs ----
export type TrainingJobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'interrupted'

export type TrainingJobStep =
  | 'created'
  | 'validating'
  | 'uploading'
  | 'detecting-type'
  | 'extracting'
  | 'ocr'
  | 'normalizing'
  | 'chunking'
  | 'indexing'
  | 'saving-metadata'
  | 'cleanup'
  | 'done'

export interface TrainingJob {
  id: string
  agentId: string
  sourceId: string
  status: TrainingJobStatus
  currentStep: TrainingJobStep
  progress: number
  documentCount: number
  chunkCount: number
  errorMessage?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

// ---- Website / Crawler ----
export type CrawlJobStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled'
export type PageScanStatus = 'pending' | 'fetching' | 'processed' | 'failed' | 'skipped'

export interface CrawlJob {
  id: string
  agentId: string
  rootUrl: string
  status: CrawlJobStatus
  maxDepth: number
  maxPages: number
  sameDomainOnly: boolean
  includeSubdomains: boolean
  respectRobotsTxt: boolean
  totalPages: number
  processedPages: number
  failedPages: number
  createdAt: string
}

export interface SitemapPage {
  id: string
  url: string
  lastModified?: string
  status: PageScanStatus
  selected: boolean
  errorMessage?: string
}

// ---- Widget ----
export interface WidgetSettings {
  enabled: boolean
  position: 'bottom-right' | 'bottom-left'
  width: number
  height: number
  buttonText: string
  welcomeMessage: string
  avatarUrl?: string
  allowedOrigins: string[]
}

// ---- Security ----
export interface SecuritySettings {
  publicAccess: boolean
  widgetEnabled: boolean
  apiEnabled: boolean
  rateLimitPerMinute: number
  allowedOrigins: string[]
  allowedDomains: string[]
  passwordProtected: boolean
  passwordHash?: string
  shareUrl?: string
  sourceVisibility: 'public' | 'private'
  citationVisibility: 'public' | 'private'
}

// ---- Custom Domains ----
export type DomainStatus =
  | 'pending'
  | 'verifying'
  | 'verified'
  | 'ssl_provisioning'
  | 'active'
  | 'failed'

export interface CustomDomain {
  id: string
  organizationId: string
  domain: string
  status: DomainStatus
  verificationToken: string
  agentId?: string
  createdAt: string
  updatedAt: string
}

// ---- API Keys ----
export interface ApiKey {
  id: string
  organizationId: string
  name: string
  keyPrefix: string // e.g., "ag_live_xxxx..." (first 12 chars only)
  lastUsedAt?: string
  expiresAt?: string
  status: 'active' | 'revoked'
  scopes: string[]
  createdAt: string
}

// ---- Analytics ----
export interface DailyUsage {
  date: string
  agentId: string
  requestCount: number
  successCount: number
  errorCount: number
  latencyP50: number
  latencyP95: number
  estimatedTokens: number
}

export interface AgentUsageSummary {
  agentId: string
  agentName: string
  totalRequests: number
  successRate: number
  avgLatency: number
  totalTokensEstimated: number
}

// ---- Billing ----
export interface Plan {
  id: PlanType
  name: string
  maxAgents: number
  maxKnowledgeSourcesPerAgent: number
  maxStorageGb: number
  maxRequestsPerMonth: number
  maxTrainingJobsPerMonth: number
  maxTeamMembers: number
  customDomains: boolean
  apiAccess: boolean
  prioritySupport: boolean
  priceMonthly: number
  priceYearly: number
}

export interface UsageSummary {
  agentsCount: number
  knowledgeSourcesCount: number
  requestsThisMonth: number
  trainingJobsThisMonth: number
  storageUsedGb: number
  teamMembersCount: number
}

// ---- Audit ----
export type AuditEventType =
  | 'login'
  | 'logout'
  | 'agent_created'
  | 'agent_deleted'
  | 'agent_published'
  | 'agent_unpublished'
  | 'knowledge_added'
  | 'knowledge_deleted'
  | 'training_started'
  | 'training_completed'
  | 'training_failed'
  | 'api_key_created'
  | 'api_key_revoked'
  | 'domain_added'
  | 'domain_verified'
  | 'security_changed'
  | 'team_member_added'
  | 'role_changed'

export interface AuditLog {
  id: string
  eventType: AuditEventType
  actorId: string
  organizationId: string
  resourceType: string
  resourceId?: string
  metadata: Record<string, string | number | boolean>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

// ---- Notifications ----
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  actionUrl?: string
  createdAt: string
}

// ---- Webhooks ----
export type WebhookEvent =
  | 'agent.published'
  | 'agent.unpublished'
  | 'training.started'
  | 'training.completed'
  | 'training.failed'
  | 'website.scan.completed'
  | 'domain.verified'

export interface Webhook {
  id: string
  organizationId: string
  url: string
  events: WebhookEvent[]
  status: 'active' | 'disabled'
  secretPrefix: string
  createdAt: string
}

// ---- Chat (public — ephemeral, never persisted) ----
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: SearchResult[]
  latencyMs?: number
  timestamp: number // local only, never sent to server
}

export interface ChatRequest {
  message: string
  agentId: string
  sessionId: string // ephemeral, per-tab
}

export interface ChatResponse {
  content: string
  sources: SearchResult[]
  latencyMs: number
  model: string
}

// ---- Usage Summary ----
export interface UsageSummary {
  agentsCount: number
  knowledgeSourcesCount: number
  requestsThisMonth: number
  requestsLastMonth: number
  storageUsedGb: number
  trainingJobsThisMonth: number
}



