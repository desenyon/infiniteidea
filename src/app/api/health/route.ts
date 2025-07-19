import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/cache/redis-client';
import * as Sentry from '@sentry/nextjs';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: string;
  error?: string;
  details?: Record<string, any>;
}

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    redis: HealthCheck;
    ai_services: HealthCheck;
    external_apis: HealthCheck;
  };
  metrics: {
    totalResponseTime: string;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
  };
}

async function checkDatabase(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;
    
    // Additional database health checks
    const userCount = await prisma.user.count();
    const projectCount = await prisma.project.count();
    
    return {
      status: responseTime < 1000 ? 'healthy' : 'degraded',
      responseTime: `${responseTime}ms`,
      details: {
        userCount,
        projectCount,
        connectionPool: 'active'
      }
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'health-check', service: 'database' }
    });
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Database connection failed'
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  try {
    const start = Date.now();
    const pong = await redis.ping();
    const responseTime = Date.now() - start;
    
    // Test cache operations
    const testKey = `health-check-${Date.now()}`;
    await redis.set(testKey, 'test', 'EX', 10);
    const testValue = await redis.get(testKey);
    await redis.del(testKey);
    
    return {
      status: pong === 'PONG' && testValue === 'test' ? 'healthy' : 'degraded',
      responseTime: `${responseTime}ms`,
      details: {
        ping: pong,
        cacheTest: testValue === 'test' ? 'passed' : 'failed'
      }
    };
  } catch (error) {
    Sentry.captureException(error, {
      tags: { component: 'health-check', service: 'redis' }
    });
    
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Redis connection failed'
    };
  }
}

async function checkAIServices(): Promise<HealthCheck> {
  try {
    const checks = [];
    
    // Check OpenAI API key presence
    if (process.env.OPENAI_API_KEY) {
      checks.push({ service: 'openai', status: 'configured' });
    }
    
    // Check Anthropic API key presence
    if (process.env.ANTHROPIC_API_KEY) {
      checks.push({ service: 'anthropic', status: 'configured' });
    }
    
    // Check Replicate API key presence
    if (process.env.REPLICATE_API_TOKEN) {
      checks.push({ service: 'replicate', status: 'configured' });
    }
    
    const configuredServices = checks.length;
    const status = configuredServices >= 2 ? 'healthy' : 
                  configuredServices >= 1 ? 'degraded' : 'unhealthy';
    
    return {
      status,
      details: {
        configuredServices,
        services: checks
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'AI services check failed'
    };
  }
}

async function checkExternalAPIs(): Promise<HealthCheck> {
  try {
    const checks = [];
    
    // Check if we can reach external services (without making actual API calls)
    const externalServices = [
      { name: 'vercel-blob', configured: !!process.env.BLOB_READ_WRITE_TOKEN },
      { name: 'upstash-redis', configured: !!process.env.UPSTASH_REDIS_REST_URL },
      { name: 'auth-providers', configured: !!(process.env.GOOGLE_CLIENT_ID || process.env.GITHUB_CLIENT_ID) }
    ];
    
    const configuredCount = externalServices.filter(s => s.configured).length;
    const status = configuredCount === externalServices.length ? 'healthy' : 
                  configuredCount >= 2 ? 'degraded' : 'unhealthy';
    
    return {
      status,
      details: {
        configuredServices: configuredCount,
        totalServices: externalServices.length,
        services: externalServices
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'External APIs check failed'
    };
  }
}

export async function GET() {
  const startTime = Date.now();
  const cpuStart = process.cpuUsage();
  
  try {
    // Run all health checks in parallel
    const [database, redis, aiServices, externalApis] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkAIServices(),
      checkExternalAPIs()
    ]);
    
    const checks = { database, redis, ai_services: aiServices, external_apis: externalApis };
    
    // Determine overall status
    const statuses = Object.values(checks).map(check => check.status);
    const overallStatus = statuses.includes('unhealthy') ? 'unhealthy' :
                         statuses.includes('degraded') ? 'degraded' : 'healthy';
    
    const totalTime = Date.now() - startTime;
    const cpuUsage = process.cpuUsage(cpuStart);
    
    const response: HealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics: {
        totalResponseTime: `${totalTime}ms`,
        memoryUsage: process.memoryUsage(),
        cpuUsage
      }
    };
    
    // Log degraded or unhealthy status
    if (overallStatus !== 'healthy') {
      console.warn('Health check warning:', {
        status: overallStatus,
        failedChecks: Object.entries(checks)
          .filter(([_, check]) => check.status !== 'healthy')
          .map(([name, check]) => ({ name, status: check.status, error: check.error }))
      });
    }
    
    const statusCode = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(response, { status: statusCode });
    
  } catch (error) {
    console.error('Health check failed:', error);
    Sentry.captureException(error, {
      tags: { component: 'health-check', type: 'system-failure' }
    });
    
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unhealthy', error: 'Check failed' },
        redis: { status: 'unhealthy', error: 'Check failed' },
        ai_services: { status: 'unhealthy', error: 'Check failed' },
        external_apis: { status: 'unhealthy', error: 'Check failed' }
      },
      metrics: {
        totalResponseTime: `${Date.now() - startTime}ms`,
        memoryUsage: process.memoryUsage()
      }
    };
    
    return NextResponse.json(errorResponse, { status: 503 });
  }
}