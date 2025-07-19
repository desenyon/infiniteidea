import OpenAI from 'openai'
import { AIRequest, AIResponse, AIError, OpenAIProvider } from '@/types/ai-services'

export class OpenAIClient {
  private client: OpenAI
  private provider: OpenAIProvider

  constructor(provider: OpenAIProvider) {
    this.provider = provider
    this.client = new OpenAI({
      apiKey: provider.apiKey,
      organization: provider.organization,
      baseURL: provider.baseURL,
    })
  }

  async makeRequest<T = any>(request: AIRequest): Promise<AIResponse<T>> {
    const startTime = Date.now()
    const requestId = this.generateRequestId()

    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: [
          ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
          { role: 'user' as const, content: request.prompt }
        ],
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4000,
        stream: request.stream ?? false,
      })

      const latency = Date.now() - startTime
      const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      const cost = this.calculateCost(usage.total_tokens)

      return {
        success: true,
        data: response.choices[0]?.message?.content as T,
        rawResponse: JSON.stringify(response),
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
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
    const stream = await this.client.chat.completions.create({
      model: request.model,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system' as const, content: request.systemPrompt }] : []),
        { role: 'user' as const, content: request.prompt }
      ],
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4000,
      stream: true,
    })

    return this.createStreamIterator(stream)
  }

  private async* createStreamIterator(stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  private calculateCost(totalTokens: number): number {
    // OpenAI GPT-4 pricing (approximate)
    const costPerToken = this.provider.costPerToken || 0.00003
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
        message: error?.message || 'OpenAI server error',
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
    return `openai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getProvider(): OpenAIProvider {
    return this.provider
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}