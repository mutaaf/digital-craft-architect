import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import DataDisclosureChip from '@/components/DataDisclosureChip';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Phone, RotateCcw } from 'lucide-react';
import PropertyInputPanel from '@/components/construction/negotiator/PropertyInputPanel';
import SpeedBanner from '@/components/construction/negotiator/SpeedBanner';
import AgentTimeline from '@/components/construction/negotiator/AgentTimeline';
import VoiceCallSetup from '@/components/construction/negotiator/VoiceCallSetup';
import VoiceCallLive from '@/components/construction/negotiator/VoiceCallLive';
import VoiceCallSummary from '@/components/construction/negotiator/VoiceCallSummary';
import ConversationHistory from '@/components/construction/negotiator/ConversationHistory';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { runAgentPipeline } from '@/utils/agentPipeline';
import type { PropertyData, AgentStep, AgentResult } from '@/data/propertyNegotiation';
import type { BidRange, CallSummary, TranscriptEntry } from '@/data/voiceNegotiation';
import type { StoredConversation } from '@/utils/conversationStore';
import DemoBreadcrumbs from '@/components/DemoBreadcrumbs';
import { decodeVoiceSummary } from '@/utils/voiceSummaryShareLink';
import { trackCTAClick } from '@/utils/analytics';

type Phase = 'input' | 'agent' | 'setup' | 'call' | 'summary';

// Ticket 0029 - synthesize a minimal PropertyData stub from a shared
// payload's address so the existing VoiceCallSummary renderer (which expects
// a PropertyData) is satisfied without inventing fields the visitor never
// entered. askingPrice = 1 (non-zero sentinel) so the renderer's
// `!askingPrice` "booking call" branch does NOT trigger - the shared
// artifact is always a property-negotiation summary by construction (the
// events voice booking agent is out of scope per the ticket).
function buildSharedProperty(address: string): PropertyData {
  return {
    address,
    askingPrice: 1,
    bedrooms: null,
    bathrooms: null,
    sqft: null,
    yearBuilt: null,
    propertyType: '',
    condition: '',
    lotSize: '',
    daysOnMarket: null,
    listingSource: '',
    notes: '',
    acreage: null,
    zoning: null,
    utilities: null,
    sellerMotivation: null,
  };
}

// Ticket 0029 - synthesize a minimal CallSummary from a decoded shareable
// payload. Fields the shareable payload does NOT carry (sellerPosition,
// sellerMotivation, sellerEmail, sellerPhone) are blanked so the renderer's
// optional gates keep them out of the DOM on the cold-open path.
function buildSharedSummary(payload: ReturnType<typeof decodeVoiceSummary> & object): CallSummary {
  return {
    sellerPosition: '',
    lowestAcceptable: payload.lowestAcceptable,
    sellerTimeline: payload.sellerTimeline,
    sellerMotivation: '',
    keyInsights: payload.keyInsights,
    recommendedNextSteps: payload.recommendedNextSteps,
    agreedPrice: payload.agreedPrice,
    callDurationSeconds: payload.durationSeconds,
    overallSentiment: payload.sentiment,
    sellerEmail: null,
    sellerPhone: null,
  };
}

