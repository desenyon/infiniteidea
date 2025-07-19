import { NextRequest, NextResponse } from 'next/server'
import { AIOrchestrationService } from '@/lib/ai-services/ai-orchestrator'
import { ProcessedIdea, BlueprintGenerationRequest } from '@/types/ai-services'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idea, preferences } = body

    if (!idea || !idea.originalInput) {
      return NextResponse.json({
        success: false,
        error: 'Idea with originalInput is required'
      }, { status: 400 })
    }

    // Create a processed idea from the input
    const processedIdea: ProcessedIdea = {
      id: `idea_${Date.now()}`,
      originalInput: idea.originalInput,
      extractedFeatures: idea.extractedFeatures || [],
      category: idea.category || 'general',
      complexity: idea.complexity || 'moderate',
      timestamp: new Date()
    }

    // Create the generation request
    const generationRequest: BlueprintGenerationRequest = {
      idea: processedIdea,
      preferences: preferences || {
        aiProvider: 'auto',
        complexity: 'detailed',
        focus: ['product', 'technical', 'financial'],
        industry: 'technology',
        budget: 100000,
        timeline: '6 months',
        teamSize: 3
      }
    }

    const orchestrator = new AIOrchestrationService()
    const response = await orchestrator.generateBlueprint(generationRequest)

    return NextResponse.json({
      success: true,
      data: {
        blueprint: response.blueprint,
        confidence: response.confidence,
        warnings: response.warnings,
        recommendations: response.recommendations,
        metadata: response.generationMetadata
      }
    })
  } catch (error) {
    console.error('Blueprint Generation Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { blueprint, section, feedback } = body

    if (!blueprint || !section) {
      return NextResponse.json({
        success: false,
        error: 'Blueprint and section are required'
      }, { status: 400 })
    }

    const orchestrator = new AIOrchestrationService()
    const response = await orchestrator.regenerateSection(blueprint, section, feedback)

    return NextResponse.json({
      success: response.success,
      data: response.success ? {
        regeneratedSection: response.data,
        provider: response.metadata?.provider,
        model: response.metadata?.model,
        latency: response.metadata?.latency,
        cost: response.usage?.cost,
        tokens: response.usage?.totalTokens
      } : null,
      error: response.error
    })
  } catch (error) {
    console.error('Section Regeneration Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { blueprint, criteria } = body

    if (!blueprint || !criteria) {
      return NextResponse.json({
        success: false,
        error: 'Blueprint and optimization criteria are required'
      }, { status: 400 })
    }

    const orchestrator = new AIOrchestrationService()
    const response = await orchestrator.optimizeBlueprint(blueprint, criteria)

    return NextResponse.json({
      success: response.success,
      data: response.success ? {
        optimizedBlueprint: response.data,
        provider: response.metadata?.provider,
        model: response.metadata?.model,
        latency: response.metadata?.latency,
        cost: response.usage?.cost,
        tokens: response.usage?.totalTokens
      } : null,
      error: response.error
    })
  } catch (error) {
    console.error('Blueprint Optimization Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'validate') {
      const blueprintParam = searchParams.get('blueprint')
      if (!blueprintParam) {
        return NextResponse.json({
          success: false,
          error: 'Blueprint parameter is required for validation'
        }, { status: 400 })
      }

      try {
        const blueprint = JSON.parse(decodeURIComponent(blueprintParam))
        const orchestrator = new AIOrchestrationService()
        const validation = await orchestrator.validateBlueprint(blueprint)

        return NextResponse.json({
          success: true,
          data: validation
        })
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: 'Invalid blueprint JSON format'
        }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use: validate'
    }, { status: 400 })
  } catch (error) {
    console.error('Blueprint Validation Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}