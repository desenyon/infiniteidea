import { OpenAIClient } from './clients/openai-client'
import { AnthropicClient } from './clients/anthropic-client'
import {
  AIRequest,
  AIResponse,
  AIProvider,
  OpenAIProvider,
  AnthropicProvider,
  AdvancedAIServiceConfig
} from '@/types/ai-services'

interface RateLimitState {
  requests: number
  tokens: number
  resetTime: number
}

interface CircuitBreakerState {
  failures: number
  lastFailure: number
  isOpen: boolean
}

export class AIServiceManager {
  private openaiClient?: OpenAIClient
  private anthropicClient?: AnthropicClient
  private config: AdvancedAIServiceConfig
  private rateLimitStates = new Map<string, RateLimitState>()
  private circuitBreakerStates = new Map<string, CircuitBreakerState>()
  private requestQueue: Array<{ request: AIRequest; resolve: Function; reject: Function }> = []
  private isProcessingQueue = false

  constructor(config: AdvancedAIServiceConfig) {
    this.config = config
    this.initializeClients()
  }

  private initializeClients() {
    for (const provider of this.config.providers) {
      switch (provider.name) {
        case 'openai':
          this.openaiClient = new OpenAIClient(provider as OpenAIProvider)
          break
        case 'anthropic':
          this.anthropicClient = new AnthropicClient(provider as AnthropicProvider)
          break
      }
    }
  }

  async makeRequest<T = any>(request: AIRequest): Promise<AIResponse<T>> {
    // Check circuit breaker
    if (this.isCircuitBreakerOpen(request.provider)) {
      return this.handleCircuitBreakerOpen<T>(request)
    }

    // Check rate limits
    if (this.isRateLimited(request.provider)) {
      return this.queueRequest<T>(request)
    }

    try {
      const response = await this.executeRequest<T>(request)
      
      if (response.success) {
        this.recordSuccess(request.provider)
        this.updateRateLimit(request.provider, response.usage.totalTokens)
      } else {
        this.recordFailure(request.provider)
      }

      return response
    } catch (error) {
      this.recordFailure(request.provider)
      
      // Try fallback providers
      const fallbackResponse = await this.tryFallbacks<T>(request)
      if (fallbackResponse) {
        return fallbackResponse
      }

      throw error
    }
  }

  private async executeRequest<T>(request: AIRequest): Promise<AIResponse<T>> {
    const client = this.getClient(request.provider)
    if (!client) {
      throw new Error(`No client available for provider: ${request.provider}`)
    }

    return await client.makeRequest<T>(request)
  }

  private getClient(providerName: string): OpenAIClient | AnthropicClient | null {
    switch (providerName) {
      case 'openai':
        return this.openaiClient || null
      case 'anthropic':
        return this.anthropicClient || null
      default:
        return null
    }
  }

  private isRateLimited(providerName: string): boolean {
    const provider = this.config.providers.find(p => p.name === providerName)
    if (!provider) return false

    const state = this.rateLimitStates.get(providerName)
    if (!state) return false

    const now = Date.now()
    
    // Reset if window has passed
    if (now > state.resetTime) {
      this.rateLimitStates.set(providerName, {
        requests: 0,
        tokens: 0,
        resetTime: now + 60000 // 1 minute window
      })
      return false
    }

    return (
      state.requests >= provider.rateLimits.requestsPerMinute ||
      state.tokens >= provider.rateLimits.tokensPerMinute
    )
  }

  private updateRateLimit(providerName: string, tokens: number) {
    const state = this.rateLimitStates.get(providerName) || {
      requests: 0,
      tokens: 0,
      resetTime: Date.now() + 60000
    }

    state.requests += 1
    state.tokens += tokens
    this.rateLimitStates.set(providerName, state)
  }

  private isCircuitBreakerOpen(providerName: string): boolean {
    if (!this.config.circuitBreaker.enabled) return false

    const state = this.circuitBreakerStates.get(providerName)
    if (!state) return false

    const now = Date.now()
    
    // Check if recovery timeout has passed
    if (state.isOpen && now - state.lastFailure > this.config.circuitBreaker.recoveryTimeout) {
      state.isOpen = false
      state.failures = 0
      this.circuitBreakerStates.set(providerName, state)
      return false
    }

    return state.isOpen
  }

  private recordSuccess(providerName: string) {
    const state = this.circuitBreakerStates.get(providerName)
    if (state) {
      state.failures = 0
      state.isOpen = false
      this.circuitBreakerStates.set(providerName, state)
    }
  }

