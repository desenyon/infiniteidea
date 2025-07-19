import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      
      // Filter out network errors that are not actionable
      if (message.includes('NetworkError') || 
          message.includes('fetch') && message.includes('aborted')) {
        return null;
      }
      
      // Filter out browser extension errors
      if (message.includes('extension') || 
          message.includes('chrome-extension')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Additional configuration
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // User context
  initialScope: {
    tags: {
      component: 'client',
    },
  },
});