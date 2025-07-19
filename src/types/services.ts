// Service Interfaces for Desenyon: InfiniteIdea
// This file contains interfaces for core business logic services

import {
  ProcessedIdea,
  IdeaInput,
  ValidationResult,
  IdeaCategory,
  ComplexityLevel,
  Blueprint,
  ProductPlan,
  TechStack,
  AIWorkflow,
  Roadmap,
  FinancialModel,
  TechRequirements,
  CodingPrompt,
  LaunchResult,
  AgentPreferences,
  AgentConfig,
  ExportResult,
  ExportFormat,
  Project,
  FlowDiagram,
  FlowEditor,
  WorkflowModule,
  CostBreakdown,
  RevenueProjection,
  BusinessMetrics,
  PitchDeck,
  PricingTier,
  MonthlyProjection,
  FundingMilestone,
  ValidationIssue
} from './index'

// ============================================================================
// CORE SERVICE INTERFACES
// ============================================================================

/**
 * Service for processing and analyzing raw idea inputs
 */
export interface IdeaProcessor {
  /**
   * Process a raw idea input into a structured format
   */
  processIdea(input: IdeaInput): Promise<ProcessedIdea>
  
  /**
   * Validate idea input for completeness and quality
   */
  validateInput(input: string): ValidationResult
  
  /**
   * Extract key features and keywords from idea description
   */
  extractKeywords(input: string): string[]
  
  /**
   * Categorize the idea into predefined categories
   */
  categorizeIdea(input: string): IdeaCategory
  
  /**
   * Assess the complexity level of the idea
   */
  assessComplexity(idea: ProcessedIdea): ComplexityLevel
  
  /**
   * Generate suggestions to improve idea clarity
   */
  generateSuggestions(input: string): string[]
}

/**
 * Main service for generating complete blueprints
 */
export interface BlueprintGenerator {
  /**
   * Generate a complete blueprint from a processed idea
   */
  generateBlueprint(idea: ProcessedIdea): Promise<Blueprint>
  
  /**
   * Generate product plan section
   */
  generateProductPlan(idea: ProcessedIdea): Promise<ProductPlan>
  
  /**
   * Generate technical stack recommendations
   */
  generateTechStack(requirements: TechRequirements): Promise<TechStack>
  
  /**
   * Generate AI workflow visualization
   */
  generateWorkflow(features: string[]): Promise<AIWorkflow>
  
  /**
   * Generate development roadmap
   */
  generateRoadmap(plan: ProductPlan, techStack: TechStack): Promise<Roadmap>
  
  /**
   * Generate financial model and projections
   */
  generateFinancialModel(plan: ProductPlan, techStack: TechStack): Promise<FinancialModel>
  
  /**
   * Regenerate a specific section of the blueprint
   */
  regenerateSection(blueprint: Blueprint, section: BlueprintSection, feedback?: string): Promise<Blueprint>
}

/**
 * Service for financial modeling and analysis
 */
export interface FinancialModeler {
  /**
   * Calculate comprehensive cost breakdown
   */
  calculateCosts(techStack: TechStack, scale: ScaleEstimate): Promise<CostBreakdown>
  
  /**
   * Project revenue based on monetization strategy
   */
  projectRevenue(monetization: any): Promise<RevenueProjection>
  
  /**
   * Calculate key business metrics
   */
  calculateMetrics(costs: CostBreakdown, revenue: RevenueProjection): Promise<BusinessMetrics>
  
  /**
   * Generate investor pitch deck
   */
  generatePitchDeck(plan: ProductPlan, financials: BusinessMetrics): Promise<PitchDeck>
  
  /**
   * Optimize costs based on constraints
   */
  optimizeCosts(costs: CostBreakdown, constraints: CostConstraints): Promise<CostBreakdown>
  
  /**
   * Compare different financial scenarios
   */
  compareScenarios(scenarios: FinancialScenario[]): Promise<ScenarioComparison>
}

/**
 * Service for AI workflow visualization and management
 */
