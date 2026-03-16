'use client'

import { useRouter } from 'next/navigation'
import { useLocale } from '@/components/shared/LocaleProvider'

export function LanguageToggle() {
  const locale = useLocale()
  const router = useRouter()

  const toggle = () => {
    const next = locale === 'en' ? 'no' : 'en'
    document.cookie = `lang=${next};path=/;max-age=31536000;SameSite=Lax`
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      title={locale === 'en' ? 'Switch to Norwegian' : 'Bytt til engelsk'}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
      aria-label={locale === 'en' ? 'Switch to Norwegian' : 'Switch to English'}
    >
      {locale === 'en' ? '🇳🇴' : '🇬🇧'}
    </button>
  )
}
