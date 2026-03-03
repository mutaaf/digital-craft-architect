import type { PropertyData, NegotiationReport, ComparableProperty } from './propertyNegotiation';

export interface BidRange {
  minOffer: number;
  targetOffer: number;
  maxOffer: number;
}

export type CallStatus =
  | 'idle'
  | 'configuring'
  | 'connecting'
  | 'ringing'
  | 'in_progress'
  | 'ended'
  | 'error';

export interface TranscriptEntry {
  role: 'assistant' | 'user';
  text: string;
  timestamp: number;
  isFinal: boolean;
}

export interface CallSummary {
  sellerPosition: string;
  lowestAcceptable: number | null;
  sellerTimeline: string;
  sellerMotivation: string;
  keyInsights: string[];
  recommendedNextSteps: string[];
  agreedPrice: number | null;
  callDurationSeconds: number;
  overallSentiment: 'positive' | 'neutral' | 'negative';
  sellerEmail?: string | null;
  sellerPhone?: string | null;
}

export interface VoiceCallState {
  status: CallStatus;
  callId: string | null;
  transcript: TranscriptEntry[];
  startTime: number | null;
  endTime: number | null;
  elapsedSeconds: number;
  summary: CallSummary | null;
  error: string | null;
  isDemo: boolean;
  endedReason: string | null;
}

export interface VoiceCallConfig {
  property: PropertyData;
  report: NegotiationReport;
  comps: ComparableProperty[];
  bidRange: BidRange;
  sellerPhone?: string;
  sellerName?: string;
  companyName: string;
  promptOverride?: string;
  firstMessage?: string;
}
