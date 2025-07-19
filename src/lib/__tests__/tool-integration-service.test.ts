import { describe, it, expect, beforeEach } from 'vitest'
import { ToolIntegrationService } from '../external-tools/tool-integration-service'
import {
  ExternalTool,
  LaunchRequest,
  ExportRequest,
  ProjectExportFormat,
  ApiKeyConfig
} from '@/types/external-tools'

describe('ToolIntegrationService', () => {
  let service: ToolIntegrationService

  beforeEach(() => {
    service = new ToolIntegrationService()
  })

  describe('launchTool', () => {
    it('should launch a tool successfully', async () => {
      const request: LaunchRequest = {
        toolId: 'cursor-default',
        projectId: 'test-project',
        blueprint: {
          productPlan: {
            name: 'Test Project',
            coreFeatures: [
              { name: 'Authentication', description: 'User login system' }
            ]
          },
          techStack: {
            frontend: [{ name: 'React' }],
            backend: [{ name: 'Node.js' }],
            database: [{ name: 'PostgreSQL' }]
          }
        },
        prompts: ['Create a login component'],
        options: {
          openInNewWindow: true,
          includeProjectContext: true,
          preloadPrompts: true,
          autoStartCoding: false
        }
      }

      const response = await service.launchTool(request)

      expect(response.success).toBe(true)
      expect(response.toolUrl).toBeDefined()
      expect(response.sessionId).toBeDefined()
      expect(response.metadata).toBeDefined()
      expect(response.metadata?.tool).toBe(ExternalTool.CURSOR)
      expect(response.metadata?.projectId).toBe('test-project')
    })

    it('should fail to launch non-existent tool', async () => {
      const request: LaunchRequest = {
        toolId: 'non-existent-tool',
        projectId: 'test-project',
        blueprint: {},
        prompts: []
      }

      const response = await service.launchTool(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('Tool not found')
    })

    it('should validate launch request', async () => {
      const request: LaunchRequest = {
        toolId: '',
        projectId: '',
        blueprint: null as any,
        prompts: []
      }

      const response = await service.launchTool(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('Tool not found')
    })
  })

  describe('exportProject', () => {
    it('should export project successfully', async () => {
      const request: ExportRequest = {
        projectId: 'test-project',
        blueprint: {
          productPlan: {
            name: 'Test Project',
            description: 'A test project',
            coreFeatures: [
              { name: 'Authentication', description: 'User login' }
            ]
          },
          techStack: {
            frontend: [{ name: 'React' }],
            backend: [{ name: 'Node.js' }],
            database: [{ name: 'PostgreSQL' }]
          }
        },
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

      const response = await service.exportProject(request)

      expect(response.success).toBe(true)
      expect(response.downloadUrl).toBeDefined()
      expect(response.fileName).toBeDefined()
      expect(response.fileSize).toBeGreaterThan(0)
      expect(response.metadata).toBeDefined()
      expect(response.metadata?.format).toBe(ProjectExportFormat.ZIP)
      expect(response.metadata?.projectId).toBe('test-project')
    })

    it('should validate export request', async () => {
      const request: ExportRequest = {
        projectId: '',
        blueprint: null as any,
        format: ProjectExportFormat.ZIP
      }

      const response = await service.exportProject(request)

      expect(response.success).toBe(false)
      expect(response.error).toContain('Invalid export request')
    })
  })

  describe('getToolStatus', () => {
    it('should return status for existing tool', async () => {
      const status = await service.getToolStatus('cursor-default')

      expect(status.toolId).toBe('cursor-default')
      expect(status.tool).toBe(ExternalTool.CURSOR)
      expect(status.isConfigured).toBe(true)
      expect(status.capabilities).toBeDefined()
      expect(status.capabilities.length).toBeGreaterThan(0)
      expect(status.lastChecked).toBeInstanceOf(Date)
    })

    it('should return error status for non-existent tool', async () => {
      const status = await service.getToolStatus('non-existent')

      expect(status.toolId).toBe('non-existent')
      expect(status.isAvailable).toBe(false)
      expect(status.healthStatus).toBe('error')
      expect(status.errorMessage).toContain('Tool configuration not found')
    })
  })

  describe('addApiKey', () => {
    it('should add API key successfully', async () => {
      const keyConfig: Omit<ApiKeyConfig, 'id'> = {
        name: 'Test API Key',
        description: 'A test API key',
        keyType: 'api-key',
        isRequired: false,
        isEncrypted: false,
        value: 'test-api-key-value',
        scopes: ['read', 'write']
      }

      const apiKey = await service.addApiKey('cursor-default', keyConfig)

      expect(apiKey.id).toBeDefined()
      expect(apiKey.name).toBe('Test API Key')
      expect(apiKey.keyType).toBe('api-key')
      expect(apiKey.isEncrypted).toBe(true)
      expect(apiKey.scopes).toEqual(['read', 'write'])
    })

    it('should fail to add API key to non-existent tool', async () => {
      const keyConfig: Omit<ApiKeyConfig, 'id'> = {
        name: 'Test API Key',
        description: 'A test API key',
        keyType: 'api-key',
        isRequired: false,
        isEncrypted: false,
        value: 'test-api-key-value'
      }

      await expect(service.addApiKey('non-existent', keyConfig))
        .rejects.toThrow('Tool not found')
    })
  })

  describe('getToolAnalytics', () => {
    it('should return analytics for tool', () => {
      const analytics = service.getToolAnalytics('cursor-default')

      expect(analytics).toBeDefined()
      expect(analytics?.toolId).toBe('cursor-default')
      expect(analytics?.tool).toBe(ExternalTool.CURSOR)
      expect(analytics?.usage).toBeDefined()
      expect(analytics?.performance).toBeDefined()
      expect(analytics?.userFeedback).toBeDefined()
    })

    it('should return null for non-existent tool', () => {
      const analytics = service.getToolAnalytics('non-existent')
      expect(analytics).toBeNull()
    })
  })

  describe('getConfiguredTools', () => {
    it('should return list of configured tools', () => {
      const tools = service.getConfiguredTools()

      expect(tools).toBeDefined()
      expect(tools.length).toBeGreaterThan(0)
      expect(tools[0]).toHaveProperty('id')
      expect(tools[0]).toHaveProperty('name')
      expect(tools[0]).toHaveProperty('tool')
      expect(tools[0]).toHaveProperty('isEnabled')
    })
  })

  describe('updateToolConfiguration', () => {
    it('should update tool configuration', async () => {
      const updates = {
        name: 'Updated Cursor IDE',
        isEnabled: false
      }

      const updatedTool = await service.updateToolConfiguration('cursor-default', updates)

      expect(updatedTool.name).toBe('Updated Cursor IDE')
      expect(updatedTool.isEnabled).toBe(false)
      expect(updatedTool.updatedAt).toBeInstanceOf(Date)
    })

    it('should fail to update non-existent tool', async () => {
      const updates = { name: 'Updated Tool' }

      await expect(service.updateToolConfiguration('non-existent', updates))
        .rejects.toThrow('Tool not found')
    })
  })

  describe('project structure generation', () => {
    it('should generate React project structure', async () => {
      const blueprint = {
        productPlan: {
          name: 'React App',
          description: 'A React application'
        },
        techStack: {
          frontend: [{ name: 'React' }],
          backend: [{ name: 'Node.js' }],
          database: [{ name: 'PostgreSQL' }]
        }
      }

      // Access private method through any cast for testing
      const files = await (service as any).generateProjectStructure(blueprint)

      expect(files).toBeDefined()
      expect(files.length).toBeGreaterThan(0)
      
      const packageJson = files.find((f: any) => f.path === 'package.json')
      expect(packageJson).toBeDefined()
      expect(packageJson.content).toContain('react-app')
      
      const readme = files.find((f: any) => f.path === 'README.md')
      expect(readme).toBeDefined()
      expect(readme.content).toContain('React App')
      
      const appTsx = files.find((f: any) => f.path === 'src/App.tsx')
      expect(appTsx).toBeDefined()
      expect(appTsx.content).toContain('React')
    })

    it('should generate Node.js project structure', async () => {
      const blueprint = {
        productPlan: {
          name: 'Node API',
          description: 'A Node.js API'
        },
        techStack: {
          frontend: [],
          backend: [{ name: 'Node.js', name2: 'Express' }],
          database: [{ name: 'PostgreSQL' }]
        }
      }

      const files = await (service as any).generateProjectStructure(blueprint)

      expect(files).toBeDefined()
      expect(files.length).toBeGreaterThan(0)
      
      const serverTs = files.find((f: any) => f.path === 'src/server.ts')
      expect(serverTs).toBeDefined()
      expect(serverTs.content).toContain('express')
    })
  })

  describe('dependency generation', () => {
    it('should generate correct dependencies for React project', () => {
      const techStack = {
        frontend: [{ name: 'React' }, { name: 'TypeScript' }],
        backend: [{ name: 'Node.js' }]
      }

      const deps = (service as any).generateDependencies(techStack)

      expect(deps.react).toBeDefined()
      expect(deps['react-dom']).toBeDefined()
    })

    it('should generate correct dependencies for Next.js project', () => {
      const techStack = {
        frontend: [{ name: 'Next.js' }]
      }

      const deps = (service as any).generateDependencies(techStack)

      expect(deps.next).toBeDefined()
    })

    it('should generate correct dev dependencies', () => {
      const techStack = {
        frontend: [{ name: 'React' }]
      }

      const devDeps = (service as any).generateDevDependencies(techStack)

      expect(devDeps.typescript).toBeDefined()
      expect(devDeps['@types/node']).toBeDefined()
      expect(devDeps.eslint).toBeDefined()
      expect(devDeps.prettier).toBeDefined()
    })
  })
})