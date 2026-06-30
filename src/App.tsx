import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import IndexV2 from "./pages/IndexV2";
import { isCTOHost } from "./utils/hostVariant";
import { trackEvent } from "./utils/analytics";
import { ErrorBoundary } from "@sentry/react";
import { captureException } from "./utils/sentry";
import EasterEgg from "./components/EasterEgg";
import { Analytics } from "@vercel/analytics/react";
import { DemoContextProvider } from "./contexts/DemoContext";
import { recordVisitToday } from "./utils/visitStreakStore";

// Route-level code-splitting (ticket: route-code-splitting). Every page below
// the eagerly-loaded landing shell (Index / IndexV2) is lazy-loaded so the
// initial bundle for "/" no longer ships all 84 page modules. Each route body
// resolves on demand behind the single <Suspense> boundary in App. All page
// modules use default exports, so the bare lazy(() => import(...)) form is
// correct for every one; a named-export page would need .then(m => ({ default:
// m.X })) instead.
const Construction = lazy(() => import("./pages/Construction"));
const RealEstate = lazy(() => import("./pages/RealEstate"));
const RealEstateDemoHub = lazy(() => import("./pages/realestate/RealEstateDemoHub"));
const DemoHub = lazy(() => import("./pages/construction/DemoHub"));
const LeadResponder = lazy(() => import("./pages/construction/LeadResponder"));
const EstimateGenerator = lazy(() => import("./pages/construction/EstimateGenerator"));
const InvoiceGenerator = lazy(() => import("./pages/construction/InvoiceGenerator"));
const ContractDrafter = lazy(() => import("./pages/realestate/ContractDrafter"));
const MarketAnalyzer = lazy(() => import("./pages/realestate/MarketAnalyzer"));
const SMSSequence = lazy(() => import("./pages/construction/SMSSequence"));
const LeadScoring = lazy(() => import("./pages/construction/LeadScoring"));
const ReviewSystem = lazy(() => import("./pages/construction/ReviewSystem"));
const PropertyNegotiator = lazy(() => import("./pages/construction/PropertyNegotiator"));
const VoiceNegotiator = lazy(() => import("./pages/construction/VoiceNegotiator"));
const Events = lazy(() => import("./pages/Events"));
const EventsDemoHub = lazy(() => import("./pages/events/EventsDemoHub"));
const InquiryQualifier = lazy(() => import("./pages/events/InquiryQualifier"));
const ProposalGenerator = lazy(() => import("./pages/events/ProposalGenerator"));
const VoiceBookingAgent = lazy(() => import("./pages/events/VoiceBookingAgent"));
const HomeServices = lazy(() => import("./pages/HomeServices"));
const HomeServicesDemoHub = lazy(() => import("./pages/homeservices/DemoHub"));
const Healthcare = lazy(() => import("./pages/Healthcare"));
const HealthcareDemoHub = lazy(() => import("./pages/healthcare/DemoHub"));
const Legal = lazy(() => import("./pages/Legal"));
const LegalDemoHub = lazy(() => import("./pages/legal/DemoHub"));
const Restaurant = lazy(() => import("./pages/Restaurant"));
const RestaurantDemoHub = lazy(() => import("./pages/restaurant/DemoHub"));
const KidsPlay = lazy(() => import("./pages/KidsPlay"));
const KidsPlayDemoHub = lazy(() => import("./pages/kidsplay/DemoHub"));
const Fitness = lazy(() => import("./pages/Fitness"));
const FitnessDemoHub = lazy(() => import("./pages/fitness/DemoHub"));
const Dental = lazy(() => import("./pages/Dental"));
const DentalDemoHub = lazy(() => import("./pages/dental/DemoHub"));
const Salon = lazy(() => import("./pages/Salon"));
const SalonDemoHub = lazy(() => import("./pages/salon/DemoHub"));
const AutoRepair = lazy(() => import("./pages/AutoRepair"));
const AutoRepairDemoHub = lazy(() => import("./pages/autorepair/DemoHub"));
const Industries = lazy(() => import("./pages/Industries"));
const Demos = lazy(() => import("./pages/Demos"));
const MyDashboard = lazy(() => import("./pages/MyDashboard"));
const Glossary = lazy(() => import("./pages/Glossary"));
const Trust = lazy(() => import("./pages/Trust"));
const Playbook = lazy(() => import("./pages/Playbook"));
const QuestionsToAskAnAiVendor = lazy(() => import("./pages/QuestionsToAskAnAiVendor"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Uptime = lazy(() => import("./pages/Uptime"));
const CompareHub = lazy(() => import("./pages/CompareHub"));
const HubSpotComparison = lazy(() => import("./pages/compare/HubSpot"));
const GoHighLevelComparison = lazy(() => import("./pages/compare/GoHighLevel"));
const ZapierComparison = lazy(() => import("./pages/compare/Zapier"));
const MakeComparison = lazy(() => import("./pages/compare/Make"));
const IntercomComparison = lazy(() => import("./pages/compare/Intercom"));
const JobberComparison = lazy(() => import("./pages/compare/Jobber"));
const ServiceTitanComparison = lazy(() => import("./pages/compare/ServiceTitan"));
const PodiumComparison = lazy(() => import("./pages/compare/Podium"));
const HousecallProComparison = lazy(() => import("./pages/compare/HousecallPro"));
const BuildertrendComparison = lazy(() => import("./pages/compare/Buildertrend"));
const ThumbtackComparison = lazy(() => import("./pages/compare/Thumbtack"));
const AngiComparison = lazy(() => import("./pages/compare/Angi"));
const AIReadinessQuiz = lazy(() => import("./pages/AIReadinessQuiz"));
const RoiCalculator = lazy(() => import("./pages/RoiCalculator"));
const SetupClaw = lazy(() => import("./pages/SetupClaw"));
const SmallBusiness = lazy(() => import("./pages/SmallBusiness"));
const AiForPlumbers = lazy(() => import("./pages/AiForPlumbers"));
const AiForHvac = lazy(() => import("./pages/AiForHvac"));
const AiForRoofers = lazy(() => import("./pages/AiForRoofers"));
const AiForElectricians = lazy(() => import("./pages/AiForElectricians"));
const AiForPainters = lazy(() => import("./pages/AiForPainters"));
const AiForLandscapers = lazy(() => import("./pages/AiForLandscapers"));
const AiForPropertyManagers = lazy(() => import("./pages/AiForPropertyManagers"));
const AiForCleaningServices = lazy(() => import("./pages/AiForCleaningServices"));
const AiForPestControl = lazy(() => import("./pages/AiForPestControl"));
const AiForPoolService = lazy(() => import("./pages/AiForPoolService"));
const Texas = lazy(() => import("./pages/locations/Texas"));
const CaseStudiesHub = lazy(() => import("./pages/case-studies/CaseStudiesHub"));
const CaseStudy = lazy(() => import("./pages/case-studies/CaseStudy"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Classes = lazy(() => import("./pages/Classes"));
const ClassSession = lazy(() => import("./pages/classes/ClassSession"));
const ClassRegistration = lazy(() => import("./pages/classes/ClassRegistration"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

const LandingRoot: React.FC = () => {
  const isCTO = React.useMemo(() => isCTOHost(), []);
  React.useEffect(() => {
    trackEvent('landing_view', 'navigation', isCTO ? 'cto_subdomain' : 'root_domain');
  }, [isCTO]);
  return isCTO ? <IndexV2 /> : <Index />;
};

interface FallbackProps {
  error: unknown;
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
      <p className="mb-4 max-w-md mx-auto">{(error instanceof Error ? error.message : String(error)) || "An unexpected error occurred"}</p>
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

// Suspense fallback for lazy-loaded route bodies. Full-height and centered so
// it occupies the same vertical space the page will, avoiding cumulative layout
// shift (the project has a Lighthouse CLS budget) while a route chunk loads.
const RouteFallback = () => (
  <div
    className="flex min-h-screen items-center justify-center bg-background"
    role="status"
    aria-label="Loading"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    <span className="sr-only">Loading</span>
  </div>
);

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

const App = () => {
  // Ticket 0060 - Record today's UTC date in the visit-day rolling-window
  // store so /my can surface a return-visit streak badge. This effect
  // sits on the top-level App component on purpose: it fires exactly once
  // per app mount (not once per route change), so the count tracks
  // distinct visit-days, not page-view chatter. Do NOT relocate this to
  // a per-page mount - that would multi-count a session.
  React.useEffect(() => {
    recordVisitToday();
  }, []);

  return (
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
          <Analytics />
          <EasterEgg />
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<LandingRoot />} />
              <Route path="/construction" element={<Construction />} />
              <Route path="/construction/demo" element={<DemoContextProvider vertical="construction"><DemoHub /></DemoContextProvider>} />
              <Route path="/construction/demo/lead-responder" element={<DemoContextProvider vertical="construction"><LeadResponder /></DemoContextProvider>} />
              <Route path="/construction/demo/estimate" element={<DemoContextProvider vertical="construction"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/construction/demo/invoice" element={<DemoContextProvider vertical="construction"><InvoiceGenerator /></DemoContextProvider>} />
              <Route path="/construction/demo/sms-sequence" element={<DemoContextProvider vertical="construction"><SMSSequence /></DemoContextProvider>} />
              <Route path="/construction/demo/lead-scoring" element={<DemoContextProvider vertical="construction"><LeadScoring /></DemoContextProvider>} />
              <Route path="/construction/demo/reviews" element={<DemoContextProvider vertical="construction"><ReviewSystem /></DemoContextProvider>} />
              <Route path="/construction/demo/property-negotiator" element={<DemoContextProvider vertical="construction"><PropertyNegotiator /></DemoContextProvider>} />
              <Route path="/construction/demo/voice-negotiator" element={<DemoContextProvider vertical="construction"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/realestate" element={<RealEstate />} />
              <Route path="/realestate/demo" element={<DemoContextProvider vertical="realestate"><RealEstateDemoHub /></DemoContextProvider>} />
              <Route path="/realestate/demo/lead-responder" element={<DemoContextProvider vertical="realestate"><LeadResponder /></DemoContextProvider>} />
              <Route path="/realestate/demo/property-negotiator" element={<DemoContextProvider vertical="realestate"><PropertyNegotiator /></DemoContextProvider>} />
              <Route path="/realestate/demo/contract" element={<DemoContextProvider vertical="realestate"><ContractDrafter /></DemoContextProvider>} />
              <Route path="/realestate/demo/market-analysis" element={<DemoContextProvider vertical="realestate"><MarketAnalyzer /></DemoContextProvider>} />
              <Route path="/realestate/demo/voice-negotiator" element={<DemoContextProvider vertical="realestate"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/demo" element={<DemoContextProvider vertical="events"><EventsDemoHub /></DemoContextProvider>} />
              <Route path="/events/demo/inquiry" element={<DemoContextProvider vertical="events"><InquiryQualifier /></DemoContextProvider>} />
              <Route path="/events/demo/proposal" element={<DemoContextProvider vertical="events"><ProposalGenerator /></DemoContextProvider>} />
              <Route path="/events/demo/voice-booking" element={<DemoContextProvider vertical="events"><VoiceBookingAgent /></DemoContextProvider>} />
              <Route path="/homeservices" element={<HomeServices />} />
              <Route path="/homeservices/demo" element={<DemoContextProvider vertical="homeservices"><HomeServicesDemoHub /></DemoContextProvider>} />
              <Route path="/homeservices/demo/lead-responder" element={<DemoContextProvider vertical="homeservices"><LeadResponder /></DemoContextProvider>} />
              <Route path="/homeservices/demo/estimate" element={<DemoContextProvider vertical="homeservices"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/homeservices/demo/voice-followup" element={<DemoContextProvider vertical="homeservices"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/healthcare" element={<Healthcare />} />
              <Route path="/healthcare/demo" element={<DemoContextProvider vertical="healthcare"><HealthcareDemoHub /></DemoContextProvider>} />
              <Route path="/healthcare/demo/intake" element={<DemoContextProvider vertical="healthcare"><LeadResponder /></DemoContextProvider>} />
              <Route path="/healthcare/demo/scheduler" element={<DemoContextProvider vertical="healthcare"><ProposalGenerator /></DemoContextProvider>} />
              <Route path="/healthcare/demo/voice-followup" element={<DemoContextProvider vertical="healthcare"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/legal/demo" element={<DemoContextProvider vertical="legal"><LegalDemoHub /></DemoContextProvider>} />
              <Route path="/legal/demo/intake" element={<DemoContextProvider vertical="legal"><LeadResponder /></DemoContextProvider>} />
              <Route path="/legal/demo/consultation" element={<DemoContextProvider vertical="legal"><ProposalGenerator /></DemoContextProvider>} />
              <Route path="/legal/demo/voice-followup" element={<DemoContextProvider vertical="legal"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/restaurant" element={<Restaurant />} />
              <Route path="/restaurant/demo" element={<DemoContextProvider vertical="restaurant"><RestaurantDemoHub /></DemoContextProvider>} />
              <Route path="/restaurant/demo/reservations" element={<DemoContextProvider vertical="restaurant"><LeadResponder /></DemoContextProvider>} />
              <Route path="/restaurant/demo/catering" element={<DemoContextProvider vertical="restaurant"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/restaurant/demo/reviews" element={<DemoContextProvider vertical="restaurant"><ReviewSystem /></DemoContextProvider>} />
              <Route path="/kidsplay" element={<KidsPlay />} />
              <Route path="/kidsplay/demo" element={<DemoContextProvider vertical="kidsplay"><KidsPlayDemoHub /></DemoContextProvider>} />
              <Route path="/kidsplay/demo/party-booker" element={<DemoContextProvider vertical="kidsplay"><LeadResponder /></DemoContextProvider>} />
              <Route path="/kidsplay/demo/packages" element={<DemoContextProvider vertical="kidsplay"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/kidsplay/demo/voice-booking" element={<DemoContextProvider vertical="kidsplay"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/fitness" element={<Fitness />} />
              <Route path="/fitness/demo" element={<DemoContextProvider vertical="fitness"><FitnessDemoHub /></DemoContextProvider>} />
              <Route path="/fitness/demo/lead-qualifier" element={<DemoContextProvider vertical="fitness"><LeadResponder /></DemoContextProvider>} />
              <Route path="/fitness/demo/membership" element={<DemoContextProvider vertical="fitness"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/fitness/demo/voice-retention" element={<DemoContextProvider vertical="fitness"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/dental" element={<Dental />} />
              <Route path="/dental/demo" element={<DemoContextProvider vertical="dental"><DentalDemoHub /></DemoContextProvider>} />
              <Route path="/dental/demo/intake" element={<DemoContextProvider vertical="dental"><LeadResponder /></DemoContextProvider>} />
              <Route path="/dental/demo/estimate" element={<DemoContextProvider vertical="dental"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/dental/demo/voice-recall" element={<DemoContextProvider vertical="dental"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/salon" element={<Salon />} />
              <Route path="/salon/demo" element={<DemoContextProvider vertical="salon"><SalonDemoHub /></DemoContextProvider>} />
              <Route path="/salon/demo/booking" element={<DemoContextProvider vertical="salon"><LeadResponder /></DemoContextProvider>} />
              <Route path="/salon/demo/services" element={<DemoContextProvider vertical="salon"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/salon/demo/voice-rebook" element={<DemoContextProvider vertical="salon"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/autorepair" element={<AutoRepair />} />
              <Route path="/autorepair/demo" element={<DemoContextProvider vertical="autorepair"><AutoRepairDemoHub /></DemoContextProvider>} />
              <Route path="/autorepair/demo/advisor" element={<DemoContextProvider vertical="autorepair"><LeadResponder /></DemoContextProvider>} />
              <Route path="/autorepair/demo/estimate" element={<DemoContextProvider vertical="autorepair"><EstimateGenerator /></DemoContextProvider>} />
              <Route path="/autorepair/demo/voice-reminder" element={<DemoContextProvider vertical="autorepair"><VoiceNegotiator /></DemoContextProvider>} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/my" element={<MyDashboard />} />
              <Route path="/glossary" element={<Glossary />} />
              <Route path="/trust" element={<Trust />} />
              <Route path="/playbook" element={<Playbook />} />
              <Route path="/questions-to-ask-an-ai-vendor" element={<QuestionsToAskAnAiVendor />} />
              <Route path="/changelog" element={<Changelog />} />
              <Route path="/uptime" element={<Uptime />} />
              <Route path="/compare" element={<CompareHub />} />
              <Route path="/compare/hubspot" element={<HubSpotComparison />} />
              <Route path="/compare/gohighlevel" element={<GoHighLevelComparison />} />
              <Route path="/compare/zapier" element={<ZapierComparison />} />
              <Route path="/compare/make" element={<MakeComparison />} />
              <Route path="/compare/intercom" element={<IntercomComparison />} />
              <Route path="/compare/jobber" element={<JobberComparison />} />
              <Route path="/compare/servicetitan" element={<ServiceTitanComparison />} />
              <Route path="/compare/podium" element={<PodiumComparison />} />
              <Route path="/compare/housecallpro" element={<HousecallProComparison />} />
              <Route path="/compare/buildertrend" element={<BuildertrendComparison />} />
              <Route path="/compare/thumbtack" element={<ThumbtackComparison />} />
              <Route path="/compare/angi" element={<AngiComparison />} />
              <Route path="/quiz" element={<AIReadinessQuiz />} />
              <Route path="/roi" element={<RoiCalculator />} />
              <Route path="/setupclaw" element={<SetupClaw />} />
              <Route path="/ai-for-small-business" element={<SmallBusiness />} />
              <Route path="/ai-for-plumbers" element={<AiForPlumbers />} />
              <Route path="/ai-for-hvac" element={<AiForHvac />} />
              <Route path="/ai-for-roofers" element={<AiForRoofers />} />
              <Route path="/ai-for-electricians" element={<AiForElectricians />} />
              <Route path="/ai-for-painters" element={<AiForPainters />} />
              <Route path="/ai-for-landscapers" element={<AiForLandscapers />} />
              <Route path="/ai-for-property-managers" element={<AiForPropertyManagers />} />
              <Route path="/ai-for-cleaning-services" element={<AiForCleaningServices />} />
              <Route path="/ai-for-pest-control" element={<AiForPestControl />} />
              <Route path="/ai-for-pool-service" element={<AiForPoolService />} />
              <Route path="/locations/texas" element={<Texas />} />
              <Route path="/case-studies" element={<CaseStudiesHub />} />
              <Route path="/case-studies/:slug" element={<CaseStudy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/register" element={<ClassRegistration legacyDefault />} />
              <Route path="/classes/:slug" element={<ClassSession />} />
              <Route path="/classes/:slug/register" element={<ClassRegistration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;
