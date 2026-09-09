import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

// ---- Class name utility ----
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---- Date formatting ----
export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDate(date: string | Date, pattern = 'MMM d, yyyy'): string {
  return format(new Date(date), pattern)
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy · h:mm a')
}

// ---- File size formatting ----
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

// ---- Number formatting ----
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

// ---- String utilities ----
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return `${str.slice(0, maxLength - 3)}...`
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function titleCase(str: string): string {
  return str.replace(/\b\w/g, (c) => c.toUpperCase())
}

// ---- UUID ----
export function generateId(): string {
  return crypto.randomUUID()
}

// ---- URL utilities ----
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

// ---- Color utilities ----
export function hexToHsl(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return '0 0% 0%'

  let r = parseInt(result[1]!, 16) / 255
  let g = parseInt(result[2]!, 16) / 255
  let b = parseInt(result[3]!, 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// ---- Copy to clipboard ----
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

// ---- Download ----
export function downloadText(content: string, filename: string, mimeType = 'text/plain'): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ---- Local storage (safe) ----
export function safeLocalStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return fallback
    return JSON.parse(item) as T
  } catch {
    return fallback
  }
}

export function safeLocalStorageSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
  } catch {
    // ignore quota errors
  }
}

// ---- Debounce ----
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delayMs)
  }
}

// ---- Agent status helpers ----
export function getAgentStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'text-muted-foreground',
    training: 'text-blue-500',
    ready: 'text-green-500',
    published: 'text-brand-500',
    unpublished: 'text-yellow-500',
    failed: 'text-destructive',
  }
  return colors[status] ?? 'text-muted-foreground'
}

export function getAgentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    training: 'Training',
    ready: 'Ready',
    published: 'Published',
    unpublished: 'Unpublished',
    failed: 'Failed',
  }
  return labels[status] ?? status
}

// ---- Training job helpers ----
export function getTrainingStepLabel(step: string): string {
  const labels: Record<string, string> = {
    created: 'Created',
    validating: 'Validating',
    uploading: 'Uploading',
    'detecting-type': 'Detecting Type',
    extracting: 'Extracting Content',
    ocr: 'Running OCR',
    normalizing: 'Normalizing',
    chunking: 'Chunking',
    indexing: 'Indexing',
    'saving-metadata': 'Saving Metadata',
    cleanup: 'Cleaning Up',
    done: 'Complete',
  }
  return labels[step] ?? step
}
