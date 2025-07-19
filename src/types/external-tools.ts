// Types for External Tool Integration
// Defines interfaces for integrating with external coding tools

export enum ExternalTool {
  CURSOR = 'cursor',
  VSCODE = 'vscode',
  GITHUB_COPILOT = 'github-copilot',
  CLAUDE_DEV = 'claude-dev',
  CODEIUM = 'codeium',
  TABNINE = 'tabnine',
  JETBRAINS = 'jetbrains',
  CUSTOM = 'custom'
}

export enum IntegrationType {
  DIRECT_LAUNCH = 'direct-launch',
  API_INTEGRATION = 'api-integration',
  FILE_EXPORT = 'file-export',
  URL_SCHEME = 'url-scheme',
  EXTENSION = 'extension'
}

export enum ProjectExportFormat {
  ZIP = 'zip',
  TAR_GZ = 'tar-gz',
  GIT_REPO = 'git-repo',
  FOLDER = 'folder',
  VSCODE_WORKSPACE = 'vscode-workspace',
  CURSOR_PROJECT = 'cursor-project'
}

export interface ExternalToolConfig {
  id: string
  name: string
  tool: ExternalTool
  integrationType: IntegrationType
  isEnabled: boolean
  configuration: ToolConfiguration
  apiKeys?: ApiKeyConfig[]
  launchOptions: LaunchOptions
  exportOptions: ExportOptions
  createdAt: Date
  updatedAt: Date
}

export interface ToolConfiguration {
  executablePath?: string
  workspaceTemplate?: string
  defaultSettings?: Record<string, any>
  environmentVariables?: Record<string, string>
  commandLineArgs?: string[]
  urlScheme?: string
  apiEndpoint?: string
  webhookUrl?: string
}

export interface ApiKeyConfig {
  id: string
  name: string
  description: string
  keyType: 'api-key' | 'bearer-token' | 'oauth' | 'custom'
  isRequired: boolean
  isEncrypted: boolean
  value?: string
  expiresAt?: Date
  scopes?: string[]
  metadata?: Record<string, any>
}

export interface LaunchOptions {
  openInNewWindow: boolean
  includeProjectContext: boolean
  preloadPrompts: boolean
  autoStartCoding: boolean
  customInstructions?: string
  workspaceSettings?: Record<string, any>
  extensions?: string[]
  theme?: string
}

export interface ExportOptions {
  format: ProjectExportFormat
  includeFiles: string[]
  excludeFiles: string[]
  includePrompts: boolean
  includeDocumentation: boolean
  includeTests: boolean
  compressionLevel?: number
  metadata?: ProjectMetadata
}

export interface ProjectMetadata {
  name: string
  description: string
  version: string
  author: string
  license?: string
  repository?: string
  homepage?: string
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}

export interface LaunchRequest {
  toolId: string
  projectId: string
  blueprint: any
  prompts?: string[]
  options?: LaunchOptions
  customContext?: Record<string, any>
}

export interface LaunchResponse {
  success: boolean
  toolUrl?: string
  projectUrl?: string
  workspaceId?: string
  sessionId?: string
  error?: string
  metadata?: {
    launchedAt: Date
    tool: ExternalTool
    projectId: string
    estimatedSetupTime: number
  }
}

export interface ExportRequest {
  projectId: string
  blueprint: any
  format: ProjectExportFormat
  options?: ExportOptions
  destination?: string
}

export interface ExportResponse {
  success: boolean
  downloadUrl?: string
  filePath?: string
  fileName?: string
  fileSize?: number
  expiresAt?: Date
  error?: string
  metadata?: {
    exportedAt: Date
    format: ProjectExportFormat
    projectId: string
    fileCount: number
  }
}

export interface ToolIntegrationStatus {
  toolId: string
  tool: ExternalTool
  isAvailable: boolean
  isConfigured: boolean
  lastChecked: Date
  version?: string
  capabilities: ToolCapability[]
  limitations: string[]
  healthStatus: 'healthy' | 'warning' | 'error' | 'unknown'
  errorMessage?: string
}

