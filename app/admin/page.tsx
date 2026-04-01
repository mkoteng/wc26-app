import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { getAdminStats } from '@/lib/db/queries'
import { Trophy, Users, Hash } from 'lucide-react'

export const metadata = { title: 'Admin — WC26' }

export default async function AdminPage() {
  await requireAdmin()
  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Oversikt over WC26-appen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users} label="Brukere" value={stats.users} />
        <StatCard icon={Trophy} label="Ligaer" value={stats.leagues} />
        <StatCard icon={Hash} label="Tips" value={stats.predictions} />
      </div>

      {/* Nav cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard
          href="/admin/ligaer"
          title="Ligaer"
          description="Se og administrer alle ligaer, fjern spillere, overstyr tips."
        />
        <SectionCard
          href="/admin/brukere"
          title="Brukere"
          description="Søk opp brukere og se alle deres tips på tvers av ligaer."
        />
        <SectionCard
          href="/admin/logg"
          title="Endringslogg"
          description="Full historikk over alle adminendringer."
        />
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-extrabold text-zinc-900 dark:text-white">
        {value.toLocaleString('nb-NO')}
      </p>
    </div>
  )
}

function SectionCard({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/60"
    >
      <h2 className="font-bold text-zinc-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
    </Link>
  )
}
