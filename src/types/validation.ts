// Zod Validation Schemas for Desenyon: InfiniteIdea
// This file contains all validation schemas using Zod for runtime type checking

import { z } from 'zod'
import {
  SubscriptionTier,
  ProjectStatus,
  JobStatus,
  ComplexityLevel,
  Priority,
  FeatureCategory,
  TechCategory,
  NodeType,
  IdeaCategory,
  RecoveryStrategy,
  ExportFormat
} from './index'

// ============================================================================
// ENUM SCHEMAS
// ============================================================================

export const SubscriptionTierSchema = z.nativeEnum(SubscriptionTier)
export const ProjectStatusSchema = z.nativeEnum(ProjectStatus)
export const JobStatusSchema = z.nativeEnum(JobStatus)
export const ComplexityLevelSchema = z.nativeEnum(ComplexityLevel)
export const PrioritySchema = z.nativeEnum(Priority)
export const FeatureCategorySchema = z.nativeEnum(FeatureCategory)
export const TechCategorySchema = z.nativeEnum(TechCategory)
export const NodeTypeSchema = z.nativeEnum(NodeType)
export const IdeaCategorySchema = z.nativeEnum(IdeaCategory)
export const RecoveryStrategySchema = z.nativeEnum(RecoveryStrategy)
export const ExportFormatSchema = z.nativeEnum(ExportFormat)

// ============================================================================
// CORE VALIDATION SCHEMAS
// ============================================================================

export const UserPreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  defaultIndustry: z.string().optional(),
  aiProvider: z.enum(['openai', 'anthropic', 'auto']),
  exportFormat: ExportFormatSchema,
  notifications: z.object({
    email: z.boolean(),
    browser: z.boolean(),
    generationComplete: z.boolean(),
    weeklyDigest: z.boolean()
  }),
  privacy: z.object({
    shareUsageData: z.boolean(),
    allowAnalytics: z.boolean()
  })
})

export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().optional(),
  image: z.string().url().optional(),
  emailVerified: z.date().optional(),
  subscription: SubscriptionTierSchema,
  preferences: UserPreferencesSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// ============================================================================
// IDEA PROCESSING SCHEMAS
// ============================================================================

export const IdeaInputSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().optional()
})

export const ProcessedIdeaSchema = z.object({
  id: z.string().cuid(),
  originalInput: z.string(),
  extractedFeatures: z.array(z.string()),
  category: IdeaCategorySchema,
  complexity: ComplexityLevelSchema,
  keywords: z.array(z.string()),
  timestamp: z.date()
})

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string())
})

// ============================================================================
// PRODUCT PLAN SCHEMAS
// ============================================================================

export const AudienceProfileSchema = z.object({
  primary: z.object({
    demographics: z.string(),
    psychographics: z.string(),
    painPoints: z.array(z.string()),
    goals: z.array(z.string())
  }),
  secondary: z.object({
    demographics: z.string(),
    psychographics: z.string(),
    painPoints: z.array(z.string()),
    goals: z.array(z.string())
  }).optional(),
  marketSize: z.object({
    tam: z.number().positive(),
    sam: z.number().positive(),
    som: z.number().positive()
  })
})

export const FeatureSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Feature name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: PrioritySchema,
  estimatedHours: z.number().positive(),
  dependencies: z.array(z.string()),
  category: FeatureCategorySchema,
  userStory: z.string(),
  acceptanceCriteria: z.array(z.string())
})

export const PricingTierSchema = z.object({
  name: z.string(),
  price: z.number().nonnegative(),
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  features: z.array(z.string()),
  limitations: z.array(z.string()).optional(),
  targetSegment: z.string()
})

export const MonetizationStrategySchema = z.object({
  primary: z.object({
    model: z.enum(['subscription', 'one-time', 'freemium', 'marketplace', 'advertising']),
    pricing: z.array(PricingTierSchema),
    reasoning: z.string()
  }),
  alternatives: z.array(z.object({
    model: z.string(),
    reasoning: z.string(),
    feasibility: z.number().min(1).max(10)
  }))
})

export const MarketingChannelSchema = z.object({
  name: z.string(),
  cost: z.number().nonnegative(),
  expectedROI: z.number(),
  timeline: z.string(),
  description: z.string()
})

export const MilestoneSchema = z.object({
  name: z.string(),
  description: z.string(),
  dueDate: z.date(),
  deliverables: z.array(z.string()),
  successCriteria: z.array(z.string())
})

export const GTMPlanSchema = z.object({
  launchStrategy: z.string(),
  marketingChannels: z.array(MarketingChannelSchema),
  partnerships: z.array(z.string()),
  timeline: z.array(MilestoneSchema),
  budget: z.number().positive()
})

export const CompetitorSchema = z.object({
  name: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  pricing: z.string(),
  marketShare: z.number().min(0).max(100).optional()
})

export const CompetitorAnalysisSchema = z.object({
  direct: z.array(CompetitorSchema),
  indirect: z.array(CompetitorSchema),
  whitespace: z.array(z.string())
})

export const ProductPlanSchema = z.object({
  targetAudience: AudienceProfileSchema,
  coreFeatures: z.array(FeatureSchema),
  differentiators: z.array(z.string()),
  monetization: MonetizationStrategySchema,
  gtmStrategy: GTMPlanSchema,
  competitorAnalysis: CompetitorAnalysisSchema
})

// ============================================================================
// TECHNICAL ARCHITECTURE SCHEMAS
// ============================================================================

export const TechChoiceSchema = z.object({
  name: z.string(),
  category: TechCategorySchema,
  reasoning: z.string(),
  alternatives: z.array(z.string()),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  cost: z.number().nonnegative(),
  learningCurve: z.enum(['low', 'medium', 'high']),
  communitySupport: z.number().min(1).max(10)
})

export const AIServiceSchema = z.object({
  name: z.string(),
  provider: z.enum(['openai', 'anthropic', 'google', 'local', 'other']),
  model: z.string(),
  useCase: z.string(),
  cost: z.number().nonnegative(),
  latency: z.number().positive(),
  accuracy: z.number().min(0).max(1)
})

export const DeploymentOptionSchema = z.object({
  platform: z.string(),
  cost: z.number().nonnegative(),
  scalability: z.number().min(1).max(10),
  complexity: z.number().min(1).max(10),
  reasoning: z.string(),
  requirements: z.array(z.string())
})

export const SecurityGuidelineSchema = z.object({
  category: z.string(),
  requirement: z.string(),
  implementation: z.string(),
  priority: PrioritySchema,
  compliance: z.array(z.string()).optional()
})

export const MonitoringToolSchema = z.object({
  name: z.string(),
  category: z.enum(['performance', 'errors', 'analytics', 'logs']),
  cost: z.number().nonnegative(),
  features: z.array(z.string())
})

export const TechStackSchema = z.object({
  frontend: z.array(TechChoiceSchema),
  backend: z.array(TechChoiceSchema),
  database: z.array(TechChoiceSchema),
  aiServices: z.array(AIServiceSchema),
  deployment: z.array(DeploymentOptionSchema),
  security: z.array(SecurityGuidelineSchema),
  monitoring: z.array(MonitoringToolSchema)
})

