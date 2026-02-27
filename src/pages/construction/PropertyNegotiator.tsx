import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Link2, Brain, FileText, Loader2 } from 'lucide-react';
import PropertyInputPanel from '@/components/construction/negotiator/PropertyInputPanel';
import SpeedBanner from '@/components/construction/negotiator/SpeedBanner';
import DealReportCard from '@/components/construction/negotiator/DealReportCard';
import FollowUpChat from '@/components/construction/negotiator/FollowUpChat';
import {
  extractFromUrl,
  extractFromImage,
  generateNegotiationReport,
} from '@/utils/propertyExtractor';
import type { PropertyData, NegotiationReport } from '@/data/propertyNegotiation';

type Phase = 'input' | 'analyzing' | 'report';

const STEPS = [
  'Extracting property data...',
  'Analyzing market position...',
  'Generating negotiation strategy...',
];

const PropertyNegotiator = () => {
  const { company } = useDemoContext();
  const name = company?.companyName || '448 Developments';

  const [phase, setPhase] = useState<Phase>('input');
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [report, setReport] = useState<NegotiationReport | null>(null);
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);

  // Timer for analyzing phase
  useEffect(() => {
    if (phase === 'analyzing') {
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const s = Math.round((Date.now() - startRef.current) / 1000);
        setElapsed(s);
        // Cycle through steps for visual progress
        if (s < 5) setStepIdx(0);
        else if (s < 15) setStepIdx(1);
        else setStepIdx(2);
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const analyze = async (extractFn: () => Promise<PropertyData>) => {
    setPhase('analyzing');
    setError(null);
    setScrapeError(null);
    setStepIdx(0);
    setElapsed(0);

    try {
      const prop = await extractFn();
      setProperty(prop);

      const rep = await generateNegotiationReport(prop, company?.companyName);
      setReport(rep);
      setElapsed(Math.round((Date.now() - startRef.current) / 1000));
      setPhase('report');
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'SCRAPE_FAILED') {
        setScrapeError(
          "Couldn't scrape this listing — the site may be blocking automated access. Try the Screenshot or Manual tab instead.",
        );
        setPhase('input');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
        setPhase('input');
      }
    }
  };

  const handleUrl = (url: string) => analyze(() => extractFromUrl(url));
  const handleImage = (base64: string) => analyze(() => extractFromImage(base64));
  const handleManual = (data: PropertyData) =>
    analyze(async () => data);

  const reset = () => {
    setPhase('input');
    setProperty(null);
    setReport(null);
    setStepIdx(0);
    setElapsed(0);
    setError(null);
    setScrapeError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Deal Analyzer | {name}</title>
        <meta
          name="description"
          content="Paste a listing URL, upload a screenshot, or enter property details. Get a negotiation playbook in under 60 seconds."
        />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Deal Analyzer</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Paste a listing URL, upload a screenshot, or enter details. Get a negotiation playbook
            in under 60 seconds.
          </p>
        </div>

        {/* How It Works — only show in input phase */}
        {phase === 'input' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 animate-slide-up">
            {[
              {
                icon: <Link2 size={22} />,
                title: 'Paste or Upload',
                desc: 'Feed in any property listing',
                color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
              },
              {
                icon: <Brain size={22} />,
                title: 'AI Analyzes',
                desc: 'Extracts data + runs market analysis',
                color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
              },
              {
                icon: <FileText size={22} />,
                title: 'Get Your Playbook',
                desc: 'Offer price, strategy, ROI projection',
                color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
              },
            ].map((step, i) => (
              <Card
                key={step.title}
                className="p-4 text-center animate-slide-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-2.5 ${step.color}`}
                >
                  {step.icon}
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </Card>
            ))}
          </div>
        )}

        {/* Input Panel */}
        {(phase === 'input' || phase === 'analyzing') && (
          <Card className="p-5 sm:p-6 mb-6 animate-fade-in">
            <PropertyInputPanel
              onSubmitUrl={handleUrl}
              onSubmitImage={handleImage}
              onSubmitManual={handleManual}
              disabled={phase === 'analyzing'}
              scrapeError={scrapeError}
            />
          </Card>
        )}

        {/* Error */}
        {error && phase === 'input' && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Analyzing Animation */}
        {phase === 'analyzing' && (
          <div className="text-center py-8 animate-fade-in">
            <Loader2 size={40} className="mx-auto mb-4 animate-spin text-primary" />
            <p className="font-medium text-lg mb-1">{STEPS[stepIdx]}</p>
            <p className="text-sm text-gray-400">{elapsed}s elapsed</p>
          </div>
        )}

        {/* Report Phase */}
        {phase === 'report' && property && report && (
          <div className="space-y-6 animate-fade-in">
            <SpeedBanner elapsedSeconds={elapsed} />
            <DealReportCard
              property={property}
              report={report}
              companyName={company?.companyName}
              onReset={reset}
            />
            <FollowUpChat
              property={property}
              report={report}
              companyName={company?.companyName}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyNegotiator;
