import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/monitoring/performance-monitor';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache/redis-client';
import * as Sentry from '@sentry/nextjs';

interface MonitoringDashboard {
  timestamp: string;
  system: {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    environment: string;
    version: string;
  };
  database: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    connectionCount: number;
    queryMetrics: {
      averageResponseTime: number | null;
      slowQueries: number;
    };
    tableStats: {
      users: number;
      projects: number;
      templates: number;
    };
  };
  cache: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    hitRate: number;
    memoryUsage: string;
    keyCount: number;
  };
  performance: {
    apiResponseTime: number | null;
    pageLoadTime: number | null;
    aiGenerationTime: number | null;
    errorRate: number | null;
  };
  alerts: {
    active: number;
    recent: Array<{
      severity: string;
      message: string;
      timestamp: string;
    }>;
  };
  usage: {
    activeUsers: number;
    projectsCreated: number;
    blueprintsGenerated: number;
    apiCalls: number;
  };
}

async function getDatabaseMetrics() {
  try {
    const [userCount, projectCount, templateCount] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.template?.count() || 0
    ]);

    // Get recent activity metrics
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [recentUsers, recentProjects] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: oneDayAgo } }
      }),
      prisma.project.count({
        where: { createdAt: { gte: oneDayAgo } }
      })
    ]);

    return {
      status: 'healthy' as const,
      connectionCount: 1, // Simplified - would need actual connection pool metrics
      queryMetrics: {
        averageResponseTime: performanceMonitor.getAverageMetric('database_query_time'),
        slowQueries: 0 // Would need actual slow query monitoring
      },
      tableStats: {
        users: userCount,
        projects: projectCount,
        templates: templateCount
      },
      recentActivity: {
        newUsers: recentUsers,
        newProjects: recentProjects
      }
    };
  } catch (error) {
    console.error('Database metrics error:', error);
    return {
      status: 'unhealthy' as const,
      connectionCount: 0,
      queryMetrics: {
        averageResponseTime: null,
        slowQueries: 0
      },
      tableStats: {
        users: 0,
        projects: 0,
        templates: 0
      },
      recentActivity: {
        newUsers: 0,
        newProjects: 0
      }
    };
  }
}

async function getCacheMetrics() {
  try {
    const info = await redis.info('memory');
    const keyCount = await redis.dbsize();
    
    // Parse memory info
    const memoryLines = info.split('\r\n');
    const usedMemory = memoryLines.find(line => line.startsWith('used_memory_human:'))?.split(':')[1] || 'unknown';
    
    // Calculate hit rate (simplified)
    const hitRate = 85; // Would need actual hit/miss tracking
    
    return {
      status: 'healthy' as const,
      hitRate,
      memoryUsage: usedMemory,
      keyCount
    };
  } catch (error) {
    console.error('Cache metrics error:', error);
    return {
      status: 'unhealthy' as const,
      hitRate: 0,
      memoryUsage: 'unknown',
      keyCount: 0
    };
  }
}

async function getPerformanceMetrics() {
  return {
    apiResponseTime: performanceMonitor.getAverageMetric('api_response_time'),
    pageLoadTime: performanceMonitor.getAverageMetric('page_load_time'),
    aiGenerationTime: performanceMonitor.getAverageMetric('ai_generation_time'),
    errorRate: performanceMonitor.getAverageMetric('error_rate')
  };
}

async function getAlertMetrics() {
  // In a real implementation, this would fetch from an alerts database
  return {
    active: 0,
    recent: []
  };
}

async function getUsageMetrics() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [activeUsers, projectsCreated] = await Promise.all([
      prisma.user.count({
        where: {
          updatedAt: { gte: oneDayAgo }
        }
      }),
      prisma.project.count({
        where: {
          createdAt: { gte: oneDayAgo }
        }
      })
    ]);

    return {
      activeUsers,
      projectsCreated,
      blueprintsGenerated: projectsCreated, // Simplified - assuming 1:1 ratio
      apiCalls: 0 // Would need API call tracking
    };
  } catch (error) {
    console.error('Usage metrics error:', error);
    return {
      activeUsers: 0,
      projectsCreated: 0,
      blueprintsGenerated: 0,
      apiCalls: 0
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple authentication check
    const authHeader = request.headers.get('authorization');
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey || authHeader !== `Bearer ${adminKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Collect all metrics in parallel
    const [databaseMetrics, cacheMetrics, performanceMetrics, alertMetrics, usageMetrics] = await Promise.all([
      getDatabaseMetrics(),
      getCacheMetrics(),
      getPerformanceMetrics(),
      getAlertMetrics(),
      getUsageMetrics()
    ]);

    const dashboard: MonitoringDashboard = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        environment: process.env.NODE_ENV || 'development',
        version: process.env.VERCEL_GIT_COMMIT_SHA || 'development'
      },
      database: databaseMetrics,
      cache: cacheMetrics,
      performance: performanceMetrics,
      alerts: alertMetrics,
      usage: usageMetrics
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Monitoring dashboard error:', error);
    Sentry.captureException(error, {
      tags: { component: 'monitoring-dashboard' }
    });

    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    );
  }
}

// Health check endpoint for the monitoring system itself
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check without full metrics
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    
    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 503 });
  }
}