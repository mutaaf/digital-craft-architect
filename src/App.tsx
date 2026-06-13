import React from "react";
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
import Construction from "./pages/Construction";
import RealEstate from "./pages/RealEstate";
import RealEstateDemoHub from "./pages/realestate/RealEstateDemoHub";
import DemoHub from "./pages/construction/DemoHub";
import LeadResponder from "./pages/construction/LeadResponder";
import EstimateGenerator from "./pages/construction/EstimateGenerator";
import InvoiceGenerator from "./pages/construction/InvoiceGenerator";
import ContractDrafter from "./pages/realestate/ContractDrafter";
import MarketAnalyzer from "./pages/realestate/MarketAnalyzer";
import SMSSequence from "./pages/construction/SMSSequence";
import LeadScoring from "./pages/construction/LeadScoring";
import ReviewSystem from "./pages/construction/ReviewSystem";
import PropertyNegotiator from "./pages/construction/PropertyNegotiator";
import VoiceNegotiator from "./pages/construction/VoiceNegotiator";
import Events from "./pages/Events";
import EventsDemoHub from "./pages/events/EventsDemoHub";
import InquiryQualifier from "./pages/events/InquiryQualifier";
import ProposalGenerator from "./pages/events/ProposalGenerator";
import VoiceBookingAgent from "./pages/events/VoiceBookingAgent";
import HomeServices from "./pages/HomeServices";
import HomeServicesDemoHub from "./pages/homeservices/DemoHub";
import Healthcare from "./pages/Healthcare";
import HealthcareDemoHub from "./pages/healthcare/DemoHub";
import Legal from "./pages/Legal";
import LegalDemoHub from "./pages/legal/DemoHub";
import Restaurant from "./pages/Restaurant";
import RestaurantDemoHub from "./pages/restaurant/DemoHub";
import KidsPlay from "./pages/KidsPlay";
import KidsPlayDemoHub from "./pages/kidsplay/DemoHub";
import Fitness from "./pages/Fitness";
import FitnessDemoHub from "./pages/fitness/DemoHub";
import Dental from "./pages/Dental";
import DentalDemoHub from "./pages/dental/DemoHub";
import Salon from "./pages/Salon";
import SalonDemoHub from "./pages/salon/DemoHub";
import AutoRepair from "./pages/AutoRepair";
import AutoRepairDemoHub from "./pages/autorepair/DemoHub";
import Industries from "./pages/Industries";
import Demos from "./pages/Demos";
import MyDashboard from "./pages/MyDashboard";
import Glossary from "./pages/Glossary";
import Trust from "./pages/Trust";
import Changelog from "./pages/Changelog";
import Uptime from "./pages/Uptime";
import CompareHub from "./pages/CompareHub";
import HubSpotComparison from "./pages/compare/HubSpot";
import GoHighLevelComparison from "./pages/compare/GoHighLevel";
import ZapierComparison from "./pages/compare/Zapier";
import MakeComparison from "./pages/compare/Make";
import IntercomComparison from "./pages/compare/Intercom";
import JobberComparison from "./pages/compare/Jobber";
import ServiceTitanComparison from "./pages/compare/ServiceTitan";
import PodiumComparison from "./pages/compare/Podium";
import HousecallProComparison from "./pages/compare/HousecallPro";
import BuildertrendComparison from "./pages/compare/Buildertrend";
import ThumbtackComparison from "./pages/compare/Thumbtack";
import AIReadinessQuiz from "./pages/AIReadinessQuiz";
import RoiCalculator from "./pages/RoiCalculator";
import SetupClaw from "./pages/SetupClaw";
import SmallBusiness from "./pages/SmallBusiness";
import AiForPlumbers from "./pages/AiForPlumbers";
import AiForHvac from "./pages/AiForHvac";
import AiForRoofers from "./pages/AiForRoofers";
import AiForElectricians from "./pages/AiForElectricians";
import AiForPainters from "./pages/AiForPainters";
import AiForLandscapers from "./pages/AiForLandscapers";
import AiForPropertyManagers from "./pages/AiForPropertyManagers";
import AiForCleaningServices from "./pages/AiForCleaningServices";
import Texas from "./pages/locations/Texas";
import CaseStudy from "./pages/case-studies/CaseStudy";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Classes from "./pages/Classes";
import ClassSession from "./pages/classes/ClassSession";
import ClassRegistration from "./pages/classes/ClassRegistration";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "@sentry/react";
import { captureException } from "./utils/sentry";
import EasterEgg from "./components/EasterEgg";
import { Analytics } from "@vercel/analytics/react";

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
          <Analytics />
          <EasterEgg />
          <BrowserRouter>
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
              <Route path="/locations/texas" element={<Texas />} />
              <Route path="/case-studies/:slug" element={<CaseStudy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/register" element={<ClassRegistration legacyDefault />} />
              <Route path="/classes/:slug" element={<ClassSession />} />
              <Route path="/classes/:slug/register" element={<ClassRegistration />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
