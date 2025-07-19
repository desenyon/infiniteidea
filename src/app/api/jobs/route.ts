import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { jobManager, JobType, JobPriority, jobUtils } from '@/lib/queue/job-queue'
import { z } from 'zod'

// Validation schemas
const createJobSchema = z.object({
  type: z.nativeEnum(JobType),
  data: z.any(),
  options: z.object({
    priority: z.nativeEnum(JobPriority).optional(),
    delay: z.number().optional(),
    attempts: z.number().min(1).max(10).optional(),
    timeout: z.number().optional(),
  }).optional(),
})

const jobQuerySchema = z.object({
  type: z.nativeEnum(JobType).optional(),
  status: z.enum(['waiting', 'active', 'completed', 'failed', 'delayed']).optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
  offset: z.string().transform(val => parseInt(val)).optional(),
})

// GET /api/jobs - Get job statistics and list
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const query = jobQuerySchema.parse(Object.fromEntries(url.searchParams))

    // Get queue statistics
    const stats = await jobUtils.getAllQueueStats()

    // If specific type requested, get detailed info
    let jobs = null
    if (query.type) {
      // This would typically fetch jobs from the database
      // For now, we'll return the queue stats
      jobs = await jobManager.getQueueStats(query.type)
    }

    return NextResponse.json({
      success: true,
      data: {
        stats,
        jobs,
        query,
      },
    })
  } catch (error) {
    console.error('Jobs API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - Create a new job
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, data, options } = createJobSchema.parse(body)

    // Add user context to job data
    const jobData = {
      ...data,
      userId: session.user.id,
    }

    // Create the job
    const jobId = await jobManager.addJob(type, jobData, options)

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        type,
        status: 'created',
      },
    })
  } catch (error) {
    console.error('Create job error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}