import { NextRequest, NextResponse } from 'next/server'
import { CacheMonitor } from '@/lib/cache/api-cache-middleware'
import { cacheManager } from '@/lib/cache/redis-client'

export async function GET(request: NextRequest) {
  try {
    // Get cache health status
    const healthStatus = await CacheMonitor.getHealthStatus()
    
    // Get additional cache statistics
    const stats = cacheManager.getStats()
    
    // Test cache performance
    const performanceTest = await testCachePerformance()
    
    const response = {
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      cache: {
        health: healthStatus,
        stats,
        performance: performanceTest,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    }

    return NextResponse.json(response, {
      status: healthStatus.status === 'healthy' ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

async function testCachePerformance() {
  const testData = { test: 'performance', timestamp: Date.now() }
  const iterations = 10
  
  try {
    // Test write performance
    const writeStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      await cacheManager.set(
        { prefix: 'perf', key: `test-${i}`, ttl: 60 },
        { ...testData, iteration: i }
      )
    }
    const writeTime = Date.now() - writeStart
    
    // Test read performance
    const readStart = Date.now()
    for (let i = 0; i < iterations; i++) {
      await cacheManager.get({ prefix: 'perf', key: `test-${i}` })
    }
    const readTime = Date.now() - readStart
    
    // Cleanup test data
    for (let i = 0; i < iterations; i++) {
      await cacheManager.del({ prefix: 'perf', key: `test-${i}` })
    }
    
    return {
      writeTime: `${writeTime}ms`,
      readTime: `${readTime}ms`,
      avgWriteTime: `${(writeTime / iterations).toFixed(2)}ms`,
      avgReadTime: `${(readTime / iterations).toFixed(2)}ms`,
      iterations,
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Performance test failed',
    }
  }
}