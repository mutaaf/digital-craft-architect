import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Phone, RotateCcw, Mic, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import VoiceCallLive from '@/components/construction/negotiator/VoiceCallLive';
import VoiceCallSummary from '@/components/construction/negotiator/VoiceCallSummary';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import { buildBookingPrompt, DEFAULT_SLOTS, EVENT_TYPE_LABELS } from '@/data/eventBooking';
import type { EventLeadInput } from '@/data/eventBooking';
import type { PropertyData } from '@/data/propertyNegotiation';
import type { VoiceCallConfig, BidRange } from '@/data/voiceNegotiation';

type Phase = 'input' | 'setup' | 'call' | 'summary';

const DUMMY_BID_RANGE: BidRange = { minOffer: 0, targetOffer: 0, maxOffer: 0 };

function buildPropertyStub(lead: EventLeadInput): PropertyData {
  const eventLabel = EVENT_TYPE_LABELS[lead.eventType];
  return {
    address: `${eventLabel} — ${lead.clientName}${lead.eventDate ? ` — ${lead.eventDate}` : ''}`,
    askingPrice: 0,
    bedrooms: null,
    bathrooms: null,
    sqft: null,
    yearBuilt: null,
    propertyType: eventLabel,
    condition: '',
    lotSize: '',
    daysOnMarket: null,
    listingSource: '',
    notes: lead.notes,
    acreage: null,
    zoning: null,
    utilities: null,
  };
}

