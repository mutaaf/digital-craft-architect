import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Construction from "./pages/Construction";
import DemoHub from "./pages/construction/DemoHub";
import LeadResponder from "./pages/construction/LeadResponder";
import EstimateGenerator from "./pages/construction/EstimateGenerator";
import ReviewSystem from "./pages/construction/ReviewSystem";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/construction" element={<Construction />} />
          <Route path="/construction/demo" element={<DemoHub />} />
          <Route path="/construction/demo/lead-responder" element={<LeadResponder />} />
          <Route path="/construction/demo/estimate" element={<EstimateGenerator />} />
          <Route path="/construction/demo/reviews" element={<ReviewSystem />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
