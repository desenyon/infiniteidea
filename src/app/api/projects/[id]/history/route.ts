import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// For now, we'll track history through the analytics table
// In a more robust implementation, we'd have a dedicated project_versions table
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id

    // Verify project ownership
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

    // Get project history from analytics
    const history = await prisma.analytics.findMany({
      where: {
        projectId: projectId,
        userId: session.user.id,
        eventType: {
          in: [
            'project_created',
            'project_updated', 
            'blueprint_generated',
            'blueprint_regenerated',
            'project_exported',
            'project_shared'
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to last 50 events
    })

    return NextResponse.json({
      success: true,
      data: history
    })
  } catch (error) {
    console.error("Error fetching project history:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch project history" 
      },
      { status: 500 }
    )
  }
}

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
    const { eventType, eventData } = body

    // Verify project ownership
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

    // Create history entry
    const historyEntry = await prisma.analytics.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        eventType: eventType,
        eventData: eventData,
        success: true
      }
    })

    return NextResponse.json({
      success: true,
      data: historyEntry,
      message: "History entry created"
    })
  } catch (error) {
    console.error("Error creating history entry:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create history entry" 
      },
      { status: 500 }
    )
  }
}