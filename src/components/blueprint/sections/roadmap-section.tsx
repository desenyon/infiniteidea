"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Roadmap, Priority, Phase, Task } from '@/types'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Pause,
  Users,
  Target,
  Flag,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface RoadmapSectionProps {
  roadmap: Roadmap
  compact?: boolean
}

export function RoadmapSection({ roadmap, compact = false }: RoadmapSectionProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  const togglePhaseExpansion = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId)
    } else {
      newExpanded.add(phaseId)
    }
    setExpandedPhases(newExpanded)
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return 'bg-red-100 text-red-800 border-red-200'
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case Priority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case Priority.LOW:
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'blocked':
        return 'bg-red-100 text-red-800'
      case 'not_started':
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 8) return `${hours}h`
    const days = Math.ceil(hours / 8)
    if (days < 5) return `${days}d`
    const weeks = Math.ceil(days / 5)
    return `${weeks}w`
  }

  const calculatePhaseProgress = (phase: Phase) => {
    const completedTasks = phase.tasks.filter(task => task.status === 'completed').length
    return phase.tasks.length > 0 ? (completedTasks / phase.tasks.length) * 100 : 0
  }

  const totalCompletedHours = roadmap.phases.reduce((total, phase) => {
    return total + phase.tasks
      .filter(task => task.status === 'completed')
      .reduce((sum, task) => sum + task.estimatedHours, 0)
  }, 0)

  const overallProgress = roadmap.totalEstimate > 0 ? (totalCompletedHours / roadmap.totalEstimate) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Roadmap Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Roadmap Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{roadmap.phases.length}</div>
              <div className="text-sm text-muted-foreground">Phases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {roadmap.phases.reduce((sum, phase) => sum + phase.tasks.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatDuration(roadmap.totalEstimate)}
              </div>
              <div className="text-sm text-muted-foreground">Est. Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{roadmap.timeline}</div>
              <div className="text-sm text-muted-foreground">Timeline</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
            <div className="text-xs text-muted-foreground">
              {formatDuration(totalCompletedHours)} of {formatDuration(roadmap.totalEstimate)} completed
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            Development Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmap.phases.map((phase, phaseIndex) => {
              const isExpanded = expandedPhases.has(phase.id)
              const progress = calculatePhaseProgress(phase)
              
              return (
                <div key={phase.id} className="border rounded-lg">
                  {/* Phase Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => togglePhaseExpansion(phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-primary">{phaseIndex + 1}</span>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{phase.name}</h3>
                          <p className="text-sm text-muted-foreground">{phase.description}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatDuration(phase.estimatedHours)}</div>
                        <div className="text-xs text-muted-foreground">{phase.tasks.length} tasks</div>
                      </div>
                    </div>
                    
                    {/* Phase Progress */}
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>

                    {/* Milestone */}
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{phase.milestone.name}</span>
                      <span className="text-muted-foreground">
                        - {new Date(phase.milestone.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Phase Tasks */}
                  {isExpanded && (
                    <div className="border-t bg-muted/20">
                      <div className="p-4 space-y-3">
                        {phase.tasks.map((task, taskIndex) => (
                          <div 
                            key={task.id} 
                            className={`
                              border rounded-lg p-3 bg-background transition-all cursor-pointer
                              ${selectedTask === task.id ? 'ring-2 ring-primary ring-offset-2' : ''}
                            `}
                            onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-xs font-medium">{taskIndex + 1}</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium">{task.name}</h4>
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status.replace('_', ' ')}
                                    </Badge>
                                    <Badge className={getPriorityColor(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {formatDuration(task.estimatedHours)}
                                    </span>
                                    <span>{task.category}</span>
                                    {task.assignee && (
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {task.assignee}
                                      </span>
                                    )}
                                    {task.dependencies.length > 0 && (
                                      <span>Dependencies: {task.dependencies.length}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Task Dependencies */}
                            {!compact && selectedTask === task.id && task.dependencies.length > 0 && (
                              <div className="mt-3 pt-3 border-t">
                                <h5 className="text-sm font-medium mb-2">Dependencies</h5>
                                <div className="space-y-1">
                                  {task.dependencies.map((depId, index) => {
                                    // Find the dependency task
                                    const depTask = roadmap.phases
                                      .flatMap(p => p.tasks)
                                      .find(t => t.id === depId)
                                    
                                    return (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                        <span>{depTask?.name || depId}</span>
                                        {depTask && (
                                          <Badge className={getStatusColor(depTask.status)} variant="outline">
                                            {depTask.status.replace('_', ' ')}
                                          </Badge>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dependencies Overview */}
      {!compact && roadmap.dependencies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              Dependencies Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roadmap.dependencies.map((dep, index) => (
                <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex items-center gap-2 flex-1">
                    <Badge variant="outline">{dep.from}</Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge variant="outline">{dep.to}</Badge>
                  </div>
                  <div className="text-sm">
                    <Badge className={
                      dep.type === 'blocks' ? 'bg-red-100 text-red-800' :
                      dep.type === 'enables' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {dep.type}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground max-w-xs">
                    {dep.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {!compact && roadmap.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roadmap.risks.map((risk, index) => (
                <div key={risk.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{risk.description}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{risk.mitigation}</p>
                      <Badge variant="outline">{risk.category}</Badge>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium mb-1">Risk Score</div>
                      <div className="text-lg font-bold text-primary">
                        {risk.probability * risk.impact}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        P:{risk.probability} × I:{risk.impact}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Probability: </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={risk.probability * 10} className="w-16 h-2" />
                        <span>{risk.probability}/10</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impact: </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={risk.impact * 10} className="w-16 h-2" />
                        <span>{risk.impact}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}