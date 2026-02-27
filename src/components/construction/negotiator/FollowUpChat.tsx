import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatBubble from '@/components/construction/chat/ChatBubble';
import ChatInput from '@/components/construction/chat/ChatInput';
import { streamChat, type ChatMessage } from '@/utils/openaiChat';
import type { AgentResult } from '@/data/propertyNegotiation';

interface FollowUpChatProps {
  agentResult: AgentResult;
  companyName?: string;
  defaultExpanded?: boolean;
}

interface UIMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildSystemPrompt(result: AgentResult, companyName: string): string {
  const { property, report, comps, sellerMessages } = result;

  const compsSummary = comps.length > 0
    ? `\n\nCOMPARABLE SALES (${comps.length} comps):\n${comps.map((c, i) =>
        `${i + 1}. ${c.address} — $${c.salePrice.toLocaleString()}${c.pricePerSqft ? ` ($${c.pricePerSqft}/sqft)` : ''}${c.pricePerAcre ? ` ($${c.pricePerAcre?.toLocaleString()}/acre)` : ''} — ${c.distanceMiles}mi — ${c.notes}`
      ).join('\n')}`
    : '';

  const msgsSummary = sellerMessages.length > 0
    ? `\n\nGENERATED SELLER MESSAGES:\n${sellerMessages.map((m) =>
        `[${m.format.toUpperCase()} - ${m.type}] ${m.body.slice(0, 100)}...`
      ).join('\n')}`
    : '';

  return `You are a real estate investment analyst for ${companyName}. You have just completed a full deal analysis including comparable sales and seller outreach messages. Answer follow-up questions about any aspect of the deal.

PROPERTY DATA:
${JSON.stringify(property, null, 2)}

NEGOTIATION REPORT:
${JSON.stringify(report, null, 2)}${compsSummary}${msgsSummary}

Guidelines:
- Be concise and specific with dollar amounts
- Reference the comps data when discussing pricing
- If asked about counter-offers, adjust the strategy accordingly
- You can help refine seller messages or draft new ones
- Stay focused on this specific deal
- Use a professional but conversational tone`;
}

const GREETING = "I've completed the full analysis — comps, strategy, and seller messages are ready. What would you like to dig into?";

const FollowUpChat = ({ agentResult, companyName, defaultExpanded = true }: FollowUpChatProps) => {
  const brand = companyName || 'DigitalCraft AI';
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [messages, setMessages] = useState<UIMessage[]>([
    { role: 'assistant', content: GREETING },
  ]);
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const userMsg: UIMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const systemMsg: ChatMessage = {
      role: 'system',
      content: buildSystemPrompt(agentResult, brand),
    };

    const history: ChatMessage[] = [
      systemMsg,
      ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatMessage),
      { role: 'user', content: text },
    ];

    let assistant = '';
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      abortRef.current = new AbortController();
      await streamChat(
        history,
        (chunk) => {
          assistant += chunk;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: assistant };
            return next;
          });
        },
        abortRef.current.signal,
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
          };
          return next;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <Card className="overflow-hidden animate-fade-in print:hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <MessageCircle size={16} className="text-primary" />
          Have questions about this deal?
        </span>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <ScrollArea className="h-[320px] p-4">
            <div className="space-y-4">
              {messages.map((m, i) => (
                <ChatBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  isStreaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
          <div className="border-t border-gray-200 dark:border-gray-800 p-3">
            <ChatInput
              onSend={handleSend}
              disabled={streaming}
              placeholder="Ask about comps, strategy, messages..."
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default FollowUpChat;
