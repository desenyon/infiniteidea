// AI Service Interfaces and Types for Desenyon: InfiniteIdea
// This file contains interfaces for AI service integration and orchestration

import { z } from 'zod'
import {
  ProcessedIdea,
  ProductPlan,
  TechStack,
  AIWorkflow,
  Roadmap,
  FinancialModel,
  CodingPrompt,
  Blueprint
} from './index'

// ============================================================================
// AI SERVICE PROVIDER INTERFACES
// ============================================================================

export interface AIServiceProvider {
  name: string
  models: string[]
  maxTokens: number
  supportsStreaming: boolean
  costPerToken: number
  rateLimits: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}

export interface OpenAIProvider extends AIServiceProvider {
  name: 'openai'
  apiKey: string
  organization?: string
  baseURL?: string
}

export interface AnthropicProvider extends AIServiceProvider {
  name: 'anthropic'
  apiKey: string
  baseURL?: string
}

export interface LocalProvider extends AIServiceProvider {
  name: 'local'
  endpoint: string
  model: string
}

export type AIProvider = OpenAIProvider | AnthropicProvider | LocalProvider

// ============================================================================
// AI REQUEST AND RESPONSE INTERFACES
// ============================================================================

export interface AIRequest {
  provider: string
  model: string
  prompt: string
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
  context?: string[]
  metadata?: Record<string, any>
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  rawResponse?: string
  error?: AIError
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost: number
  }
  metadata: {
    provider: string
    model: string
    latency: number
    timestamp: Date
    requestId: string
  }
}

export interface AIError {
  code: string
  message: string
  type: 'rate_limit' | 'invalid_request' | 'authentication' | 'server_error' | 'timeout'
  retryable: boolean
  retryAfter?: number
}

export interface StreamingResponse {
  chunk: string
  isComplete: boolean
  error?: AIError
}

// ============================================================================
// BLUEPRINT GENERATION INTERFACES
// ============================================================================

export interface BlueprintGenerationRequest {
  idea: ProcessedIdea
  preferences?: GenerationPreferences
  context?: GenerationContext
}

export interface GenerationPreferences {
  aiProvider?: 'openai' | 'anthropic' | 'auto'
  complexity?: 'simple' | 'detailed' | 'comprehensive'
  focus?: ('product' | 'technical' | 'financial' | 'workflow')[]
  industry?: string
  budget?: number
  timeline?: string
  teamSize?: number
}

export interface GenerationContext {
  userProfile?: {
    experience: 'beginner' | 'intermediate' | 'expert'
    background: string[]
    preferences: Record<string, any>
  }
  projectHistory?: {
    previousProjects: string[]
    successfulPatterns: string[]
    challenges: string[]
  }
  marketData?: {
    trends: string[]
    competitors: string[]
    opportunities: string[]
  }
}

export interface BlueprintGenerationResponse {
  blueprint: Blueprint
  confidence: number
  alternatives?: Partial<Blueprint>[]
  warnings: string[]
  recommendations: string[]
  generationMetadata: {
    totalTime: number
    stepsCompleted: string[]
    aiCallsUsed: number
    totalCost: number
  }
}

// ============================================================================
// SPECIALIZED GENERATION INTERFACES
// ============================================================================

export interface ProductPlanGenerator {
  generateProductPlan(idea: ProcessedIdea, context?: GenerationContext): Promise<AIResponse<ProductPlan>>
  refineProductPlan(plan: ProductPlan, feedback: string): Promise<AIResponse<ProductPlan>>
  validateProductPlan(plan: ProductPlan): Promise<ValidationResult>
}

export interface TechStackGenerator {
  generateTechStack(requirements: TechRequirements, context?: GenerationContext): Promise<AIResponse<TechStack>>
  optimizeTechStack(stack: TechStack, constraints: TechConstraints): Promise<AIResponse<TechStack>>
  compareTechStacks(stacks: TechStack[]): Promise<AIResponse<TechStackComparison>>
}

export interface WorkflowGenerator {
  generateAIWorkflow(features: string[], context?: GenerationContext): Promise<AIResponse<AIWorkflow>>
  optimizeWorkflow(workflow: AIWorkflow): Promise<AIResponse<AIWorkflow>>
  validateWorkflow(workflow: AIWorkflow): Promise<ValidationResult>
}

export interface RoadmapGenerator {
  generateRoadmap(plan: ProductPlan, techStack: TechStack, context?: GenerationContext): Promise<AIResponse<Roadmap>>
  optimizeRoadmap(roadmap: Roadmap, constraints: RoadmapConstraints): Promise<AIResponse<Roadmap>>
  updateRoadmap(roadmap: Roadmap, changes: RoadmapChange[]): Promise<AIResponse<Roadmap>>
}

export interface FinancialModelGenerator {
  generateFinancialModel(plan: ProductPlan, techStack: TechStack, context?: GenerationContext): Promise<AIResponse<FinancialModel>>
  updateFinancialModel(model: FinancialModel, assumptions: FinancialAssumption[]): Promise<AIResponse<FinancialModel>>
  compareScenarios(model: FinancialModel, scenarios: string[]): Promise<AIResponse<ScenarioComparison>>
}

// ============================================================================
// SUPPORTING TYPES FOR GENERATORS
// ============================================================================

export interface TechRequirements {
  features: string[]
  scalability: 'low' | 'medium' | 'high'
  budget: 'low' | 'medium' | 'high'
  timeline: 'fast' | 'medium' | 'flexible'
  teamExperience: 'junior' | 'mixed' | 'senior'
  compliance?: string[]
  integrations?: string[]
}

export interface TechConstraints {
  budget: number
  timeline: number
  teamSize: number
  existingTech?: string[]
  restrictions?: string[]
}

export interface TechStackComparison {
  stacks: TechStack[]
  comparison: {
    criteria: string
    scores: number[]
    reasoning: string
  }[]
  recommendation: number
  tradeoffs: string[]
}

export interface RoadmapConstraints {
  budget: number
  timeline: number
  teamSize: number
  priorities: string[]
  dependencies?: string[]
}

