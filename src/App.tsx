import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Construction from "./pages/Construction";
import RealEstate from "./pages/RealEstate";
import RealEstateDemoHub from "./pages/realestate/RealEstateDemoHub";
import DemoHub from "./pages/construction/DemoHub";
import LeadResponder from "./pages/construction/LeadResponder";
import EstimateGenerator from "./pages/construction/EstimateGenerator";
import ReviewSystem from "./pages/construction/ReviewSystem";
import PropertyNegotiator from "./pages/construction/PropertyNegotiator";
import VoiceNegotiator from "./pages/construction/VoiceNegotiator";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@sentry/react";
import { captureException } from "./utils/sentry";
import EasterEgg from "./components/EasterEgg";
import { DemoContextProvider } from "./contexts/DemoContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: import.meta.env.PROD,
      meta: {
        onError: (error: unknown) => {
          if (error instanceof Error) {
            captureException(error, { source: 'react-query' });
          } else {
            captureException(new Error(String(error)), { source: 'react-query' });
          }
        },
      },
    },
    mutations: {
      meta: {
        onError: (error: unknown) => {
          if (error instanceof Error) {
            captureException(error, { source: 'react-query-mutation' });
          } else {
            captureException(new Error(String(error)), { source: 'react-query-mutation' });
          }
        },
      },
    },
  },
});

interface FallbackProps {
  error: Error;
  resetError: () => void;
  componentStack?: string;
  eventId?: string;
}

const ErrorFallback = ({ error, resetError, componentStack, eventId }: FallbackProps) => {
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
          <EasterEgg />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/construction" element={<Construction />} />
              <Route path="/construction/demo" element={<DemoContextProvider><DemoHub /></DemoContextProvider>} />
              <Route path="/construction/demo/lead-responder" element={<DemoContextProvider><LeadResponder /></DemoContextProvider>} />
              <Route path="/construction/demo/estimate" element={<DemoContextProvider><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/construction/demo/reviews" element={<DemoContextProvider><ReviewSystem /></DemoContextProvider>} />
              <Route path="/construction/demo/property-negotiator" element={<DemoContextProvider><PropertyNegotiator /></DemoContextProvider>} />
              <Route path="/construction/demo/voice-negotiator" element={<DemoContextProvider><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/realestate" element={<RealEstate />} />
              <Route path="/realestate/demo" element={<DemoContextProvider><RealEstateDemoHub /></DemoContextProvider>} />
              <Route path="/realestate/demo/lead-responder" element={<DemoContextProvider><LeadResponder /></DemoContextProvider>} />
              <Route path="/realestate/demo/property-negotiator" element={<DemoContextProvider><PropertyNegotiator /></DemoContextProvider>} />
              <Route path="/realestate/demo/voice-negotiator" element={<DemoContextProvider><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