export interface ToolCapability {
  name: string
  description: string
  isSupported: boolean
  version?: string
  requirements?: string[]
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  tool: ExternalTool
  techStack: string[]
  files: TemplateFile[]
  configuration: Record<string, any>
  instructions: string
  estimatedSetupTime: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface TemplateFile {
  path: string
  content: string
  isTemplate: boolean
  variables?: TemplateVariable[]
  encoding?: string
}

export interface TemplateVariable {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  defaultValue?: any
  description: string
  required: boolean
}

export interface ToolSession {
  id: string
  toolId: string
  projectId: string
  userId: string
  status: 'active' | 'inactive' | 'expired' | 'error'
  startedAt: Date
  lastActivity: Date
  expiresAt?: Date
  metadata: {
    tool: ExternalTool
    workspaceUrl?: string
    sessionData?: Record<string, any>
  }
}

export interface IntegrationAnalytics {
  toolId: string
  tool: ExternalTool
  usage: {
    totalLaunches: number
    successfulLaunches: number
    failedLaunches: number
    averageSetupTime: number
    lastUsed: Date
  }
  performance: {
    averageResponseTime: number
    uptime: number
    errorRate: number
  }
  userFeedback: {
    averageRating: number
    totalRatings: number
    commonIssues: string[]
    suggestions: string[]
  }
}

export interface ToolIntegrationEvent {
  id: string
  toolId: string
  eventType: 'launch' | 'export' | 'error' | 'config-change' | 'api-call'
  status: 'success' | 'failure' | 'warning'
  message: string
  data?: Record<string, any>
  userId?: string
  projectId?: string
  timestamp: Date
  duration?: number
}

export interface ApiKeyManagement {
  listKeys(toolId: string): Promise<ApiKeyConfig[]>
  addKey(toolId: string, keyConfig: Omit<ApiKeyConfig, 'id'>): Promise<ApiKeyConfig>
  updateKey(keyId: string, updates: Partial<ApiKeyConfig>): Promise<ApiKeyConfig>
  deleteKey(keyId: string): Promise<boolean>
  validateKey(keyId: string): Promise<boolean>
  rotateKey(keyId: string): Promise<ApiKeyConfig>
  encryptKey(value: string): Promise<string>
  decryptKey(encryptedValue: string): Promise<string>
}

export interface ToolRegistry {
  registerTool(config: ExternalToolConfig): Promise<string>
  unregisterTool(toolId: string): Promise<boolean>
  getTool(toolId: string): Promise<ExternalToolConfig | null>
  listTools(): Promise<ExternalToolConfig[]>
  updateTool(toolId: string, updates: Partial<ExternalToolConfig>): Promise<ExternalToolConfig>
  checkToolAvailability(toolId: string): Promise<ToolIntegrationStatus>
  getToolCapabilities(toolId: string): Promise<ToolCapability[]>
}

export interface ProjectExporter {
  exportProject(request: ExportRequest): Promise<ExportResponse>
  generateProjectStructure(blueprint: any): Promise<TemplateFile[]>
  createProjectTemplate(blueprint: any, tool: ExternalTool): Promise<ProjectTemplate>
  validateExportRequest(request: ExportRequest): Promise<{ valid: boolean; errors: string[] }>
  getExportHistory(projectId: string): Promise<ExportResponse[]>
  cleanupExpiredExports(): Promise<number>
}

export interface ToolLauncher {
  launchTool(request: LaunchRequest): Promise<LaunchResponse>
  prepareLaunchContext(blueprint: any, tool: ExternalTool): Promise<Record<string, any>>
  generateLaunchUrl(toolId: string, context: Record<string, any>): Promise<string>
  validateLaunchRequest(request: LaunchRequest): Promise<{ valid: boolean; errors: string[] }>
  trackLaunchSession(response: LaunchResponse): Promise<ToolSession>
  terminateSession(sessionId: string): Promise<boolean>
}

export interface WebhookHandler {
  registerWebhook(toolId: string, url: string, events: string[]): Promise<string>
  unregisterWebhook(webhookId: string): Promise<boolean>
  handleWebhook(toolId: string, payload: any): Promise<void>
  validateWebhookSignature(payload: any, signature: string, secret: string): boolean
  processWebhookEvent(event: ToolIntegrationEvent): Promise<void>
}

export interface ToolConfigurationManager {
  getConfiguration(toolId: string): Promise<ToolConfiguration>
  updateConfiguration(toolId: string, config: Partial<ToolConfiguration>): Promise<ToolConfiguration>
  validateConfiguration(config: ToolConfiguration): Promise<{ valid: boolean; errors: string[] }>
  resetConfiguration(toolId: string): Promise<ToolConfiguration>
  exportConfiguration(toolId: string): Promise<string>
  importConfiguration(toolId: string, configData: string): Promise<ToolConfiguration>
}