import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@/types"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const body = await request.json()
    const { name } = body

    // Fetch the original project
    const originalProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!originalProject) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    // Create duplicate project
    const duplicatedProject = await prisma.project.create({
      data: {
        userId: session.user.id,
        name: name || `${originalProject.name} (Copy)`,
        description: originalProject.description,
        originalIdea: originalProject.originalIdea,
        category: originalProject.category,
        complexity: originalProject.complexity,
        blueprint: originalProject.blueprint,
        status: ProjectStatus.COMPLETED, // Keep as completed if original was completed
        generatedAt: originalProject.generatedAt
      }
    })

    return NextResponse.json({
      success: true,
      data: duplicatedProject,
      message: "Project duplicated successfully"
    })
  } catch (error) {
    console.error("Error duplicating project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to duplicate project" 
      },
      { status: 500 }
    )
  }
}