export interface RoadmapChange {
  type: 'add' | 'remove' | 'modify' | 'reorder'
  target: string
  details: Record<string, any>
}

export interface FinancialAssumption {
  category: 'revenue' | 'costs' | 'growth' | 'market'
  parameter: string
  value: number
  reasoning: string
}

export interface ScenarioComparison {
  scenarios: {
    name: string
    metrics: Record<string, number>
    probability: number
  }[]
  recommendation: string
  risks: string[]
  opportunities: string[]
}

export interface ValidationResult {
  isValid: boolean
  score: number
  issues: ValidationIssue[]
  suggestions: string[]
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
  field?: string
  suggestion?: string
}

// ============================================================================
// AI ORCHESTRATION INTERFACES
// ============================================================================

export interface AIOrchestrator {
  generateBlueprint(request: BlueprintGenerationRequest): Promise<BlueprintGenerationResponse>
  regenerateSection(blueprint: Blueprint, section: BlueprintSection, feedback?: string): Promise<AIResponse<any>>
  optimizeBlueprint(blueprint: Blueprint, criteria: OptimizationCriteria): Promise<AIResponse<Blueprint>>
  validateBlueprint(blueprint: Blueprint): Promise<ValidationResult>
}

export type BlueprintSection = 'productPlan' | 'techStack' | 'aiWorkflow' | 'roadmap' | 'financialModel'

export interface OptimizationCriteria {
  focus: 'cost' | 'time' | 'quality' | 'risk' | 'innovation'
  constraints: Record<string, any>
  priorities: string[]
}

// ============================================================================
// PROMPT ENGINEERING INTERFACES
// ============================================================================

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: PromptVariable[]
  examples?: PromptExample[]
  metadata: {
    category: string
    version: string
    author: string
    createdAt: Date
    updatedAt: Date
  }
}

export interface PromptVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  required: boolean
  description: string
  defaultValue?: any
  validation?: z.ZodSchema
}

export interface PromptExample {
  input: Record<string, any>
  expectedOutput: string
  description: string
}

export interface PromptBuilder {
  buildPrompt(templateId: string, variables: Record<string, any>): Promise<string>
  validatePrompt(prompt: string): Promise<ValidationResult>
  optimizePrompt(prompt: string, criteria: string[]): Promise<string>
  testPrompt(prompt: string, testCases: PromptTestCase[]): Promise<PromptTestResult[]>
}

export interface PromptTestCase {
  input: Record<string, any>
  expectedOutput?: string
  criteria: string[]
}

export interface PromptTestResult {
  testCase: PromptTestCase
  actualOutput: string
  score: number
  issues: string[]
  passed: boolean
}

// ============================================================================
// CODING INTEGRATION INTERFACES
// ============================================================================

export interface CodingPromptGenerator {
  generateCodingPrompts(blueprint: Blueprint): Promise<CodingPrompt[]>
  generatePromptForTask(task: string, context: CodingContext): Promise<CodingPrompt>
  optimizePromptForTool(prompt: CodingPrompt, tool: CodingTool): Promise<CodingPrompt>
}

export interface CodingContext {
  techStack: TechStack
  existingCode?: string[]
  projectStructure?: string
  conventions?: string[]
  requirements?: string[]
}

export interface CodingTool {
  name: string
  capabilities: string[]
  limitations: string[]
  promptFormat: 'standard' | 'structured' | 'conversational'
  maxContextLength: number
}

export interface CodingIntegrationService {
  launchCursor(project: Blueprint, preferences?: CodingPreferences): Promise<LaunchResult>
  exportForCoding(blueprint: Blueprint, format: CodingExportFormat): Promise<ExportResult>
  generateProjectStructure(blueprint: Blueprint): Promise<ProjectStructure>
  createSetupInstructions(blueprint: Blueprint): Promise<SetupInstructions>
}

export interface CodingPreferences {
  tool: 'cursor' | 'vscode' | 'github-copilot' | 'codeium'
  language: string
  framework?: string
  style?: 'functional' | 'oop' | 'mixed'
  testing?: 'unit' | 'integration' | 'e2e' | 'all'
}

export interface CodingExportFormat {
  type: 'zip' | 'git' | 'template'
  includePrompts: boolean
  includeDocumentation: boolean
  includeTests: boolean
}

export interface ProjectStructure {
  directories: DirectoryStructure[]
  files: FileTemplate[]
  dependencies: Dependency[]
  scripts: BuildScript[]
}

export interface DirectoryStructure {
  path: string
  description: string
  files?: string[]
}

export interface FileTemplate {
  path: string
  content: string
  description: string
  editable: boolean
}

export interface Dependency {
  name: string
  version: string
  type: 'production' | 'development'
  description: string
}

export interface BuildScript {
  name: string
  command: string
  description: string
}

export interface SetupInstructions {
  steps: SetupStep[]
  prerequisites: string[]
  troubleshooting: TroubleshootingGuide[]
}

export interface SetupStep {
  order: number
  title: string
  description: string
  commands?: string[]
  verification?: string
}

export interface TroubleshootingGuide {
  issue: string
  symptoms: string[]
  solutions: string[]
}

export interface LaunchResult {
  success: boolean
  url?: string
  projectId: string
  setupInstructions?: SetupInstructions
  error?: string
}

export interface ExportResult {
  success: boolean
  downloadUrl?: string
  format: string
  size: number
  expiresAt: Date
  error?: string
}

// ============================================================================
// VALIDATION SCHEMAS FOR AI SERVICES
// ============================================================================

export const AIRequestSchema = z.object({
  provider: z.string(),
  model: z.string(),
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().positive().optional(),
  stream: z.boolean().optional(),
  context: z.array(z.string()).optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

export const AIResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  rawResponse: z.string().optional(),
  error: z.object({
    code: z.string(),
    message: z.string(),
    type: z.enum(['rate_limit', 'invalid_request', 'authentication', 'server_error', 'timeout']),
    retryable: z.boolean(),
    retryAfter: z.number().optional()
  }).optional(),
  usage: z.object({
    promptTokens: z.number().nonnegative(),
    completionTokens: z.number().nonnegative(),
    totalTokens: z.number().nonnegative(),
    cost: z.number().nonnegative()
  }),
  metadata: z.object({
    provider: z.string(),
    model: z.string(),
    latency: z.number().nonnegative(),
    timestamp: z.date(),
    requestId: z.string()
  })
})

