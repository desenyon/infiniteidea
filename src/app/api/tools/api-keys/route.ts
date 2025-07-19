import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ToolIntegrationService } from '@/lib/external-tools/tool-integration-service'
import { ApiKeyConfig } from '@/types/external-tools'

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
    const { toolId, name, description, keyType, value, scopes, expiresAt } = body

    if (!toolId || !name || !keyType || !value) {
      return NextResponse.json(
        { error: 'Missing required fields: toolId, name, keyType, and value are required' },
        { status: 400 }
      )
    }

    const keyConfig: Omit<ApiKeyConfig, 'id'> = {
      name,
      description: description || '',
      keyType,
      isRequired: false,
      isEncrypted: false,
      value,
      scopes: scopes || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      metadata: {
        createdBy: session.user.id,
        createdAt: new Date()
      }
    }

    const apiKey = await toolService.addApiKey(toolId, keyConfig)

    // Don't return the actual key value in the response
    const safeApiKey = {
      ...apiKey,
      value: undefined
    }

    return NextResponse.json({ apiKey: safeApiKey })
  } catch (error) {
    console.error('Add API key error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
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

    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')

    if (!toolId) {
      return NextResponse.json(
        { error: 'toolId parameter is required' },
        { status: 400 }
      )
    }

    const tools = toolService.getConfiguredTools()
    const tool = tools.find(t => t.id === toolId)

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    // Return API keys without the actual values
    const safeApiKeys = (tool.apiKeys || []).map(key => ({
      ...key,
      value: undefined,
      hasValue: !!key.value
    }))

    return NextResponse.json({ apiKeys: safeApiKeys })
  } catch (error) {
    console.error('Get API keys error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const keyId = searchParams.get('keyId')

    if (!toolId || !keyId) {
      return NextResponse.json(
        { error: 'toolId and keyId parameters are required' },
        { status: 400 }
      )
    }

    const tools = toolService.getConfiguredTools()
    const tool = tools.find(t => t.id === toolId)

    if (!tool) {
      return NextResponse.json(
        { error: 'Tool not found' },
        { status: 404 }
      )
    }

    if (!tool.apiKeys) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    const keyIndex = tool.apiKeys.findIndex(key => key.id === keyId)
    if (keyIndex === -1) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      )
    }

    // Remove the API key
    tool.apiKeys.splice(keyIndex, 1)
    tool.updatedAt = new Date()

    await toolService.updateToolConfiguration(toolId, { apiKeys: tool.apiKeys })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete API key error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}