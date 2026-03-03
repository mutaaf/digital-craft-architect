import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import VoiceTranscript from './VoiceTranscript';
import type { CallSummary, TranscriptEntry } from '@/data/voiceNegotiation';
import type { PropertyData } from '@/data/propertyNegotiation';

interface VoiceCallSummaryProps {
  summary: CallSummary;
  transcript: TranscriptEntry[];
  property: PropertyData;
  onNewCall: () => void;
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
  const subject = summary.agreedPrice
    ? `Deal Follow-Up: ${property.address} — $${summary.agreedPrice.toLocaleString()} Agreed`
    : `Follow-Up: ${property.address} — Next Steps`;

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
    lines.push(`We agreed on $${summary.agreedPrice.toLocaleString()} — I'll get the paperwork started.`);
  } else {
    lines.push(`Wanted to keep the conversation going.`);
  }
  lines.push(`What's the best time for a follow-up?`);
  return lines.join(' ');
}

const VoiceCallSummary = ({
  summary,
  transcript,
  property,
  onNewCall,
}: VoiceCallSummaryProps) => {
  // Detect booking call context (no asking price = not a property negotiation)
  const isBookingCall = !property.askingPrice;
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const sentiment = SENTIMENT_CONFIG[summary.overallSentiment] || SENTIMENT_CONFIG.neutral;

  const email = buildFollowUpEmail(summary, property);
  const smsBody = buildFollowUpSMS(summary, property);
  const mailtoUrl = `mailto:${summary.sellerEmail || ''}?subject=${encodeURIComponent(email.subject)}&body=${encodeURIComponent(email.body)}`;
  const smsUrl = summary.sellerPhone
    ? `sms:${summary.sellerPhone}?body=${encodeURIComponent(smsBody)}`
    : `sms:?body=${encodeURIComponent(smsBody)}`;

  return (
    <div className="space-y-5 animate-fade-in">
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

      {/* Contact Info */}
      {(summary.sellerEmail || summary.sellerPhone) && (
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

      {/* Follow-Up Actions */}
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
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Opens your default mail or messaging app with a pre-written follow-up
        </p>
      </Card>

      {/* Full Transcript */}
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

      {/* Action Buttons */}
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
    </div>
  );
};

export default VoiceCallSummary;
