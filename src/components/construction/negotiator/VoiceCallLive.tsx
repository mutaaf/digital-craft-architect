import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, PhoneOff, Wifi, Clock } from 'lucide-react';
import AudioWaveform from './AudioWaveform';
import VoiceTranscript from './VoiceTranscript';
import CoachingPanel from './CoachingPanel';
import type { VoiceCallState, BidRange } from '@/data/voiceNegotiation';
import type { PropertyData } from '@/data/propertyNegotiation';

interface VoiceCallLiveProps {
  state: VoiceCallState;
  property: PropertyData;
  bidRange: BidRange;
  onEndCall: () => void;
  onSendCoaching?: (text: string) => void;
  coachingMessages?: { text: string; timestamp: number }[];
  isPhoneCall?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse: boolean }> = {
  connecting: { label: 'Connecting...', color: 'bg-yellow-500', pulse: true },
  ringing: { label: 'Ringing...', color: 'bg-yellow-500', pulse: true },
  in_progress: { label: 'In Progress', color: 'bg-green-500', pulse: true },
  ended: { label: 'Call Ended', color: 'bg-gray-500', pulse: false },
  error: { label: 'Error', color: 'bg-red-500', pulse: false },
};

const VoiceCallLive = ({ state, property, bidRange, onEndCall, onSendCoaching, coachingMessages = [], isPhoneCall = false }: VoiceCallLiveProps) => {
  const statusConfig = STATUS_CONFIG[state.status] || STATUS_CONFIG.connecting;
  const isActive = state.status === 'in_progress';

  // Determine who's speaking based on latest transcript
  const lastEntry = state.transcript[state.transcript.length - 1];
  const isSpeaking = isActive && lastEntry && !lastEntry.isFinal ? lastEntry.role : null;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Status Bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pulse indicator */}
            <div className="relative flex items-center justify-center">
              <div className={`w-3 h-3 rounded-full ${statusConfig.color}`} />
              {statusConfig.pulse && (
                <div className={`absolute w-3 h-3 rounded-full ${statusConfig.color} animate-ping`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{statusConfig.label}</span>
                {state.isDemo && (
                  <Badge variant="secondary" className="text-[10px]">Demo</Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate max-w-[200px]">
                {property.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Clock size={14} />
              <span className="font-mono">{formatTime(state.elapsedSeconds)}</span>
            </div>

            {/* Connection indicator */}
            <Wifi size={14} className={isActive ? 'text-green-500' : 'text-gray-400'} />
          </div>
        </div>
      </Card>

      {/* Main content - Waveform + Transcript */}
      <Card className="p-4">
        <div className="mb-4">
          <AudioWaveform isActive={isActive} isSpeaking={isSpeaking} />
          {isSpeaking && (
            <p className="text-center text-xs text-gray-400 mt-1">
              {isSpeaking === 'assistant' ? 'AI Agent speaking...' : 'Seller speaking...'}
            </p>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-3">
          {isPhoneCall && state.transcript.length === 0 && isActive && (
            <div className="flex flex-col items-center justify-center h-48 text-sm text-gray-400 gap-2">
              <Phone size={20} className="animate-pulse" />
              <span>Phone call in progress</span>
              <span className="text-xs">Transcript will appear as the conversation progresses</span>
            </div>
          )}
          {!(isPhoneCall && state.transcript.length === 0 && isActive) && (
            <VoiceTranscript entries={state.transcript} autoScroll={true} />
          )}
        </div>
      </Card>

      {/* Coaching Panel */}
      {onSendCoaching && state.status !== 'ended' && state.status !== 'error' && (
        <CoachingPanel
          onSend={onSendCoaching}
          disabled={state.status !== 'in_progress'}
          isDemo={state.isDemo}
          messages={coachingMessages}
        />
      )}

      {/* Side info: bid range */}
      <Card className="p-3 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Min: ${bidRange.minOffer.toLocaleString()}</span>
          <span className="font-semibold text-primary">Target: ${bidRange.targetOffer.toLocaleString()}</span>
          <span>Max: ${bidRange.maxOffer.toLocaleString()}</span>
        </div>
      </Card>

      {/* End Call button */}
      {state.status !== 'ended' && state.status !== 'error' && (
        <Button
          onClick={onEndCall}
          variant="destructive"
          size="lg"
          className="w-full gap-2"
        >
          <PhoneOff size={18} />
          End Call
        </Button>
      )}

      {/* Error display */}
      {state.error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </div>
      )}
    </div>
  );
};

export default VoiceCallLive;
