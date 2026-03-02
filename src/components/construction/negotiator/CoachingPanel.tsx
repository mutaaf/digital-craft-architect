import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, ChevronDown, ChevronUp } from 'lucide-react';

interface CoachingMessage {
  text: string;
  timestamp: number;
}

interface CoachingPanelProps {
  onSend: (text: string) => void;
  disabled: boolean;
  isDemo: boolean;
  messages?: CoachingMessage[];
}

const QUICK_ACTIONS = [
  'Lower price',
  'Be firmer',
  'Emphasize fast close',
  'Ask about timeline',
  'Build rapport',
  'Wrap up call',
];

const CoachingPanel = ({ onSend, disabled, isDemo, messages = [] }: CoachingPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [customText, setCustomText] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setCustomText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(customText);
    }
  };

  return (
    <Card className="p-3 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
          Coach the AI
        </span>
        {isOpen ? (
          <ChevronUp size={14} className="text-blue-500" />
        ) : (
          <ChevronDown size={14} className="text-blue-500" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3">
          {isDemo && (
            <p className="text-[11px] text-gray-400 italic">
              (Demo mode — coaching has no effect)
            </p>
          )}

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                onClick={() => handleSend(action)}
                disabled={disabled}
                className="text-xs px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {action}
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Custom instruction..."
              disabled={disabled}
              className="flex-1 text-xs px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleSend(customText)}
              disabled={disabled || !customText.trim()}
              className="h-7 w-7 p-0"
            >
              <Send size={12} />
            </Button>
          </div>

          {/* Sent messages */}
          {messages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-blue-100 dark:border-blue-900">
              {messages.map((msg, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}{' '}
                  — {msg.text}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default CoachingPanel;