// ============================================================================
// AI WORKFLOW SCHEMAS
// ============================================================================

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number()
})

export const NodeInputSchema = z.object({
  id: z.string(),
  type: z.string(),
  required: z.boolean(),
  description: z.string()
})

export const NodeOutputSchema = z.object({
  id: z.string(),
  type: z.string(),
  description: z.string()
})

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: NodeTypeSchema,
  label: z.string(),
  position: PositionSchema,
  configuration: z.record(z.string(), z.any()),
  inputs: z.array(NodeInputSchema),
  outputs: z.array(NodeOutputSchema)
})

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  label: z.string().optional()
})

export const WorkflowModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  nodes: z.array(z.string()),
  configurable: z.boolean(),
  required: z.boolean()
})

export const WorkflowConfigSchema = z.object({
  parallel: z.boolean(),
  timeout: z.number().positive(),
  retries: z.number().nonnegative(),
  fallbackEnabled: z.boolean()
})

export const AIWorkflowSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
  modules: z.array(WorkflowModuleSchema),
  configuration: WorkflowConfigSchema
})

// ============================================================================
// FINANCIAL MODELING SCHEMAS
// ============================================================================

export const InfraCostSchema = z.object({
  service: z.string(),
  category: z.enum(['hosting', 'database', 'cdn', 'storage', 'ai', 'monitoring']),
  cost: z.number().nonnegative(),
  scaling: z.array(z.object({
    users: z.number().positive(),
    cost: z.number().nonnegative(),
    description: z.string()
  })),
  description: z.string()
})

export const TeamCostSchema = z.object({
  role: z.string(),
  salary: z.number().positive(),
  equity: z.number().min(0).max(100).optional(),
  benefits: z.number().nonnegative(),
  timeline: z.string()
})

export const ToolCostSchema = z.object({
  name: z.string(),
  category: z.string(),
  cost: z.number().nonnegative(),
  interval: z.enum(['monthly', 'yearly', 'one-time']),
  users: z.number().positive()
})

export const MarketingCostSchema = z.object({
  channel: z.string(),
  budget: z.number().positive(),
  expectedReturn: z.number(),
  timeline: z.string()
})

export const CostBreakdownSchema = z.object({
  infrastructure: z.array(InfraCostSchema),
  team: z.array(TeamCostSchema),
  tools: z.array(ToolCostSchema),
  marketing: z.array(MarketingCostSchema),
  total: z.number().nonnegative(),
  monthly: z.number().nonnegative(),
  yearly: z.number().nonnegative()
})

export const MonthlyProjectionSchema = z.object({
  month: z.number().positive(),
  users: z.number().nonnegative(),
  revenue: z.number().nonnegative(),
  churn: z.number().min(0).max(1).optional(),
  growth: z.number().optional()
})

export const RevenueScenarioSchema = z.object({
  name: z.string(),
  probability: z.number().min(0).max(1),
  revenue: z.number().nonnegative(),
  description: z.string()
})

export const RevenueProjectionSchema = z.object({
  model: z.string(),
  projections: z.array(MonthlyProjectionSchema),
  assumptions: z.array(z.string()),
  scenarios: z.array(RevenueScenarioSchema)
})

export const BusinessMetricsSchema = z.object({
  cac: z.number().nonnegative(),
  ltv: z.number().nonnegative(),
  ltvCacRatio: z.number().positive(),
  burnRate: z.number().nonnegative(),
  runway: z.number().nonnegative(),
  breakeven: z.number().nonnegative(),
  roi: z.number()
})

export const FinancialModelSchema = z.object({
  costs: CostBreakdownSchema,
  revenue: RevenueProjectionSchema,
  metrics: BusinessMetricsSchema,
  scenarios: z.array(z.object({
    name: z.string(),
    description: z.string(),
    assumptions: z.array(z.string()),
    costs: CostBreakdownSchema,
    revenue: RevenueProjectionSchema,
    probability: z.number().min(0).max(1)
  }))
})

// ============================================================================
// PROJECT AND BLUEPRINT SCHEMAS
// ============================================================================

export const TaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  estimatedHours: z.number().positive(),
  priority: PrioritySchema,
  category: z.string(),
  dependencies: z.array(z.string()),
  assignee: z.string().optional(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'blocked'])
})

export const PhaseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  tasks: z.array(TaskSchema),
  estimatedHours: z.number().positive(),
  dependencies: z.array(z.string()),
  milestone: MilestoneSchema
})

export const DependencySchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(['blocks', 'enables', 'influences']),
  description: z.string()
})

export const RiskSchema = z.object({
  id: z.string(),
  description: z.string(),
  probability: z.number().min(1).max(10),
  impact: z.number().min(1).max(10),
  mitigation: z.string(),
  category: z.string()
})

export const RoadmapSchema = z.object({
  phases: z.array(PhaseSchema),
  totalEstimate: z.number().positive(),
  timeline: z.string(),
  dependencies: z.array(DependencySchema),
  risks: z.array(RiskSchema)
})

export const BlueprintSchema = z.object({
  id: z.string(),
  productPlan: ProductPlanSchema,
  techStack: TechStackSchema,
  aiWorkflow: AIWorkflowSchema,
  roadmap: RoadmapSchema,
  financialModel: FinancialModelSchema,
  generatedAt: z.date()
})

export const ProjectSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  originalIdea: z.string().min(10, 'Idea description must be at least 10 characters'),
  status: ProjectStatusSchema,
  category: z.string().optional(),
  complexity: ComplexityLevelSchema.optional(),
  blueprint: BlueprintSchema.optional(),
  generatedAt: z.date().optional(),
  lastModified: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// ============================================================================
// API SCHEMAS
// ============================================================================

export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date()
})

export const PaginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.date(),
  pagination: z.object({
    page: z.number().positive(),
    limit: z.number().positive(),
    total: z.number().nonnegative(),
    totalPages: z.number().nonnegative()
  })
})

// ============================================================================
// GENERATION JOB SCHEMAS
// ============================================================================

export const GenerationJobSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid(),
  projectId: z.string().cuid(),
  jobType: z.string(),
  status: JobStatusSchema,
  priority: z.number().nonnegative(),
  inputData: z.record(z.string(), z.any()),
  outputData: z.record(z.string(), z.any()).optional(),
  progress: z.number().min(0).max(100),
  currentStep: z.string().optional(),
  errorMessage: z.string().optional(),
  retryCount: z.number().nonnegative(),
  maxRetries: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional()
})

export const JobProgressSchema = z.object({
  jobId: z.string(),
  progress: z.number().min(0).max(100),
  currentStep: z.string(),
  estimatedTimeRemaining: z.number().positive().optional(),
  message: z.string().optional()
})

// ============================================================================
// ANALYTICS SCHEMAS
// ============================================================================

export const AnalyticsEventDbSchema = z.object({
  id: z.string().cuid(),
  userId: z.string().cuid().optional(),
  projectId: z.string().cuid().optional(),
  eventType: z.string(),
  eventData: z.record(z.string(), z.any()).optional(),
  duration: z.number().positive().optional(),
  success: z.boolean(),
  errorCode: z.string().optional(),
  createdAt: z.date()
})

