import type { MiddlewareHandler } from 'hono'
import type { Env, Variables } from '../types/env'

// ── Firebase token verification ──
async function verifyFirebaseToken(
  idToken: string,
  serviceAccountJson: string
): Promise<{ uid: string; email: string; email_verified: boolean } | null> {
  try {
    // Decode JWT header to get kid
    const parts = idToken.split('.')
    if (parts.length !== 3) return null

    const header = JSON.parse(atob(parts[0]!))
    const payload = JSON.parse(atob(parts[1]!))

    // Check expiry
    if (payload.exp < Date.now() / 1000) return null

    // Fetch Google public keys
    const keysRes = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      { cf: { cacheEverything: true, cacheTtl: 3600 } } as RequestInit
    )
    if (!keysRes.ok) return null
    const keys = await keysRes.json() as Record<string, string>
    const pemKey = keys[header.kid]
    if (!pemKey) return null

    // Import the RSA public key
    const binaryKey = pemToBinary(pemKey)
    const cryptoKey = await crypto.subtle.importKey(
      'spki',
      binaryKey,
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    )

    // Verify signature
    const signature = base64urlToUint8Array(parts[2]!)
    const data = new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', cryptoKey, signature as unknown as BufferSource, data)
    if (!valid) return null

    // Verify project id
    const serviceAccount = JSON.parse(serviceAccountJson)
    if (payload.aud !== serviceAccount.project_id) return null
    if (payload.iss !== `https://securetoken.google.com/${serviceAccount.project_id}`) return null

    return {
      uid: payload.sub,
      email: payload.email ?? '',
      email_verified: payload.email_verified ?? false,
    }
  } catch {
    return null
  }
}

function pemToBinary(pem: string): ArrayBuffer {
  const base64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '')
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)!
  return bytes.buffer
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)!
  return bytes
}

// ── Middleware: require Firebase auth ──
export const requireAuth: MiddlewareHandler<{ Bindings: Env; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing authentication token' } }, 401)
  }

  const token = authHeader.slice(7)

  // Check for API key (starts with "af_")
  if (token.startsWith('af_')) {
    return handleApiKey(c, next, token)
  }

  // Firebase ID token
  const firebasePayload = await verifyFirebaseToken(token, c.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  if (!firebasePayload) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401)
  }

  // Look up user + their organization membership
  const result = await c.env.DB.prepare(`
    SELECT u.id as user_id, om.organization_id, om.role
    FROM users u
    LEFT JOIN organization_members om ON om.user_id = u.id
    WHERE u.firebase_uid = ?
    LIMIT 1
  `).bind(firebasePayload.uid).first<{ user_id: string; organization_id: string; role: string }>()

  if (!result) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not found' } }, 401)
  }

  c.set('userId', result.user_id)
  c.set('orgId', result.organization_id)
  c.set('userRole', result.role as Variables['userRole'])
  c.set('isApiKey', false)
  c.set('apiKeyScopes', [])

  await next()
}

// ── API Key handler ──
async function handleApiKey(c: any, next: () => Promise<void>, rawKey: string) {
  // In Cloudflare Workers, use WebCrypto
  const encoder = new TextEncoder()
  const data = encoder.encode(rawKey)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const keyHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  const apiKey = await c.env.DB.prepare(`
    SELECT ak.id, ak.organization_id, ak.scopes, ak.expires_at, ak.revoked_at,
           om.user_id, om.role
    FROM api_keys ak
    JOIN organization_members om ON om.organization_id = ak.organization_id AND om.role = 'owner'
    WHERE ak.key_hash = ? AND ak.revoked_at IS NULL
    LIMIT 1
  `).bind(keyHash).first()

  if (!apiKey) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } }, 401)
  }

  // Check expiry
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'API key has expired' } }, 401)
  }

  // Update last used
  c.executionCtx?.waitUntil(
    c.env.DB.prepare('UPDATE api_keys SET last_used_at = ? WHERE id = ?')
      .bind(new Date().toISOString(), apiKey.id)
      .run()
  )

  c.set('userId', apiKey.user_id)
  c.set('orgId', apiKey.organization_id)
  c.set('userRole', apiKey.role)
  c.set('isApiKey', true)
  c.set('apiKeyScopes', JSON.parse(apiKey.scopes ?? '[]'))

  await next()
}

// ── Middleware: require org role ──
export function requireRole(...roles: string[]): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c, next) => {
    const role = c.get('userRole')
    if (!roles.includes(role)) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }, 403)
    }
    await next()
  }
}

// ── Middleware: require API key scope ──
export function requireScope(scope: string): MiddlewareHandler<{ Bindings: Env; Variables: Variables }> {
  return async (c, next) => {
    if (!c.get('isApiKey')) return next()
    const scopes = c.get('apiKeyScopes') as string[]
    if (!scopes.includes(scope) && !scopes.includes('*')) {
      return c.json({ success: false, error: { code: 'FORBIDDEN', message: `API key missing scope: ${scope}` } }, 403)
    }
    await next()
  }
}
