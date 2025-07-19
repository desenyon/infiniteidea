// Utility Types for Desenyon: InfiniteIdea
// This file contains utility types, helper types, and type manipulation utilities

// ============================================================================
// GENERIC UTILITY TYPES
// ============================================================================

/**
 * Make all properties of T optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Make all properties of T required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P]
}

/**
 * Make specific keys K of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Make specific keys K of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/**
 * Extract keys of T that are of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never
}[keyof T]

/**
 * Create a type with only the properties of T that are of type U
 */
export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>

/**
 * Create a type without the properties of T that are of type U
 */
export type OmitByType<T, U> = Omit<T, KeysOfType<T, U>>

/**
 * Make all properties of T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}

/**
 * Remove null from all properties of T
 */
export type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

/**
 * Create a union of all values in T
 */
export type ValueOf<T> = T[keyof T]

/**
 * Create a type that represents a function that takes T and returns U
 */
export type Mapper<T, U> = (value: T) => U

/**
 * Create a type that represents an async function that takes T and returns U
 */
export type AsyncMapper<T, U> = (value: T) => Promise<U>

/**
 * Create a type that represents a predicate function for T
 */
export type Predicate<T> = (value: T) => boolean

/**
 * Create a type that represents an async predicate function for T
 */
export type AsyncPredicate<T> = (value: T) => Promise<boolean>

// ============================================================================
// API UTILITY TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export type APIResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp: Date
}

/**
 * Paginated API response
 */
