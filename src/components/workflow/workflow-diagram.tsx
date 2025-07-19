'use client'

import React, { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  NodeTypes,
  EdgeTypes,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { AIWorkflow, WorkflowNode, NodeType } from '@/types'
import { WorkflowNodeComponent } from './workflow-node'
import { WorkflowEdgeComponent } from './workflow-edge'
import { useTheme } from '@/components/providers/theme-provider'

interface WorkflowDiagramProps {
  workflow: AIWorkflow
  onWorkflowChange?: (workflow: AIWorkflow) => void
  editable?: boolean
  className?: string
}

const nodeTypes: NodeTypes = {
  [NodeType.INPUT]: WorkflowNodeComponent,
  [NodeType.PROCESSING]: WorkflowNodeComponent,
  [NodeType.AI_SERVICE]: WorkflowNodeComponent,
  [NodeType.OUTPUT]: WorkflowNodeComponent,
  [NodeType.DECISION]: WorkflowNodeComponent,
  [NodeType.INTEGRATION]: WorkflowNodeComponent,
}

const edgeTypes: EdgeTypes = {
  default: WorkflowEdgeComponent,
}

function WorkflowDiagramInner({
  workflow,
  onWorkflowChange,
  editable = false,
  className = '',
}: WorkflowDiagramProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  // Theme-aware colors
  const colors = {
    edge: isDark ? '#8b5cf6' : '#6366f1',
    background: isDark ? '#1f2937' : '#f9fafb',
    backgroundDots: isDark ? '#374151' : '#e5e7eb',
    miniMapNode: isDark ? '#8b5cf6' : '#6366f1',
  }

  // Convert workflow nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.label,
        nodeType: node.type,
        configuration: node.configuration,
        inputs: node.inputs,
        outputs: node.outputs,
        editable,
        isDark,
      },
      draggable: editable,
      selectable: editable,
    }))
  }, [workflow.nodes, editable, isDark])

  // Convert workflow edges to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: 'default',
      animated: true,
      style: {
        stroke: colors.edge,
        strokeWidth: 2,
      },
    }))
  }, [workflow.edges, colors.edge])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!editable) return

      const newEdge = {
        ...params,
        id: `edge-${Date.now()}`,
        animated: true,
        style: {
          stroke: colors.edge,
          strokeWidth: 2,
        },
      }

      setEdges((eds) => addEdge(newEdge, eds))

      // Update workflow if callback provided
      if (onWorkflowChange) {
        const updatedWorkflow: AIWorkflow = {
          ...workflow,
          edges: [
            ...workflow.edges,
            {
              id: newEdge.id,
              source: params.source!,
              target: params.target!,
              sourceHandle: params.sourceHandle || undefined,
              targetHandle: params.targetHandle || undefined,
              label: undefined,
            },
          ],
        }
        onWorkflowChange(updatedWorkflow)
      }
    },
    [editable, setEdges, workflow, onWorkflowChange]
  )

  // Handle node changes
  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes)

      // Update workflow if callback provided and editable
      if (onWorkflowChange && editable) {
        // Get updated nodes after changes
        const updatedNodes = nodes.map((node) => {
          const change = changes.find((c: any) => c.id === node.id)
          if (change && change.type === 'position' && change.position) {
            return {
              ...node,
              position: change.position,
            }
          }
          return node
        })

        const updatedWorkflowNodes: WorkflowNode[] = updatedNodes.map((node) => ({
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          position: node.position,
          configuration: node.data.configuration || {},
          inputs: node.data.inputs || [],
          outputs: node.data.outputs || [],
        }))

        const updatedWorkflow: AIWorkflow = {
          ...workflow,
          nodes: updatedWorkflowNodes,
        }
        onWorkflowChange(updatedWorkflow)
      }
    },
    [onNodesChange, nodes, workflow, onWorkflowChange, editable]
  )

  return (
    <div className={`h-full w-full ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineStyle={{
          stroke: colors.edge,
          strokeWidth: 2,
        }}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        fitView
        attributionPosition="bottom-left"
        proOptions={{ hideAttribution: true }}
      >
        <Controls 
          showZoom={true}
          showFitView={true}
          showInteractive={editable}
          position="top-left"
        />
        <MiniMap 
          nodeColor={colors.miniMapNode}
          nodeStrokeWidth={3}
          position="top-right"
          pannable
          zoomable
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1}
          color={colors.backgroundDots}
        />
      </ReactFlow>
    </div>
  )
}

export function WorkflowDiagram(props: WorkflowDiagramProps) {
  return (
    <ReactFlowProvider>
      <WorkflowDiagramInner {...props} />
    </ReactFlowProvider>
  )
}