export const GenerationPreferencesSchema = z.object({
  aiProvider: z.enum(['openai', 'anthropic', 'auto']).optional(),
  complexity: z.enum(['simple', 'detailed', 'comprehensive']).optional(),
  focus: z.array(z.enum(['product', 'technical', 'financial', 'workflow'])).optional(),
  industry: z.string().optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().optional(),
  teamSize: z.number().positive().optional()
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
// ENHANCED AI SERVICE INTERFACES
// ============================================================================

/**
 * Advanced AI service configuration for complex workflows
 */
export interface AdvancedAIServiceConfig {
  providers: AIProvider[]
  loadBalancing: {
    strategy: 'round_robin' | 'least_latency' | 'cost_optimized' | 'quality_first'
    weights?: Record<string, number>
  }
  fallbackChain: string[]
  circuitBreaker: {
    enabled: boolean
    failureThreshold: number
    recoveryTimeout: number
  }
  caching: {
    enabled: boolean
    ttl: number
    keyStrategy: 'prompt_hash' | 'semantic_similarity'
  }
  monitoring: {
    metricsEnabled: boolean
    alertThresholds: {
      latency: number
      errorRate: number
      costPerHour: number
    }
  }
}

/**
 * Multi-modal AI service interface for handling different content types
 */
export interface MultiModalAIService {
  processText(request: TextProcessingRequest): Promise<AIResponse<string>>
  processImage(request: ImageProcessingRequest): Promise<AIResponse<ImageAnalysis>>
  processAudio(request: AudioProcessingRequest): Promise<AIResponse<AudioTranscription>>
  processVideo(request: VideoProcessingRequest): Promise<AIResponse<VideoAnalysis>>
  processDocument(request: DocumentProcessingRequest): Promise<AIResponse<DocumentAnalysis>>
}

export interface TextProcessingRequest extends AIRequest {
  contentType: 'plain' | 'markdown' | 'html' | 'code'
  language?: string
  domain?: string
}

export interface ImageProcessingRequest {
  imageUrl: string
  imageData?: Buffer
  analysisType: 'description' | 'ocr' | 'classification' | 'object_detection'
  options?: {
    includeText: boolean
    includeObjects: boolean
    includeColors: boolean
    includeFaces: boolean
  }
}

export interface ImageAnalysis {
  description: string
  objects: DetectedObject[]
  text: ExtractedText[]
  colors: ColorPalette
  faces: FaceDetection[]
  confidence: number
}

export interface DetectedObject {
  name: string
  confidence: number
  boundingBox: BoundingBox
  attributes: Record<string, any>
}

export interface ExtractedText {
  text: string
  confidence: number
  boundingBox: BoundingBox
  language?: string
}

export interface ColorPalette {
  dominant: string[]
  accent: string[]
  background: string
}

export interface FaceDetection {
  confidence: number
  boundingBox: BoundingBox
  attributes: {
    age?: number
    gender?: string
    emotion?: string
    glasses?: boolean
  }
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export interface AudioProcessingRequest {
  audioUrl?: string
  audioData?: Buffer
  format: 'wav' | 'mp3' | 'flac' | 'ogg'
  language?: string
  options?: {
    includeTimestamps: boolean
    includeSpeakerLabels: boolean
    includeConfidence: boolean
  }
}

export interface AudioTranscription {
  text: string
  segments: TranscriptionSegment[]
  speakers?: SpeakerLabel[]
  language: string
  confidence: number
}

export interface TranscriptionSegment {
  text: string
  start: number
  end: number
  confidence: number
  speaker?: string
}

export interface SpeakerLabel {
  id: string
  name?: string
  segments: number[]
}

export interface VideoProcessingRequest {
  videoUrl?: string
  videoData?: Buffer
  analysisType: 'transcription' | 'scene_detection' | 'object_tracking' | 'summary'
  options?: {
    includeAudio: boolean
    includeVisual: boolean
    frameRate?: number
    maxDuration?: number
  }
}

export interface VideoAnalysis {
  transcription?: AudioTranscription
  scenes: VideoScene[]
  objects: TrackedObject[]
  summary: string
  duration: number
  frameRate: number
}

export interface VideoScene {
  start: number
  end: number
  description: string
  keyFrame: string
  confidence: number
}

export interface TrackedObject {
  name: string
  appearances: ObjectAppearance[]
  totalDuration: number
}

export interface ObjectAppearance {
  start: number
  end: number
  confidence: number
  boundingBoxes: BoundingBox[]
}

export interface DocumentProcessingRequest {
  documentUrl?: string
  documentData?: Buffer
  format: 'pdf' | 'docx' | 'txt' | 'html' | 'markdown'
  analysisType: 'extraction' | 'summarization' | 'classification' | 'qa'
  options?: {
    includeImages: boolean
    includeTables: boolean
    includeMetadata: boolean
    maxPages?: number
  }
}

export interface DocumentAnalysis {
  text: string
  structure: DocumentStructure
  images: ExtractedImage[]
  tables: ExtractedTable[]
  metadata: DocumentMetadata
  summary?: string
  classification?: DocumentClassification
}

export interface DocumentStructure {
  title?: string
  headings: DocumentHeading[]
  paragraphs: DocumentParagraph[]
  sections: DocumentSection[]
}

export interface DocumentHeading {
  level: number
  text: string
  page?: number
  position?: number
}

export interface DocumentParagraph {
  text: string
  page?: number
  position?: number
  style?: string
}

export interface DocumentSection {
  title: string
  content: string
  subsections: DocumentSection[]
}

export interface ExtractedImage {
  description: string
  page?: number
  position?: BoundingBox
  url?: string
}

export interface ExtractedTable {
  headers: string[]
  rows: string[][]
  page?: number
  position?: BoundingBox
  caption?: string
}

export interface DocumentMetadata {
  title?: string
  author?: string
  createdDate?: Date
  modifiedDate?: Date
  pageCount?: number
  wordCount?: number
  language?: string
}

export interface DocumentClassification {
  category: string
  subcategory?: string
  confidence: number
  tags: string[]
}

/**
 * Specialized blueprint generation services with enhanced capabilities
 */
export interface EnhancedBlueprintGenerator extends BlueprintGenerator {
  generateWithTemplate(idea: ProcessedIdea, templateId: string): Promise<Blueprint>
  generateIteratively(idea: ProcessedIdea, feedback: IterativeFeedback[]): Promise<Blueprint>
  generateComparative(ideas: ProcessedIdea[]): Promise<ComparativeBlueprint>
  optimizeBlueprint(blueprint: Blueprint, criteria: OptimizationCriteria): Promise<Blueprint>
  validateBlueprint(blueprint: Blueprint): Promise<BlueprintValidation>
}

export interface IterativeFeedback {
  section: BlueprintSection
  feedback: string
  priority: 'low' | 'medium' | 'high'
  actionRequired: boolean
}

export interface ComparativeBlueprint {
  ideas: ProcessedIdea[]
  blueprints: Blueprint[]
  comparison: BlueprintComparison
  recommendation: BlueprintRecommendation
}

export interface BlueprintComparison {
  criteria: ComparisonCriteria[]
  scores: ComparisonScore[]
  analysis: string
}

export interface ComparisonCriteria {
  name: string
  weight: number
  description: string
}

export interface ComparisonScore {
  ideaId: string
  scores: Record<string, number>
  totalScore: number
  ranking: number
}

export interface BlueprintRecommendation {
  recommendedId: string
  reasoning: string
  alternatives: string[]
  riskFactors: string[]
}

export interface BlueprintValidation {
  isValid: boolean
  score: number
  issues: ValidationIssue[]
  suggestions: ValidationSuggestion[]
  completeness: CompletenessCheck
}

export interface ValidationSuggestion {
  section: BlueprintSection
  suggestion: string
  impact: 'low' | 'medium' | 'high'
  effort: 'low' | 'medium' | 'high'
}

export interface CompletenessCheck {
  productPlan: number
  techStack: number
  aiWorkflow: number
  roadmap: number
  financialModel: number
  overall: number
}

/**
 * Advanced prompt engineering interfaces
 */
export interface AdvancedPromptBuilder extends PromptBuilder {
  buildChainOfThought(templateId: string, variables: Record<string, any>): Promise<string>
  buildFewShot(templateId: string, examples: PromptExample[], variables: Record<string, any>): Promise<string>
  buildRolePlay(role: string, context: string, task: string): Promise<string>
  buildSocraticQuestioning(topic: string, depth: number): Promise<string[]>
  optimizeForModel(prompt: string, model: string): Promise<string>
}

export interface ChainOfThoughtPrompt {
  steps: ThoughtStep[]
  reasoning: string
  conclusion: string
}

export interface ThoughtStep {
  step: number
  description: string
  reasoning: string
  output: string
}

export interface FewShotPrompt {
  examples: PromptExample[]
  pattern: string
  instructions: string
}

export interface RolePlayPrompt {
  role: string
  context: string
  personality: string
  constraints: string[]
  objectives: string[]
}

/**
 * AI service monitoring and analytics
 */
export interface AIServiceMonitor {
  trackRequest(request: AIRequest, response: AIResponse): Promise<void>
  getMetrics(timeRange: TimeRange): Promise<AIMetrics>
  getUsageStats(userId?: string): Promise<UsageStats>
  getCostAnalysis(timeRange: TimeRange): Promise<CostAnalysis>
  getPerformanceReport(): Promise<PerformanceReport>
  createAlert(condition: AlertCondition): Promise<string>
}

export interface AIMetrics {
  totalRequests: number
  successRate: number
  averageLatency: number
  totalCost: number
  tokenUsage: TokenUsage
  errorBreakdown: Record<string, number>
  providerBreakdown: Record<string, ProviderMetrics>
}

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
  averagePromptLength: number
  averageCompletionLength: number
}

export interface ProviderMetrics {
  requests: number
  successRate: number
  averageLatency: number
  cost: number
  tokenUsage: TokenUsage
}

export interface UsageStats {
  userId?: string
  period: TimeRange
  requestCount: number
  tokenCount: number
  cost: number
  topModels: ModelUsage[]
  topFeatures: FeatureUsage[]
}

export interface ModelUsage {
  model: string
  provider: string
  requests: number
  tokens: number
  cost: number
  percentage: number
}

export interface FeatureUsage {
  feature: string
  requests: number
  percentage: number
  averageLatency: number
}

export interface CostAnalysis {
  totalCost: number
  costByProvider: Record<string, number>
  costByModel: Record<string, number>
  costByFeature: Record<string, number>
  costTrends: CostTrend[]
  projectedCost: number
  optimizationSuggestions: CostOptimization[]
}

export interface CostTrend {
  date: Date
  cost: number
  requests: number
  averageCostPerRequest: number
}

export interface CostOptimization {
  type: 'model_switch' | 'prompt_optimization' | 'caching' | 'batching'
  description: string
  potentialSavings: number
  effort: 'low' | 'medium' | 'high'
  impact: 'low' | 'medium' | 'high'
}

export interface PerformanceReport {
  period: TimeRange
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor'
  latencyPercentiles: {
    p50: number
    p90: number
    p95: number
    p99: number
  }
  errorRates: {
    total: number
    byType: Record<string, number>
    byProvider: Record<string, number>
  }
  throughput: {
    requestsPerSecond: number
    tokensPerSecond: number
    peakRPS: number
  }
  recommendations: PerformanceRecommendation[]
}

export interface PerformanceRecommendation {
  category: 'latency' | 'reliability' | 'cost' | 'scalability'
  priority: 'low' | 'medium' | 'high' | 'critical'
  description: string
  action: string
  expectedImprovement: string
}

export interface TimeRange {
  start: Date
  end: Date
}

// ============================================================================
// ENHANCED VALIDATION SCHEMAS
// ============================================================================

export const AdvancedAIServiceConfigSchema = z.object({
  providers: z.array(z.union([
    z.object({ name: z.literal('openai'), apiKey: z.string(), organization: z.string().optional() }),
    z.object({ name: z.literal('anthropic'), apiKey: z.string() }),
    z.object({ name: z.literal('local'), endpoint: z.string(), model: z.string() })
  ])),
  loadBalancing: z.object({
    strategy: z.enum(['round_robin', 'least_latency', 'cost_optimized', 'quality_first']),
    weights: z.record(z.string(), z.number()).optional()
  }),
  fallbackChain: z.array(z.string()),
  circuitBreaker: z.object({
    enabled: z.boolean(),
    failureThreshold: z.number().positive(),
    recoveryTimeout: z.number().positive()
  }),
  caching: z.object({
    enabled: z.boolean(),
    ttl: z.number().positive(),
    keyStrategy: z.enum(['prompt_hash', 'semantic_similarity'])
  }),
  monitoring: z.object({
    metricsEnabled: z.boolean(),
    alertThresholds: z.object({
      latency: z.number().positive(),
      errorRate: z.number().min(0).max(1),
      costPerHour: z.number().positive()
    })
  })
})

export const ImageProcessingRequestSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageData: z.instanceof(Buffer).optional(),
  analysisType: z.enum(['description', 'ocr', 'classification', 'object_detection']),
  options: z.object({
    includeText: z.boolean(),
    includeObjects: z.boolean(),
    includeColors: z.boolean(),
    includeFaces: z.boolean()
  }).optional()
}).refine(data => data.imageUrl || data.imageData, {
  message: "Either imageUrl or imageData must be provided"
})

