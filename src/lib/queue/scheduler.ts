import { jobManager, JobType, JobPriority } from './job-queue'
import { cacheManager } from '../cache/redis-client'

// Scheduler configuration
export interface ScheduleConfig {
  enabled: boolean
  interval: number // in milliseconds
  maxConcurrent: number
  retryAttempts: number
}

// Default schedule configurations
const DEFAULT_SCHEDULES: Record<string, ScheduleConfig> = {
  cacheCleanup: {
    enabled: true,
    interval: 60 * 60 * 1000, // 1 hour
    maxConcurrent: 1,
    retryAttempts: 2,
  },
  analyticsProcessing: {
    enabled: true,
    interval: 30 * 60 * 1000, // 30 minutes
    maxConcurrent: 2,
    retryAttempts: 3,
  },
  jobCleanup: {
    enabled: true,
    interval: 24 * 60 * 60 * 1000, // 24 hours
    maxConcurrent: 1,
    retryAttempts: 1,
  },
  cacheWarming: {
    enabled: true,
    interval: 15 * 60 * 1000, // 15 minutes
    maxConcurrent: 3,
    retryAttempts: 2,
  },
}

// Scheduled task definitions
export interface ScheduledTask {
  name: string
  description: string
  schedule: ScheduleConfig
  handler: () => Promise<void>
  lastRun?: Date
  nextRun?: Date
  isRunning: boolean
}

export class JobScheduler {
  private static instance: JobScheduler
  private tasks: Map<string, ScheduledTask> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private isStarted = false

  private constructor() {
    this.initializeTasks()
  }

