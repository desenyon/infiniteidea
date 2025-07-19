import { 
  CodingPromptTemplate,
  GeneratedCodingPrompt,
  PromptContext,
  PromptGenerationRequest,
  PromptGenerationResponse,
  CodingTool,
  PromptCategory,
  DifficultyLevel,
  PromptValidationResult,
  PromptOptimization
} from '@/types/coding-prompts'
import { 
  getCodingPromptTemplate,
  getAllCodingPromptTemplates,
  getCodingPromptTemplatesByCategory,
  getCodingPromptTemplatesByTool,
  getCodingPromptTemplatesByDifficulty
} from './coding-prompt-templates'
import { Blueprint } from '@/types'

export class CodingPromptGenerator {
  private templates: Map<string, CodingPromptTemplate> = new Map()

  constructor() {
    this.loadTemplates()
  }

  private loadTemplates(): void {
    const templates = getAllCodingPromptTemplates()
    templates.forEach(template => {
      this.templates.set(template.id, template)
    })
  }

  /**
   * Generate coding prompts based on a blueprint and preferences
   */
  async generatePrompts(request: PromptGenerationRequest): Promise<PromptGenerationResponse> {
    try {
      const context = this.buildPromptContext(request.blueprint)
      const relevantTemplates = this.selectRelevantTemplates(request)
      const prompts: GeneratedCodingPrompt[] = []

      for (const template of relevantTemplates) {
        const tool = request.preferences?.tool || (request as any).tool;
        const prompt = await this.generatePromptFromTemplate(
          template,
          context,
          tool,
          request.customInstructions
        )
        
        if (prompt) {
          prompts.push(prompt)
        }
      }

      // Optimize prompts for the specific tool if requested
      if (request.preferences.optimizeForTool) {
        for (let i = 0; i < prompts.length; i++) {
          const optimized = await this.optimizePromptForTool(prompts[i], request.preferences.tool)
          if (optimized) {
            prompts[i].prompt = optimized.optimizedPrompt
          }
        }
      }

      return {
        prompts,
        metadata: {
          totalGenerated: prompts.length,
          categories: [...new Set(prompts.map(p => template => template.category))],
          estimatedTotalTime: prompts.reduce((total, p) => total + p.estimatedTime, 0),
          recommendations: this.generateRecommendations(prompts, context)
        },
        context,
        generatedAt: new Date()
      }
    } catch (error) {
      console.error('Error generating coding prompts:', error)
      throw new Error('Failed to generate coding prompts')
    }
  }

  /**
   * Build prompt context from blueprint
   */
  private buildPromptContext(blueprint: any): PromptContext {
    return {
      techStack: {
        frontend: blueprint.techStack?.frontend?.map((tech: any) => tech.name) || [],
        backend: blueprint.techStack?.backend?.map((tech: any) => tech.name) || [],
        database: blueprint.techStack?.database?.map((tech: any) => tech.name) || [],
        aiServices: blueprint.techStack?.aiServices?.map((service: any) => service.name) || [],
        deployment: blueprint.techStack?.deployment?.map((option: any) => option.platform) || []
      },
      features: blueprint.productPlan?.coreFeatures?.map((feature: any) => feature.name) || [],
      architecture: this.inferArchitecture(blueprint.techStack),
      projectStructure: this.generateProjectStructure(blueprint.techStack),
      dependencies: this.extractDependencies(blueprint.techStack),
      codeStyle: {
        language: this.inferPrimaryLanguage(blueprint.techStack),
        conventions: {
          naming: 'camelCase',
          indentation: 'spaces',
          indentSize: 2,
          quotes: 'single',
          semicolons: true
        },
        patterns: ['MVC', 'Repository', 'Service Layer'],
        linting: {
          enabled: true,
          rules: ['eslint:recommended', '@typescript-eslint/recommended']
        },
        formatting: {
          enabled: true,
          tool: 'prettier'
        }
      },
      constraints: blueprint.constraints || []
    }
  }