export const AudioProcessingRequestSchema = z.object({
  audioUrl: z.string().url().optional(),
  audioData: z.instanceof(Buffer).optional(),
  format: z.enum(['wav', 'mp3', 'flac', 'ogg']),
  language: z.string().optional(),
  options: z.object({
    includeTimestamps: z.boolean(),
    includeSpeakerLabels: z.boolean(),
    includeConfidence: z.boolean()
  }).optional()
}).refine(data => data.audioUrl || data.audioData, {
  message: "Either audioUrl or audioData must be provided"
})

export const DocumentProcessingRequestSchema = z.object({
  documentUrl: z.string().url().optional(),
  documentData: z.instanceof(Buffer).optional(),
  format: z.enum(['pdf', 'docx', 'txt', 'html', 'markdown']),
  analysisType: z.enum(['extraction', 'summarization', 'classification', 'qa']),
  options: z.object({
    includeImages: z.boolean(),
    includeTables: z.boolean(),
    includeMetadata: z.boolean(),
    maxPages: z.number().positive().optional()
  }).optional()
}).refine(data => data.documentUrl || data.documentData, {
  message: "Either documentUrl or documentData must be provided"
})

export const BlueprintValidationSchema = z.object({
  isValid: z.boolean(),
  score: z.number().min(0).max(100),
  issues: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    category: z.string(),
    message: z.string(),
    field: z.string().optional(),
    suggestion: z.string().optional()
  })),
  suggestions: z.array(z.object({
    section: z.enum(['productPlan', 'techStack', 'aiWorkflow', 'roadmap', 'financialModel']),
    suggestion: z.string(),
    impact: z.enum(['low', 'medium', 'high']),
    effort: z.enum(['low', 'medium', 'high'])
  })),
  completeness: z.object({
    productPlan: z.number().min(0).max(100),
    techStack: z.number().min(0).max(100),
    aiWorkflow: z.number().min(0).max(100),
    roadmap: z.number().min(0).max(100),
    financialModel: z.number().min(0).max(100),
    overall: z.number().min(0).max(100)
  })
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const validateAIRequest = (data: unknown) => AIRequestSchema.safeParse(data)
export const validateAIResponse = (data: unknown) => AIResponseSchema.safeParse(data)
export const validateGenerationPreferences = (data: unknown) => GenerationPreferencesSchema.safeParse(data)
export const validateCodingPrompt = (data: unknown) => CodingPromptSchema.safeParse(data)
export const validateAdvancedAIServiceConfig = (data: unknown) => AdvancedAIServiceConfigSchema.safeParse(data)
export const validateImageProcessingRequest = (data: unknown) => ImageProcessingRequestSchema.safeParse(data)
export const validateAudioProcessingRequest = (data: unknown) => AudioProcessingRequestSchema.safeParse(data)
export const validateDocumentProcessingRequest = (data: unknown) => DocumentProcessingRequestSchema.safeParse(data)
export const validateBlueprintValidation = (data: unknown) => BlueprintValidationSchema.safeParse(data)