export interface WorkflowVisualizer {
  /**
   * Create visual flow diagram from workflow data
   */
  createFlowDiagram(workflow: AIWorkflow): Promise<FlowDiagram>
  
  /**
   * Generate workflow modules based on features
   */
  generateModules(features: string[]): Promise<WorkflowModule[]>
  
  /**
   * Create interactive workflow editor
   */
  createCustomEditor(diagram: FlowDiagram): Promise<FlowEditor>
  
  /**
   * Validate workflow structure and connections
   */
  validateWorkflow(workflow: AIWorkflow): ValidationResult
  
  /**
   * Optimize workflow for performance
   */
  optimizeWorkflow(workflow: AIWorkflow): Promise<AIWorkflow>
  
  /**
   * Export workflow in various formats
   */
  exportWorkflow(workflow: AIWorkflow, format: WorkflowExportFormat): Promise<ExportResult>
}

/**
 * Service for AI coding tool integration
 */
export interface CodingIntegration {
  /**
   * Generate optimized coding prompts from blueprint
   */
  generatePrompts(blueprint: Blueprint): Promise<CodingPrompt[]>
  
  /**
   * Launch Cursor.dev with project context
   */
  launchCursor(project: Project): Promise<LaunchResult>
  
  /**
   * Configure AI coding agent preferences
   */
  configureAIAgent(preferences: AgentPreferences): Promise<AgentConfig>
  
  /**
   * Export project for coding environments
   */
  exportProject(blueprint: Blueprint, format: ExportFormat): Promise<ExportResult>
  
  /**
   * Generate project structure and boilerplate
   */
  generateProjectStructure(blueprint: Blueprint): Promise<ProjectStructure>
  
  /**
   * Create setup instructions for development
   */
  createSetupInstructions(blueprint: Blueprint): Promise<SetupInstructions>
}

// ============================================================================
// SUPPORTING TYPES FOR SERVICES
// ============================================================================

export type BlueprintSection = 'productPlan' | 'techStack' | 'aiWorkflow' | 'roadmap' | 'financialModel'

export interface ScaleEstimate {
  expectedUsers: number
  timeframe: string
  growthRate: number
  peakLoad: number
}

export interface CostConstraints {
  maxBudget: number
  timeframe: string
  priorities: string[]
  mustHave: string[]
  niceToHave: string[]
}

export interface FinancialScenario {
  name: string
  description: string
  assumptions: Record<string, any>
  probability: number
}

export interface ScenarioComparison {
  scenarios: FinancialScenario[]
  recommendation: string
  risks: string[]
  opportunities: string[]
  keyMetrics: Record<string, number[]>
}

export interface WorkflowExportFormat {
  type: 'json' | 'yaml' | 'mermaid' | 'svg' | 'png'
  includeMetadata: boolean
  compressed: boolean
}

export interface ProjectStructure {
  directories: DirectoryStructure[]
  files: FileTemplate[]
  dependencies: Dependency[]
  scripts: BuildScript[]
  configuration: ProjectConfig
}

export interface DirectoryStructure {
  path: string
  description: string
  files?: string[]
  purpose: string
}

export interface FileTemplate {
  path: string
  content: string
  description: string
  editable: boolean
  template: boolean
}

export interface Dependency {
  name: string
  version: string
  type: 'production' | 'development' | 'peer'
  description: string
  optional: boolean
}

export interface BuildScript {
  name: string
  command: string
  description: string
  environment?: string
}

export interface ProjectConfig {
  name: string
  version: string
  description: string
  author: string
  license: string
  repository?: string
  homepage?: string
  keywords: string[]
}

export interface SetupInstructions {
  prerequisites: Prerequisite[]
  steps: SetupStep[]
  verification: VerificationStep[]
  troubleshooting: TroubleshootingGuide[]
  nextSteps: string[]
}

export interface Prerequisite {
  name: string
  version?: string
  description: string
  installUrl?: string
  checkCommand?: string
}

