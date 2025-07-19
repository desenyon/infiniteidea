import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIOrchestrationService } from '../ai-services/ai-orchestrator'
import { ProcessedIdea, BlueprintGenerationRequest } from '@/types/ai-services'

// Mock the AI service manager
vi.mock('../ai-services/index', () => ({
  getAIServiceManager: vi.fn(() => ({
    makeRequest: vi.fn().mockImplementation(async (request) => {
      // Mock different responses based on the prompt content
      if (request.prompt.includes('product plan')) {
        return {
          success: true,
          data: JSON.stringify({
            targetAudience: {
              primary: "Tech-savvy professionals",
              secondary: "Small business owners",
              demographics: ["25-45 years old", "Urban professionals"],
              painPoints: ["Time management", "Productivity"],
              motivations: ["Efficiency", "Growth"]
            },
            coreFeatures: [
              {
                name: "Task Management",
                description: "Organize and track tasks",
                priority: "high",
                userValue: "Better organization",
                complexity: "moderate"
              }
            ],
            differentiators: ["AI-powered insights", "Seamless integration"],
            monetization: {
              primaryModel: "subscription",
              pricingStrategy: "Tiered pricing",
              revenueStreams: ["Monthly subscriptions", "Enterprise plans"],
              competitivePricing: "Competitive with market leaders"
            },
            gtmStrategy: {
              launchStrategy: "Product Hunt launch",
              marketingChannels: ["Social media", "Content marketing"],
              partnerships: ["Integration partners"],
              timeline: "3-month launch plan"
            }
          }),
          usage: { promptTokens: 100, completionTokens: 200, totalTokens: 300, cost: 0.01 },
          metadata: {
            provider: 'openai',
            model: 'gpt-4',
            latency: 1000,
            timestamp: new Date(),
            requestId: 'test-123'
          }
        }
      }

      if (request.prompt.includes('tech stack')) {
        return {
          success: true,
          data: JSON.stringify({
            frontend: [
              {
                name: "React",
                category: "framework",
                reasoning: "Popular and well-supported",
                alternatives: ["Vue", "Angular"],
                pros: ["Large ecosystem", "Good performance"],
                cons: ["Learning curve"],
                cost: 0
              }
            ],
            backend: [
              {
                name: "Node.js",
                category: "runtime",
                reasoning: "JavaScript everywhere",
                alternatives: ["Python", "Go"],
                pros: ["Fast development", "Large community"],
                cons: ["Single-threaded"],
                cost: 0
              }
            ],
            database: [
              {
                name: "PostgreSQL",
                category: "sql",
                reasoning: "Reliable and feature-rich",
                alternatives: ["MySQL", "MongoDB"],
                pros: ["ACID compliance", "JSON support"],
                cons: ["Complex setup"],
                cost: 50
              }
            ],
            aiServices: [],
            deployment: [
              {
                name: "Vercel",
                category: "serverless",
                reasoning: "Easy deployment for React apps",
                alternatives: ["Netlify", "AWS"],
                pros: ["Simple setup", "Good performance"],
                cons: ["Vendor lock-in"],
                cost: 100
              }
            ],
            security: ["HTTPS everywhere", "Input validation"]
          }),
          usage: { promptTokens: 150, completionTokens: 250, totalTokens: 400, cost: 0.012 },
          metadata: {
            provider: 'openai',
            model: 'gpt-4',
            latency: 1200,
            timestamp: new Date(),
            requestId: 'test-124'
          }
        }
      }

      // Default mock response for other prompts
      return {
        success: true,
        data: JSON.stringify({ mock: 'response' }),
        usage: { promptTokens: 50, completionTokens: 100, totalTokens: 150, cost: 0.005 },
        metadata: {
          provider: 'openai',
          model: 'gpt-4',
          latency: 800,
          timestamp: new Date(),
          requestId: 'test-default'
        }
      }
    })
  }))
}))

describe('AIOrchestrationService', () => {
  let orchestrator: AIOrchestrationService
  let mockIdea: ProcessedIdea
  let mockRequest: BlueprintGenerationRequest

  beforeEach(() => {
    orchestrator = new AIOrchestrationService()
    
    mockIdea = {
      id: 'test-idea-1',
      originalInput: 'A productivity app that helps users manage their tasks with AI insights',
      extractedFeatures: ['task management', 'AI insights', 'productivity tracking'],
      category: 'productivity' as any,
      complexity: 'moderate' as any,
      timestamp: new Date()
    }

    mockRequest = {
      idea: mockIdea,
      preferences: {
        aiProvider: 'openai',
        complexity: 'detailed',
        focus: ['product', 'technical'],
        industry: 'productivity',
        budget: 50000,
        timeline: '6 months',
        teamSize: 3
      }
    }
  })

  it('should generate a complete blueprint', async () => {
    const response = await orchestrator.generateBlueprint(mockRequest)

    expect(response.blueprint).toBeDefined()
    expect(response.blueprint.productPlan).toBeDefined()
    expect(response.blueprint.techStack).toBeDefined()
    expect(response.blueprint.aiWorkflow).toBeDefined()
    expect(response.blueprint.roadmap).toBeDefined()
    expect(response.blueprint.financialModel).toBeDefined()
    expect(response.confidence).toBeGreaterThan(0)
    expect(response.generationMetadata.aiCallsUsed).toBeGreaterThan(0)
    expect(response.generationMetadata.totalCost).toBeGreaterThan(0)
  })

  it('should validate blueprint structure', async () => {
    const response = await orchestrator.generateBlueprint(mockRequest)
    const validation = await orchestrator.validateBlueprint(response.blueprint)

    expect(validation.score).toBeGreaterThan(0)
    expect(validation.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(validation.issues)).toBe(true)
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  it('should handle regeneration of specific sections', async () => {
    const response = await orchestrator.generateBlueprint(mockRequest)
    
    const regeneratedSection = await orchestrator.regenerateSection(
      response.blueprint,
      'productPlan',
      'Make it more focused on enterprise users'
    )

    expect(regeneratedSection.success).toBe(true)
    expect(regeneratedSection.data).toBeDefined()
  })

  it('should track generation metadata correctly', async () => {
    const response = await orchestrator.generateBlueprint(mockRequest)

    expect(response.generationMetadata.totalTime).toBeGreaterThanOrEqual(0)
    expect(response.generationMetadata.stepsCompleted.length).toBeGreaterThan(0)
    expect(response.generationMetadata.aiCallsUsed).toBeGreaterThan(0)
    expect(response.generationMetadata.totalCost).toBeGreaterThan(0)
  })

  it('should provide meaningful warnings and recommendations', async () => {
    const response = await orchestrator.generateBlueprint(mockRequest)

    expect(Array.isArray(response.warnings)).toBe(true)
    expect(Array.isArray(response.recommendations)).toBe(true)
  })
})