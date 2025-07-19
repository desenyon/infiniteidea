// Test configuration and utilities
export const TEST_CONFIG = {
  // API endpoints
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Test timeouts
  TIMEOUTS: {
    DEFAULT: 30000,
    BLUEPRINT_GENERATION: 60000,
    PERFORMANCE_TEST: 90000,
    VISUAL_TEST: 10000
  },
  
  // Mock data
  MOCK_IDEAS: {
    SIMPLE: 'A mobile app for tracking daily habits',
    COMPLEX: 'A comprehensive e-commerce platform with AI-powered recommendations, real-time inventory management, integrated payment processing, and multi-vendor support',
    INVALID: 'app',
    PERFORMANCE_TEST: 'A social media platform for pet owners to share photos, connect with local veterinarians, find pet-friendly places, book appointments, and access emergency vet services'
  },
  
  // Visual test settings
  VISUAL: {
    THRESHOLD: 0.2,
    ANIMATIONS: 'disabled' as const,
    FULL_PAGE: true
  },
  
  // Performance thresholds
  PERFORMANCE: {
    MAX_GENERATION_TIME: 60000, // 60 seconds
    MAX_RESPONSE_TIME: 5000,    // 5 seconds
    MAX_MEMORY_INCREASE: 50,    // 50MB
    CONCURRENT_REQUESTS: 5
  }
};

// Mock blueprint response for consistent testing
export const MOCK_BLUEPRINT = {
  success: true,
  blueprint: {
    id: 'test-blueprint-123',
    productPlan: {
      targetAudience: 'Tech-savvy entrepreneurs and small business owners',
      coreFeatures: [
        'AI-powered business analysis',
        'Real-time collaboration tools',
        'Automated workflow generation',
        'Financial modeling and projections'
      ],
      differentiators: [
        'Unique AI-first approach to business planning',
        'Seamless integration with existing tools',
        'Real-time collaborative features'
      ],
      monetization: {
        strategy: 'SaaS subscription model',
        pricing: '$29/month for basic, $99/month for pro'
      },
      gtmStrategy: 'Content marketing, partnerships with accelerators, and developer community engagement'
    },
    techStack: {
      frontend: [
        { name: 'Next.js 14', reasoning: 'Modern React framework with excellent performance' },
        { name: 'TypeScript', reasoning: 'Type safety and better developer experience' },
        { name: 'Tailwind CSS', reasoning: 'Utility-first CSS framework for rapid development' }
      ],
      backend: [
        { name: 'Node.js', reasoning: 'JavaScript ecosystem consistency' },
        { name: 'Prisma ORM', reasoning: 'Type-safe database access' },
        { name: 'NextAuth.js', reasoning: 'Authentication solution for Next.js' }
      ],
      database: [
        { name: 'PostgreSQL', reasoning: 'Reliable relational database with JSON support' },
        { name: 'Redis', reasoning: 'Caching and session storage' }
      ],
      aiServices: [
        { name: 'OpenAI GPT-4', reasoning: 'Best-in-class language model for text generation' },
        { name: 'Anthropic Claude', reasoning: 'Fallback AI service for reliability' }
      ],
      deployment: [
        { name: 'Vercel', reasoning: 'Seamless Next.js deployment and hosting' },
        { name: 'Supabase', reasoning: 'PostgreSQL hosting with real-time features' }
      ]
    },
    aiWorkflow: {
      nodes: [
        { id: '1', type: 'input', label: 'User Input Processing', position: { x: 0, y: 0 } },
        { id: '2', type: 'process', label: 'AI Analysis Engine', position: { x: 200, y: 0 } },
        { id: '3', type: 'process', label: 'Blueprint Generation', position: { x: 400, y: 0 } },
        { id: '4', type: 'output', label: 'Formatted Output', position: { x: 600, y: 0 } }
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2' },
        { id: 'e2-3', source: '2', target: '3' },
        { id: 'e3-4', source: '3', target: '4' }
      ],
      modules: [
        { id: 'auth', name: 'Authentication', enabled: true },
        { id: 'payment', name: 'Payment Processing', enabled: true },
        { id: 'ui', name: 'User Interface', enabled: true },
        { id: 'analytics', name: 'Analytics', enabled: false }
      ]
    },
    roadmap: {
      phases: [
        {
          name: 'MVP Development',
          duration: '2-3 months',
          tasks: [
            'Set up development environment',
            'Implement core features',
            'Basic UI/UX design',
            'User authentication',
            'Initial AI integration'
          ]
        },
        {
          name: 'Beta Launch',
          duration: '1 month',
          tasks: [
            'User testing and feedback',
            'Bug fixes and optimizations',
            'Performance improvements',
            'Security audit'
          ]
        },
        {
          name: 'Production Launch',
          duration: '2 weeks',
          tasks: [
            'Final testing',
            'Deployment setup',
            'Monitoring and analytics',
            'Launch marketing campaign'
          ]
        }
      ]
    },
    financialModel: {
      costs: {
        infrastructure: 500,
        team: 15000,
        tools: 200,
        marketing: 2000,
        total: 17700
      },
      revenue: {
        monthly: 5000,
        yearly: 60000,
        projected: {
          year1: 60000,
          year2: 180000,
          year3: 420000
        }
      },
      metrics: {
        cac: 50,
        ltv: 500,
        churnRate: 5,
        growthRate: 15
      }
    }
  }
};

// Test utilities
export class TestUtils {
  static async waitForElement(page: any, selector: string, timeout = TEST_CONFIG.TIMEOUTS.DEFAULT) {
    return page.waitForSelector(selector, { timeout });
  }
  
  static async fillIdeaInput(page: any, idea: string) {
    const ideaInput = page.locator('textarea[placeholder*="idea"], textarea[placeholder*="Describe"]').first();
    await ideaInput.fill(idea);
    return ideaInput;
  }
  
  static async submitIdea(page: any) {
    const submitButton = page.locator('button:has-text("Generate"), button:has-text("Create"), button:has-text("Submit")').first();
    await submitButton.click();
    return submitButton;
  }
  
  static async waitForBlueprintGeneration(page: any) {
    await page.waitForSelector('text=Processing', { timeout: 5000 });
    await page.waitForSelector('text=Blueprint', { timeout: TEST_CONFIG.TIMEOUTS.BLUEPRINT_GENERATION });
  }
  
  static setupMockRoutes(page: any, customBlueprint = MOCK_BLUEPRINT) {
    return page.route('**/api/ai/**', async (route: any) => {
      // Simulate realistic response time
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(customBlueprint)
      });
    });
  }
  
  static setupErrorMockRoutes(page: any, errorCode = 500) {
    return page.route('**/api/**', async (route: any) => {
      await route.fulfill({
        status: errorCode,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Test error response' })
      });
    });
  }
  
  static async measurePerformance(page: any, operation: () => Promise<void>) {
    const startTime = Date.now();
    await operation();
    const endTime = Date.now();
    return endTime - startTime;
  }
  
  static async getMemoryUsage(page: any) {
    return page.evaluate(() => {
      return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
    });
  }
}