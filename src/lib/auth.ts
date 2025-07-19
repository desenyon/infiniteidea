import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { SubscriptionTier } from "@prisma/client"

const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  }),
  GitHubProvider({
    clientId: process.env.GITHUB_CLIENT_ID || "",
    clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  }),
].filter(Boolean)

// TODO: Re-enable EmailProvider once nodemailer bundling issue is resolved
// For now, we'll use OAuth providers only to avoid the nodemailer import issue

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token and user data to the token right after signin
      if (account && user) {
        token.accessToken = account.access_token
        token.userId = user.id
        
        // Fetch user subscription and preferences from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            subscription: true,
            preferences: true,
          },
        })
        
        if (dbUser) {
          token.subscription = dbUser.subscription
          token.preferences = dbUser.preferences
        }
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.user.id = token.userId as string
        session.user.subscription = token.subscription as SubscriptionTier
        session.user.preferences = token.preferences as any
        session.accessToken = token.accessToken as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  events: {
    async createUser({ user }) {
      // Set default subscription tier for new users
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscription: SubscriptionTier.FREE,
          preferences: {
            theme: "dark",
            notifications: true,
            autoSave: true,
            defaultExportFormat: "pdf",
          },
        },
      })
    },
  },
}