const VoiceBookingAgent = () => {
  const { company } = useDemoContext();
  const name = company?.companyName || 'DigitalCraft AI';

  const [phase, setPhase] = useState<Phase>('input');
  const [lead, setLead] = useState<EventLeadInput>({
    clientName: '',
    phone: '',
    eventType: 'wedding',
    eventDate: '',
    serviceInterest: '',
    notes: '',
    availableSlots: DEFAULT_SLOTS,
  });
  const [propertyStub, setPropertyStub] = useState<PropertyData | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [hasEditedPrompt, setHasEditedPrompt] = useState(false);

  const voice = useVoiceCall();

  // Transition to summary when call ends and summary is ready
  useEffect(() => {
    if (voice.state.status === 'ended' && voice.state.summary) {
      setPhase('summary');
    }
  }, [voice.state.status, voice.state.summary]);

  const handleSubmitLead = () => {
    const stub = buildPropertyStub(lead);
    setPropertyStub(stub);

    const defaultPrompt = buildBookingPrompt(lead, name);
    if (!hasEditedPrompt) {
      setPromptText(defaultPrompt);
    }

    setPhase('setup');
  };

  const handleStartCall = useCallback(() => {
    if (!propertyStub) return;

    const config: VoiceCallConfig = {
      property: propertyStub,
      report: {
        recommendedOffer: 0,
        discountPercent: 0,
        leveragePoints: [],
        strategy: { initialOffer: '', counterStrategy: '', walkawayPoint: '', timeline: '' },
        contingencies: [],
        roiProjection: { purchasePrice: 0, estimatedRehab: 0, arv: 0, potentialProfit: 0, roiPercent: 0, holdingCosts: 0 },
        marketContext: '',
        riskFactors: [],
        summary: '',
        dealType: '',
        confidenceScore: 0,
      },
      comps: [],
      bidRange: DUMMY_BID_RANGE,
      sellerPhone: lead.phone || undefined,
      sellerName: lead.clientName || undefined,
      companyName: name,
      promptOverride: promptText || buildBookingPrompt(lead, name),
      firstMessage: `Hey${lead.clientName ? `, ${lead.clientName.split(' ')[0]}` : ''}! This is calling from ${name}. We got your inquiry about our ${EVENT_TYPE_LABELS[lead.eventType].toLowerCase()} services and I wanted to follow up — is now a good time to chat?`,
    };

    setPhase('call');
    voice.startCall(config);
  }, [propertyStub, lead, name, promptText, voice]);

  const reset = () => {
    voice.reset();
    setPhase('input');
    setPropertyStub(null);
    setShowPrompt(false);
    setPromptText('');
    setHasEditedPrompt(false);
  };

  const handleTogglePrompt = () => {
    if (!showPrompt && !hasEditedPrompt) {
      setPromptText(buildBookingPrompt(lead, name));
    }
    setShowPrompt(!showPrompt);
  };

  const handleResetPrompt = () => {
    setPromptText(buildBookingPrompt(lead, name));
    setHasEditedPrompt(false);
  };

  const canSubmit = lead.clientName.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Voice Booking Agent | {name}</title>
        <meta
          name="description"
          content="AI-powered voice booking agent for event vendors. The AI calls leads to confirm interest, discuss packages, and schedule consultations."
        />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">AI Voice Booking Agent</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Enter lead details and let the AI call to confirm interest, discuss packages, and schedule a consultation.
          </p>
        </div>

        {/* ── Input Phase ── */}
        {phase === 'input' && (
          <Card className="p-5 sm:p-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600">
                <Phone size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-base">Lead Information</h3>
                <p className="text-xs text-gray-500">Enter the lead details for the booking call</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Client Name *</label>
                  <Input
                    placeholder="e.g., Sarah Johnson"
                    value={lead.clientName}
                    onChange={(e) => setLead((prev) => ({ ...prev, clientName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Phone</label>
                  <Input
                    placeholder="+1 (555) 123-4567"
                    value={lead.phone}
                    onChange={(e) => setLead((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Enter a number to call directly, or leave blank for browser demo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Event Type</label>
                  <select
                    value={lead.eventType}
                    onChange={(e) => setLead((prev) => ({ ...prev, eventType: e.target.value as EventLeadInput['eventType'] }))}
                    className="w-full h-10 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                  >
                    <option value="wedding">Wedding</option>
                    <option value="birthday">Birthday Party</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="quinceanera">Quinceañera</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1.5">Event Date</label>
                  <Input
                    type="date"
                    value={lead.eventDate}
                    onChange={(e) => setLead((prev) => ({ ...prev, eventDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Service Interest</label>
                <Input
                  placeholder="e.g., DJ + Photography package"
                  value={lead.serviceInterest}
                  onChange={(e) => setLead((prev) => ({ ...prev, serviceInterest: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Notes from Inquiry</label>
                <textarea
                  placeholder="e.g., Found us on The Knot, wants elegant garden theme, 150 guests"
                  value={lead.notes}
                  onChange={(e) => setLead((prev) => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 resize-y"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Available Consultation Slots</label>
                <Input
                  placeholder="e.g., Tuesday 3pm, Thursday 10am, Saturday 11am"
                  value={lead.availableSlots}
                  onChange={(e) => setLead((prev) => ({ ...prev, availableSlots: e.target.value }))}
                />
              </div>
            </div>

            <Button
              onClick={handleSubmitLead}
              disabled={!canSubmit}
              size="lg"
              className="w-full mt-6 gap-2"
            >
              <Phone size={18} /> Continue to Call Setup
            </Button>
          </Card>
        )}

        {/* ── Setup Phase ── */}
        {phase === 'setup' && propertyStub && (
          <div className="space-y-5 animate-fade-in">
            {/* Lead Summary */}
            <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500">Lead Summary</span>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={reset}>
                  <RotateCcw size={12} /> Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase">Client</span>
                  <p className="font-medium">{lead.clientName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase">Event Type</span>
                  <p className="font-medium">{EVENT_TYPE_LABELS[lead.eventType]}</p>
                </div>
                {lead.eventDate && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Date</span>
                    <p className="font-medium">{lead.eventDate}</p>
                  </div>
                )}
                {lead.serviceInterest && (
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase">Service</span>
                    <p className="font-medium">{lead.serviceInterest}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Call Setup Card */}
            <Card className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Voice Booking Agent</h3>
                  <p className="text-xs text-gray-500">AI will call and discuss event packages</p>
                </div>
                {!voice.isVapiAvailable && (
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Mic size={10} className="mr-1" /> Demo Mode
                  </Badge>
                )}
              </div>

              {/* Strategy Preview */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mb-4">
                <span className="text-xs font-medium text-gray-500 block mb-2">Call Strategy</span>
                <ul className="space-y-1.5">
                  <li className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    Confirm interest in {EVENT_TYPE_LABELS[lead.eventType].toLowerCase()} services
                  </li>
                  <li className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    Discuss relevant packages and pricing options
                  </li>
                  <li className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    Check date availability and gather event details
                  </li>
                  <li className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">&#8226;</span>
                    Schedule a consultation: {lead.availableSlots}
                  </li>
                </ul>
              </div>
            </Card>

            {/* Prompt Editor */}
            <Card className="overflow-hidden">
              <button
                onClick={handleTogglePrompt}
                className="w-full p-4 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
              >
                <FileText size={14} className="text-gray-400" />
                <span className="text-xs font-medium text-gray-500 flex-1">
                  Agent Instructions
                  {hasEditedPrompt && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">edited</Badge>
                  )}
                </span>
                {showPrompt ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </button>

              {showPrompt && (
                <div className="px-4 pb-4 space-y-2">
                  <p className="text-[11px] text-gray-400">
                    This is what the AI agent will follow during the call. Edit it to change the agent's behavior, tone, or strategy.
                  </p>
                  <textarea
                    value={promptText}
                    onChange={(e) => {
                      setPromptText(e.target.value);
                      setHasEditedPrompt(true);
                    }}
                    className="w-full h-80 text-xs font-mono bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
                    spellCheck={false}
                  />
                  {hasEditedPrompt && (
                    <Button variant="ghost" size="sm" onClick={handleResetPrompt} className="text-xs gap-1.5">
                      <RotateCcw size={12} /> Reset to Default
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Start Button */}
            <Button onClick={handleStartCall} size="lg" className="w-full gap-2">
              <Phone size={18} />
              {voice.isVapiAvailable ? 'Start Booking Call' : 'Start Demo Call'}
            </Button>
          </div>
        )}

        {/* ── Live Call Phase ── */}
        {phase === 'call' && propertyStub && (
          <VoiceCallLive
            state={voice.state}
            property={propertyStub}
            bidRange={DUMMY_BID_RANGE}
            onEndCall={voice.endCall}
            onSendCoaching={voice.sendCoaching}
            coachingMessages={voice.coachingMessages}
            isPhoneCall={voice.isPhoneCall}
          />
        )}

        {/* ── Summary Phase ── */}
        {phase === 'summary' && voice.state.summary && propertyStub && (
          <VoiceCallSummary
            summary={voice.state.summary}
            transcript={voice.state.transcript}
            property={propertyStub}
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
      </div>
    </div>
  );
};

export default VoiceBookingAgent;
