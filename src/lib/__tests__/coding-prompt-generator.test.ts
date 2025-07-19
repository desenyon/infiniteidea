import { describe, it, expect, beforeEach } from 'vitest'
import { CodingPromptGenerator } from '../ai-services/coding-prompt-generator'
import { PromptValidator } from '../ai-services/prompt-validator'
import { PromptVersionControl } from '../ai-services/prompt-version-control'
import {
  CodingTool,
  PromptCategory,
  DifficultyLevel,
  PromptGenerationRequest
} from '@/types/coding-prompts'

describe('CodingPromptGenerator', () => {
  let generator: CodingPromptGenerator
  let validator: PromptValidator
  let versionControl: PromptVersionControl

  beforeEach(() => {
    generator = new CodingPromptGenerator()
    validator = new PromptValidator()
    versionControl = new PromptVersionControl()
  })

  describe('generatePrompts', () => {
    it('should generate prompts based on blueprint and preferences', async () => {
      const request: PromptGenerationRequest = {
        projectId: 'test-project',
        blueprint: {
          productPlan: {
            coreFeatures: [
              { name: 'User Authentication', description: 'Login and registration' },
              { name: 'Dashboard', description: 'User dashboard with analytics' }
            ]
          },
          techStack: {
            frontend: [{ name: 'React' }, { name: 'TypeScript' }],
            backend: [{ name: 'Node.js' }, { name: 'Express' }],
            database: [{ name: 'PostgreSQL' }],
            aiServices: [{ name: 'OpenAI GPT-4' }],
            deployment: [{ platform: 'Vercel' }]
          }
        },
        preferences: {
          tool: CodingTool.CURSOR,
          difficulty: DifficultyLevel.INTERMEDIATE,
          categories: [PromptCategory.SETUP, PromptCategory.FEATURE],
          includeContext: true,
          optimizeForTool: true
        }
      }

      const response = await generator.generatePrompts(request)

      expect(response.prompts).toBeDefined()
      expect(response.prompts.length).toBeGreaterThan(0)
      expect(response.metadata.totalGenerated).toBe(response.prompts.length)
      expect(response.context).toBeDefined()
      expect(response.context.techStack.frontend).toContain('React')
      expect(response.context.techStack.backend).toContain('Node.js')
    })

    it('should filter prompts by tool compatibility', async () => {
      const request: PromptGenerationRequest = {
        projectId: 'test-project',
        blueprint: {
          productPlan: { coreFeatures: [] },
          techStack: {
            frontend: [{ name: 'React' }],
            backend: [{ name: 'Node.js' }],
            database: [{ name: 'PostgreSQL' }],
            aiServices: [],
            deployment: [{ platform: 'Vercel' }]
          }
        },
        preferences: {
          tool: CodingTool.GITHUB_COPILOT,
          difficulty: DifficultyLevel.BEGINNER,
          categories: [],
          includeContext: true,
          optimizeForTool: false
        }
      }

      const response = await generator.generatePrompts(request)

      // All generated prompts should support GitHub Copilot
      response.prompts.forEach(prompt => {
        expect(prompt.tool).toBe(CodingTool.GITHUB_COPILOT)
      })
    })

    it('should include custom instructions when provided', async () => {
      const customInstructions = 'Use strict TypeScript and include comprehensive error handling'
      
      const request: PromptGenerationRequest = {
        projectId: 'test-project',
        blueprint: {
          productPlan: { coreFeatures: [] },
          techStack: {
            frontend: [{ name: 'React' }],
            backend: [{ name: 'Node.js' }],
            database: [{ name: 'PostgreSQL' }],
            aiServices: [],
            deployment: [{ platform: 'Vercel' }]
          }
        },
        preferences: {
          tool: CodingTool.CURSOR,
          difficulty: DifficultyLevel.INTERMEDIATE,
          categories: [PromptCategory.SETUP],
          includeContext: true,
          optimizeForTool: false
        },
        customInstructions
      }

      const response = await generator.generatePrompts(request)

      expect(response.prompts.length).toBeGreaterThan(0)
      expect(response.prompts[0].prompt).toContain(customInstructions)
    })

    it('should optimize prompts for specific tools when requested', async () => {
      const request: PromptGenerationRequest = {
        projectId: 'test-project',
        blueprint: {
          productPlan: { coreFeatures: [] },
          techStack: {
            frontend: [{ name: 'React' }],
            backend: [{ name: 'Node.js' }],
            database: [{ name: 'PostgreSQL' }],
            aiServices: [],
            deployment: [{ platform: 'Vercel' }]
          }
        },
        preferences: {
          tool: CodingTool.CURSOR,
          difficulty: DifficultyLevel.INTERMEDIATE,
          categories: [PromptCategory.SETUP],
          includeContext: true,
          optimizeForTool: true
        }
      }

      const response = await generator.generatePrompts(request)

      expect(response.prompts.length).toBeGreaterThan(0)
      // Should contain Cursor-specific instructions
      expect(response.prompts[0].prompt).toContain('Cursor')
    })
  })

  describe('validatePrompt', () => {
    it('should validate generated prompts correctly', () => {
      const prompt = {
        id: 'test-prompt',
        templateId: 'project-setup',
        title: 'Project Setup',
        description: 'Initialize a new project',
        prompt: `# Project Setup
        
## Context
This is a test prompt for project setup.

## Task
Create a new project with the following requirements:
- Use React for frontend
- Use Node.js for backend
- Include proper testing setup

## Requirements
1. Initialize package.json
2. Set up folder structure
3. Configure development environment`,
        context: {
          techStack: {
            frontend: ['React'],
            backend: ['Node.js'],
            database: ['PostgreSQL'],
            aiServices: [],
            deployment: ['Vercel']
          },
          features: ['Authentication', 'Dashboard'],
          architecture: 'SPA + API',
          codeStyle: {
            language: 'typescript',
            conventions: {
              naming: 'camelCase' as const,
              indentation: 'spaces' as const,
              indentSize: 2,
              quotes: 'single' as const,
              semicolons: true
            },
            patterns: ['MVC'],
            linting: { enabled: true, rules: [] },
            formatting: { enabled: true, tool: 'prettier' }
          }
        },
        tool: CodingTool.CURSOR,
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedTime: 120,
        tags: ['setup', 'initialization'],
        generatedAt: new Date(),
        projectId: 'test-project',
        userId: 'test-user'
      }

      const validation = generator.validatePrompt(prompt)

      expect(validation.isValid).toBe(true)
      expect(validation.score).toBeGreaterThan(70)
      expect(validation.errors).toHaveLength(0)
    })

    it('should identify validation errors in poor prompts', () => {
      const poorPrompt = {
        id: 'poor-prompt',
        templateId: 'test',
        title: '',
        description: '',
        prompt: 'Do something',
        context: {
          techStack: {
            frontend: [],
            backend: [],
            database: [],
            aiServices: [],
            deployment: []
          },
          features: [],
          architecture: '',
          codeStyle: {
            language: 'javascript',
            conventions: {
              naming: 'camelCase' as const,
              indentation: 'spaces' as const,
              indentSize: 2,
              quotes: 'single' as const,
              semicolons: true
            },
            patterns: [],
            linting: { enabled: false, rules: [] },
            formatting: { enabled: false, tool: '' }
          }
        },
        tool: CodingTool.CURSOR,
        difficulty: DifficultyLevel.BEGINNER,
        estimatedTime: 60,
        tags: [],
        generatedAt: new Date(),
        projectId: 'test-project',
        userId: 'test-user'
      }

      const validation = generator.validatePrompt(poorPrompt)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.score).toBeLessThan(50)
    })
  })
})

