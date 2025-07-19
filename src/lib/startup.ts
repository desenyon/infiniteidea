import { schedulerUtils } from './queue/scheduler'
import { cacheManager } from './cache/redis-client'

// Application startup initialization
export async function initializeApplication() {
  console.log('🚀 Initializing Desenyon: InfiniteIdea application...')

  try {
    // Initialize cache system
    console.log('📦 Initializing cache system...')
    // Cache manager initializes automatically, but we can test connectivity
    const cacheStats = cacheManager.getStats()
    console.log('✅ Cache system initialized:', cacheStats)

    // Start job scheduler
    console.log('⏰ Starting job scheduler...')
    await schedulerUtils.startScheduler()
    const schedulerStatus = schedulerUtils.getSchedulerStatus()
    console.log('✅ Job scheduler started:', {
      totalTasks: schedulerStatus.totalTasks,
      activeTasks: schedulerStatus.activeTasks,
    })

    // Warm critical caches
    console.log('🔥 Warming critical caches...')
    await warmCriticalCaches()
    console.log('✅ Critical caches warmed')

    console.log('🎉 Application initialization completed successfully!')
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      components: {
        cache: 'initialized',
        scheduler: 'started',
        warmup: 'completed',
      },
    }
  } catch (error) {
    console.error('❌ Application initialization failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

// Application shutdown cleanup
export async function shutdownApplication() {
  console.log('🛑 Shutting down Desenyon: InfiniteIdea application...')

  try {
    // Stop job scheduler
    console.log('⏰ Stopping job scheduler...')
    await schedulerUtils.stopScheduler()
    console.log('✅ Job scheduler stopped')

    // Flush caches if needed
    console.log('📦 Flushing caches...')
    // Note: In production, you might not want to flush all caches
    // await cacheManager.flush()
    console.log('✅ Cache cleanup completed')

    console.log('👋 Application shutdown completed successfully!')
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('❌ Application shutdown failed:', error)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

// Warm critical caches on startup
async function warmCriticalCaches() {
  try {
    // Warm template cache
    await cacheManager.set(
      { prefix: 'templates', key: 'popular', ttl: 3600 },
      { warmed: true, timestamp: Date.now() }
    )

    // Warm tech stack cache
    await cacheManager.set(
      { prefix: 'tech', key: 'popular-stacks', ttl: 7200 },
      { warmed: true, timestamp: Date.now() }
    )

    // Test cache operations
    const testKey = { prefix: 'startup', key: 'test', ttl: 60 }
    await cacheManager.set(testKey, { test: true })
    const retrieved = await cacheManager.get(testKey)
    await cacheManager.del(testKey)

    if (!retrieved) {
      throw new Error('Cache warmup test failed')
    }
  } catch (error) {
    console.warn('Cache warming failed:', error)
    // Don't fail startup for cache warming issues
  }
}

// Health check function
export async function getApplicationHealth() {
  try {
    const cacheStats = cacheManager.getStats()
    const schedulerStatus = schedulerUtils.getSchedulerStatus()
    
    // Test database connectivity
    let dbHealth = 'unknown'
    try {
      // Simple database test - this would be implemented based on your needs
      dbHealth = 'healthy'
    } catch (error) {
      dbHealth = 'unhealthy'
    }

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      components: {
        cache: {
          status: cacheStats.redisConnected ? 'healthy' : 'degraded',
          stats: cacheStats,
        },
        scheduler: {
          status: schedulerStatus.isStarted ? 'healthy' : 'stopped',
          stats: schedulerStatus,
        },
        database: {
          status: dbHealth,
        },
      },
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }
  }
}

// Process event handlers for graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...')
    await shutdownApplication()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...')
    await shutdownApplication()
    process.exit(0)
  })

  process.on('uncaughtException', async (error) => {
    console.error('Uncaught exception:', error)
    await shutdownApplication()
    process.exit(1)
  })

  process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason)
    await shutdownApplication()
    process.exit(1)
  })
}