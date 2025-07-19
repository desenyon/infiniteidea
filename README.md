# Desenyon: InfiniteIdea

> Transform your ideas into comprehensive business blueprints with AI-powered analysis and planning.

## 🚀 Overview

Desenyon: InfiniteIdea is an advanced AI-powered platform that transforms rough business ideas into detailed, actionable blueprints. Using sophisticated AI orchestration, the platform generates comprehensive product plans, technical architectures, financial models, roadmaps, and AI workflows.

## ✨ Key Features

### 🧠 AI-Powered Blueprint Generation

- **Multi-AI Orchestration**: Leverages OpenAI, Anthropic Claude, and other AI services
- **Comprehensive Analysis**: Generates product plans, tech stacks, financial models, and roadmaps
- **Intelligent Workflows**: Creates AI-powered development workflows
- **Context-Aware Processing**: Understands project requirements and constraints

### 🛠️ External Tool Integration

- **IDE Integration**: Seamless integration with Cursor, VS Code, and other development tools
- **Project Export**: Export blueprints to various formats and development environments
- **Coding Prompt Generation**: AI-generated coding prompts for different tools and frameworks
- **Template Management**: Customizable templates for different project types

### 📊 Advanced Analytics & Monitoring

- **Real-time Performance Monitoring**: Track system performance and AI service usage
- **Error Tracking**: Comprehensive error tracking with Sentry integration
- **Usage Analytics**: Detailed analytics on blueprint generation and user interactions
- **Health Monitoring**: Automated health checks and alerting

### 🔧 Production-Ready Infrastructure

- **Scalable Architecture**: Built with Next.js 15, React 19, and modern web technologies
- **Database Management**: PostgreSQL with Prisma ORM for robust data management
- **Caching Layer**: Redis-based caching for optimal performance
- **Queue Management**: Background job processing with Bull/BullMQ
- **Security**: Authentication with NextAuth.js and comprehensive security headers

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis (Upstash for production)
- **AI Services**: OpenAI GPT-4, Anthropic Claude, Replicate
- **Authentication**: NextAuth.js with multiple providers
- **Monitoring**: Sentry, Custom performance monitoring
- **Deployment**: Vercel with automated CI/CD

### Key Components

