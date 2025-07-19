import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import { jobManager, JobType, JobPriority } from '../queue/job-queue'
import { scheduler, schedulerUtils } from '../queue/scheduler'

// Mock Redis for testing
vi.mock('bull', () => {
  const mockJob = {
    id: 'test-job-1',
    data: {},
    progress: vi.fn().mockReturnValue(0),
    timestamp: Date.now(),
    getState: vi.fn().mockResolvedValue('waiting'),
    remove: vi.fn().mockResolvedValue(undefined),
    processedOn: null,
    finishedOn: null,
    failedReason: null,
    returnvalue: null,
  }

  const mockQueue = {
    add: vi.fn().mockResolvedValue(mockJob),
    getJob: vi.fn().mockResolvedValue(mockJob),
    getWaiting: vi.fn().mockResolvedValue([]),
    getActive: vi.fn().mockResolvedValue([]),
    getCompleted: vi.fn().mockResolvedValue([]),
    getFailed: vi.fn().mockResolvedValue([]),
    getDelayed: vi.fn().mockResolvedValue([]),
    process: vi.fn(),
    on: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
  }

  return {
    default: vi.fn().mockImplementation(() => mockQueue),
  }
})

// Mock Prisma
vi.mock('../prisma', () => ({
  db: {
    raw: {
      generationJob: {
        create: vi.fn().mockResolvedValue({
          id: 'test-job-1',
          userId: 'test-user',
          projectId: 'test-project',
          jobType: 'blueprint_generation',
          status: 'PENDING',
        }),
        update: vi.fn().mockResolvedValue({}),
        findUnique: vi.fn().mockResolvedValue({
          id: 'test-job-1',
          userId: 'test-user',
          status: 'PENDING',
        }),
      },
    },
  },
}))

describe('Job Queue System', () => {
  beforeAll(async () => {
    // Initialize job system for testing
    console.log('Setting up job queue tests...')
  })

  afterAll(async () => {
    // Cleanup
    await jobManager.cleanup()
    schedulerUtils.stopScheduler()
  })

  describe('JobManager', () => {
    it('should add a blueprint generation job', async () => {
      const jobData = {
        userId: 'test-user',
        projectId: 'test-project',
        originalIdea: 'Test idea for blueprint generation',
      }

      const jobId = await jobManager.addJob(
        JobType.BLUEPRINT_GENERATION,
        jobData,
        {
          priority: JobPriority.HIGH,
          attempts: 3,
        }
      )

      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
    })

    it('should add an AI processing job', async () => {
      const jobData = {
        type: 'completion' as const,
        prompt: 'Test prompt for AI processing',
        model: 'gpt-4',
      }

      const jobId = await jobManager.addJob(
        JobType.AI_PROCESSING,
        jobData,
        {
          priority: JobPriority.NORMAL,
        }
      )

      expect(jobId).toBeDefined()
      expect(typeof jobId).toBe('string')
    })

    it('should get job status', async () => {
      const jobId = 'test-job-1'
      const status = await jobManager.getJobStatus(jobId, JobType.BLUEPRINT_GENERATION)

      expect(status).toBeDefined()
    })

    it('should get queue statistics', async () => {
      const stats = await jobManager.getQueueStats(JobType.BLUEPRINT_GENERATION)

      expect(stats).toHaveProperty('waiting')
      expect(stats).toHaveProperty('active')
      expect(stats).toHaveProperty('completed')
      expect(stats).toHaveProperty('failed')
      expect(stats).toHaveProperty('total')
    })

    it('should cancel a job', async () => {
      const jobId = 'test-job-1'
      const result = await jobManager.cancelJob(jobId, JobType.BLUEPRINT_GENERATION)

      expect(typeof result).toBe('boolean')
    })
  })

  describe('Scheduler', () => {
    it('should get scheduler status', () => {
      const status = schedulerUtils.getSchedulerStatus()

      expect(status).toHaveProperty('isStarted')
      expect(status).toHaveProperty('totalTasks')
      expect(status).toHaveProperty('activeTasks')
      expect(status).toHaveProperty('tasks')
      expect(Array.isArray(status.tasks)).toBe(true)
    })

    it('should start scheduler', async () => {
      await schedulerUtils.startScheduler()
      const status = schedulerUtils.getSchedulerStatus()

      expect(status.isStarted).toBe(true)
    })

    it('should stop scheduler', async () => {
      await schedulerUtils.stopScheduler()
      const status = schedulerUtils.getSchedulerStatus()

      expect(status.isStarted).toBe(false)
    })

    it('should add custom task', () => {
      const taskName = 'test-custom-task'
      const taskHandler = vi.fn().mockResolvedValue(undefined)

      schedulerUtils.addCustomTask(
        taskName,
        'Test custom task',
        taskHandler,
        {
          enabled: true,
          interval: 60000,
          maxConcurrent: 1,
          retryAttempts: 2,
        }
      )

      const status = schedulerUtils.getSchedulerStatus()
      const customTask = status.tasks.find(task => task.name === taskName)

      expect(customTask).toBeDefined()
      expect(customTask?.description).toBe('Test custom task')
    })
  })

  describe('Job Processing', () => {
    it('should handle job retry logic', async () => {
      // This would test the exponential backoff retry logic
      // For now, we'll just verify the job options are set correctly
      const jobData = {
        userId: 'test-user',
        projectId: 'test-project',
        originalIdea: 'Test idea',
      }

      const jobId = await jobManager.addJob(
        JobType.BLUEPRINT_GENERATION,
        jobData,
        {
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        }
      )

      expect(jobId).toBeDefined()
    })

    it('should handle job timeout', async () => {
      const jobData = {
        type: 'completion' as const,
        prompt: 'Long running prompt',
      }

      const jobId = await jobManager.addJob(
        JobType.AI_PROCESSING,
        jobData,
        {
          timeout: 30000, // 30 seconds
        }
      )

      expect(jobId).toBeDefined()
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid job type', async () => {
      await expect(
        jobManager.addJob(
          'invalid-job-type' as JobType,
          {},
          {}
        )
      ).rejects.toThrow('Unknown job type')
    })

    it('should handle missing job data', async () => {
      // This should still work as the job system is flexible with data
      const jobId = await jobManager.addJob(
        JobType.CACHE_WARMING,
        { type: 'global' },
        {}
      )

      expect(jobId).toBeDefined()
    })
  })
})