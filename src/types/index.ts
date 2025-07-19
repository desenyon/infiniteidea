// Core Types and Interfaces for Desenyon: InfiniteIdea
// This file contains all TypeScript type definitions for the application

// ============================================================================
// ENUMS
// ============================================================================

export enum SubscriptionTier {
  FREE = 'FREE',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE'
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ARCHIVED = 'ARCHIVED'
}

export enum JobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum ComplexityLevel {
  SIMPLE = 'SIMPLE',
  MODERATE = 'MODERATE',
  COMPLEX = 'COMPLEX',
  ENTERPRISE = 'ENTERPRISE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum FeatureCategory {
  CORE = 'CORE',
  UI_UX = 'UI_UX',
  INTEGRATION = 'INTEGRATION',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  ANALYTICS = 'ANALYTICS'
}

export enum TechCategory {
  FRONTEND = 'FRONTEND',
  BACKEND = 'BACKEND',
  DATABASE = 'DATABASE',
  AI_ML = 'AI_ML',
  DEPLOYMENT = 'DEPLOYMENT',
  MONITORING = 'MONITORING'
}

export enum NodeType {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  AI_SERVICE = 'AI_SERVICE',
  OUTPUT = 'OUTPUT',
  DECISION = 'DECISION',
  INTEGRATION = 'INTEGRATION'
}

export enum IdeaCategory {
  SAAS = 'SAAS',
  ECOMMERCE = 'ECOMMERCE',
  MOBILE_APP = 'MOBILE_APP',
  WEB_APP = 'WEB_APP',
  AI_TOOL = 'AI_TOOL',
  MARKETPLACE = 'MARKETPLACE',
  SOCIAL = 'SOCIAL',
  FINTECH = 'FINTECH',
  HEALTHTECH = 'HEALTHTECH',
  EDTECH = 'EDTECH'
}

export enum RecoveryStrategy {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  MANUAL = 'MANUAL',
  SKIP = 'SKIP'
}

export enum ExportFormat {
  PDF = 'PDF',
  MARKDOWN = 'MARKDOWN',
  JSON = 'JSON',
  HTML = 'HTML'
}

// ============================================================================
// CORE DATA MODELS
// ============================================================================

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  emailVerified?: Date
  subscription: SubscriptionTier
  preferences?: UserPreferences
  createdAt: Date
  updatedAt: Date
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  defaultIndustry?: string
  aiProvider: 'openai' | 'anthropic' | 'auto'
  exportFormat: ExportFormat
  notifications: {
    email: boolean
    browser: boolean
    generationComplete: boolean
    weeklyDigest: boolean
  }
  privacy: {
    shareUsageData: boolean
    allowAnalytics: boolean
  }
}

export interface Project {
  id: string
  userId: string
  name: string
  description?: string
  originalIdea: string
  status: ProjectStatus
  category?: string
  complexity?: ComplexityLevel
  blueprint?: Blueprint
  generatedAt?: Date
  lastModified: Date
  createdAt: Date
  updatedAt: Date
}

export interface Blueprint {
  id: string
  productPlan: ProductPlan
  techStack: TechStack
  aiWorkflow: AIWorkflow
  roadmap: Roadmap
  financialModel: FinancialModel
  generatedAt: Date
}

// ============================================================================
// IDEA PROCESSING
// ============================================================================

export interface IdeaInput {
  description: string
  industry?: string
  targetAudience?: string
  constraints?: string[]
  budget?: number
  timeline?: string
}

export interface ProcessedIdea {
  id: string
  originalInput: string
  extractedFeatures: string[]
  category: IdeaCategory
  complexity: ComplexityLevel
  keywords: string[]
  timestamp: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  suggestions: string[]
}

// ============================================================================
// PRODUCT PLAN
// ============================================================================

export interface ProductPlan {
  targetAudience: AudienceProfile
  coreFeatures: Feature[]
  differentiators: string[]
  monetization: MonetizationStrategy
  gtmStrategy: GTMPlan
  competitorAnalysis: CompetitorAnalysis
}

export interface AudienceProfile {
  primary: {
    demographics: string
    psychographics: string
    painPoints: string[]
    goals: string[]
  }
  secondary?: {
    demographics: string
    psychographics: string
    painPoints: string[]
    goals: string[]
  }
  marketSize: {
    tam: number // Total Addressable Market
    sam: number // Serviceable Addressable Market
    som: number // Serviceable Obtainable Market
  }
}

