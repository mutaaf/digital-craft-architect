import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import ChatBubble from '@/components/construction/chat/ChatBubble';
import ChatInput from '@/components/construction/chat/ChatInput';
import LeadSummaryPanel from '@/components/construction/chat/LeadSummaryPanel';
import type { LeadData } from '@/components/construction/chat/LeadSummaryPanel';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sparkles, ClipboardList } from 'lucide-react';
import { streamChat } from '@/utils/openaiChat';
import type { ChatMessage } from '@/utils/openaiChat';

function buildSystemPrompt(companyName: string, ownerName: string, services: string[]): string {
  const serviceLines = services
    .map((s) => `- ${s}`)
    .join('\n');

  return `You are the AI assistant for ${companyName}, a construction and remodeling company led by ${ownerName}. Your job is to qualify incoming leads by having a natural, friendly conversation.

SERVICES OFFERED:
${serviceLines}

PRICING GUIDANCE:
- Kitchen Remodel: $120-250/sqft
- Bathroom Remodel: $150-300/sqft
- Full Home Renovation: $80-180/sqft
- Outdoor/Patio: $60-120/sqft
- General Construction: $80-200/sqft

QUALIFICATION FLOW — gather these naturally through conversation (don't ask all at once):
1. Name
2. Project type (kitchen, bathroom, full home, outdoor, other)
3. Approximate square footage
4. Budget range
5. Timeline (when they want to start)
6. Property address (city/area is fine)
7. Phone number (ask last, once rapport is built)

RULES:
- Be warm, professional, and conversational — like a friendly project manager
- Give helpful ballpark ranges when asked about pricing
- If someone seems ready, suggest booking a free in-home consultation with ${ownerName}
- Keep responses concise (2-4 sentences)
- Always represent ${companyName} positively

LEAD DATA EXTRACTION:
Whenever you learn new info about the lead, append this EXACTLY at the end of your message (the user won't see it):
|||LEAD_DATA|||{"name":"...","projectType":"...","sqft":"...","budget":"...","timeline":"...","address":"...","phone":"..."}
Only include fields you've confirmed. Use null for unknown fields. This must be valid JSON.`;
}

function buildGreeting(companyName: string): string {
  return `Hey there! 👋 Welcome to ${companyName} — your go-to team for quality remodeling and construction.

I'm here to help you figure out if we're the right fit for your project. What are you thinking about — a kitchen remodel, bathroom, something bigger?`;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const LeadResponder = () => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';
  const ownerName = company?.ownerName || 'Ro';
  const services = company?.services || ['Kitchen Remodeling', 'Bathroom Renovation', 'Full Home Renovation', 'Outdoor/Patio', 'General Construction'];

  const systemPrompt = useMemo(
    () => buildSystemPrompt(companyName, ownerName, services),
    [companyName, ownerName, services],
  );

  const greeting = useMemo(() => buildGreeting(companyName), [companyName]);

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: greeting },
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Reset messages when company changes
  useEffect(() => {
    setMessages([{ role: 'assistant', content: greeting }]);
    setLeadData({});
  }, [greeting]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const parseLeadData = (text: string): { clean: string; data: Partial<LeadData> | null } => {
    const marker = '|||LEAD_DATA|||';
    const idx = text.indexOf(marker);
    if (idx === -1) return { clean: text, data: null };
    const clean = text.slice(0, idx).trim();
    try {
      const json = JSON.parse(text.slice(idx + marker.length));
      const data: Partial<LeadData> = {};
      if (json.name) data.name = json.name;
      if (json.projectType) data.projectType = json.projectType;
      if (json.sqft) data.sqft = json.sqft;
      if (json.budget) data.budget = json.budget;
      if (json.timeline) data.timeline = json.timeline;
      if (json.address) data.address = json.address;
      if (json.phone) data.phone = json.phone;
      return { clean, data };
    } catch {
      return { clean, data: null };
    }
  };

  const handleSend = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    const chatMessages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: text },
    ];

    const assistantMsg: Message = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      abortRef.current = new AbortController();
      const full = await streamChat(
        chatMessages,
        (chunk) => {
          assistantMsg.content += chunk;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...assistantMsg };
            return next;
          });
          scrollToBottom();
        },
        abortRef.current.signal
      );

      const { clean, data } = parseLeadData(full);
      if (data) {
        setLeadData((prev) => ({ ...prev, ...data }));
      }
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { role: 'assistant', content: clean };
        return next;
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: 'assistant',
            content: "Sorry, I'm having a connection issue. Could you try again?",
          };
          return next;
        });
      }
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Helmet>
        <title>AI Lead Responder Demo | DigitalCraft AI</title>
        <meta name="description" content="Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time using GPT-4o." />
        <meta property="og:title" content="AI Lead Responder Demo | DigitalCraft AI" />
        <meta property="og:description" content="Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time." />
      </Helmet>
      <DemoNavbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Lead Qualification for Construction Companies</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Play the homeowner — chat with {companyName}'s AI and watch it qualify leads in real time.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center mb-6">
          This AI lead responder demo shows how construction companies can automate lead qualification using GPT-4o. When a homeowner visits your website and asks about a kitchen remodel, bathroom renovation, or full home project, the AI assistant responds instantly — qualifying the lead by gathering project details, square footage, budget, timeline, and contact information through natural conversation. Instead of losing leads to slow follow-up, your AI responds in under 60 seconds, 24/7. It extracts structured lead data in real time, gives ballpark pricing estimates using your actual rates, and suggests booking a consultation when the prospect is ready. Try it below to see how automated lead follow-up works for contractors, remodelers, and construction businesses looking to convert more website visitors into booked appointments.
        </p>

        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
          {/* Chat column */}
          <div className="flex-1 lg:flex-[3] flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[60vh] lg:min-h-0">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{companyName}</p>
                <p className="text-xs text-green-500">Online — typically replies instantly</p>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-1">
                    <ClipboardList size={14} /> Lead Info
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh]">
                  <LeadSummaryPanel data={leadData} />
                </SheetContent>
              </Sheet>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <ChatBubble
                    key={i}
                    role={m.role}
                    content={m.content}
                    isStreaming={isStreaming && i === messages.length - 1 && m.role === 'assistant'}
                  />
                ))}
                {isStreaming && messages[messages.length - 1]?.content === '' && (
                  <div className="flex items-center gap-2 pl-11">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-400">Typing...</span>
                  </div>
                )}
              </div>
            </ScrollArea>

            <ChatInput onSend={handleSend} disabled={isStreaming} companyName={companyName} />
          </div>

          {/* Lead panel — desktop only */}
          <div className="hidden lg:flex lg:flex-[2]">
            <LeadSummaryPanel data={leadData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadResponder;
