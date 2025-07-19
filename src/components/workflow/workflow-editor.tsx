'use client'

import React, { useState, useCallback } from 'react'
import { 
  Plus, 
  Save, 
  Download, 
  Upload, 
  Play, 
  Settings,
  Trash2,
  Copy,
  Undo,
  Redo
} from 'lucide-react'

import { AIWorkflow, NodeType, WorkflowModule } from '@/types'
import { WorkflowDiagram } from './workflow-diagram'
import { WorkflowGenerator } from '@/lib/workflow-generator'
import { WorkflowModuleSelector } from './workflow-module-selector'
import { WorkflowModuleConfig } from './workflow-module-config'
import { WorkflowExportImport } from '@/lib/workflow-export-import'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WorkflowEditorProps {
  initialWorkflow?: AIWorkflow
  onSave?: (workflow: AIWorkflow) => void
  onExport?: (workflow: AIWorkflow, format: 'json' | 'png') => void
  className?: string
}

export function WorkflowEditor({
  initialWorkflow,
  onSave,
  onExport,
  className = '',
}: WorkflowEditorProps) {
  const [workflow, setWorkflow] = useState<AIWorkflow>(
    initialWorkflow || WorkflowGenerator.createSampleWorkflow()
  )
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>(
    initialWorkflow?.modules.map(m => m.id) || []
  )
  const [moduleConfigurations, setModuleConfigurations] = useState<Record<string, Record<string, any>>>({})
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'diagram' | 'modules' | 'config'>('diagram')
  const [selectedModuleForConfig, setSelectedModuleForConfig] = useState<string | null>(null)
  const [history, setHistory] = useState<AIWorkflow[]>([workflow])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Handle workflow changes
  const handleWorkflowChange = useCallback((updatedWorkflow: AIWorkflow) => {
    setWorkflow(updatedWorkflow)
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(updatedWorkflow)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo/Redo functionality
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setWorkflow(history[newIndex])
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setWorkflow(history[newIndex])
    }
  }, [history, historyIndex])

  // Add new node
  const handleAddNode = useCallback((nodeType: NodeType) => {
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      label: `New ${nodeType.replace('_', ' ')}`,
      position: { x: 400, y: 200 },
      configuration: {},
      inputs: [],
      outputs: [],
    }

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, newNode],
    }

    handleWorkflowChange(updatedWorkflow)
  }, [workflow, handleWorkflowChange])

  // Delete selected nodes
  const handleDeleteNodes = useCallback(() => {
    if (selectedNodes.length === 0) return

    const updatedWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter(node => !selectedNodes.includes(node.id)),
      edges: workflow.edges.filter(edge => 
        !selectedNodes.includes(edge.source) && !selectedNodes.includes(edge.target)
      ),
    }

    handleWorkflowChange(updatedWorkflow)
    setSelectedNodes([])
  }, [workflow, selectedNodes, handleWorkflowChange])

  // Duplicate selected nodes
  const handleDuplicateNodes = useCallback(() => {
    if (selectedNodes.length === 0) return

    const nodesToDuplicate = workflow.nodes.filter(node => selectedNodes.includes(node.id))
    const duplicatedNodes = nodesToDuplicate.map(node => ({
      ...node,
      id: `${node.id}-copy-${Date.now()}`,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
      label: `${node.label} (Copy)`,
    }))

    const updatedWorkflow = {
      ...workflow,
      nodes: [...workflow.nodes, ...duplicatedNodes],
    }

    handleWorkflowChange(updatedWorkflow)
  }, [workflow, selectedNodes, handleWorkflowChange])

  // Generate new workflow
  const handleGenerateWorkflow = useCallback((options: {
    complexity: 'simple' | 'moderate' | 'complex'
    parallel: boolean
    modules: string[]
  }) => {
    const newWorkflow = WorkflowGenerator.generateWorkflow({
      features: ['core-features'],
      complexity: options.complexity,
      includeModules: options.modules,
      parallel: options.parallel,
    })

    handleWorkflowChange(newWorkflow)
  }, [handleWorkflowChange])

  // Save workflow
  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(workflow)
    }
  }, [workflow, onSave])

  // Export workflow
  const handleExport = useCallback((format: 'json' | 'png') => {
    if (format === 'json') {
      WorkflowExportImport.exportToFile(workflow, {
        name: 'Custom Workflow',
        description: 'Exported workflow configuration',
        tags: ['custom', 'export'],
        complexity: workflow.nodes.length > 10 ? 'complex' : workflow.nodes.length > 5 ? 'moderate' : 'simple'
      })
    } else if (onExport) {
      onExport(workflow, format)
    }
  }, [workflow, onExport])

  // Handle module selection
  const handleModuleToggle = useCallback((moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }, [])

  // Handle module configuration changes
  const handleModuleConfigurationChange = useCallback((moduleId: string, config: Record<string, any>) => {
    setModuleConfigurations(prev => ({
      ...prev,
      [moduleId]: config
    }))
  }, [])

  // Import workflow
  const handleImport = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const result = await WorkflowExportImport.importFromFile(file)
        if (result.success && result.workflow) {
          handleWorkflowChange(result.workflow)
          setSelectedModules(result.workflow.modules.map(m => m.id))
        } else {
          console.error('Import failed:', result.errors)
          // TODO: Show error toast
        }
      }
    }
    input.click()
  }, [handleWorkflowChange])

  // Generate workflow with selected modules
  const handleGenerateWithModules = useCallback(() => {
    const newWorkflow = WorkflowGenerator.generateWorkflow({
      features: ['core-features'],
      complexity: selectedModules.length > 5 ? 'complex' : selectedModules.length > 2 ? 'moderate' : 'simple',
      includeModules: selectedModules,
      parallel: workflow.configuration.parallel,
    })

    handleWorkflowChange(newWorkflow)
  }, [selectedModules, workflow.configuration.parallel, handleWorkflowChange])

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUndo}
            disabled={historyIndex === 0}
          >
            <Undo size={16} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRedo}
            disabled={historyIndex === history.length - 1}
          >
            <Redo size={16} />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings size={16} />
            {isEditing ? 'View' : 'Edit'}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
          >
            <Upload size={16} />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('json')}
          >
            <Download size={16} />
            Export JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('png')}
          >
            <Download size={16} />
            Export PNG
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
          >
            <Save size={16} />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {isEditing && (
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-6">
              {/* Node Palette */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Add Nodes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(NodeType).map(nodeType => (
                    <Button
                      key={nodeType}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddNode(nodeType)}
                      className="text-xs"
                    >
                      <Plus size={14} />
                      {nodeType.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDuplicateNodes}
                    disabled={selectedNodes.length === 0}
                    className="w-full justify-start"
                  >
                    <Copy size={14} />
                    Duplicate Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteNodes}
                    disabled={selectedNodes.length === 0}
                    className="w-full justify-start text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                    Delete Selected
                  </Button>
                </div>
              </Card>

              {/* Workflow Templates */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Templates</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWorkflow({
                      complexity: 'simple',
                      parallel: false,
                      modules: [],
                    })}
                    className="w-full justify-start"
                  >
                    Simple Workflow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWorkflow({
                      complexity: 'moderate',
                      parallel: false,
                      modules: ['Auth', 'Payment'],
                    })}
                    className="w-full justify-start"
                  >
                    Standard Workflow
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateWorkflow({
                      complexity: 'complex',
                      parallel: true,
                      modules: ['Auth', 'Payment', 'Analytics'],
                    })}
                    className="w-full justify-start"
                  >
                    Complex Workflow
                  </Button>
                </div>
              </Card>

              {/* Modules */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Modules</h3>
                <div className="space-y-2">
                  {workflow.modules.map(module => (
                    <div
                      key={module.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div>
                        <div className="font-medium text-sm">{module.name}</div>
                        <div className="text-xs text-gray-600">{module.description}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {module.nodes.length} nodes
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Configuration */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Configuration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Execution</label>
                    <div className="text-xs text-gray-600">
                      {workflow.configuration.parallel ? 'Parallel' : 'Sequential'}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Timeout</label>
                    <div className="text-xs text-gray-600">
                      {workflow.configuration.timeout}s
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Retries</label>
                    <div className="text-xs text-gray-600">
                      {workflow.configuration.retries}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Main Workflow Area */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white">
            <button
              onClick={() => setActiveTab('diagram')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'diagram'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Workflow Diagram
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === 'modules'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Module Selection
            </button>
            {selectedModuleForConfig && (
              <button
                onClick={() => setActiveTab('config')}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'config'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Module Config
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'diagram' && (
              <WorkflowDiagram
                workflow={workflow}
                onWorkflowChange={handleWorkflowChange}
                editable={isEditing}
                className="h-full"
              />
            )}

            {activeTab === 'modules' && (
              <div className="h-full overflow-y-auto p-4">
                <WorkflowModuleSelector
                  selectedModules={selectedModules}
                  moduleConfigurations={moduleConfigurations}
                  onModuleToggle={handleModuleToggle}
                  onConfigurationChange={handleModuleConfigurationChange}
                  onExport={(modules) => {
                    const exportData = WorkflowExportImport.exportModulesConfig(modules, moduleConfigurations)
                    const blob = new Blob([exportData], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `workflow-modules-${Date.now()}.json`
                    link.click()
                    URL.revokeObjectURL(url)
                  }}
                  onImport={(modules) => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const content = event.target?.result as string
                          const result = WorkflowExportImport.importModulesConfig(content)
                          if (result.success && result.modules && result.configurations) {
                            setSelectedModules(result.modules.map(m => m.id))
                            setModuleConfigurations(result.configurations)
                          }
                        }
                        reader.readAsText(file)
                      }
                    }
                    input.click()
                  }}
                />
                
                {selectedModules.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Selected Modules</h3>
                      <Button
                        onClick={handleGenerateWithModules}
                        className="flex items-center gap-2"
                      >
                        <Play size={16} />
                        Generate Workflow
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedModules.map(moduleId => {
                        const module = workflow.modules.find(m => m.id === moduleId)
                        if (!module) return null
                        
                        return (
                          <Card key={moduleId} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{module.name}</h4>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedModuleForConfig(moduleId)
                                  setActiveTab('config')
                                }}
                              >
                                <Settings size={14} />
                              </Button>
                            </div>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </Card>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'config' && selectedModuleForConfig && (
              <div className="h-full overflow-y-auto p-4">
                {(() => {
                  const module = workflow.modules.find(m => m.id === selectedModuleForConfig)
                  if (!module) return <div>Module not found</div>
                  
                  return (
                    <WorkflowModuleConfig
                      module={module}
                      configuration={moduleConfigurations[selectedModuleForConfig] || {}}
                      onConfigurationChange={(config) => 
                        handleModuleConfigurationChange(selectedModuleForConfig, config)
                      }
                      onSave={() => {
                        // TODO: Show success message
                        console.log('Configuration saved for module:', selectedModuleForConfig)
                      }}
                      onReset={() => {
                        setModuleConfigurations(prev => {
                          const updated = { ...prev }
                          delete updated[selectedModuleForConfig]
                          return updated
                        })
                      }}
                      onDuplicate={() => {
                        const newModuleId = `${selectedModuleForConfig}-copy-${Date.now()}`
                        const originalModule = workflow.modules.find(m => m.id === selectedModuleForConfig)
                        if (originalModule) {
                          const duplicatedModule = {
                            ...originalModule,
                            id: newModuleId,
                            name: `${originalModule.name} (Copy)`,
                          }
                          
                          const updatedWorkflow = {
                            ...workflow,
                            modules: [...workflow.modules, duplicatedModule],
                          }
                          
                          handleWorkflowChange(updatedWorkflow)
                          setSelectedModules(prev => [...prev, newModuleId])
                          setModuleConfigurations(prev => ({
                            ...prev,
                            [newModuleId]: moduleConfigurations[selectedModuleForConfig] || {}
                          }))
                        }
                      }}
                      onDelete={() => {
                        const updatedWorkflow = {
                          ...workflow,
                          modules: workflow.modules.filter(m => m.id !== selectedModuleForConfig),
                        }
                        
                        handleWorkflowChange(updatedWorkflow)
                        setSelectedModules(prev => prev.filter(id => id !== selectedModuleForConfig))
                        setModuleConfigurations(prev => {
                          const updated = { ...prev }
                          delete updated[selectedModuleForConfig]
                          return updated
                        })
                        setSelectedModuleForConfig(null)
                        setActiveTab('modules')
                      }}
                    />
                  )
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        <div>
          {workflow.nodes.length} nodes, {workflow.edges.length} edges
        </div>
        <div>
          {selectedNodes.length > 0 && `${selectedNodes.length} selected`}
        </div>
      </div>
    </div>
  )
}