/// <reference types="@cloudflare/workers-types" />

// Ambient type definitions for standalone IDE and editor language server
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface D1Database {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface R2Bucket {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DurableObjectNamespace {}
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface KVNamespace {}
}

// API server environment bindings (Cloudflare Workers / Vite local proxy)
export interface Env {
  // Cloudflare D1 database
  DB: D1Database

  // Cloudflare R2 storage
  STORAGE: R2Bucket

  // Cloudflare Durable Objects
  TRAINING_DO: DurableObjectNamespace
  CRAWL_DO: DurableObjectNamespace

  // KV for sessions, caching, rate limiting
  KV: KVNamespace

  // Secrets
  FIREBASE_SERVICE_ACCOUNT_JSON: string
  OLLAMA_API_KEY: string
  SUPABASE_URL: string
  SUPABASE_PUBLISHABLE_KEY: string
  SUPABASE_SECRET_KEY: string
  SUPABASE_JWKS_URL: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  
  // Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: string
  RAZORPAY_KEY_SECRET: string
  RAZORPAY_WEBHOOK_SECRET: string
  STRIPE_SECRET_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string

  // Hostinger SMTP
  SMTP_HOST: string
  SMTP_PORT: string
  SMTP_USER: string
  SMTP_PASS: string
  SMTP_FROM: string

  WEBHOOK_SIGNING_SECRET: string
  BCRYPT_SALT_ROUNDS: string

  // Config
  ALLOWED_ORIGINS: string
  NODE_ENV: string
  APP_URL: string
  MAX_FILE_SIZE_MB: string
  MAX_AGENTS_PER_ORG_FREE: string
  MAX_AGENTS_PER_ORG_PRO: string
  MAX_AGENTS_PER_ORG_BUSINESS: string
}

// Augmented Hono context variables
export interface Variables {
  userId: string
  orgId: string
  userRole: 'owner' | 'admin' | 'editor' | 'viewer'
  isApiKey: boolean
  apiKeyScopes: string[]
}
