import { NavLink, Outlet } from 'react-router-dom'
import { User, Shield, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/misc'

const settingsNav = [
  { to: '/app/settings/profile', icon: User, label: 'Profile' },
  { to: '/app/settings/security', icon: Shield, label: 'Security' },
  { to: '/app/settings/notifications', icon: Bell, label: 'Notifications' },
]

export default function SettingsLayout() {
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <PageHeader title="Settings" description="Manage your account preferences" className="mb-8" />
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Settings nav */}
        <nav className="w-full sm:w-48 shrink-0">
          <div className="space-y-1">
            {settingsNav.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </div>
        </nav>
        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
