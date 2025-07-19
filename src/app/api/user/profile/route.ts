import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).optional(),
    notifications: z.boolean().optional(),
    autoSave: z.boolean().optional(),
    defaultExportFormat: z.enum(["pdf", "markdown", "json"]).optional(),
    aiProvider: z.enum(["openai", "anthropic", "auto"]).optional(),
    generationSpeed: z.enum(["fast", "balanced", "thorough"]).optional(),
  }).optional(),
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
        id: true,
        name: true,
        email: true,
        image: true,
        subscription: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
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

    return NextResponse.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
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
    const validatedData = updateProfileSchema.parse(body)

    const updateData: any = {}
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name
    }
    
    if (validatedData.preferences) {
      // Get current preferences and merge with new ones
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { preferences: true },
      })
      
      const currentPreferences = (currentUser?.preferences as any) || {}
      updateData.preferences = {
        ...currentPreferences,
        ...validatedData.preferences,
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        subscription: true,
        preferences: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}