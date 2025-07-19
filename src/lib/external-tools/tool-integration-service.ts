import {
  ExternalTool,
  ExternalToolConfig,
  LaunchRequest,
  LaunchResponse,
  ExportRequest,
  ExportResponse,
  ToolIntegrationStatus,
  ToolSession,
  ApiKeyConfig,
  ProjectTemplate,
  TemplateFile,
  IntegrationAnalytics,
  ToolIntegrationEvent,
  IntegrationType,
  ProjectExportFormat
} from '@/types/external-tools'
import { Blueprint } from '@/types'

export class ToolIntegrationService {
  private tools: Map<string, ExternalToolConfig> = new Map()
  private sessions: Map<string, ToolSession> = new Map()
  private analytics: Map<string, IntegrationAnalytics> = new Map()
  private events: ToolIntegrationEvent[] = []

  constructor() {
    this.initializeDefaultTools()
  }

  /**
   * Initialize default tool configurations
   */
  private initializeDefaultTools(): void {
    const defaultTools: ExternalToolConfig[] = [
      {
        id: 'cursor-default',
        name: 'Cursor IDE',
        tool: ExternalTool.CURSOR,
        integrationType: IntegrationType.URL_SCHEME,
        isEnabled: true,
        configuration: {
          urlScheme: 'cursor://file',
          executablePath: '/Applications/Cursor.app/Contents/MacOS/Cursor',
          commandLineArgs: ['--new-window', '--goto'],
          apiEndpoint: 'https://cursor.sh/api/v1',
          defaultSettings: {
            'cursor.ai.enabled': true,
            'cursor.ai.model': 'claude-3-sonnet',
            'cursor.ai.temperature': 0.7,
            'cursor.composer.enabled': true,
            'cursor.chat.enabled': true
          }
        },
        launchOptions: {
          openInNewWindow: true,
          includeProjectContext: true,
          preloadPrompts: true,
          autoStartCoding: false,
          workspaceSettings: {
            'files.autoSave': 'afterDelay',
            'editor.formatOnSave': true,
            'editor.codeActionsOnSave': {
              'source.fixAll': true
            }
          }
        },
        exportOptions: {
          format: ProjectExportFormat.CURSOR_PROJECT,
          includeFiles: ['**/*'],
          excludeFiles: ['node_modules/**', '.git/**', 'dist/**', '.next/**'],
          includePrompts: true,
          includeDocumentation: true,
          includeTests: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'vscode-default',
        name: 'Visual Studio Code',
        tool: ExternalTool.VSCODE,
        integrationType: IntegrationType.URL_SCHEME,
        isEnabled: true,
        configuration: {
          urlScheme: 'vscode://file',
          executablePath: '/Applications/Visual Studio Code.app/Contents/MacOS/Electron',
          commandLineArgs: ['--new-window', '--goto'],
          defaultSettings: {
            'workbench.colorTheme': 'Default Dark+',
            'editor.fontSize': 14,
            'editor.tabSize': 2
          }
        },
        launchOptions: {
          openInNewWindow: true,
          includeProjectContext: true,
          preloadPrompts: false,
          autoStartCoding: false,
          extensions: [
            'ms-vscode.vscode-typescript-next',
            'esbenp.prettier-vscode',
            'bradlc.vscode-tailwindcss',
            'ms-vscode.vscode-json'
          ]
        },
        exportOptions: {
          format: ProjectExportFormat.VSCODE_WORKSPACE,
          includeFiles: ['**/*'],
          excludeFiles: ['node_modules/**', '.git/**'],
          includePrompts: false,
          includeDocumentation: true,
          includeTests: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'github-copilot-default',
        name: 'GitHub Copilot',
        tool: ExternalTool.GITHUB_COPILOT,
        integrationType: IntegrationType.API_INTEGRATION,
        isEnabled: true,
        configuration: {
          apiEndpoint: 'https://api.github.com/copilot',
          defaultSettings: {
            'github.copilot.enable': true,
            'github.copilot.inlineSuggest.enable': true,
            'github.copilot.chat.enable': true
          }
        },
        launchOptions: {
          openInNewWindow: false,
          includeProjectContext: true,
          preloadPrompts: true,
          autoStartCoding: true,
          workspaceSettings: {
            'github.copilot.enable': {
              '*': true,
              'yaml': false,
              'plaintext': false
            }
          }
        },
        exportOptions: {
          format: ProjectExportFormat.ZIP,
          includeFiles: ['**/*'],
          excludeFiles: ['node_modules/**', '.git/**'],
          includePrompts: true,
          includeDocumentation: true,
          includeTests: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'claude-dev-default',
        name: 'Claude Dev',
        tool: ExternalTool.CLAUDE_DEV,
        integrationType: IntegrationType.EXTENSION,
        isEnabled: true,
        configuration: {
          apiEndpoint: 'https://api.anthropic.com/v1',
          defaultSettings: {
            'claude.model': 'claude-3-sonnet-20240229',
            'claude.maxTokens': 4096,
            'claude.temperature': 0.7
          }
        },
        launchOptions: {
          openInNewWindow: false,
          includeProjectContext: true,
          preloadPrompts: true,
          autoStartCoding: true
        },
        exportOptions: {
          format: ProjectExportFormat.ZIP,
          includeFiles: ['**/*'],
          excludeFiles: ['node_modules/**', '.git/**'],
          includePrompts: true,
          includeDocumentation: true,
          includeTests: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    defaultTools.forEach(tool => {
      this.tools.set(tool.id, tool)
      this.initializeAnalytics(tool.id, tool.tool)
    })
  }

  /**
   * Launch an external tool with project context
   */
  async launchTool(request: LaunchRequest): Promise<LaunchResponse> {
    const startTime = Date.now()
    
    try {
      const tool = this.tools.get(request.toolId)
      if (!tool) {
        throw new Error(`Tool not found: ${request.toolId}`)
      }

      if (!tool.isEnabled) {
        throw new Error(`Tool is disabled: ${tool.name}`)
      }

      // Validate the request
      const validation = await this.validateLaunchRequest(request)
      if (!validation.valid) {
        throw new Error(`Invalid launch request: ${validation.errors.join(', ')}`)
      }

      // Prepare launch context
      const context = await this.prepareLaunchContext(request.blueprint, tool.tool, request.prompts)
      
      // Generate launch URL or command
      const launchResult = await this.executeLaunch(tool, context, request.options)
      
      // Create session
      const session = await this.createSession(request.toolId, request.projectId, 'user-id', launchResult)
      
      // Track analytics
      this.trackLaunchEvent(request.toolId, true, Date.now() - startTime)
      
      // Log event
      this.logEvent({
        id: `launch-${Date.now()}`,
        toolId: request.toolId,
        eventType: 'launch',
        status: 'success',
        message: `Successfully launched ${tool.name}`,
        projectId: request.projectId,
        timestamp: new Date(),
        duration: Date.now() - startTime
      })

      return {
        success: true,
        toolUrl: launchResult.url,
        projectUrl: launchResult.projectUrl,
        workspaceId: launchResult.workspaceId,
        sessionId: session.id,
        metadata: {
          launchedAt: new Date(),
          tool: tool.tool,
          projectId: request.projectId,
          estimatedSetupTime: this.estimateSetupTime(tool.tool, request.blueprint)
        }
      }
    } catch (error) {
      this.trackLaunchEvent(request.toolId, false, Date.now() - startTime)
      
      this.logEvent({
        id: `launch-error-${Date.now()}`,
        toolId: request.toolId,
        eventType: 'launch',
        status: 'failure',
        message: `Failed to launch tool: ${error instanceof Error ? error.message : 'Unknown error'}`,
        projectId: request.projectId,
        timestamp: new Date(),
        duration: Date.now() - startTime
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Export project for external tool
   */
  async exportProject(request: ExportRequest): Promise<ExportResponse> {
    const startTime = Date.now()
    
    try {
      // Validate export request
      const validation = await this.validateExportRequest(request)
      if (!validation.valid) {
        throw new Error(`Invalid export request: ${validation.errors.join(', ')}`)
      }

      // Generate project structure
      const files = await this.generateProjectStructure(request.blueprint)
      
      // Create export package
      const exportResult = await this.createExportPackage(files, request.format, request.options)
      
      // Log event
      this.logEvent({
        id: `export-${Date.now()}`,
        toolId: 'export',
        eventType: 'export',
        status: 'success',
        message: `Successfully exported project in ${request.format} format`,
        projectId: request.projectId,
        timestamp: new Date(),
        duration: Date.now() - startTime
      })

      return {
        success: true,
        downloadUrl: exportResult.downloadUrl,
        fileName: exportResult.fileName,
        fileSize: exportResult.fileSize,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        metadata: {
          exportedAt: new Date(),
          format: request.format,
          projectId: request.projectId,
          fileCount: files.length
        }
      }
    } catch (error) {
      this.logEvent({
        id: `export-error-${Date.now()}`,
        toolId: 'export',
        eventType: 'export',
        status: 'failure',
        message: `Failed to export project: ${error instanceof Error ? error.message : 'Unknown error'}`,
        projectId: request.projectId,
        timestamp: new Date(),
        duration: Date.now() - startTime
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * Get tool integration status
   */
  async getToolStatus(toolId: string): Promise<ToolIntegrationStatus> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      return {
        toolId,
        tool: ExternalTool.CUSTOM,
        isAvailable: false,
        isConfigured: false,
        lastChecked: new Date(),
        capabilities: [],
        limitations: ['Tool not found'],
        healthStatus: 'error',
        errorMessage: 'Tool configuration not found'
      }
    }

    try {
      const isAvailable = await this.checkToolAvailability(tool)
      const capabilities = await this.getToolCapabilities(tool)
      
      return {
        toolId,
        tool: tool.tool,
        isAvailable,
        isConfigured: tool.isEnabled,
        lastChecked: new Date(),
        capabilities,
        limitations: this.getToolLimitations(tool.tool),
        healthStatus: isAvailable ? 'healthy' : 'warning',
        version: await this.getToolVersion(tool)
      }
    } catch (error) {
      return {
        toolId,
        tool: tool.tool,
        isAvailable: false,
        isConfigured: tool.isEnabled,
        lastChecked: new Date(),
        capabilities: [],
        limitations: ['Failed to check tool status'],
        healthStatus: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Manage API keys for tools
   */
  async addApiKey(toolId: string, keyConfig: Omit<ApiKeyConfig, 'id'>): Promise<ApiKeyConfig> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`)
    }

    const apiKey: ApiKeyConfig = {
      id: `key-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...keyConfig,
      isEncrypted: true,
      value: keyConfig.value ? await this.encryptValue(keyConfig.value) : undefined
    }

    if (!tool.apiKeys) {
      tool.apiKeys = []
    }
    
    tool.apiKeys.push(apiKey)
    tool.updatedAt = new Date()
    
    this.tools.set(toolId, tool)
    
    this.logEvent({
      id: `api-key-added-${Date.now()}`,
      toolId,
      eventType: 'config-change',
      status: 'success',
      message: `API key added: ${apiKey.name}`,
      timestamp: new Date()
    })

    return apiKey
  }

  /**
   * Get analytics for a tool
   */
  getToolAnalytics(toolId: string): IntegrationAnalytics | null {
    return this.analytics.get(toolId) || null
  }

  /**
   * Get all configured tools
   */
  getConfiguredTools(): ExternalToolConfig[] {
    return Array.from(this.tools.values())
  }

  /**
   * Update tool configuration
   */
  async updateToolConfiguration(toolId: string, updates: Partial<ExternalToolConfig>): Promise<ExternalToolConfig> {
    const tool = this.tools.get(toolId)
    if (!tool) {
      throw new Error(`Tool not found: ${toolId}`)
    }

    const updatedTool = {
      ...tool,
      ...updates,
      updatedAt: new Date()
    }

    this.tools.set(toolId, updatedTool)
    
    this.logEvent({
      id: `config-updated-${Date.now()}`,
      toolId,
      eventType: 'config-change',
      status: 'success',
      message: 'Tool configuration updated',
      timestamp: new Date()
    })

    return updatedTool
  }

  /**
   * Private helper methods
   */
  private async validateLaunchRequest(request: LaunchRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!request.toolId) {
      errors.push('Tool ID is required')
    }

    if (!request.projectId) {
      errors.push('Project ID is required')
    }

    if (!request.blueprint) {
      errors.push('Blueprint is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private async validateExportRequest(request: ExportRequest): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    if (!request.projectId) {
      errors.push('Project ID is required')
    }

    if (!request.blueprint) {
      errors.push('Blueprint is required')
    }

    if (!request.format) {
      errors.push('Export format is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  private async prepareLaunchContext(blueprint: any, tool: ExternalTool, prompts?: string[]): Promise<Record<string, any>> {
    const context: Record<string, any> = {
      blueprint,
      tool,
      timestamp: new Date().toISOString()
    }

    if (prompts && prompts.length > 0) {
      context.prompts = prompts
    }

    // Add tool-specific context
    switch (tool) {
      case ExternalTool.CURSOR:
        context.cursorConfig = {
          aiProvider: 'anthropic',
          model: 'claude-3-sonnet',
          temperature: 0.7
        }
        break
      
      case ExternalTool.VSCODE:
        context.vscodeConfig = {
          extensions: ['ms-vscode.vscode-typescript-next', 'esbenp.prettier-vscode'],
          settings: {
            'editor.formatOnSave': true,
            'editor.codeActionsOnSave': {
              'source.fixAll.eslint': true
            }
          }
        }
        break
    }

    return context
  }

  private async executeLaunch(tool: ExternalToolConfig, context: Record<string, any>, options?: any): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    switch (tool.integrationType) {
      case IntegrationType.URL_SCHEME:
        return this.launchViaUrlScheme(tool, context)
      
      case IntegrationType.API_INTEGRATION:
        return this.launchViaApi(tool, context)
      
      case IntegrationType.DIRECT_LAUNCH:
        return this.launchDirectly(tool, context)
      
      case IntegrationType.EXTENSION:
        return this.launchViaExtension(tool, context)
      
      default:
        throw new Error(`Unsupported integration type: ${tool.integrationType}`)
    }
  }

  private async launchViaUrlScheme(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    const baseUrl = tool.configuration.urlScheme || ''
    const projectPath = `/tmp/desenyon-project-${Date.now()}`
    
    // Create temporary project files
    await this.createTemporaryProject(projectPath, context.blueprint)
    
    const url = `${baseUrl}${projectPath}`
    
    return {
      url,
      projectUrl: url,
      workspaceId: `workspace-${Date.now()}`
    }
  }

  private async launchViaApi(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    // This would integrate with tool-specific APIs
    // For now, return a mock response
    return {
      url: `${tool.configuration.apiEndpoint}/workspace/new`,
      workspaceId: `api-workspace-${Date.now()}`
    }
  }

  private async launchDirectly(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    // This would execute the tool directly
    // For now, return a mock response
    return {
      url: `file://${tool.configuration.executablePath}`,
      workspaceId: `direct-workspace-${Date.now()}`
    }
  }

  private async launchViaExtension(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    // Handle extension-based tools like Claude Dev
    switch (tool.tool) {
      case ExternalTool.CLAUDE_DEV:
        return this.launchClaudeDev(tool, context)
      
      case ExternalTool.GITHUB_COPILOT:
        return this.launchGitHubCopilot(tool, context)
      
      default:
        throw new Error(`Extension launch not implemented for ${tool.tool}`)
    }
  }

  private async launchClaudeDev(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    // Create a VS Code workspace with Claude Dev extension
    const workspaceId = `claude-dev-${Date.now()}`
    const projectPath = `/tmp/desenyon-project-${workspaceId}`
    
    // Create project files
    await this.createTemporaryProject(projectPath, context.blueprint)
    
    // Create VS Code workspace file with Claude Dev settings
    const workspaceConfig = {
      folders: [{ path: projectPath }],
      settings: {
        ...tool.configuration.defaultSettings,
        'claude.autoStart': context.prompts && context.prompts.length > 0,
        'claude.initialPrompts': context.prompts || []
      },
      extensions: {
        recommendations: ['saoudrizwan.claude-dev']
      }
    }
    
    // In a real implementation, this would create the workspace file
    const workspaceFile = `${projectPath}/.vscode/workspace.json`
    
    return {
      url: `vscode://file${projectPath}`,
      projectUrl: `vscode://file${workspaceFile}`,
      workspaceId
    }
  }

  private async launchGitHubCopilot(tool: ExternalToolConfig, context: Record<string, any>): Promise<{
    url?: string
    projectUrl?: string
    workspaceId?: string
  }> {
    // GitHub Copilot integration through VS Code
    const workspaceId = `copilot-${Date.now()}`
    const projectPath = `/tmp/desenyon-project-${workspaceId}`
    
    // Create project files
    await this.createTemporaryProject(projectPath, context.blueprint)
    
    // Create VS Code settings for GitHub Copilot
    const vscodeSettings = {
      ...tool.configuration.defaultSettings,
      'github.copilot.chat.welcomeMessage': 'enabled',
      'github.copilot.chat.localeOverride': 'en'
    }
    
    return {
      url: `vscode://file${projectPath}`,
      projectUrl: `vscode://file${projectPath}`,
      workspaceId
    }
  }

  private async createTemporaryProject(path: string, blueprint: any): Promise<void> {
    // This would create actual project files
    // For now, this is a placeholder
    console.log(`Creating temporary project at ${path}`)
  }

  private async generateProjectStructure(blueprint: any): Promise<TemplateFile[]> {
    const files: TemplateFile[] = []

    // Generate package.json
    files.push({
      path: 'package.json',
      content: JSON.stringify({
        name: blueprint.productPlan?.name?.toLowerCase().replace(/\s+/g, '-') || 'desenyon-project',
        version: '1.0.0',
        description: blueprint.productPlan?.description || 'Generated by Desenyon InfiniteIdea',
        main: 'index.js',
        scripts: {
          dev: 'npm run dev',
          build: 'npm run build',
          start: 'npm start',
          test: 'npm test',
          lint: 'eslint . --ext .ts,.tsx,.js,.jsx',
          'type-check': 'tsc --noEmit'
        },
        dependencies: this.generateDependencies(blueprint.techStack),
        devDependencies: this.generateDevDependencies(blueprint.techStack),
        keywords: blueprint.productPlan?.keywords || ['desenyon', 'ai-generated'],
        author: 'Generated by Desenyon InfiniteIdea',
        license: 'MIT'
      }, null, 2),
      isTemplate: false
    })

    // Generate README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(blueprint),
      isTemplate: false
    })

    // Generate .gitignore
    files.push({
      path: '.gitignore',
      content: this.generateGitignore(blueprint.techStack),
      isTemplate: false
    })

    // Generate environment files
    files.push({
      path: '.env.example',
      content: this.generateEnvExample(blueprint),
      isTemplate: false
    })

    // Generate TypeScript config if needed
    if (this.usesTechnologies(blueprint.techStack, ['typescript', 'next.js', 'react'])) {
      files.push({
        path: 'tsconfig.json',
        content: this.generateTsConfig(blueprint.techStack),
        isTemplate: false
      })
    }

    // Generate ESLint config
    files.push({
      path: '.eslintrc.json',
      content: this.generateEslintConfig(blueprint.techStack),
      isTemplate: false
    })

    // Generate Prettier config
    files.push({
      path: '.prettierrc',
      content: JSON.stringify({
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 80,
        tabWidth: 2
      }, null, 2),
      isTemplate: false
    })

    // Generate basic project structure based on tech stack
    if (this.usesTechnologies(blueprint.techStack, ['next.js'])) {
      files.push(...this.generateNextJsFiles(blueprint))
    } else if (this.usesTechnologies(blueprint.techStack, ['react'])) {
      files.push(...this.generateReactFiles(blueprint))
    }

    if (this.usesTechnologies(blueprint.techStack, ['node.js', 'express', 'fastify'])) {
      files.push(...this.generateNodeFiles(blueprint))
    }

    // Generate database files if needed
    if (this.usesTechnologies(blueprint.techStack, ['prisma'])) {
      files.push(...this.generatePrismaFiles(blueprint))
    }

    // Generate Docker files if containerization is mentioned
    if (blueprint.techStack?.deployment?.some((tech: any) => 
      tech.name.toLowerCase().includes('docker') || 
      tech.name.toLowerCase().includes('container')
    )) {
      files.push(...this.generateDockerFiles(blueprint))
    }

    // Generate AI integration files if AI services are used
    if (blueprint.aiWorkflow || blueprint.techStack?.aiServices?.length > 0) {
      files.push(...this.generateAIIntegrationFiles(blueprint))
    }

    return files
  }

  private generateDependencies(techStack: any): Record<string, string> {
    const deps: Record<string, string> = {}

    if (techStack?.frontend) {
      techStack.frontend.forEach((tech: any) => {
        const name = tech.name.toLowerCase()
        if (name.includes('react')) {
          deps.react = '^18.0.0'
          deps['react-dom'] = '^18.0.0'
        }
        if (name.includes('next')) {
          deps.next = '^14.0.0'
        }
      })
    }

    if (techStack?.backend) {
      techStack.backend.forEach((tech: any) => {
        const name = tech.name.toLowerCase()
        if (name.includes('express')) {
          deps.express = '^4.18.0'
        }
        if (name.includes('fastify')) {
          deps.fastify = '^4.0.0'
        }
      })
    }

    return deps
  }

  private generateDevDependencies(techStack: any): Record<string, string> {
    const devDeps: Record<string, string> = {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      eslint: '^8.0.0',
      prettier: '^3.0.0'
    }

    return devDeps
  }

  private generateReadme(blueprint: any): string {
    return `# ${blueprint.productPlan?.name || 'Desenyon Project'}

${blueprint.productPlan?.description || 'Generated by Desenyon InfiniteIdea'}

## Features

${blueprint.productPlan?.coreFeatures?.map((feature: any) => `- ${feature.name}: ${feature.description}`).join('\n') || '- Feature list will be added here'}

## Tech Stack

### Frontend
${blueprint.techStack?.frontend?.map((tech: any) => `- ${tech.name}`).join('\n') || '- Frontend technologies will be listed here'}

### Backend
${blueprint.techStack?.backend?.map((tech: any) => `- ${tech.name}`).join('\n') || '- Backend technologies will be listed here'}

### Database
${blueprint.techStack?.database?.map((tech: any) => `- ${tech.name}`).join('\n') || '- Database technologies will be listed here'}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start development server:
   \`\`\`bash
   npm run dev
   \`\`\`

3. Open your browser and navigate to the development URL

## Development

This project was generated using Desenyon InfiniteIdea. For more information about the architecture and implementation details, refer to the generated documentation.

## License

MIT
`
  }

  private generateReactFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>${blueprint.productPlan?.name || 'Desenyon Project'}</h1>
        <p>${blueprint.productPlan?.description || 'Welcome to your new project!'}</p>
      </header>
    </div>
  );
}

export default App;`,
        isTemplate: false
      },
      {
        path: 'src/index.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
        isTemplate: false
      }
    ]
  }

  private generateNodeFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'src/server.ts',
        content: `import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ${blueprint.productPlan?.name || 'Desenyon Project'}',
    description: '${blueprint.productPlan?.description || 'API server is running'}'
  });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        isTemplate: false
      }
    ]
  }

  private async createExportPackage(files: TemplateFile[], format: any, options?: any): Promise<{
    downloadUrl: string
    fileName: string
    fileSize: number
  }> {
    // This would create the actual export package
    // For now, return mock data
    const fileName = `project-export-${Date.now()}.${format === 'zip' ? 'zip' : 'tar.gz'}`
    
    return {
      downloadUrl: `/api/exports/${fileName}`,
      fileName,
      fileSize: files.reduce((size, file) => size + file.content.length, 0)
    }
  }

  private async createSession(toolId: string, projectId: string, userId: string, launchResult: any): Promise<ToolSession> {
    const session: ToolSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      toolId,
      projectId,
      userId,
      status: 'active',
      startedAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      metadata: {
        tool: this.tools.get(toolId)?.tool || ExternalTool.CUSTOM,
        workspaceUrl: launchResult.url,
        sessionData: launchResult
      }
    }

    this.sessions.set(session.id, session)
    return session
  }

  private trackLaunchEvent(toolId: string, success: boolean, duration: number): void {
    let analytics = this.analytics.get(toolId)
    if (!analytics) {
      const tool = this.tools.get(toolId)
      if (tool) {
        analytics = this.initializeAnalytics(toolId, tool.tool)
      } else {
        return
      }
    }

    analytics.usage.totalLaunches += 1
    if (success) {
      analytics.usage.successfulLaunches += 1
    } else {
      analytics.usage.failedLaunches += 1
    }
    analytics.usage.lastUsed = new Date()
    analytics.usage.averageSetupTime = (analytics.usage.averageSetupTime + duration) / 2

    this.analytics.set(toolId, analytics)
  }

  private initializeAnalytics(toolId: string, tool: ExternalTool): IntegrationAnalytics {
    const analytics: IntegrationAnalytics = {
      toolId,
      tool,
      usage: {
        totalLaunches: 0,
        successfulLaunches: 0,
        failedLaunches: 0,
        averageSetupTime: 0,
        lastUsed: new Date()
      },
      performance: {
        averageResponseTime: 0,
        uptime: 100,
        errorRate: 0
      },
      userFeedback: {
        averageRating: 0,
        totalRatings: 0,
        commonIssues: [],
        suggestions: []
      }
    }

    this.analytics.set(toolId, analytics)
    return analytics
  }

  private logEvent(event: ToolIntegrationEvent): void {
    this.events.push(event)
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
  }

  private async checkToolAvailability(tool: ExternalToolConfig): Promise<boolean> {
    // This would check if the tool is actually available
    // For now, return true for enabled tools
    return tool.isEnabled
  }

  private async getToolCapabilities(tool: ExternalToolConfig): Promise<any[]> {
    // Return tool-specific capabilities
    const capabilities = []
    
    switch (tool.tool) {
      case ExternalTool.CURSOR:
        capabilities.push(
          { name: 'AI Code Generation', description: 'Generate code with AI assistance', isSupported: true },
          { name: 'Multi-file Editing', description: 'Edit multiple files simultaneously', isSupported: true },
          { name: 'Terminal Integration', description: 'Integrated terminal support', isSupported: true }
        )
        break
      
      case ExternalTool.VSCODE:
        capabilities.push(
          { name: 'Extension Support', description: 'Rich extension ecosystem', isSupported: true },
          { name: 'Debugging', description: 'Built-in debugging support', isSupported: true },
          { name: 'Git Integration', description: 'Integrated Git support', isSupported: true }
        )
        break
    }
    
    return capabilities
  }

  private getToolLimitations(tool: ExternalTool): string[] {
    switch (tool) {
      case ExternalTool.CURSOR:
        return ['Requires Cursor IDE installation', 'AI features require API keys']
      
      case ExternalTool.VSCODE:
        return ['Requires VS Code installation', 'Some features require extensions']
      
      default:
        return ['Tool-specific limitations may apply']
    }
  }

  private async getToolVersion(tool: ExternalToolConfig): Promise<string | undefined> {
    // This would check the actual tool version
    // For now, return a mock version
    return '1.0.0'
  }

  private estimateSetupTime(tool: ExternalTool, blueprint: any): number {
    // Estimate setup time in seconds based on tool and project complexity
    const baseTime = {
      [ExternalTool.CURSOR]: 30,
      [ExternalTool.VSCODE]: 45,
      [ExternalTool.GITHUB_COPILOT]: 20,
      [ExternalTool.CLAUDE_DEV]: 25
    }

    const base = baseTime[tool] || 60
    const complexity = blueprint.productPlan?.coreFeatures?.length || 1
    
    return base + (complexity * 10)
  }

  private async encryptValue(value: string): Promise<string> {
    // This would use proper encryption
    // For now, return base64 encoded value
    return Buffer.from(value).toString('base64')
  }



  // Helper methods for project generation
  private usesTechnologies(techStack: any, technologies: string[]): boolean {
    if (!techStack) return false
    
    const allTechs = [
      ...(techStack.frontend || []),
      ...(techStack.backend || []),
      ...(techStack.database || []),
      ...(techStack.deployment || []),
      ...(techStack.aiServices || [])
    ]
    
    return technologies.some(tech => 
      allTechs.some((stackTech: any) => 
        stackTech.name?.toLowerCase().includes(tech.toLowerCase())
      )
    )
  }

  private generateGitignore(techStack: any): string {
    const gitignoreLines = [
      '# Dependencies',
      'node_modules/',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '',
      '# Production builds',
      'build/',
      'dist/',
      '.next/',
      'out/',
      '',
      '# Environment variables',
      '.env',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
      '.env.production.local',
      '',
      '# IDE files',
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '*~',
      '',
      '# OS generated files',
      '.DS_Store',
      '.DS_Store?',
      '._*',
      '.Spotlight-V100',
      '.Trashes',
      'ehthumbs.db',
      'Thumbs.db',
      '',
      '# Logs',
      'logs/',
      '*.log',
      '',
      '# Runtime data',
      'pids/',
      '*.pid',
      '*.seed',
      '*.pid.lock'
    ]

    // Add tech-specific ignores
    if (this.usesTechnologies(techStack, ['prisma'])) {
      gitignoreLines.push('', '# Database', 'prisma/dev.db', 'prisma/migrations/dev.db')
    }

    if (this.usesTechnologies(techStack, ['docker'])) {
      gitignoreLines.push('', '# Docker', '.dockerignore')
    }

    return gitignoreLines.join('\n')
  }

  private generateEnvExample(blueprint: any): string {
    const envVars = [
      '# Database',
      'DATABASE_URL="postgresql://username:password@localhost:5432/database"',
      '',
      '# API Keys',
      'OPENAI_API_KEY="your-openai-api-key"',
      'ANTHROPIC_API_KEY="your-anthropic-api-key"',
      '',
      '# Application',
      'NEXTAUTH_SECRET="your-nextauth-secret"',
      'NEXTAUTH_URL="http://localhost:3000"'
    ]

    // Add AI service specific env vars
    if (blueprint.techStack?.aiServices?.length > 0) {
      envVars.push('', '# AI Services')
      blueprint.techStack.aiServices.forEach((service: any) => {
        const serviceName = service.name.toUpperCase().replace(/\s+/g, '_')
        envVars.push(`${serviceName}_API_KEY="your-${service.name.toLowerCase().replace(/\s+/g, '-')}-api-key"`)
      })
    }

    return envVars.join('\n')
  }

  private generateTsConfig(techStack: any): string {
    const config = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'es6'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'node',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        plugins: [
          {
            name: 'next'
          }
        ],
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
      exclude: ['node_modules']
    }

    return JSON.stringify(config, null, 2)
  }

  private generateEslintConfig(techStack: any): string {
    const config = {
      extends: [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        'next/core-web-vitals'
      ],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/no-explicit-any': 'warn',
        'prefer-const': 'error'
      }
    }

    return JSON.stringify(config, null, 2)
  }

  private generateNextJsFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'src/app/layout.tsx',
        content: `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${blueprint.productPlan?.name || 'Desenyon Project'}',
  description: '${blueprint.productPlan?.description || 'Generated by Desenyon InfiniteIdea'}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}`,
        isTemplate: false
      },
      {
        path: 'src/app/page.tsx',
        content: `export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          ${blueprint.productPlan?.name || 'Desenyon Project'}
        </h1>
        <p className="text-xl text-center text-gray-600 mb-8">
          ${blueprint.productPlan?.description || 'Welcome to your new project!'}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${blueprint.productPlan?.coreFeatures?.slice(0, 3).map((feature: any) => `
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">${feature.name}</h3>
            <p className="text-gray-600">${feature.description}</p>
          </div>`).join('') || `
          <div className="p-6 border rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Feature 1</h3>
            <p className="text-gray-600">Add your features here</p>
          </div>`}
        </div>
      </div>
    </main>
  )
}`,
        isTemplate: false
      },
      {
        path: 'src/app/globals.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}`,
        isTemplate: false
      }
    ]
  }

  private generatePrismaFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'prisma/schema.prisma',
        content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

// Add your models here based on your blueprint
`,
        isTemplate: false
      }
    ]
  }

  private generateDockerFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'Dockerfile',
        content: `FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]`,
        isTemplate: false
      },
      {
        path: 'docker-compose.yml',
        content: `version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=myapp
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:`,
        isTemplate: false
      }
    ]
  }

  private generateAIIntegrationFiles(blueprint: any): TemplateFile[] {
    return [
      {
        path: 'src/lib/ai-client.ts',
        content: `import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateCompletion(prompt: string) {
  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-3.5-turbo',
    })

    return completion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('AI completion error:', error)
    throw error
  }
}

export { openai }`,
        isTemplate: false
      },
      {
        path: 'src/app/api/ai/route.ts',
        content: `import { NextRequest, NextResponse } from 'next/server'
import { generateCompletion } from '@/lib/ai-client'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const completion = await generateCompletion(prompt)

    return NextResponse.json({ completion })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}`,
        isTemplate: false
      }
    ]
  }
}