export interface SetupStep {
  order: number
  title: string
  description: string
  commands?: string[]
  files?: string[]
  verification?: string
  notes?: string[]
}

export interface VerificationStep {
  name: string
  command: string
  expectedOutput?: string
  description: string
}

export interface TroubleshootingGuide {
  issue: string
  symptoms: string[]
  causes: string[]
  solutions: Solution[]
  prevention?: string[]
}

export interface Solution {
  description: string
  steps: string[]
  commands?: string[]
  notes?: string[]
}

// ============================================================================
// ERROR HANDLING INTERFACES
// ============================================================================

export interface ServiceError extends Error {
  service: string
  operation: string
  code: string
  retryable: boolean
  context?: Record<string, any>
}

export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: ServiceError
  warnings?: string[]
  metadata?: {
    duration: number
    timestamp: Date
    version: string
  }
}

// ============================================================================
// CACHING AND PERFORMANCE INTERFACES
// ============================================================================

export interface CacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(pattern?: string): Promise<void>
  exists(key: string): Promise<boolean>
}

export interface PerformanceMetrics {
  operationName: string
  duration: number
  memoryUsage: number
  cpuUsage: number
  cacheHits: number
  cacheMisses: number
  errors: number
  timestamp: Date
}

export interface PerformanceMonitor {
  startOperation(name: string): string
  endOperation(operationId: string): PerformanceMetrics
  recordMetric(metric: PerformanceMetrics): void
  getMetrics(timeRange?: TimeRange): PerformanceMetrics[]
}

export interface TimeRange {
  start: Date
  end: Date
}

// ============================================================================
// QUEUE AND JOB PROCESSING INTERFACES
// ============================================================================

export interface JobQueue {
  add<T>(jobType: string, data: T, options?: JobOptions): Promise<string>
  process<T>(jobType: string, processor: JobProcessor<T>): void
  getJob(jobId: string): Promise<Job | null>
  removeJob(jobId: string): Promise<void>
  getWaiting(): Promise<Job[]>
  getActive(): Promise<Job[]>
  getCompleted(): Promise<Job[]>
  getFailed(): Promise<Job[]>
}

export interface JobOptions {
  priority?: number
  delay?: number
  attempts?: number
  backoff?: BackoffOptions
  removeOnComplete?: number
  removeOnFail?: number
}

export interface BackoffOptions {
  type: 'fixed' | 'exponential'
  delay: number
}

export interface Job<T = any> {
  id: string
  type: string
  data: T
  opts: JobOptions
  progress: number
  returnvalue?: any
  failedReason?: string
  processedOn?: Date
  finishedOn?: Date
  timestamp: Date
}

export interface JobProcessor<T> {
  (job: Job<T>): Promise<any>
}

// ============================================================================
// NOTIFICATION AND COMMUNICATION INTERFACES
// ============================================================================

export interface NotificationService {
  sendEmail(to: string, subject: string, content: string, template?: string): Promise<void>
  sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void>
  sendWebhook(url: string, payload: any, headers?: Record<string, string>): Promise<void>
  createNotification(userId: string, type: string, content: any): Promise<void>
  markAsRead(notificationId: string): Promise<void>
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  content: string
  data?: any
  read: boolean
  createdAt: Date
  readAt?: Date
}

// ============================================================================
// ANALYTICS AND TRACKING INTERFACES
// ============================================================================

export interface AnalyticsService {
  track(event: AnalyticsEvent): Promise<void>
  identify(userId: string, traits: Record<string, any>): Promise<void>
  page(userId: string, page: string, properties?: Record<string, any>): Promise<void>
  group(userId: string, groupId: string, traits?: Record<string, any>): Promise<void>
  alias(userId: string, previousId: string): Promise<void>
  getEvents(filters: EventFilters): Promise<AnalyticsEvent[]>
  getMetrics(metric: string, timeRange: TimeRange): Promise<MetricData[]>
}

export interface AnalyticsEvent {
  userId?: string
  event: string
  properties?: Record<string, any>
  timestamp?: Date
  context?: {
    ip?: string
    userAgent?: string
    page?: {
      path: string
      referrer?: string
      title?: string
    }
  }
}

