import {
  CodingPromptTemplate,
  PromptVersionControl,
  PromptChange,
  PromptAnalytics,
  PromptFeedback
} from '@/types/coding-prompts'

export class PromptVersionControl {
  private versions: Map<string, PromptVersionControl[]> = new Map()
  private analytics: Map<string, PromptAnalytics> = new Map()

  /**
   * Create a new version of a prompt template
   */
  createVersion(
    promptId: string,
    updatedTemplate: CodingPromptTemplate,
    originalTemplate: CodingPromptTemplate,
    author: string,
    message: string
  ): PromptVersionControl {
    const changes = this.detectChanges(originalTemplate, updatedTemplate)
    const versions = this.versions.get(promptId) || []
    const parentVersion = versions.find(v => v.isActive)?.version
    
    const newVersion: PromptVersionControl = {
      id: `${promptId}-v${this.generateVersionNumber(versions)}`,
      promptId,
      version: this.generateVersionNumber(versions),
      changes,
      author,
      message,
      createdAt: new Date(),
      parentVersion,
      isActive: true
    }

    // Deactivate previous active version
    versions.forEach(v => v.isActive = false)
    
    // Add new version
    versions.push(newVersion)
    this.versions.set(promptId, versions)

    return newVersion
  }

  /**
   * Get all versions for a prompt
   */
  getVersions(promptId: string): PromptVersionControl[] {
    return this.versions.get(promptId) || []
  }

  /**
   * Get active version for a prompt
   */
  getActiveVersion(promptId: string): PromptVersionControl | null {
    const versions = this.versions.get(promptId) || []
    return versions.find(v => v.isActive) || null
  }

  /**
   * Get specific version
   */
  getVersion(promptId: string, version: string): PromptVersionControl | null {
    const versions = this.versions.get(promptId) || []
    return versions.find(v => v.version === version) || null
  }

  /**
   * Rollback to a previous version
   */
  rollbackToVersion(promptId: string, targetVersion: string, author: string, reason: string): PromptVersionControl | null {
    const versions = this.versions.get(promptId) || []
    const targetVersionObj = versions.find(v => v.version === targetVersion)
    
    if (!targetVersionObj) {
      throw new Error(`Version ${targetVersion} not found for prompt ${promptId}`)
    }

    // Create a new version that's a copy of the target version
    const rollbackVersion: PromptVersionControl = {
      id: `${promptId}-v${this.generateVersionNumber(versions)}`,
      promptId,
      version: this.generateVersionNumber(versions),
      changes: [{
        type: 'modified',
        field: 'rollback',
        oldValue: versions.find(v => v.isActive)?.version,
        newValue: targetVersion,
        description: `Rolled back to version ${targetVersion}: ${reason}`
      }],
      author,
      message: `Rollback to version ${targetVersion}: ${reason}`,
      createdAt: new Date(),
      parentVersion: versions.find(v => v.isActive)?.version,
      isActive: true
    }

    // Deactivate current active version
    versions.forEach(v => v.isActive = false)
    
    // Add rollback version
    versions.push(rollbackVersion)
    this.versions.set(promptId, versions)

    return rollbackVersion
  }

  /**
   * Compare two versions
   */
  compareVersions(promptId: string, version1: string, version2: string): {
    version1: PromptVersionControl | null
    version2: PromptVersionControl | null
    differences: PromptChange[]
  } {
    const versions = this.versions.get(promptId) || []
    const v1 = versions.find(v => v.version === version1)
    const v2 = versions.find(v => v.version === version2)

    if (!v1 || !v2) {
      return {
        version1: v1 || null,
        version2: v2 || null,
        differences: []
      }
    }

    // Calculate differences between the two versions
    const differences = this.calculateVersionDifferences(v1, v2)

    return {
      version1: v1,
      version2: v2,
      differences
    }
  }

  /**
   * Get version history with changes
   */
  getVersionHistory(promptId: string): {
    versions: PromptVersionControl[]
    timeline: {
      version: string
      date: Date
      author: string
      message: string
      changeCount: number
    }[]
  } {
    const versions = this.versions.get(promptId) || []
    const sortedVersions = [...versions].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const timeline = sortedVersions.map(v => ({
      version: v.version,
      date: v.createdAt,
      author: v.author,
      message: v.message,
      changeCount: v.changes.length
    }))

    return {
      versions: sortedVersions,
      timeline
    }
  }

