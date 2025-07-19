import {
  CodingPromptTemplate,
  GeneratedCodingPrompt,
  PromptValidationResult,
  PromptTestResult,
  ValidationError,
  ValidationWarning,
  CodingTool,
  PromptCategory,
  DifficultyLevel
} from '@/types/coding-prompts'

export class PromptValidator {
  /**
   * Validate a coding prompt template
   */
  validateTemplate(template: CodingPromptTemplate): PromptValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    // Validate required fields
    if (!template.id || template.id.trim() === '') {
      errors.push({ field: 'id', message: 'Template ID is required', severity: 'error' })
      score -= 15
    }

    if (!template.name || template.name.trim() === '') {
      errors.push({ field: 'name', message: 'Template name is required', severity: 'error' })
      score -= 15
    }

    if (!template.template || template.template.trim() === '') {
      errors.push({ field: 'template', message: 'Template content is required', severity: 'error' })
      score -= 25
    }

    // Validate template structure
    if (template.template) {
      const structureScore = this.validateTemplateStructure(template.template)
      score += structureScore.score - 100 // Adjust base score
      errors.push(...structureScore.errors)
      warnings.push(...structureScore.warnings)
      suggestions.push(...structureScore.suggestions)
    }

    // Validate variables
    const variableValidation = this.validateTemplateVariables(template)
    score += variableValidation.score - 100
    errors.push(...variableValidation.errors)
    warnings.push(...variableValidation.warnings)
    suggestions.push(...variableValidation.suggestions)

    // Validate metadata
    if (!template.supportedTools || template.supportedTools.length === 0) {
      warnings.push({ 
        field: 'supportedTools', 
        message: 'No supported tools specified',
        suggestion: 'Add at least one supported coding tool'
      })
      score -= 5
    }

    if (!template.tags || template.tags.length === 0) {
      suggestions.push('Add tags to improve template discoverability')
      score -= 3
    }

