// Stub for future auth integration (e.g. NextAuth or Clerk).
// Replace the implementations below once an auth provider is chosen.

export type AuthUser = {
  id: string
  displayName: string
  email: string
  avatarUrl?: string
}

/** Returns null for now — will be replaced with real auth later. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  return null
}

/** Throws until auth is implemented. */
export async function requireUser(): Promise<AuthUser> {
  throw new Error('Auth not implemented yet')
}
