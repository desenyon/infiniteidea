// Clean validation schemas for testing
import { z } from 'zod'
import {
  SubscriptionTier,
  ProjectStatus,
  ComplexityLevel,
  Priority,
  FeatureCategory,
  TechCategory,
  NodeType,
  IdeaCategory,
  ExportFormat
} from './index'

// Basic enum schemas
export const SubscriptionTierSchema = z.nativeEnum(SubscriptionTier)
export const ProjectStatusSchema = z.nativeEnum(ProjectStatus)
export const ComplexityLevelSchema = z.nativeEnum(ComplexityLevel)
export const PrioritySchema = z.nativeEnum(Priority)
export const FeatureCategorySchema = z.nativeEnum(FeatureCategory)
export const TechCategorySchema = z.nativeEnum(TechCategory)
export const NodeTypeSchema = z.nativeEnum(NodeType)
export const IdeaCategorySchema = z.nativeEnum(IdeaCategory)
export const ExportFormatSchema = z.nativeEnum(ExportFormat)

// Core validation schemas
export const IdeaInputSchema = z.object({
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  industry: z.string().optional(),
  targetAudience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
  budget: z.number().positive().optional(),
  timeline: z.string().optional()
})

export const ProcessedIdeaSchema = z.object({
  id: z.string(),
  originalInput: z.string(),
  extractedFeatures: z.array(z.string()),
  category: IdeaCategorySchema,
  complexity: ComplexityLevelSchema,
  keywords: z.array(z.string()),
  timestamp: z.date()
})

export const ValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
  warnings: z.array(z.string()),
  suggestions: z.array(z.string())
})