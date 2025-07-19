'use client'

import React, { useState } from 'react'
import { WorkflowEditor } from '@/components/workflow/workflow-editor'
import { WorkflowDiagram } from '@/components/workflow/workflow-diagram'
import { WorkflowGenerator } from '@/lib/workflow-generator'
import { AIWorkflow } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function WorkflowTestPage() {
  const [currentWorkflow, setCurrentWorkflow] = useState<AIWorkflow>(
    WorkflowGenerator.createSampleWorkflow()
  )
  const [viewMode, setViewMode] = useState<'editor' | 'viewer'>('viewer')

  const handleSaveWorkflow = (workflow: AIWorkflow) => {
    console.log('Saving workflow:', workflow)
    // Here you would typically save to your backend
    alert('Workflow saved successfully!')
  }

  const handleExportWorkflow = (workflow: AIWorkflow, format: 'json' | 'png') => {
    if (format === 'json') {
      const dataStr = JSON.stringify(workflow, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = 'workflow.json'
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
    } else {
      // For PNG export, you would typically use a library like html2canvas
      alert('PNG export would be implemented with html2canvas or similar')
    }
  }

  const loadSampleWorkflows = () => {
    return [
      {
        name: 'Simple Workflow',
        workflow: WorkflowGenerator.generateWorkflow({
          features: ['basic-crud'],
          complexity: 'simple',
          parallel: false,
        }),
      },
      {
        name: 'Standard SaaS Workflow',
        workflow: WorkflowGenerator.generateWorkflow({
          features: ['user-auth', 'dashboard', 'api'],
          complexity: 'moderate',
          includeModules: ['Auth', 'Payment'],
          parallel: false,
        }),
      },
      {
        name: 'Complex AI App Workflow',
        workflow: WorkflowGenerator.createComplexWorkflow(),
      },
    ]
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI Workflow Visualization System
          </h1>
          <p className="text-muted-foreground">
            Interactive workflow diagram generator and editor for AI-powered blueprint creation
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant={viewMode === 'viewer' ? 'default' : 'outline'}
              onClick={() => setViewMode('viewer')}
            >
              Viewer Mode
            </Button>
            <Button
              variant={viewMode === 'editor' ? 'default' : 'outline'}
              onClick={() => setViewMode('editor')}
            >
              Editor Mode
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {loadSampleWorkflows().map((sample, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setCurrentWorkflow(sample.workflow)}
              >
                {sample.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Workflow Display */}
        <Card className="h-[800px] overflow-hidden">
          {viewMode === 'editor' ? (
            <WorkflowEditor
              initialWorkflow={currentWorkflow}
              onSave={handleSaveWorkflow}
              onExport={handleExportWorkflow}
              className="h-full"
            />
          ) : (
            <div className="h-full p-4">
              <div className="mb-4">
                <h2 className="text-xl font-semibold mb-2 text-foreground">Workflow Visualization</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{currentWorkflow.nodes.length} nodes</span>
                  <span>{currentWorkflow.edges.length} connections</span>
                  <span>{currentWorkflow.modules.length} modules</span>
                  <span>
                    Execution: {currentWorkflow.configuration.parallel ? 'Parallel' : 'Sequential'}
                  </span>
                </div>
              </div>
              <div className="h-[calc(100%-80px)]">
                <WorkflowDiagram
                  workflow={currentWorkflow}
                  editable={false}
                  className="h-full"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Workflow Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">Workflow Modules</h3>
            <div className="space-y-2">
              {currentWorkflow.modules.map(module => (
                <div key={module.id} className="p-2 bg-muted rounded">
                  <div className="font-medium text-sm text-foreground">{module.name}</div>
                  <div className="text-xs text-muted-foreground">{module.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {module.nodes.length} nodes • {module.category}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">Node Types</h3>
            <div className="space-y-2">
              {Object.entries(
                currentWorkflow.nodes.reduce((acc, node) => {
                  acc[node.type] = (acc[node.type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([type, count]) => (
                <div key={type} className="flex justify-between text-sm">
                  <span className="text-foreground">{type.replace('_', ' ')}</span>
                  <span className="text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-3 text-foreground">Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-foreground">Execution Mode:</span>
                <span className="text-muted-foreground">
                  {currentWorkflow.configuration.parallel ? 'Parallel' : 'Sequential'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Timeout:</span>
                <span className="text-muted-foreground">{currentWorkflow.configuration.timeout}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Max Retries:</span>
                <span className="text-muted-foreground">{currentWorkflow.configuration.retries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Fallback:</span>
                <span className="text-muted-foreground">
                  {currentWorkflow.configuration.fallbackEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}