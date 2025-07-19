import { AIError } from "@/types/ai-services"
import { ProjectStatus } from "@/types"

export interface BlueprintError {
  code: string
  message: string
  userMessage: string
  retryable: boolean
  suggestions: string[]
}

export interface ErrorRecoveryOptions {
  maxRetries: number
  retryDelay: number
  fallbackStrategy: 'partial' | 'simplified' | 'template'
}

export class BlueprintErrorHandler {
  private static readonly ERROR_MAPPINGS: Record<string, BlueprintError> = {
    'AI_SERVICE_TIMEOUT': {
      code: 'AI_SERVICE_TIMEOUT',
      message: 'AI service request timed out',
      userMessage: 'The AI service is taking longer than expected. Please try again.',
      retryable: true,
      suggestions: [
        'Try again in a few minutes',
        'Simplify your idea description',
        'Check your internet connection'
      ]
    },
    'AI_SERVICE_RATE_LIMIT': {
      code: 'AI_SERVICE_RATE_LIMIT',
      message: 'AI service rate limit exceeded',
      userMessage: 'Too many requests. Please wait a moment before trying again.',
      retryable: true,
      suggestions: [
        'Wait 1-2 minutes before retrying',
        'Consider upgrading your plan for higher limits'
      ]
    },
    'AI_SERVICE_UNAVAILABLE': {
      code: 'AI_SERVICE_UNAVAILABLE',
      message: 'AI service is temporarily unavailable',
      userMessage: 'The AI service is temporarily unavailable. We\'ll try again automatically.',
      retryable: true,
      suggestions: [
        'We\'ll automatically retry with a backup service',
        'Check our status page for updates'
      ]
    },
    'INVALID_RESPONSE': {
      code: 'INVALID_RESPONSE',
      message: 'AI service returned invalid response',
      userMessage: 'The AI generated an invalid response. Trying again with improved prompts.',
      retryable: true,
      suggestions: [
        'Provide more specific details about your idea',
        'Try rephrasing your idea description'
      ]
    },
    'INSUFFICIENT_CONTEXT': {
      code: 'INSUFFICIENT_CONTEXT',
      message: 'Insufficient context for blueprint generation',
      userMessage: 'Your idea needs more details for a comprehensive blueprint.',
      retryable: false,
      suggestions: [
        'Add more details about your target users',
        'Describe the main features you envision',
        'Explain the problem you\'re solving'
      ]
    },
    'GENERATION_FAILED': {
      code: 'GENERATION_FAILED',
      message: 'Blueprint generation failed',
      userMessage: 'We encountered an error generating your blueprint. Our team has been notified.',
      retryable: true,
      suggestions: [
        'Try again in a few minutes',
        'Contact support if the problem persists'
      ]
    }
  }

  static handleError(error: any): BlueprintError {
    // Handle AI service errors
    if (error.code && this.ERROR_MAPPINGS[error.code]) {
      return this.ERROR_MAPPINGS[error.code]
    }

    const errorMessage = error.message?.toLowerCase() || ''

    // Handle timeout errors
    if (errorMessage.includes('timeout') || error.code === 'TIMEOUT') {
      return this.ERROR_MAPPINGS['AI_SERVICE_TIMEOUT']
    }

    // Handle rate limit errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('rate_limit') || error.code === 'RATE_LIMIT') {
      return this.ERROR_MAPPINGS['AI_SERVICE_RATE_LIMIT']
    }

    // Handle service unavailable errors
    if (errorMessage.includes('unavailable') || error.code === 'SERVICE_UNAVAILABLE') {
      return this.ERROR_MAPPINGS['AI_SERVICE_UNAVAILABLE']
    }

    // Handle parsing/validation errors
    if (errorMessage.includes('parse') || errorMessage.includes('invalid')) {
      return this.ERROR_MAPPINGS['INVALID_RESPONSE']
    }

