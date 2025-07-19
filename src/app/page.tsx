"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useDevAuth } from '@/hooks/use-dev-auth'
import { IdeaInputForm } from '@/components/idea-input/idea-input-form'
import { IdeaInput } from '@/types'

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()
  const devAuth = useDevAuth()

  const handleIdeaSubmit = useCallback(async (ideaInput: IdeaInput) => {
    setIsGenerating(true)
    setError(null)
    
    try {
      // Submit idea for processing and blueprint generation
      const response = await fetch('/api/ideas/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ideaInput),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to process idea')
      }

      // Get the project ID from the response
      const projectId = result.data.project.id

      // Navigate to the project page to show progress and results
      router.push(`/project/${projectId}`)

    } catch (error) {
      console.error('Error generating blueprint:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsGenerating(false)
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Desenyon: InfiniteIdea
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Transform your startup ideas into production-ready development blueprints 
              with AI-powered planning and architecture generation.
            </p>
            
            {/* Development Authentication Status */}
            {devAuth.isDevMode && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
                <div className="text-sm text-blue-800">
                  <strong>Development Mode:</strong> Authenticated as {devAuth.user?.name || 'Loading...'}
                </div>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Idea Input Form */}
          <IdeaInputForm 
            onSubmit={handleIdeaSubmit}
            isLoading={isGenerating}
          />
        </div>
      </div>
    </div>
  );
}
