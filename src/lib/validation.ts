import { z } from 'zod'

// ---- Auth Schemas ----
export const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v === true, 'You must accept the terms of service'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// ---- Agent Schemas ----
export const createAgentStep1Schema = z.object({
  name: z
    .string()
    .min(2, 'Agent name must be at least 2 characters')
    .max(80, 'Agent name must be under 80 characters'),
  description: z.string().max(500, 'Description must be under 500 characters').optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'pt', 'it', 'nl', 'pl', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi']),
})

export const agentBehaviorSchema = z.object({
  personality: z.string().max(1000).optional(),
  tone: z.enum(['professional', 'friendly', 'casual', 'formal', 'empathetic']),
  responseStyle: z.enum(['concise', 'detailed', 'bullet-points', 'conversational']),
  instructions: z.string().max(5000).optional(),
  fallbackBehavior: z.string().max(500).optional(),
  citationsEnabled: z.boolean(),
  citationStyle: z.enum(['inline', 'footnote', 'none']),
})

export const agentModelSchema = z.object({
  modelId: z.string().min(1, 'Please select a model'),
  temperature: z.number().min(0).max(2),
  maxTokens: z.number().int().min(1).max(32768),
  topP: z.number().min(0).max(1),
  systemInstructions: z.string().max(5000).optional(),
  retrievalTopK: z.number().int().min(1).max(20),
})

// ---- URL Schemas ----
export const urlSchema = z
  .string()
  .url('Please enter a valid URL')
  .refine((url) => {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }, 'URL must use HTTP or HTTPS')

export const sitemapUrlSchema = z
  .string()
  .url('Please enter a valid sitemap URL')
  .refine((url) => url.endsWith('.xml') || url.includes('sitemap'), 'URL should point to a sitemap.xml file')

export const websiteScanSchema = z.object({
  url: urlSchema,
})

export const crawlOptionsSchema = z.object({
  rootUrl: urlSchema,
  maxDepth: z.number().int().min(1).max(10),
  maxPages: z.number().int().min(1).max(500),
  sameDomainOnly: z.boolean(),
  includeSubdomains: z.boolean(),
  respectRobotsTxt: z.boolean(),
  requestDelayMs: z.number().int().min(0).max(5000),
})

// ---- Upload Schemas ----
export const fileUploadMetaSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024), // 100MB max
  agentId: z.string().uuid(),
})

// ---- Clipboard Schema ----
export const clipboardSchema = z.object({
  title: z.string().min(1, 'Please provide a title').max(200),
  content: z.string().min(10, 'Content must be at least 10 characters').max(500_000),
})

// ---- Security Schema ----
export const securitySettingsSchema = z.object({
  publicAccess: z.boolean(),
  widgetEnabled: z.boolean(),
  apiEnabled: z.boolean(),
  rateLimitPerMinute: z.number().int().min(1).max(1000),
  allowedOrigins: z.array(z.string().url()).max(20),
  passwordProtected: z.boolean(),
  password: z.string().max(100).optional(),
})

// ---- Domain Schema ----
export const domainSchema = z.object({
  domain: z
    .string()
    .min(3, 'Please enter a valid domain')
    .regex(
      /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
      'Please enter a valid domain name (e.g., support.yourdomain.com)'
    ),
})

// ---- API Key Schema ----
export const apiKeySchema = z.object({
  name: z.string().min(1, 'Please provide a name for this key').max(100),
  expiresInDays: z.number().int().min(1).max(365).optional(),
  scopes: z.array(z.string()).min(1, 'Please select at least one scope'),
})

// ---- Team Schema ----
export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

// ---- Widget Schema ----
export const widgetSettingsSchema = z.object({
  enabled: z.boolean(),
  position: z.enum(['bottom-right', 'bottom-left']),
  width: z.number().int().min(280).max(600),
  height: z.number().int().min(400).max(900),
  buttonText: z.string().max(50).optional(),
  welcomeMessage: z.string().max(500).optional(),
  allowedOrigins: z.array(z.string()).max(20),
})

// ---- Customization Schema ----
export const customizationSchema = z.object({
  displayName: z.string().min(1).max(80),
  welcomeMessage: z.string().max(500).optional(),
  placeholder: z.string().max(200).optional(),
  suggestedQuestions: z.array(z.string().max(200)).max(5),
  theme: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Please enter a valid hex color'),
  fontFamily: z.string().max(100),
  fontSize: z.enum(['sm', 'base', 'lg']),
})

// ---- Webhook Schema ----
export const webhookSchema = z.object({
  url: urlSchema,
  events: z.array(z.string()).min(1, 'Please select at least one event'),
})

// Type exports
export type SignupFormData = z.infer<typeof signupSchema>
export type LoginFormData = z.infer<typeof loginSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type CreateAgentStep1Data = z.infer<typeof createAgentStep1Schema>
export type AgentBehaviorData = z.infer<typeof agentBehaviorSchema>
export type AgentModelData = z.infer<typeof agentModelSchema>
export type WebsiteScanData = z.infer<typeof websiteScanSchema>
export type CrawlOptionsData = z.infer<typeof crawlOptionsSchema>
export type ClipboardData = z.infer<typeof clipboardSchema>
export type SecuritySettingsData = z.infer<typeof securitySettingsSchema>
export type DomainData = z.infer<typeof domainSchema>
export type ApiKeyData = z.infer<typeof apiKeySchema>
export type InviteMemberData = z.infer<typeof inviteMemberSchema>
export type WidgetSettingsData = z.infer<typeof widgetSettingsSchema>
export type CustomizationData = z.infer<typeof customizationSchema>
