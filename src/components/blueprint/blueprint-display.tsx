"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Blueprint } from '@/types'
import { ProductPlanSection } from './sections/product-plan-section'
import { TechStackSection } from './sections/tech-stack-section'
import { AIWorkflowSection } from './sections/ai-workflow-section'
import { RoadmapSection } from './sections/roadmap-section'
import { FinancialModelSection } from './sections/financial-model-section'
import { ExportSharePanel } from './export-share-panel'
import { 
  FileText, 
  Code, 
  Workflow, 
  Calendar, 
  DollarSign, 
  Download,
  Share2,
  Eye,
  EyeOff
} from 'lucide-react'

interface BlueprintDisplayProps {
  blueprint: Blueprint
  project: any
  allowedSections?: string[]
  readOnly?: boolean
}

type TabId = 'product-plan' | 'tech-stack' | 'ai-workflow' | 'roadmap' | 'financial'

interface Tab {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const tabs: Tab[] = [
  {
    id: 'product-plan',
    label: 'Product Plan',
    icon: FileText,
    description: 'Target audience, features, and business strategy'
  },
  {
    id: 'tech-stack',
    label: 'Tech Stack',
    icon: Code,
    description: 'Technology recommendations and architecture'
  },
  {
    id: 'ai-workflow',
    label: 'AI Workflow',
    icon: Workflow,
    description: 'AI pipeline and workflow visualization'
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    icon: Calendar,
    description: 'Development timeline and milestones'
  },
  {
    id: 'financial',
    label: 'Financial',
    icon: DollarSign,
    description: 'Cost analysis and revenue projections'
  }
]

export function BlueprintDisplay({ blueprint, project, allowedSections, readOnly = false }: BlueprintDisplayProps) {
  const [activeTab, setActiveTab] = useState<TabId>('product-plan')
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [compactView, setCompactView] = useState(false)

  // Filter tabs based on allowed sections
  const availableTabs = tabs.filter(tab => {
    if (!allowedSections || allowedSections.includes('all')) return true
    
    const sectionMap: Record<TabId, string> = {
      'product-plan': 'productPlan',
      'tech-stack': 'techStack',
      'ai-workflow': 'aiWorkflow',
      'roadmap': 'roadmap',
      'financial': 'financialModel'
    }
    
    return allowedSections.includes(sectionMap[tab.id])
  })

  // Set initial active tab to first available tab
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id)
    }
  }, [availableTabs, activeTab])

  const renderTabContent = () => {
    switch (activeTab) {
      case 'product-plan':
        return blueprint.productPlan ? <ProductPlanSection productPlan={blueprint.productPlan} compact={compactView} /> : null
      case 'tech-stack':
        return blueprint.techStack ? <TechStackSection techStack={blueprint.techStack} compact={compactView} /> : null
      case 'ai-workflow':
        return blueprint.aiWorkflow ? <AIWorkflowSection aiWorkflow={blueprint.aiWorkflow} compact={compactView} /> : null
      case 'roadmap':
        return blueprint.roadmap ? <RoadmapSection roadmap={blueprint.roadmap} compact={compactView} /> : null
      case 'financial':
        return blueprint.financialModel ? <FinancialModelSection financialModel={blueprint.financialModel} compact={compactView} /> : null
      default:
        return null
    }
  }

  const activeTabData = availableTabs.find(tab => tab.id === activeTab)

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Blueprint Overview</h2>
          <p className="text-muted-foreground">
            Generated on {new Date(blueprint.generatedAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompactView(!compactView)}
            className="flex items-center gap-2"
          >
            {compactView ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {compactView ? 'Detailed View' : 'Compact View'}
          </Button>
          
          {!readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportPanel(true)}
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportPanel(true)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2">
            {availableTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardHeader>
        
        {activeTabData && (
          <CardContent className="pt-0">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <activeTabData.icon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{activeTabData.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {activeTabData.description}
              </p>
            </div>
            
            <Separator className="mb-6" />
            
            {renderTabContent()}
          </CardContent>
        )}
      </Card>

      {/* Export/Share Panel */}
      {showExportPanel && !readOnly && (
        <ExportSharePanel
          project={project}
          onClose={() => setShowExportPanel(false)}
        />
      )}
    </div>
  )
}