export interface EventFilters {
  userId?: string
  event?: string
  timeRange?: TimeRange
  properties?: Record<string, any>
  limit?: number
  offset?: number
}

export interface MetricData {
  timestamp: Date
  value: number
  dimensions?: Record<string, string>
}

// ============================================================================
// ENHANCED SERVICE INTERFACES FOR COMPREHENSIVE COVERAGE
// ============================================================================

/**
 * Enhanced idea processing with advanced analysis capabilities
 */
export interface EnhancedIdeaProcessor extends IdeaProcessor {
  analyzeMarketPotential(idea: ProcessedIdea): Promise<MarketAnalysis>
  assessTechnicalFeasibility(idea: ProcessedIdea): Promise<TechnicalFeasibility>
  evaluateBusinessViability(idea: ProcessedIdea): Promise<BusinessViability>
  generateImprovementSuggestions(idea: ProcessedIdea): Promise<ImprovementSuggestion[]>
  compareWithExistingIdeas(idea: ProcessedIdea, existingIdeas: ProcessedIdea[]): Promise<IdeaComparison>
}

export interface MarketAnalysis {
  marketSize: {
    tam: number
    sam: number
    som: number
  }
  competitiveLandscape: {
    directCompetitors: number
    indirectCompetitors: number
    marketSaturation: 'low' | 'medium' | 'high'
  }
  trends: {
    growing: string[]
    declining: string[]
    emerging: string[]
  }
  opportunities: {
    gaps: string[]
    underservedSegments: string[]
    emergingNeeds: string[]
  }
  threats: {
    barriers: string[]
    regulations: string[]
    disruptions: string[]
  }
  score: number
}

export interface TechnicalFeasibility {
  complexity: {
    overall: 'low' | 'medium' | 'high' | 'very_high'
    frontend: number
    backend: number
    database: number
    integrations: number
  }
  resources: {
    teamSize: number
    skillsRequired: string[]
    timeEstimate: string
    budgetEstimate: number
  }
  risks: {
    technical: string[]
    scalability: string[]
    security: string[]
    performance: string[]
  }
  recommendations: {
    architecture: string[]
    technologies: string[]
    approaches: string[]
  }
  score: number
}

export interface BusinessViability {
  revenue: {
    potential: number
    timeToRevenue: string
    scalability: 'low' | 'medium' | 'high'
  }
  costs: {
    development: number
    operations: number
    marketing: number
    total: number
  }
  metrics: {
    roi: number
    paybackPeriod: string
    breakeven: string
  }
  risks: {
    market: string[]
    financial: string[]
    operational: string[]
  }
  score: number
}

export interface ImprovementSuggestion {
  category: 'market' | 'technical' | 'business' | 'user_experience'
  priority: 'low' | 'medium' | 'high' | 'critical'
  suggestion: string
  rationale: string
  impact: string
  effort: 'low' | 'medium' | 'high'
  examples?: string[]
}

export interface IdeaComparison {
  similarities: string[]
  differences: string[]
  uniqueAspects: string[]
  competitiveAdvantages: string[]
  recommendations: string[]
  score: number
}

/**
 * Advanced blueprint generation with comprehensive analysis
 */
export interface ComprehensiveBlueprintGenerator extends BlueprintGenerator {
  generateWithMarketResearch(idea: ProcessedIdea, marketData: MarketResearchData): Promise<Blueprint>
  generateWithUserFeedback(idea: ProcessedIdea, feedback: UserFeedback[]): Promise<Blueprint>
  generateMultipleVariants(idea: ProcessedIdea, variants: VariantRequest[]): Promise<BlueprintVariant[]>
  optimizeForConstraints(blueprint: Blueprint, constraints: BusinessConstraints): Promise<Blueprint>
  validateAgainstBestPractices(blueprint: Blueprint): Promise<BestPracticesValidation>
}

