import { auth } from '@/auth'
import { notFound } from 'next/navigation'

const ADMIN_EMAIL = 'mkoteng@gmail.com'

export async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return session?.user?.email === ADMIN_EMAIL
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) notFound()
}