export interface Feature {
  id: string
  name: string
  description: string
  priority: Priority
  estimatedHours: number
  dependencies: string[]
  category: FeatureCategory
  userStory: string
  acceptanceCriteria: string[]
}

export interface MonetizationStrategy {
  primary: {
    model: 'subscription' | 'one-time' | 'freemium' | 'marketplace' | 'advertising'
    pricing: PricingTier[]
    reasoning: string
  }
  alternatives: {
    model: string
    reasoning: string
    feasibility: number // 1-10 scale
  }[]
}

export interface PricingTier {
  name: string
  price: number
  interval: 'monthly' | 'yearly' | 'one-time'
  features: string[]
  limitations?: string[]
  targetSegment: string
}

export interface GTMPlan {
  launchStrategy: string
  marketingChannels: MarketingChannel[]
  partnerships: string[]
  timeline: Milestone[]
  budget: number
}

export interface MarketingChannel {
  name: string
  cost: number
  expectedROI: number
  timeline: string
  description: string
}

export interface CompetitorAnalysis {
  direct: Competitor[]
  indirect: Competitor[]
  whitespace: string[]
}

export interface Competitor {
  name: string
  strengths: string[]
  weaknesses: string[]
  pricing: string
  marketShare?: number
}

// ============================================================================
// TECHNICAL ARCHITECTURE
// ============================================================================

export interface TechStack {
  frontend: TechChoice[]
  backend: TechChoice[]
  database: TechChoice[]
  aiServices: AIService[]
  deployment: DeploymentOption[]
  security: SecurityGuideline[]
  monitoring: MonitoringTool[]
}

export interface TechChoice {
  name: string
  category: TechCategory
  reasoning: string
  alternatives: string[]
  pros: string[]
  cons: string[]
  cost: number
  learningCurve: 'low' | 'medium' | 'high'
  communitySupport: number // 1-10 scale
}

export interface AIService {
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'local' | 'other'
  model: string
  useCase: string
  cost: number
  latency: number
  accuracy: number
}

export interface DeploymentOption {
  platform: string
  cost: number
  scalability: number
  complexity: number
  reasoning: string
  requirements: string[]
}

export interface SecurityGuideline {
  category: string
  requirement: string
  implementation: string
  priority: Priority
  compliance?: string[]
}

export interface MonitoringTool {
  name: string
  category: 'performance' | 'errors' | 'analytics' | 'logs'
  cost: number
  features: string[]
}

// ============================================================================
// AI WORKFLOW
// ============================================================================

export interface AIWorkflow {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  modules: WorkflowModule[]
  configuration: WorkflowConfig
}

export interface WorkflowNode {
  id: string
  type: NodeType
  label: string
  position: Position
  configuration: NodeConfig
  inputs: NodeInput[]
  outputs: NodeOutput[]
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
}

export interface WorkflowModule {
  id: string
  name: string
  description: string
  category: string
  nodes: string[]
  configurable: boolean
  required: boolean
}

export interface WorkflowConfig {
  parallel: boolean
  timeout: number
  retries: number
  fallbackEnabled: boolean
}

export interface Position {
  x: number
  y: number
}

export interface NodeConfig {
  [key: string]: any
}

export interface NodeInput {
  id: string
  type: string
  required: boolean
  description: string
}

export interface NodeOutput {
  id: string
  type: string
  description: string
}

// ============================================================================
// DEVELOPMENT ROADMAP
// ============================================================================

export interface Roadmap {
  phases: Phase[]
  totalEstimate: number
  timeline: string
  dependencies: Dependency[]
  risks: Risk[]
}

export interface Phase {
  id: string
  name: string
  description: string
  tasks: Task[]
  estimatedHours: number
  dependencies: string[]
  milestone: Milestone
}

export interface Task {
  id: string
  name: string
  description: string
  estimatedHours: number
  priority: Priority
  category: string
  dependencies: string[]
  assignee?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
}

export interface Milestone {
  name: string
  description: string
  dueDate: Date
  deliverables: string[]
  successCriteria: string[]
}

export interface Dependency {
  from: string
  to: string
  type: 'blocks' | 'enables' | 'influences'
  description: string
}

export interface Risk {
  id: string
  description: string
  probability: number // 1-10
  impact: number // 1-10
  mitigation: string
  category: string
}

// ============================================================================
// FINANCIAL MODELING
// ============================================================================

