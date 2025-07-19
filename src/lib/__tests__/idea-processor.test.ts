import { 
  processIdea, 
  validateIdeaInput, 
  sanitizeInput, 
  extractKeywords, 
  extractFeatures, 
  categorizeIdea, 
  determineComplexity 
} from '../idea-processor'
import { IdeaInput, IdeaCategory, ComplexityLevel } from '@/types/index'

describe('Idea Processor', () => {
  describe('validateIdeaInput', () => {
    it('should validate a good idea input', () => {
      const input: IdeaInput = {
        description: 'A social media platform for developers to share code snippets and collaborate on projects',
        industry: 'Technology',
        targetAudience: 'Software developers'
      }

      const result = validateIdeaInput(input)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject input that is too short', () => {
      const input: IdeaInput = {
        description: 'App'
      }

      const result = validateIdeaInput(input)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Description must be at least 10 characters long')
    })

    it('should reject input that is too long', () => {
      const input: IdeaInput = {
        description: 'A'.repeat(2001)
      }

      const result = validateIdeaInput(input)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain('Description must be less than 2000 characters')
    })

    it('should provide suggestions for improvement', () => {
      const input: IdeaInput = {
        description: 'Simple mobile app for tracking expenses'
      }

      const result = validateIdeaInput(input)
      expect(result.suggestions).toContain('Specifying a target audience will help generate more focused recommendations')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags and normalize whitespace', () => {
      const input: IdeaInput = {
        description: 'A <script>alert("xss")</script> web   app   with   multiple   spaces',
        industry: 'Tech  <div>test</div>  '
      }

      const sanitized = sanitizeInput(input)
      expect(sanitized.description).toBe('A alert("xss") web app with multiple spaces')
      expect(sanitized.industry).toBe('Tech test')
    })

    it('should remove javascript protocols', () => {
      const input: IdeaInput = {
        description: 'javascript:alert("test") A web app for managing tasks'
      }

      const sanitized = sanitizeInput(input)
      expect(sanitized.description).toBe('alert("test") A web app for managing tasks')
    })
  })

  describe('extractKeywords', () => {
    it('should extract technology keywords', () => {
      const description = 'A mobile app using AI and machine learning for healthcare analytics'
      const keywords = extractKeywords(description)
      
      expect(keywords).toContain('mobile app')
      expect(keywords).toContain('ai')
      expect(keywords).toContain('machine learning')
      expect(keywords).toContain('healthcare')
      expect(keywords).toContain('analytics')
    })

    it('should extract business model keywords', () => {
      const description = 'A SaaS platform with subscription model for B2B marketplace'
      const keywords = extractKeywords(description)
      
      expect(keywords).toContain('saas')
      expect(keywords).toContain('subscription')
      expect(keywords).toContain('b2b')
      expect(keywords).toContain('marketplace')
    })

    it('should not include common words', () => {
      const description = 'The application will be very good and useful for many people'
      const keywords = extractKeywords(description)
      
      expect(keywords).not.toContain('the')
      expect(keywords).not.toContain('will')
      expect(keywords).not.toContain('very')
      expect(keywords).not.toContain('and')
    })
  })

  describe('extractFeatures', () => {
    it('should extract features from user action patterns', () => {
      const description = 'Users can create projects, manage tasks, and track progress. The app will allow users to collaborate with team members.'
      const features = extractFeatures(description)
      
      expect(features).toContain('create projects')
      expect(features).toContain('manage tasks')
      expect(features).toContain('track progress')
      expect(features).toContain('collaborate with team members')
    })

    it('should extract features from capability descriptions', () => {
      const description = 'The platform will provide analytics, enable real-time notifications, and include payment processing functionality.'
      const features = extractFeatures(description)
      
      expect(features).toContain('analytics')
      expect(features).toContain('real-time notifications')
      expect(features).toContain('payment processing functionality')
    })
  })

  describe('categorizeIdea', () => {
    it('should categorize SaaS ideas correctly', () => {
      const description = 'A cloud-based SaaS platform for business analytics and reporting with subscription model'
      const keywords = ['saas', 'cloud', 'analytics', 'subscription', 'b2b']
      
      const category = categorizeIdea(description, keywords)
      expect(category).toBe(IdeaCategory.SAAS)
    })

    it('should categorize e-commerce ideas correctly', () => {
      const description = 'An online marketplace where users can buy and sell handmade products with integrated payment processing'
      const keywords = ['marketplace', 'buy', 'sell', 'payment', 'ecommerce']
      
      const category = categorizeIdea(description, keywords)
      expect(category).toBe(IdeaCategory.MARKETPLACE)
    })

    it('should categorize AI tools correctly', () => {
      const description = 'An AI-powered chatbot using machine learning for customer service automation'
      const keywords = ['ai', 'chatbot', 'machine learning', 'automation']
      
      const category = categorizeIdea(description, keywords)
      expect(category).toBe(IdeaCategory.AI_TOOL)
    })

    it('should default to WEB_APP for unclear categories', () => {
      const description = 'A simple tool for organizing personal notes'
      const keywords = ['tool', 'organizing']
      
      const category = categorizeIdea(description, keywords)
      expect(category).toBe(IdeaCategory.WEB_APP)
    })
  })

  describe('determineComplexity', () => {
    it('should determine SIMPLE complexity for basic ideas', () => {
      const input: IdeaInput = {
        description: 'A simple to-do list app'
      }
      const features = ['create tasks', 'mark complete']
      const keywords = ['app', 'tasks']
      
      const complexity = determineComplexity(input, features, keywords)
      expect(complexity).toBe(ComplexityLevel.SIMPLE)
    })

    it('should determine COMPLEX complexity for AI-powered ideas', () => {
      const input: IdeaInput = {
        description: 'An AI-powered platform with machine learning algorithms for real-time analytics, blockchain integration, and IoT device management with microservices architecture',
        constraints: ['scalability', 'security', 'performance', 'compliance']
      }
      const features = ['ai analysis', 'real-time processing', 'blockchain', 'iot management', 'analytics dashboard', 'user management', 'api integration', 'reporting', 'notifications']
      const keywords = ['ai', 'machine learning', 'blockchain', 'iot', 'microservices', 'real-time', 'analytics']
      
      const complexity = determineComplexity(input, features, keywords)
      expect(complexity).toBe(ComplexityLevel.ENTERPRISE)
    })

    it('should determine MODERATE complexity for standard business apps', () => {
      const input: IdeaInput = {
        description: 'A project management tool with task tracking, team collaboration, file sharing, and basic reporting features for small businesses'
      }
      const features = ['task tracking', 'team collaboration', 'file sharing', 'reporting', 'user management']
      const keywords = ['project management', 'collaboration', 'business']
      
      const complexity = determineComplexity(input, features, keywords)
      expect(complexity).toBe(ComplexityLevel.MODERATE)
    })
  })

  describe('processIdea', () => {
    it('should process a complete idea successfully', async () => {
      const input: IdeaInput = {
        description: 'A SaaS platform for small businesses to manage their social media presence with AI-powered content suggestions and analytics dashboard',
        industry: 'Marketing Technology',
        targetAudience: 'Small business owners',
        budget: 50000,
        timeline: '6 months'
      }

      const result = await processIdea(input, 'user123')
      

      expect(result.id).toBeDefined()
      expect(result.originalInput).toBe(input.description)
      expect(result.category).toBe(IdeaCategory.SAAS)
      expect(result.complexity).toBeDefined()
      expect(result.keywords).toContain('saas')
      expect(result.keywords).toContain('ai')
      expect(result.extractedFeatures.length).toBeGreaterThan(0)
      expect(result.timestamp).toBeInstanceOf(Date)
    })

    it('should throw error for invalid input', async () => {
      const input: IdeaInput = {
        description: 'Bad' // Too short
      }

      await expect(processIdea(input, 'user123')).rejects.toThrow('Validation failed')
    })
  })
})