// ============================================================================
// TEMPLATE SCHEMAS
// ============================================================================

export const TemplateDataSchema = z.object({
  productPlan: ProductPlanSchema.partial(),
  techStack: TechStackSchema.partial(),
  aiWorkflow: AIWorkflowSchema.partial(),
  roadmap: RoadmapSchema.partial(),
  financialModel: FinancialModelSchema.partial()
})

export const TemplateSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  category: z.string(),
  templateData: TemplateDataSchema,
  usageCount: z.number().nonnegative(),
  rating: z.number().min(0).max(5).optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// ============================================================================
// SERVICE VALIDATION SCHEMAS
// ============================================================================

export const ScaleEstimateSchema = z.object({
  expectedUsers: z.number().positive(),
  timeframe: z.string(),
  growthRate: z.number().min(0),
  peakLoad: z.number().positive()
})

export const CostConstraintsSchema = z.object({
  maxBudget: z.number().positive(),
  timeframe: z.string(),
  priorities: z.array(z.string()),
  mustHave: z.array(z.string()),
  niceToHave: z.array(z.string())
})

export const FinancialScenarioSchema = z.object({
  name: z.string(),
  description: z.string(),
  assumptions: z.record(z.string(), z.any()),
  probability: z.number().min(0).max(1)
})

export const ProjectStructureSchema = z.object({
  directories: z.array(z.object({
    path: z.string(),
    description: z.string(),
    files: z.array(z.string()).optional(),
    purpose: z.string()
  })),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    description: z.string(),
    editable: z.boolean(),
    template: z.boolean()
  })),
  dependencies: z.array(z.object({
    name: z.string(),
    version: z.string(),
    type: z.enum(['production', 'development', 'peer']),
    description: z.string(),
    optional: z.boolean()
  })),
  scripts: z.array(z.object({
    name: z.string(),
    command: z.string(),
    description: z.string(),
    environment: z.string().optional()
  })),
  configuration: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string(),
    author: z.string(),
    license: z.string(),
    repository: z.string().optional(),
    homepage: z.string().optional(),
    keywords: z.array(z.string())
  })
})

export const SetupInstructionsSchema = z.object({
  prerequisites: z.array(z.object({
    name: z.string(),
    version: z.string().optional(),
    description: z.string(),
    installUrl: z.string().optional(),
    checkCommand: z.string().optional()
  })),
  steps: z.array(z.object({
    order: z.number().positive(),
    title: z.string(),
    description: z.string(),
    commands: z.array(z.string()).optional(),
    files: z.array(z.string()).optional(),
    verification: z.string().optional(),
    notes: z.array(z.string()).optional()
  })),
  verification: z.array(z.object({
    name: z.string(),
    command: z.string(),
    expectedOutput: z.string().optional(),
    description: z.string()
  })),
  troubleshooting: z.array(z.object({
    issue: z.string(),
    symptoms: z.array(z.string()),
    causes: z.array(z.string()),
    solutions: z.array(z.object({
      description: z.string(),
      steps: z.array(z.string()),
      commands: z.array(z.string()).optional(),
      notes: z.array(z.string()).optional()
    })),
    prevention: z.array(z.string()).optional()
  })),
  nextSteps: z.array(z.string())
})

export const ServiceResultSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.object({
    service: z.string(),
    operation: z.string(),
    code: z.string(),
    retryable: z.boolean(),
    context: z.record(z.string(), z.any()).optional()
  }).optional(),
  warnings: z.array(z.string()).optional(),
  metadata: z.object({
    duration: z.number().nonnegative(),
    timestamp: z.date(),
    version: z.string()
  }).optional()
})

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  data: z.any().optional(),
  read: z.boolean(),
  createdAt: z.date(),
  readAt: z.date().optional()
})

export const AnalyticsEventSchema = z.object({
  userId: z.string().optional(),
  event: z.string(),
  properties: z.record(z.string(), z.any()).optional(),
  timestamp: z.date().optional(),
  context: z.object({
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    page: z.object({
      path: z.string(),
      referrer: z.string().optional(),
      title: z.string().optional()
    }).optional()
  }).optional()
})

export const FileMetadataSchema = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  type: z.string(),
  lastModified: z.date(),
  etag: z.string()
})

export const EmailOptionsSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]),
  from: z.string().email().optional(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.union([z.instanceof(Buffer), z.string()]),
    contentType: z.string().optional(),
    cid: z.string().optional()
  })).optional(),
  headers: z.record(z.string(), z.string()).optional()
})

export const CodingPromptSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  prompt: z.string(),
  context: z.array(z.string()),
  expectedOutput: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  tags: z.array(z.string())
})

// ============================================================================
// ENHANCED VALIDATION SCHEMAS FOR COMPREHENSIVE TYPES
// ============================================================================

export const EnhancedIdeaInputSchema = IdeaInputSchema.extend({
  businessModel: z.string().optional(),
  targetMarket: z.string().optional(),
  competitiveAdvantage: z.string().optional(),
  technicalRequirements: z.array(z.string()).optional(),
  budgetRange: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string().length(3)
  }).optional(),
  timelinePreference: z.object({
    mvp: z.string(),
    fullLaunch: z.string(),
    milestones: z.array(z.string())
  }).optional()
})

export const DetailedProcessedIdeaSchema = ProcessedIdeaSchema.extend({
  marketAnalysis: z.object({
    size: z.number().positive(),
    growth: z.number(),
    trends: z.array(z.string()),
    opportunities: z.array(z.string())
  }).optional(),
  technicalComplexity: z.object({
    score: z.number().min(1).max(10),
    factors: z.array(z.string()),
    recommendations: z.array(z.string())
  }).optional(),
  businessViability: z.object({
    score: z.number().min(1).max(10),
    strengths: z.array(z.string()),
    challenges: z.array(z.string())
  }).optional()
})

export const UserPersonaSchema = z.object({
  name: z.string(),
  demographics: z.object({
    age: z.string(),
    gender: z.string(),
    location: z.string(),
    income: z.string(),
    education: z.string()
  }),
  psychographics: z.object({
    interests: z.array(z.string()),
    values: z.array(z.string()),
    lifestyle: z.string()
  }),
  painPoints: z.array(z.string()),
  goals: z.array(z.string()),
  behaviors: z.object({
    online: z.array(z.string()),
    purchasing: z.array(z.string()),
    communication: z.array(z.string())
  }),
  preferredChannels: z.array(z.string())
})

export const ValuePropositionSchema = z.object({
  headline: z.string(),
  subheadline: z.string(),
  benefits: z.array(z.string()),
  features: z.array(z.string()),
  proof: z.array(z.string()),
  targetSegment: z.string()
})

