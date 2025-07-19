'use client'

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { 
  Brain, 
  Database, 
  Zap, 
  GitBranch, 
  Settings, 
  ArrowRight,
  Play,
  Square,
  Diamond,
  Cpu
} from 'lucide-react'

import { NodeType } from '@/types'

interface NodeInput {
  id: string
  type: string
  required: boolean
  description: string
}

interface NodeOutput {
  id: string
  type: string
  description: string
}

interface WorkflowNodeData {
  label: string
  nodeType: NodeType
  configuration?: Record<string, any>
  inputs?: NodeInput[]
  outputs?: NodeOutput[]
  editable?: boolean
  isDark?: boolean
}

const nodeIcons = {
  [NodeType.INPUT]: Play,
  [NodeType.PROCESSING]: Cpu,
  [NodeType.AI_SERVICE]: Brain,
  [NodeType.OUTPUT]: Square,
  [NodeType.DECISION]: Diamond,
  [NodeType.INTEGRATION]: GitBranch,
}

const nodeColors = {
  [NodeType.INPUT]: 'bg-green-500',
  [NodeType.PROCESSING]: 'bg-blue-500',
  [NodeType.AI_SERVICE]: 'bg-purple-500',
  [NodeType.OUTPUT]: 'bg-orange-500',
  [NodeType.DECISION]: 'bg-yellow-500',
  [NodeType.INTEGRATION]: 'bg-indigo-500',
}

const nodeBorderColors = {
  [NodeType.INPUT]: 'border-green-600',
  [NodeType.PROCESSING]: 'border-blue-600',
  [NodeType.AI_SERVICE]: 'border-purple-600',
  [NodeType.OUTPUT]: 'border-orange-600',
  [NodeType.DECISION]: 'border-yellow-600',
  [NodeType.INTEGRATION]: 'border-indigo-600',
}

export const WorkflowNodeComponent = memo<NodeProps<WorkflowNodeData>>(
  ({ data, selected }) => {
    const Icon = nodeIcons[data.nodeType] || Settings
    const bgColor = nodeColors[data.nodeType] || 'bg-gray-500'
    const borderColor = nodeBorderColors[data.nodeType] || 'border-gray-600'
    const isDark = data.isDark || false

    // Theme-aware colors
    const nodeBackground = isDark ? 'bg-gray-800' : 'bg-white'
    const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
    const subtextColor = isDark ? 'text-gray-400' : 'text-gray-600'
    const borderColorDefault = isDark ? 'border-gray-600' : 'border-gray-300'
    const handleColor = isDark ? '#8b5cf6' : '#6366f1'
    const handleBorder = isDark ? '2px solid #374151' : '2px solid white'

    return (
      <div
        className={`
          relative min-w-[200px] rounded-lg border-2 ${nodeBackground} shadow-lg transition-all duration-200
          ${selected ? `${borderColor} shadow-xl` : borderColorDefault}
          ${data.editable ? 'hover:shadow-xl' : ''}
        `}
      >
        {/* Input Handles */}
        {data.inputs?.map((input, index) => (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={input.id}
            style={{
              top: `${((index + 1) * 100) / (data.inputs!.length + 1)}%`,
              background: handleColor,
              width: 12,
              height: 12,
              border: handleBorder,
            }}
            className="transition-all duration-200 hover:scale-110"
          />
        ))}

        {/* Default input handle if no specific inputs */}
        {(!data.inputs || data.inputs.length === 0) && data.nodeType !== NodeType.INPUT && (
          <Handle
            type="target"
            position={Position.Left}
            style={{
              background: handleColor,
              width: 12,
              height: 12,
              border: handleBorder,
            }}
            className="transition-all duration-200 hover:scale-110"
          />
        )}

        {/* Node Header */}
        <div className={`flex items-center gap-3 rounded-t-lg ${bgColor} px-4 py-3 text-white`}>
          <Icon size={20} />
          <span className="font-semibold text-sm">{data.label}</span>
        </div>

        {/* Node Body */}
        <div className="p-4">
          <div className={`text-xs ${subtextColor} mb-2`}>
            {data.nodeType.replace('_', ' ').toLowerCase()}
          </div>
          
          {/* Configuration Preview */}
          {data.configuration && Object.keys(data.configuration).length > 0 && (
            <div className="mt-2">
              <div className={`text-xs font-medium ${textColor} mb-1`}>Configuration:</div>
              <div className={`text-xs ${subtextColor} space-y-1`}>
                {Object.entries(data.configuration).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="truncate">{key}:</span>
                    <span className="ml-2 truncate font-mono">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(data.configuration).length > 3 && (
                  <div className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    +{Object.keys(data.configuration).length - 3} more...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input/Output Info */}
          {((data.inputs && data.inputs.length > 0) || (data.outputs && data.outputs.length > 0)) && (
            <div className={`mt-3 pt-2 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
              {data.inputs && data.inputs.length > 0 && (
                <div className="mb-2">
                  <div className={`text-xs font-medium ${textColor} mb-1`}>
                    Inputs ({data.inputs.length}):
                  </div>
                  <div className={`text-xs ${subtextColor}`}>
                    {data.inputs.slice(0, 2).map(input => input.type).join(', ')}
                    {data.inputs.length > 2 && ` +${data.inputs.length - 2} more`}
                  </div>
                </div>
              )}
              
              {data.outputs && data.outputs.length > 0 && (
                <div>
                  <div className={`text-xs font-medium ${textColor} mb-1`}>
                    Outputs ({data.outputs.length}):
                  </div>
                  <div className={`text-xs ${subtextColor}`}>
                    {data.outputs.slice(0, 2).map(output => output.type).join(', ')}
                    {data.outputs.length > 2 && ` +${data.outputs.length - 2} more`}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Output Handles */}
        {data.outputs?.map((output, index) => (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={output.id}
            style={{
              top: `${((index + 1) * 100) / (data.outputs!.length + 1)}%`,
              background: handleColor,
              width: 12,
              height: 12,
              border: handleBorder,
            }}
            className="transition-all duration-200 hover:scale-110"
          />
        ))}

        {/* Default output handle if no specific outputs */}
        {(!data.outputs || data.outputs.length === 0) && data.nodeType !== NodeType.OUTPUT && (
          <Handle
            type="source"
            position={Position.Right}
            style={{
              background: handleColor,
              width: 12,
              height: 12,
              border: handleBorder,
            }}
            className="transition-all duration-200 hover:scale-110"
          />
        )}
      </div>
    )
  }
)

WorkflowNodeComponent.displayName = 'WorkflowNodeComponent'