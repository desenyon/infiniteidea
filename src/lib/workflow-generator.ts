import { 
  AIWorkflow, 
  WorkflowNode, 
  WorkflowEdge, 
  WorkflowModule,
  WorkflowConfig,
  NodeType,
  Position
} from '@/types'

interface NodeInput {
  id: string
  type: string
  required: boolean
  description: string
}

interface NodeOutput {
  id: string
  type: string
  description: string
}

export interface WorkflowGeneratorOptions {
  features: string[]
  complexity: 'simple' | 'moderate' | 'complex'
  includeModules?: string[]
  parallel?: boolean
}

export class WorkflowGenerator {
  /**
   * Generate a complete AI workflow based on features and requirements
   */
  static generateWorkflow(options: WorkflowGeneratorOptions): AIWorkflow {
    const { features, complexity, includeModules = [], parallel = false } = options

    const nodes: WorkflowNode[] = []
    const edges: WorkflowEdge[] = []
    const modules: WorkflowModule[] = []

    // Create input node
    const inputNode = this.createInputNode()
    nodes.push(inputNode)

    // Create processing nodes based on features
    const processingNodes = this.createProcessingNodes(features, complexity)
    nodes.push(...processingNodes)

    // Create AI service nodes
    const aiNodes = this.createAIServiceNodes(features, complexity)
    nodes.push(...aiNodes)

    // Create integration nodes if modules are specified
    const integrationNodes = this.createIntegrationNodes(includeModules)
    nodes.push(...integrationNodes)

    // Create output node
    const outputNode = this.createOutputNode()
    nodes.push(outputNode)

    // Create edges to connect nodes
    const workflowEdges = this.createEdges(nodes, parallel)
    edges.push(...workflowEdges)

    // Create modules
    const workflowModules = this.createModules(includeModules, nodes)
    modules.push(...workflowModules)

    // Create configuration
    const configuration: WorkflowConfig = {
      parallel,
      timeout: complexity === 'complex' ? 300 : complexity === 'moderate' ? 180 : 120,
      retries: 3,
      fallbackEnabled: true,
    }

    return {
      nodes,
      edges,
      modules,
      configuration,
    }
  }

  /**
   * Create input node for the workflow
   */
  private static createInputNode(): WorkflowNode {
    return {
      id: 'input-1',
      type: NodeType.INPUT,
      label: 'User Input',
      position: { x: 50, y: 200 },
      configuration: {
        inputType: 'text',
        validation: true,
        preprocessing: true,
      },
      inputs: [],
      outputs: [
        {
          id: 'input-output-1',
          type: 'text',
          description: 'Processed user input',
        },
      ],
    }
  }

  /**
   * Create processing nodes based on features
   */
  private static createProcessingNodes(features: string[], complexity: string): WorkflowNode[] {
    const nodes: WorkflowNode[] = []
    let yOffset = 100

    // Feature extraction node
    nodes.push({
      id: 'process-1',
      type: NodeType.PROCESSING,
      label: 'Feature Extraction',
      position: { x: 300, y: yOffset },
      configuration: {
        extractors: ['keywords', 'entities', 'intent'],
        confidence: 0.8,
      },
      inputs: [
        {
          id: 'process-1-input',
          type: 'text',
          required: true,
          description: 'Raw input text',
        },
      ],
      outputs: [
        {
          id: 'process-1-output',
          type: 'features',
          description: 'Extracted features',
        },
      ],
    })

    yOffset += 150

    // Context analysis node for moderate/complex workflows
    if (complexity !== 'simple') {
      nodes.push({
        id: 'process-2',
        type: NodeType.PROCESSING,
        label: 'Context Analysis',
        position: { x: 300, y: yOffset },
        configuration: {
          contextTypes: ['business', 'technical', 'market'],
          depth: complexity === 'complex' ? 'deep' : 'standard',
        },
        inputs: [
          {
            id: 'process-2-input',
            type: 'features',
            required: true,
            description: 'Feature data',
          },
        ],
        outputs: [
          {
            id: 'process-2-output',
            type: 'context',
            description: 'Analyzed context',
          },
        ],
      })
      yOffset += 150
    }

    // Decision node for complex workflows
    if (complexity === 'complex') {
      nodes.push({
        id: 'decision-1',
        type: NodeType.DECISION,
        label: 'Route Decision',
        position: { x: 300, y: yOffset },
        configuration: {
          criteria: ['complexity', 'domain', 'requirements'],
          routes: ['technical', 'business', 'hybrid'],
        },
        inputs: [
          {
            id: 'decision-1-input',
            type: 'context',
            required: true,
            description: 'Context data',
          },
        ],
        outputs: [
          {
            id: 'decision-1-technical',
            type: 'route',
            description: 'Technical route',
          },
          {
            id: 'decision-1-business',
            type: 'route',
            description: 'Business route',
          },
          {
            id: 'decision-1-hybrid',
            type: 'route',
            description: 'Hybrid route',
          },
        ],
      })
    }

    return nodes
  }

