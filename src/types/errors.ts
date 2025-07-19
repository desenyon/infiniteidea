// Error Types and Interfaces for Desenyon: InfiniteIdea
// This file contains comprehensive error handling types and interfaces

import { z } from 'zod'

// ============================================================================
// BASE ERROR INTERFACES
// ============================================================================

/**
 * Base error interface that all application errors extend
 */
export interface BaseError extends Error {
  code: string
  timestamp: Date
  context?: Record<string, any>
  retryable: boolean
  severity: ErrorSeverity
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  AI_SERVICE = 'AI_SERVICE',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  SYSTEM = 'SYSTEM',
  BUSINESS_LOGIC = 'BUSINESS_LOGIC',
  EXTERNAL_API = 'EXTERNAL_API'
}

// ============================================================================
// SPECIFIC ERROR TYPES
// ============================================================================

/**
 * Validation errors for input data
 */
export interface ValidationError extends BaseError {
  category: ErrorCategory.VALIDATION
  field?: string
  value?: any
  constraint: string
  validationErrors: ValidationIssue[]
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  field: string
  message: string
  code: string
  value?: any
}

/**
 * AI service related errors
 */
export interface AIServiceError extends BaseError {
  category: ErrorCategory.AI_SERVICE
  provider: string
  model: string
  requestId?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  rateLimitInfo?: {
    limit: number
    remaining: number
    resetTime: Date
  }
}

/**
 * Database operation errors
 */
export interface DatabaseError extends BaseError {
  category: ErrorCategory.DATABASE
  operation: string
  table?: string
  query?: string
  constraint?: string
}

/**
 * Authentication errors
 */
export interface AuthenticationError extends BaseError {
  category: ErrorCategory.AUTHENTICATION
  provider?: string
  userId?: string
  reason: 'invalid_credentials' | 'token_expired' | 'token_invalid' | 'account_locked' | 'other'
}

/**
 * Authorization errors
 */
export interface AuthorizationError extends BaseError {
  category: ErrorCategory.AUTHORIZATION
  userId: string
  resource: string
  action: string
  requiredPermissions: string[]
}

/**
 * Rate limiting errors
 */
export interface RateLimitError extends BaseError {
  category: ErrorCategory.RATE_LIMIT
  limit: number
  remaining: number
  resetTime: Date
  identifier: string
}

/**
 * Network/HTTP errors
 */
export interface NetworkError extends BaseError {
  category: ErrorCategory.NETWORK
  url?: string
  method?: string
  statusCode?: number
  responseBody?: string
  timeout?: boolean
}

/**
 * System errors
 */
export interface SystemError extends BaseError {
  category: ErrorCategory.SYSTEM
  component: string
  operation: string
  systemInfo?: {
    memory: number
    cpu: number
    disk: number
  }
}

/**
 * Business logic errors
 */
export interface BusinessLogicError extends BaseError {
  category: ErrorCategory.BUSINESS_LOGIC
  operation: string
  businessRule: string
  currentState?: any
  expectedState?: any
}

/**
 * External API errors
 */
export interface ExternalAPIError extends BaseError {
  category: ErrorCategory.EXTERNAL_API
  service: string
  endpoint: string
  statusCode?: number
  responseBody?: string
  requestId?: string
}

// ============================================================================
// ERROR HANDLING INTERFACES
// ============================================================================

/**
 * Error handler interface
 */
export interface ErrorHandler {
  handle(error: BaseError): Promise<ErrorHandlingResult>
  canHandle(error: BaseError): boolean
  priority: number
}

/**
 * Result of error handling
 */
export interface ErrorHandlingResult {
  handled: boolean
  recovery?: RecoveryAction
  userMessage?: string
  logLevel: LogLevel
  notify: boolean
}

/**
 * Recovery actions that can be taken
 */
export interface RecoveryAction {
  type: RecoveryType
  description: string
  automatic: boolean
  execute?: () => Promise<void>
  retryConfig?: RetryConfig
}

/**
 * Types of recovery actions
 */
export enum RecoveryType {
  RETRY = 'RETRY',
  FALLBACK = 'FALLBACK',
  SKIP = 'SKIP',
  MANUAL_INTERVENTION = 'MANUAL_INTERVENTION',
  GRACEFUL_DEGRADATION = 'GRACEFUL_DEGRADATION'
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  jitter: boolean
  retryableErrors: string[]
}

