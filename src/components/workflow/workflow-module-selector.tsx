'use client'

import React, { useState, useCallback } from 'react'
import { 
  Check, 
  Settings, 
  Info, 
  Plus, 
  Minus,
  ChevronDown,
  ChevronRight,
  Package,
  Zap,
  Shield,
  CreditCard,
  BarChart3,
  Bell,
  Database,
  Cloud,
  Smartphone,
  Globe
} from 'lucide-react'

import { WorkflowModule } from '@/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// Predefined module templates
export interface ModuleTemplate {
  id: string
  name: string
  description: string
  category: 'core' | 'integration' | 'ai' | 'infrastructure' | 'ui'
  icon: React.ComponentType<{ size?: number }>
  required: boolean
  configurable: boolean
  dependencies: string[]
  configuration: ModuleConfiguration
  estimatedComplexity: 'low' | 'medium' | 'high'
  estimatedTime: string
}

export interface ModuleConfiguration {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect'
    label: string
    description: string
    default: any
    options?: { label: string; value: any }[]
    required?: boolean
    validation?: {
      min?: number
      max?: number
      pattern?: string
    }
  }
}

const MODULE_TEMPLATES: ModuleTemplate[] = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'User authentication and authorization system',
    category: 'core',
    icon: Shield,
    required: true,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '2-3 days',
    configuration: {
      provider: {
        type: 'select',
        label: 'Auth Provider',
        description: 'Choose authentication provider',
        default: 'nextauth',
        options: [
          { label: 'NextAuth.js', value: 'nextauth' },
          { label: 'Auth0', value: 'auth0' },
          { label: 'Firebase Auth', value: 'firebase' },
          { label: 'Supabase Auth', value: 'supabase' },
          { label: 'Custom JWT', value: 'custom' }
        ],
        required: true
      },
      socialProviders: {
        type: 'multiselect',
        label: 'Social Providers',
        description: 'Select social login providers',
        default: ['google', 'github'],
        options: [
          { label: 'Google', value: 'google' },
          { label: 'GitHub', value: 'github' },
          { label: 'Facebook', value: 'facebook' },
          { label: 'Twitter', value: 'twitter' },
          { label: 'LinkedIn', value: 'linkedin' }
        ]
      },
      emailAuth: {
        type: 'boolean',
        label: 'Email Authentication',
        description: 'Enable email/password authentication',
        default: true
      },
      twoFactor: {
        type: 'boolean',
        label: 'Two-Factor Authentication',
        description: 'Enable 2FA for enhanced security',
        default: false
      }
    }
  },
  {
    id: 'payment',
    name: 'Payment Processing',
    description: 'Payment gateway integration and subscription management',
    category: 'integration',
    icon: CreditCard,
    required: false,
    configurable: true,
    dependencies: ['auth'],
    estimatedComplexity: 'high',
    estimatedTime: '3-5 days',
    configuration: {
      provider: {
        type: 'select',
        label: 'Payment Provider',
        description: 'Choose payment processing provider',
        default: 'stripe',
        options: [
          { label: 'Stripe', value: 'stripe' },
          { label: 'PayPal', value: 'paypal' },
          { label: 'Square', value: 'square' },
          { label: 'Razorpay', value: 'razorpay' }
        ],
        required: true
      },
      subscriptions: {
        type: 'boolean',
        label: 'Subscription Support',
        description: 'Enable recurring subscription payments',
        default: true
      },
      oneTimePayments: {
        type: 'boolean',
        label: 'One-time Payments',
        description: 'Enable single purchase payments',
        default: true
      },
      webhooks: {
        type: 'boolean',
        label: 'Webhook Integration',
        description: 'Enable payment status webhooks',
        default: true
      }
    }
  },
  {
    id: 'analytics',
    name: 'Analytics & Tracking',
    description: 'User behavior analytics and performance monitoring',
    category: 'integration',
    icon: BarChart3,
    required: false,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '1-2 days',
    configuration: {
      provider: {
        type: 'select',
        label: 'Analytics Provider',
        description: 'Choose analytics service',
        default: 'google-analytics',
        options: [
          { label: 'Google Analytics 4', value: 'google-analytics' },
          { label: 'Mixpanel', value: 'mixpanel' },
          { label: 'Amplitude', value: 'amplitude' },
          { label: 'PostHog', value: 'posthog' },
          { label: 'Custom', value: 'custom' }
        ],
        required: true
      },
      events: {
        type: 'multiselect',
        label: 'Track Events',
        description: 'Select events to track',
        default: ['page_view', 'user_signup', 'conversion'],
        options: [
          { label: 'Page Views', value: 'page_view' },
          { label: 'User Signup', value: 'user_signup' },
          { label: 'Conversions', value: 'conversion' },
          { label: 'Feature Usage', value: 'feature_usage' },
          { label: 'Errors', value: 'errors' }
        ]
      },
      realTime: {
        type: 'boolean',
        label: 'Real-time Analytics',
        description: 'Enable real-time data processing',
        default: false
      }
    }
  },
  {
    id: 'notifications',
    name: 'Notifications',
    description: 'Email, SMS, and push notification system',
    category: 'integration',
    icon: Bell,
    required: false,
    configurable: true,
    dependencies: ['auth'],
    estimatedComplexity: 'medium',
    estimatedTime: '2-3 days',
    configuration: {
      email: {
        type: 'boolean',
        label: 'Email Notifications',
        description: 'Enable email notifications',
        default: true
      },
      emailProvider: {
        type: 'select',
        label: 'Email Provider',
        description: 'Choose email service provider',
        default: 'resend',
        options: [
          { label: 'Resend', value: 'resend' },
          { label: 'SendGrid', value: 'sendgrid' },
          { label: 'Mailgun', value: 'mailgun' },
          { label: 'AWS SES', value: 'aws-ses' }
        ]
      },
      push: {
        type: 'boolean',
        label: 'Push Notifications',
        description: 'Enable browser push notifications',
        default: false
      },
      sms: {
        type: 'boolean',
        label: 'SMS Notifications',
        description: 'Enable SMS notifications',
        default: false
      }
    }
  },
  {
    id: 'database',
    name: 'Database Layer',
    description: 'Database configuration and ORM setup',
    category: 'infrastructure',
    icon: Database,
    required: true,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '1-2 days',
    configuration: {
      type: {
        type: 'select',
        label: 'Database Type',
        description: 'Choose database technology',
        default: 'postgresql',
        options: [
          { label: 'PostgreSQL', value: 'postgresql' },
          { label: 'MySQL', value: 'mysql' },
          { label: 'SQLite', value: 'sqlite' },
          { label: 'MongoDB', value: 'mongodb' }
        ],
        required: true
      },
      orm: {
        type: 'select',
        label: 'ORM/Query Builder',
        description: 'Choose ORM or query builder',
        default: 'prisma',
        options: [
          { label: 'Prisma', value: 'prisma' },
          { label: 'Drizzle', value: 'drizzle' },
          { label: 'TypeORM', value: 'typeorm' },
          { label: 'Mongoose', value: 'mongoose' }
        ]
      },
      migrations: {
        type: 'boolean',
        label: 'Database Migrations',
        description: 'Enable database migration system',
        default: true
      },
      seeding: {
        type: 'boolean',
        label: 'Database Seeding',
        description: 'Include database seeding scripts',
        default: true
      }
    }
  },
  {
    id: 'deployment',
    name: 'Deployment & Hosting',
    description: 'Production deployment configuration',
    category: 'infrastructure',
    icon: Cloud,
    required: true,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '1-2 days',
    configuration: {
      platform: {
        type: 'select',
        label: 'Hosting Platform',
        description: 'Choose deployment platform',
        default: 'vercel',
        options: [
          { label: 'Vercel', value: 'vercel' },
          { label: 'Netlify', value: 'netlify' },
          { label: 'AWS', value: 'aws' },
          { label: 'Google Cloud', value: 'gcp' },
          { label: 'Railway', value: 'railway' }
        ],
        required: true
      },
      cicd: {
        type: 'boolean',
        label: 'CI/CD Pipeline',
        description: 'Set up continuous integration and deployment',
        default: true
      },
      monitoring: {
        type: 'boolean',
        label: 'Performance Monitoring',
        description: 'Include performance monitoring setup',
        default: true
      },
      ssl: {
        type: 'boolean',
        label: 'SSL Certificate',
        description: 'Configure SSL/TLS certificate',
        default: true
      }
    }
  },
  {
    id: 'ui-components',
    name: 'UI Component Library',
    description: 'Reusable UI components and design system',
    category: 'ui',
    icon: Package,
    required: false,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '2-4 days',
    configuration: {
      library: {
        type: 'select',
        label: 'Component Library',
        description: 'Choose UI component library',
        default: 'shadcn',
        options: [
          { label: 'shadcn/ui', value: 'shadcn' },
          { label: 'Chakra UI', value: 'chakra' },
          { label: 'Mantine', value: 'mantine' },
          { label: 'Ant Design', value: 'antd' },
          { label: 'Custom', value: 'custom' }
        ]
      },
      theme: {
        type: 'select',
        label: 'Theme System',
        description: 'Choose theming approach',
        default: 'tailwind',
        options: [
          { label: 'Tailwind CSS', value: 'tailwind' },
          { label: 'CSS-in-JS', value: 'css-in-js' },
          { label: 'CSS Modules', value: 'css-modules' },
          { label: 'Styled Components', value: 'styled-components' }
        ]
      },
      darkMode: {
        type: 'boolean',
        label: 'Dark Mode Support',
        description: 'Include dark mode theme',
        default: true
      },
      responsive: {
        type: 'boolean',
        label: 'Responsive Design',
        description: 'Mobile-first responsive components',
        default: true
      }
    }
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Mobile app development setup',
    category: 'ui',
    icon: Smartphone,
    required: false,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'high',
    estimatedTime: '1-2 weeks',
    configuration: {
      framework: {
        type: 'select',
        label: 'Mobile Framework',
        description: 'Choose mobile development framework',
        default: 'react-native',
        options: [
          { label: 'React Native', value: 'react-native' },
          { label: 'Flutter', value: 'flutter' },
          { label: 'Ionic', value: 'ionic' },
          { label: 'Capacitor', value: 'capacitor' }
        ],
        required: true
      },
      platforms: {
        type: 'multiselect',
        label: 'Target Platforms',
        description: 'Select target mobile platforms',
        default: ['ios', 'android'],
        options: [
          { label: 'iOS', value: 'ios' },
          { label: 'Android', value: 'android' }
        ]
      },
      nativeFeatures: {
        type: 'multiselect',
        label: 'Native Features',
        description: 'Select native device features to use',
        default: ['camera', 'location'],
        options: [
          { label: 'Camera', value: 'camera' },
          { label: 'Location', value: 'location' },
          { label: 'Push Notifications', value: 'push' },
          { label: 'Biometric Auth', value: 'biometric' },
          { label: 'File System', value: 'filesystem' }
        ]
      }
    }
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'External API integrations and data fetching',
    category: 'integration',
    icon: Globe,
    required: false,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'medium',
    estimatedTime: '1-3 days',
    configuration: {
      restApi: {
        type: 'boolean',
        label: 'REST API Client',
        description: 'Include REST API integration utilities',
        default: true
      },
      graphql: {
        type: 'boolean',
        label: 'GraphQL Client',
        description: 'Include GraphQL client setup',
        default: false
      },
      caching: {
        type: 'boolean',
        label: 'Response Caching',
        description: 'Enable API response caching',
        default: true
      },
      rateLimiting: {
        type: 'boolean',
        label: 'Rate Limiting',
        description: 'Implement client-side rate limiting',
        default: true
      }
    }
  },
  {
    id: 'ai-integration',
    name: 'AI Integration',
    description: 'AI/ML model integration and processing',
    category: 'ai',
    icon: Zap,
    required: false,
    configurable: true,
    dependencies: [],
    estimatedComplexity: 'high',
    estimatedTime: '3-7 days',
    configuration: {
      provider: {
        type: 'select',
        label: 'AI Provider',
        description: 'Choose AI service provider',
        default: 'openai',
        options: [
          { label: 'OpenAI', value: 'openai' },
          { label: 'Anthropic', value: 'anthropic' },
          { label: 'Google AI', value: 'google' },
          { label: 'Hugging Face', value: 'huggingface' },
          { label: 'Custom Model', value: 'custom' }
        ]
      },
      features: {
        type: 'multiselect',
        label: 'AI Features',
        description: 'Select AI capabilities to integrate',
        default: ['text-generation', 'embeddings'],
        options: [
          { label: 'Text Generation', value: 'text-generation' },
          { label: 'Embeddings', value: 'embeddings' },
          { label: 'Image Generation', value: 'image-generation' },
          { label: 'Speech-to-Text', value: 'speech-to-text' },
          { label: 'Text-to-Speech', value: 'text-to-speech' },
          { label: 'Vision/OCR', value: 'vision' }
        ]
      },
      streaming: {
        type: 'boolean',
        label: 'Streaming Responses',
        description: 'Enable streaming for real-time AI responses',
        default: true
      },
      vectorDb: {
        type: 'boolean',
        label: 'Vector Database',
        description: 'Include vector database for embeddings',
        default: false
      }
    }
  }
]

