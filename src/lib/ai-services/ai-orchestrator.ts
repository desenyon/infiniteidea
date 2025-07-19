import { getAIServiceManager } from './index'
import { buildPrompt, validatePromptVariables } from './prompt-templates'
import { selectOptimalModel } from './config'
import {
  AIOrchestrator,
  BlueprintGenerationRequest,
  BlueprintGenerationResponse,
  AIResponse,
  BlueprintSection,
  OptimizationCriteria,
  ValidationResult,
  ProcessedIdea,
  ProductPlan,
  TechStack,
  AIWorkflow,
  Roadmap,
  FinancialModel,
  Blueprint
} from '@/types/ai-services'

export class AIOrchestrationService implements AIOrchestrator {
  private aiManager = getAIServiceManager()

  async generateBlueprint(request: BlueprintGenerationRequest): Promise<BlueprintGenerationResponse> {
    const startTime = Date.now()
    const generationSteps: string[] = []
    let totalCost = 0
    let aiCallsUsed = 0

    try {
      // Step 1: Generate Product Plan
      generationSteps.push('Generating product plan')
      const productPlanResponse = await this.generateProductPlan(request.idea, request.context)
      if (!productPlanResponse.success) {
        throw new Error(`Product plan generation failed: ${productPlanResponse.error?.message}`)
      }
      totalCost += productPlanResponse.usage.cost
      aiCallsUsed++

      // Step 2: Generate Tech Stack (parallel with workflow generation)
      generationSteps.push('Generating tech stack')
      const techStackPromise = this.generateTechStack(productPlanResponse.data!, request.context)
      
      // Step 3: Generate AI Workflow (parallel with tech stack)
      generationSteps.push('Generating AI workflow')
      const workflowPromise = this.generateAIWorkflow(productPlanResponse.data!, request.context)

      const [techStackResponse, workflowResponse] = await Promise.all([
        techStackPromise,
        workflowPromise
      ])

      if (!techStackResponse.success) {
        throw new Error(`Tech stack generation failed: ${techStackResponse.error?.message}`)
      }
      if (!workflowResponse.success) {
        throw new Error(`AI workflow generation failed: ${workflowResponse.error?.message}`)
      }

      totalCost += techStackResponse.usage.cost + workflowResponse.usage.cost
      aiCallsUsed += 2

      // Step 4: Generate Roadmap (depends on product plan and tech stack)
      generationSteps.push('Generating development roadmap')
      const roadmapResponse = await this.generateRoadmap(
        productPlanResponse.data!,
        techStackResponse.data!,
        request.context
      )
      if (!roadmapResponse.success) {
        throw new Error(`Roadmap generation failed: ${roadmapResponse.error?.message}`)
      }
      totalCost += roadmapResponse.usage.cost
      aiCallsUsed++

      // Step 5: Generate Financial Model (parallel with roadmap)
      generationSteps.push('Generating financial model')
      const financialModelResponse = await this.generateFinancialModel(
        productPlanResponse.data!,
        techStackResponse.data!,
        request.context
      )
      if (!financialModelResponse.success) {
        throw new Error(`Financial model generation failed: ${financialModelResponse.error?.message}`)
      }
      totalCost += financialModelResponse.usage.cost
      aiCallsUsed++

      // Assemble the complete blueprint
      const blueprint: Blueprint = {
        id: `blueprint_${Date.now()}`,
        productPlan: productPlanResponse.data!,
        techStack: techStackResponse.data!,
        aiWorkflow: workflowResponse.data!,
        roadmap: roadmapResponse.data!,
        financialModel: financialModelResponse.data!,
        generatedAt: new Date()
      }

      // Validate the complete blueprint
      const validation = await this.validateBlueprint(blueprint)
      const warnings = validation.issues
        .filter(issue => issue.severity === 'warning')
        .map(issue => issue.message)

      const recommendations = validation.suggestions.map(suggestion => suggestion.suggestion)

      return {
        blueprint,
        confidence: validation.score,
        warnings,
        recommendations,
        generationMetadata: {
          totalTime: Date.now() - startTime,
          stepsCompleted: generationSteps,
          aiCallsUsed,
          totalCost
        }
      }
    } catch (error) {
      throw new Error(`Blueprint generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async regenerateSection(
    blueprint: Blueprint,
    section: BlueprintSection,
    feedback?: string
  ): Promise<AIResponse<any>> {
    const context = {
      userProfile: {
        experience: 'intermediate' as const,
        background: ['product development'],
        preferences: {}
      },
      feedback
    }

    switch (section) {
      case 'productPlan':
        return this.generateProductPlan(
          { 
            id: 'regenerate',
            originalInput: 'Regenerating based on feedback',
            extractedFeatures: blueprint.productPlan.coreFeatures.map(f => f.name),
            category: 'general' as any,
            complexity: 'moderate' as any,
            timestamp: new Date()
          },
          context
        )

      case 'techStack':
        return this.generateTechStack(blueprint.productPlan, context)

      case 'aiWorkflow':
        return this.generateAIWorkflow(blueprint.productPlan, context)

      case 'roadmap':
        return this.generateRoadmap(blueprint.productPlan, blueprint.techStack, context)

      case 'financialModel':
        return this.generateFinancialModel(blueprint.productPlan, blueprint.techStack, context)

      default:
        throw new Error(`Unknown section: ${section}`)
    }
  }

  async optimizeBlueprint(
    blueprint: Blueprint,
    criteria: OptimizationCriteria
  ): Promise<AIResponse<Blueprint>> {
    const optimizationPrompt = this.buildOptimizationPrompt(blueprint, criteria)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<Blueprint>({
      provider: model.provider,
      model: model.model,
      prompt: optimizationPrompt,
      systemPrompt: 'You are an expert consultant specializing in startup optimization and efficiency.',
      temperature: 0.3,
      maxTokens: 4000
    })

    return response
  }

  async validateBlueprint(blueprint: Blueprint): Promise<ValidationResult> {
    const issues: any[] = []
    const suggestions: any[] = []
    let totalScore = 0
    let sectionCount = 0

    // Validate Product Plan
    const productPlanScore = this.validateProductPlan(blueprint.productPlan)
    totalScore += productPlanScore.score
    sectionCount++
    issues.push(...productPlanScore.issues)
    suggestions.push(...productPlanScore.suggestions)

    // Validate Tech Stack
    const techStackScore = this.validateTechStack(blueprint.techStack)
    totalScore += techStackScore.score
    sectionCount++
    issues.push(...techStackScore.issues)
    suggestions.push(...techStackScore.suggestions)

    // Validate AI Workflow
    const workflowScore = this.validateAIWorkflow(blueprint.aiWorkflow)
    totalScore += workflowScore.score
    sectionCount++
    issues.push(...workflowScore.issues)
    suggestions.push(...workflowScore.suggestions)

    // Validate Roadmap
    const roadmapScore = this.validateRoadmap(blueprint.roadmap)
    totalScore += roadmapScore.score
    sectionCount++
    issues.push(...roadmapScore.issues)
    suggestions.push(...roadmapScore.suggestions)

    // Validate Financial Model
    const financialScore = this.validateFinancialModel(blueprint.financialModel)
    totalScore += financialScore.score
    sectionCount++
    issues.push(...financialScore.issues)
    suggestions.push(...financialScore.suggestions)

    const overallScore = Math.round(totalScore / sectionCount)

    return {
      isValid: issues.filter(i => i.severity === 'error').length === 0,
      score: overallScore,
      issues,
      suggestions
    }
  }

  private async generateProductPlan(idea: ProcessedIdea, context?: any): Promise<AIResponse<ProductPlan>> {
    const variables = { idea: idea.originalInput }
    const validation = validatePromptVariables('PRODUCT_PLAN_GENERATION', variables)
    
    if (!validation.valid) {
      throw new Error(`Invalid variables: ${validation.errors.join(', ')}`)
    }

    const prompt = buildPrompt('PRODUCT_PLAN_GENERATION', variables)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<string>({
      provider: model.provider,
      model: model.model,
      prompt,
      systemPrompt: 'You are an expert product strategist with 15+ years of experience in startup product development.',
      temperature: 0.7,
      maxTokens: 3000
    })

    if (response.success) {
      try {
        const parsedData = JSON.parse(response.data!)
        return {
          ...response,
          data: parsedData as ProductPlan
        }
      } catch (error) {
        return {
          ...response,
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse product plan JSON response',
            type: 'invalid_request',
            retryable: true
          }
        }
      }
    }

    return response as AIResponse<ProductPlan>
  }

  private async generateTechStack(productPlan: ProductPlan, context?: any): Promise<AIResponse<TechStack>> {
    const variables = {
      features: productPlan.coreFeatures.map(f => f.name),
      scale: 'medium', // Default scale
      budget: 'medium', // Default budget
      teamExperience: 'mixed' // Default team experience
    }

    const prompt = buildPrompt('TECH_STACK_GENERATION', variables)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<string>({
      provider: model.provider,
      model: model.model,
      prompt,
      systemPrompt: 'You are a senior software architect with expertise in modern web technologies and scalable systems.',
      temperature: 0.5,
      maxTokens: 3000
    })

    if (response.success) {
      try {
        const parsedData = JSON.parse(response.data!)
        return {
          ...response,
          data: parsedData as TechStack
        }
      } catch (error) {
        return {
          ...response,
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse tech stack JSON response',
            type: 'invalid_request',
            retryable: true
          }
        }
      }
    }

    return response as AIResponse<TechStack>
  }

  private async generateAIWorkflow(productPlan: ProductPlan, context?: any): Promise<AIResponse<AIWorkflow>> {
    const aiFeatures = productPlan.coreFeatures
      .filter(f => f.name.toLowerCase().includes('ai') || f.description.toLowerCase().includes('ai'))
      .map(f => f.name)

    const variables = {
      aiFeatures: aiFeatures.length > 0 ? aiFeatures : ['AI-powered recommendations'],
      constraints: 'Standard web application constraints',
      dataSources: ['user data', 'application data']
    }

    const prompt = buildPrompt('AI_WORKFLOW_GENERATION', variables)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<string>({
      provider: model.provider,
      model: model.model,
      prompt,
      systemPrompt: 'You are an AI systems architect specializing in production AI workflows and MLOps.',
      temperature: 0.5,
      maxTokens: 3000
    })

    if (response.success) {
      try {
        const parsedData = JSON.parse(response.data!)
        return {
          ...response,
          data: parsedData as AIWorkflow
        }
      } catch (error) {
        return {
          ...response,
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse AI workflow JSON response',
            type: 'invalid_request',
            retryable: true
          }
        }
      }
    }

    return response as AIResponse<AIWorkflow>
  }

  private async generateRoadmap(
    productPlan: ProductPlan,
    techStack: TechStack,
    context?: any
  ): Promise<AIResponse<Roadmap>> {
    const variables = {
      features: productPlan.coreFeatures,
      techStack,
      teamSize: 3, // Default team size
      timeline: '6 months' // Default timeline
    }

    const prompt = buildPrompt('ROADMAP_GENERATION', variables)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<string>({
      provider: model.provider,
      model: model.model,
      prompt,
      systemPrompt: 'You are a technical project manager with expertise in agile development and startup execution.',
      temperature: 0.6,
      maxTokens: 3000
    })

    if (response.success) {
      try {
        const parsedData = JSON.parse(response.data!)
        return {
          ...response,
          data: parsedData as Roadmap
        }
      } catch (error) {
        return {
          ...response,
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse roadmap JSON response',
            type: 'invalid_request',
            retryable: true
          }
        }
      }
    }

    return response as AIResponse<Roadmap>
  }

  private async generateFinancialModel(
    productPlan: ProductPlan,
    techStack: TechStack,
    context?: any
  ): Promise<AIResponse<FinancialModel>> {
    const variables = {
      productPlan,
      techStack,
      marketSize: 'Medium-sized market',
      businessModel: productPlan.monetization.primaryModel
    }

    const prompt = buildPrompt('FINANCIAL_MODEL_GENERATION', variables)
    const model = selectOptimalModel('analytical', 'quality')

    const response = await this.aiManager.makeRequest<string>({
      provider: model.provider,
      model: model.model,
      prompt,
      systemPrompt: 'You are a financial analyst specializing in tech startup financial modeling and projections.',
      temperature: 0.4,
      maxTokens: 3000
    })

    if (response.success) {
      try {
        const parsedData = JSON.parse(response.data!)
        return {
          ...response,
          data: parsedData as FinancialModel
        }
      } catch (error) {
        return {
          ...response,
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: 'Failed to parse financial model JSON response',
            type: 'invalid_request',
            retryable: true
          }
        }
      }
    }

    return response as AIResponse<FinancialModel>
  }

  private buildOptimizationPrompt(blueprint: Blueprint, criteria: OptimizationCriteria): string {
    return `Optimize the following startup blueprint based on the criteria: ${criteria.focus}

CURRENT BLUEPRINT:
${JSON.stringify(blueprint, null, 2)}

OPTIMIZATION CRITERIA:
- Focus: ${criteria.focus}
- Constraints: ${JSON.stringify(criteria.constraints)}
- Priorities: ${criteria.priorities.join(', ')}

Please provide an optimized version of the blueprint in the same JSON format, with explanations for key changes made.`
  }

  // Validation helper methods
  private validateProductPlan(productPlan: ProductPlan): { score: number; issues: any[]; suggestions: any[] } {
    const issues: any[] = []
    const suggestions: any[] = []
    let score = 100

    if (!productPlan.targetAudience?.primary) {
      issues.push({
        severity: 'error',
        category: 'product-plan',
        message: 'Missing primary target audience',
        field: 'targetAudience.primary'
      })
      score -= 20
    }

    if (!productPlan.coreFeatures || productPlan.coreFeatures.length === 0) {
      issues.push({
        severity: 'error',
        category: 'product-plan',
        message: 'No core features defined',
        field: 'coreFeatures'
      })
      score -= 30
    }

    if (!productPlan.monetization?.primaryModel) {
      issues.push({
        severity: 'warning',
        category: 'product-plan',
        message: 'Monetization model not clearly defined',
        field: 'monetization.primaryModel'
      })
      score -= 10
    }

    return { score: Math.max(0, score), issues, suggestions }
  }

  private validateTechStack(techStack: TechStack): { score: number; issues: any[]; suggestions: any[] } {
    const issues: any[] = []
    const suggestions: any[] = []
    let score = 100

    if (!techStack.frontend || techStack.frontend.length === 0) {
      issues.push({
        severity: 'error',
        category: 'tech-stack',
        message: 'No frontend technologies specified',
        field: 'frontend'
      })
      score -= 25
    }

    if (!techStack.backend || techStack.backend.length === 0) {
      issues.push({
        severity: 'error',
        category: 'tech-stack',
        message: 'No backend technologies specified',
        field: 'backend'
      })
      score -= 25
    }

    return { score: Math.max(0, score), issues, suggestions }
  }

  private validateAIWorkflow(workflow: AIWorkflow): { score: number; issues: any[]; suggestions: any[] } {
    const issues: any[] = []
    const suggestions: any[] = []
    let score = 100

    if (!workflow.nodes || workflow.nodes.length === 0) {
      issues.push({
        severity: 'warning',
        category: 'ai-workflow',
        message: 'No workflow nodes defined',
        field: 'nodes'
      })
      score -= 20
    }

    return { score: Math.max(0, score), issues, suggestions }
  }

  private validateRoadmap(roadmap: Roadmap): { score: number; issues: any[]; suggestions: any[] } {
    const issues: any[] = []
    const suggestions: any[] = []
    let score = 100

    // Add roadmap validation logic here
    return { score: Math.max(0, score), issues, suggestions }
  }

  private validateFinancialModel(financialModel: FinancialModel): { score: number; issues: any[]; suggestions: any[] } {
    const issues: any[] = []
    const suggestions: any[] = []
    let score = 100

    // Add financial model validation logic here
    return { score: Math.max(0, score), issues, suggestions }
  }
}