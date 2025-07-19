import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus } from "@/types"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') as ProjectStatus | null
    const category = searchParams.get('category') || ''
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: session.user.id
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { originalIdea: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (category) {
      where.category = { contains: category, mode: 'insensitive' }
    }

    // Get total count for pagination
    const total = await prisma.project.count({ where })

    // Fetch projects with pagination and sorting
    const projects = await prisma.project.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder
      },
      select: {
        id: true,
        name: true,
        description: true,
        originalIdea: true,
        status: true,
        category: true,
        complexity: true,
        generatedAt: true,
        createdAt: true,
        updatedAt: true,
        lastModified: true,
        blueprint: false // Don't include full blueprint in listing
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch projects" 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, originalIdea, category } = body

    if (!name || !originalIdea) {
      return NextResponse.json(
        { error: "Name and original idea are required" },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        description,
        originalIdea,
        category,
        status: ProjectStatus.DRAFT
      }
    })

    return NextResponse.json({
      success: true,
      data: project,
      message: "Project created successfully"
    })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create project" 
      },
      { status: 500 }
    )
  }
}