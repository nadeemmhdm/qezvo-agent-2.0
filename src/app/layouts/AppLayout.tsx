import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Bot, Globe, BarChart2, Key, Users, CreditCard,
  Settings, Menu, X, Bell, Search, HelpCircle, ChevronDown, LogOut,
  User, Moon, Sun
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'

import { ADMIN_EMAIL, usePlatformMaintenance } from '@/features/admin/platformStore'
import { Shield, AlertTriangle } from 'lucide-react'

const navItems = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/agents', icon: Bot, label: 'Agents' },
  { to: '/app/domains', icon: Globe, label: 'Domains' },
  { to: '/app/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/app/api', icon: Key, label: 'API' },
  { to: '/app/team', icon: Users, label: 'Team' },
  { to: '/app/billing', icon: CreditCard, label: 'Billing' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

function SidebarNav({ onClose, isAdmin }: { onClose?: () => void; isAdmin?: boolean }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5">
      {isAdmin && (
        <NavLink
          to="/app/admin"
          onClick={onClose}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider mb-3 transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000]',
              isActive ? 'bg-[#FFE600] text-black' : 'bg-yellow-300 text-black hover:bg-yellow-400'
            )
          }
        >
          <Shield className="h-4 w-4 shrink-0 stroke-[2.5]" />
          <span>Admin Control</span>
        </NavLink>
      )}
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          className={({ isActive }) =>
            cn('sidebar-item', isActive && 'sidebar-item-active')
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export default function AppLayout() {
  const { user, signOut } = useAuth()
  const { maintenance } = usePlatformMaintenance()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  )

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark')
    setDarkMode(!darkMode)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error('Sign out failed', 'Please try again')
    }
  }

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  if (maintenance.enabled && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="max-w-md w-full p-8 rounded-2xl border-2 border-black bg-[#FFE600] text-black shadow-[6px_6px_0px_0px_#000] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-black text-[#FFE600] flex items-center justify-center mx-auto text-2xl font-black shadow-[3px_3px_0px_0px_#000]">
            ⚡
          </div>
          <h2 className="text-2xl font-black">System Maintenance Active</h2>
          <p className="text-xs font-semibold leading-relaxed">
            {maintenance.message}
          </p>
          <div className="p-3 bg-black/10 rounded-xl font-mono text-[11px] font-bold text-black/80">
            Workspace access is temporarily reserved for Administrator ({ADMIN_EMAIL}).
          </div>
          <Button onClick={handleSignOut} className="bg-black text-white hover:bg-neutral-800 font-black text-xs w-full">
            Sign Out
          </Button>
        </div>
      </div>
    )
  }

  const userInitials = user?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-sidebar-background border-r-2 border-sidebar-border shrink-0">
        {/* Logo */}
        <Link
          to="/app/dashboard"
          className="flex items-center gap-2.5 px-4 h-16 border-b-2 border-sidebar-border shrink-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFE600] text-black border-2 border-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#000]">
            ⚡
          </div>
          <span className="font-black text-sidebar-foreground text-lg tracking-tight">Qezvo Agent</span>
        </Link>

        <SidebarNav isAdmin={isAdmin} />

        {/* User area */}
        <div className="p-3 border-t-2 border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 w-full rounded-xl px-2 py-2 hover:bg-sidebar-accent transition-colors text-left border-2 border-transparent hover:border-sidebar-border">
                <Avatar className="h-7 w-7 shrink-0 border border-border">
                  <AvatarImage src={user?.photoURL ?? undefined} />
                  <AvatarFallback className="text-xs font-black bg-[#FFE600] text-black">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-sidebar-foreground truncate">
                    {user?.displayName ?? 'User'}
                  </p>
                  <p className="text-[10px] text-sidebar-foreground/70 truncate font-mono">{user?.email}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-sidebar-foreground/50 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56 mb-1 border-2 border-border shadow-[4px_4px_0px_0px_hsl(var(--neo-shadow))]">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-black">{user?.displayName}</p>
                  <p className="text-[10px] text-muted-foreground truncate font-mono">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate('/app/admin')} className="font-black text-amber-600 dark:text-amber-400">
                  <Shield className="h-4 w-4" />
                  Admin Control Center
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
                <User className="h-4 w-4" />
                Profile settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleDark}>
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {darkMode ? 'Light mode' : 'Dark mode'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-sidebar-background border-r-2 border-sidebar-border flex flex-col shadow-[8px_0_0_0_#000]">
            <div className="flex items-center justify-between px-4 h-16 border-b-2 border-sidebar-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-[#FFE600] text-black border border-black flex items-center justify-center font-black text-xs">
                  ⚡
                </div>
                <span className="font-black text-sidebar-foreground text-base">Qezvo Agent</span>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => setMobileOpen(false)}
                className="text-sidebar-foreground/70"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <SidebarNav isAdmin={isAdmin} onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Nav */}
        <header className="h-16 border-b bg-background/95 backdrop-blur-sm flex items-center px-4 gap-4 shrink-0 sticky top-0 z-40">
          <Button
            size="icon-sm"
            variant="ghost"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search agents, knowledge…"
                className="w-full h-8 pl-8 pr-3 text-sm rounded-md border bg-muted/50 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                id="app-search"
              />
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" aria-label="Help" onClick={() => window.open('/documentation', '_blank')}>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Notifications" id="notifications-btn">
              <div className="relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-brand-500" />
              </div>
            </Button>
            {/* Mobile user avatar */}
            <div className="lg:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="ghost">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.photoURL ?? undefined} />
                      <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/app/settings/profile')}>
                    <User className="h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem destructive onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Global Admin Maintenance Notice */}
        {maintenance.enabled && isAdmin && (
          <div className="bg-[#FFE600] text-black border-b-2 border-black px-4 py-2 text-xs font-black flex items-center justify-between shadow-[0px_2px_0px_0px_#000] shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>MAINTENANCE MODE IS CURRENTLY ACTIVE: Public logins and registrations are blocked.</span>
            </div>
            <Link to="/app/admin" className="underline hover:opacity-80 shrink-0 ml-4 font-black">
              Admin Control Panel &rarr;
            </Link>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
