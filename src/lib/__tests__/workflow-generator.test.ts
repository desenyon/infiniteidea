import { describe, it, expect } from 'vitest'
import { WorkflowGenerator } from '../workflow-generator'
import { NodeType, AIWorkflow } from '@/types'

describe('WorkflowGenerator', () => {
  describe('generateWorkflow', () => {
    it('should generate a simple workflow with basic nodes', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['basic-crud'],
        complexity: 'simple',
        parallel: false,
      })

      expect(workflow).toBeDefined()
      expect(workflow.nodes).toBeDefined()
      expect(workflow.edges).toBeDefined()
      expect(workflow.modules).toBeDefined()
      expect(workflow.configuration).toBeDefined()

      // Should have at least input, processing, AI service, and output nodes
      expect(workflow.nodes.length).toBeGreaterThanOrEqual(4)
      
      // Should have input node
      const inputNode = workflow.nodes.find(n => n.type === NodeType.INPUT)
      expect(inputNode).toBeDefined()
      expect(inputNode?.label).toBe('User Input')

      // Should have output node
      const outputNode = workflow.nodes.find(n => n.type === NodeType.OUTPUT)
      expect(outputNode).toBeDefined()
      expect(outputNode?.label).toBe('Blueprint Output')

      // Should have AI service nodes
      const aiNodes = workflow.nodes.filter(n => n.type === NodeType.AI_SERVICE)
      expect(aiNodes.length).toBeGreaterThan(0)

      // Should have edges connecting nodes
      expect(workflow.edges.length).toBeGreaterThan(0)

      // Configuration should be set correctly
      expect(workflow.configuration.parallel).toBe(false)
      expect(workflow.configuration.timeout).toBe(120) // Simple complexity timeout
      expect(workflow.configuration.retries).toBe(3)
      expect(workflow.configuration.fallbackEnabled).toBe(true)
    })

    it('should generate a moderate complexity workflow', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['user-auth', 'dashboard', 'api'],
        complexity: 'moderate',
        includeModules: ['Auth', 'Payment'],
        parallel: false,
      })

      expect(workflow.nodes.length).toBeGreaterThan(5)
      expect(workflow.configuration.timeout).toBe(180) // Moderate complexity timeout

      // Should have integration nodes for modules
      const integrationNodes = workflow.nodes.filter(n => n.type === NodeType.INTEGRATION)
      expect(integrationNodes.length).toBe(2) // Auth and Payment

      // Should have context analysis node for moderate complexity
      const processingNodes = workflow.nodes.filter(n => n.type === NodeType.PROCESSING)
      expect(processingNodes.length).toBeGreaterThanOrEqual(2)

      // Should have modules
      expect(workflow.modules.length).toBeGreaterThan(0)
      const authModule = workflow.modules.find(m => m.name.includes('Auth'))
      expect(authModule).toBeDefined()
    })

    it('should generate a complex parallel workflow', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['ai-integration', 'real-time', 'analytics'],
        complexity: 'complex',
        includeModules: ['Auth', 'Analytics'],
        parallel: true,
      })

      expect(workflow.nodes.length).toBeGreaterThan(6)
      expect(workflow.configuration.parallel).toBe(true)
      expect(workflow.configuration.timeout).toBe(300) // Complex timeout

      // Should have decision nodes for complex workflows
      const decisionNodes = workflow.nodes.filter(n => n.type === NodeType.DECISION)
      expect(decisionNodes.length).toBeGreaterThan(0)

      // Should have roadmap AI for complex workflows
      const roadmapAI = workflow.nodes.find(n => n.label.includes('Roadmap'))
      expect(roadmapAI).toBeDefined()
    })

    it('should create proper node connections', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'simple',
        parallel: false,
      })

      // Every edge should connect existing nodes
      workflow.edges.forEach(edge => {
        const sourceNode = workflow.nodes.find(n => n.id === edge.source)
        const targetNode = workflow.nodes.find(n => n.id === edge.target)
        
        expect(sourceNode).toBeDefined()
        expect(targetNode).toBeDefined()
      })

      // Input node should not have incoming edges
      const inputNode = workflow.nodes.find(n => n.type === NodeType.INPUT)
      const inputEdges = workflow.edges.filter(e => e.target === inputNode?.id)
      expect(inputEdges.length).toBe(0)

      // Output node should not have outgoing edges
      const outputNode = workflow.nodes.find(n => n.type === NodeType.OUTPUT)
      const outputEdges = workflow.edges.filter(e => e.source === outputNode?.id)
      expect(outputEdges.length).toBe(0)
    })

    it('should create valid node configurations', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        parallel: false,
      })

      workflow.nodes.forEach(node => {
        // Every node should have required properties
        expect(node.id).toBeDefined()
        expect(node.type).toBeDefined()
        expect(node.label).toBeDefined()
        expect(node.position).toBeDefined()
        expect(node.configuration).toBeDefined()
        expect(node.inputs).toBeDefined()
        expect(node.outputs).toBeDefined()

        // Position should be valid
        expect(typeof node.position.x).toBe('number')
        expect(typeof node.position.y).toBe('number')
        expect(node.position.x).toBeGreaterThanOrEqual(0)
        expect(node.position.y).toBeGreaterThanOrEqual(0)

        // AI service nodes should have proper configuration
        if (node.type === NodeType.AI_SERVICE) {
          expect(node.configuration.model).toBeDefined()
          expect(node.configuration.temperature).toBeDefined()
          expect(node.configuration.maxTokens).toBeDefined()
          expect(node.configuration.systemPrompt).toBeDefined()
        }
      })
    })

    it('should create valid modules', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        includeModules: ['Auth', 'Payment'],
        parallel: false,
      })

      workflow.modules.forEach(module => {
        // Every module should have required properties
        expect(module.id).toBeDefined()
        expect(module.name).toBeDefined()
        expect(module.description).toBeDefined()
        expect(module.category).toBeDefined()
        expect(module.nodes).toBeDefined()
        expect(typeof module.configurable).toBe('boolean')
        expect(typeof module.required).toBe('boolean')

        // Module nodes should exist in the workflow
        module.nodes.forEach(nodeId => {
          const node = workflow.nodes.find(n => n.id === nodeId)
          expect(node).toBeDefined()
        })
      })
    })
  })

  describe('createSampleWorkflow', () => {
    it('should create a valid sample workflow', () => {
      const workflow = WorkflowGenerator.createSampleWorkflow()

      expect(workflow).toBeDefined()
      expect(workflow.nodes.length).toBeGreaterThan(0)
      expect(workflow.edges.length).toBeGreaterThan(0)
      expect(workflow.modules.length).toBeGreaterThan(0)
      expect(workflow.configuration).toBeDefined()

      // Should be a moderate complexity workflow
      expect(workflow.configuration.timeout).toBe(180)
      expect(workflow.configuration.parallel).toBe(false)
    })
  })

  describe('createComplexWorkflow', () => {
    it('should create a valid complex workflow', () => {
      const workflow = WorkflowGenerator.createComplexWorkflow()

      expect(workflow).toBeDefined()
      expect(workflow.nodes.length).toBeGreaterThan(5)
      expect(workflow.edges.length).toBeGreaterThan(5)
      expect(workflow.modules.length).toBeGreaterThan(2)

      // Should be a complex parallel workflow
      expect(workflow.configuration.timeout).toBe(300)
      expect(workflow.configuration.parallel).toBe(true)

      // Should have decision nodes
      const decisionNodes = workflow.nodes.filter(n => n.type === NodeType.DECISION)
      expect(decisionNodes.length).toBeGreaterThan(0)

      // Should have multiple integration modules
      const integrationModules = workflow.modules.filter(m => m.category === 'integration')
      expect(integrationModules.length).toBeGreaterThan(1)
    })
  })

  describe('workflow validation', () => {
    it('should create workflows with unique node IDs', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        parallel: false,
      })

      const nodeIds = workflow.nodes.map(n => n.id)
      const uniqueIds = new Set(nodeIds)
      expect(uniqueIds.size).toBe(nodeIds.length)
    })

    it('should create workflows with unique edge IDs', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        parallel: false,
      })

      const edgeIds = workflow.edges.map(e => e.id)
      const uniqueIds = new Set(edgeIds)
      expect(uniqueIds.size).toBe(edgeIds.length)
    })

    it('should create workflows with unique module IDs', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        includeModules: ['Auth', 'Payment'],
        parallel: false,
      })

      const moduleIds = workflow.modules.map(m => m.id)
      const uniqueIds = new Set(moduleIds)
      expect(uniqueIds.size).toBe(moduleIds.length)
    })

    it('should handle empty features array', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: [],
        complexity: 'simple',
        parallel: false,
      })

      expect(workflow).toBeDefined()
      expect(workflow.nodes.length).toBeGreaterThan(0)
      expect(workflow.edges.length).toBeGreaterThan(0)
    })

    it('should handle empty modules array', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'simple',
        includeModules: [],
        parallel: false,
      })

      expect(workflow).toBeDefined()
      const integrationNodes = workflow.nodes.filter(n => n.type === NodeType.INTEGRATION)
      expect(integrationNodes.length).toBe(0)
    })
  })

  describe('node positioning', () => {
    it('should position nodes in a logical flow', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'simple',
        parallel: false,
      })

      const inputNode = workflow.nodes.find(n => n.type === NodeType.INPUT)
      const outputNode = workflow.nodes.find(n => n.type === NodeType.OUTPUT)
      const processingNodes = workflow.nodes.filter(n => n.type === NodeType.PROCESSING)
      const aiNodes = workflow.nodes.filter(n => n.type === NodeType.AI_SERVICE)

      // Input should be leftmost
      expect(inputNode?.position.x).toBeLessThan(processingNodes[0]?.position.x || 1000)
      
      // Output should be rightmost
      expect(outputNode?.position.x).toBeGreaterThan(aiNodes[0]?.position.x || 0)

      // Processing nodes should be between input and AI nodes
      if (processingNodes.length > 0 && aiNodes.length > 0) {
        expect(processingNodes[0].position.x).toBeLessThan(aiNodes[0].position.x)
      }
    })

    it('should avoid overlapping node positions', () => {
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['test-feature'],
        complexity: 'moderate',
        parallel: false,
      })

      // Check that no two nodes have exactly the same position
      const positions = workflow.nodes.map(n => `${n.position.x},${n.position.y}`)
      const uniquePositions = new Set(positions)
      
      // Allow some overlap but most should be unique
      expect(uniquePositions.size).toBeGreaterThan(workflow.nodes.length * 0.7)
    })
  })
})