  /**
   * Create AI service nodes
   */
  private static createAIServiceNodes(features: string[], complexity: string): WorkflowNode[] {
    const nodes: WorkflowNode[] = []
    let yOffset = 100

    // Product planning AI
    nodes.push({
      id: 'ai-product',
      type: NodeType.AI_SERVICE,
      label: 'Product Planning AI',
      position: { x: 550, y: yOffset },
      configuration: {
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'Generate comprehensive product plans',
      },
      inputs: [
        {
          id: 'ai-product-input',
          type: 'features',
          required: true,
          description: 'Feature requirements',
        },
      ],
      outputs: [
        {
          id: 'ai-product-output',
          type: 'product-plan',
          description: 'Generated product plan',
        },
      ],
    })

    yOffset += 150

    // Technical architecture AI
    nodes.push({
      id: 'ai-tech',
      type: NodeType.AI_SERVICE,
      label: 'Tech Stack AI',
      position: { x: 550, y: yOffset },
      configuration: {
        model: 'claude-3-sonnet',
        temperature: 0.3,
        maxTokens: 3000,
        systemPrompt: 'Design technical architectures and recommend tech stacks',
      },
      inputs: [
        {
          id: 'ai-tech-input',
          type: 'product-plan',
          required: true,
          description: 'Product requirements',
        },
      ],
      outputs: [
        {
          id: 'ai-tech-output',
          type: 'tech-stack',
          description: 'Technical architecture',
        },
      ],
    })

    yOffset += 150

    // Financial modeling AI
    nodes.push({
      id: 'ai-financial',
      type: NodeType.AI_SERVICE,
      label: 'Financial Modeling AI',
      position: { x: 550, y: yOffset },
      configuration: {
        model: 'gpt-4',
        temperature: 0.2,
        maxTokens: 2500,
        systemPrompt: 'Create financial models and projections',
      },
      inputs: [
        {
          id: 'ai-financial-input',
          type: 'product-plan',
          required: true,
          description: 'Business requirements',
        },
      ],
      outputs: [
        {
          id: 'ai-financial-output',
          type: 'financial-model',
          description: 'Financial projections',
        },
      ],
    })

    yOffset += 150

    // Roadmap generation AI for complex workflows
    if (complexity !== 'simple') {
      nodes.push({
        id: 'ai-roadmap',
        type: NodeType.AI_SERVICE,
        label: 'Roadmap AI',
        position: { x: 550, y: yOffset },
        configuration: {
          model: 'gpt-4',
          temperature: 0.4,
          maxTokens: 3000,
          systemPrompt: 'Generate development roadmaps and task breakdowns',
        },
        inputs: [
          {
            id: 'ai-roadmap-input-1',
            type: 'product-plan',
            required: true,
            description: 'Product plan',
          },
          {
            id: 'ai-roadmap-input-2',
            type: 'tech-stack',
            required: true,
            description: 'Technical architecture',
          },
        ],
        outputs: [
          {
            id: 'ai-roadmap-output',
            type: 'roadmap',
            description: 'Development roadmap',
          },
        ],
      })
    }

    return nodes
  }

