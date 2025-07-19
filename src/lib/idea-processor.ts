import { 
  IdeaInput, 
  ProcessedIdea, 
  ValidationResult, 
  IdeaCategory, 
  ComplexityLevel 
} from "@/types/index"
import { generateId } from "@/lib/utils"

/**
 * Main idea processing function that validates, sanitizes, and processes user input
 */
export async function processIdea(input: IdeaInput, userId: string): Promise<ProcessedIdea> {
  // Validate and sanitize input
  const validation = validateIdeaInput(input)
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
  }

  const sanitizedInput = sanitizeInput(input)
  
  // Extract keywords and features
  const keywords = extractKeywords(sanitizedInput.description)
  const features = extractFeatures(sanitizedInput.description)
  
  // Categorize the idea
  const category = categorizeIdea(sanitizedInput.description, keywords)
  
  // Determine complexity
  const complexity = determineComplexity(sanitizedInput, features, keywords)

  const processedIdea: ProcessedIdea = {
    id: generateId(),
    originalInput: sanitizedInput.description,
    extractedFeatures: features,
    category,
    complexity,
    keywords,
    timestamp: new Date()
  }

  return processedIdea
}

/**
 * Validates idea input according to business rules
 */
export function validateIdeaInput(input: IdeaInput): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check description length and quality
  if (input.description.length < 10) {
    errors.push("Description must be at least 10 characters long")
  }

  if (input.description.length > 2000) {
    errors.push("Description must be less than 2000 characters")
  }

  // Check for meaningful content
  const wordCount = input.description.trim().split(/\s+/).length
  if (wordCount < 5) {
    errors.push("Description must contain at least 5 words")
  }

  // Check for common issues
  if (input.description.toLowerCase().includes("todo") || 
      input.description.toLowerCase().includes("tbd")) {
    warnings.push("Description contains placeholder text that should be replaced")
  }

  // Provide suggestions for improvement
  if (wordCount < 20) {
    suggestions.push("Consider providing more details about your idea for better results")
  }

  if (!input.targetAudience) {
    suggestions.push("Specifying a target audience will help generate more focused recommendations")
  }

  if (!input.industry) {
    suggestions.push("Mentioning the industry will help with more accurate categorization")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  }
}

/**
 * Sanitizes user input to prevent security issues and normalize data
 */
export function sanitizeInput(input: IdeaInput): IdeaInput {
  return {
    description: sanitizeText(input.description),
    industry: input.industry ? sanitizeText(input.industry) : undefined,
    targetAudience: input.targetAudience ? sanitizeText(input.targetAudience) : undefined,
    constraints: input.constraints?.map(constraint => sanitizeText(constraint)),
    budget: input.budget,
    timeline: input.timeline ? sanitizeText(input.timeline) : undefined
  }
}

/**
 * Sanitizes text input by removing harmful content and normalizing
 */
function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags completely
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Extracts relevant keywords from the idea description
 */
export function extractKeywords(description: string): string[] {
  const text = description.toLowerCase()
  const keywords: string[] = []

  // Technology keywords
  const techKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'blockchain', 
    'mobile app', 'web app', 'saas', 'api', 'cloud', 'database', 'analytics',
    'automation', 'chatbot', 'iot', 'ar', 'vr', 'augmented reality', 'virtual reality',
    'react', 'node', 'python', 'javascript', 'typescript', 'aws', 'azure', 'gcp'
  ]

  // Business model keywords
  const businessKeywords = [
    'subscription', 'marketplace', 'e-commerce', 'ecommerce', 'freemium', 
    'b2b', 'b2c', 'enterprise', 'startup', 'platform', 'service', 'tool',
    'social', 'community', 'network', 'sharing', 'collaboration'
  ]

  // Industry keywords
  const industryKeywords = [
    'healthcare', 'fintech', 'edtech', 'education', 'finance', 'health',
    'fitness', 'food', 'travel', 'real estate', 'logistics', 'retail',
    'entertainment', 'gaming', 'music', 'video', 'productivity', 'hr'
  ]

  // Feature keywords
  const featureKeywords = [
    'dashboard', 'analytics', 'reporting', 'notification', 'payment',
    'authentication', 'user management', 'search', 'recommendation',
    'integration', 'api', 'real-time', 'messaging', 'calendar', 'booking'
  ]

  const allKeywords = [...techKeywords, ...businessKeywords, ...industryKeywords, ...featureKeywords]

  // Find matching keywords
  for (const keyword of allKeywords) {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  }

  // Extract additional keywords using simple NLP
  const words = text.split(/\s+/)
  const importantWords = words.filter(word => 
    word.length > 4 && 
    !isCommonWord(word) &&
    !keywords.includes(word)
  )

  // Add top important words
  keywords.push(...importantWords.slice(0, 5))

  return [...new Set(keywords)] // Remove duplicates
}

