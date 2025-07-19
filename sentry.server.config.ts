import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      
      // Filter out database connection timeouts (handled gracefully)
      if (message.includes('connection timeout') || 
          message.includes('ECONNRESET')) {
        return null;
      }
      
      // Filter out rate limiting errors (expected behavior)
      if (message.includes('rate limit') || 
          message.includes('429')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific configuration
  initialScope: {
    tags: {
      component: 'server',
    },
  },
  
  // Capture unhandled rejections
  captureUnhandledRejections: true,
  
  // Additional integrations
  integrations: [
    // Add custom integrations if needed
  ],
});