  /**
   * Create integration nodes for external modules
   */
  private static createIntegrationNodes(modules: string[]): WorkflowNode[] {
    const nodes: WorkflowNode[] = []
    let yOffset = 300

    modules.forEach((module, index) => {
      nodes.push({
        id: `integration-${index + 1}`,
        type: NodeType.INTEGRATION,
        label: `${module} Integration`,
        position: { x: 800, y: yOffset },
        configuration: {
          module,
          apiEndpoint: `/${module.toLowerCase()}`,
          authentication: true,
        },
        inputs: [
          {
            id: `integration-${index + 1}-input`,
            type: 'blueprint',
            required: true,
            description: `${module} configuration data`,
          },
        ],
        outputs: [
          {
            id: `integration-${index + 1}-output`,
            type: 'integration-result',
            description: `${module} integration result`,
          },
        ],
      })
      yOffset += 150
    })

    return nodes
  }

  /**
   * Create output node
   */
  private static createOutputNode(): WorkflowNode {
    return {
      id: 'output-1',
      type: NodeType.OUTPUT,
      label: 'Blueprint Output',
      position: { x: 1050, y: 300 },
      configuration: {
        format: 'json',
        validation: true,
        export: true,
      },
      inputs: [
        {
          id: 'output-input-1',
          type: 'blueprint',
          required: true,
          description: 'Complete blueprint',
        },
      ],
      outputs: [],
    }
  }