/**
 * Log levels for error reporting
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  FATAL = 'FATAL'
}

// ============================================================================
// ERROR CONTEXT INTERFACES
// ============================================================================

/**
 * Context information for error tracking
 */
export interface ErrorContext {
  userId?: string
  sessionId?: string
  requestId?: string
  projectId?: string
  operation: string
  timestamp: Date
  userAgent?: string
  ip?: string
  route?: string
  method?: string
  headers?: Record<string, string>
  body?: any
  query?: Record<string, string>
  environment: string
  version: string
}

/**
 * Error tracking service interface
 */
export interface ErrorTracker {
  track(error: BaseError, context: ErrorContext): Promise<void>
  getErrors(filters: ErrorFilters): Promise<ErrorReport[]>
  getErrorStats(timeRange: TimeRange): Promise<ErrorStats>
  createAlert(condition: AlertCondition): Promise<string>
  deleteAlert(alertId: string): Promise<void>
}

/**
 * Error filters for querying
 */
export interface ErrorFilters {
  category?: ErrorCategory
  severity?: ErrorSeverity
  timeRange?: TimeRange
  userId?: string
  projectId?: string
  code?: string
  retryable?: boolean
  limit?: number
  offset?: number
}

/**
 * Time range for filtering
 */
export interface TimeRange {
  start: Date
  end: Date
}

/**
 * Error report for analysis
 */
export interface ErrorReport {
  id: string
  error: BaseError
  context: ErrorContext
  count: number
  firstOccurrence: Date
  lastOccurrence: Date
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  notes?: string
}

/**
 * Error statistics
 */
export interface ErrorStats {
  totalErrors: number
  errorsByCategory: Record<ErrorCategory, number>
  errorsBySeverity: Record<ErrorSeverity, number>
  errorRate: number
  topErrors: {
    code: string
    count: number
    percentage: number
  }[]
  trends: {
    timestamp: Date
    count: number
  }[]
}

/**
 * Alert conditions for error monitoring
 */
export interface AlertCondition {
  name: string
  description: string
  condition: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    code?: string
    threshold: number
    timeWindow: number // minutes
    comparison: 'greater_than' | 'less_than' | 'equals'
  }
  actions: AlertAction[]
  enabled: boolean
}

/**
 * Actions to take when alert is triggered
 */
export interface AlertAction {
  type: 'email' | 'webhook' | 'slack' | 'sms'
  target: string
  template?: string
  data?: Record<string, any>
}

// ============================================================================
// ERROR FACTORY INTERFACES
// ============================================================================

/**
 * Factory for creating specific error types
 */
export interface ErrorFactory {
  createValidationError(field: string, value: any, constraint: string, issues: ValidationIssue[]): ValidationError
  createAIServiceError(provider: string, model: string, message: string, code: string): AIServiceError
  createDatabaseError(operation: string, message: string, table?: string): DatabaseError
  createAuthenticationError(reason: string, provider?: string): AuthenticationError
  createAuthorizationError(userId: string, resource: string, action: string): AuthorizationError
  createRateLimitError(limit: number, remaining: number, resetTime: Date): RateLimitError
  createNetworkError(url: string, method: string, statusCode?: number): NetworkError
  createSystemError(component: string, operation: string, message: string): SystemError
  createBusinessLogicError(operation: string, rule: string, message: string): BusinessLogicError
  createExternalAPIError(service: string, endpoint: string, statusCode?: number): ExternalAPIError
}

// ============================================================================
// VALIDATION SCHEMAS FOR ERRORS
// ============================================================================

export const ErrorSeveritySchema = z.nativeEnum(ErrorSeverity)
export const ErrorCategorySchema = z.nativeEnum(ErrorCategory)
export const RecoveryTypeSchema = z.nativeEnum(RecoveryType)
export const LogLevelSchema = z.nativeEnum(LogLevel)

export const ValidationIssueSchema = z.object({
  field: z.string(),
  message: z.string(),
  code: z.string(),
  value: z.any().optional()
})

export const BaseErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  code: z.string(),
  timestamp: z.date(),
  context: z.record(z.string(), z.any()).optional(),
  retryable: z.boolean(),
  severity: ErrorSeveritySchema,
  stack: z.string().optional()
})

export const ValidationErrorSchema = BaseErrorSchema.extend({
  category: z.literal(ErrorCategory.VALIDATION),
  field: z.string().optional(),
  value: z.any().optional(),
  constraint: z.string(),
  validationErrors: z.array(ValidationIssueSchema)
})

