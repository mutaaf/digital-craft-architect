
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import * as React from 'react';

/**
 * Initialize Sentry for error tracking and monitoring
 * @param dsn Sentry DSN (required)
 * @param environment Environment name (e.g., 'production', 'development')
 * @param release Release version
 */
export const initSentry = (
  dsn: string,
  environment: string = 'production',
  release: string = '1.0.0'
): void => {
  Sentry.init({
    dsn,
    integrations: [new BrowserTracing()],
    environment,
    release,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    
    // Capture user interactions automatically (clicks, page loads, etc)
    autoSessionTracking: true,
    
    // This sets the sample rate to be 10%. You may want this to be 100% while
    // in development and sample at a lower rate in production
    replaysSessionSampleRate: 0.1,
    
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,
  });
};

/**
 * Set user information for better error context
 * @param id User ID
 * @param email User email
 * @param username Username
 */
export const setUserContext = (
  id: string,
  email?: string,
  username?: string
): void => {
  Sentry.setUser({
    id,
    email,
    username,
  });
};

/**
 * Capture an exception manually
 * @param error Error object
 * @param context Additional context information
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>
): void => {
  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Add a breadcrumb to the current session
 * @param message Breadcrumb message
 * @param category Breadcrumb category
 * @param level Breadcrumb level
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level?: Sentry.Severity
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
};

/**
 * Create a performance span for monitoring
 * @param name Span name
 * @param operation Operation type
 */
export const startPerformanceSpan = (
  name: string,
  operation: string
): Sentry.Span => {
  const transaction = Sentry.startTransaction({
    name,
    op: operation,
  });
  
  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
  });
  
  return transaction;
};

/**
 * Hook for wrapping components with Sentry error boundary
 */
export const withErrorBoundary = Sentry.withErrorBoundary;
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Create a hook for Sentry monitoring
 * @param dsn Sentry DSN
 * @param environment Environment
 * @param release Release version
 */
export const useSentry = (
  dsn?: string,
  environment: string = 'production',
  release: string = '1.0.0'
) => {
  React.useEffect(() => {
    if (dsn) {
      initSentry(dsn, environment, release);
    }
  }, [dsn, environment, release]);
  
  return {
    captureException,
    addBreadcrumb,
    setUserContext,
    startPerformanceSpan,
    withErrorBoundary,
    ErrorBoundary
  };
};