interface WorkflowModuleSelectorProps {
  selectedModules: string[]
  moduleConfigurations: Record<string, Record<string, any>>
  onModuleToggle: (moduleId: string) => void
  onConfigurationChange: (moduleId: string, config: Record<string, any>) => void
  onExport?: (modules: WorkflowModule[]) => void
  onImport?: (modules: WorkflowModule[]) => void
  className?: string
}

export function WorkflowModuleSelector({
  selectedModules,
  moduleConfigurations,
  onModuleToggle,
  onConfigurationChange,
  onExport,
  onImport,
  className = '',
}: WorkflowModuleSelectorProps) {
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter modules based on category and search
  const filteredModules = MODULE_TEMPLATES.filter(module => {
    const matchesCategory = categoryFilter === 'all' || module.category === categoryFilter
    const matchesSearch = searchQuery === '' || 
      module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  // Group modules by category
  const modulesByCategory = filteredModules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = []
    }
    acc[module.category].push(module)
    return acc
  }, {} as Record<string, ModuleTemplate[]>)

  const toggleModuleExpansion = useCallback((moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }, [])

  const handleConfigurationChange = useCallback((
    moduleId: string, 
    configKey: string, 
    value: any
  ) => {
    const currentConfig = moduleConfigurations[moduleId] || {}
    const updatedConfig = { ...currentConfig, [configKey]: value }
    onConfigurationChange(moduleId, updatedConfig)
  }, [moduleConfigurations, onConfigurationChange])

  const renderConfigurationField = (
    moduleId: string,
    configKey: string,
    config: ModuleConfiguration[string]
  ) => {
    const currentValue = moduleConfigurations[moduleId]?.[configKey] ?? config.default

    switch (config.type) {
      case 'boolean':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue}
              onChange={(e) => handleConfigurationChange(moduleId, configKey, e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm">{config.label}</span>
          </label>
        )

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">{config.label}</label>
            <select
              value={currentValue}
              onChange={(e) => handleConfigurationChange(moduleId, configKey, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              {config.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">{config.label}</label>
            <div className="space-y-1">
              {config.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentValue.includes(option.value)}
                    onChange={(e) => {
                      const newValue = e.target.checked
                        ? [...currentValue, option.value]
                        : currentValue.filter((v: any) => v !== option.value)
                      handleConfigurationChange(moduleId, configKey, newValue)
                    }}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'string':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">{config.label}</label>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => handleConfigurationChange(moduleId, configKey, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder={config.description}
            />
          </div>
        )

      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium mb-1">{config.label}</label>
            <input
              type="number"
              value={currentValue}
              onChange={(e) => handleConfigurationChange(moduleId, configKey, Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              min={config.validation?.min}
              max={config.validation?.max}
            />
          </div>
        )

      default:
        return null
    }
  }

  const categories = [
    { id: 'all', label: 'All Modules' },
    { id: 'core', label: 'Core' },
    { id: 'integration', label: 'Integration' },
    { id: 'ai', label: 'AI/ML' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'ui', label: 'UI/UX' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Modules</h3>
          <p className="text-sm text-gray-600">
            Select and configure modules for your workflow
          </p>
        </div>
        <div className="flex gap-2">
          {onImport && (
            <Button variant="outline" size="sm" onClick={() => onImport([])}>
              <Plus size={16} />
              Import
            </Button>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={() => onExport([])}>
              <Plus size={16} />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={categoryFilter === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Module List */}
      <div className="space-y-4">
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category}>
            <h4 className="font-medium text-gray-900 mb-3 capitalize">
              {category} ({modules.length})
            </h4>
            <div className="space-y-3">
              {modules.map(module => {
                const isSelected = selectedModules.includes(module.id)
                const isExpanded = expandedModules.includes(module.id)
                const Icon = module.icon

                return (
                  <Card key={module.id} className={`p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Icon size={20} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-gray-900">{module.name}</h5>
                          {module.required && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              Required
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            module.estimatedComplexity === 'high' ? 'bg-red-100 text-red-700' :
                            module.estimatedComplexity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {module.estimatedComplexity}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Est. time: {module.estimatedTime}</span>
                          {module.dependencies.length > 0 && (
                            <span>Depends on: {module.dependencies.join(', ')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {module.configurable && isSelected && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleModuleExpansion(module.id)}
                          >
                            <Settings size={14} />
                            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </Button>
                        )}
                        
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => onModuleToggle(module.id)}
                          disabled={module.required}
                        >
                          {isSelected ? <Check size={14} /> : <Plus size={14} />}
                          {isSelected ? 'Selected' : 'Select'}
                        </Button>
                      </div>
                    </div>

                    {/* Configuration Panel */}
                    {isSelected && isExpanded && module.configurable && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h6 className="font-medium text-gray-900 mb-3">Configuration</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(module.configuration).map(([configKey, config]) => (
                            <div key={configKey}>
                              {renderConfigurationField(module.id, configKey, config)}
                              {config.description && (
                                <p className="text-xs text-gray-500 mt-1">{config.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {selectedModules.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Selected Modules Summary</h4>
          <div className="text-sm text-blue-800">
            <p>{selectedModules.length} modules selected</p>
            <p>
              Estimated complexity: {
                MODULE_TEMPLATES
                  .filter(m => selectedModules.includes(m.id))
                  .some(m => m.estimatedComplexity === 'high') ? 'High' :
                MODULE_TEMPLATES
                  .filter(m => selectedModules.includes(m.id))
                  .some(m => m.estimatedComplexity === 'medium') ? 'Medium' : 'Low'
              }
            </p>
            <div className="mt-2">
              <strong>Selected:</strong> {
                MODULE_TEMPLATES
                  .filter(m => selectedModules.includes(m.id))
                  .map(m => m.name)
                  .join(', ')
              }
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

export { MODULE_TEMPLATES }