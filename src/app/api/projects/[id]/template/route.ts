import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const { name, description, category } = body

    if (!name || !category) {
      return NextResponse.json(
        { error: "Name and category are required" },
        { status: 400 }
      )
    }

    // Fetch the project
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
        { error: "Project must have a completed blueprint to create template" },
        { status: 400 }
      )
    }

    // Create template from project blueprint
    const template = await prisma.template.create({
      data: {
        name,
        description,
        category,
        templateData: project.blueprint
      }
    })

    return NextResponse.json({
      success: true,
      data: template,
      message: "Template created successfully"
    })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to create template" 
      },
      { status: 500 }
    )
  }
}