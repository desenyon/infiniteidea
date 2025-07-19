"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ProjectStatus } from '@/types'
import { GenerationProgress } from '@/lib/blueprint-error-handler'
import { BlueprintDisplay } from '@/components/blueprint/blueprint-display'

interface Project {
  id: string
  name: string
  description?: string
  originalIdea: string
  status: ProjectStatus
  category?: string
  complexity?: string
  blueprint?: any
  generatedAt?: string
  createdAt: string
  lastModified: string
}

interface ProjectData {
  project: Project
  progress: GenerationProgress
}

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [projectData, setProjectData] = useState<ProjectData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const fetchProjectData = useCallback(async () => {
    try {
      // Fetch project details
      const [projectResponse, progressResponse] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/progress`)
      ])

      if (!projectResponse.ok) {
        if (projectResponse.status === 404) {
          throw new Error('Project not found')
        }
        throw new Error('Failed to fetch project')
      }

      const projectResult = await projectResponse.json()
      const progressResult = await progressResponse.json()

      if (!projectResult.success) {
        throw new Error(projectResult.error || 'Failed to fetch project')
      }

      setProjectData({
        project: projectResult.data,
        progress: progressResult.success ? progressResult.data.progress : {
          projectId,
          status: projectResult.data.status,
          currentStep: 'Loading...',
          progress: 0
        }
      })

      // Set up polling if still generating
      if (projectResult.data.status === ProjectStatus.GENERATING) {
        if (!pollingInterval) {
          const interval = setInterval(fetchProjectData, 2000) // Poll every 2 seconds
          setPollingInterval(interval)
        }
      } else {
        // Clear polling if generation is complete
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
      }

    } catch (err) {
      console.error('Error fetching project data:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }, [projectId, pollingInterval])

  useEffect(() => {
    fetchProjectData()

    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [fetchProjectData])

  const handleRetry = useCallback(async () => {
    setError(null)
    setLoading(true)
    
    try {
      // Trigger regeneration by calling the ideas/process endpoint again
      // This is a simplified approach - in production you might want a dedicated retry endpoint
      const response = await fetch('/api/ideas/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: projectData?.project.originalIdea || '',
        }),
      })

      if (response.ok) {
        // Refresh the page data
        await fetchProjectData()
      } else {
        throw new Error('Failed to retry generation')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry')
      setLoading(false)
    }
  }, [projectData, fetchProjectData])

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case ProjectStatus.GENERATING:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.FAILED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'Complete'
      case ProjectStatus.GENERATING:
        return 'Generating'
      case ProjectStatus.FAILED:
        return 'Failed'
      case ProjectStatus.DRAFT:
        return 'Draft'
      default:
        return status
    }
  }

  if (loading && !projectData) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading project...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !projectData) {
    return (
      <div className="min-h-screen bg-gradient-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <div className="text-red-600 mb-4">
                <h2 className="text-xl font-semibold mb-2">Error</h2>
                <p>{error}</p>
              </div>
              <div className="space-x-4">
                <Button onClick={() => router.push('/')} variant="outline">
                  Go Home
                </Button>
                <Button onClick={fetchProjectData}>
                  Try Again
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (!projectData) {
    return null
  }

  const { project, progress } = projectData

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')}
                className="mb-2"
              >
                ← Back to Home
              </Button>
              <Badge className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {project.name}
            </h1>
            
            {project.category && (
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline">{project.category}</Badge>
                {project.complexity && (
                  <Badge variant="outline">{project.complexity}</Badge>
                )}
              </div>
            )}
          </div>

          {/* Original Idea */}
          <Card className="p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">Original Idea</h2>
            <p className="text-muted-foreground leading-relaxed">
              {project.originalIdea}
            </p>
          </Card>

          {/* Generation Progress */}
          {project.status === ProjectStatus.GENERATING && (
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Generating Blueprint</h2>
                  <span className="text-sm text-muted-foreground">
                    {progress.progress}%
                  </span>
                </div>
                
                <Progress value={progress.progress} className="w-full" />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progress.currentStep}
                  </span>
                  {progress.estimatedTimeRemaining && (
                    <span className="text-muted-foreground">
                      ~{Math.ceil(progress.estimatedTimeRemaining / 60)} min remaining
                    </span>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Generation Failed */}
          {project.status === ProjectStatus.FAILED && (
            <Card className="p-6 mb-6 border-red-200 bg-red-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-red-800">Generation Failed</h2>
                </div>
                
                <p className="text-red-700">
                  {progress.error?.userMessage || 'Blueprint generation encountered an error. Please try again.'}
                </p>
                
                {progress.error?.suggestions && progress.error.suggestions.length > 0 && (
                  <div>
                    <h3 className="font-medium text-red-800 mb-2">Suggestions:</h3>
                    <ul className="list-disc list-inside space-y-1 text-red-700">
                      {progress.error.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button onClick={handleRetry} variant="default">
                    Try Again
                  </Button>
                  <Button onClick={() => router.push('/')} variant="outline">
                    Start Over
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Blueprint Results */}
          {project.status === ProjectStatus.COMPLETED && project.blueprint && (
            <BlueprintDisplay 
              blueprint={project.blueprint}
              projectId={project.id}
              projectName={project.name}
            />
          )}
        </div>
      </div>
    </div>
  )
}