import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const shareToken = params.token
    const body = await request.json()
    const { password } = body

    if (!shareToken) {
      return NextResponse.json(
        { error: "Share token is required" },
        { status: 400 }
      )
    }

    // Find the share record
    const shareRecord = await prisma.analytics.findFirst({
      where: {
        eventType: 'project_shared',
        eventData: {
          path: ['shareToken'],
          equals: shareToken
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!shareRecord) {
      return NextResponse.json(
        { error: "Invalid or expired share link" },
        { status: 404 }
      )
    }

    const shareData = shareRecord.eventData as any

    // Check if link has been revoked
    const revokedRecord = await prisma.analytics.findFirst({
      where: {
        eventType: 'share_revoked',
        eventData: {
          path: ['shareToken'],
          equals: shareToken
        }
      }
    })

    if (revokedRecord) {
      return NextResponse.json(
        { error: "This share link has been revoked" },
        { status: 403 }
      )
    }

    // Check expiration
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired" },
        { status: 403 }
      )
    }

    // Check password if required
    if (shareData.password && shareData.password !== password) {
      return NextResponse.json(
        { error: "Password required" },
        { status: 401 }
      )
    }

    // Fetch the project
    const project = await prisma.project.findUnique({
      where: {
        id: shareRecord.projectId!
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Filter blueprint sections based on allowed sections
    let filteredBlueprint = project.blueprint
    if (shareData.allowedSections && !shareData.allowedSections.includes('all')) {
      filteredBlueprint = filterBlueprintSections(project.blueprint, shareData.allowedSections)
    }

    // Log access
    await prisma.analytics.create({
      data: {
        projectId: project.id,
        eventType: 'shared_project_accessed',
        eventData: { 
          shareToken,
          accessedAt: new Date(),
          userAgent: request.headers.get('user-agent')
        },
        success: true
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        project: {
          ...project,
          blueprint: filteredBlueprint
        },
        permissions: shareData.permissions,
        allowedSections: shareData.allowedSections,
        requiresPassword: !!shareData.password
      }
    })

  } catch (error) {
    console.error("Error accessing shared project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to access shared project" 
      },
      { status: 500 }
    )
  }
}

function filterBlueprintSections(blueprint: any, allowedSections: string[]): any {
  if (!blueprint) return blueprint

  const filtered: any = {}

  if (allowedSections.includes('productPlan') && blueprint.productPlan) {
    filtered.productPlan = blueprint.productPlan
  }

  if (allowedSections.includes('techStack') && blueprint.techStack) {
    filtered.techStack = blueprint.techStack
  }

  if (allowedSections.includes('aiWorkflow') && blueprint.aiWorkflow) {
    filtered.aiWorkflow = blueprint.aiWorkflow
  }

  if (allowedSections.includes('roadmap') && blueprint.roadmap) {
    filtered.roadmap = blueprint.roadmap
  }

  if (allowedSections.includes('financialModel') && blueprint.financialModel) {
    filtered.financialModel = blueprint.financialModel
  }

  return filtered
}