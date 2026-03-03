import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, ChevronDown, ChevronUp, Trash2, Phone } from 'lucide-react';
import VoiceTranscript from './VoiceTranscript';
import type { StoredConversation } from '@/utils/conversationStore';
import { getConversations, deleteConversation } from '@/utils/conversationStore';

const SENTIMENT_COLORS: Record<string, string> = {
  positive: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  neutral: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  negative: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

interface ConversationHistoryProps {
  onCallAgain?: (conversation: StoredConversation) => void;
}

const ConversationHistory = ({ onCallAgain }: ConversationHistoryProps) => {
  const [conversations, setConversations] = useState<StoredConversation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setConversations(getConversations());
  }, []);

  const handleDelete = (id: string) => {
    deleteConversation(id);
    setConversations(getConversations());
    if (expandedId === id) setExpandedId(null);
  };

  if (conversations.length === 0) {
    return (
      <Card className="p-6 text-center text-gray-400 dark:text-gray-500">
        <History size={24} className="mx-auto mb-2 opacity-50" />
        <p className="text-sm">No past conversations yet</p>
        <p className="text-xs mt-1">Completed calls will appear here.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-2">
        <History size={14} /> Past Conversations
      </h3>

      {conversations.map((conv) => {
        const isExpanded = expandedId === conv.id;
        const date = new Date(conv.timestamp);

        return (
          <Card key={conv.id} className="overflow-hidden">
            {/* Summary row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : conv.id)}
              className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium truncate">
                      {conv.propertyAddress}
                    </span>
                    {conv.isDemo && (
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        Demo
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>Ask: ${conv.askingPrice.toLocaleString()}</span>
                    {conv.summary.agreedPrice && (
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Agreed: ${conv.summary.agreedPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-[10px] ${SENTIMENT_COLORS[conv.summary.overallSentiment] || ''}`}>
                    {conv.summary.overallSentiment}
                  </Badge>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
            </button>

            {/* Expanded details */}
            {isExpanded && (
              <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-4 animate-fade-in">
                {/* Summary fields */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-400 block mb-0.5">Seller Position</span>
                    <span>{conv.summary.sellerPosition}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Timeline</span>
                    <span>{conv.summary.sellerTimeline}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Motivation</span>
                    <span>{conv.summary.sellerMotivation}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-0.5">Duration</span>
                    <span>{Math.floor(conv.summary.callDurationSeconds / 60)}m {conv.summary.callDurationSeconds % 60}s</span>
                  </div>
                </div>

                {/* Key insights */}
                {conv.summary.keyInsights.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Key Insights</span>
                    <ul className="text-xs space-y-1">
                      {conv.summary.keyInsights.map((insight, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-primary shrink-0">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Next steps */}
                {conv.summary.recommendedNextSteps.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-400 block mb-1">Next Steps</span>
                    <ul className="text-xs space-y-1">
                      {conv.summary.recommendedNextSteps.map((step, i) => (
                        <li key={i} className="flex gap-1.5">
                          <span className="text-green-500 shrink-0">→</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Transcript */}
                <details className="group">
                  <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    View full transcript ({conv.transcript.filter((e) => e.isFinal).length} messages)
                  </summary>
                  <div className="mt-2 max-h-64 overflow-y-auto">
                    <VoiceTranscript entries={conv.transcript.filter((e) => e.isFinal)} autoScroll={false} />
                  </div>
                </details>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2">
                  {onCallAgain && conv.property && conv.report && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onCallAgain(conv)}
                      className="gap-1.5 text-xs"
                    >
                      <Phone size={12} /> Call Again
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(conv.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 gap-1.5 text-xs"
                  >
                    <Trash2 size={12} /> Delete
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default ConversationHistory;
