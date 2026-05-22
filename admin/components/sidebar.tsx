'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/cn'
import {
  Film,
  Users,
  BookOpen,
  Newspaper,
  LayoutDashboard,
  UserCog,
  LogOut,
} from 'lucide-react'

const NAV = [
  { href: '/dramas',  label: 'Dramalar',      icon: Film },
  { href: '/cast',    label: 'Cast',           icon: Users },
  { href: '/quiz',    label: 'Quiz Paketleri', icon: BookOpen },
  { href: '/news',    label: 'Haberler',       icon: Newspaper },
  { href: '/users',   label: 'Kullanıcılar',   icon: UserCog },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen border-r border-zinc-200 bg-white">
      <div className="px-5 py-5 border-b border-zinc-100">
        <span className="font-bold text-lg tracking-tight text-zinc-900">Quizdram</span>
        <span className="ml-2 text-xs text-zinc-400 font-medium">admin</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-zinc-900 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-100">
        <div className="px-3 py-2 text-xs text-zinc-400 truncate">{user?.email}</div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
        >
          <LogOut size={16} />
          Çıkış yap
        </button>
      </div>
    </aside>
  )
}