describe('PromptValidator', () => {
  let validator: PromptValidator

  beforeEach(() => {
    validator = new PromptValidator()
  })

  describe('validateTemplate', () => {
    it('should validate complete templates successfully', () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        description: 'A test template for validation',
        category: PromptCategory.SETUP,
        difficulty: DifficultyLevel.INTERMEDIATE,
        supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV],
        template: `# {{projectName}} Setup

## Context
Setting up a {{projectType}} project.

## Task
Create the project structure with:
1. Initialize {{frontend}} frontend
2. Set up {{backend}} backend
3. Configure {{database}} database

## Requirements
- Follow best practices
- Include testing setup
- Add documentation`,
        variables: [
          { name: 'projectName', type: 'string' as const, required: true, description: 'Project name' },
          { name: 'projectType', type: 'string' as const, required: true, description: 'Type of project' },
          { name: 'frontend', type: 'string' as const, required: true, description: 'Frontend framework' },
          { name: 'backend', type: 'string' as const, required: true, description: 'Backend framework' },
          { name: 'database', type: 'string' as const, required: true, description: 'Database system' }
        ],
        contextRequirements: [
          { type: 'tech-stack' as const, description: 'Technology stack', required: true, format: 'object' }
        ],
        expectedOutput: {
          type: 'code' as const,
          description: 'Project setup files',
          format: 'multiple files',
          estimatedLines: 500,
          files: ['package.json', 'src/', 'tests/']
        },
        tags: ['setup', 'initialization'],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        usageCount: 0
      }

      const validation = validator.validateTemplate(template)

      expect(validation.isValid).toBe(true)
      expect(validation.score).toBeGreaterThan(70)
      expect(validation.errors).toHaveLength(0)
    })

    it('should identify missing required fields', () => {
      const incompleteTemplate = {
        id: '',
        name: '',
        description: 'A test template',
        category: PromptCategory.SETUP,
        difficulty: DifficultyLevel.INTERMEDIATE,
        supportedTools: [],
        template: '',
        variables: [],
        contextRequirements: [],
        expectedOutput: {
          type: 'code' as const,
          description: 'Test output',
          format: 'files'
        },
        tags: [],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        usageCount: 0
      }

      const validation = validator.validateTemplate(incompleteTemplate)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors.some(e => e.field === 'id')).toBe(true)
      expect(validation.errors.some(e => e.field === 'name')).toBe(true)
      expect(validation.errors.some(e => e.field === 'template')).toBe(true)
    })
  })

  describe('testPrompt', () => {
    it('should test prompt syntax correctly', async () => {
      const prompt = {
        id: 'test-prompt',
        templateId: 'test',
        title: 'Test Prompt',
        description: 'A test prompt',
        prompt: `# Project Setup

## Context
Setting up a new project.

## Task
- Create project structure
- Initialize dependencies
- Configure development environment

## Requirements
1. Use modern best practices
2. Include comprehensive testing
3. Add proper documentation`,
        context: {
          techStack: {
            frontend: ['React'],
            backend: ['Node.js'],
            database: ['PostgreSQL'],
            aiServices: [],
            deployment: ['Vercel']
          },
          features: ['Authentication'],
          architecture: 'SPA',
          codeStyle: {
            language: 'typescript',
            conventions: {
              naming: 'camelCase' as const,
              indentation: 'spaces' as const,
              indentSize: 2,
              quotes: 'single' as const,
              semicolons: true
            },
            patterns: [],
            linting: { enabled: true, rules: [] },
            formatting: { enabled: true, tool: 'prettier' }
          }
        },
        tool: CodingTool.CURSOR,
        difficulty: DifficultyLevel.INTERMEDIATE,
        estimatedTime: 120,
        tags: ['setup'],
        generatedAt: new Date(),
        projectId: 'test',
        userId: 'test'
      }

      const result = await validator.testPrompt(prompt, 'syntax')

      expect(result.score).toBeGreaterThan(80)
      expect(result.feedback).toContain('Syntax looks good')
      expect(result.testType).toBe('syntax')
    })

    it('should test prompt completeness', async () => {
      const incompletePrompt = {
        id: 'incomplete-prompt',
        templateId: 'test',
        title: 'Incomplete Prompt',
        description: 'An incomplete test prompt',
        prompt: 'Just do something with React',
        context: {
          techStack: {
            frontend: ['React'],
            backend: [],
            database: [],
            aiServices: [],
            deployment: []
          },
          features: [],
          architecture: '',
          codeStyle: {
            language: 'javascript',
            conventions: {
              naming: 'camelCase' as const,
              indentation: 'spaces' as const,
              indentSize: 2,
              quotes: 'single' as const,
              semicolons: true
            },
            patterns: [],
            linting: { enabled: false, rules: [] },
            formatting: { enabled: false, tool: '' }
          }
        },
        tool: CodingTool.CURSOR,
        difficulty: DifficultyLevel.BEGINNER,
        estimatedTime: 60,
        tags: [],
        generatedAt: new Date(),
        projectId: 'test',
        userId: 'test'
      }

      const result = await validator.testPrompt(incompletePrompt, 'completeness')

      expect(result.score).toBeLessThan(70)
      expect(result.feedback).toContain('Missing')
      expect(result.suggestions.length).toBeGreaterThan(0)
    })
  })
})

