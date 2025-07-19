import { AdvancedAIServiceConfig, OpenAIProvider, AnthropicProvider } from '@/types/ai-services'

export function createAIServiceConfig(): AdvancedAIServiceConfig {
  const providers = []

  // OpenAI Configuration
  if (process.env.OPENAI_API_KEY) {
    const openaiProvider: OpenAIProvider = {
      name: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      maxTokens: 8192,
      supportsStreaming: true,
      costPerToken: 0.00003, // GPT-4 pricing
      rateLimits: {
        requestsPerMinute: 500,
        tokensPerMinute: 150000
      }
    }
    providers.push(openaiProvider)
  }

  // Anthropic Configuration
  if (process.env.ANTHROPIC_API_KEY) {
    const anthropicProvider: AnthropicProvider = {
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      maxTokens: 4096,
      supportsStreaming: true,
      costPerToken: 0.000015, // Claude pricing
      rateLimits: {
        requestsPerMinute: 1000,
        tokensPerMinute: 200000
      }
    }
    providers.push(anthropicProvider)
  }

  if (providers.length === 0) {
    throw new Error('No AI service providers configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variables.')
  }

  return {
    providers,
    loadBalancing: {
      strategy: 'quality_first', // Prefer higher quality models
      weights: {
        openai: 0.6,
        anthropic: 0.4
      }
    },
    fallbackChain: providers.length > 1 ? providers.map(p => p.name) : [providers[0].name],
    circuitBreaker: {
      enabled: true,
      failureThreshold: 5,
      recoveryTimeout: 60000 // 1 minute
    },
    caching: {
      enabled: true,
      ttl: 3600000, // 1 hour
      keyStrategy: 'prompt_hash'
    },
    monitoring: {
      metricsEnabled: true,
      alertThresholds: {
        latency: 30000, // 30 seconds
        errorRate: 0.1, // 10%
        costPerHour: 50 // $50/hour
      }
    }
  }
}

export function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'openai':
      return 'gpt-4-turbo'
    case 'anthropic':
      return 'claude-3-sonnet-20240229'
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}

export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const required = []
  const missing = []

  // Check for at least one AI provider
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    missing.push('OPENAI_API_KEY or ANTHROPIC_API_KEY')
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

export const AI_SERVICE_MODELS = {
  openai: {
    'gpt-4': {
      maxTokens: 8192,
      costPer1kTokens: 0.03,
      bestFor: ['complex reasoning', 'code generation', 'analysis']
    },
    'gpt-4-turbo': {
      maxTokens: 128000,
      costPer1kTokens: 0.01,
      bestFor: ['long context', 'document analysis', 'comprehensive planning']
    },
    'gpt-3.5-turbo': {
      maxTokens: 4096,
      costPer1kTokens: 0.002,
      bestFor: ['quick responses', 'simple tasks', 'cost optimization']
    }
  },
  anthropic: {
    'claude-3-opus-20240229': {
      maxTokens: 4096,
      costPer1kTokens: 0.015,
      bestFor: ['complex analysis', 'creative writing', 'detailed reasoning']
    },
    'claude-3-sonnet-20240229': {
      maxTokens: 4096,
      costPer1kTokens: 0.003,
      bestFor: ['balanced performance', 'general tasks', 'good cost/quality ratio']
    },
    'claude-3-haiku-20240307': {
      maxTokens: 4096,
      costPer1kTokens: 0.00025,
      bestFor: ['fast responses', 'simple tasks', 'high volume processing']
    }
  }
} as const

export function selectOptimalModel(
  task: 'simple' | 'complex' | 'creative' | 'analytical',
  priority: 'speed' | 'cost' | 'quality'
): { provider: string; model: string } {
  if (priority === 'cost') {
    if (process.env.OPENAI_API_KEY) {
      return { provider: 'openai', model: 'gpt-3.5-turbo' }
    }
    return { provider: 'anthropic', model: 'claude-3-haiku-20240307' }
  }

  if (priority === 'speed') {
    if (process.env.ANTHROPIC_API_KEY) {
      return { provider: 'anthropic', model: 'claude-3-haiku-20240307' }
    }
    return { provider: 'openai', model: 'gpt-3.5-turbo' }
  }

  // Quality priority
  if (task === 'complex' || task === 'analytical') {
    if (process.env.OPENAI_API_KEY) {
      return { provider: 'openai', model: 'gpt-4-turbo' }
    }
    return { provider: 'anthropic', model: 'claude-3-opus-20240229' }
  }

  if (task === 'creative') {
    if (process.env.ANTHROPIC_API_KEY) {
      return { provider: 'anthropic', model: 'claude-3-opus-20240229' }
    }
    return { provider: 'openai', model: 'gpt-4' }
  }

  // Default for simple tasks
  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: 'anthropic', model: 'claude-3-sonnet-20240229' }
  }
  return { provider: 'openai', model: 'gpt-4-turbo' }
}