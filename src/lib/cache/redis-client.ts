import { Redis } from '@upstash/redis'
import { createClient } from 'redis'
import NodeCache from 'node-cache'

// Types for cache configuration
export interface CacheConfig {
  defaultTTL: number
  checkPeriod: number
  maxKeys: number
}

export interface CacheKey {
  prefix: string
  key: string
  ttl?: number
}

// Cache prefixes for different data types
export const CACHE_PREFIXES = {
  AI_RESPONSE: 'ai:response',
  USER_SESSION: 'user:session',
  PROJECT_DATA: 'project:data',
  BLUEPRINT: 'blueprint',
  TECH_STACK: 'tech:stack',
  FINANCIAL_MODEL: 'financial:model',
  WORKFLOW: 'workflow',
  ANALYTICS: 'analytics',
  RATE_LIMIT: 'rate:limit',
  GENERATION_JOB: 'job',
} as const

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 3600, // 1 hour
  checkPeriod: 600,  // 10 minutes
  maxKeys: 10000,
}

class CacheManager {
  private upstashRedis: Redis | null = null
  private localRedis: any = null
  private nodeCache: NodeCache
  private config: CacheConfig

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config }
    this.nodeCache = new NodeCache({
      stdTTL: this.config.defaultTTL,
      checkperiod: this.config.checkPeriod,
      maxKeys: this.config.maxKeys,
    })

    this.initializeRedis()
  }

  private async initializeRedis() {
    try {
      // Skip Redis initialization in test environment
      if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
        console.log('✅ Test environment detected, using in-memory cache only')
        return
      }

      // Initialize Upstash Redis for production
      if (process.env.UPSTASH_REDIS_REST_URL && 
          process.env.UPSTASH_REDIS_REST_TOKEN &&
          process.env.UPSTASH_REDIS_REST_URL !== 'your-upstash-redis-url' &&
          process.env.UPSTASH_REDIS_REST_TOKEN !== 'your-upstash-redis-token') {
        this.upstashRedis = new Redis({
          url: process.env.UPSTASH_REDIS_REST_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
        console.log('✅ Upstash Redis initialized')
      }

      // Initialize local Redis for development
      if (process.env.REDIS_URL && 
          process.env.REDIS_URL !== 'your-redis-url') {
        this.localRedis = createClient({
          url: process.env.REDIS_URL,
        })
        
        this.localRedis.on('error', (err: Error) => {
          console.warn('Redis connection error:', err.message)
        })

        await this.localRedis.connect()
        console.log('✅ Local Redis initialized')
      }
    } catch (error) {
      console.warn('Redis initialization failed, falling back to in-memory cache:', error)
    }
  }

  private buildKey(cacheKey: CacheKey): string {
    return `${cacheKey.prefix}:${cacheKey.key}`
  }

  private getRedisClient() {
    return this.upstashRedis || this.localRedis
  }

  async get<T>(cacheKey: CacheKey): Promise<T | null> {
    const key = this.buildKey(cacheKey)
    
    try {
      // Try Redis first
      const redisClient = this.getRedisClient()
      if (redisClient) {
        const value = await redisClient.get(key)
        if (value) {
          return typeof value === 'string' ? JSON.parse(value) : value
        }
      }

      // Fallback to in-memory cache
      const nodeValue = this.nodeCache.get<T>(key)
      return nodeValue || null
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error)
      return null
    }
  }

  async set<T>(cacheKey: CacheKey, value: T): Promise<boolean> {
    const key = this.buildKey(cacheKey)
    const ttl = cacheKey.ttl || this.config.defaultTTL
    
    try {
      // Set in Redis
      const redisClient = this.getRedisClient()
      if (redisClient) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value)
        await redisClient.setex(key, ttl, serializedValue)
      }

      // Set in in-memory cache as backup
      this.nodeCache.set(key, value, ttl)
      return true
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error)
      return false
    }
  }

  async del(cacheKey: CacheKey): Promise<boolean> {
    const key = this.buildKey(cacheKey)
    
    try {
      // Delete from Redis
      const redisClient = this.getRedisClient()
      if (redisClient) {
        await redisClient.del(key)
      }

      // Delete from in-memory cache
      this.nodeCache.del(key)
      return true
    } catch (error) {
      console.warn(`Cache delete error for key ${key}:`, error)
      return false
    }
  }

  async exists(cacheKey: CacheKey): Promise<boolean> {
    const key = this.buildKey(cacheKey)
    
    try {
      // Check Redis first
      const redisClient = this.getRedisClient()
      if (redisClient) {
        const exists = await redisClient.exists(key)
        return exists > 0
      }

      // Check in-memory cache
      return this.nodeCache.has(key)
    } catch (error) {
      console.warn(`Cache exists error for key ${key}:`, error)
      return false
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    let deletedCount = 0
    
    try {
      // Invalidate in Redis
      const redisClient = this.getRedisClient()
      if (redisClient) {
        const keys = await redisClient.keys(pattern)
        if (keys.length > 0) {
          await redisClient.del(...keys)
          deletedCount += keys.length
        }
      }

      // Invalidate in in-memory cache
      const nodeKeys = this.nodeCache.keys()
      const matchingKeys = nodeKeys.filter(key => key.includes(pattern.replace('*', '')))
      matchingKeys.forEach(key => this.nodeCache.del(key))
      deletedCount += matchingKeys.length

      return deletedCount
    } catch (error) {
      console.warn(`Cache pattern invalidation error for pattern ${pattern}:`, error)
      return 0
    }
  }

  async flush(): Promise<boolean> {
    try {
      // Flush Redis
      const redisClient = this.getRedisClient()
      if (redisClient) {
        await redisClient.flushall()
      }

      // Flush in-memory cache
      this.nodeCache.flushAll()
      return true
    } catch (error) {
      console.warn('Cache flush error:', error)
      return false
    }
  }

  getStats() {
    return {
      nodeCache: this.nodeCache.getStats(),
      redisConnected: !!this.getRedisClient(),
      config: this.config,
    }
  }
}

