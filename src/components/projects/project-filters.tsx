"use client"

import { ProjectStatus } from '@/types'

interface ProjectFiltersProps {
  statusFilter: ProjectStatus | 'all'
  onStatusFilterChange: (status: ProjectStatus | 'all') => void
  categoryFilter: string
  onCategoryFilterChange: (category: string) => void
  sortBy: 'updatedAt' | 'createdAt' | 'name'
  onSortByChange: (sortBy: 'updatedAt' | 'createdAt' | 'name') => void
  sortOrder: 'asc' | 'desc'
  onSortOrderChange: (sortOrder: 'asc' | 'desc') => void
}

const commonCategories = [
  'SaaS',
  'E-commerce',
  'Mobile App',
  'Web App',
  'AI Tool',
  'Marketplace',
  'Social',
  'FinTech',
  'HealthTech',
  'EdTech'
]

export function ProjectFilters({
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange
}: ProjectFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border">
      {/* Status Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as ProjectStatus | 'all')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All</option>
          <option value={ProjectStatus.DRAFT}>Draft</option>
          <option value={ProjectStatus.GENERATING}>Generating</option>
          <option value={ProjectStatus.COMPLETED}>Completed</option>
          <option value={ProjectStatus.FAILED}>Failed</option>
          <option value={ProjectStatus.ARCHIVED}>Archived</option>
        </select>
      </div>

      {/* Category Filter */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {commonCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as 'updatedAt' | 'createdAt' | 'name')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="updatedAt">Last Updated</option>
          <option value="createdAt">Date Created</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Sort Order */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700">Order:</label>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* Clear Filters */}
      {(statusFilter !== 'all' || categoryFilter || sortBy !== 'updatedAt' || sortOrder !== 'desc') && (
        <button
          onClick={() => {
            onStatusFilterChange('all')
            onCategoryFilterChange('')
            onSortByChange('updatedAt')
            onSortOrderChange('desc')
          }}
          className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}