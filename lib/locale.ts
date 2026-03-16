import { cookies } from 'next/headers'

export type Locale = 'en' | 'no'

export async function getLocale(): Promise<Locale> {
  const jar = await cookies()
  const lang = jar.get('lang')?.value
  return lang === 'no' ? 'no' : 'en'
}

/** Maps locale to a BCP-47 date-format tag */
export function dateLocale(locale: Locale): string {
  return locale === 'no' ? 'nb-NO' : 'en-US'
}