export type PaginatedAPIResponse<T = unknown> = APIResponse<T[]> & {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * API request with metadata
 */
export type APIRequest<T = unknown> = {
  data: T
  metadata?: {
    requestId: string
    timestamp: Date
    userAgent?: string
    ip?: string
  }
}

/**
 * API error response
 */
export type APIError = {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: Date
  path?: string
  method?: string
}

// ============================================================================
// DATABASE UTILITY TYPES
// ============================================================================

/**
 * Database entity with common fields
 */
export type BaseEntity = {
  id: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Database entity with soft delete
 */
export type SoftDeletableEntity = BaseEntity & {
  deletedAt?: Date
  isDeleted: boolean
}

/**
 * Database entity with versioning
 */
export type VersionedEntity = BaseEntity & {
  version: number
}

/**
 * Database query filters
 */
export type QueryFilters<T> = {
  [K in keyof T]?: T[K] | T[K][] | {
    eq?: T[K]
    ne?: T[K]
    gt?: T[K]
    gte?: T[K]
    lt?: T[K]
    lte?: T[K]
    in?: T[K][]
    nin?: T[K][]
    like?: string
    ilike?: string
  }
}

/**
 * Database query options
 */
export type QueryOptions<T> = {
  select?: (keyof T)[]
  where?: QueryFilters<T>
  orderBy?: {
    [K in keyof T]?: 'asc' | 'desc'
  }
  limit?: number
  offset?: number
  include?: string[]
}

/**
 * Database mutation result
 */
export type MutationResult<T> = {
  success: boolean
  data?: T
  error?: string
  affectedRows?: number
}

// ============================================================================
// FORM UTILITY TYPES
// ============================================================================

/**
 * Form field configuration
 */
export type FormFieldConfig<T> = {
  [K in keyof T]: {
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file'
    label: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    options?: { label: string; value: any }[]
    validation?: {
      min?: number
      max?: number
      minLength?: number
      maxLength?: number
      pattern?: RegExp
      custom?: (value: T[K]) => string | null
    }
    dependencies?: (keyof T)[]
    conditional?: (values: Partial<T>) => boolean
  }
}

/**
 * Form validation errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: string[]
}

/**
 * Form field state
 */
export type FormFieldState<T> = {
  [K in keyof T]: {
    value: T[K]
    error?: string
    touched: boolean
    dirty: boolean
    valid: boolean
  }
}

/**
 * Form state
 */
export type FormState<T> = {
  values: T
  errors: FormErrors<T>
  fields: FormFieldState<T>
  isValid: boolean
  isSubmitting: boolean
  isDirty: boolean
  submitCount: number
}

// ============================================================================
// EVENT UTILITY TYPES
// ============================================================================

/**
 * Event handler function
 */
export type EventHandler<T = any> = (event: T) => void | Promise<void>

/**
 * Event listener configuration
 */
export type EventListener<T = any> = {
  event: string
  handler: EventHandler<T>
  once?: boolean
  priority?: number
}

/**
 * Event emitter interface
 */
export type EventEmitter<T extends Record<string, any> = Record<string, any>> = {
  on<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void
  off<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void
  emit<K extends keyof T>(event: K, data: T[K]): void
  once<K extends keyof T>(event: K, handler: EventHandler<T[K]>): void
  removeAllListeners(event?: keyof T): void
}

// ============================================================================
// STATE MANAGEMENT UTILITY TYPES
// ============================================================================

/**
 * Action with type and payload
 */
export type Action<T = string, P = any> = {
  type: T
  payload?: P
  meta?: Record<string, any>
  error?: boolean
}

/**
 * Reducer function
 */
export type Reducer<S, A> = (state: S, action: A) => S

/**
 * Store interface
 */
export type Store<S, A = Action> = {
  getState(): S
  dispatch(action: A): void
  subscribe(listener: () => void): () => void
}

/**
 * Async action creator
 */
export type AsyncActionCreator<T = any, R = any> = (
  ...args: any[]
) => (dispatch: (action: Action) => void, getState: () => T) => Promise<R>

// ============================================================================
// CONFIGURATION UTILITY TYPES
// ============================================================================

/**
 * Environment configuration
 */
export type EnvironmentConfig = {
  NODE_ENV: 'development' | 'production' | 'test'
  DATABASE_URL: string
  REDIS_URL?: string
  OPENAI_API_KEY?: string
  ANTHROPIC_API_KEY?: string
  NEXTAUTH_SECRET: string
  NEXTAUTH_URL: string
  [key: string]: string | undefined
}

/**
 * Feature flags
 */
export type FeatureFlags = {
  [feature: string]: boolean | string | number
}

/**
 * Application configuration
 */
export type AppConfig = {
  app: {
    name: string
    version: string
    description: string
    url: string
  }
  database: {
    url: string
    maxConnections: number
    timeout: number
  }
  redis?: {
    url: string
    ttl: number
  }
  ai: {
    providers: {
      openai?: {
        apiKey: string
        model: string
        maxTokens: number
      }
      anthropic?: {
        apiKey: string
        model: string
        maxTokens: number
      }
    }
    defaultProvider: 'openai' | 'anthropic'
  }
  auth: {
    secret: string
    sessionMaxAge: number
    providers: string[]
  }
  features: FeatureFlags
}

// ============================================================================
// TESTING UTILITY TYPES
// ============================================================================

/**
 * Mock function type
 */
export type MockFunction<T extends (...args: any[]) => any> = T & {
  mock: {
    calls: Parameters<T>[]
    results: ReturnType<T>[]
    instances: any[]
  }
  mockReturnValue(value: ReturnType<T>): MockFunction<T>
  mockReturnValueOnce(value: ReturnType<T>): MockFunction<T>
  mockResolvedValue(value: Awaited<ReturnType<T>>): MockFunction<T>
  mockRejectedValue(value: any): MockFunction<T>
  mockImplementation(fn: T): MockFunction<T>
  mockClear(): void
  mockReset(): void
  mockRestore(): void
}

/**
 * Test context
 */
export type TestContext<T = any> = {
  setup?: () => Promise<T> | T
  teardown?: (context: T) => Promise<void> | void
  timeout?: number
  skip?: boolean
  only?: boolean
}

/**
 * Test case
 */
export type TestCase<T = any> = {
  name: string
  fn: (context: T) => Promise<void> | void
  context?: TestContext<T>
}

// ============================================================================
// PERFORMANCE UTILITY TYPES
// ============================================================================

/**
 * Performance metrics
 */
export type PerformanceMetrics = {
  startTime: number
  endTime: number
  duration: number
  memoryUsage: {
    used: number
    total: number
    percentage: number
  }
  cpuUsage?: number
}

/**
 * Cache configuration
 */
export type CacheConfig = {
  ttl: number // Time to live in seconds
  maxSize?: number // Maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu'
  serialize?: boolean
}

/**
 * Rate limit configuration
 */
export type RateLimitConfig = {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests
  message?: string
  standardHeaders?: boolean
  legacyHeaders?: boolean
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// ============================================================================
// VALIDATION UTILITY TYPES
// ============================================================================

/**
 * Validation rule
 */
export type ValidationRule<T = any> = {
  name: string
  message: string
  validate: (value: T, context?: any) => boolean | Promise<boolean>
}

/**
 * Validation schema
 */
export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[]
}

/**
 * Validation result
 */
export type ValidationResult<T = any> = {
  isValid: boolean
  errors: {
    [K in keyof T]?: string[]
  }
  warnings?: {
    [K in keyof T]?: string[]
  }
}

// ============================================================================
// LOGGING UTILITY TYPES
// ============================================================================

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

/**
 * Log entry
 */
export type LogEntry = {
  level: LogLevel
  message: string
  timestamp: Date
  context?: Record<string, any>
  error?: Error
  userId?: string
  requestId?: string
}

/**
 * Logger interface
 */
export type Logger = {
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, error?: Error, context?: Record<string, any>): void
  fatal(message: string, error?: Error, context?: Record<string, any>): void
}

// ============================================================================
// SECURITY UTILITY TYPES
// ============================================================================

/**
 * Permission
 */
export type Permission = {
  resource: string
  action: string
  conditions?: Record<string, any>
}

/**
 * Role
 */
export type Role = {
  name: string
  permissions: Permission[]
  inherits?: string[]
}

/**
 * Security context
 */
export type SecurityContext = {
  userId: string
  roles: string[]
  permissions: Permission[]
  sessionId: string
  ip: string
  userAgent: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Type guard to check if value is defined
 */
export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null
}

/**
 * Type guard to check if value is a string
 */
export const isString = (value: any): value is string => {
  return typeof value === 'string'
}

/**
 * Type guard to check if value is a number
 */
export const isNumber = (value: any): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * Type guard to check if value is a boolean
 */
export const isBoolean = (value: any): value is boolean => {
  return typeof value === 'boolean'
}

/**
 * Type guard to check if value is an object
 */
export const isObject = (value: any): value is Record<string, any> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Type guard to check if value is an array
 */
export const isArray = <T>(value: any): value is T[] => {
  return Array.isArray(value)
}

/**
 * Type guard to check if value is a function
 */
export const isFunction = (value: any): value is Function => {
  return typeof value === 'function'
}

/**
 * Type guard to check if value is a promise
 */
export const isPromise = <T>(value: any): value is Promise<T> => {
  return value && typeof value.then === 'function'
}

/**
 * Type guard to check if value is a date
 */
export const isDate = (value: any): value is Date => {
  return value instanceof Date && !isNaN(value.getTime())
}

/**
 * Type guard to check if value is an error
 */
export const isError = (value: any): value is Error => {
  return value instanceof Error
}

/**
 * Create a type-safe pick function
 */
export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

/**
 * Create a type-safe omit function
 */
export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => {
    delete result[key]
  })
  return result
}

/**
 * Deep clone an object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T
    Object.keys(obj).forEach(key => {
      cloned[key as keyof T] = deepClone(obj[key as keyof T])
    })
    return cloned
  }
  
  return obj
}

/**
 * Merge objects deeply
 */
export const deepMerge = <T extends Record<string, any>>(target: T, ...sources: Partial<T>[]): T => {
  if (!sources.length) return target
  const source = sources.shift()
  
  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  
  return deepMerge(target, ...sources)
}