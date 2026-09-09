// ============================================================
// Qezvo Agent — RFC 6238 TOTP Two-Factor Authentication Service
// Built with native Web Crypto API (HMAC-SHA1)
// ============================================================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * Encode bytes to RFC 4648 Base32 string
 */
export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]!
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  }

  return output
}

/**
 * Decode RFC 4648 Base32 string to Uint8Array
 */
export function base32Decode(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  const bytes: number[] = []
  let bits = 0
  let value = 0

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]!)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }

  return new Uint8Array(bytes)
}

/**
 * Generate a random 20-byte cryptographic secret key encoded in Base32 (32 characters)
 */
export function generateTotpSecret(): string {
  const buffer = new Uint8Array(20)
  crypto.getRandomValues(buffer)
  return base32Encode(buffer)
}

/**
 * Generate 8 emergency backup recovery codes (format: XXXX-XXXX)
 */
export function generateBackupCodes(count = 8): string[] {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(8)
    crypto.getRandomValues(bytes)
    let code = ''
    for (let j = 0; j < 8; j++) {
      code += chars[bytes[j]! % chars.length]
      if (j === 3) code += '-'
    }
    codes.push(code)
  }
  return codes
}

/**
 * Build standard otpauth URI for authenticator apps (Google Authenticator, Authy, 1Password)
 */
export function getTotpUri(secret: string, email: string, issuer = 'Qezvo Agent'): string {
  const cleanEmail = encodeURIComponent(email || 'user@qezvo.in')
  const cleanIssuer = encodeURIComponent(issuer)
  return `otpauth://totp/${cleanIssuer}:${cleanEmail}?secret=${secret}&issuer=${cleanIssuer}&algorithm=SHA1&digits=6&period=30`
}

/**
 * Get QR code image URL for scanning
 */
export function getQrCodeUrl(otpauthUri: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(otpauthUri)}`
}

/**
 * Compute 6-digit TOTP code for a specific counter step using Web Crypto HMAC-SHA1
 */
async function computeTotpCode(secret: string, counter: number): Promise<string> {
  const keyBytes = base32Decode(secret)
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer as ArrayBuffer,
    { name: 'HMAC', hash: { name: 'SHA-1' } },
    false,
    ['sign']
  )

  // 8-byte big-endian counter buffer
  const counterBuffer = new ArrayBuffer(8)
  const counterView = new DataView(counterBuffer)
  // Higher 32 bits
  counterView.setUint32(0, Math.floor(counter / 0x100000000))
  // Lower 32 bits
  counterView.setUint32(4, counter >>> 0)

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer)
  const hash = new Uint8Array(signature)

  // Dynamic truncation (RFC 4226)
  const offset = hash[hash.length - 1]! & 0x0f
  const binary =
    ((hash[offset]! & 0x7f) << 24) |
    ((hash[offset + 1]! & 0xff) << 16) |
    ((hash[offset + 2]! & 0xff) << 8) |
    (hash[offset + 3]! & 0xff)

  const otp = binary % 1000000
  return otp.toString().padStart(6, '0')
}

/**
 * Verify a user-provided 6-digit TOTP code against the secret key.
 * Allows a +/- 1 step window (30s clock drift).
 */
export async function verifyTotpCode(secret: string, token: string): Promise<boolean> {
  const cleanToken = token.trim().replace(/\s+/g, '')
  if (!/^\d{6}$/.test(cleanToken)) {
    return false
  }

  const currentStep = Math.floor(Date.now() / 1000 / 30)

  // Check window: previous step (-30s), current step, next step (+30s)
  for (let offset = -1; offset <= 1; offset++) {
    try {
      const expected = await computeTotpCode(secret, currentStep + offset)
      if (expected === cleanToken) {
        return true
      }
    } catch (err) {
      console.error('TOTP calculation error:', err)
    }
  }

  return false
}

// ── 2FA Storage & Persistence ──
export interface UserTotpState {
  enabled: boolean
  secret: string
  backupCodes: string[]
  usedBackupCodes: string[]
  enabledAt: string | null
}

const STORAGE_PREFIX = 'qezvo_2fa_'

export function getStoredTotpState(userId: string): UserTotpState {
  if (!userId) return { enabled: false, secret: '', backupCodes: [], usedBackupCodes: [], enabledAt: null }
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }
  return {
    enabled: false,
    secret: '',
    backupCodes: [],
    usedBackupCodes: [],
    enabledAt: null,
  }
}

export function saveStoredTotpState(userId: string, state: UserTotpState): void {
  if (!userId) return
  localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(state))
}

export function disableTotp(userId: string): void {
  if (!userId) return
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`)
}
