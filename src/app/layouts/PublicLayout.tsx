import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight, ShieldCheck, Zap, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlatformMaintenance } from '@/features/admin/platformStore'

export default function PublicLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { maintenance } = usePlatformMaintenance()

  const navLinks = [
    { label: 'Features', href: '/features' },
    { label: 'How it works', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Use Cases', href: '/use-cases' },
    { label: 'Docs', href: '/documentation' },
    { label: 'Changelog', href: '/changelog' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-[#FFE600] selection:text-black">
      {/* Global Maintenance Alert Bar */}
      {maintenance.enabled && (
        <div className="bg-[#FFE600] text-black border-b-2 border-black py-2 px-4 text-xs font-black flex items-center justify-center gap-2 shadow-[0px_2px_0px_0px_#000]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Platform Maintenance Active: {maintenance.message}</span>
          <Link to="/status" className="underline font-bold ml-2">System Status &rarr;</Link>
        </div>
      )}

      {/* ── Top Navbar (Neobrutalism) ── */}
      <nav className="sticky top-0 z-50 bg-background border-b-2 border-border shadow-[0px_3px_0px_0px_hsl(var(--neo-shadow))] transition-colors">
        <div className="container max-w-6xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 font-extrabold text-lg tracking-tight group">
            <div className="w-9 h-9 rounded-xl bg-[#FFE600] border-2 border-border shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] flex items-center justify-center transition-transform group-hover:scale-105 group-hover:rotate-[-2deg] font-black text-black">
              ⚡
            </div>
            <span className="font-black text-xl">Qezvo <span className="text-primary underline decoration-4 decoration-[#FFE600]">Agent</span></span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`transition-all px-2.5 py-1 rounded-lg border-2 ${
                  isActive(link.href)
                    ? 'border-border bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]'
                    : 'border-transparent text-foreground/80 hover:text-foreground hover:border-border hover:bg-muted'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" id="nav-login-btn">
                Sign in
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" variant="brand" id="nav-signup-btn" className="bg-primary text-white">
                Get started
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-xl border-2 border-border bg-card shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b-2 border-border bg-background p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="space-y-1.5">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3.5 py-2 rounded-xl text-base font-bold border-2 transition-all ${
                    isActive(link.href)
                      ? 'border-border bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))]'
                      : 'border-transparent text-foreground/80 hover:border-border hover:bg-muted'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t-2 border-border flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="brand" className="w-full justify-center">
                  Get started free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Page Content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer (Neobrutalism) ── */}
      <footer className="border-t-2 border-border bg-muted/40 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2.5 font-black text-xl">
                <div className="w-8 h-8 rounded-lg bg-[#FFE600] border-2 border-border shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] flex items-center justify-center font-black text-black text-sm">
                  ⚡
                </div>
                <span>Qezvo Agent</span>
              </Link>
              <p className="text-xs text-muted-foreground font-semibold max-w-sm leading-relaxed">
                Open-source AI agent SaaS builder platform developed and managed by <a href="https://affogato.solutions" target="_blank" rel="noreferrer" className="text-foreground font-bold underline">Affogato Solutions</a> in Kerala, India.
              </p>
              <div className="flex items-center gap-2 text-xs font-bold text-foreground bg-card border-2 border-border shadow-[2px_2px_0px_0px_hsl(var(--neo-shadow))] rounded-xl px-3 py-2 w-fit">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 stroke-[2.5]" />
                <span>Zero Chat Storage — Privacy by Architecture</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-4">Product</p>
              <ul className="space-y-2.5 text-xs font-bold text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground hover:underline transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground hover:underline transition-colors">Pricing</Link></li>
                <li><Link to="/how-it-works" className="hover:text-foreground hover:underline transition-colors">How it works</Link></li>
                <li><Link to="/use-cases" className="hover:text-foreground hover:underline transition-colors">Use cases</Link></li>
                <li><Link to="/changelog" className="hover:text-foreground hover:underline transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-4">Developers</p>
              <ul className="space-y-2.5 text-xs font-bold text-muted-foreground">
                <li><Link to="/documentation" className="hover:text-foreground hover:underline transition-colors">Documentation</Link></li>
                <li><Link to="/api" className="hover:text-foreground hover:underline transition-colors">API Reference</Link></li>
                <li><Link to="/faq" className="hover:text-foreground hover:underline transition-colors">FAQ</Link></li>
                <li><Link to="/status" className="hover:text-foreground hover:underline transition-colors">System Status</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-foreground mb-4">Company &amp; Legal</p>
              <ul className="space-y-2.5 text-xs font-bold text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground hover:underline transition-colors">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-foreground hover:underline transition-colors">Contact</Link></li>
                <li><Link to="/security" className="hover:text-foreground hover:underline transition-colors">Security &amp; SSRF</Link></li>
                <li><Link to="/privacy" className="hover:text-foreground hover:underline transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-foreground hover:underline transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
            <p>© {new Date().getFullYear()} Qezvo Agent. Developed and managed by Affogato Solutions, Kerala, India.</p>
            <p className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-[#FFE600] fill-[#FFE600]" />
              <span>Ollama Cloud Speed Engine • Open Source</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
