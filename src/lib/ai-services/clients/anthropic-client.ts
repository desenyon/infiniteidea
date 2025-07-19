import Anthropic from '@anthropic-ai/sdk'
import { AIRequest, AIResponse, AIError, AnthropicProvider } from '@/types/ai-services'

export class AnthropicClient {
  private client: Anthropic
  private provider: AnthropicProvider

  constructor(provider: AnthropicProvider) {
    this.provider = provider
    this.client = new Anthropic({
      apiKey: provider.apiKey,
      baseURL: provider.baseURL,
    })
  }

  async makeRequest<T = any>(request: AIRequest): Promise<AIResponse<T>> {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      const response = await this.client.messages.create({
        model: request.model,
        max_tokens: request.maxTokens ?? 4000,
        temperature: request.temperature ?? 0.7,
        system: request.systemPrompt,
        messages: [
          { role: 'user', content: request.prompt }
        ],
        stream: request.stream ?? false,
      })

      const latency = Date.now() - startTime
      const usage = response.usage || { input_tokens: 0, output_tokens: 0 }
      const totalTokens = usage.input_tokens + usage.output_tokens
      const cost = this.calculateCost(totalTokens)

      // Extract text content from response
      const content = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('')

      return {
        success: true,
        data: content as T,
        rawResponse: JSON.stringify(response),
        usage: {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens,
          cost
        },
        metadata: {
          provider: this.provider.name,
          model: request.model,
          latency,
          timestamp: new Date(),
          requestId
        }
      }
    } catch (error) {
      const latency = Date.now() - startTime
      const aiError = this.mapError(error)

      return {
        success: false,
        error: aiError,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          cost: 0
        },
        metadata: {
          provider: this.provider.name,
          model: request.model,
          latency,
          timestamp: new Date(),
          requestId
        }
      }
    }
  }

  async makeStreamingRequest(request: AIRequest): Promise<AsyncIterable<string>> {
    const stream = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens ?? 4000,
      temperature: request.temperature ?? 0.7,
      system: request.systemPrompt,
      messages: [
        { role: 'user', content: request.prompt }
      ],
      stream: true,
    })

    return this.createStreamIterator(stream)
  }

  private async* createStreamIterator(stream: AsyncIterable<Anthropic.MessageStreamEvent>): AsyncIterable<string> {
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text
      }
    }
  }

  private calculateCost(totalTokens: number): number {
    // Anthropic Claude pricing (approximate)
    const costPerToken = this.provider.costPerToken || 0.000015
    return totalTokens * costPerToken
  }

  private mapError(error: any): AIError {
    if (error?.status === 429) {
      return {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
        type: 'rate_limit',
        retryable: true,
        retryAfter: error?.headers?.['retry-after'] ? parseInt(error.headers['retry-after']) : 60
      }
    }

    if (error?.status === 401) {
      return {
        code: 'AUTHENTICATION_ERROR',
        message: 'Invalid API key',
        type: 'authentication',
        retryable: false
      }
    }

    if (error?.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: error?.message || 'Anthropic server error',
        type: 'server_error',
        retryable: true
      }
    }

    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
      return {
        code: 'TIMEOUT',
        message: 'Request timeout',
        type: 'timeout',
        retryable: true
      }
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'Unknown error occurred',
      type: 'server_error',
      retryable: false
    }
  }

  private generateRequestId(): string {
    return `anthropic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getProvider(): AnthropicProvider {
    return this.provider
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
      return true
    } catch {
      return false
    }
  }
}