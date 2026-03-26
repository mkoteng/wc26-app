'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { LanguageToggle } from '@/components/shared/LanguageToggle'
import { useT } from '@/components/shared/LocaleProvider'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

export function Nav() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const t = useT()

  const links = [
    { href: '/', label: t.nav.matches },
    { href: '/fixtures', label: t.nav.fixtures },
    { href: '/groups', label: t.nav.tournament },
    { href: '/venues', label: t.nav.venues },
    { href: '/teams', label: t.nav.teams },
  ]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-300',
        scrolled
          ? 'border-zinc-200/80 bg-white/90 dark:border-zinc-800/80 dark:bg-zinc-950/90'
          : 'border-zinc-200/40 bg-white/60 dark:border-zinc-800/40 dark:bg-zinc-950/60',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center font-extrabold text-lg tracking-tighter transition-opacity hover:opacity-80"
        >
          <span className="text-zinc-900 dark:text-white">WC</span>
          <span className="text-gold">26</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden items-center gap-0.5 sm:flex">
          {links.map((link) => {
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={[
                  'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white',
                ].join(' ')}
              >
                {link.label}
                {active && (
                  <span className="absolute bottom-0.5 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-gold" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white sm:hidden"
                  aria-label="Open menu"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-64 border-l border-zinc-200 bg-white p-0 dark:border-zinc-800 dark:bg-zinc-950">
              <SheetHeader className="border-b border-zinc-100 px-5 py-4 dark:border-zinc-800">
                <SheetTitle className="flex items-center font-extrabold text-lg tracking-tighter">
                  <span className="text-zinc-900 dark:text-white">WC</span>
                  <span className="text-gold">26</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {links.map((link) => {
                  const active = isActive(link.href)
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={[
                        'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                        active
                          ? 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-gold'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
                      ].join(' ')}
                    >
                      {active && (
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      )}
                      {!active && <span className="h-1.5 w-1.5" />}
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
