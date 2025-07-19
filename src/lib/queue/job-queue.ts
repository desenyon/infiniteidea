import Queue from 'bull'
import { db } from '@/lib/prisma'
import { JobStatus } from '@prisma/client'

// Job types
export enum JobType {
  BLUEPRINT_GENERATION = 'blueprint_generation',
  AI_PROCESSING = 'ai_processing',
  EXPORT_GENERATION = 'export_generation',
  CACHE_WARMING = 'cache_warming',
  ANALYTICS_PROCESSING = 'analytics_processing',
  CLEANUP_TASKS = 'cleanup_tasks',
}

// Job priorities
export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
}

// Job data interfaces
export interface BlueprintGenerationJobData {
  userId: string
  projectId: string
  originalIdea: string
  preferences?: any
  regenerateSection?: string
}

export interface AIProcessingJobData {
  type: 'completion' | 'embedding' | 'analysis'
  prompt: string
  model?: string
  parameters?: any
  userId?: string
  projectId?: string
}

export interface ExportGenerationJobData {
  projectId: string
  userId: string
  format: 'pdf' | 'markdown' | 'json' | 'docx'
  sections?: string[]
}

export interface CacheWarmingJobData {
  type: 'user' | 'project' | 'global'
  targetId?: string
  patterns?: string[]
}

export interface AnalyticsProcessingJobData {
  eventType: string
  timeRange: {
    start: Date
    end: Date
  }
  aggregationType: 'hourly' | 'daily' | 'weekly'
}

export interface CleanupJobData {
  type: 'expired_cache' | 'old_jobs' | 'temp_files'
  olderThan?: Date
  batchSize?: number
}

// Union type for all job data
export type JobData = 
  | BlueprintGenerationJobData
  | AIProcessingJobData
  | ExportGenerationJobData
  | CacheWarmingJobData
  | AnalyticsProcessingJobData
  | CleanupJobData

// Job options
export interface JobOptions {
  priority?: JobPriority
  delay?: number
  attempts?: number
  backoff?: {
    type: 'fixed' | 'exponential'
    delay: number
  }
  removeOnComplete?: number
  removeOnFail?: number
  timeout?: number
}

// Job result interface
export interface JobResult {
  success: boolean
  data?: any
  error?: string
  duration?: number
  metadata?: any
}

// Queue configuration
const REDIS_CONFIG = {
  redis: {
    port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD,
    db: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB) : 0,
  },
}

// Create queues for different job types
export const queues = {
  blueprint: new Queue<BlueprintGenerationJobData>('blueprint-generation', REDIS_CONFIG),
  ai: new Queue<AIProcessingJobData>('ai-processing', REDIS_CONFIG),
  export: new Queue<ExportGenerationJobData>('export-generation', REDIS_CONFIG),
  cache: new Queue<CacheWarmingJobData>('cache-warming', REDIS_CONFIG),
  analytics: new Queue<AnalyticsProcessingJobData>('analytics-processing', REDIS_CONFIG),
  cleanup: new Queue<CleanupJobData>('cleanup-tasks', REDIS_CONFIG),
}

// Job manager class
export class JobManager {
  private static instance: JobManager
  private queues = queues

  private constructor() {
    this.setupJobProcessors()
    this.setupEventListeners()
  }