export interface FinancialModel {
  costs: CostBreakdown
  revenue: RevenueProjection
  metrics: BusinessMetrics
  scenarios: Scenario[]
}

export interface CostBreakdown {
  infrastructure: InfraCost[]
  team: TeamCost[]
  tools: ToolCost[]
  marketing: MarketingCost[]
  total: number
  monthly: number
  yearly: number
}

export interface InfraCost {
  service: string
  category: 'hosting' | 'database' | 'cdn' | 'storage' | 'ai' | 'monitoring'
  cost: number
  scaling: ScalingCost[]
  description: string
}

export interface TeamCost {
  role: string
  salary: number
  equity?: number
  benefits: number
  timeline: string
}

export interface ToolCost {
  name: string
  category: string
  cost: number
  interval: 'monthly' | 'yearly' | 'one-time'
  users: number
}

export interface MarketingCost {
  channel: string
  budget: number
  expectedReturn: number
  timeline: string
}

export interface ScalingCost {
  users: number
  cost: number
  description: string
}

export interface RevenueProjection {
  model: string
  projections: MonthlyProjection[]
  assumptions: string[]
  scenarios: RevenueScenario[]
}

export interface MonthlyProjection {
  month: number
  users: number
  revenue: number
  churn?: number
  growth?: number
}

export interface RevenueScenario {
  name: string
  probability: number
  revenue: number
  description: string
}

export interface BusinessMetrics {
  cac: number // Customer Acquisition Cost
  ltv: number // Lifetime Value
  ltvCacRatio: number
  burnRate: number
  runway: number // months
  breakeven: number // months
  roi: number
}

export interface Scenario {
  name: string
  description: string
  assumptions: string[]
  costs: CostBreakdown
  revenue: RevenueProjection
  probability: number
}

// ============================================================================
// AI SERVICE INTERFACES
// ============================================================================

export interface AIServiceResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    tokens: number
    cost: number
    latency: number
  }
  metadata?: {
    model: string
    provider: string
    timestamp: Date
  }
}

export interface CodingPrompt {
  id: string
  title: string
  description: string
  prompt: string
  context: string[]
  expectedOutput: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
}

export interface LaunchResult {
  success: boolean
  url?: string
  error?: string
  projectId: string
}

export interface AgentPreferences {
  provider: 'cursor' | 'github-copilot' | 'codeium' | 'custom'
  model: string
  temperature: number
  maxTokens: number
  customInstructions?: string
}

export interface AgentConfig {
  apiKey?: string
  endpoint?: string
  model: string
  settings: Record<string, any>
}