export const AIServiceErrorSchema = BaseErrorSchema.extend({
  category: z.literal(ErrorCategory.AI_SERVICE),
  provider: z.string(),
  model: z.string(),
  requestId: z.string().optional(),
  usage: z.object({
    promptTokens: z.number(),
    completionTokens: z.number(),
    totalTokens: z.number()
  }).optional(),
  rateLimitInfo: z.object({
    limit: z.number(),
    remaining: z.number(),
    resetTime: z.date()
  }).optional()
})

export const RetryConfigSchema = z.object({
  maxAttempts: z.number().positive(),
  baseDelay: z.number().nonnegative(),
  maxDelay: z.number().positive(),
  backoffMultiplier: z.number().positive(),
  jitter: z.boolean(),
  retryableErrors: z.array(z.string())
})

export const ErrorContextSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  projectId: z.string().optional(),
  operation: z.string(),
  timestamp: z.date(),
  userAgent: z.string().optional(),
  ip: z.string().optional(),
  route: z.string().optional(),
  method: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
  query: z.record(z.string(), z.string()).optional(),
  environment: z.string(),
  version: z.string()
})

export const ErrorFiltersSchema = z.object({
  category: ErrorCategorySchema.optional(),
  severity: ErrorSeveritySchema.optional(),
  timeRange: z.object({
    start: z.date(),
    end: z.date()
  }).optional(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  code: z.string().optional(),
  retryable: z.boolean().optional(),
  limit: z.number().positive().optional(),
  offset: z.number().nonnegative().optional()
})

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Type guard to check if error is a specific type
 */
export const isValidationError = (error: any): error is ValidationError => {
  return error && error.category === ErrorCategory.VALIDATION
}

export const isAIServiceError = (error: any): error is AIServiceError => {
  return error && error.category === ErrorCategory.AI_SERVICE
}

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error && error.category === ErrorCategory.DATABASE
}

export const isAuthenticationError = (error: any): error is AuthenticationError => {
  return error && error.category === ErrorCategory.AUTHENTICATION
}

export const isAuthorizationError = (error: any): error is AuthorizationError => {
  return error && error.category === ErrorCategory.AUTHORIZATION
}

export const isRateLimitError = (error: any): error is RateLimitError => {
  return error && error.category === ErrorCategory.RATE_LIMIT
}

export const isNetworkError = (error: any): error is NetworkError => {
  return error && error.category === ErrorCategory.NETWORK
}

export const isSystemError = (error: any): error is SystemError => {
  return error && error.category === ErrorCategory.SYSTEM
}

export const isBusinessLogicError = (error: any): error is BusinessLogicError => {
  return error && error.category === ErrorCategory.BUSINESS_LOGIC
}

export const isExternalAPIError = (error: any): error is ExternalAPIError => {
  return error && error.category === ErrorCategory.EXTERNAL_API
}

/**
 * Helper function to determine if an error is retryable
 */
export const isRetryableError = (error: BaseError): boolean => {
  return error.retryable && error.severity !== ErrorSeverity.CRITICAL
}

/**
 * Helper function to get user-friendly error message
 */
export const getUserFriendlyMessage = (error: BaseError & { category?: ErrorCategory }): string => {
  switch (error.category) {
    case ErrorCategory.VALIDATION:
      return 'Please check your input and try again.'
    case ErrorCategory.AUTHENTICATION:
      return 'Please log in to continue.'
    case ErrorCategory.AUTHORIZATION:
      return 'You do not have permission to perform this action.'
    case ErrorCategory.RATE_LIMIT:
      return 'Too many requests. Please try again later.'
    case ErrorCategory.AI_SERVICE:
      return 'AI service is temporarily unavailable. Please try again.'
    case ErrorCategory.DATABASE:
      return 'Data operation failed. Please try again.'
    case ErrorCategory.NETWORK:
      return 'Network error. Please check your connection.'
    case ErrorCategory.SYSTEM:
      return 'System error. Our team has been notified.'
    case ErrorCategory.BUSINESS_LOGIC:
      return 'Operation cannot be completed due to business rules.'
    case ErrorCategory.EXTERNAL_API:
      return 'External service is unavailable. Please try again later.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

/**
 * Helper function to calculate retry delay with exponential backoff
 */
export const calculateRetryDelay = (
  attempt: number,
  config: RetryConfig
): number => {
  const delay = Math.min(
    config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
    config.maxDelay
  )
  
  if (config.jitter) {
    return delay * (0.5 + Math.random() * 0.5)
  }
  
  return delay
}