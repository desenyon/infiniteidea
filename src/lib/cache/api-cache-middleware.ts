import { NextRequest, NextResponse } from 'next/server'
import { cacheManager, cacheUtils, CACHE_PREFIXES, CacheKey } from './redis-client'

// Cache configuration for different API routes
export const API_CACHE_CONFIG = {
  // Static data with long cache times
  templates: { ttl: 3600, browserCache: 1800 }, // 1 hour server, 30 min browser
  techStack: { ttl: 7200, browserCache: 3600 }, // 2 hours server, 1 hour browser
  
  // Dynamic data with shorter cache times
  projects: { ttl: 600, browserCache: 300 }, // 10 min server, 5 min browser
  user: { ttl: 300, browserCache: 60 }, // 5 min server, 1 min browser
  
  // AI responses with medium cache times
  aiResponse: { ttl: 1800, browserCache: 900 }, // 30 min server, 15 min browser
  
  // Analytics with longer cache times
  analytics: { ttl: 3600, browserCache: 1800 }, // 1 hour server, 30 min browser
} as const

export interface CacheOptions {
  ttl?: number
  browserCache?: number
  tags?: string[]
  vary?: string[]
  staleWhileRevalidate?: number
}

export interface CachedResponse<T = any> {
  data: T
  timestamp: number
  etag: string
  headers?: Record<string, string>
}

// Generate ETag for response data
function generateETag(data: any): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data)
  return `"${Buffer.from(content).toString('base64').slice(0, 16)}"`
}

// Check if request has matching ETag
function hasMatchingETag(request: NextRequest, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match')
  return ifNoneMatch === etag
}

// Set cache headers on response
function setCacheHeaders(
  response: NextResponse,
  options: CacheOptions,
  etag: string
): NextResponse {
  const { browserCache = 0, staleWhileRevalidate = 0, vary = [] } = options

  // Set ETag
  response.headers.set('ETag', etag)

  // Set Cache-Control
  if (browserCache > 0) {
    const cacheControl = [
      `max-age=${browserCache}`,
      staleWhileRevalidate > 0 ? `stale-while-revalidate=${staleWhileRevalidate}` : '',
      'public',
    ].filter(Boolean).join(', ')
    
    response.headers.set('Cache-Control', cacheControl)
  } else {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  }

  // Set Vary headers
  if (vary.length > 0) {
    response.headers.set('Vary', vary.join(', '))
  }

  // Set Last-Modified
  response.headers.set('Last-Modified', new Date().toUTCString())

  return response
}

// API Cache Middleware
export function withCache(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheKey: string,
  options: CacheOptions = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const method = request.method
    const url = new URL(request.url)
    
    // Only cache GET requests
    if (method !== 'GET') {
      return handler(request)
    }

    // Build cache key with query parameters
    const queryString = url.searchParams.toString()
    const fullCacheKey: CacheKey = {
      prefix: CACHE_PREFIXES.AI_RESPONSE,
      key: `${cacheKey}:${queryString}`,
      ttl: options.ttl,
    }

    try {
      // Check cache first
      const cached = await cacheManager.get<CachedResponse>(fullCacheKey)
      
      if (cached) {
        // Check ETag for 304 Not Modified
        if (hasMatchingETag(request, cached.etag)) {
          const notModifiedResponse = new NextResponse(null, { status: 304 })
          return setCacheHeaders(notModifiedResponse, options, cached.etag)
        }

        // Return cached response
        const response = NextResponse.json(cached.data)
        return setCacheHeaders(response, options, cached.etag)
      }

      // Execute handler
      const response = await handler(request)
      
      // Only cache successful responses
      if (response.status === 200) {
        const responseData = await response.clone().json()
        const etag = generateETag(responseData)
        
        // Store in cache
        const cachedResponse: CachedResponse = {
          data: responseData,
          timestamp: Date.now(),
          etag,
        }
        
        await cacheManager.set(fullCacheKey, cachedResponse)
        
        // Set cache headers
        return setCacheHeaders(response, options, etag)
      }

      return response
    } catch (error) {
      console.warn('Cache middleware error:', error)
      return handler(request)
    }
  }
}