export const BusinessModelCanvasSchema = z.object({
  keyPartners: z.array(z.string()),
  keyActivities: z.array(z.string()),
  keyResources: z.array(z.string()),
  valuePropositions: z.array(z.string()),
  customerRelationships: z.array(z.string()),
  channels: z.array(z.string()),
  customerSegments: z.array(z.string()),
  costStructure: z.array(z.object({
    category: z.string(),
    description: z.string(),
    amount: z.number().nonnegative(),
    type: z.enum(['fixed', 'variable'])
  })),
  revenueStreams: z.array(z.object({
    name: z.string(),
    description: z.string(),
    model: z.string(),
    pricing: z.number().nonnegative(),
    volume: z.number().nonnegative(),
    frequency: z.string()
  }))
})

export const ComprehensiveProductPlanSchema = ProductPlanSchema.extend({
  marketValidation: z.object({
    surveys: z.array(z.object({
      question: z.string(),
      responses: z.array(z.object({
        answer: z.string(),
        count: z.number().nonnegative(),
        percentage: z.number().min(0).max(100)
      })),
      insights: z.array(z.string())
    })),
    interviews: z.array(z.object({
      persona: z.string(),
      painPoints: z.array(z.string()),
      solutions: z.array(z.string()),
      willingness_to_pay: z.number().nonnegative(),
      feedback: z.string()
    })),
    competitorAnalysis: CompetitorAnalysisSchema.extend({
      swotAnalysis: z.object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        opportunities: z.array(z.string()),
        threats: z.array(z.string())
      }).optional(),
      marketPositioning: z.array(z.object({
        competitor: z.string(),
        position: z.string(),
        differentiation: z.array(z.string())
      })).optional()
    })
  }).optional(),
  userPersonas: z.array(UserPersonaSchema).optional(),
  valueProposition: ValuePropositionSchema.optional(),
  businessModelCanvas: BusinessModelCanvasSchema.optional()
})

export const IntegrationSchema = z.object({
  name: z.string(),
  type: z.enum(['api', 'webhook', 'sdk', 'plugin']),
  purpose: z.string(),
  complexity: z.enum(['low', 'medium', 'high']),
  cost: z.number().nonnegative(),
  documentation: z.string(),
  alternatives: z.array(z.string())
})

export const APIDesignSchema = z.object({
  style: z.enum(['REST', 'GraphQL', 'gRPC', 'WebSocket']),
  authentication: z.array(z.string()),
  rateLimit: z.object({
    requests: z.number().positive(),
    window: z.string()
  }),
  versioning: z.string(),
  documentation: z.string(),
  endpoints: z.array(z.object({
    path: z.string(),
    method: z.string(),
    description: z.string(),
    parameters: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string(),
      example: z.any()
    })),
    responses: z.array(z.object({
      status: z.number(),
      description: z.string(),
      schema: z.any(),
      example: z.any()
    })),
    authentication: z.boolean()
  }))
})

export const ScalingStrategySchema = z.object({
  horizontal: z.object({
    enabled: z.boolean(),
    triggers: z.array(z.string()),
    limits: z.object({
      min: z.number().nonnegative(),
      max: z.number().positive()
    })
  }),
  vertical: z.object({
    enabled: z.boolean(),
    triggers: z.array(z.string()),
    limits: z.object({
      cpu: z.string(),
      memory: z.string()
    })
  }),
  database: z.object({
    sharding: z.boolean(),
    replication: z.boolean(),
    caching: z.array(z.string())
  }),
  cdn: z.object({
    enabled: z.boolean(),
    regions: z.array(z.string()),
    caching: z.array(z.string())
  })
})

export const ComprehensiveTechStackSchema = TechStackSchema.extend({
  architecture: z.object({
    pattern: z.string(),
    description: z.string(),
    benefits: z.array(z.string()),
    tradeoffs: z.array(z.string())
  }).optional(),
  integrations: z.array(IntegrationSchema).optional(),
  apiDesign: APIDesignSchema.optional(),
  dataFlow: z.object({
    nodes: z.array(z.object({
      id: z.string(),
      type: z.enum(['source', 'process', 'store', 'sink']),
      name: z.string(),
      description: z.string()
    })),
    connections: z.array(z.object({
      from: z.string(),
      to: z.string(),
      data: z.string(),
      description: z.string()
    })),
    description: z.string()
  }).optional(),
  scalingStrategy: ScalingStrategySchema.optional()
})

export const RetryPolicySchema = z.object({
  maxAttempts: z.number().positive(),
  backoffStrategy: z.enum(['linear', 'exponential', 'fixed']),
  baseDelay: z.number().nonnegative(),
  maxDelay: z.number().positive(),
  retryableErrors: z.array(z.string())
})

export const ComprehensiveAIWorkflowSchema = AIWorkflowSchema.extend({
  orchestration: z.object({
    type: z.enum(['sequential', 'parallel', 'conditional']),
    errorHandling: z.string(),
    retryPolicy: RetryPolicySchema
  }).optional(),
  monitoring: z.object({
    metrics: z.array(z.string()),
    alerts: z.array(z.object({
      name: z.string(),
      condition: z.string(),
      threshold: z.number(),
      action: z.string(),
      recipients: z.array(z.string())
    })),
    logging: z.object({
      level: z.enum(['debug', 'info', 'warn', 'error']),
      format: z.enum(['json', 'text']),
      destinations: z.array(z.string()),
      retention: z.string()
    })
  }).optional(),
  optimization: z.object({
    caching: z.boolean(),
    batching: z.boolean(),
    streaming: z.boolean()
  }).optional()
})

// ============================================================================
// COMPREHENSIVE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validation functions for all major types
 */
export const validateUser = (data: unknown) => UserSchema.safeParse(data)
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data)
export const validateBlueprint = (data: unknown) => BlueprintSchema.safeParse(data)
export const validateIdeaInput = (data: unknown) => IdeaInputSchema.safeParse(data)
export const validateProcessedIdea = (data: unknown) => ProcessedIdeaSchema.safeParse(data)
export const validateProductPlan = (data: unknown) => ProductPlanSchema.safeParse(data)
export const validateTechStack = (data: unknown) => TechStackSchema.safeParse(data)
export const validateAIWorkflow = (data: unknown) => AIWorkflowSchema.safeParse(data)
export const validateRoadmap = (data: unknown) => RoadmapSchema.safeParse(data)
export const validateFinancialModel = (data: unknown) => FinancialModelSchema.safeParse(data)
export const validateGenerationJob = (data: unknown) => GenerationJobSchema.safeParse(data)
export const validateTemplate = (data: unknown) => TemplateSchema.safeParse(data)

/**
 * Enhanced validation functions for comprehensive types
 */
export const validateEnhancedIdeaInput = (data: unknown) => EnhancedIdeaInputSchema.safeParse(data)
export const validateDetailedProcessedIdea = (data: unknown) => DetailedProcessedIdeaSchema.safeParse(data)
export const validateComprehensiveProductPlan = (data: unknown) => ComprehensiveProductPlanSchema.safeParse(data)
export const validateComprehensiveTechStack = (data: unknown) => ComprehensiveTechStackSchema.safeParse(data)
export const validateComprehensiveAIWorkflow = (data: unknown) => ComprehensiveAIWorkflowSchema.safeParse(data)

/**
 * Service validation functions
 */
