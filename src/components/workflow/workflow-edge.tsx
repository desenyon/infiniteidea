'use client'

import React from 'react'
import { 
  BaseEdge, 
  EdgeProps, 
  getSmoothStepPath,
  EdgeLabelRenderer,
} from '@xyflow/react'

export function WorkflowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  label,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Theme-aware colors (we'll get this from the parent or use CSS variables)
  const isDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
  const edgeColor = isDark ? '#8b5cf6' : '#6366f1'
  const selectedColor = isDark ? '#a855f7' : '#4f46e5'
  const labelBg = isDark ? 'bg-gray-800' : 'bg-white'
  const labelBorder = isDark ? 'border-gray-600' : 'border-gray-300'
  const labelText = isDark ? 'text-gray-100' : 'text-gray-700'

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? selectedColor : edgeColor,
        }}
        markerEnd="url(#workflow-arrow)"
      />
      
      {/* Custom arrow marker */}
      <defs>
        <marker
          id="workflow-arrow"
          markerWidth="12"
          markerHeight="12"
          refX="6"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={selected ? selectedColor : edgeColor}
          />
        </marker>
      </defs>

      {/* Edge Label */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <div className={`${labelBg} border ${labelBorder} rounded px-2 py-1 shadow-sm text-xs font-medium ${labelText}`}>
              {label}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}