export interface ExportResult {
  success: boolean
  url?: string
  format: ExportFormat
  size: number
  error?: string
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface ErrorContext {
  userId?: string
  projectId?: string
  action: string
  timestamp: Date
  userAgent?: string
  ip?: string
}

export interface ErrorRecovery {
  strategy: RecoveryStrategy
  fallbackOptions: FallbackOption[]
  retryConfig: RetryConfig
  userMessage: string
}

export interface FallbackOption {
  name: string
  description: string
  action: () => Promise<void>
}

export interface RetryConfig {
  maxRetries: number
  backoffMs: number
  exponential: boolean
}

export interface AIServiceError extends Error {
  provider: string
  model: string
  code: string
  retryable: boolean
}

export interface ValidationError extends Error {
  field: string
  value: any
  constraint: string
}

export interface SystemError extends Error {
  component: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  recoverable: boolean
}

// ============================================================================
// ANALYTICS AND TRACKING
// ============================================================================

export interface AnalyticsEvent {
  id: string
  userId?: string
  projectId?: string
  eventType: string
  eventData?: Record<string, any>
  duration?: number
  success: boolean
  errorCode?: string
  createdAt: Date
}

export interface UsageMetrics {
  totalUsers: number
  activeUsers: number
  projectsGenerated: number
  averageGenerationTime: number
  successRate: number
  topFeatures: string[]
}

// ============================================================================
// TEMPLATE SYSTEM
// ============================================================================

export interface Template {
  id: string
  name: string
  description?: string
  category: string
  templateData: TemplateData
  usageCount: number
  rating?: number
  createdAt: Date
  updatedAt: Date
}

export interface TemplateData {
  productPlan: Partial<ProductPlan>
  techStack: Partial<TechStack>
  aiWorkflow: Partial<AIWorkflow>
  roadmap: Partial<Roadmap>
  financialModel: Partial<FinancialModel>
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================================================
// FORM AND UI TYPES
// ============================================================================

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'date'
  required: boolean
  placeholder?: string
  options?: { label: string; value: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
}

export interface FlowDiagram {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  viewport: {
    x: number
    y: number
    zoom: number
  }
}

export interface FlowEditor {
  diagram: FlowDiagram
  selectedNodes: string[]
  selectedEdges: string[]
  mode: 'view' | 'edit'
}

// ============================================================================
// GENERATION JOB TYPES
// ============================================================================

export interface GenerationJob {
  id: string
  userId: string
  projectId: string
  jobType: string
  status: JobStatus
  priority: number
  inputData: Record<string, any>
  outputData?: Record<string, any>
  progress: number
  currentStep?: string
  errorMessage?: string
  retryCount: number
  maxRetries: number
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
}

export interface JobProgress {
  jobId: string
  progress: number
  currentStep: string
  estimatedTimeRemaining?: number
  message?: string
}

// ============================================================================
// PITCH DECK TYPES
// ============================================================================

export interface PitchDeck {
  id: string
  title: string
  slides: PitchSlide[]
  theme: string
  createdAt: Date
}

export interface PitchSlide {
  id: string
  type: 'title' | 'problem' | 'solution' | 'market' | 'business-model' | 'traction' | 'financials' | 'team' | 'ask'
  title: string
  content: SlideContent
  order: number
}

export interface SlideContent {
  text?: string
  bullets?: string[]
  chart?: ChartData
  image?: string
  table?: TableData
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area'
  data: any[]
  labels: string[]
  title: string
}

export interface TableData {
  headers: string[]
  rows: string[][]
}

// ============================================================================
// ADDITIONAL INTERFACES FOR COMPREHENSIVE COVERAGE
// ============================================================================

/**
 * Enhanced interfaces for comprehensive blueprint generation
 */
export interface EnhancedIdeaInput extends IdeaInput {
  businessModel?: string
  targetMarket?: string
  competitiveAdvantage?: string
  technicalRequirements?: string[]
  budgetRange?: {
    min: number
    max: number
    currency: string
  }
  timelinePreference?: {
    mvp: string
    fullLaunch: string
    milestones: string[]
  }
}

export interface DetailedProcessedIdea extends ProcessedIdea {
  marketAnalysis?: {
    size: number
    growth: number
    trends: string[]
    opportunities: string[]
  }
  technicalComplexity?: {
    score: number
    factors: string[]
    recommendations: string[]
  }
  businessViability?: {
    score: number
    strengths: string[]
    challenges: string[]
  }
}

/**
 * Enhanced product planning interfaces
 */
export interface ComprehensiveProductPlan extends ProductPlan {
  marketValidation?: {
    surveys: SurveyResult[]
    interviews: InterviewResult[]
    competitorAnalysis: DetailedCompetitorAnalysis
  }
  userPersonas?: UserPersona[]
  valueProposition?: ValueProposition
  businessModelCanvas?: BusinessModelCanvas
}

export interface SurveyResult {
  question: string
  responses: {
    answer: string
    count: number
    percentage: number
  }[]
  insights: string[]
}

export interface InterviewResult {
  persona: string
  painPoints: string[]
  solutions: string[]
  willingness_to_pay: number
  feedback: string
}

export interface DetailedCompetitorAnalysis extends CompetitorAnalysis {
  swotAnalysis?: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
  }
  marketPositioning?: {
    competitor: string
    position: string
    differentiation: string[]
  }[]
}

export interface UserPersona {
  name: string
  demographics: {
    age: string
    gender: string
    location: string
    income: string
    education: string
  }
  psychographics: {
    interests: string[]
    values: string[]
    lifestyle: string
  }
  painPoints: string[]
  goals: string[]
  behaviors: {
    online: string[]
    purchasing: string[]
    communication: string[]
  }
  preferredChannels: string[]
}

export interface ValueProposition {
  headline: string
  subheadline: string
  benefits: string[]
  features: string[]
  proof: string[]
  targetSegment: string
}

export interface BusinessModelCanvas {
  keyPartners: string[]
  keyActivities: string[]
  keyResources: string[]
  valuePropositions: string[]
  customerRelationships: string[]
  channels: string[]
  customerSegments: string[]
  costStructure: CostStructureItem[]
  revenueStreams: RevenueStreamItem[]
}

export interface CostStructureItem {
  category: string
  description: string
  amount: number
  type: 'fixed' | 'variable'
}

export interface RevenueStreamItem {
  name: string
  description: string
  model: string
  pricing: number
  volume: number
  frequency: string
}

/**
 * Enhanced technical architecture interfaces
 */
export interface ComprehensiveTechStack extends TechStack {
  architecture?: {
    pattern: string
    description: string
    benefits: string[]
    tradeoffs: string[]
  }
  integrations?: Integration[]
  apiDesign?: APIDesign
  dataFlow?: DataFlowDiagram
  scalingStrategy?: ScalingStrategy
}

export interface Integration {
  name: string
  type: 'api' | 'webhook' | 'sdk' | 'plugin'
  purpose: string
  complexity: 'low' | 'medium' | 'high'
  cost: number
  documentation: string
  alternatives: string[]
}

export interface APIDesign {
  style: 'REST' | 'GraphQL' | 'gRPC' | 'WebSocket'
  authentication: string[]
  rateLimit: {
    requests: number
    window: string
  }
  versioning: string
  documentation: string
  endpoints: APIEndpoint[]
}

export interface APIEndpoint {
  path: string
  method: string
  description: string
  parameters: APIParameter[]
  responses: APIResponse[]
  authentication: boolean
}

export interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
  example: any
}

