"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Project, ProjectStatus } from '@/types'
import { ProjectCard } from '@/components/projects/project-card'
import { ProjectFilters } from '@/components/projects/project-filters'
import { ProjectSearch } from '@/components/projects/project-search'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { LoadingSpinner } from '@/components/ui/loading'

interface ProjectsResponse {
  success: boolean
  data: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function ProjectsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [sortBy, setSortBy] = useState<'updatedAt' | 'createdAt' | 'name'>('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProjects, setTotalProjects] = useState(0)
  const limit = 12

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const fetchProjects = useCallback(async () => {
    if (!session?.user?.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder
      })
      
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      
      const response = await fetch(`/api/projects?${params}`)
      const result: ProjectsResponse = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects')
      }
      
      setProjects(result.data)
      setTotalPages(result.pagination.totalPages)
      setTotalProjects(result.pagination.total)
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, currentPage, searchQuery, statusFilter, categoryFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreateProject = useCallback(async (projectData: {
    name: string
    description?: string
    originalIdea: string
    category?: string
  }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project')
      }

      setShowCreateModal(false)
      fetchProjects() // Refresh the list
    } catch (error) {
      console.error('Error creating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to create project')
    }
  }, [fetchProjects])

  const handleDuplicateProject = useCallback(async (projectId: string, newName?: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to duplicate project')
      }

      fetchProjects() // Refresh the list
    } catch (error) {
      console.error('Error duplicating project:', error)
      setError(error instanceof Error ? error.message : 'Failed to duplicate project')
    }
  }, [fetchProjects])

  const handleCreateTemplate = useCallback(async (projectId: string, templateData: {
    name: string
    description?: string
    category: string
  }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create template')
      }

      // Show success message or navigate to templates page
      alert('Template created successfully!')
    } catch (error) {
      console.error('Error creating template:', error)
      setError(error instanceof Error ? error.message : 'Failed to create template')
    }
  }, [])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Container className="py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Projects
            </h1>
            <p className="text-muted-foreground">
              Manage your AI-generated development blueprints
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Create New Project
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <ProjectSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search projects by name, description, or idea..."
          />
          
          <ProjectFilters
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || categoryFilter
                ? 'No projects match your filters'
                : 'No projects yet'
              }
            </div>
            {!searchQuery && statusFilter === 'all' && !categoryFilter && (
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="outline"
              >
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDuplicate={handleDuplicateProject}
                  onCreateTemplate={handleCreateTemplate}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalProjects)} of {totalProjects} projects
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Project Modal */}
        {showCreateModal && (
          <CreateProjectModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateProject}
          />
        )}
      </Container>
    </div>
  )
}