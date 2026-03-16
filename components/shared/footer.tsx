import { dict } from '@/lib/i18n'
import type { Locale } from '@/lib/locale'

export function Footer({ locale }: { locale: Locale }) {
  const t = dict[locale].footer
  return (
    <footer className="border-t border-border mt-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.dates}
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {t.data}
          </p>
        </div>
      </div>
    </footer>
  )
}
