import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { jobManager, JobType } from '@/lib/queue/job-queue'
import { db } from '@/lib/prisma'
import { z } from 'zod'

const jobParamsSchema = z.object({
  id: z.string(),
})

const jobActionSchema = z.object({
  action: z.enum(['cancel', 'retry', 'pause', 'resume']),
  type: z.nativeEnum(JobType),
})

// GET /api/jobs/[id] - Get job status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = jobParamsSchema.parse(params)
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as JobType

    if (!type || !Object.values(JobType).includes(type)) {
      return NextResponse.json(
        { error: 'Job type is required and must be valid' },
        { status: 400 }
      )
    }

    // Get job status from queue
    const jobStatus = await jobManager.getJobStatus(id, type)
    
    // For blueprint generation jobs, also get database record
    let dbJob = null
    if (type === JobType.BLUEPRINT_GENERATION) {
      dbJob = await db.raw.generationJob.findUnique({
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

      // Check if user owns this job
      if (dbJob && dbJob.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    if (!jobStatus && !dbJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        queue: jobStatus,
        database: dbJob,
        type,
      },
    })
  } catch (error) {
    console.error('Get job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/jobs/[id] - Perform job actions (cancel, retry, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = jobParamsSchema.parse(params)
    const body = await request.json()
    const { action, type } = jobActionSchema.parse(body)

    // For blueprint generation jobs, check ownership
    if (type === JobType.BLUEPRINT_GENERATION) {
      const dbJob = await db.raw.generationJob.findUnique({
        where: { id },
      })

      if (!dbJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }

      if (dbJob.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    let result = false
    let message = ''

    switch (action) {
      case 'cancel':
        result = await jobManager.cancelJob(id, type)
        message = result ? 'Job cancelled successfully' : 'Failed to cancel job'
        break
        
      case 'retry':
        // For retry, we would need to create a new job with the same data
        // This is a simplified implementation
        message = 'Retry functionality not yet implemented'
        break
        
      case 'pause':
        message = 'Pause functionality not yet implemented'
        break
        
      case 'resume':
        message = 'Resume functionality not yet implemented'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result,
      message,
      action,
      jobId: id,
    })
  } catch (error) {
    console.error('Job action error:', error)
    
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

// DELETE /api/jobs/[id] - Delete job
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = jobParamsSchema.parse(params)
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as JobType

    if (!type || !Object.values(JobType).includes(type)) {
      return NextResponse.json(
        { error: 'Job type is required and must be valid' },
        { status: 400 }
      )
    }

    // For blueprint generation jobs, check ownership and delete from database
    if (type === JobType.BLUEPRINT_GENERATION) {
      const dbJob = await db.raw.generationJob.findUnique({
        where: { id },
      })

      if (!dbJob) {
        return NextResponse.json(
          { error: 'Job not found' },
          { status: 404 }
        )
      }

      if (dbJob.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      // Delete from database
      await db.raw.generationJob.delete({
        where: { id },
      })
    }

    // Cancel and remove from queue
    const result = await jobManager.cancelJob(id, type)

    return NextResponse.json({
      success: result,
      message: result ? 'Job deleted successfully' : 'Failed to delete job',
      jobId: id,
    })
  } catch (error) {
    console.error('Delete job error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}