// ============================================================================
// AI SERVICE UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper function to create AI service error
 */
export const createAIServiceError = (
  provider: string,
  model: string,
  message: string,
  code: string,
  type: AIError['type'] = 'server_error',
  retryable: boolean = false
): AIError => ({
  code,
  message,
  type,
  retryable,
  ...(type === 'rate_limit' && { retryAfter: 60 })
})

/**
 * Helper function to calculate AI service cost
 */
export const calculateAIServiceCost = (
  promptTokens: number,
  completionTokens: number,
  costPerToken: number
): number => {
  return (promptTokens + completionTokens) * costPerToken
}

/**
 * Helper function to validate AI provider configuration
 */
export const validateAIProviderConfig = (provider: AIProvider): boolean => {
  switch (provider.name) {
    case 'openai':
      return !!(provider as OpenAIProvider).apiKey
    case 'anthropic':
      return !!(provider as AnthropicProvider).apiKey
    case 'local':
      return !!(provider as LocalProvider).endpoint && !!(provider as LocalProvider).model
    default:
      return false
  }
}

/**
 * Helper function to get default AI service configuration
 */
export const getDefaultAIServiceConfig = (): AdvancedAIServiceConfig => ({
  providers: [],
  loadBalancing: {
    strategy: 'round_robin'
  },
  fallbackChain: [],
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000
  },
  caching: {
    enabled: true,
    ttl: 3600,
    keyStrategy: 'prompt_hash'
  },
  monitoring: {
    metricsEnabled: true,
    alertThresholds: {
      latency: 5000,
      errorRate: 0.1,
      costPerHour: 100
    }
  }
})

