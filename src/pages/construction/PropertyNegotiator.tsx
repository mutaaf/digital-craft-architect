import { useState, useRef, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Sparkles,
  Link2,
  BarChart3,
  Brain,
  MessageCircle,
  RotateCcw,
  FileText,
  Search,
} from 'lucide-react';
import PropertyInputPanel from '@/components/construction/negotiator/PropertyInputPanel';
import SpeedBanner from '@/components/construction/negotiator/SpeedBanner';
import DealReportCard from '@/components/construction/negotiator/DealReportCard';
import FollowUpChat from '@/components/construction/negotiator/FollowUpChat';
import AgentTimeline from '@/components/construction/negotiator/AgentTimeline';
import CompsTable from '@/components/construction/negotiator/CompsTable';
import SellerOutreach from '@/components/construction/negotiator/SellerOutreach';
import { runAgentPipeline } from '@/utils/agentPipeline';
import type { PropertyData, AgentStep, AgentResult } from '@/data/propertyNegotiation';

type Phase = 'input' | 'agent' | 'dashboard';

const HOW_IT_WORKS = [
  {
    icon: <Link2 size={22} />,
    title: 'Paste or Upload',
    desc: 'Feed in any property listing',
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  },
  {
    icon: <Search size={22} />,
    title: 'Find Comps',
    desc: 'AI generates comparable sales',
    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600',
  },
  {
    icon: <Brain size={22} />,
    title: 'Analyze Deal',
    desc: 'Offer price, strategy, ROI',
    color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  },
  {
    icon: <MessageCircle size={22} />,
    title: 'Draft Messages',
    desc: 'Ready-to-send SMS + email',
    color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  },
];

const PropertyNegotiator = () => {
  const { company } = useDemoContext();
  const name = company?.companyName || 'DigitalCraft AI';

  const [phase, setPhase] = useState<Phase>('input');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  // Elapsed timer during agent phase
  useEffect(() => {
    if (phase === 'agent') {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startRef.current);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const runPipeline = useCallback(
    async (input: Parameters<typeof runAgentPipeline>[0]) => {
      setPhase('agent');
      setError(null);
      setScrapeError(null);
      setElapsedMs(0);
      setAgentResult(null);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const result = await runAgentPipeline(input, setSteps, controller.signal);
        setAgentResult(result);
        setElapsedMs(result.elapsedMs);
        setPhase('dashboard');
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (err instanceof Error && err.message === 'SCRAPE_FAILED') {
          setScrapeError(
            "Couldn't scrape this listing — the site may be blocking automated access. Try the Screenshot or Manual tab instead.",
          );
        } else {
          setError(err instanceof Error ? err.message : 'Something went wrong');
        }
        setPhase('input');
      } finally {
        abortRef.current = null;
      }
    },
    [company?.companyName],
  );

  const handleUrl = (url: string) =>
    runPipeline({ mode: 'url', url, companyName: company?.companyName });
  const handleImage = (base64: string) =>
    runPipeline({ mode: 'image', imageBase64: base64, companyName: company?.companyName });
  const handleManual = (data: PropertyData) =>
    runPipeline({ mode: 'manual', manualData: data, companyName: company?.companyName });

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    setPhase('input');
    setSteps([]);
    setAgentResult(null);
    setElapsedMs(0);
    setError(null);
    setScrapeError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Deal Negotiator | {name}</title>
        <meta
          name="description"
          content="Paste a property listing, watch the AI work through 4 steps live, get comps, strategy, and ready-to-send seller messages."
        />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header — always visible */}
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Deal Negotiator</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Paste a property, watch the AI analyze it live, get comps + strategy + seller messages.
          </p>
        </div>

        {/* ── Input Phase ──────────────────────────────────────────────── */}
        {phase === 'input' && (
          <>
            {/* How It Works cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 animate-slide-up">
              {HOW_IT_WORKS.map((step, i) => (
                <Card
                  key={step.title}
                  className="p-3 text-center animate-slide-up"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${step.color}`}
                  >
                    {step.icon}
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm mb-0.5">{step.title}</h3>
                  <p className="text-[11px] text-gray-500">{step.desc}</p>
                </Card>
              ))}
            </div>

            {/* Input Panel */}
            <Card className="p-5 sm:p-6 mb-6 animate-fade-in">
              <PropertyInputPanel
                onSubmitUrl={handleUrl}
                onSubmitImage={handleImage}
                onSubmitManual={handleManual}
                disabled={false}
                scrapeError={scrapeError}
              />
            </Card>

            {/* Error */}
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </>
        )}

        {/* ── Agent Phase ──────────────────────────────────────────────── */}
        {phase === 'agent' && (
          <>
            {/* Disabled input panel */}
            <Card className="p-5 sm:p-6 mb-6 animate-fade-in opacity-60">
              <PropertyInputPanel
                onSubmitUrl={() => {}}
                onSubmitImage={() => {}}
                onSubmitManual={() => {}}
                disabled={true}
                scrapeError={null}
              />
            </Card>

            {/* Agent Timeline */}
            <AgentTimeline steps={steps} elapsedMs={elapsedMs} />
          </>
        )}

        {/* ── Dashboard Phase ──────────────────────────────────────────── */}
        {phase === 'dashboard' && agentResult && (
          <div className="space-y-6 animate-fade-in">
            <SpeedBanner elapsedSeconds={Math.round(agentResult.elapsedMs / 1000)} />

            {/* Dashboard header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deal Dashboard</h2>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
                <RotateCcw size={14} /> Analyze Another
              </Button>
            </div>

            {/* Tabbed dashboard */}
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-1 text-xs sm:text-sm">
                  <FileText size={14} /> Overview
                </TabsTrigger>
                <TabsTrigger value="comps" className="gap-1 text-xs sm:text-sm">
                  <BarChart3 size={14} /> Comps
                </TabsTrigger>
                <TabsTrigger value="outreach" className="gap-1 text-xs sm:text-sm">
                  <MessageCircle size={14} /> Outreach
                </TabsTrigger>
                <TabsTrigger value="chat" className="gap-1 text-xs sm:text-sm">
                  <Brain size={14} /> Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <DealReportCard
                  property={agentResult.property}
                  report={agentResult.report}
                  companyName={company?.companyName}
                  onReset={reset}
                />
              </TabsContent>

              <TabsContent value="comps" className="mt-4">
                <CompsTable
                  comps={agentResult.comps}
                  property={agentResult.property}
                />
              </TabsContent>

              <TabsContent value="outreach" className="mt-4">
                <SellerOutreach messages={agentResult.sellerMessages} />
              </TabsContent>

              <TabsContent value="chat" className="mt-4">
                <FollowUpChat
                  agentResult={agentResult}
                  companyName={company?.companyName}
                  defaultExpanded={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyNegotiator;
