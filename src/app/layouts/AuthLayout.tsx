import { Outlet } from 'react-router-dom'

/**
 * Auth Layout — centered card on a subtle gradient background
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-background to-background pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--border)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <svg viewBox="0 0 32 32" width="32" height="32" className="text-brand-500 shrink-0" fill="currentColor">
            <path d="M16 2L4 8v16l12 6 12-6V8L16 2zm0 3.2L25.6 10 16 14.8 6.4 10 16 5.2zM6 12.4l9 4.5V27L6 22.5v-10zm11 14.1V16.9l9-4.5v10L17 26.5z" />
          </svg>
          <span className="font-bold text-xl tracking-tight">Qezvo Agent</span>
        </div>

        {/* Auth Form Container */}
        <div className="rounded-2xl border bg-card shadow-xl shadow-black/5 p-8">
          <Outlet />
        </div>

        {/* Footer links */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-x-3">
          <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          <span>·</span>
          <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          <span>·</span>
          <a href="/security" className="hover:text-foreground transition-colors">Security</a>
        </div>
      </div>
    </div>
  )
}
