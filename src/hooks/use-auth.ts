"use client"

import { useSession } from "next-auth/react"
import { SubscriptionTier } from "@prisma/client"

export function useAuth() {
  const { data: session, status } = useSession()

  const isLoading = status === "loading"
  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const hasSubscription = (tier: SubscriptionTier) => {
    if (!user?.subscription) return false
    
    const tierHierarchy = {
      [SubscriptionTier.FREE]: 0,
      [SubscriptionTier.PRO]: 1,
      [SubscriptionTier.ENTERPRISE]: 2,
    }
    
    return tierHierarchy[user.subscription] >= tierHierarchy[tier]
  }

  const canAccessFeature = (feature: string) => {
    if (!isAuthenticated) return false
    
    // Define feature access based on subscription tiers
    const featureAccess = {
      basic_generation: [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
      advanced_ai: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
      unlimited_projects: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
      team_collaboration: [SubscriptionTier.ENTERPRISE],
      priority_support: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
      custom_templates: [SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE],
    }
    
    const allowedTiers = featureAccess[feature as keyof typeof featureAccess]
    return allowedTiers?.includes(user?.subscription || SubscriptionTier.FREE) || false
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    hasSubscription,
    canAccessFeature,
    session,
  }
}