export interface APIResponse {
  status: number
  description: string
  schema: any
  example: any
}

export interface DataFlowDiagram {
  nodes: DataFlowNode[]
  connections: DataFlowConnection[]
  description: string
}

export interface DataFlowNode {
  id: string
  type: 'source' | 'process' | 'store' | 'sink'
  name: string
  description: string
}

export interface DataFlowConnection {
  from: string
  to: string
  data: string
  description: string
}

export interface ScalingStrategy {
  horizontal: {
    enabled: boolean
    triggers: string[]
    limits: {
      min: number
      max: number
    }
  }
  vertical: {
    enabled: boolean
    triggers: string[]
    limits: {
      cpu: string
      memory: string
    }
  }
  database: {
    sharding: boolean
    replication: boolean
    caching: string[]
  }
  cdn: {
    enabled: boolean
    regions: string[]
    caching: string[]
  }
}

/**
 * Enhanced AI workflow interfaces
 */
export interface ComprehensiveAIWorkflow extends AIWorkflow {
  orchestration?: {
    type: 'sequential' | 'parallel' | 'conditional'
    errorHandling: string
    retryPolicy: RetryPolicy
  }
  monitoring?: {
    metrics: string[]
    alerts: AlertRule[]
    logging: LoggingConfig
  }
  optimization?: {
    caching: boolean
    batching: boolean
    streaming: boolean
  }
}

export interface RetryPolicy {
  maxAttempts: number
  backoffStrategy: 'linear' | 'exponential' | 'fixed'
  baseDelay: number
  maxDelay: number
  retryableErrors: string[]
}

export interface AlertRule {
  name: string
  condition: string
  threshold: number
  action: string
  recipients: string[]
}

export interface LoggingConfig {
  level: 'debug' | 'info' | 'warn' | 'error'
  format: 'json' | 'text'
  destinations: string[]
  retention: string
}

/**
 * Enhanced development roadmap interfaces
 */
export interface ComprehensiveRoadmap extends Roadmap {
  methodology?: {
    framework: 'agile' | 'waterfall' | 'lean' | 'kanban'
    sprintLength: number
    ceremonies: string[]
  }
  resourcePlanning?: {
    team: TeamMember[]
    tools: DevelopmentTool[]
    infrastructure: InfrastructureRequirement[]
  }
  qualityAssurance?: {
    testingStrategy: TestingStrategy
    codeQuality: CodeQualityStandards
    deployment: DeploymentStrategy
  }
}

export interface TeamMember {
  role: string
  skills: string[]
  experience: 'junior' | 'mid' | 'senior'
  allocation: number // percentage
  cost: number
  startDate: Date
}

export interface DevelopmentTool {
  name: string
  category: string
  purpose: string
  cost: number
  licenses: number
  alternatives: string[]
}

export interface InfrastructureRequirement {
  component: string
  specifications: string
  cost: number
  scalability: string
  alternatives: string[]
}

export interface TestingStrategy {
  unit: {
    coverage: number
    framework: string
    automation: boolean
  }
  integration: {
    coverage: number
    framework: string
    automation: boolean
  }
  e2e: {
    coverage: number
    framework: string
    automation: boolean
  }
  performance: {
    tools: string[]
    metrics: string[]
    thresholds: Record<string, number>
  }
}

