
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import React from 'react';

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
    
    // Enable debug in development mode to better understand how Sentry works
    debug: environment === 'development',
    
    // Attach source maps for better error reporting
    attachStacktrace: true,
    
    // Include source context when reporting errors
    normalizeDepth: 10,
    
    // Function to modify or block events before they're sent to Sentry
    beforeSend(event, hint) {
      // Add additional context to all events
      if (event.exception) {
        event.tags = {
          ...event.tags,
          errorSource: 'application',
        };
      }
      return event;
    },
  });
};

/**
 * Set user information for better error context
 * @param id User ID
 * @param email User email
 * @param username Username
 * @param additionalData Any additional user data
 */
export const setUserContext = (
  id: string,
  email?: string,
  username?: string,
  additionalData?: Record<string, any>
): void => {
  Sentry.setUser({
    id,
    email,
    username,
    ...additionalData,
  });
};

/**
 * Set additional tags for context
 * @param tags Object with key-value pairs for tags
 */
export const setTags = (tags: Record<string, string>): void => {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
};

/**
 * Set additional context information
 * @param contextName Name for the context
 * @param contextData Context data object
 */
export const setContext = (contextName: string, contextData: Record<string, any>): void => {
  Sentry.setContext(contextName, contextData);
};

/**
 * Capture an exception manually with enhanced context
 * @param error Error object
 * @param context Additional context information
 * @param level Severity level
 */
export const captureException = (
  error: Error,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'error'
): void => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    // Add stack trace information if not already available
    if (!error.stack) {
      error.stack = new Error().stack;
    }
    
    Sentry.captureException(error);
  });
  
  // Also log to console in development for better debugging
  if (import.meta.env.DEV) {
    console.error('Error captured by Sentry:', error, context);
  }
};

/**
 * Capture a message with enhanced context
 * @param message Message to capture
 * @param context Additional context information
 * @param level Severity level
 */
export const captureMessage = (
  message: string,
  context?: Record<string, any>,
  level: Sentry.SeverityLevel = 'info'
): void => {
  Sentry.withScope((scope) => {
    scope.setLevel(level);
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    Sentry.captureMessage(message);
  });
};

/**
 * Add a breadcrumb to the current session
 * @param message Breadcrumb message
 * @param category Breadcrumb category
 * @param level Breadcrumb level
 * @param data Additional data
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  level: Sentry.SeverityLevel = 'info',
  data?: Record<string, any>
): void => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
};

/**
 * Create a performance span for monitoring
 * @param name Span name
 * @param operation Operation type
 * @param data Additional data
 */
export const startPerformanceSpan = (
  name: string,
  operation: string,
  data?: Record<string, any>
): Sentry.Span => {
  const transaction = Sentry.startTransaction({
    name,
    op: operation,
    data,
  });
  
  Sentry.configureScope((scope) => {
    scope.setSpan(transaction);
  });
  
  return transaction;
};

/**
 * Utility to measure function execution time and report to Sentry
 * @param fn Function to measure
 * @param name Transaction name
 * @param operation Operation type
 * @param throwError Whether to throw an error if the function fails
 */
export const measureFunction = async <T>(
  fn: () => Promise<T>,
  name: string,
  operation: string = 'function.execution',
  throwError: boolean = true
): Promise<T> => {
  const transaction = startPerformanceSpan(name, operation);
  
  try {
    const result = await fn();
    transaction.finish();
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    transaction.finish();
    
    if (error instanceof Error) {
      captureException(error, { transactionName: name });
    } else {
      captureException(new Error(String(error)), { transactionName: name });
    }
    
    if (throwError) {
      throw error;
    }
    
    // Return a default value or re-throw depending on your needs
    throw error;
  }
};

// Export common Sentry utilities for direct usage
export { ErrorBoundary } from '@sentry/react';

// Export severity levels for easier usage
export type SeverityLevel = Sentry.SeverityLevel;

/**
 * Hook for Sentry monitoring
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
    captureMessage,
    addBreadcrumb,
    setUserContext,
    setTags,
    setContext,
    startPerformanceSpan,
    measureFunction,
    ErrorBoundary: Sentry.ErrorBoundary, // Explicitly import from Sentry
  };
};
