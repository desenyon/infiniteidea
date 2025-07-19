"use client"

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CreateProjectModalProps {
  onClose: () => void
  onSubmit: (projectData: {
    name: string
    description?: string
    originalIdea: string
    category?: string
  }) => Promise<void>
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

export function CreateProjectModal({ onClose, onSubmit }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    originalIdea: '',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    }

    if (!formData.originalIdea.trim()) {
      newErrors.originalIdea = 'Original idea is required'
    } else if (formData.originalIdea.trim().length < 20) {
      newErrors.originalIdea = 'Please provide more detail about your idea (at least 20 characters)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        originalIdea: formData.originalIdea.trim(),
        category: formData.category || undefined
      })
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Modal onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Project Name *
          </label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter a descriptive name for your project"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <Input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Brief description of your project"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category (Optional)
          </label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {commonCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Original Idea */}
        <div>
          <label htmlFor="originalIdea" className="block text-sm font-medium text-gray-700 mb-2">
            Original Idea *
          </label>
          <Textarea
            id="originalIdea"
            value={formData.originalIdea}
            onChange={(e) => handleInputChange('originalIdea', e.target.value)}
            placeholder="Describe your startup or app idea in detail. The more information you provide, the better the AI can generate your blueprint."
            rows={4}
            className={errors.originalIdea ? 'border-red-500' : ''}
          />
          {errors.originalIdea && (
            <p className="mt-1 text-sm text-red-600">{errors.originalIdea}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            {formData.originalIdea.length} characters (minimum 20 recommended)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}