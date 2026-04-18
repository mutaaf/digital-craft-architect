import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import ChatBubble from '@/components/construction/chat/ChatBubble';
import ChatInput from '@/components/construction/chat/ChatInput';
import LeadSummaryPanel from '@/components/construction/chat/LeadSummaryPanel';
import type { LeadData, FieldConfig } from '@/components/construction/chat/LeadSummaryPanel';
import { useDemoContext } from '@/contexts/DemoContext';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sparkles, ClipboardList, User, PartyPopper, Users, DollarSign, Calendar, MapPin, Phone as PhoneIcon } from 'lucide-react';
import { streamChat } from '@/utils/openaiChat';
import type { ChatMessage } from '@/utils/openaiChat';

function buildSystemPrompt(companyName: string, ownerName: string, services: string[]): string {
  const serviceLines = services
    .map((s) => `- ${s}`)
    .join('\n');

  return `You are the AI assistant for ${companyName}, an event services company led by ${ownerName}. Your job is to qualify incoming inquiries by having a natural, friendly conversation.

SERVICES OFFERED:
${serviceLines}

EVENT TYPES WE HANDLE:
- Weddings (ceremonies, receptions, rehearsal dinners)
- Birthday parties (kids, milestone, surprise)
- Corporate events (galas, conferences, team building, holiday parties)
- Quinceañeras and Sweet 16s
- Baby showers, bridal showers, engagement parties
- Any custom celebration

QUALIFICATION FLOW — gather these naturally through conversation (don't ask all at once):
1. Name
2. Event type (wedding, birthday, corporate, quinceañera, other)
3. Event date (or approximate timeframe)
4. Venue type (indoor, outdoor, TBD)
5. Guest count (approximate)
6. Budget range
7. Style/theme preferences
8. Specific services needed
9. Phone number (ask last, once rapport is built)

RULES:
- Be warm, enthusiastic, and conversational — this is an exciting event for them!
- Adapt your tone to the event type: elegant for weddings, fun for birthdays, professional for corporate
- Give helpful guidance when asked about services or pricing
- If someone seems ready, suggest booking a free consultation with ${ownerName}
- Keep responses concise (2-4 sentences)
- Always represent ${companyName} positively
- Handle any event type gracefully, even unusual ones

LEAD DATA EXTRACTION:
Whenever you learn new info about the lead, append this EXACTLY at the end of your message (the user won't see it):
|||LEAD_DATA|||{"name":"...","eventType":"...","eventDate":"...","guestCount":"...","budget":"...","venue":"...","style":"...","services":"...","phone":"..."}
Only include fields you've confirmed. Use null for unknown fields. This must be valid JSON.`;
}

function buildGreeting(companyName: string): string {
  return `Hi there! 🎉 Welcome to ${companyName} — we'd love to help make your event unforgettable!

I'm here to learn about what you're planning so we can see how we can help. What type of event are you thinking about — a wedding, birthday, corporate event, or something else?`;
}

const EVENT_FIELDS: FieldConfig[] = [
  { key: 'name', label: 'Name', icon: <User size={14} /> },
  { key: 'projectType', label: 'Event Type', icon: <PartyPopper size={14} /> },
  { key: 'timeline', label: 'Event Date', icon: <Calendar size={14} /> },
  { key: 'sqft', label: 'Guest Count', icon: <Users size={14} /> },
  { key: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
  { key: 'address', label: 'Venue', icon: <MapPin size={14} /> },
  { key: 'phone', label: 'Phone', icon: <PhoneIcon size={14} /> },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const InquiryQualifier = () => {
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';
  const ownerName = company?.ownerName || 'Ro';
  const services = company?.services || ['DJ / Entertainment', 'Catering / Food Cart', 'Decoration / Florals', 'Photography / Video', 'Full Planning / Coordination', 'Venue Styling'];

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
      if (json.eventType) data.projectType = json.eventType;
      if (json.eventDate) data.timeline = json.eventDate;
      if (json.guestCount) data.sqft = json.guestCount;
      if (json.budget) data.budget = json.budget;
      if (json.venue) data.address = json.venue;
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
        <title>AI Inquiry Qualifier Demo | DigitalCraft AI</title>
        <meta name="description" content="Chat with an AI that qualifies event leads by event type, date, guest count, budget, and style, then auto-books consultations." />
        <meta property="og:title" content="AI Inquiry Qualifier Demo | DigitalCraft AI" />
        <meta property="og:description" content="AI-powered event inquiry qualification that captures lead details and books consultations automatically." />
      </Helmet>
      <DemoNavbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Event Inquiry Qualifier</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Play the client — chat with {companyName}'s AI and watch it qualify event inquiries in real time.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center mb-6">
          This AI inquiry qualifier demo shows how event planning companies automate lead qualification for weddings, corporate events, and private parties. When a prospect reaches out asking about availability, pricing, or packages, the AI assistant responds instantly — gathering event date, guest count, venue preferences, budget range, and special requirements through natural conversation. For event planners, DJs, caterers, photographers, and venue owners, this means no more lost leads from slow email responses. The AI qualifies inquiries 24/7, extracts structured booking data in real time, and suggests scheduling a consultation when the client is ready. Try the event automation demo below to see how AI-powered inquiry qualification helps event professionals book more clients while spending less time on initial screening.
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
                  <LeadSummaryPanel data={leadData} fieldOverrides={EVENT_FIELDS} />
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
            <LeadSummaryPanel data={leadData} fieldOverrides={EVENT_FIELDS} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryQualifier;