export interface CodeQualityStandards {
  linting: {
    rules: string
    enforcement: 'warning' | 'error'
  }
  formatting: {
    style: string
    automation: boolean
  }
  documentation: {
    coverage: number
    standards: string[]
  }
  security: {
    scanning: boolean
    tools: string[]
    policies: string[]
  }
}

export interface DeploymentStrategy {
  environments: Environment[]
  pipeline: DeploymentPipeline
  rollback: RollbackStrategy
}

export interface Environment {
  name: string
  purpose: string
  configuration: Record<string, any>
  resources: string[]
}

export interface DeploymentPipeline {
  stages: PipelineStage[]
  triggers: string[]
  approvals: ApprovalProcess[]
}

export interface PipelineStage {
  name: string
  tasks: string[]
  conditions: string[]
  timeout: number
}

export interface ApprovalProcess {
  stage: string
  approvers: string[]
  required: number
  timeout: number
}

export interface RollbackStrategy {
  automatic: boolean
  triggers: string[]
  process: string[]
  testing: string[]
}

/**
 * Enhanced financial modeling interfaces
 */
export interface ComprehensiveFinancialModel extends FinancialModel {
  assumptions?: FinancialAssumptions
  sensitivity?: SensitivityAnalysis
  valuation?: BusinessValuation
  funding?: FundingStrategy
}

export interface FinancialAssumptions {
  market: {
    size: number
    growth: number
    penetration: number
  }
  pricing: {
    strategy: string
    elasticity: number
    increases: number[]
  }
  costs: {
    inflation: number
    optimization: number
    scaling: number
  }
  operations: {
    efficiency: number
    automation: number
    outsourcing: number
  }
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[]
  scenarios: SensitivityScenario[]
  results: SensitivityResult[]
}

export interface SensitivityVariable {
  name: string
  baseValue: number
  range: {
    min: number
    max: number
    step: number
  }
  impact: string
}

export interface SensitivityScenario {
  name: string
  variables: Record<string, number>
  probability: number
}

export interface SensitivityResult {
  scenario: string
  metrics: Record<string, number>
  variance: Record<string, number>
}

export interface BusinessValuation {
  methods: ValuationMethod[]
  multiples: ValuationMultiple[]
  dcf: DCFAnalysis
  comparables: ComparableAnalysis
}

export interface ValuationMethod {
  name: string
  value: number
  confidence: number
  assumptions: string[]
}

export interface ValuationMultiple {
  metric: string
  multiple: number
  value: number
  comparables: string[]
}

export interface DCFAnalysis {
  projectionYears: number
  terminalGrowth: number
  discountRate: number
  cashFlows: number[]
  terminalValue: number
  presentValue: number
}

export interface ComparableAnalysis {
  companies: ComparableCompany[]
  metrics: string[]
  adjustments: string[]
  valuation: number
}

export interface ComparableCompany {
  name: string
  metrics: Record<string, number>
  adjustments: Record<string, number>
  weight: number
}

export interface FundingStrategy {
  stages: FundingStage[]
  sources: FundingSource[]
  timeline: FundingTimeline
  terms: FundingTerms
}

export interface FundingStage {
  name: string
  amount: number
  purpose: string[]
  milestones: string[]
  timeline: string
}

export interface FundingSource {
  type: string
  amount: number
  probability: number
  requirements: string[]
  timeline: string
}

export interface FundingTimeline {
  preparation: string
  fundraising: string
  closing: string
  milestones: FundingMilestone[]
}

export interface FundingMilestone {
  name: string
  date: Date
  requirements: string[]
  deliverables: string[]
}

export interface FundingTerms {
  valuation: {
    pre: number
    post: number
  }
  equity: number
  liquidation: string
  board: string[]
  voting: string[]
  antiDilution: string
}

// ============================================================================
// RE-EXPORTS FROM OTHER TYPE FILES
// ============================================================================

// Export all types from services
// export * from './services' // Temporarily disabled

// Export all types from errors
// export * from './errors' // Temporarily disabled

// Export validation schemas and functions
// export * from './validation' // Temporarily disabled due to duplicate exports

// Export AI service types
// export * from './ai-services' // Temporarily disabled

// Export utility types
// export * from './utils' // Temporarily disabled