export const validateScaleEstimate = (data: unknown) => ScaleEstimateSchema.safeParse(data)
export const validateCostConstraints = (data: unknown) => CostConstraintsSchema.safeParse(data)
export const validateProjectStructure = (data: unknown) => ProjectStructureSchema.safeParse(data)
export const validateSetupInstructions = (data: unknown) => SetupInstructionsSchema.safeParse(data)
export const validateServiceResult = (data: unknown) => ServiceResultSchema.safeParse(data)

/**
 * API validation functions
 */
export const validateApiResponse = (data: unknown) => ApiResponseSchema.safeParse(data)
export const validatePaginatedResponse = (data: unknown) => PaginatedResponseSchema.safeParse(data)

/**
 * Utility validation functions
 */
export const validateNotification = (data: unknown) => NotificationSchema.safeParse(data)
export const validateAnalyticsEvent = (data: unknown) => AnalyticsEventSchema.safeParse(data)
export const validateFileMetadata = (data: unknown) => FileMetadataSchema.safeParse(data)
export const validateEmailOptions = (data: unknown) => EmailOptionsSchema.safeParse(data)

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Helper function to validate and transform data
 */
export const validateAndTransform = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(errorMessage || `Validation failed: ${result.error.message}`)
  }
  return result.data
}

/**
 * Helper function to validate arrays
 */
export const validateArray = <T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T[] => {
  const arraySchema = z.array(itemSchema)
  return validateAndTransform(arraySchema, data, errorMessage)
}

/**
 * Helper function to validate optional data
 */
export const validateOptional = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | undefined => {
  if (data === undefined || data === null) {
    return undefined
  }
  return validateAndTransform(schema, data)
}

/**
 * Helper function to create validation middleware
 */
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { isValid: boolean; data?: T; errors?: string[] } => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { isValid: true, data: result.data }
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
  }
}

export const TeamMemberSchema = z.object({
  role: z.string(),
  skills: z.array(z.string()),
  experience: z.enum(['junior', 'mid', 'senior']),
  allocation: z.number().min(0).max(100),
  cost: z.number().nonnegative(),
  startDate: z.date()
})

export const TestingStrategySchema = z.object({
  unit: z.object({
    coverage: z.number().min(0).max(100),
    framework: z.string(),
    automation: z.boolean()
  }),
  integration: z.object({
    coverage: z.number().min(0).max(100),
    framework: z.string(),
    automation: z.boolean()
  }),
  e2e: z.object({
    coverage: z.number().min(0).max(100),
    framework: z.string(),
    automation: z.boolean()
  }),
  performance: z.object({
    tools: z.array(z.string()),
    metrics: z.array(z.string()),
    thresholds: z.record(z.string(), z.number())
  })
})

export const ComprehensiveRoadmapSchema = RoadmapSchema.extend({
  methodology: z.object({
    framework: z.enum(['agile', 'waterfall', 'lean', 'kanban']),
    sprintLength: z.number().positive(),
    ceremonies: z.array(z.string())
  }).optional(),
  resourcePlanning: z.object({
    team: z.array(TeamMemberSchema),
    tools: z.array(z.object({
      name: z.string(),
      category: z.string(),
      purpose: z.string(),
      cost: z.number().nonnegative(),
      licenses: z.number().positive(),
      alternatives: z.array(z.string())
    })),
    infrastructure: z.array(z.object({
      component: z.string(),
      specifications: z.string(),
      cost: z.number().nonnegative(),
      scalability: z.string(),
      alternatives: z.array(z.string())
    }))
  }).optional(),
  qualityAssurance: z.object({
    testingStrategy: TestingStrategySchema,
    codeQuality: z.object({
      linting: z.object({
        rules: z.string(),
        enforcement: z.enum(['warning', 'error'])
      }),
      formatting: z.object({
        style: z.string(),
        automation: z.boolean()
      }),
      documentation: z.object({
        coverage: z.number().min(0).max(100),
        standards: z.array(z.string())
      }),
      security: z.object({
        scanning: z.boolean(),
        tools: z.array(z.string()),
        policies: z.array(z.string())
      })
    }),
    deployment: z.object({
      environments: z.array(z.object({
        name: z.string(),
        purpose: z.string(),
        configuration: z.record(z.string(), z.any()),
        resources: z.array(z.string())
      })),
      pipeline: z.object({
        stages: z.array(z.object({
          name: z.string(),
          tasks: z.array(z.string()),
          conditions: z.array(z.string()),
          timeout: z.number().positive()
        })),
        triggers: z.array(z.string()),
        approvals: z.array(z.object({
          stage: z.string(),
          approvers: z.array(z.string()),
          required: z.number().positive(),
          timeout: z.number().positive()
        }))
      }),
      rollback: z.object({
        automatic: z.boolean(),
        triggers: z.array(z.string()),
        process: z.array(z.string()),
        testing: z.array(z.string())
      })
    })
  }).optional()
})

export const FinancialAssumptionsSchema = z.object({
  market: z.object({
    size: z.number().positive(),
    growth: z.number(),
    penetration: z.number().min(0).max(1)
  }),
  pricing: z.object({
    strategy: z.string(),
    elasticity: z.number(),
    increases: z.array(z.number())
  }),
  costs: z.object({
    inflation: z.number(),
    optimization: z.number(),
    scaling: z.number()
  }),
  operations: z.object({
    efficiency: z.number(),
    automation: z.number(),
    outsourcing: z.number()
  })
})

export const BusinessValuationSchema = z.object({
  methods: z.array(z.object({
    name: z.string(),
    value: z.number().nonnegative(),
    confidence: z.number().min(0).max(1),
    assumptions: z.array(z.string())
  })),
  multiples: z.array(z.object({
    metric: z.string(),
    multiple: z.number().positive(),
    value: z.number().nonnegative(),
    comparables: z.array(z.string())
  })),
  dcf: z.object({
    projectionYears: z.number().positive(),
    terminalGrowth: z.number(),
    discountRate: z.number().positive(),
    cashFlows: z.array(z.number()),
    terminalValue: z.number().nonnegative(),
    presentValue: z.number().nonnegative()
  }),
  comparables: z.object({
    companies: z.array(z.object({
      name: z.string(),
      metrics: z.record(z.string(), z.number()),
      adjustments: z.record(z.string(), z.number()),
      weight: z.number().min(0).max(1)
    })),
    metrics: z.array(z.string()),
    adjustments: z.array(z.string()),
    valuation: z.number().nonnegative()
  })
})