/**
 * Helper function to merge AI service configurations
 */
export const mergeAIServiceConfigs = (
  base: AdvancedAIServiceConfig,
  override: Partial<AdvancedAIServiceConfig>
): AdvancedAIServiceConfig => ({
  ...base,
  ...override,
  loadBalancing: {
    ...base.loadBalancing,
    ...override.loadBalancing
  },
  circuitBreaker: {
    ...base.circuitBreaker,
    ...override.circuitBreaker
  },
  caching: {
    ...base.caching,
    ...override.caching
  },
  monitoring: {
    ...base.monitoring,
    ...override.monitoring,
    alertThresholds: {
      ...base.monitoring.alertThresholds,
      ...override.monitoring?.alertThresholds
    }
  }
})

export const validateCodingPrompt = (data: unknown) => CodingPromptSchema.safeParse(data)
export const validateAdvancedAIServiceConfig = (data: unknown) => AdvancedAIServiceConfigSchema.safeParse(data)
export const validateImageProcessingRequest = (data: unknown) => ImageProcessingRequestSchema.safeParse(data)
export const validateAudioProcessingRequest = (data: unknown) => AudioProcessingRequestSchema.safeParse(data)
export const validateDocumentProcessingRequest = (data: unknown) => DocumentProcessingRequestSchema.safeParse(data)
export const validateBlueprintValidation = (data: unknown) => BlueprintValidationSchema.safeParse(data)

// ============================================================================
// AI SERVICE UTILITY FUNCTIONS
// ============================================================================

/**
 * Helper function to create AI service error
 */
export const createAIServiceError = (
  provider: string,
  model: string,
  message: string,
  code: string,
  type: AIError['type'] = 'server_error',
  retryable: boolean = false
): AIError => ({
  code,
  message,
  type,
  retryable,
  ...(type === 'rate_limit' && { retryAfter: 60 })
})

/**
 * Helper function to calculate AI service cost
 */
export const calculateAIServiceCost = (
  promptTokens: number,
  completionTokens: number,
  costPerToken: number
): number => {
  return (promptTokens + completionTokens) * costPerToken
}

/**
 * Helper function to validate AI provider configuration
 */
export const validateAIProviderConfig = (provider: AIProvider): boolean => {
  switch (provider.name) {
    case 'openai':
      return !!(provider as OpenAIProvider).apiKey
    case 'anthropic':
      return !!(provider as AnthropicProvider).apiKey
    case 'local':
      return !!(provider as LocalProvider).endpoint && !!(provider as LocalProvider).model
    default:
      return false
  }
}

/**
 * Helper function to get default AI service configuration
 */
export const getDefaultAIServiceConfig = (): AdvancedAIServiceConfig => ({
  providers: [],
  loadBalancing: {
    strategy: 'round_robin'
  },
  fallbackChain: [],
  circuitBreaker: {
    enabled: true,
    failureThreshold: 5,
    recoveryTimeout: 60000
  },
  caching: {
    enabled: true,
    ttl: 3600,
    keyStrategy: 'prompt_hash'
  },
  monitoring: {
    metricsEnabled: true,
    alertThresholds: {
      latency: 5000,
      errorRate: 0.1,
      costPerHour: 100
    }
  }
})

/**
 * Helper function to merge AI service configurations
 */
export const mergeAIServiceConfigs = (
  base: AdvancedAIServiceConfig,
  override: Partial<AdvancedAIServiceConfig>
): AdvancedAIServiceConfig => ({
  ...base,
  ...override,
  loadBalancing: {
    ...base.loadBalancing,
    ...override.loadBalancing
  },
  circuitBreaker: {
    ...base.circuitBreaker,
    ...override.circuitBreaker
  },
  caching: {
    ...base.caching,
    ...override.caching
  },
  monitoring: {
    ...base.monitoring,
    ...override.monitoring,
    alertThresholds: {
      ...base.monitoring.alertThresholds,
      ...override.monitoring?.alertThresholds
    }
  }
})

export const calculateTokenCost = (
  promptTokens: number,
  completionTokens: number,
  provider: string,
  model: string
): number => {
  // Enhanced cost calculation with real pricing data
  const pricingMap: Record<string, Record<string, { prompt: number; completion: number }>> = {
    openai: {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-4-turbo': { prompt: 0.01, completion: 0.03 },
      'gpt-3.5-turbo': { prompt: 0.0015, completion: 0.002 }
    },
    anthropic: {
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 },
      'claude-3-haiku': { prompt: 0.00025, completion: 0.00125 }
    }
  }

  const pricing = pricingMap[provider]?.[model]
  if (!pricing) {
    // Fallback to average pricing
    return ((promptTokens + completionTokens) / 1000) * 0.002
  }

  return (promptTokens / 1000) * pricing.prompt + (completionTokens / 1000) * pricing.completion
}

export const estimateTokenCount = (text: string): number => {
  // Rough estimation: ~4 characters per token for English text
  return Math.ceil(text.length / 4)
}

export const optimizePromptForCost = (prompt: string, maxTokens?: number): string => {
  if (!maxTokens) return prompt
  
  const estimatedTokens = estimateTokenCount(prompt)
  if (estimatedTokens <= maxTokens) return prompt
  
  // Simple truncation strategy - in practice, this would be more sophisticated
  const targetLength = Math.floor((maxTokens * 4) * 0.9) // 90% of max to be safe
  return prompt.substring(0, targetLength) + '...'
}

