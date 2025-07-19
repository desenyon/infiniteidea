import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GenerationProgressTracker } from "@/lib/blueprint-error-handler"
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

    // Verify the project belongs to the user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: userId
      },
      select: {
        id: true,
        status: true,
        name: true
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Get progress from tracker
    const progress = GenerationProgressTracker.getProgress(projectId)

    return NextResponse.json({
      success: true,
      data: {
        projectId: project.id,
        projectName: project.name,
        projectStatus: project.status,
        progress: progress || {
          projectId,
          status: project.status,
          currentStep: project.status === 'COMPLETED' ? 'Blueprint ready!' : 
                      project.status === 'FAILED' ? 'Generation failed' : 
                      'Processing...',
          progress: project.status === 'COMPLETED' ? 100 : 
                   project.status === 'FAILED' ? 0 : 50
        }
      }
    })
  } catch (error) {
    console.error("Error fetching project progress:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch progress" 
      },
      { status: 500 }
    )
  }
}