    // Default error
    return this.ERROR_MAPPINGS['GENERATION_FAILED']
  }

  static shouldRetry(error: BlueprintError, attemptCount: number, maxRetries: number): boolean {
    return error.retryable && attemptCount < maxRetries
  }

  static getRetryDelay(attemptCount: number, baseDelay: number = 1000): number {
    // Exponential backoff with jitter
    const exponentialDelay = baseDelay * Math.pow(2, attemptCount)
    const jitter = Math.random() * 1000
    return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: ErrorRecoveryOptions = {
      maxRetries: 3,
      retryDelay: 1000,
      fallbackStrategy: 'simplified'
    }
  ): Promise<T> {
    let lastError: any
    
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        const blueprintError = this.handleError(error)
        
        if (!this.shouldRetry(blueprintError, attempt, options.maxRetries)) {
          throw blueprintError
        }
        
        if (attempt < options.maxRetries) {
          const delay = this.getRetryDelay(attempt, options.retryDelay)
          console.log(`Retrying operation in ${delay}ms (attempt ${attempt + 1}/${options.maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw this.handleError(lastError)
  }

  static createUserFeedback(error: BlueprintError, context?: {
    projectId?: string
    section?: string
    attemptCount?: number
  }): {
    title: string
    message: string
    type: 'error' | 'warning' | 'info'
    actions: Array<{
      label: string
      action: string
      primary?: boolean
    }>
  } {
    const isRetryable = error.retryable
    const hasContext = context?.projectId && context?.section

    return {
      title: isRetryable ? 'Generation Delayed' : 'Generation Failed',
      message: error.userMessage,
      type: isRetryable ? 'warning' : 'error',
      actions: [
        ...(isRetryable ? [{
          label: 'Try Again',
          action: 'retry',
          primary: true
        }] : []),
        ...(hasContext ? [{
          label: 'Regenerate Section',
          action: 'regenerate-section'
        }] : []),
        {
          label: 'Edit Idea',
          action: 'edit-idea'
        },
        ...(error.suggestions.length > 0 ? [{
          label: 'View Suggestions',
          action: 'show-suggestions'
        }] : []),
        {
          label: 'Contact Support',
          action: 'contact-support'
        }
      ]
    }
  }

  static logError(error: BlueprintError, context: {
    userId: string
    projectId?: string
    section?: string
    originalError?: any
  }): void {
    console.error('Blueprint generation error:', {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      retryable: error.retryable,
      context,
      timestamp: new Date().toISOString(),
      originalError: context.originalError
    })

    // Here you could integrate with error tracking services like Sentry
    // Sentry.captureException(context.originalError, {
    //   tags: {
    //     errorCode: error.code,
    //     userId: context.userId,
    //     projectId: context.projectId,
    //     section: context.section
    //   }
    // })
  }
}

export interface GenerationProgress {
  projectId: string
  status: ProjectStatus
  currentStep: string
  progress: number
  estimatedTimeRemaining?: number
  error?: BlueprintError
}

export class GenerationProgressTracker {
  private static progressMap = new Map<string, GenerationProgress>()

  static updateProgress(projectId: string, update: Partial<GenerationProgress>): void {
    const current = this.progressMap.get(projectId) || {
      projectId,
      status: ProjectStatus.GENERATING,
      currentStep: 'Starting...',
      progress: 0
    }

    const updated = { ...current, ...update }
    this.progressMap.set(projectId, updated)

    // Emit progress update event (could integrate with WebSocket or Server-Sent Events)
    this.emitProgressUpdate(updated)
  }

  static getProgress(projectId: string): GenerationProgress | null {
    return this.progressMap.get(projectId) || null
  }

  static clearProgress(projectId: string): void {
    this.progressMap.delete(projectId)
  }

  private static emitProgressUpdate(progress: GenerationProgress): void {
    // This could emit to WebSocket connections or trigger Server-Sent Events
    console.log('Progress update:', progress)
    
    // Example: Emit to WebSocket
    // WebSocketManager.emit(`project:${progress.projectId}:progress`, progress)
  }
}