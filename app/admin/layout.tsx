import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { LayoutDashboard, Users, Trophy, ScrollText } from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Oversikt', icon: LayoutDashboard, exact: true },
  { href: '/admin/ligaer', label: 'Ligaer', icon: Trophy },
  { href: '/admin/brukere', label: 'Brukere', icon: Users },
  { href: '/admin/logg', label: 'Endringslogg', icon: ScrollText },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8 sm:px-6">
      {/* Sidebar */}
      <aside className="hidden w-48 shrink-0 sm:block">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Admin
        </p>
        <nav className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}

// Server component can't use pathname hook — render as plain links
// Active state is handled client-side via a wrapper
function AdminNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}
