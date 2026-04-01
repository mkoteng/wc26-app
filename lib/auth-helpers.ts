import { auth } from '@/auth'

/** Get the current user's id from the session, or null if not signed in */
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}

/** Get the current user's id, or throw (for protected API routes) */
export async function requireSessionUserId(): Promise<string> {
  const userId = await getSessionUserId()
  if (!userId) throw new Error('Not authenticated')
  return userId
}
