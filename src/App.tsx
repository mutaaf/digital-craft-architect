
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@sentry/react";
import { captureException } from "./utils/sentry";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: import.meta.env.PROD,
      onError: (error) => {
        if (error instanceof Error) {
          captureException(error, { source: 'react-query' });
        } else {
          captureException(new Error(String(error)), { source: 'react-query' });
        }
      },
    },
    mutations: {
      onError: (error) => {
        if (error instanceof Error) {
          captureException(error, { source: 'react-query-mutation' });
        } else {
          captureException(new Error(String(error)), { source: 'react-query-mutation' });
        }
      },
    },
  },
});

// Define FallbackProps interface for our error boundary
interface FallbackProps {
  error: Error;
  resetError: () => void;
  componentStack?: string;
  eventId?: string;
}

// Error fallback component to show when errors are caught by Sentry
const ErrorFallback = ({ error, resetError, componentStack, eventId }: FallbackProps) => {
  // Log error details to console in development
  if (import.meta.env.DEV) {
    console.error('Error caught by ErrorBoundary:', error);
    console.info('Component stack:', componentStack);
    console.info('Sentry event ID:', eventId);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="mb-4 max-w-md mx-auto">{error.message || "An unexpected error occurred"}</p>
      {eventId && (
        <p className="text-sm text-gray-500 mb-4">
          Error ID: {eventId}
        </p>
      )}
      <button 
        onClick={resetError} 
        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};

// Global error handler for uncaught exceptions
window.onerror = (message, source, lineno, colno, error) => {
  if (error) {
    captureException(error, {
      source: 'window.onerror',
      message: String(message),
      location: `${source}:${lineno}:${colno}`,
    });
  }
  return false;
};

// Global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const error = event.reason instanceof Error 
    ? event.reason 
    : new Error(String(event.reason));
  
  captureException(error, {
    source: 'unhandledrejection',
    promise: 'global',
  });
});

const App = () => (
  <ErrorBoundary
    fallback={ErrorFallback}
    onError={(error, componentStack, eventId) => {
      // Additional error handling logic if needed
      console.error('Error caught by Sentry ErrorBoundary:', error);
      console.info('Component stack:', componentStack);
      console.info('Sentry event ID:', eventId);
    }}
  >
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