export const ComprehensiveFinancialModelSchema = FinancialModelSchema.extend({
  assumptions: FinancialAssumptionsSchema.optional(),
  sensitivity: z.object({
    variables: z.array(z.object({
      name: z.string(),
      baseValue: z.number(),
      range: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number().positive()
      }),
      impact: z.string()
    })),
    scenarios: z.array(z.object({
      name: z.string(),
      variables: z.record(z.string(), z.number()),
      probability: z.number().min(0).max(1)
    })),
    results: z.array(z.object({
      scenario: z.string(),
      metrics: z.record(z.string(), z.number()),
      variance: z.record(z.string(), z.number())
    }))
  }).optional(),
  valuation: BusinessValuationSchema.optional(),
  funding: z.object({
    stages: z.array(z.object({
      name: z.string(),
      amount: z.number().positive(),
      purpose: z.array(z.string()),
      milestones: z.array(z.string()),
      timeline: z.string()
    })),
    sources: z.array(z.object({
      type: z.string(),
      amount: z.number().positive(),
      probability: z.number().min(0).max(1),
      requirements: z.array(z.string()),
      timeline: z.string()
    })),
    timeline: z.object({
      preparation: z.string(),
      fundraising: z.string(),
      closing: z.string(),
      milestones: z.array(z.object({
        name: z.string(),
        date: z.date(),
        requirements: z.array(z.string()),
        deliverables: z.array(z.string())
      }))
    }),
    terms: z.object({
      valuation: z.object({
        pre: z.number().nonnegative(),
        post: z.number().nonnegative()
      }),
      equity: z.number().min(0).max(100),
      liquidation: z.string(),
      board: z.array(z.string()),
      voting: z.array(z.string()),
      antiDilution: z.string()
    })
  }).optional()
})

// ============================================================================
// EXPORT VALIDATION FUNCTIONS
// ============================================================================

export const validateIdeaInput = (data: unknown) => IdeaInputSchema.safeParse(data)
export const validateEnhancedIdeaInput = (data: unknown) => EnhancedIdeaInputSchema.safeParse(data)
export const validateDetailedProcessedIdea = (data: unknown) => DetailedProcessedIdeaSchema.safeParse(data)
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data)
export const validateBlueprint = (data: unknown) => BlueprintSchema.safeParse(data)
export const validateComprehensiveProductPlan = (data: unknown) => ComprehensiveProductPlanSchema.safeParse(data)
export const validateComprehensiveTechStack = (data: unknown) => ComprehensiveTechStackSchema.safeParse(data)
export const validateComprehensiveAIWorkflow = (data: unknown) => ComprehensiveAIWorkflowSchema.safeParse(data)
export const validateComprehensiveRoadmap = (data: unknown) => ComprehensiveRoadmapSchema.safeParse(data)
export const validateComprehensiveFinancialModel = (data: unknown) => ComprehensiveFinancialModelSchema.safeParse(data)
export const validateUser = (data: unknown) => UserSchema.safeParse(data)
export const validateGenerationJob = (data: unknown) => GenerationJobSchema.safeParse(data)
export const validateTemplate = (data: unknown) => TemplateSchema.safeParse(data)
export const validateScaleEstimate = (data: unknown) => ScaleEstimateSchema.safeParse(data)
export const validateCostConstraints = (data: unknown) => CostConstraintsSchema.safeParse(data)
export const validateProjectStructure = (data: unknown) => ProjectStructureSchema.safeParse(data)
export const validateSetupInstructions = (data: unknown) => SetupInstructionsSchema.safeParse(data)
export const validateServiceResult = (data: unknown) => ServiceResultSchema.safeParse(data)
export const validateNotification = (data: unknown) => NotificationSchema.safeParse(data)
export const validateAnalyticsEvent = (data: unknown) => AnalyticsEventSchema.safeParse(data)
export const validateFileMetadata = (data: unknown) => FileMetadataSchema.safeParse(data)
export const validateEmailOptions = (data: unknown) => EmailOptionsSchema.safeParse(data)
export const validateUserPersona = (data: unknown) => UserPersonaSchema.safeParse(data)
export const validateValueProposition = (data: unknown) => ValuePropositionSchema.safeParse(data)
export const validateBusinessModelCanvas = (data: unknown) => BusinessModelCanvasSchema.safeParse(data)
export const validateIntegration = (data: unknown) => IntegrationSchema.safeParse(data)
export const validateAPIDesign = (data: unknown) => APIDesignSchema.safeParse(data)
export const validateScalingStrategy = (data: unknown) => ScalingStrategySchema.safeParse(data)
export const validateRetryPolicy = (data: unknown) => RetryPolicySchema.safeParse(data)
export const validateTeamMember = (data: unknown) => TeamMemberSchema.safeParse(data)
export const validateTestingStrategy = (data: unknown) => TestingStrategySchema.safeParse(data)
export const validateFinancialAssumptions = (data: unknown) => FinancialAssumptionsSchema.safeParse(data)
export const validateBusinessValuation = (data: unknown) => BusinessValuationSchema.safeParse(data)

