// Types for AI Coding Integration Features
// Defines interfaces for coding prompt generation and management

export enum CodingTool {
  CURSOR = 'cursor',
  CLAUDE_DEV = 'claude-dev',
  GITHUB_COPILOT = 'github-copilot',
  CODEIUM = 'codeium',
  TABNINE = 'tabnine',
  CUSTOM = 'custom'
}

export enum PromptCategory {
  SETUP = 'setup',
  ARCHITECTURE = 'architecture',
  FEATURE = 'feature',
  TESTING = 'testing',
  DEPLOYMENT = 'deployment',
  OPTIMIZATION = 'optimization',
  DEBUGGING = 'debugging',
  REFACTORING = 'refactoring'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface CodingPromptTemplate {
  id: string
  name: string
  description: string
  category: PromptCategory
  difficulty: DifficultyLevel
  supportedTools: CodingTool[]
  template: string
  variables: PromptVariable[]
  contextRequirements: ContextRequirement[]
  expectedOutput: ExpectedOutput
  tags: string[]
  version: string
  createdAt: Date
  updatedAt: Date
  author: string
  usageCount: number
  rating?: number
}

export interface PromptVariable {
  name: string
  type: 'string' | 'array' | 'object' | 'number' | 'boolean'
  required: boolean
  description: string
  defaultValue?: any
  validation?: {
    pattern?: string
    min?: number
    max?: number
    options?: string[]
  }
}

export interface ContextRequirement {
  type: 'tech-stack' | 'features' | 'architecture' | 'dependencies' | 'files'
  description: string
  required: boolean
  format: string
}

export interface ExpectedOutput {
  type: 'code' | 'configuration' | 'documentation' | 'commands' | 'mixed'
  description: string
  format: string
  estimatedLines?: number
  files?: string[]
}

export interface GeneratedCodingPrompt {
  id: string
  templateId: string
  title: string
  description: string
  prompt: string
  context: PromptContext
  tool: CodingTool
  difficulty: DifficultyLevel
  estimatedTime: number // minutes
  tags: string[]
  generatedAt: Date
  projectId: string
  userId: string
}

export interface PromptContext {
  techStack: {
    frontend: string[]
    backend: string[]
    database: string[]
    aiServices: string[]
    deployment: string[]
  }
  features: string[]
  architecture: string
  projectStructure?: string[]
  dependencies?: string[]
  codeStyle?: CodeStylePreferences
  constraints?: string[]
}

export interface CodeStylePreferences {
  language: string
  framework?: string
  conventions: {
    naming: 'camelCase' | 'snake_case' | 'kebab-case' | 'PascalCase'
    indentation: 'spaces' | 'tabs'
    indentSize: number
    quotes: 'single' | 'double'
    semicolons: boolean
  }
  patterns: string[]
  linting: {
    enabled: boolean
    rules: string[]
  }
  formatting: {
    enabled: boolean
    tool: string
  }
}

export interface PromptValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  suggestions: string[]
  score: number // 0-100
}

export interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

export interface PromptTestResult {
  id: string
  promptId: string
  tool: CodingTool
  testType: 'syntax' | 'completeness' | 'clarity' | 'effectiveness'
  score: number // 0-100
  feedback: string
  suggestions: string[]
  executedAt: Date
  duration: number // milliseconds
}

export interface PromptVersionControl {
  id: string
  promptId: string
  version: string
  changes: PromptChange[]
  author: string
  message: string
  createdAt: Date
  parentVersion?: string
  isActive: boolean
}

export interface PromptChange {
  type: 'added' | 'modified' | 'removed'
  field: string
  oldValue?: any
  newValue?: any
  description: string
}

export interface PromptOptimization {
  originalPrompt: string
  optimizedPrompt: string
  improvements: string[]
  metrics: {
    clarity: number
    specificity: number
    completeness: number
    efficiency: number
  }
  tool: CodingTool
  context: PromptContext
}

export interface PromptAnalytics {
  promptId: string
  usageStats: {
    totalUses: number
    successRate: number
    averageRating: number
    completionTime: number
  }
  toolPerformance: {
    tool: CodingTool
    successRate: number
    averageRating: number
    commonIssues: string[]
  }[]
  contextEffectiveness: {
    context: string
    successRate: number
    improvements: string[]
  }[]
  userFeedback: PromptFeedback[]
}

export interface PromptFeedback {
  userId: string
  promptId: string
  rating: number // 1-5
  feedback: string
  improvements: string[]
  tool: CodingTool
  createdAt: Date
}

export interface PromptLibrary {
  id: string
  name: string
  description: string
  templates: CodingPromptTemplate[]
  categories: PromptCategory[]
  tools: CodingTool[]
  isPublic: boolean
  owner: string
  contributors: string[]
  createdAt: Date
  updatedAt: Date
}

export interface PromptGenerationRequest {
  projectId: string
  blueprint: {
    productPlan: any
    techStack: any
    features: any[]
    architecture: any
  }
  preferences: {
    tool: CodingTool
    difficulty: DifficultyLevel
    categories: PromptCategory[]
    includeContext: boolean
    optimizeForTool: boolean
  }
  customInstructions?: string
}

export interface PromptGenerationResponse {
  prompts: GeneratedCodingPrompt[]
  metadata: {
    totalGenerated: number
    categories: PromptCategory[]
    estimatedTotalTime: number
    recommendations: string[]
  }
  context: PromptContext
  generatedAt: Date
}