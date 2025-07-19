"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AIWorkflow, NodeType, WorkflowNode, WorkflowEdge } from '@/types'
import { 
  Workflow, 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  Database,
  Brain,
  ArrowRight,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface AIWorkflowSectionProps {
  aiWorkflow: AIWorkflow
  compact?: boolean
}

export function AIWorkflowSection({ aiWorkflow, compact = false }: AIWorkflowSectionProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const getNodeIcon = (type: NodeType) => {
    switch (type) {
      case NodeType.INPUT:
        return Database
      case NodeType.AI_SERVICE:
        return Brain
      case NodeType.PROCESSING:
        return Settings
      case NodeType.OUTPUT:
        return CheckCircle
      case NodeType.DECISION:
        return AlertCircle
      case NodeType.INTEGRATION:
        return Zap
      default:
        return Settings
    }
  }

  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case NodeType.INPUT:
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case NodeType.AI_SERVICE:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case NodeType.PROCESSING:
        return 'bg-green-100 text-green-800 border-green-200'
      case NodeType.OUTPUT:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case NodeType.DECISION:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case NodeType.INTEGRATION:
        return 'bg-teal-100 text-teal-800 border-teal-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const selectedNodeData = useMemo(() => {
    return aiWorkflow.nodes.find(node => node.id === selectedNode)
  }, [selectedNode, aiWorkflow.nodes])

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId)
  }

  const handleAnimateFlow = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 3000)
  }

  // Create a simple grid layout for nodes
  const layoutNodes = (nodes: WorkflowNode[]) => {
    const columns = Math.ceil(Math.sqrt(nodes.length))
    return nodes.map((node, index) => ({
      ...node,
      gridPosition: {
        row: Math.floor(index / columns),
        col: index % columns
      }
    }))
  }

  const layoutedNodes = layoutNodes(aiWorkflow.nodes)

  return (
    <div className="space-y-6">
      {/* Workflow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5 text-primary" />
            Workflow Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{aiWorkflow.nodes.length}</div>
              <div className="text-sm text-muted-foreground">Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{aiWorkflow.edges.length}</div>
              <div className="text-sm text-muted-foreground">Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{aiWorkflow.modules.length}</div>
              <div className="text-sm text-muted-foreground">Modules</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {aiWorkflow.configuration.parallel ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-muted-foreground">Parallel</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Timeout: {aiWorkflow.configuration.timeout}s</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <span>Retries: {aiWorkflow.configuration.retries}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <span>Fallback: {aiWorkflow.configuration.fallbackEnabled ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Workflow Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5 text-primary" />
              Workflow Visualization
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAnimateFlow}
                disabled={isAnimating}
                className="flex items-center gap-2"
              >
                {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isAnimating ? 'Animating...' : 'Animate Flow'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-muted/20 rounded-lg p-6 min-h-[400px] overflow-auto">
            {/* Workflow Grid */}
            <div 
              className="relative"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.ceil(Math.sqrt(aiWorkflow.nodes.length))}, 1fr)`,
                gap: '3rem',
                minHeight: '300px'
              }}
            >
              {layoutedNodes.map((node, index) => {
                const Icon = getNodeIcon(node.type)
                const isSelected = selectedNode === node.id
                const isAnimated = isAnimating
                
                return (
                  <div key={node.id} className="relative flex flex-col items-center">
                    {/* Node */}
                    <div
                      onClick={() => handleNodeClick(node.id)}
                      className={`
                        relative cursor-pointer transition-all duration-300 transform hover:scale-105
                        ${isSelected ? 'scale-110 shadow-lg' : ''}
                        ${isAnimated ? 'animate-pulse' : ''}
                      `}
                    >
                      <div className={`
                        w-16 h-16 rounded-lg border-2 flex items-center justify-center
                        ${getNodeColor(node.type)}
                        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      {/* Node Label */}
                      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-xs font-medium whitespace-nowrap">{node.label}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {node.type}
                        </Badge>
                      </div>
                    </div>

                    {/* Connection Arrow (simplified) */}
                    {index < layoutedNodes.length - 1 && (
                      <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                        <ArrowRight className={`
                          h-4 w-4 text-muted-foreground
                          ${isAnimated ? 'animate-bounce' : ''}
                        `} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 border">
              <div className="text-xs font-medium mb-2">Node Types</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.values(NodeType).map((type) => {
                  const Icon = getNodeIcon(type)
                  return (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border ${getNodeColor(type)}`}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <span>{type}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNodeData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {React.createElement(getNodeIcon(selectedNodeData.type), { className: "h-5 w-5 text-primary" })}
              Node Details: {selectedNodeData.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge className={getNodeColor(selectedNodeData.type)}>
                      {selectedNodeData.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span className="font-mono text-xs">{selectedNodeData.id}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Configuration</h4>
                <div className="text-sm">
                  {Object.keys(selectedNodeData.configuration).length > 0 ? (
                    <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                      {JSON.stringify(selectedNodeData.configuration, null, 2)}
                    </pre>
                  ) : (
                    <span className="text-muted-foreground">No configuration</span>
                  )}
                </div>
              </div>
            </div>

            {!compact && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Inputs ({selectedNodeData.inputs.length})</h4>
                  <div className="space-y-2">
                    {selectedNodeData.inputs.map((input, index) => (
                      <div key={index} className="border rounded p-2 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{input.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {input.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">{input.description}</p>
                        {input.required && (
                          <Badge variant="outline" className="text-xs mt-1">Required</Badge>
                        )}
                      </div>
                    ))}
                    {selectedNodeData.inputs.length === 0 && (
                      <span className="text-muted-foreground text-sm">No inputs</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Outputs ({selectedNodeData.outputs.length})</h4>
                  <div className="space-y-2">
                    {selectedNodeData.outputs.map((output, index) => (
                      <div key={index} className="border rounded p-2 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{output.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {output.type}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs">{output.description}</p>
                      </div>
                    ))}
                    {selectedNodeData.outputs.length === 0 && (
                      <span className="text-muted-foreground text-sm">No outputs</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Workflow Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {aiWorkflow.modules.map((module, index) => (
              <div key={module.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{module.name}</h4>
                      <Badge variant="outline">{module.category}</Badge>
                      {module.required && (
                        <Badge className="bg-red-100 text-red-800">Required</Badge>
                      )}
                      {module.configurable && (
                        <Badge className="bg-blue-100 text-blue-800">Configurable</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{module.description}</p>
                  </div>
                </div>

                {!compact && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">
                      Associated Nodes ({module.nodes.length})
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {module.nodes.map((nodeId) => {
                        const node = aiWorkflow.nodes.find(n => n.id === nodeId)
                        return node ? (
                          <button
                            key={nodeId}
                            onClick={() => handleNodeClick(nodeId)}
                            className={`
                              text-xs px-2 py-1 rounded border transition-colors
                              ${selectedNode === nodeId 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted hover:bg-muted/80'
                              }
                            `}
                          >
                            {node.label}
                          </button>
                        ) : (
                          <Badge key={nodeId} variant="outline" className="text-xs">
                            {nodeId}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Connections */}
      {!compact && aiWorkflow.edges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Workflow Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aiWorkflow.edges.map((edge, index) => {
                const sourceNode = aiWorkflow.nodes.find(n => n.id === edge.source)
                const targetNode = aiWorkflow.nodes.find(n => n.id === edge.target)
                
                return (
                  <div key={edge.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sourceNode?.label || edge.source}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {targetNode?.label || edge.target}
                      </Badge>
                    </div>
                    {edge.label && (
                      <div className="text-sm text-muted-foreground">
                        {edge.label}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}