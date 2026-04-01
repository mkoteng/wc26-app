'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import Image from 'next/image'
import { LogIn, LogOut } from 'lucide-react'
import { useT } from '@/components/shared/LocaleProvider'

export function AuthButton() {
  const { data: session, status } = useSession()
  const t = useT()

  if (status === 'loading') {
    return (
      <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
    )
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        {session.user.image && (
          <Image
            src={session.user.image}
            alt={session.user.name ?? ''}
            width={28}
            height={28}
            className="rounded-full"
          />
        )}
        <span className="hidden text-sm font-medium text-zinc-700 dark:text-zinc-300 sm:inline">
          {session.user.name?.split(' ')[0]}
        </span>
        <button
          onClick={() => signOut({ redirectTo: '/' })}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label={t.liga.signOut}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">{t.liga.signIn}</span>
    </button>
  )
}
