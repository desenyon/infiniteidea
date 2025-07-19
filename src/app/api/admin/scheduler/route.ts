import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { schedulerUtils } from '@/lib/queue/scheduler'
import { z } from 'zod'

// Admin-only endpoint for scheduler management
const schedulerActionSchema = z.object({
  action: z.enum(['start', 'stop', 'status', 'run_task']),
  taskName: z.string().optional(),
})

// GET /api/admin/scheduler - Get scheduler status
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin (you would implement your own admin check)
    if (!session?.user?.email?.endsWith('@desenyon.com')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const status = schedulerUtils.getSchedulerStatus()

    return NextResponse.json({
      success: true,
      data: status,
    })
  } catch (error) {
    console.error('Scheduler status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/scheduler - Perform scheduler actions
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.email?.endsWith('@desenyon.com')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { action, taskName } = schedulerActionSchema.parse(body)

    let result: any = null
    let message = ''

    switch (action) {
      case 'start':
        await schedulerUtils.startScheduler()
        message = 'Scheduler started successfully'
        result = schedulerUtils.getSchedulerStatus()
        break
        
      case 'stop':
        await schedulerUtils.stopScheduler()
        message = 'Scheduler stopped successfully'
        result = schedulerUtils.getSchedulerStatus()
        break
        
      case 'status':
        result = schedulerUtils.getSchedulerStatus()
        message = 'Scheduler status retrieved'
        break
        
      case 'run_task':
        if (!taskName) {
          return NextResponse.json(
            { error: 'Task name is required for run_task action' },
            { status: 400 }
          )
        }
        
        await schedulerUtils.runTaskNow(taskName)
        message = `Task ${taskName} executed successfully`
        result = { taskName, executedAt: new Date().toISOString() }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message,
      data: result,
    })
  } catch (error) {
    console.error('Scheduler action error:', error)
    
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