/**
 * Extracts potential features from the idea description
 */
export function extractFeatures(description: string): string[] {
  const features: string[] = []
  const text = description.toLowerCase()

  // Extract features from comma-separated lists after action phrases
  const listPatterns = [
    /users? can ([^.]+)/g,
    /allow users? to ([^.]+)/g,
    /will ([^.]+)/g,
    /enable ([^.]+)/g,
    /provide ([^.]+)/g,
    /include ([^.]+)/g,
    /to ([^.]+)/g,
    /with ([^.]+)/g
  ]

  for (const pattern of listPatterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      if (match[1]) {
        // Split by commas and 'and' to get individual features
        const items = match[1]
          .split(/,|\sand\s/)
          .map(item => item.trim())
          .filter(item => item.length > 3 && !item.includes('.'))
        
        features.push(...items)
      }
    }
  }

  // Extract noun phrases that might be features
  const featureNouns = [
    'dashboard', 'analytics', 'reporting', 'content suggestions', 'social media',
    'management', 'tracking', 'monitoring', 'notifications', 'integration',
    'automation', 'collaboration', 'sharing', 'search', 'filtering'
  ]

  for (const noun of featureNouns) {
    if (text.includes(noun)) {
      features.push(noun)
    }
  }

  // Extract action verbs that might indicate features
  const actionWords = [
    'create', 'manage', 'track', 'monitor', 'analyze', 'generate', 'send',
    'receive', 'share', 'collaborate', 'integrate', 'automate', 'schedule',
    'notify', 'search', 'filter', 'sort', 'export', 'import', 'sync'
  ]

  const words = text.split(/\s+/)
  for (let i = 0; i < words.length; i++) {
    if (actionWords.includes(words[i])) {
      // Try to capture the object of the action (next 1-3 words)
      const nextWords = words.slice(i + 1, i + 3).join(' ').replace(/[.,]$/, '')
      if (nextWords.length > 3 && !nextWords.includes('the')) {
        features.push(`${words[i]} ${nextWords}`)
      }
    }
  }

  return [...new Set(features)].slice(0, 10) // Limit to top 10 unique features
}

/**
 * Categorizes the idea based on content analysis
 */
