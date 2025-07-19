import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock OpenAI to avoid browser environment issues
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Mock response' } }]
        })
      }
    }
  }))
}));

// Mock Anthropic to avoid browser environment issues
vi.mock('@anthropic-ai/sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ text: 'Mock response' }]
      })
    }
  }))
}));

// Mock Redis with proper interface
let mockRedisStore: Record<string, string> = {};

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockImplementation((key: string) => Promise.resolve(mockRedisStore[key] || null)),
    set: vi.fn().mockImplementation((key: string, value: string) => {
      mockRedisStore[key] = value;
      return Promise.resolve('OK');
    }),
    setex: vi.fn().mockImplementation((key: string, ttl: number, value: string) => {
      mockRedisStore[key] = value;
      return Promise.resolve('OK');
    }),
    del: vi.fn().mockImplementation((key: string) => {
      delete mockRedisStore[key];
      return Promise.resolve(1);
    }),
    exists: vi.fn().mockImplementation((key: string) => Promise.resolve(mockRedisStore[key] ? 1 : 0)),
    keys: vi.fn().mockImplementation((pattern: string) => Promise.resolve(Object.keys(mockRedisStore))),
    flushall: vi.fn().mockImplementation(() => {
      mockRedisStore = {};
      return Promise.resolve('OK');
    })
  }))
}));

// Mock Next.js headers and auth
vi.mock('next/headers', () => ({
  headers: vi.fn().mockReturnValue(new Map())
}));

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue(null)
}));