export const createPromptTemplate = (
  template: string,
  variables: Record<string, any>
): string => {
  let result = template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    result = result.replace(new RegExp(placeholder, 'g'), String(value))
  })
  return result
}

export const validateCodingPrompt = (data: unknown) => CodingPromptSchema.safeParse(data)

// ============================================================================
// ADDITIONAL VALIDATION FUNCTIONS FOR AI SERVICES
// ============================================================================

export const validateAIRequest = (data: unknown) => AIRequestSchema.safeParse(data)
export const validateAIResponse = (data: unknown) => AIResponseSchema.safeParse(data)
export const validateGenerationPreferences = (data: unknown) => GenerationPreferencesSchema.safeParse(data)
export const validateImageProcessingRequest = (data: unknown) => ImageProcessingRequestSchema.safeParse(data)
export const validateAudioProcessingRequest = (data: unknown) => AudioProcessingRequestSchema.safeParse(data)
export const validateDocumentProcessingRequest = (data: unknown) => DocumentProcessingRequestSchema.safeParse(data)
export const validateBlueprintValidation = (data: unknown) => BlueprintValidationSchema.safeParse(data)
export const validateAdvancedAIServiceConfig = (data: unknown) => AdvancedAIServiceConfigSchema.safeParse(data)

// ============================================================================
// AI SERVICE UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate token usage cost based on provider pricing
 */
export const calculateTokenCost = (
  usage: { promptTokens: number; completionTokens: number },
  provider: string,
  model: string
): number => {
  // Simplified pricing - in real implementation, this would use actual provider pricing
  const baseCostPer1kTokens = {
    'openai': {
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.001, completion: 0.002 }
    },
    'anthropic': {
      'claude-3-opus': { prompt: 0.015, completion: 0.075 },
      'claude-3-sonnet': { prompt: 0.003, completion: 0.015 }
    }
  }
  
  const pricing = baseCostPer1kTokens[provider as keyof typeof baseCostPer1kTokens]?.[model as keyof any]
  if (!pricing) return 0
  
  const promptCost = (usage.promptTokens / 1000) * pricing.prompt
  const completionCost = (usage.completionTokens / 1000) * pricing.completion
  
  return promptCost + completionCost
}

/**
 * Estimate token count for text (rough approximation)
 */
export const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4)
}

/**
 * Check if error is retryable based on error type
 */
export const isRetryableAIError = (error: AIError): boolean => {
  const retryableTypes = ['rate_limit', 'server_error', 'timeout']
  return error.retryable && retryableTypes.includes(error.type)
}

/**
 * Calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (attempt: number, baseDelay: number = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt - 1), 30000) // Max 30 seconds
}

/**
 * Validate AI service configuration
 */
export const validateAIServiceConfig = (config: any): boolean => {
  try {
    AdvancedAIServiceConfigSchema.parse(config)
    return true
  } catch {
    return false
  }
}

/**
 * Create a standardized AI request from parameters
 */
export const createAIRequest = (
  provider: string,
  model: string,
  prompt: string,
  options?: Partial<AIRequest>
): AIRequest => {
  return {
    provider,
    model,
    prompt,
    temperature: 0.7,
    maxTokens: 2000,
    stream: false,
    ...options
  }
}

/**
 * Create a standardized AI response
 */
export const createAIResponse = <T>(
  data: T,
  metadata: {
    provider: string
    model: string
    latency: number
    requestId: string
  },
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  },
  rawResponse?: string
): AIResponse<T> => {
  const cost = calculateTokenCost(usage, metadata.provider, metadata.model)
  
  return {
    success: true,
    data,
    rawResponse,
    usage: {
      ...usage,
      cost
    },
    metadata: {
      ...metadata,
      timestamp: new Date()
    }
  }
}

/**
 * Create an AI error response
 */
export const createAIErrorResponse = (
  error: AIError,
  metadata: {
    provider: string
    model: string
    latency: number
    requestId: string
  }
): AIResponse => {
  return {
    success: false,
    error,
    usage: {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      cost: 0
    },
    metadata: {
      ...metadata,
      timestamp: new Date()
    }
  }
}

/**
 * Merge multiple AI responses for batch processing
 */
export const mergeAIResponses = <T>(responses: AIResponse<T>[]): AIResponse<T[]> => {
  const successful = responses.filter(r => r.success)
  const failed = responses.filter(r => !r.success)
  
  if (failed.length > 0) {
    return {
      success: false,
      error: {
        code: 'BATCH_PARTIAL_FAILURE',
        message: `${failed.length} out of ${responses.length} requests failed`,
        type: 'server_error',
        retryable: false
      },
      usage: responses.reduce((acc, r) => ({
        promptTokens: acc.promptTokens + r.usage.promptTokens,
        completionTokens: acc.completionTokens + r.usage.completionTokens,
        totalTokens: acc.totalTokens + r.usage.totalTokens,
        cost: acc.cost + r.usage.cost
      }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 }),
      metadata: {
        provider: 'batch',
        model: 'multiple',
        latency: Math.max(...responses.map(r => r.metadata.latency)),
        timestamp: new Date(),
        requestId: 'batch-' + Date.now()
      }
    }
  }
  
  return {
    success: true,
    data: successful.map(r => r.data!),
    usage: responses.reduce((acc, r) => ({
      promptTokens: acc.promptTokens + r.usage.promptTokens,
      completionTokens: acc.completionTokens + r.usage.completionTokens,
      totalTokens: acc.totalTokens + r.usage.totalTokens,
      cost: acc.cost + r.usage.cost
    }), { promptTokens: 0, completionTokens: 0, totalTokens: 0, cost: 0 }),
    metadata: {
      provider: 'batch',
      model: 'multiple',
      latency: Math.max(...responses.map(r => r.metadata.latency)),
      timestamp: new Date(),
      requestId: 'batch-' + Date.now()
    }
  }
}

// ============================================================================
// PROMPT ENGINEERING UTILITIES
// ============================================================================

/**
 * Template for creating structured prompts
 */