  /**
   * Create edges to connect nodes
   */
  private static createEdges(nodes: WorkflowNode[], parallel: boolean): WorkflowEdge[] {
    const edges: WorkflowEdge[] = []
    const getUniqueEdgeId = () => `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Find nodes by type
    const inputNode = nodes.find(n => n.type === NodeType.INPUT)
    const processingNodes = nodes.filter(n => n.type === NodeType.PROCESSING)
    const decisionNodes = nodes.filter(n => n.type === NodeType.DECISION)
    const aiNodes = nodes.filter(n => n.type === NodeType.AI_SERVICE)
    const integrationNodes = nodes.filter(n => n.type === NodeType.INTEGRATION)
    const outputNode = nodes.find(n => n.type === NodeType.OUTPUT)

    if (!inputNode || !outputNode) return edges

    // Connect input to first processing node
    if (processingNodes.length > 0) {
      edges.push({
        id: getUniqueEdgeId(),
        source: inputNode.id,
        target: processingNodes[0].id,
        label: 'Raw Input',
      })

      // Connect processing nodes sequentially
      for (let i = 0; i < processingNodes.length - 1; i++) {
        edges.push({
          id: getUniqueEdgeId(),
          source: processingNodes[i].id,
          target: processingNodes[i + 1].id,
          label: 'Processed Data',
        })
      }

      // Connect last processing node to decision or AI nodes
      const lastProcessingNode = processingNodes[processingNodes.length - 1]
      
      if (decisionNodes.length > 0) {
        edges.push({
          id: getUniqueEdgeId(),
          source: lastProcessingNode.id,
          target: decisionNodes[0].id,
          label: 'Context',
        })

        // Connect decision node to AI nodes
        if (parallel && aiNodes.length > 0) {
          // Parallel execution - decision node connects to all AI nodes
          aiNodes.forEach(aiNode => {
            edges.push({
              id: getUniqueEdgeId(),
              source: decisionNodes[0].id,
              target: aiNode.id,
              label: 'Route',
            })
          })
        }
      } else if (aiNodes.length > 0) {
        // Direct connection to AI nodes
        if (parallel) {
          // Parallel execution
          aiNodes.forEach(aiNode => {
            edges.push({
              id: getUniqueEdgeId(),
              source: lastProcessingNode.id,
              target: aiNode.id,
              label: 'Features',
            })
          })
        } else {
          // Sequential execution
          edges.push({
            id: getUniqueEdgeId(),
            source: lastProcessingNode.id,
            target: aiNodes[0].id,
            label: 'Features',
          })

          // Connect AI nodes with dependencies
          this.connectAINodesSequentially(aiNodes, edges, getUniqueEdgeId)
        }
      }
    }

    // Connect AI nodes to integrations
    if (integrationNodes.length > 0 && aiNodes.length > 0) {
      integrationNodes.forEach(intNode => {
        // Connect from the most relevant AI node
        const sourceAI = aiNodes.find(ai => 
          intNode.label.toLowerCase().includes('auth') ? ai.label.includes('Tech') :
          intNode.label.toLowerCase().includes('payment') ? ai.label.includes('Financial') :
          ai.label.includes('Product')
        ) || aiNodes[0]

        edges.push({
          id: getUniqueEdgeId(),
          source: sourceAI.id,
          target: intNode.id,
          label: 'Blueprint Data',
        })
      })
    }

    // Connect to output node
    const finalNodes = integrationNodes.length > 0 ? integrationNodes : aiNodes
    if (finalNodes.length > 0) {
      finalNodes.forEach(node => {
        edges.push({
          id: getUniqueEdgeId(),
          source: node.id,
          target: outputNode.id,
          label: 'Final Output',
        })
      })
    }

    return edges
  }

  /**
   * Connect AI nodes sequentially based on dependencies
   */
  private static connectAINodesSequentially(
    aiNodes: WorkflowNode[], 
    edges: WorkflowEdge[], 
    getUniqueEdgeId: () => string
  ): void {
    // Define AI node dependencies
    const dependencies = [
      { from: 'ai-product', to: 'ai-tech', label: 'Product Plan' },
      { from: 'ai-product', to: 'ai-financial', label: 'Business Model' },
      { from: 'ai-tech', to: 'ai-roadmap', label: 'Tech Stack' },
      { from: 'ai-product', to: 'ai-roadmap', label: 'Requirements' },
    ]

    dependencies.forEach(dep => {
      const sourceNode = aiNodes.find(n => n.id === dep.from)
      const targetNode = aiNodes.find(n => n.id === dep.to)
      
      if (sourceNode && targetNode) {
        edges.push({
          id: getUniqueEdgeId(),
          source: sourceNode.id,
          target: targetNode.id,
          label: dep.label,
        })
      }
    })
  }

  /**
   * Create workflow modules
   */
  private static createModules(includeModules: string[], nodes: WorkflowNode[]): WorkflowModule[] {
    const modules: WorkflowModule[] = []

    // Core processing module
    const processingNodes = nodes.filter(n => 
      n.type === NodeType.PROCESSING || n.type === NodeType.DECISION
    )
    if (processingNodes.length > 0) {
      modules.push({
        id: 'core-processing',
        name: 'Core Processing',
        description: 'Input processing and feature extraction',
        category: 'core',
        nodes: processingNodes.map(n => n.id),
        configurable: true,
        required: true,
      })
    }

    // AI services module
    const aiNodes = nodes.filter(n => n.type === NodeType.AI_SERVICE)
    if (aiNodes.length > 0) {
      modules.push({
        id: 'ai-services',
        name: 'AI Services',
        description: 'AI-powered blueprint generation',
        category: 'ai',
        nodes: aiNodes.map(n => n.id),
        configurable: true,
        required: true,
      })
    }

    // Integration modules
    includeModules.forEach(moduleName => {
      const integrationNodes = nodes.filter(n => 
        n.type === NodeType.INTEGRATION && 
        n.label.toLowerCase().includes(moduleName.toLowerCase())
      )
      
      if (integrationNodes.length > 0) {
        modules.push({
          id: `${moduleName.toLowerCase()}-integration`,
          name: `${moduleName} Integration`,
          description: `Integration with ${moduleName} services`,
          category: 'integration',
          nodes: integrationNodes.map(n => n.id),
          configurable: true,
          required: false,
        })
      }
    })

    return modules
  }

  /**
   * Create a sample workflow for demonstration
   */
  static createSampleWorkflow(): AIWorkflow {
    return this.generateWorkflow({
      features: ['user-auth', 'payment', 'dashboard', 'api'],
      complexity: 'moderate',
      includeModules: ['Auth', 'Payment'],
      parallel: false,
    })
  }

  /**
   * Create a complex parallel workflow
   */
  static createComplexWorkflow(): AIWorkflow {
    return this.generateWorkflow({
      features: ['ai-integration', 'real-time', 'analytics', 'mobile-app', 'web-app'],
      complexity: 'complex',
      includeModules: ['Auth', 'Payment', 'Analytics', 'Notifications'],
      parallel: true,
    })
  }
}