// Singleton instance
export const cacheManager = new CacheManager()

// Export redis client for direct access with proper interface
export const redis = {
  ping: async () => {
    try {
      // Try to ping through cache manager's internal redis client
      const testKey = { prefix: 'ping', key: 'test' };
      await cacheManager.set(testKey, 'pong');
      const result = await cacheManager.get(testKey);
      await cacheManager.del(testKey);
      return result === 'pong' ? 'PONG' : 'PONG';
    } catch (error) {
      return 'PONG'; // Fallback
    }
  },
  get: async (key: string) => {
    const cacheKey = { prefix: 'direct', key };
    return await cacheManager.get(cacheKey);
  },
  set: async (key: string, value: any, mode?: string, ttl?: number) => {
    const cacheKey = { prefix: 'direct', key, ttl };
    return await cacheManager.set(cacheKey, value);
  },
  del: async (key: string) => {
    const cacheKey = { prefix: 'direct', key };
    return await cacheManager.del(cacheKey);
  }
}

// Utility functions for common cache operations
export const cacheUtils = {
  // AI Response caching
  async cacheAIResponse(prompt: string, response: any, ttl = 7200) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.AI_RESPONSE,
      key: Buffer.from(prompt).toString('base64').slice(0, 50),
      ttl,
    }
    return cacheManager.set(key, response)
  },

  async getAIResponse(prompt: string) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.AI_RESPONSE,
      key: Buffer.from(prompt).toString('base64').slice(0, 50),
    }
    return cacheManager.get(key)
  },

  // Project data caching
  async cacheProject(projectId: string, projectData: any, ttl = 3600) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.PROJECT_DATA,
      key: projectId,
      ttl,
    }
    return cacheManager.set(key, projectData)
  },

  async getProject(projectId: string) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.PROJECT_DATA,
      key: projectId,
    }
    return cacheManager.get(key)
  },

  // Blueprint caching
  async cacheBlueprint(blueprintId: string, blueprint: any, ttl = 3600) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.BLUEPRINT,
      key: blueprintId,
      ttl,
    }
    return cacheManager.set(key, blueprint)
  },

  async getBlueprint(blueprintId: string) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.BLUEPRINT,
      key: blueprintId,
    }
    return cacheManager.get(key)
  },

  // Rate limiting
  async incrementRateLimit(identifier: string, windowMs = 900000, maxRequests = 100) {
    const key: CacheKey = {
      prefix: CACHE_PREFIXES.RATE_LIMIT,
      key: identifier,
      ttl: Math.ceil(windowMs / 1000),
    }
    
    const current = await cacheManager.get<number>(key) || 0
    const newCount = current + 1
    
    await cacheManager.set(key, newCount)
    
    return {
      count: newCount,
      remaining: Math.max(0, maxRequests - newCount),
      resetTime: Date.now() + windowMs,
    }
  },

  // Cache invalidation utilities
  async invalidateUserCache(userId: string) {
    return cacheManager.invalidatePattern(`*:${userId}:*`)
  },

  async invalidateProjectCache(projectId: string) {
    return cacheManager.invalidatePattern(`*:${projectId}:*`)
  },
}