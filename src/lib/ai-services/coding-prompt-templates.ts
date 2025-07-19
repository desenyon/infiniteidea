import { 
  CodingPromptTemplate, 
  CodingTool, 
  PromptCategory, 
  DifficultyLevel 
} from '@/types/coding-prompts'

export const CODING_PROMPT_TEMPLATES: Record<string, CodingPromptTemplate> = {
  PROJECT_SETUP: {
    id: 'project-setup',
    name: 'Project Setup and Initialization',
    description: 'Initialize a new project with the recommended tech stack and folder structure',
    category: PromptCategory.SETUP,
    difficulty: DifficultyLevel.BEGINNER,
    supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV, CodingTool.GITHUB_COPILOT],
    template: `# Project Setup: {{projectName}}

## Context
You are setting up a new {{projectType}} project with the following specifications:

**Tech Stack:**
- Frontend: {{frontend}}
- Backend: {{backend}}
- Database: {{database}}
- AI Services: {{aiServices}}
- Deployment: {{deployment}}

**Project Requirements:**
{{#each features}}
- {{this}}
{{/each}}

## Task
Create a complete project structure with:

1. **Initialize the project** with proper package.json/requirements.txt
2. **Set up the folder structure** following best practices for {{frontend}} and {{backend}}
3. **Configure development environment** (ESLint, Prettier, TypeScript configs if applicable)
4. **Set up database schema** for {{database}}
5. **Create environment configuration** files (.env.example, config files)
6. **Add basic routing and middleware** setup
7. **Configure AI service integrations** for {{aiServices}}
8. **Set up testing framework** and basic test structure
9. **Create README.md** with setup instructions
10. **Initialize Git** with appropriate .gitignore

## Specific Requirements
- Use modern best practices and latest stable versions
- Include proper error handling and logging setup
- Add security configurations (CORS, rate limiting, etc.)
- Set up development scripts (dev, build, test, lint)
- Include Docker configuration if using containerization
- Add CI/CD pipeline configuration for {{deployment}}

## Code Style
- Use {{codeStyle.naming}} naming convention
- {{codeStyle.indentation}} indentation with {{codeStyle.indentSize}} spaces
- {{#if codeStyle.semicolons}}Include semicolons{{else}}No semicolons{{/if}}
- Use {{codeStyle.quotes}} quotes

Please create all necessary files and provide setup instructions.`,
    variables: [
      { name: 'projectName', type: 'string', required: true, description: 'Name of the project' },
      { name: 'projectType', type: 'string', required: true, description: 'Type of project (web app, mobile app, etc.)' },
      { name: 'frontend', type: 'array', required: true, description: 'Frontend technologies' },
      { name: 'backend', type: 'array', required: true, description: 'Backend technologies' },
      { name: 'database', type: 'array', required: true, description: 'Database technologies' },
      { name: 'aiServices', type: 'array', required: false, description: 'AI services to integrate' },
      { name: 'deployment', type: 'array', required: true, description: 'Deployment platforms' },
      { name: 'features', type: 'array', required: true, description: 'Core features to implement' },
      { name: 'codeStyle', type: 'object', required: false, description: 'Code style preferences' }
    ],
    contextRequirements: [
      { type: 'tech-stack', description: 'Complete technology stack', required: true, format: 'object' },
      { type: 'features', description: 'List of features to implement', required: true, format: 'array' }
    ],
    expectedOutput: {
      type: 'mixed',
      description: 'Complete project structure with configuration files',
      format: 'files and folders',
      estimatedLines: 500,
      files: ['package.json', 'README.md', '.env.example', 'src/', 'tests/', 'docs/']
    },
    tags: ['setup', 'initialization', 'boilerplate', 'configuration'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'system',
    usageCount: 0
  },

  FEATURE_IMPLEMENTATION: {
    id: 'feature-implementation',
    name: 'Feature Implementation',
    description: 'Implement a specific feature with full functionality, tests, and documentation',
    category: PromptCategory.FEATURE,
    difficulty: DifficultyLevel.INTERMEDIATE,
    supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV, CodingTool.GITHUB_COPILOT],
    template: `# Feature Implementation: {{featureName}}

## Context
You are implementing the "{{featureName}}" feature for a {{projectType}} application.

**Current Tech Stack:**
- Frontend: {{frontend}}
- Backend: {{backend}}
- Database: {{database}}
- State Management: {{stateManagement}}

**Feature Specification:**
{{featureDescription}}

**User Stories:**
{{#each userStories}}
- {{this}}
{{/each}}

**Acceptance Criteria:**
{{#each acceptanceCriteria}}
- {{this}}
{{/each}}

## Implementation Requirements

### 1. Backend Implementation
- Create API endpoints for all CRUD operations
- Implement proper validation and error handling
- Add authentication/authorization if required
- Include rate limiting and security measures
- Write comprehensive API documentation

### 2. Frontend Implementation
- Create responsive UI components
- Implement state management
- Add form validation and error handling
- Include loading states and user feedback
- Ensure accessibility compliance (WCAG 2.1)

### 3. Database Layer
- Design and implement database schema
- Create migrations if using an ORM
- Add proper indexing for performance
- Include data validation constraints

### 4. Testing
- Write unit tests for all functions/components
- Create integration tests for API endpoints
- Add end-to-end tests for user workflows
- Include edge case and error scenario tests

### 5. Documentation
- Update API documentation
- Add inline code comments
- Create user documentation if needed
- Update README with new feature information

## Technical Constraints
{{#each constraints}}
- {{this}}
{{/each}}

## Code Quality Requirements
- Follow {{codeStyle.naming}} naming conventions
- Use {{codeStyle.indentation}} with {{codeStyle.indentSize}} spaces
- Include proper TypeScript types (if applicable)
- Add comprehensive error handling
- Implement proper logging
- Follow SOLID principles and clean code practices

Please implement this feature completely with all the above requirements.`,
    variables: [
      { name: 'featureName', type: 'string', required: true, description: 'Name of the feature to implement' },
      { name: 'projectType', type: 'string', required: true, description: 'Type of project' },
      { name: 'featureDescription', type: 'string', required: true, description: 'Detailed feature description' },
      { name: 'userStories', type: 'array', required: true, description: 'User stories for the feature' },
      { name: 'acceptanceCriteria', type: 'array', required: true, description: 'Acceptance criteria' },
      { name: 'frontend', type: 'string', required: true, description: 'Frontend framework' },
      { name: 'backend', type: 'string', required: true, description: 'Backend framework' },
      { name: 'database', type: 'string', required: true, description: 'Database system' },
      { name: 'stateManagement', type: 'string', required: false, description: 'State management solution' },
      { name: 'constraints', type: 'array', required: false, description: 'Technical constraints' },
      { name: 'codeStyle', type: 'object', required: false, description: 'Code style preferences' }
    ],
    contextRequirements: [
      { type: 'tech-stack', description: 'Current technology stack', required: true, format: 'object' },
      { type: 'features', description: 'Feature specifications', required: true, format: 'object' },
      { type: 'architecture', description: 'Application architecture', required: true, format: 'string' }
    ],
    expectedOutput: {
      type: 'code',
      description: 'Complete feature implementation with tests and documentation',
      format: 'multiple files',
      estimatedLines: 800,
      files: ['components/', 'api/', 'tests/', 'types/', 'utils/']
    },
    tags: ['feature', 'implementation', 'full-stack', 'testing'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'system',
    usageCount: 0
  },

  AI_INTEGRATION: {
    id: 'ai-integration',
    name: 'AI Service Integration',
    description: 'Integrate AI services and implement AI-powered features',
    category: PromptCategory.FEATURE,
    difficulty: DifficultyLevel.ADVANCED,
    supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV],
    template: `# AI Service Integration: {{aiServiceName}}

## Context
You are integrating {{aiServiceName}} into a {{projectType}} application to enable {{aiCapability}}.

**Current Tech Stack:**
- Frontend: {{frontend}}
- Backend: {{backend}}
- AI Service: {{aiServiceName}} ({{aiProvider}})
- Model: {{aiModel}}

**AI Integration Requirements:**
{{aiRequirements}}

**Use Cases:**
{{#each useCases}}
- {{this}}
{{/each}}

## Implementation Tasks

### 1. AI Service Client Setup
- Create a robust client for {{aiServiceName}}
- Implement proper authentication and API key management
- Add rate limiting and quota management
- Include retry logic with exponential backoff
- Add comprehensive error handling for AI service failures

### 2. Prompt Engineering
- Design effective prompts for {{aiCapability}}
- Implement prompt templates with variable substitution
- Add prompt optimization and A/B testing capabilities
- Create prompt versioning and management system

### 3. Response Processing
- Parse and validate AI service responses
- Implement response caching for efficiency
- Add response streaming for real-time updates
- Include content filtering and safety checks

### 4. Integration Layer
- Create service layer for AI operations
- Implement background job processing for long-running tasks
- Add progress tracking and status updates
- Include fallback mechanisms for service failures

### 5. Frontend Integration
- Create UI components for AI interactions
- Implement real-time updates and progress indicators
- Add user feedback collection for AI responses
- Include loading states and error handling

### 6. Performance Optimization
- Implement response caching strategies
- Add request batching where applicable
- Optimize for cost efficiency
- Include monitoring and analytics

### 7. Security and Privacy
- Implement data sanitization before sending to AI
- Add user consent management
- Include audit logging for AI operations
- Ensure compliance with privacy regulations

## Technical Specifications
- API Endpoint: {{apiEndpoint}}
- Authentication: {{authMethod}}
- Rate Limits: {{rateLimit}}
- Cost per Request: {{costPerRequest}}
- Expected Response Time: {{responseTime}}

## Error Handling Requirements
- Handle API rate limiting gracefully
- Implement circuit breaker pattern
- Add comprehensive logging for debugging
- Include user-friendly error messages
- Implement automatic retry with backoff

Please implement a complete AI integration with all the above requirements.`,
    variables: [
      { name: 'aiServiceName', type: 'string', required: true, description: 'Name of the AI service' },
      { name: 'aiProvider', type: 'string', required: true, description: 'AI service provider' },
      { name: 'aiModel', type: 'string', required: true, description: 'AI model to use' },
      { name: 'aiCapability', type: 'string', required: true, description: 'AI capability being integrated' },
      { name: 'aiRequirements', type: 'string', required: true, description: 'Specific AI requirements' },
      { name: 'useCases', type: 'array', required: true, description: 'AI use cases' },
      { name: 'projectType', type: 'string', required: true, description: 'Type of project' },
      { name: 'frontend', type: 'string', required: true, description: 'Frontend framework' },
      { name: 'backend', type: 'string', required: true, description: 'Backend framework' },
      { name: 'apiEndpoint', type: 'string', required: false, description: 'AI service API endpoint' },
      { name: 'authMethod', type: 'string', required: false, description: 'Authentication method' },
      { name: 'rateLimit', type: 'string', required: false, description: 'Rate limiting information' },
      { name: 'costPerRequest', type: 'string', required: false, description: 'Cost per API request' },
      { name: 'responseTime', type: 'string', required: false, description: 'Expected response time' }
    ],
    contextRequirements: [
      { type: 'tech-stack', description: 'Current technology stack', required: true, format: 'object' },
      { type: 'features', description: 'AI feature requirements', required: true, format: 'object' }
    ],
    expectedOutput: {
      type: 'code',
      description: 'Complete AI service integration with client, processing, and UI components',
      format: 'multiple files',
      estimatedLines: 1200,
      files: ['ai-client/', 'services/', 'components/', 'types/', 'utils/', 'tests/']
    },
    tags: ['ai', 'integration', 'api', 'advanced'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'system',
    usageCount: 0
  },

  TESTING_SUITE: {
    id: 'testing-suite',
    name: 'Comprehensive Testing Suite',
    description: 'Create a complete testing suite with unit, integration, and e2e tests',
    category: PromptCategory.TESTING,
    difficulty: DifficultyLevel.INTERMEDIATE,
    supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV, CodingTool.GITHUB_COPILOT],
    template: `# Testing Suite Implementation

## Context
You are creating a comprehensive testing suite for a {{projectType}} application.

**Tech Stack:**
- Frontend: {{frontend}}
- Backend: {{backend}}
- Database: {{database}}
- Testing Frameworks: {{testingFrameworks}}

**Features to Test:**
{{#each features}}
- {{this}}
{{/each}}

## Testing Requirements

### 1. Unit Tests
- Test all utility functions and helpers
- Test React components with React Testing Library
- Test API route handlers and business logic
- Test database models and queries
- Achieve minimum {{unitTestCoverage}}% code coverage

### 2. Integration Tests
- Test API endpoints with real database
- Test authentication and authorization flows
- Test third-party service integrations
- Test database migrations and seeds
- Test file upload and processing workflows

### 3. End-to-End Tests
- Test complete user workflows
- Test cross-browser compatibility
- Test responsive design on different devices
- Test performance under load
- Test accessibility compliance

### 4. Test Infrastructure
- Set up test databases and environments
- Create test data factories and fixtures
- Implement test utilities and helpers
- Set up continuous integration testing
- Add test reporting and coverage analysis

## Specific Test Cases

### Frontend Testing
- Component rendering and props
- User interactions and event handling
- Form validation and submission
- State management and updates
- Error boundaries and error handling
- Accessibility and keyboard navigation

### Backend Testing
- API request/response validation
- Authentication and authorization
- Database operations and transactions
- Error handling and edge cases
- Rate limiting and security measures
- Background job processing

### Integration Testing
- Database connectivity and operations
- External API integrations
- File system operations
- Email and notification services
- Payment processing workflows
- Real-time features (WebSocket, SSE)

## Test Configuration
- Use {{testRunner}} as the test runner
- Configure {{testingFrameworks}} for different test types
- Set up test environment variables
- Create separate test database
- Configure CI/CD pipeline integration

## Quality Standards
- All tests must be deterministic and reliable
- Tests should be fast and efficient
- Use descriptive test names and organize by feature
- Include both positive and negative test cases
- Mock external dependencies appropriately
- Follow AAA pattern (Arrange, Act, Assert)

Please create a complete testing suite with all the above requirements.`,
    variables: [
      { name: 'projectType', type: 'string', required: true, description: 'Type of project' },
      { name: 'frontend', type: 'string', required: true, description: 'Frontend framework' },
      { name: 'backend', type: 'string', required: true, description: 'Backend framework' },
      { name: 'database', type: 'string', required: true, description: 'Database system' },
      { name: 'testingFrameworks', type: 'array', required: true, description: 'Testing frameworks to use' },
      { name: 'features', type: 'array', required: true, description: 'Features to test' },
      { name: 'unitTestCoverage', type: 'number', required: false, description: 'Target unit test coverage percentage' },
      { name: 'testRunner', type: 'string', required: false, description: 'Test runner to use' }
    ],
    contextRequirements: [
      { type: 'tech-stack', description: 'Complete technology stack', required: true, format: 'object' },
      { type: 'features', description: 'Features to test', required: true, format: 'array' },
      { type: 'architecture', description: 'Application architecture', required: true, format: 'string' }
    ],
    expectedOutput: {
      type: 'code',
      description: 'Complete testing suite with unit, integration, and e2e tests',
      format: 'multiple files',
      estimatedLines: 2000,
      files: ['__tests__/', 'test-utils/', 'fixtures/', 'e2e/', 'jest.config.js', 'playwright.config.ts']
    },
    tags: ['testing', 'quality-assurance', 'automation', 'coverage'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'system',
    usageCount: 0
  },

  DEPLOYMENT_SETUP: {
    id: 'deployment-setup',
    name: 'Production Deployment Setup',
    description: 'Set up production deployment with CI/CD pipeline and monitoring',
    category: PromptCategory.DEPLOYMENT,
    difficulty: DifficultyLevel.ADVANCED,
    supportedTools: [CodingTool.CURSOR, CodingTool.CLAUDE_DEV],
    template: `# Production Deployment Setup

## Context
You are setting up production deployment for a {{projectType}} application.

**Deployment Platform:** {{deploymentPlatform}}
**Tech Stack:**
- Frontend: {{frontend}}
- Backend: {{backend}}
- Database: {{database}}
- Infrastructure: {{infrastructure}}

**Requirements:**
{{#each requirements}}
- {{this}}
{{/each}}

## Deployment Tasks

### 1. Environment Configuration
- Set up production environment variables
- Configure database connections and credentials
- Set up API keys and service configurations
- Configure domain and SSL certificates
- Set up CDN and static asset delivery

### 2. CI/CD Pipeline
- Create GitHub Actions / GitLab CI pipeline
- Set up automated testing on pull requests
- Configure build and deployment stages
- Add security scanning and vulnerability checks
- Implement blue-green or rolling deployments

### 3. Infrastructure as Code
- Create infrastructure configuration files
- Set up load balancers and auto-scaling
- Configure database backups and replication
- Set up monitoring and logging infrastructure
- Implement disaster recovery procedures

### 4. Security Configuration
- Set up firewall rules and security groups
- Configure HTTPS and security headers
- Implement rate limiting and DDoS protection
- Set up secrets management
- Configure audit logging and compliance

### 5. Monitoring and Observability
- Set up application performance monitoring
- Configure error tracking and alerting
- Implement health checks and uptime monitoring
- Set up log aggregation and analysis
- Create dashboards for key metrics

### 6. Database Management
- Set up production database with backups
- Configure connection pooling and optimization
- Implement database migrations strategy
- Set up read replicas if needed
- Configure monitoring and performance tuning

### 7. Performance Optimization
- Configure caching layers (Redis, CDN)
- Optimize asset delivery and compression
- Set up database query optimization
- Implement API response caching
- Configure auto-scaling policies

## Platform-Specific Configuration

{{#if (eq deploymentPlatform "vercel")}}
### Vercel Configuration
- Configure vercel.json for routing and headers
- Set up environment variables in Vercel dashboard
- Configure build settings and output directory
- Set up custom domains and SSL
- Configure serverless function limits
{{/if}}

{{#if (eq deploymentPlatform "aws")}}
### AWS Configuration
- Set up EC2 instances or ECS containers
- Configure RDS for database
- Set up CloudFront for CDN
- Configure Route 53 for DNS
- Set up CloudWatch for monitoring
{{/if}}

{{#if (eq deploymentPlatform "docker")}}
### Docker Configuration
- Create production Dockerfile
- Set up docker-compose for services
- Configure container orchestration
- Set up container registry
- Implement container health checks
{{/if}}

## Deployment Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring and alerting active
- [ ] Backup procedures tested
- [ ] Performance benchmarks met
- [ ] Security scan passed
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team access configured

Please create a complete production deployment setup with all configurations and documentation.`,
    variables: [
      { name: 'projectType', type: 'string', required: true, description: 'Type of project' },
      { name: 'deploymentPlatform', type: 'string', required: true, description: 'Deployment platform' },
      { name: 'frontend', type: 'string', required: true, description: 'Frontend framework' },
      { name: 'backend', type: 'string', required: true, description: 'Backend framework' },
      { name: 'database', type: 'string', required: true, description: 'Database system' },
      { name: 'infrastructure', type: 'array', required: true, description: 'Infrastructure components' },
      { name: 'requirements', type: 'array', required: true, description: 'Deployment requirements' }
    ],
    contextRequirements: [
      { type: 'tech-stack', description: 'Complete technology stack', required: true, format: 'object' },
      { type: 'deployment', description: 'Deployment requirements', required: true, format: 'object' }
    ],
    expectedOutput: {
      type: 'configuration',
      description: 'Complete deployment configuration with CI/CD pipeline and monitoring',
      format: 'configuration files and scripts',
      estimatedLines: 800,
      files: ['.github/workflows/', 'docker/', 'terraform/', 'k8s/', 'scripts/', 'docs/']
    },
    tags: ['deployment', 'ci-cd', 'production', 'infrastructure'],
    version: '1.0.0',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: 'system',
    usageCount: 0
  }
}

export function getCodingPromptTemplate(templateId: string): CodingPromptTemplate | null {
  return CODING_PROMPT_TEMPLATES[templateId] || null
}

export function getAllCodingPromptTemplates(): CodingPromptTemplate[] {
  return Object.values(CODING_PROMPT_TEMPLATES)
}

export function getCodingPromptTemplatesByCategory(category: PromptCategory): CodingPromptTemplate[] {
  return Object.values(CODING_PROMPT_TEMPLATES).filter(template => template.category === category)
}

export function getCodingPromptTemplatesByTool(tool: CodingTool): CodingPromptTemplate[] {
  return Object.values(CODING_PROMPT_TEMPLATES).filter(template => 
    template.supportedTools.includes(tool)
  )
}

export function getCodingPromptTemplatesByDifficulty(difficulty: DifficultyLevel): CodingPromptTemplate[] {
  return Object.values(CODING_PROMPT_TEMPLATES).filter(template => template.difficulty === difficulty)
}