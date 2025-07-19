import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { IdeaInputSchema } from "@/types/validation-clean"
import { processIdea } from "@/lib/idea-processor"
import { AIOrchestrationService } from "@/lib/ai-services/ai-orchestrator"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedInput = IdeaInputSchema.parse(body)

    // Process the idea first
    const processedIdea = await processIdea(validatedInput, userId)

    // Create a project record to track the generation
    const project = await prisma.project.create({
      data: {
        userId: userId,
        name: `Project: ${processedIdea.originalInput.substring(0, 50)}...`,
        description: processedIdea.originalInput,
        originalIdea: processedIdea.originalInput,
        status: ProjectStatus.GENERATING,
        category: processedIdea.category,
        complexity: processedIdea.complexity
      }
    })

    // Start blueprint generation in the background
    generateBlueprintAsync(processedIdea, project.id, userId)
      .catch(error => {
        console.error("Background blueprint generation failed:", error)
        // Update project status to failed
        prisma.project.update({
          where: { id: project.id },
          data: { 
            status: ProjectStatus.FAILED,
            lastModified: new Date()
          }
        }).catch(console.error)
      })

    return NextResponse.json({
      success: true,
      data: {
        processedIdea,
        project: {
          id: project.id,
          name: project.name,
          status: project.status,
          createdAt: project.createdAt
        }
      },
      message: "Idea processed successfully. Blueprint generation started."
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid input data", 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    console.error("Error processing idea:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process idea" 
      },
      { status: 500 }
    )
  }
}

/**
 * Generates blueprint asynchronously and updates the project
 */
async function generateBlueprintAsync(
  processedIdea: any, 
  projectId: string, 
  userId: string
): Promise<void> {
  const { BlueprintErrorHandler, GenerationProgressTracker } = await import("@/lib/blueprint-error-handler")
  
  try {
    // Initialize progress tracking
    GenerationProgressTracker.updateProgress(projectId, {
      status: ProjectStatus.GENERATING,
      currentStep: 'Initializing AI services...',
      progress: 5
    })

    const orchestrator = new AIOrchestrationService()
    
    // Build generation context
    const context = {
      userProfile: {
        experience: 'intermediate' as const,
        background: ['product development'],
        preferences: {}
      }
    }

    // Update progress
    GenerationProgressTracker.updateProgress(projectId, {
      currentStep: 'Analyzing your idea...',
      progress: 15
    })

    // Generate the complete blueprint with retry logic
    const blueprintResponse = await BlueprintErrorHandler.withRetry(
      async () => {
        GenerationProgressTracker.updateProgress(projectId, {
          currentStep: 'Generating comprehensive blueprint...',
          progress: 30
        })

        const response = await orchestrator.generateBlueprint({
          idea: processedIdea,
          context
        })

        GenerationProgressTracker.updateProgress(projectId, {
          currentStep: 'Finalizing blueprint...',
          progress: 90
        })

        return response
      },
      {
        maxRetries: 2,
        retryDelay: 2000,
        fallbackStrategy: 'simplified'
      }
    )

    // Update the project with the generated blueprint
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: ProjectStatus.COMPLETED,
        blueprint: blueprintResponse.blueprint as any,
        generatedAt: new Date(),
        lastModified: new Date()
      }
    })

    // Complete progress tracking
    GenerationProgressTracker.updateProgress(projectId, {
      status: ProjectStatus.COMPLETED,
      currentStep: 'Blueprint generated successfully!',
      progress: 100
    })

    console.log(`Blueprint generated successfully for project ${projectId}`)
    
    // Clear progress after a delay
    setTimeout(() => {
      GenerationProgressTracker.clearProgress(projectId)
    }, 5000)

  } catch (error) {
    console.error(`Blueprint generation failed for project ${projectId}:`, error)
    
    // Handle the error properly
    const blueprintError = BlueprintErrorHandler.handleError(error)
    
    // Log the error with context
    BlueprintErrorHandler.logError(blueprintError, {
      userId,
      projectId,
      originalError: error
    })

    // Update progress with error
    GenerationProgressTracker.updateProgress(projectId, {
      status: ProjectStatus.FAILED,
      currentStep: 'Generation failed',
      progress: 0,
      error: blueprintError
    })
    
    // Update project status to failed
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: ProjectStatus.FAILED,
        lastModified: new Date()
      }
    })
    
    throw blueprintError
  }
}