  static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler()
    }
    return JobScheduler.instance
  }

  private initializeTasks() {
    // Cache cleanup task
    this.addTask({
      name: 'cacheCleanup',
      description: 'Clean up expired cache entries',
      schedule: DEFAULT_SCHEDULES.cacheCleanup,
      isRunning: false,
      handler: async () => {
        console.log('Running cache cleanup task...')
        
        await jobManager.addJob(
          JobType.CLEANUP_TASKS,
          {
            type: 'expired_cache',
            olderThan: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours
            batchSize: 1000,
          },
          {
            priority: JobPriority.LOW,
            attempts: 2,
          }
        )
        
        console.log('Cache cleanup task scheduled')
      },
    })

    // Analytics processing task
    this.addTask({
      name: 'analyticsProcessing',
      description: 'Process analytics data aggregation',
      schedule: DEFAULT_SCHEDULES.analyticsProcessing,
      isRunning: false,
      handler: async () => {
        console.log('Running analytics processing task...')
        
        const now = new Date()
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
        
        await jobManager.addJob(
          JobType.ANALYTICS_PROCESSING,
          {
            eventType: 'all',
            timeRange: {
              start: oneHourAgo,
              end: now,
            },
            aggregationType: 'hourly',
          },
          {
            priority: JobPriority.NORMAL,
            attempts: 3,
          }
        )
        
        console.log('Analytics processing task scheduled')
      },
    })

    // Job cleanup task
    this.addTask({
      name: 'jobCleanup',
      description: 'Clean up old completed and failed jobs',
      schedule: DEFAULT_SCHEDULES.jobCleanup,
      isRunning: false,
      handler: async () => {
        console.log('Running job cleanup task...')
        
        await jobManager.addJob(
          JobType.CLEANUP_TASKS,
          {
            type: 'old_jobs',
            olderThan: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days
            batchSize: 500,
          },
          {
            priority: JobPriority.LOW,
            attempts: 1,
          }
        )
        
        console.log('Job cleanup task scheduled')
      },
    })

    // Cache warming task
    this.addTask({
      name: 'cacheWarming',
      description: 'Warm frequently accessed cache entries',
      schedule: DEFAULT_SCHEDULES.cacheWarming,
      isRunning: false,
      handler: async () => {
        console.log('Running cache warming task...')
        
        // Get cache statistics to identify what needs warming
        const stats = cacheManager.getStats()
        
        await jobManager.addJob(
          JobType.CACHE_WARMING,
          {
            type: 'global',
            patterns: ['user:*', 'project:*', 'blueprint:*'],
          },
          {
            priority: JobPriority.LOW,
            attempts: 2,
          }
        )
        
        console.log('Cache warming task scheduled')
      },
    })
  }

  addTask(task: ScheduledTask) {
    this.tasks.set(task.name, task)
    
    if (this.isStarted && task.schedule.enabled) {
      this.scheduleTask(task.name)
    }
  }

  removeTask(name: string) {
    const timer = this.timers.get(name)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(name)
    }
    this.tasks.delete(name)
  }

  updateTaskSchedule(name: string, schedule: Partial<ScheduleConfig>) {
    const task = this.tasks.get(name)
    if (task) {
      task.schedule = { ...task.schedule, ...schedule }
      
      // Reschedule if running
      if (this.isStarted && task.schedule.enabled) {
        this.rescheduleTask(name)
      }
    }
  }

  private scheduleTask(name: string) {
    const task = this.tasks.get(name)
    if (!task || !task.schedule.enabled) {
      return
    }

    // Clear existing timer
    const existingTimer = this.timers.get(name)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Calculate next run time
    const nextRun = new Date(Date.now() + task.schedule.interval)
    task.nextRun = nextRun

    // Schedule the task
    const timer = setTimeout(async () => {
      await this.executeTask(name)
      // Reschedule for next run
      this.scheduleTask(name)
    }, task.schedule.interval)

    this.timers.set(name, timer)
    console.log(`Task ${name} scheduled for ${nextRun.toISOString()}`)
  }

  private rescheduleTask(name: string) {
    const timer = this.timers.get(name)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(name)
    }
    this.scheduleTask(name)
  }

  private async executeTask(name: string) {
    const task = this.tasks.get(name)
    if (!task || task.isRunning) {
      return
    }

    console.log(`Executing scheduled task: ${name}`)
    
    task.isRunning = true
    task.lastRun = new Date()

    try {
      await task.handler()
      console.log(`Task ${name} completed successfully`)
    } catch (error) {
      console.error(`Task ${name} failed:`, error)
      
      // Implement retry logic if needed
      if (task.schedule.retryAttempts > 0) {
        console.log(`Retrying task ${name} in 5 minutes...`)
        setTimeout(() => {
          this.executeTask(name)
        }, 5 * 60 * 1000) // 5 minutes
      }
    } finally {
      task.isRunning = false
    }
  }

  start() {
    if (this.isStarted) {
      console.log('Scheduler is already started')
      return
    }

    console.log('Starting job scheduler...')
    this.isStarted = true

    // Schedule all enabled tasks
    for (const [name, task] of this.tasks) {
      if (task.schedule.enabled) {
        this.scheduleTask(name)
      }
    }

    console.log(`Scheduler started with ${this.tasks.size} tasks`)
  }

  stop() {
    if (!this.isStarted) {
      console.log('Scheduler is not running')
      return
    }

    console.log('Stopping job scheduler...')
    this.isStarted = false

    // Clear all timers
    for (const [name, timer] of this.timers) {
      clearTimeout(timer)
      console.log(`Cleared timer for task: ${name}`)
    }
    this.timers.clear()

    console.log('Scheduler stopped')
  }

  getStatus() {
    const taskStatuses = Array.from(this.tasks.entries()).map(([name, task]) => ({
      name,
      description: task.description,
      enabled: task.schedule.enabled,
      interval: task.schedule.interval,
      lastRun: task.lastRun,
      nextRun: task.nextRun,
      isRunning: task.isRunning,
    }))

    return {
      isStarted: this.isStarted,
      totalTasks: this.tasks.size,
      activeTasks: Array.from(this.tasks.values()).filter(t => t.schedule.enabled).length,
      runningTasks: Array.from(this.tasks.values()).filter(t => t.isRunning).length,
      tasks: taskStatuses,
    }
  }

  // Manual task execution
  async executeTaskNow(name: string) {
    const task = this.tasks.get(name)
    if (!task) {
      throw new Error(`Task ${name} not found`)
    }

    if (task.isRunning) {
      throw new Error(`Task ${name} is already running`)
    }

    await this.executeTask(name)
  }
}

// Export singleton instance
export const scheduler = JobScheduler.getInstance()

// Utility functions
export const schedulerUtils = {
  // Start scheduler on application startup
  async startScheduler() {
    scheduler.start()
  },

  // Stop scheduler on application shutdown
  async stopScheduler() {
    scheduler.stop()
  },

  // Get scheduler status
  getSchedulerStatus() {
    return scheduler.getStatus()
  },

  // Execute a task manually
  async runTaskNow(taskName: string) {
    return scheduler.executeTaskNow(taskName)
  },

  // Add a custom scheduled task
  addCustomTask(
    name: string,
    description: string,
    handler: () => Promise<void>,
    schedule: ScheduleConfig
  ) {
    scheduler.addTask({
      name,
      description,
      schedule,
      handler,
      isRunning: false,
    })
  },
}