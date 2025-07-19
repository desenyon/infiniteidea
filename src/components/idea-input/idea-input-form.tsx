"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { IdeaInput, IdeaCategory } from '@/types'

// Industry options for quick selection
const INDUSTRY_OPTIONS = [
  'SaaS', 'E-commerce', 'FinTech', 'HealthTech', 'EdTech', 
  'AI/ML', 'Social Media', 'Marketplace', 'Gaming', 'IoT',
  'Real Estate', 'Food & Beverage', 'Travel', 'Entertainment'
]

// Target audience options
const AUDIENCE_OPTIONS = [
  'Small Businesses', 'Enterprise', 'Consumers', 'Developers',
  'Students', 'Professionals', 'Freelancers', 'Startups',
  'Healthcare Providers', 'Educators', 'Content Creators'
]

// Example prompts to inspire users
const EXAMPLE_PROMPTS = [
  {
    title: "AI-Powered Task Manager",
    prompt: "A smart task management app that uses AI to automatically prioritize tasks, suggest optimal work schedules, and integrate with calendar apps. It should learn from user behavior and provide productivity insights."
  },
  {
    title: "Local Service Marketplace",
    prompt: "A platform connecting homeowners with local service providers (plumbers, electricians, cleaners) featuring real-time booking, verified reviews, and instant messaging. Include payment processing and service guarantees."
  },
  {
    title: "Sustainable Fashion Platform",
    prompt: "An e-commerce platform for sustainable fashion brands with features like carbon footprint tracking, clothing lifecycle information, and a resale marketplace for pre-owned items."
  },
  {
    title: "Remote Team Collaboration Tool",
    prompt: "A comprehensive remote work platform combining video conferencing, project management, file sharing, and virtual whiteboarding with AI-powered meeting summaries and action item tracking."
  }
]

interface IdeaInputFormProps {
  onSubmit: (ideaInput: IdeaInput) => void
  isLoading?: boolean
  className?: string
}

