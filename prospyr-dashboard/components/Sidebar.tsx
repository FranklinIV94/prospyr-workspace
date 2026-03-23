'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  Bot, ClipboardList, Activity, Settings, LogOut, Zap
} from 'lucide-react'

const navItems = [
  { href: '/', icon: Bot, label: 'Agent Control' },
  { href: '/tasks', icon: ClipboardList, label: 'Task Manager' },
  { href: '/activity', icon: Activity, label: 'Activity Log' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className="fixed left-0 top-0 h-full w-64 sidebar flex flex-col z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/20">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-white">Prospyr</span>
              <p className="text-xs text-[var(--text-muted)]">Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1" aria-label="Main navigation">
          {navItems.map(item => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {session?.user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-white">{session?.user?.name || 'User'}</p>
              <p className="text-xs text-[var(--text-muted)] truncate">{session?.user?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left text-[var(--text-muted)] hover:text-white"
            aria-label="Sign out"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
