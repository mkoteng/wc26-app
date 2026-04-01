import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { upsertUser, getUserById } from '@/lib/db/queries'
import { sendNewUserNotification } from '@/lib/email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email || !user.name) return false

      // Use the Google sub (account.providerAccountId) as our user id
      const id = account.providerAccountId

      // Check before upsert so we know if this is a first-time sign-in
      const existing = await getUserById(id)

      await upsertUser({
        id,
        name: user.name,
        email: user.email,
        image: user.image ?? null,
      })

      if (!existing) {
        await sendNewUserNotification({ name: user.name, email: user.email })
      }

      return true
    },
    async jwt({ token, account }) {
      // On initial sign-in, store the Google sub in the JWT
      if (account) {
        token.userId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      // Expose userId on the session for client access
      if (token.userId) {
        session.user.id = token.userId as string
      }
      return session
    },
  },
})
