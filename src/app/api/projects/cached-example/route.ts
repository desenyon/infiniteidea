import { NextRequest, NextResponse } from 'next/server'
import { withCacheAndRateLimit, API_CACHE_CONFIG } from '@/lib/cache/api-cache-middleware'
import { db } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function handler(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    // This will use the cached version from our enhanced Prisma client
    const projects = await db.findUserProjects(session.user.id, page, limit)

    return NextResponse.json({
      success: true,
      data: projects,
      cached: true, // Indicates this response may be cached
    })
  } catch (error) {
    console.error('Projects API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Export with caching and rate limiting
export const GET = withCacheAndRateLimit(
  handler,
  'projects-list', // Cache key prefix
  {
    ttl: API_CACHE_CONFIG.projects.ttl,
    browserCache: API_CACHE_CONFIG.projects.browserCache,
    vary: ['Authorization'], // Vary cache by user
  },
  {
    maxRequests: 50, // 50 requests per window
    windowMs: 900000, // 15 minutes
    keyGenerator: (req) => {
      // Rate limit per user
      const url = new URL(req.url)
      return url.searchParams.get('userId') || req.ip || 'anonymous'
    },
  }
)