  static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager()
    }
    return JobManager.instance
  }

  // Add job to queue
  async addJob<T extends JobData>(
    type: JobType,
    data: T,
    options: JobOptions = {}
  ): Promise<string> {
    const defaultOptions: JobOptions = {
      priority: JobPriority.NORMAL,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
      timeout: 300000, // 5 minutes
    }

    const jobOptions = { ...defaultOptions, ...options }
    
    let queue: Queue<any>
    let jobId: string

    switch (type) {
      case JobType.BLUEPRINT_GENERATION:
        queue = this.queues.blueprint
        // Create database record for tracking
        const blueprintJob = await db.raw.generationJob.create({
          data: {
            userId: (data as BlueprintGenerationJobData).userId,
            projectId: (data as BlueprintGenerationJobData).projectId,
            jobType: type,
            status: JobStatus.PENDING,
            inputData: data as any,
            priority: jobOptions.priority || JobPriority.NORMAL,
            maxRetries: jobOptions.attempts || 3,
          },
        })
        jobId = blueprintJob.id
        break
        
      case JobType.AI_PROCESSING:
        queue = this.queues.ai
        jobId = `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        break
        
      case JobType.EXPORT_GENERATION:
        queue = this.queues.export
        jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        break
        
      case JobType.CACHE_WARMING:
        queue = this.queues.cache
        jobId = `cache-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        break
        
      case JobType.ANALYTICS_PROCESSING:
        queue = this.queues.analytics
        jobId = `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        break
        
      case JobType.CLEANUP_TASKS:
        queue = this.queues.cleanup
        jobId = `cleanup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        break
        
      default:
        throw new Error(`Unknown job type: ${type}`)
    }

    const job = await queue.add(data, {
      ...jobOptions,
      jobId,
    })

    console.log(`Job ${jobId} added to ${type} queue`)
    return job.id as string
  }

  // Get job status
  async getJobStatus(jobId: string, type: JobType): Promise<any> {
    let queue: Queue<any>
    
    switch (type) {
      case JobType.BLUEPRINT_GENERATION:
        queue = this.queues.blueprint
        // Also check database record
        const dbJob = await db.raw.generationJob.findUnique({
          where: { id: jobId },
        })
        break
      case JobType.AI_PROCESSING:
        queue = this.queues.ai
        break
      case JobType.EXPORT_GENERATION:
        queue = this.queues.export
        break
      case JobType.CACHE_WARMING:
        queue = this.queues.cache
        break
      case JobType.ANALYTICS_PROCESSING:
        queue = this.queues.analytics
        break
      case JobType.CLEANUP_TASKS:
        queue = this.queues.cleanup
        break
      default:
        throw new Error(`Unknown job type: ${type}`)
    }

    const job = await queue.getJob(jobId)
    if (!job) {
      return null
    }

    return {
      id: job.id,
      data: job.data,
      progress: job.progress(),
      state: await job.getState(),
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : null,
      finishedAt: job.finishedOn ? new Date(job.finishedOn) : null,
      failedReason: job.failedReason,
      returnValue: job.returnvalue,
    }
  }

  // Cancel job
  async cancelJob(jobId: string, type: JobType): Promise<boolean> {
    try {
      let queue: Queue<any>
      
      switch (type) {
        case JobType.BLUEPRINT_GENERATION:
          queue = this.queues.blueprint
          // Update database record
          await db.raw.generationJob.update({
            where: { id: jobId },
            data: { status: JobStatus.CANCELLED },
          })
          break
        case JobType.AI_PROCESSING:
          queue = this.queues.ai
          break
        case JobType.EXPORT_GENERATION:
          queue = this.queues.export
          break
        case JobType.CACHE_WARMING:
          queue = this.queues.cache
          break
        case JobType.ANALYTICS_PROCESSING:
          queue = this.queues.analytics
          break
        case JobType.CLEANUP_TASKS:
          queue = this.queues.cleanup
          break
        default:
          throw new Error(`Unknown job type: ${type}`)
      }

      const job = await queue.getJob(jobId)
      if (job) {
        await job.remove()
        return true
      }
      return false
    } catch (error) {
      console.error(`Error canceling job ${jobId}:`, error)
      return false
    }
  }

  // Get queue statistics
  async getQueueStats(type: JobType) {
    let queue: Queue<any>
    
    switch (type) {
      case JobType.BLUEPRINT_GENERATION:
        queue = this.queues.blueprint
        break
      case JobType.AI_PROCESSING:
        queue = this.queues.ai
        break
      case JobType.EXPORT_GENERATION:
        queue = this.queues.export
        break
      case JobType.CACHE_WARMING:
        queue = this.queues.cache
        break
      case JobType.ANALYTICS_PROCESSING:
        queue = this.queues.analytics
        break
      case JobType.CLEANUP_TASKS:
        queue = this.queues.cleanup
        break
      default:
        throw new Error(`Unknown job type: ${type}`)
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaiting(),
      queue.getActive(),
      queue.getCompleted(),
      queue.getFailed(),
      queue.getDelayed(),
    ])

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length,
    }
  }

  // Setup job processors
  private setupJobProcessors() {
    // Blueprint generation processor
    this.queues.blueprint.process(async (job) => {
      const { userId, projectId, originalIdea, preferences, regenerateSection } = job.data
      
      try {
        // Update job status in database
        await db.raw.generationJob.update({
          where: { id: job.id as string },
          data: {
            status: JobStatus.RUNNING,
            startedAt: new Date(),
            currentStep: 'Initializing blueprint generation',
          },
        })

        // Simulate blueprint generation process
        job.progress(10)
        await this.updateJobProgress(job.id as string, 10, 'Processing idea input')
        
        // Here you would integrate with your actual AI services
        // For now, we'll simulate the process
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        job.progress(30)
        await this.updateJobProgress(job.id as string, 30, 'Generating product plan')
        
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        job.progress(60)
        await this.updateJobProgress(job.id as string, 60, 'Creating technical architecture')
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        job.progress(80)
        await this.updateJobProgress(job.id as string, 80, 'Finalizing blueprint')
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        job.progress(100)
        
        // Update job completion in database
        await db.raw.generationJob.update({
          where: { id: job.id as string },
          data: {
            status: JobStatus.COMPLETED,
            completedAt: new Date(),
            progress: 100,
            currentStep: 'Blueprint generation completed',
            outputData: {
              blueprintId: `blueprint-${Date.now()}`,
              generatedAt: new Date(),
            },
          },
        })

        return {
          success: true,
          blueprintId: `blueprint-${Date.now()}`,
          duration: Date.now() - job.timestamp,
        }
      } catch (error) {
        // Update job failure in database
        await db.raw.generationJob.update({
          where: { id: job.id as string },
          data: {
            status: JobStatus.FAILED,
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
          },
        })
        
        throw error
      }
    })

    // AI processing processor
    this.queues.ai.process(async (job) => {
      const { type, prompt, model, parameters } = job.data
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        result: `Processed ${type} request`,
        model: model || 'default',
        duration: Date.now() - job.timestamp,
      }
    })

    // Export generation processor
    this.queues.export.process(async (job) => {
      const { projectId, userId, format, sections } = job.data
      
      // Simulate export generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return {
        success: true,
        exportUrl: `https://example.com/exports/${projectId}.${format}`,
        format,
        duration: Date.now() - job.timestamp,
      }
    })

    // Cache warming processor
    this.queues.cache.process(async (job) => {
      const { type, targetId, patterns } = job.data
      
      // Simulate cache warming
      await new Promise(resolve => setTimeout(resolve, 500))
      
      return {
        success: true,
        warmedItems: patterns?.length || 1,
        duration: Date.now() - job.timestamp,
      }
    })

    // Analytics processing processor
    this.queues.analytics.process(async (job) => {
      const { eventType, timeRange, aggregationType } = job.data
      
      // Simulate analytics processing
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      return {
        success: true,
        processedEvents: Math.floor(Math.random() * 1000),
        aggregationType,
        duration: Date.now() - job.timestamp,
      }
    })

    // Cleanup tasks processor
    this.queues.cleanup.process(async (job) => {
      const { type, olderThan, batchSize } = job.data
      
      // Simulate cleanup
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return {
        success: true,
        cleanedItems: batchSize || 100,
        type,
        duration: Date.now() - job.timestamp,
      }
    })
  }

  // Setup event listeners
  private setupEventListeners() {
    Object.entries(this.queues).forEach(([name, queue]) => {
      queue.on('completed', (job, result) => {
        console.log(`Job ${job.id} in ${name} queue completed:`, result)
      })

      queue.on('failed', (job, err) => {
        console.error(`Job ${job.id} in ${name} queue failed:`, err.message)
      })

      queue.on('stalled', (job) => {
        console.warn(`Job ${job.id} in ${name} queue stalled`)
      })

      queue.on('progress', (job, progress) => {
        console.log(`Job ${job.id} in ${name} queue progress: ${progress}%`)
      })
    })
  }

  // Helper method to update job progress in database
  private async updateJobProgress(jobId: string, progress: number, currentStep: string) {
    try {
      await db.raw.generationJob.update({
        where: { id: jobId },
        data: {
          progress,
          currentStep,
        },
      })
    } catch (error) {
      console.warn(`Failed to update job progress for ${jobId}:`, error)
    }
  }

  // Cleanup method
  async cleanup() {
    await Promise.all(
      Object.values(this.queues).map(queue => queue.close())
    )
  }
}

// Export singleton instance
export const jobManager = JobManager.getInstance()

// Utility functions
export const jobUtils = {
  // Schedule recurring cleanup job
  async scheduleCleanupJob() {
    return jobManager.addJob(
      JobType.CLEANUP_TASKS,
      {
        type: 'expired_cache',
        olderThan: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        batchSize: 1000,
      },
      {
        priority: JobPriority.LOW,
        delay: 60000, // 1 minute delay
      }
    )
  },

  // Schedule cache warming
  async scheduleCacheWarming(userId: string) {
    return jobManager.addJob(
      JobType.CACHE_WARMING,
      {
        type: 'user',
        targetId: userId,
      },
      {
        priority: JobPriority.NORMAL,
      }
    )
  },

  // Get all queue statistics
  async getAllQueueStats() {
    const stats = {}
    for (const type of Object.values(JobType)) {
      stats[type] = await jobManager.getQueueStats(type)
    }
    return stats
  },
}