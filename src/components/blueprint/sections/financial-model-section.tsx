"use client"

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { FinancialModel } from '@/types'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calculator,
  Target,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users
} from 'lucide-react'

interface FinancialModelSectionProps {
  financialModel: FinancialModel
  compact?: boolean
}

export function FinancialModelSection({ financialModel, compact = false }: FinancialModelSectionProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>('base')
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly')

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100)
  }

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    const { costs, revenue, metrics } = financialModel
    return {
      totalRevenue: revenue.projections.reduce((sum, proj) => sum + proj.revenue, 0),
      totalCosts: costs.total,
      grossProfit: revenue.projections.reduce((sum, proj) => sum + proj.revenue, 0) - costs.total,
      breakEvenMonth: metrics.breakeven,
      customerCount: revenue.projections[revenue.projections.length - 1]?.users || 0,
      monthlyGrowth: revenue.projections.length > 1 ? 
        ((revenue.projections[revenue.projections.length - 1].revenue - revenue.projections[0].revenue) / revenue.projections[0].revenue) * 100 : 0
    }
  }, [financialModel])

  const getMetricColor = (value: number, isPositive: boolean = true) => {
    if (value === 0) return 'text-muted-foreground'
    return (value > 0) === isPositive ? 'text-green-600' : 'text-red-600'
  }

  const getCostCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'hosting':
        return 'bg-blue-100 text-blue-800'
      case 'database':
        return 'bg-purple-100 text-purple-800'
      case 'ai':
        return 'bg-orange-100 text-orange-800'
      case 'cdn':
        return 'bg-green-100 text-green-800'
      case 'storage':
        return 'bg-teal-100 text-teal-800'
      case 'monitoring':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMetricColor(keyMetrics.totalRevenue)}`}>
                {formatCurrency(keyMetrics.totalRevenue)}
              </div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMetricColor(keyMetrics.totalCosts, false)}`}>
                {formatCurrency(keyMetrics.totalCosts)}
              </div>
              <div className="text-sm text-muted-foreground">Total Costs</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getMetricColor(keyMetrics.grossProfit)}`}>
                {formatCurrency(keyMetrics.grossProfit)}
              </div>
              <div className="text-sm text-muted-foreground">Gross Profit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {keyMetrics.breakEvenMonth}mo
              </div>
              <div className="text-sm text-muted-foreground">Break Even</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Business Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Key Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Customer Acquisition Cost</div>
                  <div className="text-sm text-muted-foreground">CAC</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(financialModel.metrics.cac)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Lifetime Value</div>
                  <div className="text-sm text-muted-foreground">LTV</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{formatCurrency(financialModel.metrics.ltv)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">LTV:CAC Ratio</div>
                  <div className="text-sm text-muted-foreground">Target: 3:1+</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    financialModel.metrics.ltvCacRatio >= 3 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialModel.metrics.ltvCacRatio.toFixed(1)}:1
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Monthly Burn Rate</div>
                  <div className="text-sm text-muted-foreground">Operating costs</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(financialModel.metrics.burnRate)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Runway</div>
                  <div className="text-sm text-muted-foreground">Months remaining</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    financialModel.metrics.runway >= 12 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {financialModel.metrics.runway}mo
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Return on Investment</div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getMetricColor(financialModel.metrics.roi)}`}>
                    {formatPercent(financialModel.metrics.roi)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Infrastructure Costs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Infrastructure ({formatCurrency(financialModel.costs.infrastructure.reduce((sum, cost) => sum + cost.cost, 0))})
            </h4>
            <div className="space-y-2">
              {financialModel.costs.infrastructure.map((cost, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Badge className={getCostCategoryColor(cost.category)}>
                      {cost.category}
                    </Badge>
                    <span className="text-sm">{cost.service}</span>
                  </div>
                  <div className="text-sm font-medium">{formatCurrency(cost.cost)}/mo</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Costs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Team ({formatCurrency(financialModel.costs.team.reduce((sum, cost) => sum + cost.salary + cost.benefits, 0))})
            </h4>
            <div className="space-y-2">
              {financialModel.costs.team.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.role}</span>
                    <Badge variant="outline" className="text-xs">{member.timeline}</Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(member.salary + member.benefits)}/mo
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tool Costs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Tools & Software ({formatCurrency(financialModel.costs.tools.reduce((sum, tool) => sum + tool.cost, 0))})
            </h4>
            <div className="space-y-2">
              {financialModel.costs.tools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tool.name}</span>
                    <Badge variant="outline" className="text-xs">{tool.category}</Badge>
                    <span className="text-xs text-muted-foreground">({tool.users} users)</span>
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(tool.cost)}/{tool.interval}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing Costs */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              Marketing ({formatCurrency(financialModel.costs.marketing.reduce((sum, cost) => sum + cost.budget, 0))})
            </h4>
            <div className="space-y-2">
              {financialModel.costs.marketing.map((channel, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{channel.channel}</span>
                    <Badge variant="outline" className="text-xs">{channel.timeline}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatCurrency(channel.budget)}</div>
                    <div className="text-xs text-muted-foreground">
                      ROI: {channel.expectedReturn}x
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Projections */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Revenue Projections
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={timeframe === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('monthly')}
              >
                Monthly
              </Button>
              <Button
                variant={timeframe === 'yearly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeframe('yearly')}
              >
                Yearly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Revenue Model */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <h4 className="font-semibold mb-2">Revenue Model: {financialModel.revenue.model}</h4>
              <div className="text-sm text-muted-foreground">
                Based on {financialModel.revenue.assumptions.join(', ')}
              </div>
            </div>

            {/* Monthly Projections */}
            <div className="space-y-3">
              <h4 className="font-semibold">Monthly Breakdown</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {financialModel.revenue.projections.map((projection, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium">Month {projection.month}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {projection.users.toLocaleString()} users
                      </div>
                      {projection.growth && (
                        <div className="flex items-center gap-1 text-sm">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">+{formatPercent(projection.growth)}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(projection.revenue)}</div>
                      {projection.churn && (
                        <div className="text-xs text-red-600">
                          Churn: {formatPercent(projection.churn)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Analysis */}
      {!compact && financialModel.scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Scenario Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {financialModel.scenarios.map((scenario, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                    <Badge className={
                      scenario.probability >= 0.7 ? 'bg-green-100 text-green-800' :
                      scenario.probability >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {formatPercent(scenario.probability * 100)} likely
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Revenue</div>
                      <div className="font-bold">
                        {formatCurrency(scenario.revenue.projections.reduce((sum, p) => sum + p.revenue, 0))}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Costs</div>
                      <div className="font-bold">{formatCurrency(scenario.costs.total)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Profit</div>
                      <div className={`font-bold ${getMetricColor(
                        scenario.revenue.projections.reduce((sum, p) => sum + p.revenue, 0) - scenario.costs.total
                      )}`}>
                        {formatCurrency(
                          scenario.revenue.projections.reduce((sum, p) => sum + p.revenue, 0) - scenario.costs.total
                        )}
                      </div>
                    </div>
                  </div>

                  {scenario.assumptions.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium mb-1">Key Assumptions</h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {scenario.assumptions.slice(0, 3).map((assumption, idx) => (
                          <li key={idx}>• {assumption}</li>
                        ))}
                        {scenario.assumptions.length > 3 && (
                          <li>• +{scenario.assumptions.length - 3} more assumptions</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}