    // Validate expected output
    if (!template.expectedOutput) {
      warnings.push({
        field: 'expectedOutput',
        message: 'Expected output not specified',
        suggestion: 'Define expected output to help users understand what to expect'
      })
      score -= 5
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: Math.max(0, Math.min(100, score))
    }
  }

  /**
   * Validate a generated prompt
   */
  validateGeneratedPrompt(prompt: GeneratedCodingPrompt): PromptValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    // Validate basic fields
    if (!prompt.prompt || prompt.prompt.trim() === '') {
      errors.push({ field: 'prompt', message: 'Prompt content is required', severity: 'error' })
      score -= 30
    }

    if (!prompt.title || prompt.title.trim() === '') {
      errors.push({ field: 'title', message: 'Prompt title is required', severity: 'error' })
      score -= 10
    }

    // Validate prompt content
    if (prompt.prompt) {
      const contentValidation = this.validatePromptContent(prompt.prompt, prompt.tool)
      score += contentValidation.score - 100
      errors.push(...contentValidation.errors)
      warnings.push(...contentValidation.warnings)
      suggestions.push(...contentValidation.suggestions)
    }

    // Validate context
    if (!prompt.context) {
      warnings.push({
        field: 'context',
        message: 'No context provided',
        suggestion: 'Include project context for better results'
      })
      score -= 10
    } else {
      const contextValidation = this.validatePromptContext(prompt.context)
      score += contextValidation.score - 100
      warnings.push(...contextValidation.warnings)
      suggestions.push(...contextValidation.suggestions)
    }

    // Validate tool compatibility
    const toolValidation = this.validateToolCompatibility(prompt.prompt, prompt.tool)
    score += toolValidation.score - 100
    warnings.push(...toolValidation.warnings)
    suggestions.push(...toolValidation.suggestions)

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      score: Math.max(0, Math.min(100, score))
    }
  }

  /**
   * Test a prompt for effectiveness
   */
  async testPrompt(prompt: GeneratedCodingPrompt, testType: 'syntax' | 'completeness' | 'clarity' | 'effectiveness'): Promise<PromptTestResult> {
    const startTime = Date.now()
    
    let score = 0
    let feedback = ''
    const suggestions: string[] = []

    switch (testType) {
      case 'syntax':
        {
          const result = this.testSyntax(prompt.prompt)
          score = result.score
          feedback = result.feedback
          suggestions.push(...result.suggestions)
        }
        break
      
      case 'completeness':
        {
          const result = this.testCompleteness(prompt.prompt, prompt.context)
          score = result.score
          feedback = result.feedback
          suggestions.push(...result.suggestions)
        }
        break
      
      case 'clarity':
        {
          const result = this.testClarity(prompt.prompt)
          score = result.score
          feedback = result.feedback
          suggestions.push(...result.suggestions)
        }
        break
      
      case 'effectiveness':
        {
          const result = await this.testEffectiveness(prompt)
          score = result.score
          feedback = result.feedback
          suggestions.push(...result.suggestions)
        }
        break
    }

    return {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      promptId: prompt.id,
      tool: prompt.tool,
      testType,
      score,
      feedback,
      suggestions,
      executedAt: new Date(),
      duration: Date.now() - startTime
    }
  }

  /**
   * Validate template structure
   */
  private validateTemplateStructure(template: string): PromptValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    // Check for essential sections
    const requiredSections = ['Context', 'Task', 'Requirements']
    const recommendedSections = ['Implementation', 'Quality', 'Documentation']

    requiredSections.forEach(section => {
      if (!template.includes(section)) {
        errors.push({
          field: 'template',
          message: `Missing required section: ${section}`,
          severity: 'error'
        })
        score -= 15
      }
    })

    recommendedSections.forEach(section => {
      if (!template.includes(section)) {
        suggestions.push(`Consider adding a ${section} section for better guidance`)
        score -= 5
      }
    })

    // Check for variable placeholders
    const variablePattern = /{{(\w+)}}/g
    const variables = template.match(variablePattern)
    if (!variables || variables.length === 0) {
      warnings.push({
        field: 'template',
        message: 'No template variables found',
        suggestion: 'Add variables to make the template more flexible'
      })
      score -= 10
    }

    // Check template length
    if (template.length < 200) {
      warnings.push({
        field: 'template',
        message: 'Template is quite short',
        suggestion: 'Consider adding more detailed instructions'
      })
      score -= 10
    }

    if (template.length > 5000) {
      warnings.push({
        field: 'template',
        message: 'Template is very long',
        suggestion: 'Consider breaking into smaller, focused templates'
      })
      score -= 5
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions, score }
  }

  /**
   * Validate template variables
   */
  private validateTemplateVariables(template: CodingPromptTemplate): PromptValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    // Extract variables from template content
    const templateVariables = new Set<string>()
    const variablePattern = /{{(\w+)}}/g
    let match
    while ((match = variablePattern.exec(template.template)) !== null) {
      templateVariables.add(match[1])
    }

    // Check if all template variables are defined
    templateVariables.forEach(varName => {
      const isDefined = template.variables.some(v => v.name === varName)
      if (!isDefined) {
        errors.push({
          field: 'variables',
          message: `Template variable '${varName}' is not defined`,
          severity: 'error'
        })
        score -= 10
      }
    })

    // Check if all defined variables are used
    template.variables.forEach(variable => {
      if (!templateVariables.has(variable.name)) {
        warnings.push({
          field: 'variables',
          message: `Defined variable '${variable.name}' is not used in template`,
          suggestion: 'Remove unused variable or add it to the template'
        })
        score -= 5
      }

      // Validate variable definition
      if (!variable.description || variable.description.trim() === '') {
        warnings.push({
          field: 'variables',
          message: `Variable '${variable.name}' lacks description`,
          suggestion: 'Add description to help users understand the variable purpose'
        })
        score -= 3
      }

      // Check for validation rules on required variables
      if (variable.required && !variable.validation) {
        suggestions.push(`Consider adding validation rules for required variable '${variable.name}'`)
        score -= 2
      }
    })

    return { isValid: errors.length === 0, errors, warnings, suggestions, score }
  }

  /**
   * Validate prompt content
   */
  private validatePromptContent(prompt: string, tool: CodingTool): PromptValidationResult {
    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    // Check prompt length
    if (prompt.length < 100) {
      errors.push({
        field: 'prompt',
        message: 'Prompt is too short to be effective',
        severity: 'error'
      })
      score -= 20
    }

    if (prompt.length > 8000) {
      warnings.push({
        field: 'prompt',
        message: 'Prompt is very long and may be overwhelming',
        suggestion: 'Consider breaking into smaller, focused prompts'
      })
      score -= 10
    }

    // Check for clear structure
    const hasHeaders = /^#+\s/m.test(prompt)
    if (!hasHeaders) {
      warnings.push({
        field: 'prompt',
        message: 'Prompt lacks clear structure with headers',
        suggestion: 'Use markdown headers to organize content'
      })
      score -= 10
    }

    // Check for specific instructions
    const hasSpecificInstructions = /\b(create|implement|build|write|add|configure)\b/i.test(prompt)
    if (!hasSpecificInstructions) {
      warnings.push({
        field: 'prompt',
        message: 'Prompt lacks specific action words',
        suggestion: 'Use clear action verbs to specify what should be done'
      })
      score -= 15
    }

    // Check for code quality mentions
    const hasQualityGuidelines = /\b(test|quality|error handling|validation|security)\b/i.test(prompt)
    if (!hasQualityGuidelines) {
      suggestions.push('Consider adding code quality and testing requirements')
      score -= 5
    }

    return { isValid: errors.length === 0, errors, warnings, suggestions, score }
  }

  /**
   * Validate prompt context
   */
  private validatePromptContext(context: any): PromptValidationResult {
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    if (!context.techStack || Object.keys(context.techStack).length === 0) {
      warnings.push({
        field: 'context.techStack',
        message: 'No tech stack information provided',
        suggestion: 'Include tech stack details for better prompt generation'
      })
      score -= 15
    }

    if (!context.features || context.features.length === 0) {
      warnings.push({
        field: 'context.features',
        message: 'No features specified',
        suggestion: 'Include feature list to generate more targeted prompts'
      })
      score -= 10
    }

    if (!context.architecture) {
      suggestions.push('Include architecture information for better context')
      score -= 5
    }

    if (!context.codeStyle) {
      suggestions.push('Include code style preferences for consistent output')
      score -= 5
    }

    return { isValid: true, errors: [], warnings, suggestions, score }
  }

  /**
   * Validate tool compatibility
   */
  private validateToolCompatibility(prompt: string, tool: CodingTool): PromptValidationResult {
    const warnings: ValidationWarning[] = []
    const suggestions: string[] = []
    let score = 100

    const toolSpecificFeatures: Record<CodingTool, string[]> = {
      [CodingTool.CURSOR]: ['multi-file editing', 'codebase understanding', 'terminal integration'],
      [CodingTool.CLAUDE_DEV]: ['reasoning', 'context maintenance', 'step-by-step'],
      [CodingTool.GITHUB_COPILOT]: ['autocomplete', 'pattern recognition', 'comments'],
      [CodingTool.CODEIUM]: ['autocomplete', 'multi-language', 'refactoring'],
      [CodingTool.TABNINE]: ['team learning', 'code review', 'documentation'],
      [CodingTool.CUSTOM]: []
    }

    const features = toolSpecificFeatures[tool] || []
    const hasToolSpecificInstructions = features.some(feature => 
      prompt.toLowerCase().includes(feature.toLowerCase())
    )

    if (!hasToolSpecificInstructions && tool !== CodingTool.CUSTOM) {
      suggestions.push(`Consider adding ${tool}-specific instructions for better results`)
      score -= 10
    }

    // Check for tool-incompatible instructions
    if (tool === CodingTool.GITHUB_COPILOT && prompt.includes('multi-file editing')) {
      warnings.push({
        field: 'prompt',
        message: 'GitHub Copilot has limited multi-file editing capabilities',
        suggestion: 'Focus on single-file operations or use comments for guidance'
      })
      score -= 5
    }

    return { isValid: true, errors: [], warnings, suggestions, score }
  }

  /**
   * Test prompt syntax
   */
  private testSyntax(prompt: string): { score: number; feedback: string; suggestions: string[] } {
    let score = 100
    const suggestions: string[] = []
    const issues: string[] = []

    // Check for markdown syntax issues
    const unbalancedHeaders = prompt.match(/^#+\s*$/gm)
    if (unbalancedHeaders) {
      issues.push('Empty headers found')
      suggestions.push('Remove empty headers or add content')
      score -= 10
    }

    // Check for unmatched brackets
    const openBrackets = (prompt.match(/\[/g) || []).length
    const closeBrackets = (prompt.match(/\]/g) || []).length
    if (openBrackets !== closeBrackets) {
      issues.push('Unmatched square brackets')
      suggestions.push('Check for unmatched brackets in markdown links')
      score -= 5
    }

    // Check for consistent list formatting
    const listItems = prompt.match(/^[\s]*[-*+]\s/gm)
    const numberedItems = prompt.match(/^[\s]*\d+\.\s/gm)
    if (listItems && numberedItems) {
      suggestions.push('Consider using consistent list formatting (either bullets or numbers)')
      score -= 3
    }

    const feedback = issues.length > 0 
      ? `Syntax issues found: ${issues.join(', ')}`
      : 'Syntax looks good'

    return { score, feedback, suggestions }
  }

  /**
   * Test prompt completeness
   */
  private testCompleteness(prompt: string, context: any): { score: number; feedback: string; suggestions: string[] } {
    let score = 100
    const suggestions: string[] = []
    const missing: string[] = []

    // Check for essential sections
    const requiredSections = ['Context', 'Task', 'Requirements']
    requiredSections.forEach(section => {
      if (!prompt.includes(section)) {
        missing.push(section)
        score -= 15
      }
    })

    // Check for implementation details
    if (!prompt.toLowerCase().includes('implement') && !prompt.toLowerCase().includes('create')) {
      missing.push('Implementation instructions')
      score -= 10
    }

    // Check for quality requirements
    if (!prompt.toLowerCase().includes('test') && !prompt.toLowerCase().includes('quality')) {
      suggestions.push('Add testing and quality requirements')
      score -= 10
    }

    // Check context usage
    if (context && context.techStack && !prompt.includes('Tech Stack')) {
      suggestions.push('Include tech stack information in the prompt')
      score -= 5
    }

    const feedback = missing.length > 0
      ? `Missing sections: ${missing.join(', ')}`
      : 'Prompt appears complete'

    return { score, feedback, suggestions }
  }

  /**
   * Test prompt clarity
   */
  private testClarity(prompt: string): { score: number; feedback: string; suggestions: string[] } {
    let score = 100
    const suggestions: string[] = []
    const issues: string[] = []

    // Check for clear action words
    const actionWords = ['create', 'implement', 'build', 'write', 'add', 'configure', 'setup', 'develop']
    const hasActionWords = actionWords.some(word => prompt.toLowerCase().includes(word))
    if (!hasActionWords) {
      issues.push('Lacks clear action words')
      suggestions.push('Use specific action verbs to clarify what should be done')
      score -= 15
    }

    // Check for ambiguous language
    const ambiguousWords = ['maybe', 'perhaps', 'might', 'could be', 'possibly']
    const hasAmbiguousWords = ambiguousWords.some(word => prompt.toLowerCase().includes(word))
    if (hasAmbiguousWords) {
      issues.push('Contains ambiguous language')
      suggestions.push('Use definitive language for clearer instructions')
      score -= 10
    }

    // Check sentence length (readability)
    const sentences = prompt.split(/[.!?]+/)
    const longSentences = sentences.filter(s => s.split(' ').length > 25)
    if (longSentences.length > 0) {
      suggestions.push('Consider breaking down long sentences for better readability')
      score -= 5
    }

    // Check for numbered steps
    const hasNumberedSteps = /^\d+\.\s/m.test(prompt)
    if (!hasNumberedSteps && prompt.length > 500) {
      suggestions.push('Consider using numbered steps for complex instructions')
      score -= 5
    }

    const feedback = issues.length > 0
      ? `Clarity issues: ${issues.join(', ')}`
      : 'Prompt is clear and well-structured'

    return { score, feedback, suggestions }
  }

  /**
   * Test prompt effectiveness
   */
  private async testEffectiveness(prompt: GeneratedCodingPrompt): Promise<{ score: number; feedback: string; suggestions: string[] }> {
    let score = 100
    const suggestions: string[] = []
    const strengths: string[] = []

    // Check for comprehensive coverage
    if (prompt.prompt.includes('testing')) strengths.push('includes testing requirements')
    if (prompt.prompt.includes('documentation')) strengths.push('includes documentation requirements')
    if (prompt.prompt.includes('error handling')) strengths.push('includes error handling')
    if (prompt.prompt.includes('security')) strengths.push('includes security considerations')

    // Check for tool optimization
    const toolName = prompt.tool.toLowerCase()
    if (prompt.prompt.toLowerCase().includes(toolName)) {
      strengths.push('optimized for specific tool')
    } else {
      suggestions.push(`Add ${prompt.tool}-specific instructions for better results`)
      score -= 10
    }

    // Check for context utilization
    if (prompt.context && prompt.context.techStack) {
      const techStackMentioned = Object.values(prompt.context.techStack)
        .flat()
        .some(tech => prompt.prompt.toLowerCase().includes(tech.toLowerCase()))
      
      if (techStackMentioned) {
        strengths.push('utilizes project tech stack')
      } else {
        suggestions.push('Better integrate tech stack information into instructions')
        score -= 5
      }
    }

    // Check estimated time vs complexity
    if (prompt.estimatedTime > 480 && prompt.difficulty === DifficultyLevel.BEGINNER) {
      suggestions.push('Consider breaking down this complex task for beginners')
      score -= 10
    }

    const feedback = strengths.length > 0
      ? `Effective prompt with: ${strengths.join(', ')}`
      : 'Prompt could be more effective with improvements'

    return { score, feedback, suggestions }
  }
}