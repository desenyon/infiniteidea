import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { randomBytes } from 'crypto'

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
    const { 
      permissions = 'view', 
      expiresAt, 
      password,
      allowedSections = ['all']
    } = body

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

    // Generate a unique share token
    const shareToken = randomBytes(32).toString('hex')
    
    // Create share record in analytics table (we'll use eventData to store share info)
    const shareData = {
      shareToken,
      permissions,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      password: password || null,
      allowedSections,
      createdBy: session.user.id,
      createdAt: new Date()
    }

    await prisma.analytics.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        eventType: 'project_shared',
        eventData: shareData,
        success: true
      }
    })

    // Generate shareable URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const shareUrl = `${baseUrl}/share/${shareToken}`

    return NextResponse.json({
      success: true,
      data: {
        shareUrl,
        shareToken,
        permissions,
        expiresAt,
        allowedSections
      },
      message: "Shareable link created successfully"
    })

  } catch (error) {
    console.error("Error creating share link:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create share link" 
      },
      { status: 500 }
    )
  }
}

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

    // Get existing share links
    const shareLinks = await prisma.analytics.findMany({
      where: {
        projectId: projectId,
        userId: session.user.id,
        eventType: 'project_shared'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to last 10 share links
    })

    const activeLinks = shareLinks
      .map(link => link.eventData as any)
      .filter(data => {
        // Filter out expired links
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          return false
        }
        return true
      })

    return NextResponse.json({
      success: true,
      data: activeLinks
    })

  } catch (error) {
    console.error("Error fetching share links:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch share links" 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const projectId = params.id
    const { searchParams } = new URL(request.url)
    const shareToken = searchParams.get('token')

    if (!shareToken) {
      return NextResponse.json(
        { error: "Share token is required" },
        { status: 400 }
      )
    }

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

    // Mark share link as revoked by creating a revocation event
    await prisma.analytics.create({
      data: {
        userId: session.user.id,
        projectId: projectId,
        eventType: 'share_revoked',
        eventData: { shareToken, revokedAt: new Date() },
        success: true
      }
    })

    return NextResponse.json({
      success: true,
      message: "Share link revoked successfully"
    })

  } catch (error) {
    console.error("Error revoking share link:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to revoke share link" 
      },
      { status: 500 }
    )
  }
}