  /**
   * Track prompt usage and feedback
   */
  trackUsage(promptId: string, success: boolean, rating?: number, feedback?: string, userId?: string): void {
    let analytics = this.analytics.get(promptId)
    
    if (!analytics) {
      analytics = {
        promptId,
        usageStats: {
          totalUses: 0,
          successRate: 0,
          averageRating: 0,
          completionTime: 0
        },
        toolPerformance: [],
        contextEffectiveness: [],
        userFeedback: []
      }
    }

    // Update usage stats
    analytics.usageStats.totalUses += 1
    const successCount = success ? 1 : 0
    analytics.usageStats.successRate = (
      (analytics.usageStats.successRate * (analytics.usageStats.totalUses - 1) + successCount) / 
      analytics.usageStats.totalUses
    )

    // Update rating if provided
    if (rating !== undefined) {
      const currentRatingSum = analytics.usageStats.averageRating * (analytics.userFeedback.length)
      analytics.usageStats.averageRating = (currentRatingSum + rating) / (analytics.userFeedback.length + 1)
    }

    // Add feedback if provided
    if (feedback && userId) {
      analytics.userFeedback.push({
        userId,
        promptId,
        rating: rating || 0,
        feedback,
        improvements: [],
        tool: 'cursor' as any, // This should be passed as parameter
        createdAt: new Date()
      })
    }

    this.analytics.set(promptId, analytics)
  }

  /**
   * Get analytics for a prompt
   */
  getAnalytics(promptId: string): PromptAnalytics | null {
    return this.analytics.get(promptId) || null
  }

  /**
   * Get performance metrics across all prompts
   */
  getOverallMetrics(): {
    totalPrompts: number
    totalVersions: number
    averageVersionsPerPrompt: number
    mostActivePrompts: { promptId: string; versionCount: number }[]
    recentActivity: { promptId: string; version: string; date: Date; author: string }[]
  } {
    const totalPrompts = this.versions.size
    const allVersions = Array.from(this.versions.values()).flat()
    const totalVersions = allVersions.length
    const averageVersionsPerPrompt = totalPrompts > 0 ? totalVersions / totalPrompts : 0

    // Most active prompts (by version count)
    const mostActivePrompts = Array.from(this.versions.entries())
      .map(([promptId, versions]) => ({ promptId, versionCount: versions.length }))
      .sort((a, b) => b.versionCount - a.versionCount)
      .slice(0, 10)

    // Recent activity
    const recentActivity = allVersions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(v => ({
        promptId: v.promptId,
        version: v.version,
        date: v.createdAt,
        author: v.author
      }))

    return {
      totalPrompts,
      totalVersions,
      averageVersionsPerPrompt,
      mostActivePrompts,
      recentActivity
    }
  }

  /**
   * Export version history
   */
  exportVersionHistory(promptId: string): {
    promptId: string
    exportDate: Date
    versions: PromptVersionControl[]
    analytics: PromptAnalytics | null
  } {
    return {
      promptId,
      exportDate: new Date(),
      versions: this.versions.get(promptId) || [],
      analytics: this.analytics.get(promptId) || null
    }
  }

  /**
   * Import version history
   */
  importVersionHistory(data: {
    promptId: string
    versions: PromptVersionControl[]
    analytics?: PromptAnalytics
  }): void {
    this.versions.set(data.promptId, data.versions)
    if (data.analytics) {
      this.analytics.set(data.promptId, data.analytics)
    }
  }