  /**
   * Select relevant templates based on request preferences
   */
  private selectRelevantTemplates(request: PromptGenerationRequest): CodingPromptTemplate[] {
    let templates = getAllCodingPromptTemplates()

    // Filter by tool support
    const tool = request.preferences?.tool || (request as any).tool;
    if (tool) {
      templates = templates.filter(template => 
        template.supportedTools.includes(tool)
      )
    }

    // Filter by categories if specified
    const categories = request.preferences?.categories || [];
    if (categories.length > 0) {
      templates = templates.filter(template =>
        categories.includes(template.category)
      )
    }

    // Filter by difficulty
    const difficulty = request.preferences?.difficulty || DifficultyLevel.INTERMEDIATE;
    templates = templates.filter(template =>
      template.difficulty <= difficulty ||
      template.difficulty === DifficultyLevel.BEGINNER
    )

    // Sort by relevance and usage
    templates.sort((a, b) => {
      // Prioritize setup templates for new projects
      if (a.category === PromptCategory.SETUP && b.category !== PromptCategory.SETUP) return -1
      if (b.category === PromptCategory.SETUP && a.category !== PromptCategory.SETUP) return 1
      
      // Then by usage count
      return b.usageCount - a.usageCount
    })

    return templates
  }

  /**
   * Generate a prompt from a template
   */
  private async generatePromptFromTemplate(
    template: CodingPromptTemplate,
    context: PromptContext,
    tool: CodingTool,
    customInstructions?: string
  ): Promise<GeneratedCodingPrompt | null> {
    try {
      const variables = this.buildTemplateVariables(template, context)
      const prompt = this.renderTemplate(template.template, variables)
      
      // Add custom instructions if provided
      const finalPrompt = customInstructions 
        ? `${prompt}\n\n## Additional Instructions\n${customInstructions}`
        : prompt

      return {
        id: `${template.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: template.id,
        title: template.name,
        description: template.description,
        prompt: finalPrompt,
        context,
        tool,
        difficulty: template.difficulty,
        estimatedTime: this.estimateImplementationTime(template, context),
        tags: template.tags,
        generatedAt: new Date(),
        projectId: '', // Will be set by caller
        userId: '' // Will be set by caller
      }
    } catch (error) {
      console.error(`Error generating prompt from template ${template.id}:`, error)
      return null
    }
  }

  /**
   * Build variables for template rendering
   */
  private buildTemplateVariables(template: CodingPromptTemplate, context: PromptContext): Record<string, any> {
    const variables: Record<string, any> = {}

    template.variables.forEach(variable => {
      switch (variable.name) {
        case 'projectName':
          variables[variable.name] = 'MyProject' // Default, should be provided by caller
          break
        case 'projectType':
          variables[variable.name] = this.inferProjectType(context)
          break
        case 'frontend':
          variables[variable.name] = context.techStack.frontend
          break
        case 'backend':
          variables[variable.name] = context.techStack.backend
          break
        case 'database':
          variables[variable.name] = context.techStack.database
          break
        case 'aiServices':
          variables[variable.name] = context.techStack.aiServices
          break
        case 'deployment':
          variables[variable.name] = context.techStack.deployment
          break
        case 'features':
          variables[variable.name] = context.features
          break
        case 'codeStyle':
          variables[variable.name] = context.codeStyle
          break
        case 'constraints':
          variables[variable.name] = context.constraints
          break
        default:
          if (variable.defaultValue !== undefined) {
            variables[variable.name] = variable.defaultValue
          }
      }
    })

    return variables
  }

  /**
   * Render template with variables using simple string replacement
   */
  private renderTemplate(template: string, variables: Record<string, any>): string {
    let rendered = template

    // Handle simple variable substitution
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g')
      const replacement = Array.isArray(value) ? value.join(', ') : String(value)
      rendered = rendered.replace(placeholder, replacement)
    })

    // Handle array iterations (simplified Handlebars-like syntax)
    rendered = rendered.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
      const array = variables[arrayName]
      if (!Array.isArray(array)) return ''
      
      return array.map(item => content.replace(/{{this}}/g, String(item))).join('\n')
    })

    // Handle conditionals (simplified)
    rendered = rendered.replace(/{{#if ([\w.]+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g, (match, condition, trueContent, falseContent) => {
      const value = this.evaluateCondition(condition, variables)
      return value ? trueContent : falseContent
    })

    rendered = rendered.replace(/{{#if ([\w.]+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      const value = this.evaluateCondition(condition, variables)
      return value ? content : ''
    })

    return rendered.trim()
  }

  /**
   * Evaluate simple conditions for template rendering
   */
  private evaluateCondition(condition: string, variables: Record<string, any>): boolean {
    // Handle simple equality checks like (eq deploymentPlatform "vercel")
    const eqMatch = condition.match(/\(eq (\w+) "([^"]+)"\)/)
    if (eqMatch) {
      const [, varName, value] = eqMatch
      return variables[varName] === value
    }

    // Handle simple variable existence
    const parts = condition.split('.')
    let value = variables[parts[0]]
    for (let i = 1; i < parts.length; i++) {
      value = value?.[parts[i]]
    }
    
    return Boolean(value)
  }

  /**
   * Optimize prompt for specific coding tool
   */
  private async optimizePromptForTool(prompt: GeneratedCodingPrompt, tool: CodingTool): Promise<PromptOptimization | null> {
    const optimizations: Record<CodingTool, (prompt: string) => string> = {
      [CodingTool.CURSOR]: (p) => this.optimizeForCursor(p),
      [CodingTool.CLAUDE_DEV]: (p) => this.optimizeForClaudeDev(p),
      [CodingTool.GITHUB_COPILOT]: (p) => this.optimizeForGitHubCopilot(p),
      [CodingTool.CODEIUM]: (p) => this.optimizeForCodeium(p),
      [CodingTool.TABNINE]: (p) => this.optimizeForTabnine(p),
      [CodingTool.CUSTOM]: (p) => p
    }

    const optimizer = optimizations[tool]
    if (!optimizer) return null

    const optimizedPrompt = optimizer(prompt.prompt)
    
    return {
      originalPrompt: prompt.prompt,
      optimizedPrompt,
      improvements: this.identifyImprovements(prompt.prompt, optimizedPrompt),
      metrics: {
        clarity: 85,
        specificity: 90,
        completeness: 88,
        efficiency: 92
      },
      tool,
      context: prompt.context
    }
  }

  /**
   * Optimize prompt for Cursor IDE
   */
  private optimizeForCursor(prompt: string): string {
    return `${prompt}

## Cursor-Specific Instructions
- Use Cursor's AI chat to ask questions about implementation details
- Leverage Cursor's codebase understanding for context-aware suggestions
- Use Cursor's multi-file editing capabilities for large refactors
- Take advantage of Cursor's terminal integration for running commands
- Use Cursor's diff view to review changes before applying`
  }

  /**
   * Optimize prompt for Claude Dev
   */
  private optimizeForClaudeDev(prompt: string): string {
    return `${prompt}

## Claude Dev Instructions
- Break down complex tasks into smaller, manageable steps
- Use Claude's reasoning capabilities to explain design decisions
- Leverage Claude's ability to understand and maintain context across files
- Ask Claude to review code for potential issues and improvements
- Use Claude's documentation generation capabilities`
  }

  /**
   * Optimize prompt for GitHub Copilot
   */
  private optimizeForGitHubCopilot(prompt: string): string {
    return `${prompt}

## GitHub Copilot Instructions
- Write clear, descriptive comments to guide Copilot suggestions
- Use meaningful function and variable names for better completions
- Leverage Copilot's pattern recognition for similar code structures
- Use Copilot Chat for explaining complex logic and debugging
- Take advantage of Copilot's test generation capabilities`
  }

  /**
   * Optimize prompt for Codeium
   */
  private optimizeForCodeium(prompt: string): string {
    return `${prompt}

## Codeium Instructions
- Use Codeium's autocomplete for rapid code generation
- Leverage Codeium's multi-language support for full-stack development
- Use Codeium's chat feature for code explanations and debugging
- Take advantage of Codeium's refactoring suggestions`
  }

  /**
   * Optimize prompt for Tabnine
   */
  private optimizeForTabnine(prompt: string): string {
    return `${prompt}

## Tabnine Instructions
- Use Tabnine's AI completions for faster coding
- Leverage Tabnine's team learning for consistent code patterns
- Use Tabnine's code review features for quality assurance
- Take advantage of Tabnine's documentation generation`
  }

  /**
   * Validate a generated prompt
   */
  validatePrompt(prompt: GeneratedCodingPrompt): PromptValidationResult {
    const errors: any[] = []
    const warnings: any[] = []
    const suggestions: string[] = []
    let score = 100

    // Check prompt length
    if (prompt.prompt.length < 100) {
      errors.push({ field: 'prompt', message: 'Prompt is too short', severity: 'error' })
      score -= 20
    }

    if (prompt.prompt.length > 10000) {
      warnings.push({ field: 'prompt', message: 'Prompt is very long', suggestion: 'Consider breaking into smaller prompts' })
      score -= 5
    }

    // Check for required sections
    const requiredSections = ['Context', 'Task', 'Requirements']
    requiredSections.forEach(section => {
      if (!prompt.prompt.includes(section)) {
        warnings.push({ field: 'prompt', message: `Missing ${section} section`, suggestion: `Add ${section} section for clarity` })
        score -= 10
      }
    })

    // Check for code style specifications
    if (!prompt.prompt.includes('Code Style') && !prompt.prompt.includes('coding standards')) {
      suggestions.push('Consider adding code style guidelines for consistency')
      score -= 5
    }

    // Check for testing requirements
    if (prompt.context.features.length > 0 && !prompt.prompt.toLowerCase().includes('test')) {
      suggestions.push('Consider adding testing requirements')
      score -= 10
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: Math.max(0, score)
    }
  }

  /**
   * Helper methods for context building
   */
  private inferArchitecture(techStack: any): string {
    const hasReact = techStack?.frontend?.some((tech: any) => tech.name.toLowerCase().includes('react'))
    const hasNode = techStack?.backend?.some((tech: any) => tech.name.toLowerCase().includes('node'))
    const hasNext = techStack?.frontend?.some((tech: any) => tech.name.toLowerCase().includes('next'))
    
    if (hasNext) return 'Full-stack Next.js with API routes'
    if (hasReact && hasNode) return 'React frontend with Node.js backend (SPA + API)'
    if (hasReact) return 'Single Page Application (SPA)'
    
    return 'Monolithic web application'
  }

  private inferProjectType(context: PromptContext): string {
    if (context.techStack?.aiServices?.length > 0) return 'AI-powered web application'
    if (context.features?.some(f => f?.toLowerCase?.()?.includes('mobile'))) return 'mobile application'
    if (context.features?.some(f => f?.toLowerCase?.()?.includes('api'))) return 'API service'
    return 'web application'
  }

  private inferPrimaryLanguage(techStack: any): string {
    const frontend = techStack?.frontend?.[0]?.name?.toLowerCase() || ''
    const backend = techStack?.backend?.[0]?.name?.toLowerCase() || ''
    
    if (frontend.includes('typescript') || backend.includes('typescript')) return 'typescript'
    if (frontend.includes('javascript') || backend.includes('node')) return 'javascript'
    if (backend.includes('python')) return 'python'
    if (backend.includes('java')) return 'java'
    if (backend.includes('go')) return 'go'
    
    return 'javascript'
  }

  private generateProjectStructure(techStack: any): string[] {
    const structure = ['src/', 'public/', 'docs/', 'tests/']
    
    if (techStack?.frontend?.some((tech: any) => tech.name.toLowerCase().includes('react'))) {
      structure.push('src/components/', 'src/hooks/', 'src/utils/')
    }
    
    if (techStack?.backend?.some((tech: any) => tech.name.toLowerCase().includes('node'))) {
      structure.push('src/api/', 'src/services/', 'src/models/')
    }
    
    return structure
  }

  private extractDependencies(techStack: any): string[] {
    const dependencies: string[] = []
    
    techStack?.frontend?.forEach((tech: any) => {
      if (tech.name.toLowerCase().includes('react')) dependencies.push('react', 'react-dom')
      if (tech.name.toLowerCase().includes('next')) dependencies.push('next')
      if (tech.name.toLowerCase().includes('typescript')) dependencies.push('typescript', '@types/node')
    })
    
    techStack?.backend?.forEach((tech: any) => {
      if (tech.name.toLowerCase().includes('express')) dependencies.push('express')
      if (tech.name.toLowerCase().includes('fastify')) dependencies.push('fastify')
    })
    
    return dependencies
  }

  private estimateImplementationTime(template: CodingPromptTemplate, context: PromptContext): number {
    const baseTime = {
      [PromptCategory.SETUP]: 120,
      [PromptCategory.FEATURE]: 240,
      [PromptCategory.TESTING]: 180,
      [PromptCategory.DEPLOYMENT]: 300,
      [PromptCategory.ARCHITECTURE]: 360,
      [PromptCategory.OPTIMIZATION]: 150,
      [PromptCategory.DEBUGGING]: 90,
      [PromptCategory.REFACTORING]: 120
    }

    const difficultyMultiplier = {
      [DifficultyLevel.BEGINNER]: 1,
      [DifficultyLevel.INTERMEDIATE]: 1.5,
      [DifficultyLevel.ADVANCED]: 2,
      [DifficultyLevel.EXPERT]: 2.5
    }

    const base = baseTime[template.category] || 180
    const multiplier = difficultyMultiplier[template.difficulty] || 1
    const complexityFactor = context.features.length > 5 ? 1.2 : 1

    return Math.round(base * multiplier * complexityFactor)
  }

  private generateRecommendations(prompts: GeneratedCodingPrompt[], context: PromptContext): string[] {
    const recommendations: string[] = []

    if (prompts.length === 0) {
      recommendations.push('No prompts generated. Consider adjusting your preferences or adding more features.')
      return recommendations
    }

    const setupPrompts = prompts.filter(p => p.tags.includes('setup'))
    if (setupPrompts.length === 0) {
      recommendations.push('Consider starting with project setup prompts to establish the foundation.')
    }

    const testingPrompts = prompts.filter(p => p.tags.includes('testing'))
    if (testingPrompts.length === 0 && context.features.length > 2) {
      recommendations.push('Add testing prompts to ensure code quality and reliability.')
    }

    const totalTime = prompts.reduce((sum, p) => sum + p.estimatedTime, 0)
    if (totalTime > 1440) { // More than 24 hours
      recommendations.push('Consider breaking down the implementation into smaller phases to manage complexity.')
    }

    if (context.techStack.aiServices.length > 0) {
      const aiPrompts = prompts.filter(p => p.tags.includes('ai'))
      if (aiPrompts.length === 0) {
        recommendations.push('Add AI integration prompts to leverage your selected AI services.')
      }
    }

    return recommendations
  }

  private identifyImprovements(original: string, optimized: string): string[] {
    const improvements: string[] = []
    
    if (optimized.length > original.length) {
      improvements.push('Added tool-specific instructions and best practices')
    }
    
    if (optimized.includes('Instructions')) {
      improvements.push('Included tool-specific optimization guidelines')
    }
    
    improvements.push('Enhanced prompt clarity and specificity')
    improvements.push('Improved tool compatibility and effectiveness')
    
    return improvements
  }
}