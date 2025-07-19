import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { SubscriptionTier } from "@prisma/client"
import { z } from "zod"

const updateSubscriptionSchema = z.object({
  tier: z.nativeEnum(SubscriptionTier),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscription: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Calculate subscription limits and usage
    const subscriptionLimits = {
      [SubscriptionTier.FREE]: {
        maxProjects: 3,
        maxGenerationsPerMonth: 10,
        features: ["basic_generation"],
      },
      [SubscriptionTier.PRO]: {
        maxProjects: 50,
        maxGenerationsPerMonth: 100,
        features: ["basic_generation", "advanced_ai", "unlimited_projects", "priority_support", "custom_templates"],
      },
      [SubscriptionTier.ENTERPRISE]: {
        maxProjects: -1, // unlimited
        maxGenerationsPerMonth: -1, // unlimited
        features: ["basic_generation", "advanced_ai", "unlimited_projects", "team_collaboration", "priority_support", "custom_templates"],
      },
    }

    const currentLimits = subscriptionLimits[user.subscription]

    return NextResponse.json({
      success: true,
      data: {
        currentTier: user.subscription,
        limits: currentLimits,
        usage: {
          projectCount: user._count.projects,
          // TODO: Add generation count for current month
          generationsThisMonth: 0,
        },
        memberSince: user.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching subscription info:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = updateSubscriptionSchema.parse(body)

    // In a real application, you would integrate with a payment processor here
    // For now, we'll just update the subscription tier directly
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { subscription: tier },
      select: {
        id: true,
        subscription: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `Subscription updated to ${tier}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid subscription tier", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating subscription:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}