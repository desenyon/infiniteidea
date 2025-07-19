import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowExportImport } from '../workflow-export-import'
import { AIWorkflow, NodeType, WorkflowModule } from '@/types'

describe('WorkflowExportImport', () => {
  let sampleWorkflow: AIWorkflow
  let sampleMetadata: any

  beforeEach(() => {
    sampleWorkflow = {
      nodes: [
        {
          id: 'node-1',
          type: NodeType.INPUT,
          label: 'Input Node',
          position: { x: 100, y: 100 },
          configuration: {},
          inputs: [],
          outputs: [{ id: 'out-1', type: 'text', description: 'Text output' }]
        },
        {
          id: 'node-2',
          type: NodeType.AI_SERVICE,
          label: 'AI Service',
          position: { x: 300, y: 100 },
          configuration: { model: 'gpt-4' },
          inputs: [{ id: 'in-1', type: 'text', required: true, description: 'Text input' }],
          outputs: [{ id: 'out-2', type: 'result', description: 'AI result' }]
        }
      ],
      edges: [
        {
          id: 'edge-1',
          source: 'node-1',
          target: 'node-2',
          label: 'Connection'
        }
      ],
      modules: [
        {
          id: 'core-module',
          name: 'Core Module',
          description: 'Core processing module',
          category: 'core',
          nodes: ['node-1', 'node-2'],
          configurable: true,
          required: true
        }
      ],
      configuration: {
        parallel: false,
        timeout: 120,
        retries: 3,
        fallbackEnabled: true
      }
    }

    sampleMetadata = {
      name: 'Test Workflow',
      description: 'A test workflow for unit testing',
      tags: ['test', 'sample'],
      complexity: 'simple' as const
    }
  })

  describe('exportToJSON', () => {
    it('should export workflow to valid JSON string', () => {
      const jsonString = WorkflowExportImport.exportToJSON(sampleWorkflow, sampleMetadata)
      
      expect(() => JSON.parse(jsonString)).not.toThrow()
      
      const parsed = JSON.parse(jsonString)
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.workflow).toEqual(sampleWorkflow)
      expect(parsed.metadata).toEqual(sampleMetadata)
      expect(parsed.timestamp).toBeDefined()
    })

    it('should include all required fields in export', () => {
      const jsonString = WorkflowExportImport.exportToJSON(sampleWorkflow, sampleMetadata)
      const parsed = JSON.parse(jsonString)
      
      expect(parsed).toHaveProperty('version')
      expect(parsed).toHaveProperty('timestamp')
      expect(parsed).toHaveProperty('workflow')
      expect(parsed).toHaveProperty('metadata')
    })
  })

  describe('importFromJSON', () => {
    it('should import valid workflow JSON successfully', () => {
      const jsonString = WorkflowExportImport.exportToJSON(sampleWorkflow, sampleMetadata)
      const result = WorkflowExportImport.importFromJSON(jsonString)
      
      expect(result.success).toBe(true)
      expect(result.workflow).toEqual(sampleWorkflow)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle invalid JSON gracefully', () => {
      const result = WorkflowExportImport.importFromJSON('invalid json')
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Invalid JSON format')
    })

    it('should validate workflow structure', () => {
      const invalidWorkflow = {
        version: '1.0.0',
        timestamp: new Date(),
        workflow: {
          nodes: null, // Invalid - should be array
          edges: [],
          modules: [],
          configuration: {}
        },
        metadata: sampleMetadata
      }
      
      const result = WorkflowExportImport.importFromJSON(JSON.stringify(invalidWorkflow))
      
      expect(result.success).toBe(false)
      expect(result.errors.some(error => error.includes('nodes array'))).toBe(true)
    })

    it('should detect missing node references in edges', () => {
      const workflowWithInvalidEdge = {
        ...sampleWorkflow,
        edges: [
          {
            id: 'edge-1',
            source: 'non-existent-node',
            target: 'node-2',
            label: 'Invalid connection'
          }
        ]
      }
      
      const exportData = {
        version: '1.0.0',
        timestamp: new Date(),
        workflow: workflowWithInvalidEdge,
        metadata: sampleMetadata
      }
      
      const result = WorkflowExportImport.importFromJSON(JSON.stringify(exportData))
      
      expect(result.success).toBe(false)
      expect(result.errors.some(error => error.includes('non-existent source node'))).toBe(true)
    })
  })

  describe('exportModulesConfig', () => {
    it('should export modules with configurations', () => {
      const modules: WorkflowModule[] = [
        {
          id: 'auth',
          name: 'Authentication',
          description: 'Auth module',
          category: 'core',
          nodes: ['node-1'],
          configurable: true,
          required: true
        }
      ]
      
      const configurations = {
        auth: {
          provider: 'nextauth',
          socialProviders: ['google', 'github']
        }
      }
      
      const jsonString = WorkflowExportImport.exportModulesConfig(modules, configurations)
      const parsed = JSON.parse(jsonString)
      
      expect(parsed.version).toBe('1.0.0')
      expect(parsed.modules).toHaveLength(1)
      expect(parsed.modules[0].configuration).toEqual(configurations.auth)
    })
  })

  describe('importModulesConfig', () => {
    it('should import modules configuration successfully', () => {
      const exportData = {
        version: '1.0.0',
        timestamp: new Date(),
        modules: [
          {
            id: 'auth',
            name: 'Authentication',
            description: 'Auth module',
            category: 'core',
            nodes: ['node-1'],
            configurable: true,
            required: true,
            configuration: {
              provider: 'nextauth',
              socialProviders: ['google']
            }
          }
        ]
      }
      
      const result = WorkflowExportImport.importModulesConfig(JSON.stringify(exportData))
      
      expect(result.success).toBe(true)
      expect(result.modules).toHaveLength(1)
      expect(result.configurations?.auth).toEqual({
        provider: 'nextauth',
        socialProviders: ['google']
      })
    })

    it('should handle invalid modules data', () => {
      const result = WorkflowExportImport.importModulesConfig('{"modules": "invalid"}')
      
      expect(result.success).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('Invalid modules data format')
    })
  })

  describe('createTemplate', () => {
    it('should create template from workflow', () => {
      const template = WorkflowExportImport.createTemplate(
        sampleWorkflow,
        'My Template',
        'Custom template description'
      )
      
      expect(template.version).toBe('1.0.0')
      expect(template.metadata.name).toBe('My Template')
      expect(template.metadata.description).toBe('Custom template description')
      expect(template.metadata.tags).toContain('template')
      expect(template.workflow.nodes).toHaveLength(sampleWorkflow.nodes.length)
    })

    it('should determine complexity correctly', () => {
      // Simple workflow (2 nodes)
      const simpleTemplate = WorkflowExportImport.createTemplate(sampleWorkflow, 'Simple')
      expect(simpleTemplate.metadata.complexity).toBe('simple')
      
      // Complex workflow (many nodes with decision and parallel execution)
      const complexWorkflow = {
        ...sampleWorkflow,
        nodes: Array.from({ length: 12 }, (_, i) => ({
          id: `node-${i}`,
          type: i === 5 ? NodeType.DECISION : NodeType.PROCESSING,
          label: `Node ${i}`,
          position: { x: i * 100, y: 100 },
          configuration: {},
          inputs: [],
          outputs: []
        })),
        configuration: {
          ...sampleWorkflow.configuration,
          parallel: true
        }
      }
      
      const complexTemplate = WorkflowExportImport.createTemplate(complexWorkflow, 'Complex')
      expect(complexTemplate.metadata.complexity).toBe('complex')
    })
  })

  describe('mergeWorkflows', () => {
    it('should merge two workflows correctly', () => {
      const additionalWorkflow: AIWorkflow = {
        nodes: [
          {
            id: 'node-3',
            type: NodeType.OUTPUT,
            label: 'Output Node',
            position: { x: 500, y: 100 },
            configuration: {},
            inputs: [{ id: 'in-3', type: 'result', required: true, description: 'Final input' }],
            outputs: []
          }
        ],
        edges: [
          {
            id: 'edge-2',
            source: 'node-2',
            target: 'node-3',
            label: 'Final connection'
          }
        ],
        modules: [
          {
            id: 'output-module',
            name: 'Output Module',
            description: 'Output processing',
            category: 'output',
            nodes: ['node-3'],
            configurable: false,
            required: true
          }
        ],
        configuration: {
          parallel: true,
          timeout: 180,
          retries: 2,
          fallbackEnabled: false
        }
      }
      
      const merged = WorkflowExportImport.mergeWorkflows(sampleWorkflow, additionalWorkflow, 100, 50)
      
      expect(merged.nodes).toHaveLength(3) // 2 original + 1 additional
      expect(merged.edges).toHaveLength(2) // 1 original + 1 additional
      expect(merged.modules).toHaveLength(2) // 1 original + 1 additional
      
      // Check that additional nodes are offset
      const additionalNode = merged.nodes.find(n => n.label === 'Output Node')
      expect(additionalNode?.position.x).toBe(600) // 500 + 100 offset
      expect(additionalNode?.position.y).toBe(150) // 100 + 50 offset
      
      // Check configuration merging
      expect(merged.configuration.parallel).toBe(true) // Should take true from either
      expect(merged.configuration.timeout).toBe(180) // Should take max
      expect(merged.configuration.retries).toBe(3) // Should take max
      expect(merged.configuration.fallbackEnabled).toBe(true) // Should take true from either
    })

    it('should handle ID conflicts by creating unique IDs', () => {
      const duplicateWorkflow = { ...sampleWorkflow }
      
      const merged = WorkflowExportImport.mergeWorkflows(sampleWorkflow, duplicateWorkflow)
      
      expect(merged.nodes).toHaveLength(4) // 2 original + 2 duplicated
      
      // Check that all node IDs are unique
      const nodeIds = merged.nodes.map(n => n.id)
      const uniqueIds = new Set(nodeIds)
      expect(uniqueIds.size).toBe(nodeIds.length)
    })
  })
})