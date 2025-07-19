import { PromptTemplate } from '@/types/ai-services'

export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  PRODUCT_PLAN_GENERATION: {
    id: 'product-plan-generation',
    name: 'Product Plan Generation',
    description: 'Generates a comprehensive product plan from an idea',
    template: `You are an expert product strategist. Based on the following idea, create a comprehensive product plan.

IDEA: {{idea}}

Please provide a detailed product plan in the following JSON format:

{
  "targetAudience": {
    "primary": "Primary target audience description",
    "secondary": "Secondary target audience description",
    "demographics": ["demographic1", "demographic2"],
    "painPoints": ["pain point 1", "pain point 2"],
    "motivations": ["motivation 1", "motivation 2"]
  },
  "coreFeatures": [
    {
      "name": "Feature Name",
      "description": "Feature description",
      "priority": "high|medium|low",
      "userValue": "Value proposition for users",
      "complexity": "simple|moderate|complex"
    }
  ],
  "differentiators": [
    "Unique selling point 1",
    "Unique selling point 2"
  ],
  "monetization": {
    "primaryModel": "subscription|freemium|one-time|marketplace|advertising",
    "pricingStrategy": "Pricing strategy description",
    "revenueStreams": ["stream1", "stream2"],
    "competitivePricing": "Pricing analysis vs competitors"
  },
  "gtmStrategy": {
    "launchStrategy": "Go-to-market approach",
    "marketingChannels": ["channel1", "channel2"],
    "partnerships": ["potential partnership 1"],
    "timeline": "Launch timeline and milestones"
  }
}

Focus on creating a realistic, actionable plan that addresses real market needs.`,
    variables: [
      {
        name: 'idea',
        type: 'string',
        required: true,
        description: 'The startup or product idea to analyze'
      }
    ],
    metadata: {
      category: 'product-planning',
      version: '1.0',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  TECH_STACK_GENERATION: {
    id: 'tech-stack-generation',
    name: 'Tech Stack Generation',
    description: 'Generates a technical architecture and tech stack recommendation',
    template: `You are a senior software architect. Based on the product requirements, recommend a comprehensive tech stack.

PRODUCT FEATURES: {{features}}
SCALE REQUIREMENTS: {{scale}}
BUDGET CONSTRAINTS: {{budget}}
TEAM EXPERIENCE: {{teamExperience}}

Please provide a detailed tech stack recommendation in the following JSON format:

{
  "frontend": [
    {
      "name": "Technology Name",
      "category": "framework|library|tool",
      "reasoning": "Why this choice",
      "alternatives": ["alternative1", "alternative2"],
      "pros": ["pro1", "pro2"],
      "cons": ["con1", "con2"],
      "cost": 0
    }
  ],
  "backend": [
    {
      "name": "Technology Name",
      "category": "framework|runtime|database|service",
      "reasoning": "Why this choice",
      "alternatives": ["alternative1"],
      "pros": ["pro1"],
      "cons": ["con1"],
      "cost": 100
    }
  ],
  "database": [
    {
      "name": "Database Name",
      "category": "sql|nosql|cache|search",
      "reasoning": "Why this choice",
      "alternatives": ["alternative1"],
      "pros": ["pro1"],
      "cons": ["con1"],
      "cost": 50
    }
  ],
  "aiServices": [
    {
      "name": "AI Service",
      "category": "llm|vision|speech|embedding",
      "reasoning": "Why needed",
      "alternatives": ["alternative1"],
      "pros": ["pro1"],
      "cons": ["con1"],
      "cost": 200
    }
  ],
  "deployment": [
    {
      "name": "Platform Name",
      "category": "cloud|serverless|container",
      "reasoning": "Why this choice",
      "alternatives": ["alternative1"],
      "pros": ["pro1"],
      "cons": ["con1"],
      "cost": 150
    }
  ],
  "security": [
    "Security guideline 1",
    "Security guideline 2"
  ]
}

Consider modern best practices, scalability, and cost-effectiveness.`,
    variables: [
      {
        name: 'features',
        type: 'array',
        required: true,
        description: 'List of product features'
      },
      {
        name: 'scale',
        type: 'string',
        required: true,
        description: 'Expected scale (small, medium, large)'
      },
      {
        name: 'budget',
        type: 'string',
        required: true,
        description: 'Budget constraints (low, medium, high)'
      },
      {
        name: 'teamExperience',
        type: 'string',
        required: true,
        description: 'Team experience level (junior, mixed, senior)'
      }
    ],
    metadata: {
      category: 'technical-architecture',
      version: '1.0',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  AI_WORKFLOW_GENERATION: {
    id: 'ai-workflow-generation',
    name: 'AI Workflow Generation',
    description: 'Generates AI workflow and pipeline architecture',
    template: `You are an AI systems architect. Design a comprehensive AI workflow for the given features.

FEATURES REQUIRING AI: {{aiFeatures}}
TECHNICAL CONSTRAINTS: {{constraints}}
DATA SOURCES: {{dataSources}}

Please provide a detailed AI workflow in the following JSON format:

{
  "nodes": [
    {
      "id": "node1",
      "type": "input|processing|ai-model|output|decision",
      "label": "Node Label",
      "position": {"x": 100, "y": 100},
      "configuration": {
        "model": "Model name if applicable",
        "parameters": {},
        "inputFormat": "text|image|audio|structured",
        "outputFormat": "text|json|binary"
      },
      "inputs": ["input1"],
      "outputs": ["output1"]
    }
  ],
  "edges": [
    {
      "id": "edge1",
      "source": "node1",
      "target": "node2",
      "label": "Data flow description"
    }
  ],
  "modules": [
    {
      "name": "Module Name",
      "description": "What this module does",
      "nodes": ["node1", "node2"],
      "configurable": true,
      "optional": false
    }
  ],
  "configuration": {
    "parallelProcessing": true,
    "errorHandling": "retry|fallback|fail",
    "monitoring": true,
    "caching": true
  }
}

Design for scalability, reliability, and maintainability.`,
    variables: [
      {
        name: 'aiFeatures',
        type: 'array',
        required: true,
        description: 'Features that require AI processing'
      },
      {
        name: 'constraints',
        type: 'string',
        required: false,
        description: 'Technical constraints and requirements'
      },
      {
        name: 'dataSources',
        type: 'array',
        required: false,
        description: 'Available data sources'
      }
    ],
    metadata: {
      category: 'ai-architecture',
      version: '1.0',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  ROADMAP_GENERATION: {
    id: 'roadmap-generation',
    name: 'Development Roadmap Generation',
    description: 'Generates a prioritized development roadmap',
    template: `You are a technical project manager. Create a detailed development roadmap based on the product plan and tech stack.

PRODUCT FEATURES: {{features}}
TECH STACK: {{techStack}}
TEAM SIZE: {{teamSize}}
TIMELINE: {{timeline}}

Please provide a detailed roadmap in the following JSON format:

{
  "phases": [
    {
      "name": "Phase Name",
      "description": "Phase description",
      "duration": "Duration in weeks",
      "priority": "critical|high|medium|low",
      "tasks": [
        {
          "name": "Task Name",
          "description": "Task description",
          "estimatedHours": 40,
          "dependencies": ["task1", "task2"],
          "skills": ["skill1", "skill2"],
          "complexity": "simple|moderate|complex"
        }
      ]
    }
  ],
  "milestones": [
    {
      "name": "Milestone Name",
      "description": "What will be achieved",
      "targetDate": "Week X",
      "deliverables": ["deliverable1", "deliverable2"]
    }
  ],
  "risks": [
    {
      "risk": "Risk description",
      "impact": "high|medium|low",
      "probability": "high|medium|low",
      "mitigation": "Mitigation strategy"
    }
  ],
  "resources": {
    "totalEstimatedHours": 1000,
    "teamRequirements": ["role1", "role2"],
    "externalDependencies": ["dependency1"]
  }
}

Prioritize MVP features and ensure realistic timelines.`,
    variables: [
      {
        name: 'features',
        type: 'array',
        required: true,
        description: 'Product features to implement'
      },
      {
        name: 'techStack',
        type: 'object',
        required: true,
        description: 'Selected technology stack'
      },
      {
        name: 'teamSize',
        type: 'number',
        required: true,
        description: 'Number of team members'
      },
      {
        name: 'timeline',
        type: 'string',
        required: true,
        description: 'Target timeline for completion'
      }
    ],
    metadata: {
      category: 'project-management',
      version: '1.0',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  },

  FINANCIAL_MODEL_GENERATION: {
    id: 'financial-model-generation',
    name: 'Financial Model Generation',
    description: 'Generates financial projections and cost analysis',
    template: `You are a financial analyst specializing in tech startups. Create a comprehensive financial model.

PRODUCT PLAN: {{productPlan}}
TECH STACK: {{techStack}}
MARKET SIZE: {{marketSize}}
BUSINESS MODEL: {{businessModel}}

Please provide a detailed financial model in the following JSON format:

{
  "costs": {
    "infrastructure": [
      {
        "item": "Cost item",
        "monthlyAmount": 100,
        "yearlyAmount": 1200,
        "category": "hosting|database|ai-services|tools",
        "scalingFactor": "linear|exponential|stepped"
      }
    ],
    "team": [
      {
        "role": "Developer",
        "monthlyAmount": 8000,
        "yearlyAmount": 96000,
        "quantity": 2,
        "timing": "Month 1"
      }
    ],
    "tools": [
      {
        "tool": "Tool name",
        "monthlyAmount": 50,
        "yearlyAmount": 600,
        "category": "development|design|analytics|marketing"
      }
    ]
  },
  "revenue": {
    "projections": [
      {
        "month": 1,
        "users": 100,
        "revenue": 1000,
        "churn": 0.05,
        "acquisitionCost": 50
      }
    ],
    "assumptions": {
      "conversionRate": 0.02,
      "averageRevenuePerUser": 10,
      "growthRate": 0.15,
      "churnRate": 0.05
    }
  },
  "metrics": {
    "breakEvenMonth": 18,
    "totalFundingNeeded": 500000,
    "ltv": 200,
    "cac": 50,
    "ltvCacRatio": 4,
    "grossMargin": 0.8
  },
  "scenarios": {
    "conservative": {"revenue": 100000, "costs": 80000},
    "realistic": {"revenue": 250000, "costs": 150000},
    "optimistic": {"revenue": 500000, "costs": 200000}
  }
}

Base projections on realistic market assumptions and industry benchmarks.`,
    variables: [
      {
        name: 'productPlan',
        type: 'object',
        required: true,
        description: 'Product plan with monetization strategy'
      },
      {
        name: 'techStack',
        type: 'object',
        required: true,
        description: 'Technology stack with cost implications'
      },
      {
        name: 'marketSize',
        type: 'string',
        required: false,
        description: 'Target market size and characteristics'
      },
      {
        name: 'businessModel',
        type: 'string',
        required: true,
        description: 'Business model type'
      }
    ],
    metadata: {
      category: 'financial-planning',
      version: '1.0',
      author: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export function getPromptTemplate(templateId: string): PromptTemplate | null {
  return PROMPT_TEMPLATES[templateId] || null
}

export function buildPrompt(templateId: string, variables: Record<string, any>): string {
  const template = getPromptTemplate(templateId)
  if (!template) {
    throw new Error(`Template not found: ${templateId}`)
  }

  let prompt = template.template

  // Replace variables in the template
  for (const variable of template.variables) {
    const value = variables[variable.name]
    
    if (variable.required && (value === undefined || value === null)) {
      throw new Error(`Required variable missing: ${variable.name}`)
    }

    const placeholder = `{{${variable.name}}}`
    const replacement = formatVariableValue(value, variable.type)
    prompt = prompt.replace(new RegExp(placeholder, 'g'), replacement)
  }

  return prompt
}

function formatVariableValue(value: any, type: string): string {
  if (value === undefined || value === null) {
    return ''
  }

  switch (type) {
    case 'array':
      return Array.isArray(value) ? value.join(', ') : String(value)
    case 'object':
      return typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
    case 'number':
      return String(Number(value))
    case 'boolean':
      return String(Boolean(value))
    default:
      return String(value)
  }
}

export function validatePromptVariables(templateId: string, variables: Record<string, any>): {
  valid: boolean
  errors: string[]
} {
  const template = getPromptTemplate(templateId)
  if (!template) {
    return { valid: false, errors: [`Template not found: ${templateId}`] }
  }

  const errors: string[] = []

  for (const variable of template.variables) {
    const value = variables[variable.name]

    if (variable.required && (value === undefined || value === null)) {
      errors.push(`Required variable missing: ${variable.name}`)
      continue
    }

    if (value !== undefined && value !== null) {
      // Type validation
      switch (variable.type) {
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`Variable ${variable.name} must be a number`)
          }
          break
        case 'boolean':
          if (typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            errors.push(`Variable ${variable.name} must be a boolean`)
          }
          break
        case 'array':
          if (!Array.isArray(value) && typeof value !== 'string') {
            errors.push(`Variable ${variable.name} must be an array or string`)
          }
          break
        case 'object':
          if (typeof value !== 'object') {
            errors.push(`Variable ${variable.name} must be an object`)
          }
          break
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}