// Helper function to create validation middleware
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    const result = schema.safeParse(data)
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.message}`)
    }
    return result.data
  }
}

// Helper function to validate and transform data
export const validateAndTransform = <T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  errorMessage?: string
): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    const message = errorMessage || `Validation failed: ${result.error.message}`
    throw new Error(message)
  }
  return result.data
}

// ============================================================================
// ENHANCED VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validation functions for all major types
 */
export const validateUser = (data: unknown) => UserSchema.safeParse(data)
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data)
export const validateBlueprint = (data: unknown) => BlueprintSchema.safeParse(data)
export const validateIdeaInput = (data: unknown) => IdeaInputSchema.safeParse(data)
export const validateProcessedIdea = (data: unknown) => ProcessedIdeaSchema.safeParse(data)
export const validateProductPlan = (data: unknown) => ProductPlanSchema.safeParse(data)
export const validateTechStack = (data: unknown) => TechStackSchema.safeParse(data)
export const validateAIWorkflow = (data: unknown) => AIWorkflowSchema.safeParse(data)
export const validateRoadmap = (data: unknown) => RoadmapSchema.safeParse(data)
export const validateFinancialModel = (data: unknown) => FinancialModelSchema.safeParse(data)
export const validateGenerationJob = (data: unknown) => GenerationJobSchema.safeParse(data)
export const validateTemplate = (data: unknown) => TemplateSchema.safeParse(data)

/**
 * Enhanced validation functions for comprehensive types
 */
export const validateEnhancedIdeaInput = (data: unknown) => EnhancedIdeaInputSchema.safeParse(data)
export const validateDetailedProcessedIdea = (data: unknown) => DetailedProcessedIdeaSchema.safeParse(data)
export const validateComprehensiveProductPlan = (data: unknown) => ComprehensiveProductPlanSchema.safeParse(data)
export const validateComprehensiveTechStack = (data: unknown) => ComprehensiveTechStackSchema.safeParse(data)
export const validateComprehensiveAIWorkflow = (data: unknown) => ComprehensiveAIWorkflowSchema.safeParse(data)

/**
 * Service validation functions
 */
export const validateScaleEstimate = (data: unknown) => ScaleEstimateSchema.safeParse(data)
export const validateCostConstraints = (data: unknown) => CostConstraintsSchema.safeParse(data)
export const validateProjectStructure = (data: unknown) => ProjectStructureSchema.safeParse(data)
export const validateSetupInstructions = (data: unknown) => SetupInstructionsSchema.safeParse(data)
export const validateServiceResult = (data: unknown) => ServiceResultSchema.safeParse(data)

/**
 * API validation functions
 */
export const validateApiResponse = (data: unknown) => ApiResponseSchema.safeParse(data)
export const validatePaginatedResponse = (data: unknown) => PaginatedResponseSchema.safeParse(data)

/**
 * Utility validation functions
 */
export const validateNotification = (data: unknown) => NotificationSchema.safeParse(data)
export const validateAnalyticsEvent = (data: unknown) => AnalyticsEventSchema.safeParse(data)
export const validateFileMetadata = (data: unknown) => FileMetadataSchema.safeParse(data)
export const validateEmailOptions = (data: unknown) => EmailOptionsSchema.safeParse(data)

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Helper function to validate and transform data
 */
export const validateAndTransform = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new Error(errorMessage || `Validation failed: ${result.error.message}`)
  }
  return result.data
}

/**
 * Helper function to validate arrays
 */
export const validateArray = <T>(
  itemSchema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): T[] => {
  const arraySchema = z.array(itemSchema)
  return validateAndTransform(arraySchema, data, errorMessage)
}

/**
 * Helper function to validate optional data
 */
export const validateOptional = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T | undefined => {
  if (data === undefined || data === null) {
    return undefined
  }
  return validateAndTransform(schema, data)
}

/**
 * Helper function to create validation middleware
 */
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): { isValid: boolean; data?: T; errors?: string[] } => {
    const result = schema.safeParse(data)
    if (result.success) {
      return { isValid: true, data: result.data }
    } else {
      return {
        isValid: false,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }
  }
}

/**
 * Helper function to validate partial data (useful for updates)
 */
export const validatePartial = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorMessage?: string
): Partial<T> => {
  const partialSchema = schema.partial()
  return validateAndTransform(partialSchema, data, errorMessage)
}

/**
 * Helper function to validate with custom error formatting
 */
export const validateWithCustomErrors = <T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  customErrorMap?: (error: z.ZodError) => string[]
): { success: boolean; data?: T; errors?: string[] } => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    const errors = customErrorMap 
      ? customErrorMap(result.error)
      : result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
    return { success: false, errors }
  }
}

/**
 * Helper function to validate nested objects
 */
export const validateNested = <T extends Record<string, any>>(
  schemas: { [K in keyof T]: z.ZodSchema<T[K]> },
  data: unknown
): { isValid: boolean; data?: T; errors?: Record<keyof T, string[]> } => {
  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: {} as Record<keyof T, string[]> }
  }

  const obj = data as Record<string, any>
  const result: Partial<T> = {}
  const errors: Partial<Record<keyof T, string[]>> = {}
  let isValid = true

  for (const key in schemas) {
    const schema = schemas[key]
    const value = obj[key]
    const validation = schema.safeParse(value)
    
    if (validation.success) {
      result[key] = validation.data
    } else {
      isValid = false
      errors[key] = validation.error.errors.map(err => err.message)
    }
  }

  return {
    isValid,
    data: isValid ? result as T : undefined,
    errors: isValid ? undefined : errors as Record<keyof T, string[]>
  }
}

/**
 * Helper function to create a union validator
 */
export const createUnionValidator = <T extends readonly [z.ZodTypeAny, ...z.ZodTypeAny[]]>(
  ...schemas: T
) => {
  const unionSchema = z.union(schemas)
  return (data: unknown) => unionSchema.safeParse(data)
}

/**
 * Helper function to validate discriminated unions
 */
export const validateDiscriminatedUnion = <T extends string, U extends Record<T, any>>(
  discriminator: T,
  schemas: { [K in U[T]]: z.ZodSchema<Extract<U, Record<T, K>>> },
  data: unknown
): { success: boolean; data?: U; errors?: string[] } => {
  if (!data || typeof data !== 'object' || !(discriminator in data)) {
    return { 
      success: false, 
      errors: [`Missing discriminator field: ${discriminator}`] 
    }
  }

  const obj = data as Record<string, any>
  const discriminatorValue = obj[discriminator]
  const schema = schemas[discriminatorValue as keyof typeof schemas]

  if (!schema) {
    return { 
      success: false, 
      errors: [`Unknown discriminator value: ${discriminatorValue}`] 
    }
  }

  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data as U }
  } else {
    return { 
      success: false, 
      errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
    }
  }
}

/**
 * Helper function to validate with transformation
 */
export const validateAndTransformWith = <T, U>(
  schema: z.ZodSchema<T>,
  transformer: (data: T) => U,
  data: unknown,
  errorMessage?: string
): U => {
  const validated = validateAndTransform(schema, data, errorMessage)
  return transformer(validated)
}

/**
 * Helper function to create a cached validator
 */
export const createCachedValidator = <T>(
  schema: z.ZodSchema<T>,
  cacheSize: number = 100
) => {
  const cache = new Map<string, { success: boolean; data?: T; errors?: string[] }>()
  
  return (data: unknown) => {
    const key = JSON.stringify(data)
    
    if (cache.has(key)) {
      return cache.get(key)!
    }
    
    const result = schema.safeParse(data)
    const cacheValue = result.success
      ? { success: true, data: result.data }
      : { 
          success: false, 
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
        }
    
    // Simple LRU cache implementation
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value
      cache.delete(firstKey)
    }
    
    cache.set(key, cacheValue)
    return cacheValue
  }
}

/**
 * Helper function to validate with context
 */
export const validateWithContext = <T, C>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context: C,
  contextValidator?: (data: T, context: C) => string[]
): { success: boolean; data?: T; errors?: string[] } => {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    return { 
      success: false, 
      errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`) 
    }
  }
  
  if (contextValidator) {
    const contextErrors = contextValidator(result.data, context)
    if (contextErrors.length > 0) {
      return { success: false, errors: contextErrors }
    }
  }
  
  return { success: true, data: result.data }
}

// ============================================================================
// COMPREHENSIVE VALIDATION FUNCTIONS
// ============================================================================

/**
 * Comprehensive validation functions for all major types
 */
export const validateUser = (data: unknown) => UserSchema.safeParse(data)
export const validateProject = (data: unknown) => ProjectSchema.safeParse(data)
export const validateBlueprint = (data: unknown) => BlueprintSchema.safeParse(data)
export const validateIdeaInput = (data: unknown) => IdeaInputSchema.safeParse(data)
export const validateProcessedIdea = (data: unknown) => ProcessedIdeaSchema.safeParse(data)
export const validateProductPlan = (data: unknown) => ProductPlanSchema.safeParse(data)
export const validateTechStack = (data: unknown) => TechStackSchema.safeParse(data)
export const validateAIWorkflow = (data: unknown) => AIWorkflowSchema.safeParse(data)
export const validateRoadmap = (data: unknown) => RoadmapSchema.safeParse(data)
export const validateFinancialModel = (data: unknown) => FinancialModelSchema.safeParse(data)
export const validateGenerationJob = (data: unknown) => GenerationJobSchema.safeParse(data)
export const validateTemplate = (data: unknown) => TemplateSchema.safeParse(data)
export const validateAnalyticsEvent = (data: unknown) => AnalyticsEventDbSchema.safeParse(data)
export const validateCodingPrompt = (data: unknown) => CodingPromptSchema.safeParse(data)