describe('AI Service Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock Redis store
    mockRedisStore = {};
    // Set up environment variables
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
    process.env.UPSTASH_REDIS_REST_URL = 'test-redis-url';
    process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AI Service Manager Integration', () => {
    const mockConfig = {
      providers: [
        { name: 'openai', apiKey: 'test-key', model: 'gpt-4' },
        { name: 'anthropic', apiKey: 'test-key', model: 'claude-3' }
      ],
      fallbackStrategy: 'round-robin' as const,
      fallbackChain: ['openai', 'anthropic'],
      retryConfig: { maxRetries: 3, baseDelay: 1000 },
      circuitBreaker: { enabled: false, failureThreshold: 5, resetTimeout: 60000 },
      rateLimiting: { enabled: false, requestsPerMinute: 60 }
    };

    it('should initialize AI services correctly', async () => {
      const { AIServiceManager } = await import('../../src/lib/ai-services/ai-service-manager');
      
      const manager = new AIServiceManager(mockConfig);
      expect(manager).toBeDefined();
      
      // Test service availability - these should be empty in test environment
      const services = manager.getAvailableServices();
      expect(Array.isArray(services)).toBe(true);
    });

    it('should handle configuration validation', async () => {
      const { AIServiceManager } = await import('../../src/lib/ai-services/ai-service-manager');
      
      // Test with invalid config
      const invalidConfig = {
        providers: [],
        fallbackStrategy: 'round-robin' as const,
        fallbackChain: [],
        retryConfig: { maxRetries: 3, baseDelay: 1000 },
        circuitBreaker: { enabled: false, failureThreshold: 5, resetTimeout: 60000 },
        rateLimiting: { enabled: false, requestsPerMinute: 60 }
      };
      
      const manager = new AIServiceManager(invalidConfig);
      expect(manager).toBeDefined();
      
      const services = manager.getAvailableServices();
      expect(services).toEqual([]);
    });

    it('should handle provider status checks', async () => {
      const { AIServiceManager } = await import('../../src/lib/ai-services/ai-service-manager');
      
      const manager = new AIServiceManager(mockConfig);
      
      const status = manager.getProviderStatus('openai');
      expect(status).toBeDefined();
      expect(typeof status.available).toBe('boolean');
      expect(typeof status.rateLimited).toBe('boolean');
      expect(typeof status.circuitBreakerOpen).toBe('boolean');
    });
  });

  describe('AI Orchestrator Integration', () => {
    it('should initialize orchestrator correctly', async () => {
      const { AIOrchestrationService } = await import('../../src/lib/ai-services/ai-orchestrator');
      
      const orchestrator = new AIOrchestrationService();
      expect(orchestrator).toBeDefined();
      
      // Test that the orchestrator has the expected methods
      expect(typeof orchestrator.generateBlueprint).toBe('function');
      expect(typeof orchestrator.regenerateSection).toBe('function');
    });

    it('should handle blueprint generation request validation', async () => {
      const { AIOrchestrationService } = await import('../../src/lib/ai-services/ai-orchestrator');
      
      const orchestrator = new AIOrchestrationService();
      
      // Test with invalid request (missing required fields)
      await expect(orchestrator.generateBlueprint({} as any)).rejects.toThrow();
    });
  });

  describe('Idea Processor Integration', () => {
    it('should process and categorize ideas', async () => {
      const { processIdea } = await import('../../src/lib/idea-processor');
      
      const processedIdea = await processIdea({
        description: 'A mobile app for tracking fitness goals with AI coaching and social features',
        industry: 'health-tech',
        targetAudience: 'fitness enthusiasts'
      });

      expect(processedIdea).toBeDefined();
      expect(processedIdea.extractedFeatures).toBeInstanceOf(Array);
      expect(processedIdea.extractedFeatures.length).toBeGreaterThan(0);
      expect(processedIdea.category).toBeDefined();
      expect(processedIdea.complexity).toBeDefined();
    });

    it('should validate idea input', async () => {
      const { processIdea } = await import('../../src/lib/idea-processor');
      
      // Test with insufficient input
      await expect(processIdea({
        description: 'app', // Too short
      }, 'test-user-id')).rejects.toThrow();
    });
  });

  describe('Caching Integration', () => {
    it('should cache and retrieve AI responses', async () => {
      const { Redis } = await import('@upstash/redis');
      const mockRedis = Redis as any;
      
      let cacheStore: Record<string, string> = {};
      
      mockRedis.mockImplementation(() => ({
        get: vi.fn().mockImplementation((key: string) => Promise.resolve(cacheStore[key] || null)),
        set: vi.fn().mockImplementation((key: string, value: string) => {
          cacheStore[key] = value;
          return Promise.resolve('OK');
        }),
        del: vi.fn().mockImplementation((key: string) => {
          delete cacheStore[key];
          return Promise.resolve(1);
        })
      }));

      const { cacheManager } = await import('../../src/lib/cache/redis-client');
      
      // Test cache set and get
      const cacheKey = { prefix: 'test', key: 'test-key' };
      await cacheManager.set(cacheKey, 'test-value');
      const cachedValue = await cacheManager.get(cacheKey);
      
      expect(cachedValue).toBe('test-value');
    });

    it('should handle cache misses gracefully', async () => {
      const { Redis } = await import('@upstash/redis');
      const mockRedis = Redis as any;
      
      mockRedis.mockImplementation(() => ({
        get: vi.fn().mockResolvedValue(null),
        set: vi.fn().mockResolvedValue('OK'),
        del: vi.fn().mockResolvedValue(1)
      }));

      const { cacheManager } = await import('../../src/lib/cache/redis-client');
      
      const cacheKey = { prefix: 'test', key: 'non-existent-key' };
      const cachedValue = await cacheManager.get(cacheKey);
      expect(cachedValue).toBeNull();
    });
  });

  describe('Workflow Generator Integration', () => {
    it('should generate AI workflow diagrams', async () => {
      const { WorkflowGenerator } = await import('../../src/lib/workflow-generator');
      
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['user-auth', 'data-processing', 'ai-analysis'],
        complexity: 'moderate'
      });

      expect(workflow).toBeDefined();
      expect(workflow.nodes).toBeInstanceOf(Array);
      expect(workflow.edges).toBeInstanceOf(Array);
      expect(workflow.nodes.length).toBeGreaterThan(0);
    });

    it('should validate workflow configurations', async () => {
      const { WorkflowGenerator } = await import('../../src/lib/workflow-generator');
      
      const workflow = WorkflowGenerator.generateWorkflow({
        features: ['invalid-feature'],
        complexity: 'simple'
      });

      // Should handle invalid features gracefully
      expect(workflow).toBeDefined();
      expect(workflow.nodes).toBeInstanceOf(Array);
    });
  });

  describe('External Tool Integration', () => {
    it('should generate coding prompts for external tools', async () => {
      const { CodingPromptGenerator } = await import('../../src/lib/ai-services/coding-prompt-generator');
      
      const generator = new CodingPromptGenerator();
      
      const prompts = await generator.generatePrompts({
        projectId: 'test-project',
        blueprint: {
          productPlan: {
            targetAudience: 'developers',
            coreFeatures: [
              { name: 'authentication', description: 'User login system' },
              { name: 'data-visualization', description: 'Charts and graphs' }
            ]
          },
          techStack: {
            frontend: [{ name: 'React', reasoning: 'Popular framework' }],
            backend: [{ name: 'Node.js', reasoning: 'JavaScript ecosystem' }],
            aiServices: []
          },
          features: ['authentication', 'data-visualization'],
          architecture: { type: 'web-application' }
        },
        preferences: {
          tool: 'cursor',
          difficulty: 'intermediate',
          categories: ['setup', 'implementation'],
          includeContext: true,
          optimizeForTool: true
        }
      });

      expect(prompts).toBeDefined();
      expect(prompts.prompts).toBeDefined();
      expect(prompts.prompts.length).toBeGreaterThan(0);
      expect(prompts.metadata).toBeDefined();
    });

    it('should handle tool integration errors', async () => {
      const { ToolIntegrationService } = await import('../../src/lib/external-tools/tool-integration-service');
      
      const service = new ToolIntegrationService();
      
      // Test with invalid tool configuration
      const result = await service.launchTool({
        tool: 'invalid-tool',
        projectData: {}
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});