// Rate limiting middleware with caching
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: {
    maxRequests?: number
    windowMs?: number
    keyGenerator?: (request: NextRequest) => string
  } = {}
) {
  const {
    maxRequests = 100,
    windowMs = 900000, // 15 minutes
    keyGenerator = (req) => req.ip || 'anonymous',
  } = options

  return async (request: NextRequest): Promise<NextResponse> => {
    const identifier = keyGenerator(request)
    
    try {
      const rateLimit = await cacheUtils.incrementRateLimit(
        identifier,
        windowMs,
        maxRequests
      )

      // Add rate limit headers
      const response = await handler(request)
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
      response.headers.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString())

      // Return 429 if rate limit exceeded
      if (rateLimit.count > maxRequests) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
          },
          { status: 429 }
        )
      }

      return response
    } catch (error) {
      console.warn('Rate limit middleware error:', error)
      return handler(request)
    }
  }
}

// Combined middleware for caching and rate limiting
export function withCacheAndRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  cacheKey: string,
  cacheOptions: CacheOptions = {},
  rateLimitOptions: Parameters<typeof withRateLimit>[1] = {}
) {
  return withRateLimit(
    withCache(handler, cacheKey, cacheOptions),
    rateLimitOptions
  )
}

// Utility for cache invalidation
export class CacheInvalidator {
  static async invalidateProject(projectId: string) {
    await Promise.all([
      cacheManager.invalidatePattern(`*:project:${projectId}*`),
      cacheManager.invalidatePattern(`*:blueprint:${projectId}*`),
      cacheManager.invalidatePattern(`*:workflow:${projectId}*`),
    ])
  }

  static async invalidateUser(userId: string) {
    await Promise.all([
      cacheManager.invalidatePattern(`*:user:${userId}*`),
      cacheManager.invalidatePattern(`*:projects:${userId}*`),
    ])
  }

  static async invalidateAIResponses() {
    await cacheManager.invalidatePattern(`${CACHE_PREFIXES.AI_RESPONSE}:*`)
  }

  static async invalidateAnalytics() {
    await cacheManager.invalidatePattern(`${CACHE_PREFIXES.ANALYTICS}:*`)
  }

  static async invalidateAll() {
    await cacheManager.flush()
  }
}

// Cache warming utilities
export class CacheWarmer {
  static async warmUserCache(userId: string) {
    try {
      // Pre-load user data
      const user = await cacheManager.get({
        prefix: CACHE_PREFIXES.USER_SESSION,
        key: `user:${userId}`,
      })

      if (!user) {
        // Trigger cache population by making a request
        // This would typically be done by calling the actual API endpoint
        console.log(`Warming cache for user: ${userId}`)
      }
    } catch (error) {
      console.warn('Cache warming error:', error)
    }
  }

  static async warmProjectCache(projectId: string) {
    try {
      const project = await cacheManager.get({
        prefix: CACHE_PREFIXES.PROJECT_DATA,
        key: `project:${projectId}`,
      })

      if (!project) {
        console.log(`Warming cache for project: ${projectId}`)
      }
    } catch (error) {
      console.warn('Cache warming error:', error)
    }
  }
}

// Cache health monitoring
export class CacheMonitor {
  static async getHealthStatus() {
    try {
      const stats = cacheManager.getStats()
      const testKey: CacheKey = {
        prefix: 'health',
        key: 'test',
        ttl: 60,
      }

      // Test cache operations
      const testValue = { timestamp: Date.now() }
      await cacheManager.set(testKey, testValue)
      const retrieved = await cacheManager.get(testKey)
      await cacheManager.del(testKey)

      return {
        status: 'healthy',
        stats,
        testPassed: !!retrieved,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }
    }
  }
}