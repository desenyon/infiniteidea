import { PrismaClient } from '@prisma/client'
import { cacheManager, CACHE_PREFIXES, CacheKey } from './cache/redis-client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Enhanced Prisma client with connection pooling and caching
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Connection pooling configuration
    __internal: {
      engine: {
        // Connection pool settings
        connection_limit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10'),
        pool_timeout: parseInt(process.env.DATABASE_POOL_TIMEOUT || '10'),
        schema_cache_size: parseInt(process.env.DATABASE_SCHEMA_CACHE_SIZE || '1000'),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Enhanced Prisma client with caching capabilities
class CachedPrismaClient {
  private client: PrismaClient

  constructor(client: PrismaClient) {
    this.client = client
  }

  // Cached user operations
  async findUserById(id: string, ttl = 300) {
    const cacheKey: CacheKey = {
      prefix: CACHE_PREFIXES.USER_SESSION,
      key: `user:${id}`,
      ttl,
    }

    let user = await cacheManager.get(cacheKey)
    if (!user) {
      user = await this.client.user.findUnique({
        where: { id },
        include: {
          projects: {
            select: {
              id: true,
              name: true,
              status: true,
              createdAt: true,
            },
            orderBy: { updatedAt: 'desc' },
            take: 10,
          },
        },
      })
      
      if (user) {
        await cacheManager.set(cacheKey, user)
      }
    }
    
    return user
  }

  // Cached project operations
  async findProjectById(id: string, ttl = 600) {
    const cacheKey: CacheKey = {
      prefix: CACHE_PREFIXES.PROJECT_DATA,
      key: `project:${id}`,
      ttl,
    }

    let project = await cacheManager.get(cacheKey)
    if (!project) {
      project = await this.client.project.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })
      
      if (project) {
        await cacheManager.set(cacheKey, project)
      }
    }
    
    return project
  }

  // Cached user projects with pagination
  async findUserProjects(userId: string, page = 1, limit = 10, ttl = 300) {
    const cacheKey: CacheKey = {
      prefix: CACHE_PREFIXES.PROJECT_DATA,
      key: `user:${userId}:projects:${page}:${limit}`,
      ttl,
    }

    let projects = await cacheManager.get(cacheKey)
    if (!projects) {
      const skip = (page - 1) * limit
      
      const [items, total] = await Promise.all([
        this.client.project.findMany({
          where: { userId },
          orderBy: { updatedAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            category: true,
            createdAt: true,
            updatedAt: true,
            generatedAt: true,
          },
        }),
        this.client.project.count({
          where: { userId },
        }),
      ])

      projects = {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
      
      await cacheManager.set(cacheKey, projects)
    }
    
    return projects
  }

  // Cached analytics queries
  async getAnalytics(filters: any = {}, ttl = 1800) {
    const filterKey = JSON.stringify(filters)
    const cacheKey: CacheKey = {
      prefix: CACHE_PREFIXES.ANALYTICS,
      key: `analytics:${Buffer.from(filterKey).toString('base64').slice(0, 20)}`,
      ttl,
    }

    let analytics = await cacheManager.get(cacheKey)
    if (!analytics) {
      const where = {
        ...filters,
        createdAt: filters.dateRange ? {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end,
        } : undefined,
      }

      const [
        totalEvents,
        successfulEvents,
        averageDuration,
        eventsByType,
      ] = await Promise.all([
        this.client.analytics.count({ where }),
        this.client.analytics.count({ where: { ...where, success: true } }),
        this.client.analytics.aggregate({
          where: { ...where, duration: { not: null } },
          _avg: { duration: true },
        }),
        this.client.analytics.groupBy({
          by: ['eventType'],
          where,
          _count: { eventType: true },
          orderBy: { _count: { eventType: 'desc' } },
        }),
      ])

      analytics = {
        totalEvents,
        successfulEvents,
        successRate: totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0,
        averageDuration: averageDuration._avg.duration || 0,
        eventsByType,
      }
      
      await cacheManager.set(cacheKey, analytics)
    }
    
    return analytics
  }

  // Cache invalidation methods
  async invalidateUserCache(userId: string) {
    await cacheManager.invalidatePattern(`*:user:${userId}*`)
  }

  async invalidateProjectCache(projectId: string) {
    await cacheManager.invalidatePattern(`*:project:${projectId}*`)
  }

  // Direct access to Prisma client for non-cached operations
  get raw() {
    return this.client
  }

  // Proxy other Prisma methods
  get user() {
    return this.client.user
  }

  get project() {
    return this.client.project
  }

  get template() {
    return this.client.template
  }

  get analytics() {
    return this.client.analytics
  }

  get generationJob() {
    return this.client.generationJob
  }

  get account() {
    return this.client.account
  }

  get session() {
    return this.client.session
  }

  get verificationToken() {
    return this.client.verificationToken
  }

  // Transaction support
  get $transaction() {
    return this.client.$transaction.bind(this.client)
  }

  // Raw query support
  get $queryRaw() {
    return this.client.$queryRaw.bind(this.client)
  }

  get $executeRaw() {
    return this.client.$executeRaw.bind(this.client)
  }

  // Connection management
  async $connect() {
    return this.client.$connect()
  }

  async $disconnect() {
    return this.client.$disconnect()
  }
}

// Export enhanced client
export const db = new CachedPrismaClient(prisma)

// Export original client for direct access when needed
export { prisma as rawPrisma }