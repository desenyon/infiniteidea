import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@/types"
import { SubscriptionTier } from "@prisma/client"

/**
 * Get or create a development user for testing purposes
 */
async function getOrCreateDevUser(): Promise<string> {
  const devEmail = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || "dev@example.com"
  const devName = process.env.NEXT_PUBLIC_DEV_USER_NAME || "Development User"
  
  let user = await prisma.user.findUnique({
    where: { email: devEmail }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: devEmail,
        name: devName,
        subscription: SubscriptionTier.FREE,
        preferences: {
          theme: "dark",
          notifications: true,
          autoSave: true,
          defaultExportFormat: "pdf",
        },
      }
    })
  }
  
  return user.id
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Development authentication bypass
    let userId: string
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true" && process.env.NODE_ENV === "development") {
      // Use development user ID or create one
      userId = await getOrCreateDevUser()
    } else if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    } else {
      userId = session.user.id
    }

    const { id: projectId } = await params

    // Fetch the project with blueprint
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        description: project.description,
        originalIdea: project.originalIdea,
        status: project.status,
        category: project.category,
        complexity: project.complexity,
        blueprint: project.blueprint,
        generatedAt: project.generatedAt,
        createdAt: project.createdAt,
        lastModified: project.lastModified
      }
    })
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch project" 
      },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Development authentication bypass
    let userId: string
    if (process.env.NEXT_PUBLIC_ENABLE_DEV_AUTH === "true" && process.env.NODE_ENV === "development") {
      // Use development user ID or create one
      userId = await getOrCreateDevUser()
    } else if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    } else {
      userId = session.user.id
    }

    const { id: projectId } = await params
    const body = await request.json()

    // Validate that the project belongs to the user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Update allowed fields
    const updateData: any = {
      lastModified: new Date()
    }

    if (body.name) updateData.name = body.name
    if (body.description) updateData.description = body.description

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedProject.id,
        name: updatedProject.name,
        description: updatedProject.description,
        status: updatedProject.status,
        lastModified: updatedProject.lastModified
      },
      message: "Project updated successfully"
    })
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update project" 
      },
      { status: 500 }
    )
  }
}