// Enhanced validation functions
export const validateEnhancedIdeaInput = (data: unknown) => EnhancedIdeaInputSchema.safeParse(data)
export const validateDetailedProcessedIdea = (data: unknown) => DetailedProcessedIdeaSchema.safeParse(data)
export const validateComprehensiveProductPlan = (data: unknown) => ComprehensiveProductPlanSchema.safeParse(data)
export const validateComprehensiveTechStack = (data: unknown) => ComprehensiveTechStackSchema.safeParse(data)
export const validateComprehensiveAIWorkflow = (data: unknown) => ComprehensiveAIWorkflowSchema.safeParse(data)

// Service validation functions
export const validateScaleEstimate = (data: unknown) => ScaleEstimateSchema.safeParse(data)
export const validateCostConstraints = (data: unknown) => CostConstraintsSchema.safeParse(data)
export const validateFinancialScenario = (data: unknown) => FinancialScenarioSchema.safeParse(data)
export const validateProjectStructure = (data: unknown) => ProjectStructureSchema.safeParse(data)
export const validateSetupInstructions = (data: unknown) => SetupInstructionsSchema.safeParse(data)
export const validateServiceResult = (data: unknown) => ServiceResultSchema.safeParse(data)
export const validateNotification = (data: unknown) => NotificationSchema.safeParse(data)
export const validateFileMetadata = (data: unknown) => FileMetadataSchema.safeParse(data)
export const validateEmailOptions = (data: unknown) => EmailOptionsSchema.safeParse(data)

// API validation functions
export const validateApiResponse = (data: unknown) => ApiResponseSchema.safeParse(data)
export const validatePaginatedResponse = (data: unknown) => PaginatedResponseSchema.safeParse(data)

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Validate and transform data with custom error handling
 */
export const validateAndTransform = <T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  errorMessage?: string
): T => {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errors = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
    throw new Error(errorMessage || `Validation failed: ${errors}`)
  }
  return result.data
}

/**
 * Validate data and return validation result with detailed errors
 */
export const validateWithDetails = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): {
  success: boolean
  data?: T
  errors?: Array<{
    path: string
    message: string
    code: string
  }>
} => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message,
      code: err.code
    }))
  }
}

/**
 * Create a validation middleware for API routes
 */
export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown): T => {
    return validateAndTransform(data, schema, 'Invalid request data')
  }
}

/**
 * Batch validate multiple items
 */
export const batchValidate = <T>(
  items: unknown[],
  schema: z.ZodSchema<T>
): {
  valid: T[]
  invalid: Array<{ index: number; errors: string[] }>
} => {
  const valid: T[] = []
  const invalid: Array<{ index: number; errors: string[] }> = []
  
  items.forEach((item, index) => {
    const result = schema.safeParse(item)
    if (result.success) {
      valid.push(result.data)
    } else {
      invalid.push({
        index,
        errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      })
    }
  })
  
  return { valid, invalid }
}

/**
 * Validate partial data (useful for updates)
 */
export const validatePartial = <T>(
  data: unknown,
  schema: z.ZodSchema<T>
): Partial<T> => {
  const partialSchema = schema.partial()
  return validateAndTransform(data, partialSchema, 'Invalid partial data')
}

/**
 * Validate and sanitize user input
 */
export const sanitizeAndValidate = <T>(
  data: unknown,
  schema: z.ZodSchema<T>,
  sanitizers?: Record<string, (value: any) => any>
): T => {
  let sanitizedData = data
  
  if (sanitizers && typeof data === 'object' && data !== null) {
    sanitizedData = { ...data as Record<string, any> }
    Object.entries(sanitizers).forEach(([key, sanitizer]) => {
      if (key in (sanitizedData as Record<string, any>)) {
        (sanitizedData as Record<string, any>)[key] = sanitizer((sanitizedData as Record<string, any>)[key])
      }
    })
  }
  
  return validateAndTransform(sanitizedData, schema, 'Invalid or unsafe data')
}

// ============================================================================
// COMMON SANITIZERS
// ============================================================================

export const sanitizers = {
  /**
   * Trim whitespace from strings
   */
  trim: (value: any): any => {
    return typeof value === 'string' ? value.trim() : value
  },
  
  /**
   * Convert to lowercase
   */
  toLowerCase: (value: any): any => {
    return typeof value === 'string' ? value.toLowerCase() : value
  },
  
  /**
   * Remove HTML tags
   */
  stripHtml: (value: any): any => {
    return typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value
  },
  
  /**
   * Escape HTML entities
   */
  escapeHtml: (value: any): any => {
    if (typeof value !== 'string') return value
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
  },
  
  /**
   * Normalize email addresses
   */
  normalizeEmail: (value: any): any => {
    return typeof value === 'string' ? value.toLowerCase().trim() : value
  },
  
  /**
   * Remove non-numeric characters
   */
  numbersOnly: (value: any): any => {
    return typeof value === 'string' ? value.replace(/[^0-9]/g, '') : value
  },
  
  /**
   * Limit string length
   */
  limitLength: (maxLength: number) => (value: any): any => {
    return typeof value === 'string' && value.length > maxLength 
      ? value.substring(0, maxLength) 
      : value
  }
}

// ============================================================================
// VALIDATION PRESETS
// ============================================================================

/**
 * Common validation presets for frequent use cases
 */
export const validationPresets = {
  /**
   * Validate user registration data
   */
  userRegistration: (data: unknown) => {
    const schema = z.object({
      email: z.string().email('Invalid email address'),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    })
    
    return validateAndTransform(data, schema, 'Invalid registration data')
  },
  
  /**
   * Validate project creation data
   */
  projectCreation: (data: unknown) => {
    const schema = z.object({
      name: z.string().min(1, 'Project name is required').max(100, 'Name too long'),
      description: z.string().max(500, 'Description too long').optional(),
      originalIdea: z.string().min(10, 'Idea must be at least 10 characters').max(2000, 'Idea too long'),
      category: z.string().optional()
    })
    
    return validateAndTransform(data, schema, 'Invalid project data')
  },
  
  /**
   * Validate idea submission
   */
  ideaSubmission: (data: unknown) => {
    const schema = IdeaInputSchema.extend({
      description: z.string()
        .min(10, 'Description must be at least 10 characters')
        .max(2000, 'Description must be less than 2000 characters')
        .refine(val => val.split(' ').length >= 5, {
          message: 'Description must contain at least 5 words'
        })
    })
    
    return sanitizeAndValidate(data, schema, {
      description: sanitizers.trim,
      industry: sanitizers.trim,
      targetAudience: sanitizers.trim
    })
  },
  
  /**
   * Validate user preferences update
   */
  userPreferencesUpdate: (data: unknown) => {
    return validatePartial(data, UserPreferencesSchema)
  },
  
  /**
   * Validate export request
   */
  exportRequest: (data: unknown) => {
    const schema = z.object({
      projectId: z.string().cuid('Invalid project ID'),
      format: ExportFormatSchema,
      sections: z.array(z.enum(['productPlan', 'techStack', 'aiWorkflow', 'roadmap', 'financialModel'])).optional(),
      includeMetadata: z.boolean().default(true)
    })
    
    return validateAndTransform(data, schema, 'Invalid export request')
  }
}