- **AI Orchestrator**: Manages multiple AI service calls and fallbacks
- **Blueprint Generator**: Creates comprehensive project blueprints
- **Workflow Engine**: Generates AI-powered development workflows
- **External Tool Integration**: Manages integrations with development tools
- **Performance Monitor**: Real-time system monitoring and alerting

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Redis instance (optional for development)
- AI service API keys (OpenAI, Anthropic)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd desenyon-infinite-idea
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables (see [Environment Configuration](#environment-configuration) below).
4. **Set up the database**

   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```
5. **Start the development server**

   ```bash
   npm run dev
   ```
6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Configuration

### Required Environment Variables

#### Database

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/desenyon_infinite_idea"
```

#### Authentication

```bash
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (at least one required)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

#### AI Services (at least one required)

```bash
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
REPLICATE_API_TOKEN="your-replicate-api-token"
```

### Optional Environment Variables

#### Cache (Redis)

```bash
REDIS_URL="redis://localhost:6379"
UPSTASH_REDIS_REST_URL="your-upstash-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-redis-token"
```

#### Monitoring & Analytics

```bash
SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-sentry-org"
SENTRY_PROJECT="your-sentry-project"
```

#### Email (for magic link authentication)

```bash
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@desenyon.com"
```

## 🧪 Testing

### Run All Tests

```bash
npm run test:all
```

### Individual Test Suites

```bash
# Unit tests
npm run test:run

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Visual regression tests
npm run test:visual
```

### Test Coverage

The project includes comprehensive test coverage:

- **Unit Tests**: 158+ tests covering core functionality
- **Integration Tests**: AI service integration and workflow testing
- **E2E Tests**: Complete user journey testing with Playwright
- **Performance Tests**: Blueprint generation performance benchmarks
- **Visual Tests**: UI component visual regression testing

## 🚀 Deployment

### Production Deployment (Vercel)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Monitor deployment
npm run deploy:monitor

# Rollback if needed
npm run deploy:rollback <deployment-id>
```

### Database Migration in Production

```bash
# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

## 📊 Monitoring & Maintenance

### Health Checks

- **Application Health**: `/api/health`
- **Cache Health**: `/api/health/cache`
- **Admin Dashboard**: `/api/admin/monitoring` (requires admin key)

### Monitoring Commands

```bash
# Check application health
npm run health:check

# Monitor performance
npm run monitor:performance

# View deployment logs
npm run deploy:logs
```

### Backup & Recovery

```bash
# Full backup
npm run backup:full

# Database backup only
npm run backup:database

# Cleanup old backups
npm run backup:cleanup
```

## 🔧 Development

### Project Structure

```
desenyon-infinite-idea/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Core libraries and utilities
│   │   ├── ai-services/     # AI service management
│   │   ├── cache/           # Caching layer
│   │   ├── external-tools/  # Tool integrations
│   │   ├── monitoring/      # Performance monitoring
│   │   └── queue/           # Job queue management
│   └── types/               # TypeScript type definitions
├── tests/                   # Test suites
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── prisma/                  # Database schema and migrations
```

### Key Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Database operations
npm run db:studio      # Open Prisma Studio
npm run db:migrate     # Run migrations
npm run db:reset       # Reset database
npm run db:seed        # Seed database
```

### Code Quality

- **TypeScript**: Full type safety with strict configuration
- **ESLint**: Code linting with Next.js recommended rules
- **Prettier**: Code formatting (configured in ESLint)
- **Husky**: Git hooks for pre-commit checks
- **Testing**: Comprehensive test coverage with Vitest and Playwright

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm run test:all`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow the existing code style and patterns

## 📚 API Documentation

### Core Endpoints

#### Blueprint Generation

```bash
POST /api/projects
# Generate a new project blueprint

GET /api/projects/:id
# Retrieve project details

PUT /api/projects/:id
# Update project

DELETE /api/projects/:id
# Delete project
```

#### AI Services

```bash
POST /api/ai/orchestrate
# Orchestrate multiple AI services

GET /api/ai/test
# Test AI service connectivity
```

#### External Tools

```bash
POST /api/tools/launch
# Launch external development tool

GET /api/tools/api-keys
# Manage API keys for tools
```

#### Health & Monitoring

```bash
GET /api/health
# Application health check

GET /api/admin/monitoring
# Admin monitoring dashboard
```

## 🔒 Security

### Security Features

- **Authentication**: Secure authentication with NextAuth.js
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive input validation with Zod
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: React's built-in XSS protection
- **CSRF Protection**: NextAuth.js CSRF protection
- **Security Headers**: Comprehensive security headers

### Security Best Practices

- All API keys stored as environment variables
- Sensitive data encrypted in transit and at rest
- Regular security audits with `npm audit`
- Rate limiting on API endpoints
- Input sanitization and validation

## 📈 Performance

### Performance Features

- **Caching**: Multi-layer caching with Redis and in-memory cache
- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component optimization
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Performance Monitoring**: Real-time performance tracking

### Performance Metrics

- **Page Load Time**: < 2 seconds target
- **API Response Time**: < 500ms average
- **Cache Hit Rate**: > 90% target
- **Error Rate**: < 1% target

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Issues

```bash
# Check database connection
npm run db:generate
npm run db:push
```

#### AI Service Issues

```bash
# Test AI service connectivity
curl http://localhost:3000/api/ai/test
```

#### Cache Issues

```bash
# Check cache health
curl http://localhost:3000/api/health/cache
```

#### Build Issues

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Debug Mode

Set `DEBUG=true` in your environment variables to enable debug logging.

## 📞 Support

### Getting Help

- **Documentation**: Check the `/docs` directory for detailed guides
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

### Monitoring & Alerts

- **Health Checks**: Automated health monitoring every 5 minutes
- **Error Tracking**: Real-time error tracking with Sentry
- **Performance Alerts**: Automated alerts for performance degradation
- **Uptime Monitoring**: 99.9% uptime target with automated failover

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Anthropic** for Claude API
- **Vercel** for hosting and deployment platform
- **Next.js** team for the amazing framework
- **Prisma** team for the excellent ORM
- **All contributors** who help make this project better

---

**Built with ❤️ by the Desenyon team**