export function categorizeIdea(description: string, keywords: string[]): IdeaCategory {
  const text = description.toLowerCase()
  const keywordText = keywords.join(' ').toLowerCase()
  const combinedText = `${text} ${keywordText}`

  // Define category indicators
  const categoryIndicators = {
    [IdeaCategory.MARKETPLACE]: [
      'marketplace', 'platform', 'connect', 'buyers', 'sellers', 'commission',
      'listing', 'directory', 'network', 'matching', 'buy', 'sell'
    ],
    [IdeaCategory.ECOMMERCE]: [
      'ecommerce', 'e-commerce', 'shop', 'store', 'product', 'cart', 
      'checkout', 'inventory', 'retail'
    ],
    [IdeaCategory.SAAS]: [
      'saas', 'software as a service', 'subscription', 'cloud', 'dashboard',
      'analytics', 'reporting', 'platform', 'service', 'b2b'
    ],
    [IdeaCategory.MOBILE_APP]: [
      'mobile app', 'ios', 'android', 'smartphone', 'tablet', 'native app',
      'mobile', 'app store', 'play store'
    ],
    [IdeaCategory.WEB_APP]: [
      'web app', 'website', 'browser', 'web-based', 'online', 'webapp',
      'react', 'vue', 'angular', 'frontend'
    ],
    [IdeaCategory.AI_TOOL]: [
      'ai', 'artificial intelligence', 'machine learning', 'ml', 'chatbot',
      'automation', 'intelligent', 'smart', 'algorithm', 'prediction'
    ],
    [IdeaCategory.SOCIAL]: [
      'social', 'community', 'network', 'sharing', 'collaboration', 'chat',
      'messaging', 'forum', 'discussion', 'connect people'
    ],
    [IdeaCategory.FINTECH]: [
      'fintech', 'finance', 'financial', 'payment', 'banking', 'investment',
      'trading', 'cryptocurrency', 'money', 'wallet', 'lending'
    ],
    [IdeaCategory.HEALTHTECH]: [
      'health', 'healthcare', 'medical', 'fitness', 'wellness', 'doctor',
      'patient', 'hospital', 'telemedicine', 'diagnosis'
    ],
    [IdeaCategory.EDTECH]: [
      'education', 'learning', 'course', 'student', 'teacher', 'school',
      'university', 'training', 'skill', 'knowledge'
    ]
  }

  // Score each category
  const categoryScores: Record<IdeaCategory, number> = {} as any

  for (const [category, indicators] of Object.entries(categoryIndicators)) {
    let score = 0
    for (const indicator of indicators) {
      if (combinedText.includes(indicator)) {
        score += 1
      }
    }
    categoryScores[category as IdeaCategory] = score
  }

  // Find the category with the highest score
  const bestCategory = Object.entries(categoryScores).reduce((a, b) => 
    categoryScores[a[0] as IdeaCategory] > categoryScores[b[0] as IdeaCategory] ? a : b
  )[0] as IdeaCategory

  // If no clear category, default to WEB_APP
  return categoryScores[bestCategory] > 0 ? bestCategory : IdeaCategory.WEB_APP
}

/**
 * Determines the complexity level of the idea
 */
export function determineComplexity(
  input: IdeaInput, 
  features: string[], 
  keywords: string[]
): ComplexityLevel {
  let complexityScore = 0

  // Base complexity from description length
  const wordCount = input.description.split(/\s+/).length
  if (wordCount > 100) complexityScore += 2
  else if (wordCount > 50) complexityScore += 1

  // Complexity from number of features
  if (features.length > 8) complexityScore += 3
  else if (features.length > 4) complexityScore += 2
  else if (features.length > 2) complexityScore += 1

  // Complexity from technology keywords
  const complexTechKeywords = [
    'ai', 'machine learning', 'blockchain', 'microservices', 'real-time',
    'analytics', 'big data', 'iot', 'ar', 'vr', 'api integration'
  ]
  
  const complexTechCount = keywords.filter(keyword => 
    complexTechKeywords.some(tech => keyword.includes(tech))
  ).length

  complexityScore += complexTechCount

  // Complexity from business model
  if (input.constraints && input.constraints.length > 3) complexityScore += 1
  if (input.budget && input.budget > 100000) complexityScore += 1

  // Integration complexity
  const integrationKeywords = ['integration', 'api', 'third-party', 'external']
  if (keywords.some(keyword => integrationKeywords.includes(keyword))) {
    complexityScore += 2
  }

  // Determine final complexity level
  if (complexityScore >= 8) return ComplexityLevel.ENTERPRISE
  if (complexityScore >= 5) return ComplexityLevel.COMPLEX
  if (complexityScore >= 2) return ComplexityLevel.MODERATE
  return ComplexityLevel.SIMPLE
}

/**
 * Checks if a word is a common word that should be filtered out
 */
function isCommonWord(word: string): boolean {
  const commonWords = [
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had',
    'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his',
    'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy',
    'did', 'she', 'use', 'way', 'will', 'with', 'that', 'this', 'have',
    'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time',
    'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many',
    'over', 'such', 'take', 'than', 'them', 'well', 'were'
  ]
  
  return commonWords.includes(word.toLowerCase())
}