export function IdeaInputForm({ onSubmit, isLoading = false, className }: IdeaInputFormProps) {
  const [description, setDescription] = useState('')
  const [industry, setIndustry] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [budget, setBudget] = useState<number | undefined>()
  const [timeline, setTimeline] = useState('')
  const [constraints, setConstraints] = useState<string[]>([])
  const [constraintInput, setConstraintInput] = useState('')
  const [showExamples, setShowExamples] = useState(false)

  // Character limits
  const MIN_DESCRIPTION_LENGTH = 50
  const MAX_DESCRIPTION_LENGTH = 2000
  const MAX_CONSTRAINT_LENGTH = 100

  // Validation
  const validation = useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []
    const suggestions: string[] = []

    if (description.length < MIN_DESCRIPTION_LENGTH) {
      errors.push(`Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`)
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`)
    }

    if (description.length > 0 && description.length < 100) {
      suggestions.push('Consider adding more details about your target users and key features')
    }

    if (!industry && description.length > MIN_DESCRIPTION_LENGTH) {
      suggestions.push('Select an industry to get more targeted recommendations')
    }

    if (!targetAudience && description.length > MIN_DESCRIPTION_LENGTH) {
      suggestions.push('Specify your target audience for better market analysis')
    }

    // Check for common missing elements
    const lowerDesc = description.toLowerCase()
    if (lowerDesc.length > 100) {
      if (!lowerDesc.includes('user') && !lowerDesc.includes('customer')) {
        suggestions.push('Consider mentioning who will use your product')
      }
      if (!lowerDesc.includes('problem') && !lowerDesc.includes('solve')) {
        suggestions.push('Describe what problem your idea solves')
      }
      if (!lowerDesc.includes('feature') && !lowerDesc.includes('function')) {
        suggestions.push('Include key features or functionality')
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    }
  }, [description, industry, targetAudience])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validation.isValid) return

    const ideaInput: IdeaInput = {
      description: description.trim(),
      industry: industry || undefined,
      targetAudience: targetAudience || undefined,
      budget: budget || undefined,
      timeline: timeline || undefined,
      constraints: constraints.length > 0 ? constraints : undefined
    }

    onSubmit(ideaInput)
  }, [description, industry, targetAudience, budget, timeline, constraints, validation.isValid, onSubmit])

  const handleExampleSelect = useCallback((example: typeof EXAMPLE_PROMPTS[0]) => {
    setDescription(example.prompt)
    setShowExamples(false)
  }, [])

  const handleIndustrySelect = useCallback((selectedIndustry: string) => {
    setIndustry(industry === selectedIndustry ? '' : selectedIndustry)
  }, [industry])

  const handleAudienceSelect = useCallback((selectedAudience: string) => {
    setTargetAudience(targetAudience === selectedAudience ? '' : selectedAudience)
  }, [targetAudience])

  const addConstraint = useCallback(() => {
    if (constraintInput.trim() && constraintInput.length <= MAX_CONSTRAINT_LENGTH) {
      setConstraints(prev => [...prev, constraintInput.trim()])
      setConstraintInput('')
    }
  }, [constraintInput])

  const removeConstraint = useCallback((index: number) => {
    setConstraints(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleConstraintKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addConstraint()
    }
  }, [addConstraint])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">
          Describe Your Idea
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Share your startup or app idea in detail. The more information you provide, 
          the better we can generate your comprehensive development blueprint.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Idea Input */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900">
                Idea Description *
              </label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowExamples(!showExamples)}
                className="text-xs"
              >
                {showExamples ? 'Hide Examples' : 'Show Examples'}
              </Button>
            </div>

            {/* Example Prompts */}
            {showExamples && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <div 
                    key={index}
                    className="p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-md border border-gray-200 bg-white"
                    onClick={() => handleExampleSelect(example)}
                  >
                    <h4 className="font-medium text-sm mb-1 text-gray-900">{example.title}</h4>
                    <p className="text-xs text-gray-600 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {example.prompt}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your startup or app idea in detail. Include the problem you're solving, target users, key features, and any specific requirements..."
              className="min-h-[150px] resize-none"
              maxLength={MAX_DESCRIPTION_LENGTH}
              showCount
              variant={validation.errors.length > 0 ? "error" : "default"}
            />

            {/* Character count and validation */}
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-destructive">{error}</p>
                ))}
                {validation.warnings.map((warning, index) => (
                  <p key={index} className="text-yellow-600">{warning}</p>
                ))}
                {validation.suggestions.slice(0, 2).map((suggestion, index) => (
                  <p key={index} className="text-muted-foreground">💡 {suggestion}</p>
                ))}
              </div>
              <div className={cn(
                "font-mono",
                description.length < MIN_DESCRIPTION_LENGTH ? "text-muted-foreground" :
                description.length > MAX_DESCRIPTION_LENGTH * 0.9 ? "text-yellow-600" :
                "text-green-600"
              )}>
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </div>
            </div>
          </div>
        </div>

        {/* Industry Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-900">
              Industry (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={industry === option ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleIndustrySelect(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
            {industry && (
              <p className="text-xs text-muted-foreground">
                Selected: {industry}
              </p>
            )}
          </div>
        </div>

        {/* Target Audience Selection */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-900">
              Target Audience (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {AUDIENCE_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={targetAudience === option ? "default" : "outline"}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleAudienceSelect(option)}
                >
                  {option}
                </Badge>
              ))}
            </div>
            {targetAudience && (
              <p className="text-xs text-muted-foreground">
                Selected: {targetAudience}
              </p>
            )}
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Additional Details (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Budget Range (USD)"
                placeholder="e.g., 50000"
                value={budget || ''}
                onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : undefined)}
                helperText="Estimated development budget"
              />
              
              <Input
                label="Timeline"
                placeholder="e.g., 6 months to MVP"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                helperText="Desired development timeline"
              />
            </div>

            {/* Constraints */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Constraints or Requirements
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Must work offline, GDPR compliant"
                  value={constraintInput}
                  onChange={(e) => setConstraintInput(e.target.value)}
                  onKeyPress={handleConstraintKeyPress}
                  maxLength={MAX_CONSTRAINT_LENGTH}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addConstraint}
                  disabled={!constraintInput.trim() || constraintInput.length > MAX_CONSTRAINT_LENGTH}
                >
                  Add
                </Button>
              </div>
              
              {constraints.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {constraints.map((constraint, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => removeConstraint(index)}
                    >
                      {constraint} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            variant="gradient"
            disabled={!validation.isValid || isLoading}
            loading={isLoading}
            className="px-8"
          >
            {isLoading ? 'Generating Blueprint...' : 'Generate Blueprint'}
          </Button>
        </div>
      </form>

      {/* Progress indicator when loading */}
      {isLoading && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Generating your blueprint...</span>
              <span className="text-xs text-gray-600">This may take up to 2 minutes</span>
            </div>
            <div className="bg-gradient-loading h-2 rounded-full animate-pulse"></div>
            <div className="text-xs text-gray-600 text-center">
              🤖 AI is analyzing your idea and creating comprehensive plans
            </div>
          </div>
        </div>
      )}
    </div>
  )
}