'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { LoadingSpinner } from '@/components/ui/loading'
import { ExternalTool, ExternalToolConfig, LaunchRequest, LaunchResponse, ToolIntegrationStatus } from '@/types/external-tools'

interface ToolLauncherProps {
  projectId: string
  blueprint: any
  prompts?: string[]
  onLaunch?: (response: LaunchResponse) => void
}

interface ToolWithStatus extends ExternalToolConfig {
  status: ToolIntegrationStatus
}

export function ToolLauncher({ projectId, blueprint, prompts, onLaunch }: ToolLauncherProps) {
  const [tools, setTools] = useState<ToolWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [launching, setLaunching] = useState<string | null>(null)
  const [showLaunchModal, setShowLaunchModal] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolWithStatus | null>(null)
  const [launchOptions, setLaunchOptions] = useState({
    openInNewWindow: true,
    includeProjectContext: true,
    preloadPrompts: true,
    autoStartCoding: false,
    customInstructions: ''
  })

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      const response = await fetch('/api/tools/launch')
      if (response.ok) {
        const data = await response.json()
        setTools(data.tools || [])
      }
    } catch (error) {
      console.error('Failed to load tools:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLaunchTool = (tool: ToolWithStatus) => {
    setSelectedTool(tool)
    setShowLaunchModal(true)
  }

  const confirmLaunch = async () => {
    if (!selectedTool) return

    setLaunching(selectedTool.id)
    setShowLaunchModal(false)

    try {
      const launchRequest: LaunchRequest = {
        toolId: selectedTool.id,
        projectId,
        blueprint,
        prompts,
        options: launchOptions
      }

      const response = await fetch('/api/tools/launch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(launchRequest)
      })

      const result: LaunchResponse = await response.json()

      if (result.success) {
        // Open the tool if we have a URL
        if (result.toolUrl) {
          window.open(result.toolUrl, '_blank')
        }
        
        onLaunch?.(result)
      } else {
        alert(`Failed to launch ${selectedTool.name}: ${result.error}`)
      }
    } catch (error) {
      console.error('Launch error:', error)
      alert(`Failed to launch ${selectedTool.name}`)
    } finally {
      setLaunching(null)
      setSelectedTool(null)
    }
  }

  const getToolIcon = (tool: ExternalTool) => {
    switch (tool) {
      case ExternalTool.CURSOR:
        return '🎯'
      case ExternalTool.VSCODE:
        return '💻'
      case ExternalTool.GITHUB_COPILOT:
        return '🤖'
      case ExternalTool.CLAUDE_DEV:
        return '🧠'
      default:
        return '🔧'
    }
  }

  const getStatusColor = (status: ToolIntegrationStatus) => {
    switch (status.healthStatus) {
      case 'healthy':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading tools...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Launch in Coding Environment</h3>
        <p className="text-gray-600 text-sm">
          Open your project in your preferred coding environment with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{getToolIcon(tool.tool)}</span>
                <div>
                  <h4 className="font-medium">{tool.name}</h4>
                  <Badge className={`text-xs ${getStatusColor(tool.status)}`}>
                    {tool.status.healthStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-gray-600">
                <strong>Capabilities:</strong>
                <ul className="list-disc list-inside mt-1">
                  {tool.status.capabilities.slice(0, 2).map((cap, index) => (
                    <li key={index} className="text-xs">{cap.name}</li>
                  ))}
                </ul>
              </div>
            </div>

            <Button
              onClick={() => handleLaunchTool(tool)}
              disabled={!tool.status.isAvailable || launching === tool.id}
              className="w-full"
              variant={tool.status.isAvailable ? 'default' : 'secondary'}
            >
              {launching === tool.id ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Launching...
                </>
              ) : (
                `Launch ${tool.name}`
              )}
            </Button>

            {!tool.status.isAvailable && (
              <p className="text-xs text-red-600 mt-2">
                {tool.status.errorMessage || 'Tool not available'}
              </p>
            )}
          </Card>
        ))}
      </div>

      {tools.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No coding tools configured</p>
          <p className="text-sm text-gray-400 mt-1">
            Configure your preferred coding environments in settings
          </p>
        </div>
      )}

      {/* Launch Configuration Modal */}
      <Modal
        isOpen={showLaunchModal}
        onClose={() => setShowLaunchModal(false)}
        title={`Launch ${selectedTool?.name}`}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Configure how you want to launch {selectedTool?.name}
            </p>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={launchOptions.openInNewWindow}
                onChange={(e) => setLaunchOptions(prev => ({
                  ...prev,
                  openInNewWindow: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Open in new window</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={launchOptions.includeProjectContext}
                onChange={(e) => setLaunchOptions(prev => ({
                  ...prev,
                  includeProjectContext: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Include project context</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={launchOptions.preloadPrompts}
                onChange={(e) => setLaunchOptions(prev => ({
                  ...prev,
                  preloadPrompts: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Preload coding prompts</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={launchOptions.autoStartCoding}
                onChange={(e) => setLaunchOptions(prev => ({
                  ...prev,
                  autoStartCoding: e.target.checked
                }))}
                className="rounded"
              />
              <span className="text-sm">Auto-start coding session</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Custom Instructions (Optional)
            </label>
            <textarea
              value={launchOptions.customInstructions}
              onChange={(e) => setLaunchOptions(prev => ({
                ...prev,
                customInstructions: e.target.value
              }))}
              placeholder="Add any specific instructions for the coding session..."
              className="w-full p-2 border rounded-md text-sm"
              rows={3}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              onClick={() => setShowLaunchModal(false)}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmLaunch}
              className="flex-1"
            >
              Launch
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}