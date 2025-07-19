import { NextRequest, NextResponse } from 'next/server'
import { getAIServiceManager, testAIConnections, getAIProviderStatus } from '@/lib/ai-services'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        const status = getAIProviderStatus()
        return NextResponse.json({
          success: true,
          data: {
            providers: status,
            availableProviders: Object.keys(status)
          }
        })

      case 'test':
        const connections = await testAIConnections()
        return NextResponse.json({
          success: true,
          data: {
            connections,
            allConnected: Object.values(connections).every(Boolean)
          }
        })

      case 'simple-request':
        const manager = getAIServiceManager()
        const availableProviders = manager.getAvailableProviders()
        
        if (availableProviders.length === 0) {
          return NextResponse.json({
            success: false,
            error: 'No AI providers available'
          }, { status: 503 })
        }

        const response = await manager.makeRequest({
          provider: availableProviders[0],
          model: availableProviders[0] === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307',
          prompt: 'Say hello and confirm you are working correctly. Keep it brief.',
          temperature: 0.7,
          maxTokens: 100
        })

        return NextResponse.json({
          success: response.success,
          data: response.success ? {
            response: response.data,
            provider: response.metadata.provider,
            model: response.metadata.model,
            latency: response.metadata.latency,
            cost: response.usage.cost,
            tokens: response.usage.totalTokens
          } : null,
          error: response.error
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Use: status, test, or simple-request'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('AI Service Test Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, provider, model, systemPrompt, temperature, maxTokens } = body

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'Prompt is required'
      }, { status: 400 })
    }

    const manager = getAIServiceManager()
    const availableProviders = manager.getAvailableProviders()
    
    if (availableProviders.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No AI providers available'
      }, { status: 503 })
    }

    const selectedProvider = provider || availableProviders[0]
    const selectedModel = model || (selectedProvider === 'openai' ? 'gpt-3.5-turbo' : 'claude-3-haiku-20240307')

    const response = await manager.makeRequest({
      provider: selectedProvider,
      model: selectedModel,
      prompt,
      systemPrompt,
      temperature: temperature ?? 0.7,
      maxTokens: maxTokens ?? 1000
    })

    return NextResponse.json({
      success: response.success,
      data: response.success ? {
        response: response.data,
        provider: response.metadata.provider,
        model: response.metadata.model,
        latency: response.metadata.latency,
        cost: response.usage.cost,
        tokens: response.usage.totalTokens,
        requestId: response.metadata.requestId
      } : null,
      error: response.error
    })
  } catch (error) {
    console.error('AI Service Request Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}