  private recordFailure(providerName: string) {
    if (!this.config.circuitBreaker.enabled) return

    const state = this.circuitBreakerStates.get(providerName) || {
      failures: 0,
      lastFailure: 0,
      isOpen: false
    }

    state.failures += 1
    state.lastFailure = Date.now()

    if (state.failures >= this.config.circuitBreaker.failureThreshold) {
      state.isOpen = true
    }

    this.circuitBreakerStates.set(providerName, state)
  }

  private async handleCircuitBreakerOpen<T>(request: AIRequest): Promise<AIResponse<T>> {
    // Try fallback providers
    const fallbackResponse = await this.tryFallbacks<T>(request)
    if (fallbackResponse) {
      return fallbackResponse
    }

    return {
      success: false,
      error: {
        code: 'CIRCUIT_BREAKER_OPEN',
        message: `Circuit breaker is open for provider: ${request.provider}`,
        type: 'server_error',
        retryable: true,
        retryAfter: this.config.circuitBreaker.recoveryTimeout / 1000
      },
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 },
      metadata: {
        provider: request.provider,
        model: request.model,
        latency: 0,
        timestamp: new Date(),
        requestId: `circuit_breaker_${Date.now()}`
      }
    }
  }

  private async tryFallbacks<T>(request: AIRequest): Promise<AIResponse<T> | null> {
    const fallbackChain = this.config.fallbackChain.filter(p => p !== request.provider)
    
    for (const fallbackProvider of fallbackChain) {
      if (this.isCircuitBreakerOpen(fallbackProvider) || this.isRateLimited(fallbackProvider)) {
        continue
      }

      try {
        const fallbackRequest = { ...request, provider: fallbackProvider }
        const response = await this.executeRequest<T>(fallbackRequest)
        
        if (response.success) {
          this.recordSuccess(fallbackProvider)
          this.updateRateLimit(fallbackProvider, response.usage.totalTokens)
          return response
        }
      } catch (error) {
        this.recordFailure(fallbackProvider)
        continue
      }
    }

    return null
  }

  private async queueRequest<T>(request: AIRequest): Promise<AIResponse<T>> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true

    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift()!

      if (!this.isRateLimited(request.provider)) {
        try {
          const response = await this.makeRequest(request)
          resolve(response)
        } catch (error) {
          reject(error)
        }
      } else {
        // Put back in queue and wait
        this.requestQueue.unshift({ request, resolve, reject })
        await this.sleep(1000) // Wait 1 second before retrying
      }
    }

    this.isProcessingQueue = false
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async makeStreamingRequest(request: AIRequest): Promise<AsyncIterable<string>> {
    const client = this.getClient(request.provider)
    if (!client) {
      throw new Error(`No client available for provider: ${request.provider}`)
    }

    return await client.makeStreamingRequest(request)
  }

  async testConnections(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    if (this.openaiClient) {
      results.openai = await this.openaiClient.testConnection()
    }

    if (this.anthropicClient) {
      results.anthropic = await this.anthropicClient.testConnection()
    }

    return results
  }

  getAvailableProviders(): string[] {
    const providers: string[] = []
    
    if (this.openaiClient) providers.push('openai')
    if (this.anthropicClient) providers.push('anthropic')
    
    return providers
  }

  // Alias for backward compatibility
  getAvailableServices(): string[] {
    return this.getAvailableProviders()
  }

  // High-level text generation method
  async generateText(prompt: string, options?: { provider?: string; model?: string }): Promise<string> {
    const provider = options?.provider || this.config.providers[0]?.name || 'openai'
    const model = options?.model || this.config.providers.find(p => p.name === provider)?.model || 'gpt-4'

    const request: AIRequest = {
      provider,
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      maxTokens: 1000
    }

    const response = await this.makeRequest<{ content: string }>(request)
    
    if (response.success && response.data) {
      return response.data.content || 'Generated response'
    }
    
    throw new Error(response.error?.message || 'Failed to generate text')
  }

  getProviderStatus(providerName: string): {
    available: boolean
    rateLimited: boolean
    circuitBreakerOpen: boolean
  } {
    return {
      available: this.getClient(providerName) !== null,
      rateLimited: this.isRateLimited(providerName),
      circuitBreakerOpen: this.isCircuitBreakerOpen(providerName)
    }
  }

  updateConfig(config: Partial<AdvancedAIServiceConfig>) {
    this.config = { ...this.config, ...config }
    this.initializeClients()
  }
}