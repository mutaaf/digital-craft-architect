import { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TranscriptEntry } from '@/data/voiceNegotiation';

interface VoiceTranscriptProps {
  entries: TranscriptEntry[];
  autoScroll?: boolean;
}

const VoiceTranscript = ({ entries, autoScroll = true }: VoiceTranscriptProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries, autoScroll]);

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-gray-400">
        Waiting for conversation to begin...
      </div>
    );
  }

  // Deduplicate: only show the latest entry per consecutive role+final group
  const displayed: TranscriptEntry[] = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const next = entries[i + 1];
    // Skip interim if the next entry is the same role (it'll replace this one)
    if (!entry.isFinal && next && next.role === entry.role) continue;
    displayed.push(entry);
  }

  return (
    <ScrollArea className="h-[320px] pr-2">
      <div className="space-y-3 p-1">
        {displayed.map((entry, i) => {
          const isAssistant = entry.role === 'assistant';
          return (
            <div
              key={`${entry.timestamp}-${i}`}
              className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  isAssistant
                    ? 'bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900'
                    : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                } ${!entry.isFinal ? 'italic opacity-70' : ''}`}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wide block mb-0.5 ${
                  isAssistant ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {isAssistant ? 'AI Agent' : 'Seller'}
                </span>
                <p className="leading-relaxed">{entry.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default VoiceTranscript;
