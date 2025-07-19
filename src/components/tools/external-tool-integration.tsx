'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading'
import { ToolLauncher } from './tool-launcher'
import { ApiKeyManager } from './api-key-manager'
import { ProjectExporter } from './project-exporter'
import { ExternalTool, ExternalToolConfig, ToolIntegrationStatus } from '@/types/external-tools'

interface ExternalToolIntegrationProps {
  projectId: string
  projectName: string
  blueprint: any
  prompts?: string[]
}

interface ToolWithStatus extends ExternalToolConfig {
  status: ToolIntegrationStatus
}

export function ExternalToolIntegration({ 
  projectId, 
  projectName, 
  blueprint, 
  prompts 
}: ExternalToolIntegrationProps) {
  const [tools, setTools] = useState<ToolWithStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'launch' | 'export' | 'settings'>('launch')
  const [selectedTool, setSelectedTool] = useState<ToolWithStatus | null>(null)

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

  const getStatusColor = (status: string) => {
    switch (status) {
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

  const tabs = [
    { id: 'launch', label: 'Launch Tools', icon: '🚀' },
    { id: 'export', label: 'Export Project', icon: '📦' },
    { id: 'settings', label: 'Tool Settings', icon: '⚙️' }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2">Loading external tools...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">External Tool Integration</h2>
        <p className="text-gray-600">
          Launch your project in coding environments with AI assistance
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'launch' && (
          <div className="space-y-6">
            {/* Quick Launch Section */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Launch</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tools.filter(tool => tool.status.isAvailable).slice(0, 4).map((tool) => (
                  <Button
                    key={tool.id}
                    onClick={() => {
                      // Quick launch functionality
                      const launchRequest = {
                        toolId: tool.id,
                        projectId,
                        blueprint,
                        prompts,
                        options: tool.launchOptions
                      }
                      
                      fetch('/api/tools/launch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(launchRequest)
                      }).then(response => response.json())
                        .then(result => {
                          if (result.success && result.toolUrl) {
                            window.open(result.toolUrl, '_blank')
                          }
                        })
                    }}
                    className="flex flex-col items-center p-4 h-auto"
                    variant="outline"
                  >
                    <span className="text-2xl mb-2">{getToolIcon(tool.tool)}</span>
                    <span className="text-sm font-medium">{tool.name}</span>
                    <Badge className={`text-xs mt-1 ${getStatusColor(tool.status.healthStatus)}`}>
                      {tool.status.healthStatus}
                    </Badge>
                  </Button>
                ))}
              </div>
            </Card>

            {/* Detailed Tool Launcher */}
            <ToolLauncher
              projectId={projectId}
              blueprint={blueprint}
              prompts={prompts}
              onLaunch={(result) => {
                console.log('Tool launched:', result)
              }}
            />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            {/* Export Options */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Export for Coding Environments</h3>
              <p className="text-gray-600 mb-6">
                Export your project in formats optimized for different coding tools and environments.
              </p>
              
              <ProjectExporter
                projectId={projectId}
                projectName={projectName}
                blueprint={blueprint}
                onExportComplete={(result) => {
                  console.log('Export completed:', result)
                }}
              />
            </Card>

            {/* Export History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Exports</h3>
              <div className="text-center py-8 text-gray-500">
                <p>No recent exports</p>
                <p className="text-sm">Your export history will appear here</p>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Tool Configuration */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Tool Configuration</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tools.map((tool) => (
                  <div key={tool.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getToolIcon(tool.tool)}</span>
                        <div>
                          <h4 className="font-medium">{tool.name}</h4>
                          <Badge className={`text-xs ${getStatusColor(tool.status.healthStatus)}`}>
                            {tool.status.healthStatus}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
                      >
                        {selectedTool?.id === tool.id ? 'Hide' : 'Configure'}
                      </Button>
                    </div>

                    {selectedTool?.id === tool.id && (
                      <div className="mt-4 pt-4 border-t">
                        <ApiKeyManager
                          toolId={tool.id}
                          toolName={tool.name}
                          tool={tool.tool}
                        />
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="text-sm text-gray-600">
                        <strong>Capabilities:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {tool.status.capabilities.slice(0, 2).map((cap, index) => (
                            <li key={index} className="text-xs">{cap.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Integration Status */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Integration Status</h3>
              <div className="space-y-3">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getToolIcon(tool.tool)}</span>
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-gray-600">
                          Last checked: {tool.status.lastChecked.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(tool.status.healthStatus)}>
                        {tool.status.healthStatus}
                      </Badge>
                      {tool.status.version && (
                        <span className="text-xs text-gray-500">v{tool.status.version}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}