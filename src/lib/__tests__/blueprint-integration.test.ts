import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BlueprintErrorHandler, GenerationProgressTracker } from '../blueprint-error-handler'
import { ProjectStatus } from '@/types'

describe('Blueprint Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('BlueprintErrorHandler', () => {
    it('should handle AI service timeout errors', () => {
      const error = new Error('Request timeout')
      error.code = 'TIMEOUT'
      
      const blueprintError = BlueprintErrorHandler.handleError(error)
      
      expect(blueprintError.code).toBe('AI_SERVICE_TIMEOUT')
      expect(blueprintError.retryable).toBe(true)
      expect(blueprintError.userMessage).toContain('taking longer than expected')
    })

    it('should handle rate limit errors', () => {
      const error = new Error('Rate limit exceeded')
      
      const blueprintError = BlueprintErrorHandler.handleError(error)
      
      expect(blueprintError.code).toBe('AI_SERVICE_RATE_LIMIT')
      expect(blueprintError.retryable).toBe(true)
      expect(blueprintError.suggestions).toContain('Wait 1-2 minutes before retrying')
    })

    it('should handle parsing errors', () => {
      const error = new Error('Failed to parse JSON response')
      
      const blueprintError = BlueprintErrorHandler.handleError(error)
      
      expect(blueprintError.code).toBe('INVALID_RESPONSE')
      expect(blueprintError.retryable).toBe(true)
    })

    it('should determine retry eligibility correctly', () => {
      const retryableError = {
        code: 'AI_SERVICE_TIMEOUT',
        message: 'Timeout',
        userMessage: 'Timeout occurred',
        retryable: true,
        suggestions: []
      }
      
      const nonRetryableError = {
        code: 'INSUFFICIENT_CONTEXT',
        message: 'Not enough context',
        userMessage: 'Need more details',
        retryable: false,
        suggestions: []
      }
      
      expect(BlueprintErrorHandler.shouldRetry(retryableError, 1, 3)).toBe(true)
      expect(BlueprintErrorHandler.shouldRetry(retryableError, 3, 3)).toBe(false)
      expect(BlueprintErrorHandler.shouldRetry(nonRetryableError, 1, 3)).toBe(false)
    })

    it('should calculate exponential backoff delay', () => {
      const delay1 = BlueprintErrorHandler.getRetryDelay(0, 1000)
      const delay2 = BlueprintErrorHandler.getRetryDelay(1, 1000)
      const delay3 = BlueprintErrorHandler.getRetryDelay(2, 1000)
      
      expect(delay1).toBeGreaterThanOrEqual(1000)
      expect(delay1).toBeLessThan(3000)
      
      expect(delay2).toBeGreaterThanOrEqual(2000)
      expect(delay2).toBeLessThan(5000)
      
      expect(delay3).toBeGreaterThanOrEqual(4000)
      expect(delay3).toBeLessThan(8000)
    })

    it('should create appropriate user feedback', () => {
      const error = {
        code: 'AI_SERVICE_TIMEOUT',
        message: 'Timeout',
        userMessage: 'Service is taking too long',
        retryable: true,
        suggestions: ['Try again', 'Check connection']
      }
      
      const feedback = BlueprintErrorHandler.createUserFeedback(error, {
        projectId: 'test-project',
        section: 'productPlan'
      })
      
      expect(feedback.title).toBe('Generation Delayed')
      expect(feedback.type).toBe('warning')
      expect(feedback.actions.some(action => action.label === 'Try Again')).toBe(true)
      expect(feedback.actions.some(action => action.label === 'Regenerate Section')).toBe(true)
    })
  })

  describe('GenerationProgressTracker', () => {
    it('should update and retrieve progress', () => {
      const projectId = 'test-project-123'
      
      GenerationProgressTracker.updateProgress(projectId, {
        status: ProjectStatus.GENERATING,
        currentStep: 'Analyzing idea...',
        progress: 25
      })
      
      const progress = GenerationProgressTracker.getProgress(projectId)
      
      expect(progress).toBeDefined()
      expect(progress?.projectId).toBe(projectId)
      expect(progress?.status).toBe(ProjectStatus.GENERATING)
      expect(progress?.currentStep).toBe('Analyzing idea...')
      expect(progress?.progress).toBe(25)
    })

    it('should clear progress', () => {
      const projectId = 'test-project-456'
      
      GenerationProgressTracker.updateProgress(projectId, {
        status: ProjectStatus.GENERATING,
        currentStep: 'Starting...',
        progress: 0
      })
      
      expect(GenerationProgressTracker.getProgress(projectId)).toBeDefined()
      
      GenerationProgressTracker.clearProgress(projectId)
      
      expect(GenerationProgressTracker.getProgress(projectId)).toBeNull()
    })

    it('should handle multiple projects', () => {
      const project1 = 'project-1'
      const project2 = 'project-2'
      
      GenerationProgressTracker.updateProgress(project1, {
        status: ProjectStatus.GENERATING,
        currentStep: 'Step 1',
        progress: 10
      })
      
      GenerationProgressTracker.updateProgress(project2, {
        status: ProjectStatus.GENERATING,
        currentStep: 'Step 2',
        progress: 20
      })
      
      const progress1 = GenerationProgressTracker.getProgress(project1)
      const progress2 = GenerationProgressTracker.getProgress(project2)
      
      expect(progress1?.currentStep).toBe('Step 1')
      expect(progress1?.progress).toBe(10)
      
      expect(progress2?.currentStep).toBe('Step 2')
      expect(progress2?.progress).toBe(20)
    })
  })

  describe('Error Recovery with Retry', () => {
    it('should retry failed operations', async () => {
      let attemptCount = 0
      const mockOperation = vi.fn().mockImplementation(() => {
        attemptCount++
        if (attemptCount < 3) {
          const error = new Error('Temporary failure')
          error.code = 'AI_SERVICE_TIMEOUT'
          throw error
        }
        return 'success'
      })

      const result = await BlueprintErrorHandler.withRetry(mockOperation, {
        maxRetries: 3,
        retryDelay: 10, // Short delay for testing
        fallbackStrategy: 'simplified'
      })

      expect(result).toBe('success')
      expect(mockOperation).toHaveBeenCalledTimes(3)
    })

    it('should fail after max retries', async () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        const error = new Error('Persistent failure')
        error.code = 'AI_SERVICE_TIMEOUT'
        throw error
      })

      await expect(
        BlueprintErrorHandler.withRetry(mockOperation, {
          maxRetries: 2,
          retryDelay: 10,
          fallbackStrategy: 'simplified'
        })
      ).rejects.toMatchObject({
        code: 'AI_SERVICE_TIMEOUT',
        retryable: true
      })

      expect(mockOperation).toHaveBeenCalledTimes(3) // Initial + 2 retries
    })

    it('should not retry non-retryable errors', async () => {
      const mockOperation = vi.fn().mockImplementation(() => {
        const error = new Error('Insufficient context')
        error.code = 'INSUFFICIENT_CONTEXT'
        throw error
      })

      await expect(
        BlueprintErrorHandler.withRetry(mockOperation, {
          maxRetries: 3,
          retryDelay: 10,
          fallbackStrategy: 'simplified'
        })
      ).rejects.toMatchObject({
        code: 'INSUFFICIENT_CONTEXT',
        retryable: false
      })

      expect(mockOperation).toHaveBeenCalledTimes(1) // No retries
    })
  })
})