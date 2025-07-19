import { AIServiceManager } from './ai-service-manager'
import { createAIServiceConfig, validateEnvironmentVariables } from './config'

// Validate environment variables on module load
const validation = validateEnvironmentVariables()
if (!validation.valid) {
  console.warn('AI Service Configuration Warning:', validation.missing.join(', '))
}

// Create singleton instance
let aiServiceManager: AIServiceManager | null = null

export function getAIServiceManager(): AIServiceManager {
  if (!aiServiceManager) {
    const config = createAIServiceConfig()
    aiServiceManager = new AIServiceManager(config)
  }
  return aiServiceManager
}

// Re-export types and utilities
export * from './ai-service-manager'
export * from './config'
export * from './clients/openai-client'
export * from './clients/anthropic-client'
export * from './ai-orchestrator'
export * from './prompt-templates'
export * from './coding-prompt-generator'
export * from './coding-prompt-templates'
export * from './prompt-validator'
export * from './prompt-version-control'

// Utility functions for common operations
export async function makeAIRequest<T = any>(
  prompt: string,
  options: {
    provider?: string
    model?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  } = {}
) {
  const manager = getAIServiceManager()
  const availableProviders = manager.getAvailableProviders()
  
  if (availableProviders.length === 0) {
    throw new Error('No AI providers available')
  }

  const provider = options.provider || availableProviders[0]
  const model = options.model || (provider === 'openai' ? 'gpt-4-turbo' : 'claude-3-sonnet-20240229')

  return await manager.makeRequest<T>({
    provider,
    model,
    prompt,
    systemPrompt: options.systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens
  })
}

export async function makeStreamingAIRequest(
  prompt: string,
  options: {
    provider?: string
    model?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  } = {}
): Promise<AsyncIterable<string>> {
  const manager = getAIServiceManager()
  const availableProviders = manager.getAvailableProviders()
  
  if (availableProviders.length === 0) {
    throw new Error('No AI providers available')
  }

  const provider = options.provider || availableProviders[0]
  const model = options.model || (provider === 'openai' ? 'gpt-4-turbo' : 'claude-3-sonnet-20240229')

  return await manager.makeStreamingRequest({
    provider,
    model,
    prompt,
    systemPrompt: options.systemPrompt,
    temperature: options.temperature,
    maxTokens: options.maxTokens
  })
}

export async function testAIConnections() {
  const manager = getAIServiceManager()
  return await manager.testConnections()
}

export function getAIProviderStatus() {
  const manager = getAIServiceManager()
  const providers = manager.getAvailableProviders()
  
  return providers.reduce((status, provider) => {
    status[provider] = manager.getProviderStatus(provider)
    return status
  }, {} as Record<string, any>)
}