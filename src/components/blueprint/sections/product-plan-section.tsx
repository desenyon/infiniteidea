"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProductPlan, Priority, FeatureCategory } from '@/types'
import { 
  Users, 
  Target, 
  Star, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface ProductPlanSectionProps {
  productPlan: ProductPlan
  compact?: boolean
}

export function ProductPlanSection({ productPlan, compact = false }: ProductPlanSectionProps) {
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

  const getCategoryColor = (category: FeatureCategory) => {
    switch (category) {
      case FeatureCategory.CORE:
        return 'bg-blue-100 text-blue-800'
      case FeatureCategory.UI_UX:
        return 'bg-purple-100 text-purple-800'
      case FeatureCategory.INTEGRATION:
        return 'bg-green-100 text-green-800'
      case FeatureCategory.SECURITY:
        return 'bg-red-100 text-red-800'
      case FeatureCategory.PERFORMANCE:
        return 'bg-orange-100 text-orange-800'
      case FeatureCategory.ANALYTICS:
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="space-y-6">
      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Audience */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Primary Audience
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Demographics</h5>
                <p className="text-sm">{productPlan.targetAudience.primary.demographics}</p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-1">Psychographics</h5>
                <p className="text-sm">{productPlan.targetAudience.primary.psychographics}</p>
              </div>
            </div>
            
            {!compact && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Pain Points</h5>
                  <ul className="space-y-1">
                    {productPlan.targetAudience.primary.painPoints.map((point, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">Goals</h5>
                  <ul className="space-y-1">
                    {productPlan.targetAudience.primary.goals.map((goal, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Market Size */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Market Size</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(productPlan.targetAudience.marketSize.tam)}
                </div>
                <div className="text-xs text-muted-foreground">TAM</div>
                <div className="text-xs text-muted-foreground">Total Addressable</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(productPlan.targetAudience.marketSize.sam)}
                </div>
                <div className="text-xs text-muted-foreground">SAM</div>
                <div className="text-xs text-muted-foreground">Serviceable Addressable</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(productPlan.targetAudience.marketSize.som)}
                </div>
                <div className="text-xs text-muted-foreground">SOM</div>
                <div className="text-xs text-muted-foreground">Serviceable Obtainable</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Core Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {productPlan.coreFeatures.map((feature, index) => (
              <div key={feature.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold">{feature.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getPriorityColor(feature.priority)}>
                      {feature.priority}
                    </Badge>
                    <Badge className={getCategoryColor(feature.category)}>
                      {feature.category}
                    </Badge>
                  </div>
                </div>
                
                {!compact && (
                  <>
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>User Story:</strong> {feature.userStory}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Est. {feature.estimatedHours}h</span>
                      {feature.dependencies.length > 0 && (
                        <span>Dependencies: {feature.dependencies.length}</span>
                      )}
                    </div>
                    
                    {feature.acceptanceCriteria.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm font-medium cursor-pointer">
                          Acceptance Criteria ({feature.acceptanceCriteria.length})
                        </summary>
                        <ul className="mt-2 space-y-1 ml-4">
                          {feature.acceptanceCriteria.map((criteria, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              • {criteria}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Differentiators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Differentiators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {productPlan.differentiators.map((differentiator, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm">{differentiator}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monetization Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Monetization Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Primary Model */}
          <div>
            <h4 className="font-semibold mb-2">Primary Model: {productPlan.monetization.primary.model}</h4>
            <p className="text-sm text-muted-foreground mb-3">{productPlan.monetization.primary.reasoning}</p>
            
            <div className="space-y-3">
              {productPlan.monetization.primary.pricing.map((tier, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{tier.name}</h5>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(tier.price)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /{tier.interval}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">{tier.targetSegment}</p>
                  
                  {!compact && (
                    <div className="space-y-2">
                      <div>
                        <h6 className="text-xs font-medium text-muted-foreground mb-1">Features</h6>
                        <div className="flex flex-wrap gap-1">
                          {tier.features.slice(0, 3).map((feature, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                          {tier.features.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tier.features.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Models */}
          {!compact && productPlan.monetization.alternatives.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Alternative Models</h4>
              <div className="space-y-2">
                {productPlan.monetization.alternatives.map((alt, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <h5 className="font-medium">{alt.model}</h5>
                      <p className="text-sm text-muted-foreground">{alt.reasoning}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Feasibility</div>
                      <div className="flex items-center gap-2">
                        <Progress value={alt.feasibility * 10} className="w-16 h-2" />
                        <span className="text-xs text-muted-foreground">{alt.feasibility}/10</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Go-to-Market Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Go-to-Market Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Launch Strategy</h4>
            <p className="text-sm text-muted-foreground">{productPlan.gtmStrategy.launchStrategy}</p>
          </div>

          {/* Marketing Channels */}
          <div>
            <h4 className="font-semibold mb-3">Marketing Channels</h4>
            <div className="grid gap-3">
              {productPlan.gtmStrategy.marketingChannels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{channel.name}</h5>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                    <div className="text-xs text-muted-foreground mt-1">Timeline: {channel.timeline}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-sm font-medium">{formatCurrency(channel.cost)}</div>
                    <div className="text-xs text-muted-foreground">ROI: {channel.expectedROI}x</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget & Timeline */}
          {!compact && (
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="font-semibold mb-2">Total Budget</h4>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(productPlan.gtmStrategy.budget)}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key Partnerships</h4>
                <div className="space-y-1">
                  {productPlan.gtmStrategy.partnerships.slice(0, 3).map((partnership, index) => (
                    <div key={index} className="text-sm text-muted-foreground">• {partnership}</div>
                  ))}
                  {productPlan.gtmStrategy.partnerships.length > 3 && (
                    <div className="text-sm text-muted-foreground">
                      +{productPlan.gtmStrategy.partnerships.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}