import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (
          credentials?.email === 'Franklin@simplifyingbusinesses.com' &&
          credentials?.password === 'Jordan2026!'
        ) {
          return { id: '1', name: 'Franklin Bryant', email: credentials.email }
        }
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'prospyr-dashboard-secret-key-change-in-prod'
}