export interface MarketResearchData {
  surveys: SurveyData[]
  interviews: InterviewData[]
  competitorAnalysis: CompetitorData[]
  industryReports: IndustryReport[]
  trends: TrendData[]
}

export interface SurveyData {
  title: string
  responses: number
  demographics: Record<string, any>
  findings: SurveyFinding[]
  insights: string[]
}

export interface SurveyFinding {
  question: string
  responses: {
    option: string
    count: number
    percentage: number
  }[]
  significance: 'low' | 'medium' | 'high'
}

export interface InterviewData {
  participant: {
    role: string
    experience: string
    industry: string
  }
  painPoints: string[]
  solutions: string[]
  preferences: Record<string, any>
  quotes: string[]
  insights: string[]
}

export interface CompetitorData {
  name: string
  category: 'direct' | 'indirect' | 'substitute'
  strengths: string[]
  weaknesses: string[]
  pricing: PricingInfo
  features: string[]
  marketShare: number
  userReviews: ReviewSummary
}

export interface PricingInfo {
  model: string
  tiers: PricingTier[]
  freeTrial: boolean
  customPricing: boolean
}

export interface ReviewSummary {
  averageRating: number
  totalReviews: number
  positiveAspects: string[]
  negativeAspects: string[]
  commonComplaints: string[]
}

export interface IndustryReport {
  title: string
  publisher: string
  date: Date
  keyFindings: string[]
  marketSize: number
  growthRate: number
  trends: string[]
  predictions: string[]
}

export interface TrendData {
  name: string
  category: string
  strength: 'weak' | 'moderate' | 'strong'
  direction: 'growing' | 'stable' | 'declining'
  timeframe: string
  impact: string[]
  relevance: number
}

export interface UserFeedback {
  userId?: string
  type: 'survey' | 'interview' | 'usability_test' | 'beta_feedback'
  rating: number
  comments: string
  suggestions: string[]
  painPoints: string[]
  positiveAspects: string[]
  timestamp: Date
}

export interface VariantRequest {
  name: string
  focus: 'cost_optimized' | 'feature_rich' | 'time_to_market' | 'scalability'
  constraints: Record<string, any>
  preferences: Record<string, any>
}

export interface BlueprintVariant {
  name: string
  blueprint: Blueprint
  tradeoffs: string[]
  benefits: string[]
  suitability: string
  score: number
}

export interface BusinessConstraints {
  budget: {
    development: number
    operations: number
    marketing: number
  }
  timeline: {
    mvp: Date
    beta: Date
    launch: Date
  }
  resources: {
    teamSize: number
    skills: string[]
    availability: string
  }
  compliance: string[]
  integrations: string[]
}

export interface BestPracticesValidation {
  overall: {
    score: number
    grade: 'A' | 'B' | 'C' | 'D' | 'F'
    summary: string
  }
  categories: {
    architecture: ValidationCategory
    security: ValidationCategory
    performance: ValidationCategory
    usability: ValidationCategory
    maintainability: ValidationCategory
  }
  recommendations: BestPracticeRecommendation[]
}

export interface ValidationCategory {
  score: number
  issues: ValidationIssue[]
  strengths: string[]
  improvements: string[]
}

