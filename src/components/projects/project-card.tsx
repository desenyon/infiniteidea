"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project, ProjectStatus } from '@/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

interface ProjectCardProps {
  project: Project
  onDuplicate: (projectId: string, newName?: string) => Promise<void>
  onCreateTemplate: (projectId: string, templateData: {
    name: string
    description?: string
    category: string
  }) => Promise<void>
}

export function ProjectCard({ project, onDuplicate, onCreateTemplate }: ProjectCardProps) {
  const router = useRouter()
  const [showActions, setShowActions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case ProjectStatus.GENERATING:
        return 'bg-blue-100 text-blue-800'
      case ProjectStatus.FAILED:
        return 'bg-red-100 text-red-800'
      case ProjectStatus.ARCHIVED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getComplexityColor = (complexity?: string) => {
    switch (complexity?.toLowerCase()) {
      case 'simple':
        return 'bg-green-50 text-green-700'
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700'
      case 'complex':
        return 'bg-orange-50 text-orange-700'
      case 'enterprise':
        return 'bg-red-50 text-red-700'
      default:
        return 'bg-gray-50 text-gray-700'
    }
  }

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      await onDuplicate(project.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    if (project.status !== ProjectStatus.COMPLETED) {
      alert('Only completed projects can be converted to templates')
      return
    }

    const templateName = prompt('Enter template name:', `${project.name} Template`)
    if (!templateName) return

    const templateCategory = prompt('Enter template category:', project.category || 'General')
    if (!templateCategory) return

    setIsLoading(true)
    try {
      await onCreateTemplate(project.id, {
        name: templateName,
        description: `Template based on ${project.name}`,
        category: templateCategory
      })
    } finally {
      setIsLoading(false)
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Card 
      className="p-6 hover:shadow-lg transition-shadow cursor-pointer relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Project Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg font-semibold text-foreground mb-1 hover:text-blue-600 transition-colors"
            onClick={() => router.push(`/project/${project.id}`)}
          >
            {project.name}
          </h3>
          {project.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {truncateText(project.description, 100)}
            </p>
          )}
        </div>
        
        {/* Status Badge */}
        <Badge className={getStatusColor(project.status)}>
          {project.status.toLowerCase().replace('_', ' ')}
        </Badge>
      </div>

      {/* Project Details */}
      <div className="space-y-3 mb-4">
        {/* Original Idea Preview */}
        <div>
          <p className="text-sm text-muted-foreground">
            {truncateText(project.originalIdea, 120)}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            {project.category && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                {project.category}
              </span>
            )}
            {project.complexity && (
              <span className={`px-2 py-1 rounded ${getComplexityColor(project.complexity)}`}>
                {project.complexity}
              </span>
            )}
          </div>
          
          <div className="text-right">
            <div>Updated {formatDistanceToNow(new Date(project.updatedAt))} ago</div>
            {project.generatedAt && (
              <div>Generated {formatDistanceToNow(new Date(project.generatedAt))} ago</div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={`transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${project.id}`)}
          >
            View Details
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDuplicate}
              disabled={isLoading}
            >
              Duplicate
            </Button>
            
            {project.status === ProjectStatus.COMPLETED && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCreateTemplate}
                disabled={isLoading}
              >
                Template
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </Card>
  )
}