const VoiceNegotiator = () => {
  const location = useLocation();
  const { company } = useDemoContext();
  const name = company?.companyName || 'DigitalCraft AI';

  const [phase, setPhase] = useState<Phase>('input');
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [bidRange, setBidRange] = useState<BidRange | null>(null);

  // Ticket 0029 - cold-open shared-summary state. Populated only when the
  // URL carries a valid ?v= payload; nullish otherwise so the normal phase
  // state machine runs.
  const [sharedSummary, setSharedSummary] = useState<CallSummary | null>(null);
  const [sharedProperty, setSharedProperty] = useState<PropertyData | null>(null);
  // Guard against React 18 strict-mode double-mount so the analytics event
  // fires exactly once per cold-open.
  const sharedAnalyticsFiredRef = useRef(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const voice = useVoiceCall();

  // Ticket 0029 - cold-open from a shared ?v= payload. Runs once on mount;
  // a missing or invalid param does nothing (the normal input flow renders).
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get('v');
    if (!raw) return;

    const decoded = decodeVoiceSummary(raw);
    if (!decoded) return;

    setSharedProperty(buildSharedProperty(decoded.address));
    setSharedSummary(buildSharedSummary(decoded));
    setPhase('summary');

    if (!sharedAnalyticsFiredRef.current) {
      sharedAnalyticsFiredRef.current = true;
      trackCTAClick('open_shared_voice_summary', 'voice_summary_card');
    }
    // location.search is the read-once trigger; later phase transitions
    // (e.g. clicking "Start Over" in the live flow) must not re-fire this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Try to restore from sessionStorage (passed from PropertyNegotiator).
  // Skipped on the cold-open shared path so the shared summary is not
  // overwritten by a stale handoff payload from an earlier session.
  useEffect(() => {
    if (sharedSummary) return;
    try {
      const stored = sessionStorage.getItem('dca_voice_agentResult');
      if (stored) {
        const result = JSON.parse(stored) as AgentResult;
        setAgentResult(result);
        setPhase('setup');
        sessionStorage.removeItem('dca_voice_agentResult');
      }
    } catch {
      // ignore
    }
  }, [sharedSummary]);

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

  // Transition to summary when call ends and summary is ready
  useEffect(() => {
    if (voice.state.status === 'ended' && voice.state.summary) {
      setPhase('summary');
    }
  }, [voice.state.status, voice.state.summary]);

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
        setPhase('setup');
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
    voice.reset();
    setPhase('input');
    setSteps([]);
    setAgentResult(null);
    setElapsedMs(0);
    setError(null);
    setScrapeError(null);
    setBidRange(null);
  };

  const handleCallAgain = useCallback((conv: StoredConversation) => {
    if (!conv.property || !conv.report) return;
    voice.reset();
    setAgentResult({
      property: conv.property,
      report: conv.report,
      comps: conv.comps || [],
      sellerMessages: [],
      elapsedMs: 0,
    });
    setPhase('setup');
  }, [voice]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Voice Negotiator | {name}</title>
        <meta
          name="description"
          content="AI-powered voice negotiation for real estate deals. The AI calls sellers, negotiates pricing, and provides a full call summary."
        />
      </Helmet>
      <DemoNavbar />
      <DemoBreadcrumbs />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="relative text-center mb-8 animate-fade-in">
          <DataDisclosureChip demoPath={location.pathname} />
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Voice Negotiation for Real Estate</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Analyze a property, configure your bid range, then let the AI negotiate by phone.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center mb-6">
          This AI voice negotiation demo showcases how real estate investors automate seller outreach with live phone calls. Enter a property address, set your bid range and negotiation strategy, then listen as the AI voice agent calls and negotiates in real time using natural conversation. The system uses Vapi for WebRTC browser calls and outbound phone calls, with ElevenLabs text-to-speech for a human-sounding voice. The AI references comparable sales, discusses property condition, and works within your configured offer range — just like a trained acquisitions agent. After the call, you get a full transcript and deal summary. For real estate professionals doing cold calling, follow-up, or seller outreach at scale, AI voice calls eliminate the bottleneck of manual dialing while maintaining a personal, conversational approach.
        </p>

        {/* ── Input Phase ── */}
        {phase === 'input' && (
          <>
            <Card className="p-5 sm:p-6 mb-6 animate-fade-in">
              <PropertyInputPanel
                onSubmitUrl={handleUrl}
                onSubmitImage={handleImage}
                onSubmitManual={handleManual}
                disabled={false}
                scrapeError={scrapeError}
              />
            </Card>
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </>
        )}

        {/* ── Agent Phase ── */}
        {phase === 'agent' && (
          <>
            <Card className="p-5 sm:p-6 mb-6 animate-fade-in opacity-60">
              <PropertyInputPanel
                onSubmitUrl={() => {}}
                onSubmitImage={() => {}}
                onSubmitManual={() => {}}
                disabled={true}
                scrapeError={null}
              />
            </Card>
            <AgentTimeline steps={steps} elapsedMs={elapsedMs} />
          </>
        )}

        {/* ── Voice Setup Phase ── */}
        {phase === 'setup' && agentResult && (
          <div className="space-y-6 animate-fade-in">
            <SpeedBanner elapsedSeconds={Math.round(elapsedMs / 1000)} />

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Phone size={18} className="text-red-500" /> Voice Negotiator
              </h2>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={reset}>
                <RotateCcw size={14} /> Start Over
              </Button>
            </div>

            <VoiceCallSetup
              property={agentResult.property}
              report={agentResult.report}
              comps={agentResult.comps}
              companyName={name}
              isVapiAvailable={voice.isVapiAvailable}
              onStartCall={(config) => {
                setBidRange(config.bidRange);
                setPhase('call');
                voice.startCall(config);
              }}
            />
          </div>
        )}

        {/* ── Live Call Phase ── */}
        {phase === 'call' && agentResult && bidRange && (
          <VoiceCallLive
            state={voice.state}
            property={agentResult.property}
            bidRange={bidRange}
            onEndCall={voice.endCall}
            onSendCoaching={voice.sendCoaching}
            coachingMessages={voice.coachingMessages}
            isPhoneCall={voice.isPhoneCall}
          />
        )}

        {/* ── Summary Phase ── */}
        {/* Ticket 0029 - shared cold-open path renders first when present; the
            live post-call summary path is unchanged. */}
        {phase === 'summary' && sharedSummary && sharedProperty && (
          <VoiceCallSummary
            summary={sharedSummary}
            transcript={[]}
            property={sharedProperty}
            onNewCall={reset}
            isSharedView
          />
        )}
        {phase === 'summary' && !sharedSummary && voice.state.summary && agentResult && (
          <VoiceCallSummary
            summary={voice.state.summary}
            transcript={voice.state.transcript}
            property={agentResult.property}
            onNewCall={reset}
          />
        )}

        {/* Waiting for summary after call ended */}
        {phase === 'call' && voice.state.status === 'ended' && !voice.state.summary && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {voice.state.endedReason
                ? `Call ended: ${voice.state.endedReason} — Processing...`
                : 'Analyzing conversation...'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Fetching transcript and generating summary
            </p>
          </Card>
        )}

        {/* ── Conversation History ── */}
        <div className="mt-10">
          <ConversationHistory onCallAgain={handleCallAgain} />
        </div>
      </div>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default VoiceNegotiator;