export interface BestPracticeRecommendation {
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  implementation: string[]
  resources: string[]
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

/**
 * Advanced financial modeling with comprehensive analysis
 */
export interface AdvancedFinancialModeler extends FinancialModeler {
  generateMultipleScenarios(plan: ProductPlan, techStack: TechStack): Promise<ScenarioAnalysis>
  performSensitivityAnalysis(model: FinancialModel, variables: string[]): Promise<SensitivityAnalysis>
  calculateValuation(model: FinancialModel, method: ValuationMethod): Promise<ValuationResult>
  optimizeForMetrics(model: FinancialModel, targetMetrics: TargetMetrics): Promise<OptimizedFinancialModel>
  generateInvestorReport(model: FinancialModel): Promise<InvestorReport>
}

export interface ScenarioAnalysis {
  baseCase: FinancialScenario
  optimistic: FinancialScenario
  pessimistic: FinancialScenario
  custom: FinancialScenario[]
  comparison: ScenarioComparison
  recommendations: string[]
}

export interface SensitivityAnalysis {
  variables: SensitivityVariable[]
  results: SensitivityResult[]
  insights: string[]
  recommendations: string[]
}

export interface SensitivityVariable {
  name: string
  baseValue: number
  range: {
    min: number
    max: number
  }
  impact: 'low' | 'medium' | 'high'
}

export interface SensitivityResult {
  variable: string
  change: number
  impact: {
    revenue: number
    costs: number
    profit: number
    valuation: number
  }
}

export interface ValuationMethod {
  name: 'dcf' | 'multiples' | 'risk_adjusted' | 'real_options'
  parameters: Record<string, any>
}

export interface ValuationResult {
  method: string
  value: number
  range: {
    low: number
    high: number
  }
  confidence: number
  assumptions: string[]
  sensitivity: Record<string, number>
}

export interface TargetMetrics {
  revenue: number
  profitability: number
  growth: number
  efficiency: Record<string, number>
}

export interface OptimizedFinancialModel extends FinancialModel {
  optimizations: Optimization[]
  tradeoffs: string[]
  achievability: number
}

export interface Optimization {
  category: 'revenue' | 'costs' | 'efficiency' | 'timing'
  description: string
  impact: number
  effort: 'low' | 'medium' | 'high'
  risk: 'low' | 'medium' | 'high'
}

export interface InvestorReport {
  executiveSummary: string
  marketOpportunity: MarketOpportunitySection
  businessModel: BusinessModelSection
  financialProjections: FinancialProjectionsSection
  riskAnalysis: RiskAnalysisSection
  fundingRequest: FundingRequestSection
  appendices: ReportAppendix[]
}

export interface MarketOpportunitySection {
  marketSize: string
  targetMarket: string
  competitiveLandscape: string
  marketTrends: string[]
  opportunity: string
}

export interface BusinessModelSection {
  valueProposition: string
  revenueModel: string
  customerSegments: string[]
  channels: string[]
  keyMetrics: Record<string, number>
}

export interface FinancialProjectionsSection {
  assumptions: string[]
  projections: MonthlyProjection[]
  keyMetrics: BusinessMetrics
  scenarios: ScenarioSummary[]
}

export interface ScenarioSummary {
  name: string
  probability: number
  keyMetrics: Record<string, number>
  description: string
}

export interface RiskAnalysisSection {
  risks: RiskAssessment[]
  mitigation: string[]
  contingencies: string[]
}

export interface RiskAssessment {
  category: string
  description: string
  probability: number
  impact: number
  mitigation: string
}

export interface FundingRequestSection {
  amount: number
  use: FundingUse[]
  timeline: string
  milestones: FundingMilestone[]
  terms: string[]
}

export interface FundingUse {
  category: string
  amount: number
  percentage: number
  description: string
}

export interface ReportAppendix {
  title: string
  content: string
  type: 'text' | 'table' | 'chart' | 'document'
}

// ============================================================================
// UTILITY SERVICE INTERFACES
// ============================================================================

export interface FileService {
  upload(file: File, path: string): Promise<string>
  download(path: string): Promise<Buffer>
  delete(path: string): Promise<void>
  exists(path: string): Promise<boolean>
  getUrl(path: string, expiresIn?: number): Promise<string>
  getMetadata(path: string): Promise<FileMetadata>
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: Date
  etag: string
}

export interface EmailService {
  send(options: EmailOptions): Promise<void>
  sendTemplate(templateId: string, to: string, variables: Record<string, any>): Promise<void>
  validateEmail(email: string): boolean
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
}

export interface EmailOptions {
  to: string | string[]
  from?: string
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  headers?: Record<string, string>
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  cid?: string
}

export interface DeliveryStatus {
  messageId: string
  status: 'sent' | 'delivered' | 'bounced' | 'complained' | 'rejected'
  timestamp: Date
  details?: string
}