export const createStructuredPrompt = (
  task: string,
  context: string[],
  examples?: string[],
  constraints?: string[]
): string => {
  let prompt = `Task: ${task}\n\n`
  
  if (context.length > 0) {
    prompt += `Context:\n${context.map(c => `- ${c}`).join('\n')}\n\n`
  }
  
  if (examples && examples.length > 0) {
    prompt += `Examples:\n${examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}\n\n`
  }
  
  if (constraints && constraints.length > 0) {
    prompt += `Constraints:\n${constraints.map(c => `- ${c}`).join('\n')}\n\n`
  }
  
  prompt += 'Please provide your response:'
  
  return prompt
}

/**
 * Create a chain-of-thought prompt
 */
export const createChainOfThoughtPrompt = (
  problem: string,
  steps: string[]
): string => {
  let prompt = `Problem: ${problem}\n\n`
  prompt += 'Let\'s think through this step by step:\n\n'
  
  steps.forEach((step, i) => {
    prompt += `Step ${i + 1}: ${step}\n`
  })
  
  prompt += '\nBased on this analysis, please provide your final answer:'
  
  return prompt
}

/**
 * Create a few-shot learning prompt
 */
export const createFewShotPrompt = (
  task: string,
  examples: Array<{ input: string; output: string }>,
  newInput: string
): string => {
  let prompt = `Task: ${task}\n\n`
  
  examples.forEach((example, i) => {
    prompt += `Example ${i + 1}:\n`
    prompt += `Input: ${example.input}\n`
    prompt += `Output: ${example.output}\n\n`
  })
  
  prompt += `Now, please complete this:\n`
  prompt += `Input: ${newInput}\n`
  prompt += `Output:`
  
  return prompt
}

/**
 * Create a role-based prompt
 */
export const createRoleBasedPrompt = (
  role: string,
  context: string,
  task: string,
  constraints?: string[]
): string => {
  let prompt = `You are ${role}. ${context}\n\n`
  prompt += `Your task: ${task}\n\n`
  
  if (constraints && constraints.length > 0) {
    prompt += `Please follow these guidelines:\n`
    prompt += constraints.map(c => `- ${c}`).join('\n') + '\n\n'
  }
  
  prompt += 'Please provide your response:'
  
  return prompt
}

// ============================================================================
// BLUEPRINT GENERATION UTILITIES
// ============================================================================

/**
 * Create generation context from user data
 */
export const createGenerationContext = (
  userProfile?: any,
  projectHistory?: any,
  marketData?: any
): GenerationContext => {
  return {
    userProfile: userProfile ? {
      experience: userProfile.experience || 'intermediate',
      background: userProfile.background || [],
      preferences: userProfile.preferences || {}
    } : undefined,
    projectHistory: projectHistory ? {
      previousProjects: projectHistory.previousProjects || [],
      successfulPatterns: projectHistory.successfulPatterns || [],
      challenges: projectHistory.challenges || []
    } : undefined,
    marketData: marketData ? {
      trends: marketData.trends || [],
      competitors: marketData.competitors || [],
      opportunities: marketData.opportunities || []
    } : undefined
  }
}

/**
 * Validate blueprint completeness
 */
export const validateBlueprintCompleteness = (blueprint: any): CompletenessCheck => {
  const checkSection = (section: any, requiredFields: string[]): number => {
    if (!section) return 0
    
    const presentFields = requiredFields.filter(field => {
      const value = section[field]
      return value !== undefined && value !== null && 
             (Array.isArray(value) ? value.length > 0 : true)
    })
    
    return Math.round((presentFields.length / requiredFields.length) * 100)
  }
  
  const productPlan = checkSection(blueprint.productPlan, [
    'targetAudience', 'coreFeatures', 'differentiators', 'monetization', 'gtmStrategy'
  ])
  
  const techStack = checkSection(blueprint.techStack, [
    'frontend', 'backend', 'database', 'aiServices', 'deployment'
  ])
  
  const aiWorkflow = checkSection(blueprint.aiWorkflow, [
    'nodes', 'edges', 'modules', 'configuration'
  ])
  
  const roadmap = checkSection(blueprint.roadmap, [
    'phases', 'totalEstimate', 'timeline', 'dependencies'
  ])
  
  const financialModel = checkSection(blueprint.financialModel, [
    'costs', 'revenue', 'metrics', 'scenarios'
  ])
  
  const overall = Math.round((productPlan + techStack + aiWorkflow + roadmap + financialModel) / 5)
  
  return {
    productPlan,
    techStack,
    aiWorkflow,
    roadmap,
    financialModel,
    overall
  }
}

/**
 * Generate blueprint validation suggestions
 */
export const generateBlueprintSuggestions = (
  blueprint: any,
  completeness: CompletenessCheck
): ValidationSuggestion[] => {
  const suggestions: ValidationSuggestion[] = []
  
  if (completeness.productPlan < 80) {
    suggestions.push({
      section: 'productPlan',
      suggestion: 'Add more detailed target audience analysis and competitive differentiation',
      impact: 'high',
      effort: 'medium'
    })
  }
  
  if (completeness.techStack < 80) {
    suggestions.push({
      section: 'techStack',
      suggestion: 'Include security guidelines and monitoring tools in your tech stack',
      impact: 'high',
      effort: 'low'
    })
  }
  
  if (completeness.aiWorkflow < 70) {
    suggestions.push({
      section: 'aiWorkflow',
      suggestion: 'Define more detailed AI workflow modules and error handling',
      impact: 'medium',
      effort: 'medium'
    })
  }
  
  if (completeness.roadmap < 80) {
    suggestions.push({
      section: 'roadmap',
      suggestion: 'Add risk assessment and dependency mapping to your roadmap',
      impact: 'high',
      effort: 'medium'
    })
  }
  
  if (completeness.financialModel < 70) {
    suggestions.push({
      section: 'financialModel',
      suggestion: 'Include multiple financial scenarios and sensitivity analysis',
      impact: 'medium',
      effort: 'high'
    })
  }
  
  return suggestions
}