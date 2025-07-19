import { AIWorkflow, WorkflowModule } from '@/types'

export interface WorkflowExportData {
  version: string
  timestamp: Date
  workflow: AIWorkflow
  metadata: {
    name: string
    description?: string
    author?: string
    tags: string[]
    complexity: 'simple' | 'moderate' | 'complex'
  }
}

export interface WorkflowImportResult {
  success: boolean
  workflow?: AIWorkflow
  errors: string[]
  warnings: string[]
}

export class WorkflowExportImport {
  private static readonly CURRENT_VERSION = '1.0.0'
  private static readonly SUPPORTED_VERSIONS = ['1.0.0']

  /**
   * Export workflow to JSON format
   */
  static exportToJSON(
    workflow: AIWorkflow,
    metadata: WorkflowExportData['metadata']
  ): string {
    const exportData: WorkflowExportData = {
      version: this.CURRENT_VERSION,
      timestamp: new Date(),
      workflow,
      metadata,
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Export workflow to downloadable file
   */
  static exportToFile(
    workflow: AIWorkflow,
    metadata: WorkflowExportData['metadata'],
    filename?: string
  ): void {
    const jsonData = this.exportToJSON(workflow, metadata)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `workflow-${metadata.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  }

  /**
   * Import workflow from JSON string
   */
  static importFromJSON(jsonData: string): WorkflowImportResult {
    const result: WorkflowImportResult = {
      success: false,
      errors: [],
      warnings: [],
    }

    try {
      const data = JSON.parse(jsonData) as WorkflowExportData
      
      // Validate version
      if (!this.SUPPORTED_VERSIONS.includes(data.version)) {
        result.errors.push(`Unsupported workflow version: ${data.version}`)
        return result
      }

      // Validate structure
      const validationResult = this.validateWorkflowStructure(data.workflow)
      if (!validationResult.isValid) {
        result.errors.push(...validationResult.errors)
        result.warnings.push(...validationResult.warnings)
      }

      if (result.errors.length === 0) {
        result.success = true
        result.workflow = data.workflow
      }

    } catch (error) {
      result.errors.push(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return result
  }

  /**
   * Import workflow from file
   */
  static importFromFile(file: File): Promise<WorkflowImportResult> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        const content = event.target?.result as string
        const result = this.importFromJSON(content)
        resolve(result)
      }
      
      reader.onerror = () => {
        resolve({
          success: false,
          errors: ['Failed to read file'],
          warnings: [],
        })
      }
      
      reader.readAsText(file)
    })
  }

  /**
   * Validate workflow structure
   */
  private static validateWorkflowStructure(workflow: AIWorkflow): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required properties
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push('Workflow must have a nodes array')
    }

    if (!workflow.edges || !Array.isArray(workflow.edges)) {
      errors.push('Workflow must have an edges array')
    }

    if (!workflow.modules || !Array.isArray(workflow.modules)) {
      errors.push('Workflow must have a modules array')
    }

    if (!workflow.configuration || typeof workflow.configuration !== 'object') {
      errors.push('Workflow must have a configuration object')
    }

    // Validate nodes
    if (workflow.nodes) {
      workflow.nodes.forEach((node, index) => {
        if (!node.id) {
          errors.push(`Node at index ${index} is missing an id`)
        }
        if (!node.type) {
          errors.push(`Node ${node.id || index} is missing a type`)
        }
        if (!node.label) {
          warnings.push(`Node ${node.id || index} is missing a label`)
        }
        if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
          errors.push(`Node ${node.id || index} has invalid position`)
        }
      })
    }

    // Validate edges
    if (workflow.edges) {
      workflow.edges.forEach((edge, index) => {
        if (!edge.id) {
          errors.push(`Edge at index ${index} is missing an id`)
        }
        if (!edge.source) {
          errors.push(`Edge ${edge.id || index} is missing a source`)
        }
        if (!edge.target) {
          errors.push(`Edge ${edge.id || index} is missing a target`)
        }
        
        // Check if source and target nodes exist
        if (workflow.nodes) {
          const sourceExists = workflow.nodes.some(node => node.id === edge.source)
          const targetExists = workflow.nodes.some(node => node.id === edge.target)
          
          if (!sourceExists) {
            errors.push(`Edge ${edge.id || index} references non-existent source node: ${edge.source}`)
          }
          if (!targetExists) {
            errors.push(`Edge ${edge.id || index} references non-existent target node: ${edge.target}`)
          }
        }
      })
    }

    // Validate modules
    if (workflow.modules) {
      workflow.modules.forEach((module, index) => {
        if (!module.id) {
          errors.push(`Module at index ${index} is missing an id`)
        }
        if (!module.name) {
          errors.push(`Module ${module.id || index} is missing a name`)
        }
        if (!module.nodes || !Array.isArray(module.nodes)) {
          warnings.push(`Module ${module.id || index} has no associated nodes`)
        }
        
        // Check if module nodes exist in workflow
        if (module.nodes && workflow.nodes) {
          module.nodes.forEach(nodeId => {
            const nodeExists = workflow.nodes.some(node => node.id === nodeId)
            if (!nodeExists) {
              warnings.push(`Module ${module.id || index} references non-existent node: ${nodeId}`)
            }
          })
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * Export modules configuration
   */
  static exportModulesConfig(
    modules: WorkflowModule[],
    configurations: Record<string, Record<string, any>>
  ): string {
    const exportData = {
      version: this.CURRENT_VERSION,
      timestamp: new Date(),
      modules: modules.map(module => ({
        ...module,
        configuration: configurations[module.id] || {},
      })),
    }

    return JSON.stringify(exportData, null, 2)
  }

  /**
   * Import modules configuration
   */
  static importModulesConfig(jsonData: string): {
    success: boolean
    modules?: WorkflowModule[]
    configurations?: Record<string, Record<string, any>>
    errors: string[]
  } {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.modules || !Array.isArray(data.modules)) {
        return {
          success: false,
          errors: ['Invalid modules data format'],
        }
      }

      const modules: WorkflowModule[] = []
      const configurations: Record<string, Record<string, any>> = {}

      data.modules.forEach((moduleData: any) => {
        const { configuration, ...module } = moduleData
        modules.push(module)
        if (configuration) {
          configurations[module.id] = configuration
        }
      })

      return {
        success: true,
        modules,
        configurations,
        errors: [],
      }
    } catch (error) {
      return {
        success: false,
        errors: [`Failed to parse modules configuration: ${error instanceof Error ? error.message : 'Unknown error'}`],
      }
    }
  }

  /**
   * Create workflow template from existing workflow
   */
  static createTemplate(
    workflow: AIWorkflow,
    templateName: string,
    description?: string
  ): WorkflowExportData {
    // Clean up workflow for template use
    const templateWorkflow: AIWorkflow = {
      ...workflow,
      nodes: workflow.nodes.map(node => ({
        ...node,
        // Reset positions to a grid layout
        position: {
          x: 100 + (workflow.nodes.indexOf(node) % 3) * 300,
          y: 100 + Math.floor(workflow.nodes.indexOf(node) / 3) * 200,
        },
      })),
    }

    return {
      version: this.CURRENT_VERSION,
      timestamp: new Date(),
      workflow: templateWorkflow,
      metadata: {
        name: templateName,
        description: description || `Template created from workflow`,
        tags: ['template', 'custom'],
        complexity: this.determineComplexity(templateWorkflow),
      },
    }
  }

  /**
   * Determine workflow complexity based on structure
   */
  private static determineComplexity(workflow: AIWorkflow): 'simple' | 'moderate' | 'complex' {
    const nodeCount = workflow.nodes.length
    const moduleCount = workflow.modules.length
    const hasDecisionNodes = workflow.nodes.some(node => node.type === 'DECISION')
    const hasParallelExecution = workflow.configuration.parallel

    if (nodeCount <= 5 && moduleCount <= 2 && !hasDecisionNodes) {
      return 'simple'
    } else if (nodeCount <= 10 && moduleCount <= 5 && (!hasDecisionNodes || !hasParallelExecution)) {
      return 'moderate'
    } else {
      return 'complex'
    }
  }

  /**
   * Merge workflows (combine nodes, edges, and modules)
   */
  static mergeWorkflows(
    baseWorkflow: AIWorkflow,
    additionalWorkflow: AIWorkflow,
    offsetX: number = 500,
    offsetY: number = 0
  ): AIWorkflow {
    // Create unique IDs for additional workflow elements
    const idMapping: Record<string, string> = {}
    
    const mergedNodes = [
      ...baseWorkflow.nodes,
      ...additionalWorkflow.nodes.map(node => {
        const newId = `${node.id}-merged-${Date.now()}`
        idMapping[node.id] = newId
        
        return {
          ...node,
          id: newId,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY,
          },
        }
      }),
    ]

    const mergedEdges = [
      ...baseWorkflow.edges,
      ...additionalWorkflow.edges.map(edge => ({
        ...edge,
        id: `${edge.id}-merged-${Date.now()}`,
        source: idMapping[edge.source] || edge.source,
        target: idMapping[edge.target] || edge.target,
      })),
    ]

    const mergedModules = [
      ...baseWorkflow.modules,
      ...additionalWorkflow.modules.map(module => ({
        ...module,
        id: `${module.id}-merged-${Date.now()}`,
        nodes: module.nodes.map(nodeId => idMapping[nodeId] || nodeId),
      })),
    ]

    return {
      nodes: mergedNodes,
      edges: mergedEdges,
      modules: mergedModules,
      configuration: {
        ...baseWorkflow.configuration,
        // Merge configurations intelligently
        parallel: baseWorkflow.configuration.parallel || additionalWorkflow.configuration.parallel,
        timeout: Math.max(baseWorkflow.configuration.timeout, additionalWorkflow.configuration.timeout),
        retries: Math.max(baseWorkflow.configuration.retries, additionalWorkflow.configuration.retries),
        fallbackEnabled: baseWorkflow.configuration.fallbackEnabled || additionalWorkflow.configuration.fallbackEnabled,
      },
    }
  }
}