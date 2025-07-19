# Deployment Guide

## Overview

This document outlines the production deployment pipeline for Desenyon: InfiniteIdea, including CI/CD setup, environment configuration, and monitoring procedures.

## Architecture

The application is deployed using:
- **Platform**: Vercel (Next.js optimized)
- **Database**: PostgreSQL (Supabase/Neon)
- **Cache**: Redis (Upstash)
- **Storage**: Vercel Blob Storage
- **Monitoring**: Built-in health checks + external monitoring

## Environment Setup

### 1. Production Environment Variables

Set the following environment variables in your Vercel dashboard:

#### Core Application
```bash
NODE_ENV=production
APP_URL=https://desenyon-infinite-idea.vercel.app
NEXTAUTH_SECRET=<generate-secure-random-string>
NEXTAUTH_URL=https://desenyon-infinite-idea.vercel.app
```

#### Database
```bash
DATABASE_URL=<postgresql-connection-string>
DATABASE_CONNECTION_LIMIT=20
DATABASE_POOL_TIMEOUT=20
```

#### AI Services
```bash
OPENAI_API_KEY=<openai-api-key>
ANTHROPIC_API_KEY=<anthropic-api-key>
REPLICATE_API_TOKEN=<replicate-token>
```

#### Cache & Storage
```bash
UPSTASH_REDIS_REST_URL=<upstash-redis-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-redis-token>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
```

#### Authentication
```bash
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
GITHUB_CLIENT_ID=<github-oauth-client-id>
GITHUB_CLIENT_SECRET=<github-oauth-client-secret>
```

### 2. GitHub Secrets

Configure the following secrets in your GitHub repository:

```bash
VERCEL_TOKEN=<vercel-deployment-token>
VERCEL_ORG_ID=<vercel-organization-id>
VERCEL_PROJECT_ID=<vercel-project-id>
SLACK_WEBHOOK=<slack-webhook-url>
```

## Deployment Pipeline

### Automatic Deployments

The CI/CD pipeline automatically triggers on:

1. **Pull Requests**: Runs tests and security scans
2. **Push to `develop`**: Deploys to staging environment
3. **Push to `main`**: Deploys to production environment

### Pipeline Stages

1. **Test Suite**
   - Unit tests with Vitest
   - Integration tests
   - E2E tests with Playwright
   - Type checking
   - Linting

2. **Security Scan**
   - Dependency vulnerability audit
   - Security code analysis

3. **Build**
   - Next.js production build
   - Prisma client generation
   - Asset optimization

4. **Deploy**
   - Staging deployment (develop branch)
   - Production deployment (main branch)
   - Post-deployment health checks

### Manual Deployment Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Monitor deployment
npm run deploy:monitor

# View deployment logs
npm run deploy:logs

# Rollback deployment
npm run deploy:rollback <deployment-id>
```

## Database Migrations

### Production Migration Process

1. **Test migrations in staging**:
   ```bash
   # In staging environment
   npx prisma migrate deploy
   ```

2. **Deploy to production**:
   ```bash
   # Automatic via CI/CD or manual
   npx prisma migrate deploy
   ```

3. **Verify migration**:
   ```bash
   npx prisma db pull
   npx prisma generate
   ```

### Migration Best Practices

- Always test migrations in staging first
- Use `prisma migrate deploy` for production (not `prisma migrate dev`)
- Backup database before major schema changes
- Monitor application after migrations

## Monitoring & Health Checks

### Built-in Health Checks

The application includes several health check endpoints:

- `/api/health` - Overall application health
- `/api/health/cache` - Redis cache status
- `/health` - Simplified health check (redirects to `/api/health`)

### Deployment Monitoring

Run the deployment monitor to check system health:

```bash
# Monitor production
npm run deploy:monitor

# Monitor staging
npm run deploy:monitor:staging
```

The monitor checks:
- Application health endpoints
- Critical API endpoints
- Performance metrics
- Database connectivity
- Cache availability

### Monitoring Results

Results are saved to `deployment-results.json` and include:
- Response times
- Status codes
- Error details
- Performance metrics

## Rollback Procedures

### Automatic Rollback

The system supports automatic rollback via GitHub Actions:

1. Go to GitHub Actions
2. Select "Emergency Rollback" workflow
3. Click "Run workflow"
4. Specify:
   - Environment (production/staging)
   - Previous deployment ID
   - Rollback reason

### Manual Rollback

```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>

# Verify rollback
npm run deploy:monitor
```

### Post-Rollback Actions

1. Verify application functionality
2. Check error logs
3. Create incident report
4. Plan fix for rolled-back issue

## Performance Optimization

### Build Optimization

- Next.js automatic code splitting
- Image optimization with Next.js Image component
- Bundle analysis and optimization
- Tree shaking for unused code

### Runtime Optimization

- Redis caching for API responses
- Database connection pooling
- CDN for static assets
- Serverless function optimization

### Monitoring Performance

- Vercel Analytics integration
- Core Web Vitals tracking
- API response time monitoring
- Database query performance

## Security Considerations

### Environment Security

- All secrets stored in Vercel environment variables
- No sensitive data in repository
- Secure database connections (SSL)
- API rate limiting enabled

### Application Security

- HTTPS enforced
- CORS properly configured
- Input validation and sanitization
- Authentication required for sensitive operations

### Monitoring Security

- Regular dependency updates
- Security audit in CI/CD pipeline
- Error tracking without sensitive data exposure
- Access logs monitoring

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors
   - Verify environment variables
   - Review dependency conflicts

2. **Deployment Failures**
   - Verify Vercel configuration
   - Check database connectivity
   - Review function timeout limits

3. **Runtime Errors**
   - Check application logs
   - Verify external service connectivity
   - Review rate limiting status

### Debug Commands

```bash
# View deployment logs
vercel logs <deployment-url>

# Check environment variables
vercel env ls

# Test database connection
npx prisma db pull

# Test Redis connection
# (Use health check endpoint)
curl https://your-app.vercel.app/api/health/cache
```

## Maintenance

### Regular Tasks

- Monitor application performance
- Review error logs weekly
- Update dependencies monthly
- Backup database regularly
- Review and rotate API keys quarterly

### Scheduled Maintenance

- Database maintenance windows
- Dependency updates
- Security patches
- Performance optimization reviews

## Support

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Check Vercel deployment logs
4. Contact development team

## Changelog

- v1.0.0 - Initial deployment pipeline setup
- v1.1.0 - Added automated rollback procedures
- v1.2.0 - Enhanced monitoring and health checks