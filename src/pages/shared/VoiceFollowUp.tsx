import { useCallback, useEffect, useState } from 'react';
import { Phone, Mic, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { VOICE, buildVoicePrompt } from '@/data/demoProfiles';
import { useVoiceCall } from '@/hooks/useVoiceCall';
import VoiceCallLive from '@/components/construction/negotiator/VoiceCallLive';
import VoiceCallSummary from '@/components/construction/negotiator/VoiceCallSummary';
import type { PropertyData } from '@/data/propertyNegotiation';
import type { VoiceCallConfig, BidRange } from '@/data/voiceNegotiation';
import DemoShell, { Choice, StepTitle } from './DemoShell';

// The voice engine (useVoiceCall + the live/summary panels) was built for property calls; a
// follow-up call borrows its shape with no price, exactly as events/VoiceBookingAgent does.
const NO_BIDS: BidRange = { minOffer: 0, targetOffer: 0, maxOffer: 0 };
const EMPTY_REPORT: VoiceCallConfig['report'] = {
  recommendedOffer: 0, discountPercent: 0, leveragePoints: [],
  strategy: { initialOffer: '', counterStrategy: '', walkawayPoint: '', timeline: '' },
  contingencies: [], roiProjection: { purchasePrice: 0, estimatedRehab: 0, arv: 0, potentialProfit: 0, roiPercent: 0, holdingCosts: 0 },
  marketContext: '', riskFactors: [], summary: '', dealType: '', confidenceScore: 0,
};
const stub = (title: string, notes: string, kind: string): PropertyData => ({
  address: title, askingPrice: 0, bedrooms: null, bathrooms: null, sqft: null, yearBuilt: null, propertyType: kind,
  condition: '', lotSize: '', daysOnMarket: null, listingSource: '', notes, acreage: null, zoning: null, utilities: null, sellerMotivation: null,
});

const field = 'h-[52px] w-full min-w-0 rounded-xl border border-[#d2d2d7] bg-white px-4 text-[17px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-aurora focus:ring-4 focus:ring-aurora/15';

/** Every industry's outbound follow-up call: recall, reminders, rebooking, retention, missed calls. */
const VoiceFollowUp = () => {
  const { company, vertical } = useDemoContext();
  const p = VOICE[vertical] ?? VOICE.homeservices!;
  const name = company?.companyName || 'DigitalCraft AI';
  const voice = useVoiceCall();

  const [phase, setPhase] = useState<'input' | 'call' | 'summary'>('input');
  const [purposeId, setPurposeId] = useState(p.purposes[0].id);
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState(p.slots);
  const [showPrompt, setShowPrompt] = useState(false);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [call, setCall] = useState<PropertyData | null>(null);

  const purpose = p.purposes.find((x) => x.id === purposeId)!;
  const autoPrompt = buildVoicePrompt(p, { company: name, contact, purposeId, detail, notes, slots });
  const first = contact.trim().split(/\s+/)[0] || '';

  useEffect(() => {
    if (voice.state.status === 'ended' && voice.state.summary) setPhase('summary');
  }, [voice.state.status, voice.state.summary]);

  const start = useCallback(() => {
    const s = stub(`${purpose.label}: ${contact.trim() || p.contact}`, [detail, notes].filter(Boolean).join('. '), p.title);
    setCall(s);
    setPhase('call');
    voice.startCall({
      property: s, report: EMPTY_REPORT, comps: [], bidRange: NO_BIDS,
      sellerPhone: phone.trim() || undefined, sellerName: contact.trim() || undefined, companyName: name,
      promptOverride: prompt ?? autoPrompt,
      firstMessage: p.opener(name, first, purposeId),
    });
  }, [purpose, contact, p, detail, notes, phone, name, prompt, autoPrompt, first, purposeId, voice]);

  const reset = () => { voice.reset(); setPhase('input'); setCall(null); };

  return (
    <DemoShell title={p.title} company={name} h1={p.h1} intro={p.intro} seo={p.seo}>
      {phase === 'input' && (
        <div className="space-y-9">
          <section>
            <StepTitle n={1}>Why is the AI calling?</StepTitle>
            <div role="radiogroup" aria-label="Why is the AI calling?" className="grid gap-2.5 sm:grid-cols-3">
              {p.purposes.map((x) => <Choice key={x.id} on={x.id === purposeId} onClick={() => setPurposeId(x.id)} title={x.label} />)}
            </div>
          </section>

          <section>
            <StepTitle n={2}>Who does it call?</StepTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">{p.contact} name</span>
                <input className={field} value={contact} onChange={(e) => setContact(e.target.value)} placeholder={p.contactPlaceholder} autoComplete="off" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">Phone <span className="text-[#86868b]">(optional)</span></span>
                <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" inputMode="tel" autoComplete="off" />
                <span className="mt-1.5 block text-[13px] text-[#86868b]">Leave blank to talk to it right here in your browser.</span>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">{p.detailLabel}</span>
                <input className={field} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={p.detailPlaceholder} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">Notes <span className="text-[#86868b]">(optional)</span></span>
                <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={p.notesPlaceholder}
                  className="w-full min-w-0 resize-y rounded-xl border border-[#d2d2d7] bg-white px-4 py-3 text-[17px] text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-aurora focus:ring-4 focus:ring-aurora/15" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1.5 block text-[14px] text-[#6e6e73]">Times it can offer</span>
                <input className={field} value={slots} onChange={(e) => setSlots(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-5 ring-1 ring-[#e8e8ed] sm:p-6">
            <p className="mb-3 text-[15px] font-medium text-[#1d1d1f]">How the call goes</p>
            <ol className="grid gap-2 sm:grid-cols-2">
              {p.strategy.map((s, i) => (
                <li key={s} className="flex gap-3 text-[15px] leading-snug text-[#424245]">
                  <span aria-hidden className="mt-px flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--v3-aurora-wash)] text-[13px] font-semibold text-[var(--v3-aurora-deep)]">{i + 1}</span>{s}
                </li>
              ))}
            </ol>
            <button type="button" onClick={() => setShowPrompt((v) => !v)} aria-expanded={showPrompt} className="mt-4 inline-flex min-h-[44px] items-center gap-1.5 text-[15px] text-[var(--v3-aurora-deep)]">
              {showPrompt ? <ChevronUp size={16} aria-hidden /> : <ChevronDown size={16} aria-hidden />} {showPrompt ? 'Hide' : 'See or edit'} the agent's instructions
            </button>
            {showPrompt && (
              <div className="mt-2">
                <textarea value={prompt ?? autoPrompt} onChange={(e) => setPrompt(e.target.value)} spellCheck={false} aria-label="Agent instructions"
                  className="h-72 w-full resize-y rounded-xl border border-[#e8e8ed] bg-[#fbfbfd] p-3 font-mono text-[13px] leading-relaxed text-[#1d1d1f] outline-none focus:border-aurora" />
                {prompt !== null && (
                  <button type="button" onClick={() => setPrompt(null)} className="mt-1 inline-flex min-h-[40px] items-center gap-1.5 text-[14px] text-[#6e6e73] hover:text-[#1d1d1f]">
                    <RotateCcw size={14} aria-hidden /> Reset to default
                  </button>
                )}
              </div>
            )}
          </section>

          <div>
            <button type="button" onClick={start} disabled={!contact.trim()} className="k-pill k-pill-brand w-full disabled:cursor-not-allowed disabled:opacity-40">
              <Phone size={18} aria-hidden /> {phone.trim() ? `Call ${first || 'them'} now` : 'Start the call in my browser'}
            </button>
            <p className="mt-3 text-center text-[14px] text-[#6e6e73]">
              {!contact.trim() ? `Add a ${p.contact.toLowerCase()} name to start.` : voice.isVapiAvailable ? 'Allow your microphone and play the other side of the call.' : <span className="inline-flex items-center gap-1"><Mic size={14} aria-hidden /> Demo mode: you'll hear a simulated call.</span>}
            </p>
          </div>
        </div>
      )}

      {phase === 'call' && call && (
        <>
          <VoiceCallLive state={voice.state} property={call} bidRange={NO_BIDS} onEndCall={voice.endCall}
            onSendCoaching={voice.sendCoaching} coachingMessages={voice.coachingMessages} isPhoneCall={voice.isPhoneCall} />
          {voice.state.status === 'ended' && !voice.state.summary && (
            <div className="mt-6 rounded-3xl bg-white p-8 text-center ring-1 ring-[#e8e8ed]">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#e8e8ed] border-t-aurora" />
              <p className="text-[15px] text-[#6e6e73]">Writing up the call…</p>
            </div>
          )}
        </>
      )}

      {phase === 'summary' && voice.state.summary && call && (
        <VoiceCallSummary summary={voice.state.summary} transcript={voice.state.transcript} property={call} onNewCall={reset} />
      )}
    </DemoShell>
  );
};

export default VoiceFollowUp;
