import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Nav } from '@/components/shared/nav'
import { Footer } from '@/components/shared/footer'
import { LocaleProvider } from '@/components/shared/LocaleProvider'
import { getLocale } from '@/lib/locale'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    template: '%s | WC26',
    default: 'WC26 — FIFA World Cup 2026',
  },
  description:
    'Match schedule, live scores, group standings, and team profiles for the FIFA World Cup 2026 — USA, Canada & Mexico.',
  keywords: ['FIFA World Cup 2026', 'WC26', 'World Cup schedule', 'football', 'soccer'],
  openGraph: {
    title: 'WC26 — FIFA World Cup 2026',
    description: 'Match schedule, live scores, group standings, and team profiles.',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()

  return (
    <html lang={locale === 'no' ? 'nb' : 'en'} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <LocaleProvider locale={locale}>
            <div className="flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer locale={locale} />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
