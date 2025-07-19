import { SubscriptionTier } from "@prisma/client"
import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      subscription: SubscriptionTier
      preferences: any
    } & DefaultSession["user"]
    accessToken?: string
  }

  interface User extends DefaultUser {
    subscription?: SubscriptionTier
    preferences?: any
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string
    subscription?: SubscriptionTier
    preferences?: any
    accessToken?: string
  }
}