import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ToolIntegrationService } from '../external-tools/tool-integration-service'
import { ExternalTool, ProjectExportFormat, IntegrationType } from '@/types/external-tools'

describe('ToolIntegrationService', () => {
  let service: ToolIntegrationService

  beforeEach(() => {
    service = new ToolIntegrationService()
  })

  describe('Tool Configuration', () => {
    it('should initialize with default tools', () => {
      const tools = service.getConfiguredTools()
      
      expect(tools.length).toBeGreaterThan(0)
      expect(tools.some(tool => tool.tool === ExternalTool.CURSOR)).toBe(true)
      expect(tools.some(tool => tool.tool === ExternalTool.VSCODE)).toBe(true)
      expect(tools.some(tool => tool.tool === ExternalTool.GITHUB_COPILOT)).toBe(true)
      expect(tools.some(tool => tool.tool === ExternalTool.CLAUDE_DEV)).toBe(true)
    })

    it('should have proper configuration for Cursor', () => {
      const tools = service.getConfiguredTools()
      const cursorTool = tools.find(tool => tool.tool === ExternalTool.CURSOR)
      
      expect(cursorTool).toBeDefined()
      expect(cursorTool?.integrationType).toBe(IntegrationType.URL_SCHEME)
      expect(cursorTool?.configuration.urlScheme).toBe('cursor://file')
      expect(cursorTool?.launchOptions.includeProjectContext).toBe(true)
      expect(cursorTool?.launchOptions.preloadPrompts).toBe(true)
    })

    it('should have proper configuration for GitHub Copilot', () => {
      const tools = service.getConfiguredTools()
      const copilotTool = tools.find(tool => tool.tool === ExternalTool.GITHUB_COPILOT)
      
      expect(copilotTool).toBeDefined()
      expect(copilotTool?.integrationType).toBe(IntegrationType.API_INTEGRATION)
      expect(copilotTool?.configuration.apiEndpoint).toBe('https://api.github.com/copilot')
      expect(copilotTool?.launchOptions.autoStartCoding).toBe(true)
    })
  })

  describe('Tool Status', () => {
    it('should get tool status for existing tool', async () => {
      const tools = service.getConfiguredTools()
      const firstTool = tools[0]
      
      const status = await service.getToolStatus(firstTool.id)
      
      expect(status.toolId).toBe(firstTool.id)
      expect(status.tool).toBe(firstTool.tool)
      expect(status.capabilities).toBeDefined()
      expect(status.limitations).toBeDefined()
      expect(status.healthStatus).toBeDefined()
    })

    it('should return error status for non-existent tool', async () => {
      const status = await service.getToolStatus('non-existent-tool')
      
      expect(status.isAvailable).toBe(false)
      expect(status.healthStatus).toBe('error')
      expect(status.errorMessage).toBe('Tool configuration not found')
    })
  })

  describe('Tool Launch', () => {
    const mockBlueprint = {
      productPlan: {
        name: 'Test Project',
        description: 'A test project for external tool integration',
        coreFeatures: [
          { name: 'Feature 1', description: 'First feature' },
          { name: 'Feature 2', description: 'Second feature' }
        ]
      },
      techStack: {
        frontend: [{ name: 'React' }],
        backend: [{ name: 'Node.js' }],
        database: [{ name: 'PostgreSQL' }]
      }
    }

    it('should launch tool successfully', async () => {
      const tools = service.getConfiguredTools()
      const cursorTool = tools.find(tool => tool.tool === ExternalTool.CURSOR)
      
      if (!cursorTool) {
        throw new Error('Cursor tool not found')
      }

      const launchRequest = {
        toolId: cursorTool.id,
        projectId: 'test-project-id',
        blueprint: mockBlueprint,
        prompts: ['Create a React component', 'Add TypeScript support'],
        options: cursorTool.launchOptions
      }

      const response = await service.launchTool(launchRequest)
      
      expect(response.success).toBe(true)
      expect(response.toolUrl).toBeDefined()
      expect(response.sessionId).toBeDefined()
      expect(response.metadata?.tool).toBe(ExternalTool.CURSOR)
    })

    it('should fail launch for invalid tool', async () => {
      const launchRequest = {
        toolId: 'invalid-tool-id',
        projectId: 'test-project-id',
        blueprint: mockBlueprint
      }

      const response = await service.launchTool(launchRequest)
      
      expect(response.success).toBe(false)
      expect(response.error).toBe('Tool not found: invalid-tool-id')
    })

    it('should validate launch request', async () => {
      const invalidRequest = {
        toolId: '',
        projectId: '',
        blueprint: null
      }

      const response = await service.launchTool(invalidRequest as any)
      
      expect(response.success).toBe(false)
      expect(response.error).toContain('Tool not found')
    })
  })

  describe('Project Export', () => {
    const mockBlueprint = {
      productPlan: {
        name: 'Test Export Project',
        description: 'A project for testing export functionality'
      },
      techStack: {
        frontend: [{ name: 'Next.js' }, { name: 'React' }, { name: 'TypeScript' }],
        backend: [{ name: 'Node.js' }],
        database: [{ name: 'Prisma' }, { name: 'PostgreSQL' }]
      }
    }

    it('should export project successfully', async () => {
      const exportRequest = {
        projectId: 'test-project-id',
        blueprint: mockBlueprint,
        format: ProjectExportFormat.ZIP,
        options: {
          format: ProjectExportFormat.ZIP,
          includeFiles: ['**/*'],
          excludeFiles: ['node_modules/**'],
          includePrompts: true,
          includeDocumentation: true,
          includeTests: true
        }
      }

      const response = await service.exportProject(exportRequest)
      
      expect(response.success).toBe(true)
      expect(response.downloadUrl).toBeDefined()
      expect(response.fileName).toBeDefined()
      expect(response.metadata?.format).toBe(ProjectExportFormat.ZIP)
    })

    it('should generate proper project structure', async () => {
      const files = await (service as any).generateProjectStructure(mockBlueprint)
      
      expect(files.length).toBeGreaterThan(0)
      
      // Check for essential files
      const packageJson = files.find((f: any) => f.path === 'package.json')
      const readme = files.find((f: any) => f.path === 'README.md')
      const gitignore = files.find((f: any) => f.path === '.gitignore')
      const tsconfig = files.find((f: any) => f.path === 'tsconfig.json')
      
      expect(packageJson).toBeDefined()
      expect(readme).toBeDefined()
      expect(gitignore).toBeDefined()
      expect(tsconfig).toBeDefined()
      
      // Check package.json content
      const packageContent = JSON.parse(packageJson.content)
      expect(packageContent.name).toBe('test-export-project')
      expect(packageContent.dependencies).toBeDefined()
      expect(packageContent.devDependencies).toBeDefined()
    })

    it('should include Next.js files for Next.js projects', async () => {
      const files = await (service as any).generateProjectStructure(mockBlueprint)
      
      const layoutFile = files.find((f: any) => f.path === 'src/app/layout.tsx')
      const pageFile = files.find((f: any) => f.path === 'src/app/page.tsx')
      const globalsFile = files.find((f: any) => f.path === 'src/app/globals.css')
      
      expect(layoutFile).toBeDefined()
      expect(pageFile).toBeDefined()
      expect(globalsFile).toBeDefined()
    })

    it('should include Prisma files when Prisma is in tech stack', async () => {
      const files = await (service as any).generateProjectStructure(mockBlueprint)
      
      const prismaSchema = files.find((f: any) => f.path === 'prisma/schema.prisma')
      expect(prismaSchema).toBeDefined()
    })
  })

  describe('API Key Management', () => {
    it('should add API key successfully', async () => {
      const tools = service.getConfiguredTools()
      const firstTool = tools[0]
      
      const keyConfig = {
        name: 'Test API Key',
        description: 'A test API key',
        keyType: 'api-key' as const,
        isRequired: false,
        isEncrypted: false,
        value: 'test-api-key-value'
      }

      const apiKey = await service.addApiKey(firstTool.id, keyConfig)
      
      expect(apiKey.id).toBeDefined()
      expect(apiKey.name).toBe('Test API Key')
      expect(apiKey.isEncrypted).toBe(true)
      expect(apiKey.value).not.toBe('test-api-key-value') // Should be encrypted
    })

    it('should fail to add API key for non-existent tool', async () => {
      const keyConfig = {
        name: 'Test API Key',
        description: 'A test API key',
        keyType: 'api-key' as const,
        isRequired: false,
        isEncrypted: false,
        value: 'test-api-key-value'
      }

      await expect(service.addApiKey('non-existent-tool', keyConfig))
        .rejects.toThrow('Tool not found: non-existent-tool')
    })
  })

  describe('Tool Analytics', () => {
    it('should track launch events', async () => {
      const tools = service.getConfiguredTools()
      const firstTool = tools[0]
      
      // Perform a launch to generate analytics
      const launchRequest = {
        toolId: firstTool.id,
        projectId: 'test-project-id',
        blueprint: { productPlan: { name: 'Test' } }
      }

      await service.launchTool(launchRequest)
      
      const analytics = service.getToolAnalytics(firstTool.id)
      
      expect(analytics).toBeDefined()
      expect(analytics?.usage.totalLaunches).toBeGreaterThan(0)
      expect(analytics?.tool).toBe(firstTool.tool)
    })

    it('should return null for non-existent tool analytics', () => {
      const analytics = service.getToolAnalytics('non-existent-tool')
      expect(analytics).toBeNull()
    })
  })
})