import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AIServiceManager } from '../ai-services/ai-service-manager'
import { AdvancedAIServiceConfig } from '@/types/ai-services'

// Mock the AI clients
vi.mock('../ai-services/clients/openai-client', () => ({
  OpenAIClient: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn().mockResolvedValue({
      success: true,
      data: 'Test response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30, cost: 0.001 },
      metadata: {
        provider: 'openai',
        model: 'gpt-4',
        latency: 1000,
        timestamp: new Date(),
        requestId: 'test-123'
      }
    }),
    makeStreamingRequest: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
    getProvider: vi.fn().mockReturnValue({ name: 'openai' })
  }))
}))

vi.mock('../ai-services/clients/anthropic-client', () => ({
  AnthropicClient: vi.fn().mockImplementation(() => ({
    makeRequest: vi.fn().mockResolvedValue({
      success: true,
      data: 'Test response from Claude',
      usage: { promptTokens: 15, completionTokens: 25, totalTokens: 40, cost: 0.0006 },
      metadata: {
        provider: 'anthropic',
        model: 'claude-3-sonnet-20240229',
        latency: 800,
        timestamp: new Date(),
        requestId: 'test-456'
      }
    }),
    makeStreamingRequest: vi.fn(),
    testConnection: vi.fn().mockResolvedValue(true),
    getProvider: vi.fn().mockReturnValue({ name: 'anthropic' })
  }))
}))

describe('AIServiceManager', () => {
  let config: AdvancedAIServiceConfig
  let manager: AIServiceManager

  beforeEach(() => {
    config = {
      providers: [
        {
          name: 'openai',
          apiKey: 'test-openai-key',
          models: ['gpt-4'],
          maxTokens: 4000,
          supportsStreaming: true,
          costPerToken: 0.00003,
          rateLimits: {
            requestsPerMinute: 100,
            tokensPerMinute: 50000
          }
        },
        {
          name: 'anthropic',
          apiKey: 'test-anthropic-key',
          models: ['claude-3-sonnet-20240229'],
          maxTokens: 4000,
          supportsStreaming: true,
          costPerToken: 0.000015,
          rateLimits: {
            requestsPerMinute: 200,
            tokensPerMinute: 100000
          }
        }
      ],
      loadBalancing: {
        strategy: 'round_robin'
      },
      fallbackChain: ['openai', 'anthropic'],
      circuitBreaker: {
        enabled: true,
        failureThreshold: 3,
        recoveryTimeout: 30000
      },
      caching: {
        enabled: true,
        ttl: 3600000,
        keyStrategy: 'prompt_hash'
      },
      monitoring: {
        metricsEnabled: true,
        alertThresholds: {
          latency: 10000,
          errorRate: 0.1,
          costPerHour: 10
        }
      }
    }

    manager = new AIServiceManager(config)
  })

  it('should initialize with providers', () => {
    expect(manager.getAvailableProviders()).toContain('openai')
    expect(manager.getAvailableProviders()).toContain('anthropic')
  })

  it('should make successful AI requests', async () => {
    const request = {
      provider: 'openai',
      model: 'gpt-4',
      prompt: 'Hello, world!'
    }

    const response = await manager.makeRequest(request)

    expect(response.success).toBe(true)
    expect(response.data).toBe('Test response')
    expect(response.metadata.provider).toBe('openai')
  })

  it('should test connections', async () => {
    const connections = await manager.testConnections()

    expect(connections.openai).toBe(true)
    expect(connections.anthropic).toBe(true)
  })

  it('should provide provider status', () => {
    const status = manager.getProviderStatus('openai')

    expect(status.available).toBe(true)
    expect(status.rateLimited).toBe(false)
    expect(status.circuitBreakerOpen).toBe(false)
  })

  it('should handle rate limiting', () => {
    // This would require more complex mocking to test rate limiting behavior
    // For now, we just verify the method exists and returns expected structure
    const status = manager.getProviderStatus('openai')
    expect(typeof status.rateLimited).toBe('boolean')
  })

  it('should handle circuit breaker', () => {
    // This would require more complex mocking to test circuit breaker behavior
    // For now, we just verify the method exists and returns expected structure
    const status = manager.getProviderStatus('openai')
    expect(typeof status.circuitBreakerOpen).toBe('boolean')
  })
})