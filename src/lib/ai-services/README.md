# AI Service Integration Layer

This module provides a comprehensive AI service integration layer for Desenyon: InfiniteIdea, supporting multiple AI providers with advanced features like rate limiting, circuit breakers, fallback mechanisms, and orchestrated blueprint generation.

## Features

- **Multiple AI Providers**: OpenAI and Anthropic Claude support
- **Rate Limiting**: Automatic rate limiting per provider
- **Circuit Breaker**: Fault tolerance with automatic recovery
- **Fallback Chain**: Automatic fallback between providers
- **Response Validation**: JSON parsing and validation
- **Parallel Processing**: Efficient parallel AI calls
- **Prompt Templates**: Structured prompt management
- **Blueprint Orchestration**: Complete blueprint generation workflow

## Quick Start

### Basic AI Request

```typescript
import { makeAIRequest } from '@/lib/ai-services'

const response = await makeAIRequest(
  'Explain the benefits of TypeScript',
  {
    provider: 'openai',
    model: 'gpt-4-turbo',
    temperature: 0.7,
    maxTokens: 500
  }
)

if (response.success) {
  console.log(response.data)
  console.log(`Cost: $${response.usage.cost}`)
}
```

### Streaming Request

```typescript
import { makeStreamingAIRequest } from '@/lib/ai-services'

const stream = await makeStreamingAIRequest(
  'Write a story about AI',
  { provider: 'anthropic', model: 'claude-3-sonnet-20240229' }
)

for await (const chunk of stream) {
  process.stdout.write(chunk)
}
```

### Blueprint Generation

```typescript
import { AIOrchestrationService } from '@/lib/ai-services'

const orchestrator = new AIOrchestrationService()

const request = {
  idea: {
    id: 'idea-1',
    originalInput: 'A productivity app with AI insights',
    extractedFeatures: ['task management', 'AI insights'],
    category: 'productivity',
    complexity: 'moderate',
    timestamp: new Date()
  },
  preferences: {
    aiProvider: 'auto',
    complexity: 'detailed',
    focus: ['product', 'technical', 'financial'],
    budget: 100000,
    timeline: '6 months',
    teamSize: 3
  }
}

const blueprint = await orchestrator.generateBlueprint(request)
console.log(blueprint.blueprint.productPlan)
```

## Configuration

Set up environment variables:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_ORGANIZATION=your-org-id  # Optional

# Anthropic Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key
```

## API Endpoints

### Test AI Services
```
GET /api/ai/test?action=status
GET /api/ai/test?action=test
GET /api/ai/test?action=simple-request
POST /api/ai/test
```

### Blueprint Orchestration
```
POST /api/ai/orchestrate    # Generate complete blueprint
PUT /api/ai/orchestrate     # Regenerate specific section
PATCH /api/ai/orchestrate   # Optimize blueprint
GET /api/ai/orchestrate?action=validate  # Validate blueprint
```

## Architecture

### AI Service Manager
- Handles multiple AI providers
- Implements rate limiting and circuit breakers
- Manages request queuing and fallbacks
- Provides connection testing and status monitoring

### AI Orchestration Service
- Coordinates complex multi-step AI workflows
- Generates complete product blueprints
- Validates and optimizes generated content
- Supports section regeneration with feedback

### Prompt Templates
- Structured prompt management
- Variable substitution and validation
- Reusable templates for different blueprint sections
- Type-safe prompt building

## Error Handling

The system includes comprehensive error handling:

- **Rate Limiting**: Automatic queuing when limits are reached
- **Circuit Breaker**: Temporary provider disabling after failures
- **Fallback Chain**: Automatic switching between providers
- **Retry Logic**: Configurable retry with exponential backoff
- **Validation**: Response parsing and structure validation

## Testing

Run the test suite:

```bash
npm run test src/lib/__tests__/ai-services.test.ts
npm run test src/lib/__tests__/ai-orchestrator.test.ts
```

## Cost Monitoring

The system tracks usage and costs:

```typescript
import { getAIProviderStatus } from '@/lib/ai-services'

const status = getAIProviderStatus()
console.log(status.openai.rateLimited)
console.log(status.anthropic.circuitBreakerOpen)
```

## Blueprint Sections

The orchestrator generates five main blueprint sections:

1. **Product Plan**: Target audience, features, monetization, GTM strategy
2. **Tech Stack**: Frontend, backend, database, AI services, deployment
3. **AI Workflow**: Visual pipeline with nodes, edges, and modules
4. **Roadmap**: Phased development plan with tasks and timelines
5. **Financial Model**: Cost analysis, revenue projections, metrics

Each section can be regenerated independently with user feedback.