  /**
   * Detect changes between two templates
   */
  private detectChanges(original: CodingPromptTemplate, updated: CodingPromptTemplate): PromptChange[] {
    const changes: PromptChange[] = []

    // Check basic fields
    if (original.name !== updated.name) {
      changes.push({
        type: 'modified',
        field: 'name',
        oldValue: original.name,
        newValue: updated.name,
        description: 'Template name changed'
      })
    }

    if (original.description !== updated.description) {
      changes.push({
        type: 'modified',
        field: 'description',
        oldValue: original.description,
        newValue: updated.description,
        description: 'Template description changed'
      })
    }

    if (original.template !== updated.template) {
      changes.push({
        type: 'modified',
        field: 'template',
        oldValue: this.truncateString(original.template, 100),
        newValue: this.truncateString(updated.template, 100),
        description: 'Template content modified'
      })
    }

    if (original.category !== updated.category) {
      changes.push({
        type: 'modified',
        field: 'category',
        oldValue: original.category,
        newValue: updated.category,
        description: 'Template category changed'
      })
    }

    if (original.difficulty !== updated.difficulty) {
      changes.push({
        type: 'modified',
        field: 'difficulty',
        oldValue: original.difficulty,
        newValue: updated.difficulty,
        description: 'Template difficulty changed'
      })
    }

    // Check supported tools
    const originalTools = new Set(original.supportedTools)
    const updatedTools = new Set(updated.supportedTools)
    
    const addedTools = [...updatedTools].filter(tool => !originalTools.has(tool))
    const removedTools = [...originalTools].filter(tool => !updatedTools.has(tool))

    if (addedTools.length > 0) {
      changes.push({
        type: 'added',
        field: 'supportedTools',
        newValue: addedTools,
        description: `Added support for tools: ${addedTools.join(', ')}`
      })
    }

    if (removedTools.length > 0) {
      changes.push({
        type: 'removed',
        field: 'supportedTools',
        oldValue: removedTools,
        description: `Removed support for tools: ${removedTools.join(', ')}`
      })
    }

    // Check variables
    const variableChanges = this.detectVariableChanges(original.variables, updated.variables)
    changes.push(...variableChanges)

    // Check tags
    const originalTags = new Set(original.tags)
    const updatedTags = new Set(updated.tags)
    
    const addedTags = [...updatedTags].filter(tag => !originalTags.has(tag))
    const removedTags = [...originalTags].filter(tag => !updatedTags.has(tag))

    if (addedTags.length > 0) {
      changes.push({
        type: 'added',
        field: 'tags',
        newValue: addedTags,
        description: `Added tags: ${addedTags.join(', ')}`
      })
    }

    if (removedTags.length > 0) {
      changes.push({
        type: 'removed',
        field: 'tags',
        oldValue: removedTags,
        description: `Removed tags: ${removedTags.join(', ')}`
      })
    }

    return changes
  }

  /**
   * Detect changes in template variables
   */
  private detectVariableChanges(originalVars: any[], updatedVars: any[]): PromptChange[] {
    const changes: PromptChange[] = []
    const originalVarMap = new Map(originalVars.map(v => [v.name, v]))
    const updatedVarMap = new Map(updatedVars.map(v => [v.name, v]))

    // Check for added variables
    updatedVars.forEach(variable => {
      if (!originalVarMap.has(variable.name)) {
        changes.push({
          type: 'added',
          field: 'variables',
          newValue: variable.name,
          description: `Added variable: ${variable.name}`
        })
      }
    })

    // Check for removed variables
    originalVars.forEach(variable => {
      if (!updatedVarMap.has(variable.name)) {
        changes.push({
          type: 'removed',
          field: 'variables',
          oldValue: variable.name,
          description: `Removed variable: ${variable.name}`
        })
      }
    })

    // Check for modified variables
    originalVars.forEach(originalVar => {
      const updatedVar = updatedVarMap.get(originalVar.name)
      if (updatedVar) {
        if (JSON.stringify(originalVar) !== JSON.stringify(updatedVar)) {
          changes.push({
            type: 'modified',
            field: 'variables',
            oldValue: originalVar.name,
            newValue: updatedVar.name,
            description: `Modified variable: ${originalVar.name}`
          })
        }
      }
    })

    return changes
  }

  /**
   * Calculate differences between two versions
   */
  private calculateVersionDifferences(v1: PromptVersionControl, v2: PromptVersionControl): PromptChange[] {
    // This is a simplified implementation
    // In a real scenario, you'd want to do a more sophisticated diff
    const allChanges = [...v1.changes, ...v2.changes]
    
    // Remove duplicates and conflicting changes
    const uniqueChanges = allChanges.filter((change, index, array) => 
      array.findIndex(c => c.field === change.field && c.type === change.type) === index
    )

    return uniqueChanges
  }

  /**
   * Generate version number
   */
  private generateVersionNumber(existingVersions: PromptVersionControl[]): string {
    if (existingVersions.length === 0) {
      return '1.0.0'
    }

    const latestVersion = existingVersions
      .map(v => v.version)
      .sort((a, b) => this.compareVersionStrings(b, a))[0]

    return this.incrementVersion(latestVersion)
  }

  /**
   * Compare version strings for sorting
   */
  private compareVersionStrings(a: string, b: string): number {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0
      const bPart = bParts[i] || 0

      if (aPart > bPart) return 1
      if (aPart < bPart) return -1
    }

    return 0
  }

  /**
   * Increment version number
   */
  private incrementVersion(version: string): string {
    const parts = version.split('.').map(Number)
    parts[2] = (parts[2] || 0) + 1 // Increment patch version
    return parts.join('.')
  }

  /**
   * Truncate string for display
   */
  private truncateString(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str
    return str.substring(0, maxLength) + '...'
  }
}