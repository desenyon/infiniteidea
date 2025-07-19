import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ToolIntegrationService } from '@/lib/external-tools/tool-integration-service'
import { LaunchRequest } from '@/types/external-tools'

const toolService = new ToolIntegrationService()

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const launchRequest: LaunchRequest = {
      toolId: body.toolId,
      projectId: body.projectId,
      blueprint: body.blueprint,
      prompts: body.prompts,
      options: body.options,
      customContext: body.customContext
    }

    // Validate required fields
    if (!launchRequest.toolId || !launchRequest.projectId || !launchRequest.blueprint) {
      return NextResponse.json(
        { error: 'Missing required fields: toolId, projectId, and blueprint are required' },
        { status: 400 }
      )
    }

    const response = await toolService.launchTool(launchRequest)

    if (!response.success) {
      return NextResponse.json(
        { error: response.error },
        { status: 400 }
      )
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Tool launch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const tools = toolService.getConfiguredTools()
    const toolsWithStatus = await Promise.all(
      tools.map(async (tool) => ({
        ...tool,
        status: await toolService.getToolStatus(tool.id)
      }))
    )

    return NextResponse.json({ tools: toolsWithStatus })
  } catch (error) {
    console.error('Get tools error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}