describe('PromptVersionControl', () => {
  let versionControl: PromptVersionControl

  beforeEach(() => {
    versionControl = new PromptVersionControl()
  })

  describe('createVersion', () => {
    it('should create a new version with detected changes', () => {
      const originalTemplate = {
        id: 'test-template',
        name: 'Original Template',
        description: 'Original description',
        category: PromptCategory.SETUP,
        difficulty: DifficultyLevel.BEGINNER,
        supportedTools: [CodingTool.CURSOR],
        template: 'Original template content',
        variables: [],
        contextRequirements: [],
        expectedOutput: {
          type: 'code' as const,
          description: 'Original output',
          format: 'files'
        },
        tags: ['original'],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        usageCount: 0
      }

      const updatedTemplate = {
        ...originalTemplate,
        name: 'Updated Template',
        description: 'Updated description',
        template: 'Updated template content',
        tags: ['original', 'updated']
      }

      const version = versionControl.createVersion(
        'test-template',
        updatedTemplate,
        originalTemplate,
        'test-author',
        'Updated template with new content'
      )

      expect(version.version).toBe('1.0.0')
      expect(version.changes.length).toBeGreaterThan(0)
      expect(version.author).toBe('test-author')
      expect(version.isActive).toBe(true)
    })

    it('should increment version numbers correctly', () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test description',
        category: PromptCategory.SETUP,
        difficulty: DifficultyLevel.BEGINNER,
        supportedTools: [CodingTool.CURSOR],
        template: 'Template content',
        variables: [],
        contextRequirements: [],
        expectedOutput: {
          type: 'code' as const,
          description: 'Output',
          format: 'files'
        },
        tags: ['test'],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        usageCount: 0
      }

      // Create first version
      const v1 = versionControl.createVersion(
        'test-template',
        template,
        template,
        'author1',
        'First version'
      )

      // Create second version
      const updatedTemplate = { ...template, name: 'Updated Template' }
      const v2 = versionControl.createVersion(
        'test-template',
        updatedTemplate,
        template,
        'author2',
        'Second version'
      )

      expect(v1.version).toBe('1.0.0')
      expect(v2.version).toBe('1.0.1')
      expect(v1.isActive).toBe(false)
      expect(v2.isActive).toBe(true)
    })
  })

  describe('getVersionHistory', () => {
    it('should return version history with timeline', () => {
      const template = {
        id: 'test-template',
        name: 'Test Template',
        description: 'Test description',
        category: PromptCategory.SETUP,
        difficulty: DifficultyLevel.BEGINNER,
        supportedTools: [CodingTool.CURSOR],
        template: 'Template content',
        variables: [],
        contextRequirements: [],
        expectedOutput: {
          type: 'code' as const,
          description: 'Output',
          format: 'files'
        },
        tags: ['test'],
        version: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date(),
        author: 'test',
        usageCount: 0
      }

      // Create multiple versions
      versionControl.createVersion('test-template', template, template, 'author1', 'First')
      versionControl.createVersion('test-template', { ...template, name: 'V2' }, template, 'author2', 'Second')
      versionControl.createVersion('test-template', { ...template, name: 'V3' }, template, 'author3', 'Third')

      const history = versionControl.getVersionHistory('test-template')

      expect(history.versions).toHaveLength(3)
      expect(history.timeline).toHaveLength(3)
      // Check that versions are sorted by date (newest first)
      expect(history.timeline[0].date.getTime()).toBeGreaterThanOrEqual(history.timeline[1].date.getTime())
      expect(history.timeline[1].date.getTime()).toBeGreaterThanOrEqual(history.timeline[2].date.getTime())
    })
  })

  describe('trackUsage', () => {
    it('should track prompt usage and update analytics', () => {
      versionControl.trackUsage('test-prompt', true, 5, 'Great prompt!', 'user1')
      versionControl.trackUsage('test-prompt', false, 2, 'Needs improvement', 'user2')

      const analytics = versionControl.getAnalytics('test-prompt')

      expect(analytics).toBeDefined()
      expect(analytics!.usageStats.totalUses).toBe(2)
      expect(analytics!.usageStats.successRate).toBe(0.5)
      expect(analytics!.userFeedback).toHaveLength(2)
    })
  })
})