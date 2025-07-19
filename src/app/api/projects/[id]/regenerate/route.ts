import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AIOrchestrationService } from "@/lib/ai-services/ai-orchestrator"
import { z } from "zod"
import { BlueprintSection } from "@/types/ai-services"

const RegenerateRequestSchema = z.object({
  section: z.enum(['productPlan', 'techStack', 'aiWorkflow', 'roadmap', 'financialModel']),
  feedback: z.string().optional()
})

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
    const { section, feedback } = RegenerateRequestSchema.parse(body)

    // Fetch the project with blueprint
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" }, 
        { status: 404 }
      )
    }

    if (!project.blueprint) {
      return NextResponse.json(
        { error: "Project has no blueprint to regenerate" }, 
        { status: 400 }
      )
    }

    const orchestrator = new AIOrchestrationService()
    
    // Regenerate the specific section
    const regeneratedResponse = await orchestrator.regenerateSection(
      project.blueprint as any,
      section as BlueprintSection,
      feedback
    )

    if (!regeneratedResponse.success) {
      return NextResponse.json(
        { 
          success: false,
          error: regeneratedResponse.error?.message || "Failed to regenerate section" 
        },
        { status: 500 }
      )
    }

    // Update the blueprint with the regenerated section
    const updatedBlueprint = {
      ...project.blueprint as any,
      [section]: regeneratedResponse.data,
      generatedAt: new Date()
    }

    // Save the updated blueprint
    await prisma.project.update({
      where: { id: projectId },
      data: {
        blueprint: updatedBlueprint,
        lastModified: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        section,
        regeneratedData: regeneratedResponse.data,
        usage: regeneratedResponse.usage
      },
      message: `${section} regenerated successfully`
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid request data", 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error("Error regenerating blueprint section:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to regenerate section" 
      },
      { status: 500 }
    )
  }
}