"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Project } from '@/types'
import { BlueprintDisplay } from '@/components/blueprint/blueprint-display'
import { Container } from '@/components/ui/container'
import { LoadingSpinner } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ShareData {
  project: Project
  permissions: string
  allowedSections: string[]
  requiresPassword: boolean
}

export default function SharedProjectPage() {
  const params = useParams()
  const token = params.token as string
  
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [showPasswordForm, setShowPasswordForm] = useState(false)

  useEffect(() => {
    if (token) {
      fetchSharedProject()
    }
  }, [token])

  const fetchSharedProject = async (providedPassword?: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/share/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: providedPassword }),
      })

      const result = await response.json()

      if (!result.success) {
        if (result.error === 'Password required') {
          setShowPasswordForm(true)
          return
        }
        throw new Error(result.error || 'Failed to load shared project')
      }

      setShareData(result.data)
      setShowPasswordForm(false)
    } catch (error) {
      console.error('Error fetching shared project:', error)
      setError(error instanceof Error ? error.message : 'Failed to load shared project')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.trim()) {
      fetchSharedProject(password.trim())
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Container className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Project
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              This link may have expired or been revoked.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  if (showPasswordForm) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Container className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <div className="text-blue-600 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Password Required
            </h1>
            <p className="text-gray-600 mb-6">
              This shared project is password protected.
            </p>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full"
                autoFocus
              />
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={!password.trim()}
              >
                Access Project
              </Button>
            </form>
          </div>
        </Container>
      </div>
    )
  }

  if (!shareData) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <Container className="text-center">
          <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-auto">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Project Not Found
            </h1>
            <p className="text-gray-600">
              The shared project could not be found or may have been removed.
            </p>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <Container className="py-8">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {shareData.project.name}
              </h1>
              <p className="text-muted-foreground">
                Shared project blueprint
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                Read-only view
              </div>
            </div>
          </div>
        </div>

        {/* Blueprint Display */}
        {shareData.project.blueprint ? (
          <BlueprintDisplay
            blueprint={shareData.project.blueprint}
            project={shareData.project}
            allowedSections={shareData.allowedSections}
            readOnly={true}
          />
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-600">
              This project doesn't have a completed blueprint yet.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Desenyon: InfiniteIdea
            </a>
          </p>
        </div>
      </Container>
    </div>
  )
}