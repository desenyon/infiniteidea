"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { TechStack, TechCategory, Priority } from '@/types'
import { 
  Code, 
  Server, 
  Database, 
  Brain, 
  Cloud, 
  Shield,
  Activity,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  DollarSign
} from 'lucide-react'

interface TechStackSectionProps {
  techStack: TechStack
  compact?: boolean
}

export function TechStackSection({ techStack, compact = false }: TechStackSectionProps) {
  const getCategoryIcon = (category: TechCategory) => {
    switch (category) {
      case TechCategory.FRONTEND:
        return Code
      case TechCategory.BACKEND:
        return Server
      case TechCategory.DATABASE:
        return Database
      case TechCategory.AI_ML:
        return Brain
      case TechCategory.DEPLOYMENT:
        return Cloud
      case TechCategory.MONITORING:
        return Activity
      default:
        return Info
    }
  }

  const getCategoryColor = (category: TechCategory) => {
    switch (category) {
      case TechCategory.FRONTEND:
        return 'bg-blue-100 text-blue-800'
      case TechCategory.BACKEND:
        return 'bg-green-100 text-green-800'
      case TechCategory.DATABASE:
        return 'bg-purple-100 text-purple-800'
      case TechCategory.AI_ML:
        return 'bg-orange-100 text-orange-800'
      case TechCategory.DEPLOYMENT:
        return 'bg-teal-100 text-teal-800'
      case TechCategory.MONITORING:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getLearningCurveColor = (curve: string) => {
    switch (curve) {
      case 'low':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const allTechChoices = [
    ...techStack.frontend,
    ...techStack.backend,
    ...techStack.database
  ]

  return (
    <div className="space-y-6">
      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Technology Stack Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{techStack.frontend.length}</div>
              <div className="text-sm text-muted-foreground">Frontend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{techStack.backend.length}</div>
              <div className="text-sm text-muted-foreground">Backend</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{techStack.database.length}</div>
              <div className="text-sm text-muted-foreground">Database</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{techStack.aiServices.length}</div>
              <div className="text-sm text-muted-foreground">AI Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{techStack.deployment.length}</div>
              <div className="text-sm text-muted-foreground">Deployment</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(allTechChoices.reduce((sum, tech) => sum + tech.cost, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Est. Monthly</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Frontend Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            Frontend Technologies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {techStack.frontend.map((tech, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{tech.name}</h4>
                      <Badge className={getCategoryColor(tech.category)}>
                        {tech.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.reasoning}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">{formatCurrency(tech.cost)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>

                {!compact && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-1">Pros</h5>
                        <ul className="space-y-1">
                          {tech.pros.slice(0, 3).map((pro, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-1">Cons</h5>
                        <ul className="space-y-1">
                          {tech.cons.slice(0, 3).map((con, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Learning Curve:</span>
                        <span className={`font-medium ${getLearningCurveColor(tech.learningCurve)}`}>
                          {tech.learningCurve}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Community:</span>
                        <div className="flex items-center gap-1">
                          <Progress value={tech.communitySupport * 10} className="w-16 h-2" />
                          <span className="text-xs">{tech.communitySupport}/10</span>
                        </div>
                      </div>
                    </div>

                    {tech.alternatives.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-1">Alternatives</h5>
                        <div className="flex flex-wrap gap-1">
                          {tech.alternatives.map((alt, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {alt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Backend Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Backend Technologies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {techStack.backend.map((tech, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{tech.name}</h4>
                      <Badge className={getCategoryColor(tech.category)}>
                        {tech.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.reasoning}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">{formatCurrency(tech.cost)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>

                {!compact && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-1">Pros</h5>
                        <ul className="space-y-1">
                          {tech.pros.slice(0, 3).map((pro, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-1">Cons</h5>
                        <ul className="space-y-1">
                          {tech.cons.slice(0, 3).map((con, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Learning Curve:</span>
                        <span className={`font-medium ${getLearningCurveColor(tech.learningCurve)}`}>
                          {tech.learningCurve}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Community:</span>
                        <div className="flex items-center gap-1">
                          <Progress value={tech.communitySupport * 10} className="w-16 h-2" />
                          <span className="text-xs">{tech.communitySupport}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Database Technologies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {techStack.database.map((tech, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{tech.name}</h4>
                      <Badge className={getCategoryColor(tech.category)}>
                        {tech.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{tech.reasoning}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">{formatCurrency(tech.cost)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>

                {!compact && (
                  <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-green-700 mb-1">Pros</h5>
                        <ul className="space-y-1">
                          {tech.pros.slice(0, 3).map((pro, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-red-700 mb-1">Cons</h5>
                        <ul className="space-y-1">
                          {tech.cons.slice(0, 3).map((con, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Services */}
      {techStack.aiServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {techStack.aiServices.map((service, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{service.name}</h4>
                        <Badge variant="outline">{service.provider}</Badge>
                        <Badge variant="outline">{service.model}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.useCase}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold">{formatCurrency(service.cost)}</div>
                      <div className="text-xs text-muted-foreground">per month</div>
                    </div>
                  </div>

                  {!compact && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Latency:</span>
                        <span className="font-medium">{service.latency}ms</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Accuracy:</span>
                        <div className="flex items-center gap-1">
                          <Progress value={service.accuracy} className="w-16 h-2" />
                          <span className="text-xs">{service.accuracy}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-primary" />
            Deployment Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {techStack.deployment.map((option, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold">{option.platform}</h4>
                    <p className="text-sm text-muted-foreground">{option.reasoning}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-bold">{formatCurrency(option.cost)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>

                {!compact && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Scalability:</span>
                        <div className="flex items-center gap-1">
                          <Progress value={option.scalability * 10} className="w-12 h-2" />
                          <span className="text-xs">{option.scalability}/10</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Complexity:</span>
                        <div className="flex items-center gap-1">
                          <Progress value={option.complexity * 10} className="w-12 h-2" />
                          <span className="text-xs">{option.complexity}/10</span>
                        </div>
                      </div>
                    </div>

                    {option.requirements.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-muted-foreground mb-1">Requirements</h5>
                        <div className="flex flex-wrap gap-1">
                          {option.requirements.map((req, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {techStack.security.map((guideline, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{guideline.category}</h4>
                      <Badge className={
                        guideline.priority === Priority.CRITICAL ? 'bg-red-100 text-red-800' :
                        guideline.priority === Priority.HIGH ? 'bg-orange-100 text-orange-800' :
                        guideline.priority === Priority.MEDIUM ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {guideline.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{guideline.requirement}</p>
                    {!compact && (
                      <p className="text-sm">{guideline.implementation}</p>
                    )}
                  </div>
                </div>

                {!compact && guideline.compliance && guideline.compliance.length > 0 && (
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-muted-foreground mb-1">Compliance</h5>
                    <div className="flex flex-wrap gap-1">
                      {guideline.compliance.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {comp}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}