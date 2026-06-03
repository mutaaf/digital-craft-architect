import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import NextDemoCTA from '@/components/NextDemoCTA';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle2,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Printer,
  TrendingUp,
  Target,
  Lightbulb,
  ArrowRight,
  Mail,
  MessageSquare,
  User,
  Link2,
  Check,
  Calendar,
} from 'lucide-react';
import VoiceTranscript from './VoiceTranscript';
import type { CallSummary, TranscriptEntry } from '@/data/voiceNegotiation';
import type { PropertyData } from '@/data/propertyNegotiation';
import { trackCTAClick } from '@/utils/analytics';
import {
  encodeVoiceSummary,
  type ShareableVoiceSummary,
} from '@/utils/voiceSummaryShareLink';

interface VoiceCallSummaryProps {
  summary: CallSummary;
  transcript: TranscriptEntry[];
  property: PropertyData;
  onNewCall: () => void;
  /**
   * Ticket 0029 - cold-open mode: when true, the card was rehydrated from a
   * shared ?v= URL. The transcript, contact info, follow-up actions, and
   * "New Call"/"Print" controls are hidden, and a "Book Free Consultation"
   * CTA renders below the card so the shared artifact is a self-contained
   * funnel surface. Default false preserves the original post-call flow.
   */
  isSharedView?: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

const SENTIMENT_CONFIG = {
  positive: { label: 'Positive', color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
  neutral: { label: 'Neutral', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
  negative: { label: 'Negative', color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
};

function buildFollowUpEmail(summary: CallSummary, property: PropertyData): { subject: string; body: string } {
  // Ticket 0029 / 2026-05-25 mirror-source lesson: the em-dash characters
  // that previously lived here were a brand-voice Hard NO violation. Punc-
  // tuation repair (em-dash to hyphen) keeps the visible email subject and
  // the new shareable-link copy consistent without rewording either.
  const subject = summary.agreedPrice
    ? `Deal Follow-Up: ${property.address} - $${summary.agreedPrice.toLocaleString()} Agreed`
    : `Follow-Up: ${property.address} - Next Steps`;

  const lines: string[] = [];
  lines.push(`Hi${summary.sellerEmail ? '' : ' there'},`);
  lines.push('');
  lines.push(`Great speaking with you about your property at ${property.address}. Here's a quick recap of our conversation:`);
  lines.push('');

  if (summary.agreedPrice) {
    lines.push(`Agreed Price: $${summary.agreedPrice.toLocaleString()}`);
  }
  if (summary.lowestAcceptable) {
    lines.push(`Discussed Range: Around $${summary.lowestAcceptable.toLocaleString()}`);
  }
  lines.push(`Timeline: ${summary.sellerTimeline}`);
  lines.push('');

  lines.push('Key takeaways:');
  summary.keyInsights.forEach((insight) => {
    lines.push(`- ${insight}`);
  });
  lines.push('');

  lines.push('Next steps:');
  summary.recommendedNextSteps.forEach((step) => {
    lines.push(`- ${step}`);
  });
  lines.push('');

  lines.push("Let me know if you have any questions or if anything's changed on your end. Looking forward to working with you!");
  lines.push('');
  lines.push('Best,');

  return { subject, body: lines.join('\n') };
}

function buildFollowUpSMS(summary: CallSummary, property: PropertyData): string {
  const lines: string[] = [];
  lines.push(`Hey! Just following up on our call about ${property.address.split(',')[0]}.`);
  if (summary.agreedPrice) {
    lines.push(`We agreed on $${summary.agreedPrice.toLocaleString()} - I'll get the paperwork started.`);
  } else {
    lines.push(`Wanted to keep the conversation going.`);
  }
  lines.push(`What's the best time for a follow-up?`);
  return lines.join(' ');
}

const BOOKING_URL = 'https://calendly.com/mutaaf';

const VoiceCallSummary = ({
  summary,
  transcript,
  property,
  onNewCall,
  isSharedView = false,
}: VoiceCallSummaryProps) => {
  // Detect booking call context (no asking price = not a property negotiation)
  const isBookingCall = !property.askingPrice;
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [copied, setCopied] = useState<'idle' | 'copied'>('idle');
  const sentiment = SENTIMENT_CONFIG[summary.overallSentiment] || SENTIMENT_CONFIG.neutral;
  // Ticket 0031 - currentPath drives the pinned "Try next demo" CTA's
  // recommender lookup. Sourced from useLocation() so the path is never
  // hardcoded; the same hook is already used in the parent VoiceNegotiator
  // page for the cold-open share parsing.
  const location = useLocation();

  const email = buildFollowUpEmail(summary, property);
  const smsBody = buildFollowUpSMS(summary, property);
  const mailtoUrl = `mailto:${summary.sellerEmail || ''}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
  const smsUrl = summary.sellerPhone
    ? `sms:${summary.sellerPhone}?body=${encodeURIComponent(smsBody)}`
    : `sms:?body=${encodeURIComponent(smsBody)}`;

  const handleCopyShareLink = async () => {
    // Build the shareable payload from the summary + property, stripping
    // anything not declared in ShareableVoiceSummary (transcript, seller
    // contact info, raw seller utterances). Same-origin, same-route URL.
    const sharePayload: ShareableVoiceSummary = {
      address: property.address,
      agreedPrice: summary.agreedPrice,
      lowestAcceptable: summary.lowestAcceptable,
      sellerTimeline: summary.sellerTimeline,
      sentiment: summary.overallSentiment,
      keyInsights: summary.keyInsights,
      recommendedNextSteps: summary.recommendedNextSteps,
      durationSeconds: summary.callDurationSeconds,
    };
    const encoded = encodeVoiceSummary(sharePayload);
    const url = `${window.location.origin}${window.location.pathname}?v=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older browsers / insecure contexts: fall back to a temp textarea.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(ta);
      }
    }

    setCopied('copied');
    window.setTimeout(() => setCopied('idle'), 2000);
    trackCTAClick('share_voice_summary', 'voice_summary_card');
  };

  return (
    <div data-testid="voice-summary-card" className="space-y-5 animate-fade-in">
      {/* Header Card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={20} />
            <h3 className="font-bold text-lg">Call Complete</h3>
          </div>
          <p className="text-sm text-white/80 truncate">{property.address}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
          <div className="p-4 text-center">
            <Clock size={16} className="mx-auto mb-1 text-gray-400" />
            <p className="text-sm font-semibold">{formatDuration(summary.callDurationSeconds)}</p>
            <p className="text-[10px] text-gray-500">Duration</p>
          </div>
          <div className="p-4 text-center">
            <TrendingUp size={16} className="mx-auto mb-1 text-gray-400" />
            <Badge className={`${sentiment.color} text-xs`}>{sentiment.label}</Badge>
            <p className="text-[10px] text-gray-500 mt-1">Sentiment</p>
          </div>
          <div className="p-4 text-center">
            <DollarSign size={16} className="mx-auto mb-1 text-gray-400" />
            <p className="text-sm font-semibold">
              {isBookingCall
                ? (summary.overallSentiment === 'positive' ? 'Likely' : summary.overallSentiment === 'negative' ? 'Unlikely' : 'Maybe')
                : summary.agreedPrice
                  ? `$${summary.agreedPrice.toLocaleString()}`
                  : 'Pending'}
            </p>
            <p className="text-[10px] text-gray-500">
              {isBookingCall
                ? 'Booking Likelihood'
                : summary.agreedPrice ? 'Agreed Price' : 'No Agreement Yet'}
            </p>
          </div>
        </div>
      </Card>

      {/* Ticket 0031 - "Try the next demo" pinned CTA. Lives directly below
          the agreed-price summary heading and above the "Copy share link"
          row from ticket 0029. Gated to the live post-call view so it does
          not compete with the shared-view "Book Free Consultation" CTA. */}
      {!isSharedView && (
        <NextDemoCTA currentPath={location.pathname} surface="voice_result" />
      )}

      {/* Position / Interest */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-primary" />
          <h4 className="text-sm font-semibold">{isBookingCall ? 'Client Interest' : 'Seller Position'}</h4>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {summary.sellerPosition}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-3">
          {!isBookingCall && summary.lowestAcceptable && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
              <p className="text-[10px] text-gray-500 uppercase">Lowest Acceptable</p>
              <p className="text-sm font-semibold">${summary.lowestAcceptable.toLocaleString()}</p>
            </div>
          )}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
            <p className="text-[10px] text-gray-500 uppercase">{isBookingCall ? 'Event Timeline' : 'Timeline'}</p>
            <p className="text-sm font-semibold">{summary.sellerTimeline}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5 col-span-2">
            <p className="text-[10px] text-gray-500 uppercase">{isBookingCall ? 'What They Want' : 'Motivation'}</p>
            <p className="text-sm">{summary.sellerMotivation}</p>
          </div>
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb size={14} className="text-yellow-500" />
          <h4 className="text-sm font-semibold">Key Insights</h4>
        </div>
        <ul className="space-y-2">
          {summary.keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="text-primary mt-0.5 shrink-0">&#8226;</span>
              {insight}
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommended Next Steps */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowRight size={14} className="text-green-500" />
          <h4 className="text-sm font-semibold">Recommended Next Steps</h4>
        </div>
        <ul className="space-y-2">
          {summary.recommendedNextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <div className="w-5 h-5 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] text-gray-400">{i + 1}</span>
              </div>
              <span className="text-gray-600 dark:text-gray-400">{step}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Contact Info - hidden on the shared cold-open path (privacy: seller
          contact never travels in the URL). */}
      {!isSharedView && (summary.sellerEmail || summary.sellerPhone) && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <User size={14} className="text-primary" />
            <h4 className="text-sm font-semibold">{isBookingCall ? 'Client Contact' : 'Seller Contact'}</h4>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {summary.sellerEmail && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
                <p className="text-[10px] text-gray-500 uppercase">Email</p>
                <p className="text-sm font-medium truncate">{summary.sellerEmail}</p>
              </div>
            )}
            {summary.sellerPhone && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
                <p className="text-[10px] text-gray-500 uppercase">Phone</p>
                <p className="text-sm font-medium">{summary.sellerPhone}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Follow-Up Actions - hidden on the shared cold-open path (the shared
          viewer has no seller contact context to email or SMS). */}
      {!isSharedView && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Mail size={14} className="text-blue-500" />
            <h4 className="text-sm font-semibold">Follow Up</h4>
          </div>
          <div className="flex gap-3">
            <Button asChild className="flex-1 gap-2">
              <a href={mailtoUrl}>
                <Mail size={16} />
                Open in Email
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1 gap-2">
              <a href={smsUrl}>
                <MessageSquare size={16} />
                Open in Messages
              </a>
            </Button>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
            Opens your default mail or messaging app with a pre-written follow-up
          </p>
        </Card>
      )}

      {/* Share Link Card - ticket 0029. Always rendered on the live post-call
          view; on the cold-open shared view the link is the visitor's only
          conversion surface so we keep it visible there too. */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={14} className="text-primary" />
          <h4 className="text-sm font-semibold">Share This Summary</h4>
        </div>
        <Button
          data-testid="copy-share-link"
          onClick={handleCopyShareLink}
          variant="outline"
          aria-live="polite"
          className="w-full gap-2 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {copied === 'copied' ? (
            <span
              data-testid="copy-confirmation"
              className="flex items-center gap-2 text-green-600 dark:text-green-400"
            >
              <Check size={16} /> Copied
            </span>
          ) : (
            <>
              <Link2 size={16} /> Copy share link
            </>
          )}
        </Button>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center mt-2">
          Sends a branded summary card. The full transcript and contact info stay private.
        </p>
      </Card>

      {/* Full Transcript - hidden on the shared cold-open path by privacy
          construction (transcript never travels in the URL). */}
      {!isSharedView && (
        <Collapsible open={transcriptOpen} onOpenChange={setTranscriptOpen}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <span className="text-sm font-medium">Full Transcript</span>
              {transcriptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t border-gray-200 dark:border-gray-800 p-4">
                <VoiceTranscript entries={transcript} autoScroll={false} />
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Shared-view CTA: the cold-open path has no "New Call" or "Print"
          context (no live demo state to reset, no print stylesheet). Surface
          a "Book Free Consultation" CTA instead so the shared artifact is a
          self-contained funnel surface. */}
      {isSharedView && (
        <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={14} className="text-primary" />
            <h4 className="text-sm font-semibold">Want this for your own deals?</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            This summary was generated by an AI voice agent. Book a free 30-minute call to see how it would work for your business.
          </p>
          <Button asChild className="w-full gap-2">
            <a
              data-testid="shared-voice-cta"
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackCTAClick('book_free_consultation', 'shared_voice_summary')
              }
            >
              <Calendar size={16} />
              Book Free Consultation
            </a>
          </Button>
        </Card>
      )}

      {/* Action Buttons - hidden on the shared cold-open path (no demo state
          to restart from a shared link). */}
      {!isSharedView && (
        <div className="flex gap-3">
          <Button onClick={onNewCall} className="flex-1 gap-2">
            <RotateCcw size={16} />
            New Call
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Print
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceCallSummary;
