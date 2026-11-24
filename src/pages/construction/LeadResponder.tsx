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
import DemoBreadcrumbs from '@/components/DemoBreadcrumbs';
import RelatedDemos from '@/components/RelatedDemos';
import DataDisclosureChip from '@/components/DataDisclosureChip';
import { useLocation } from 'react-router-dom';
import { DEMO_GROUPS } from '@/data/demoCatalog';
import { INDUSTRY_KEYNOTE } from '@/data/industryKeynote';
import { VERTICALS } from '@/v3/verticals';
import { chatProfileFor, buildChatSystemPrompt } from '@/data/chatProfiles';
import type { FieldConfig } from '@/components/construction/chat/LeadSummaryPanel';
import { User, Tag, Info, Wallet, Clock, MapPin, Phone } from 'lucide-react';
import {
  buildDemoSoftwareApplicationSchema,
  getDemoApplicationByRoute,
} from '@/data/perDemoSoftwareApplications';

// Ticket 0103 - per-demo SoftwareApplication JSON-LD. Row is looked up
// via getDemoApplicationByRoute so no page hardcodes an array index;
// the block's fields all read from the shared constant per the
// 2026-05-25 mirror-source rule.
const DEMO_APP_ROW = getDemoApplicationByRoute('/construction/demo/lead-responder');
const DEMO_APP_SCHEMA = DEMO_APP_ROW ? buildDemoSoftwareApplicationSchema(DEMO_APP_ROW) : null;

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// The same page serves every vertical's chat demo (/dental/demo/intake, /restaurant/demo/reservations,
// ...): the header names the demo and the audience from the route, not construction's.
const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());
function headerFor(pathname: string): { title: string; sub: string } | null {
  const v = VERTICALS.find((x) => pathname.startsWith(x.hub + '/'));
  if (!v || v.key === 'construction') return null;
  const demo = DEMO_GROUPS.flatMap((g) => g.demos).find((d) => d.path === pathname);
  const name = demo?.title ?? 'AI Lead Responder';
  const audience = INDUSTRY_KEYNOTE[v.key]?.audience ?? v.label;
  return { title: `${/^AI\b/.test(name) ? name : `AI ${name}`} for ${titleCase(audience)}`, sub: demo?.description ?? '' };
}

const LeadResponder = () => {
  const location = useLocation();
  const header = headerFor(location.pathname);
  const { company, vertical } = useDemoContext();
  const profile = chatProfileFor(vertical);
  const companyName = company?.companyName || 'DigitalCraft AI';
  const ownerName = company?.ownerName || '';
  const services = company?.services?.length ? company.services : profile.services;

  const systemPrompt = useMemo(
    () => buildChatSystemPrompt(profile, companyName, ownerName, services),
    [profile, companyName, ownerName, services],
  );

  const greeting = useMemo(() => profile.greeting(companyName), [profile, companyName]);
  const fields = useMemo<FieldConfig[]>(() => {
    const icons = { name: <User size={14} />, projectType: <Tag size={14} />, sqft: <Info size={14} />, budget: <Wallet size={14} />, timeline: <Clock size={14} />, address: <MapPin size={14} />, phone: <Phone size={14} /> };
    return (Object.keys(icons) as (keyof typeof icons)[]).map((k) => ({ key: k, label: profile.slots[k], icon: icons[k] }));
  }, [profile]);

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
        <title>{header ? `${header.title} Demo` : 'AI Lead Responder Demo'} | DigitalCraft AI</title>
        <meta name="description" content={header ? `${header.title}: ${header.sub} Try it live, no signup.` : "Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time using GPT-4o."} />
        <meta property="og:title" content="AI Lead Responder Demo | DigitalCraft AI" />
        <meta property="og:description" content="Chat with an AI lead responder that qualifies construction leads, extracts project details, and books consultations in real time." />
        {DEMO_APP_SCHEMA && (
          <script type="application/ld+json">{JSON.stringify(DEMO_APP_SCHEMA)}</script>
        )}
      </Helmet>
      <DemoNavbar />
      <DemoBreadcrumbs />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Header */}
        <div className="relative text-center mb-6 sm:mb-8">
          <DataDisclosureChip demoPath={location.pathname} />
          <Badge variant="secondary" className="mx-1 mb-3 min-h-[28px] align-middle bg-[var(--v3-aurora-wash)] font-medium text-[var(--v3-aurora-deep)] hover:bg-[var(--v3-aurora-wash)]">
            <Sparkles size={13} className="mr-1" aria-hidden /> POC Demo
          </Badge>
          <h1 className="k-demo-title mb-3">{header ? header.title : 'AI Lead Qualification for Construction Companies'}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            {header ? <>{header.sub} Chat with {companyName}&rsquo;s AI and watch it work in real time.</> : <>Play the homeowner. Chat with {companyName}'s AI and watch it qualify leads in real time.</>}
          </p>
        </div>

        {!header && <p className="k-demo-seo">
          This AI lead responder demo shows how construction companies can automate lead qualification using GPT-4o. When a homeowner visits your website and asks about a kitchen remodel, bathroom renovation, or full home project, the AI assistant responds instantly — qualifying the lead by gathering project details, square footage, budget, timeline, and contact information through natural conversation. Instead of losing leads to slow follow-up, your AI responds in under 60 seconds, 24/7. It extracts structured lead data in real time, gives ballpark pricing estimates using your actual rates, and suggests booking a consultation when the prospect is ready. Try it below to see how automated lead follow-up works for contractors, remodelers, and construction businesses looking to convert more website visitors into booked appointments.
        </p>}

        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 min-h-0">
          {/* Chat column */}
          <div className="flex-1 lg:flex-[3] flex flex-col bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden min-h-[60vh] lg:min-h-0">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{companyName}</p>
                <p className="text-xs text-aurora">Online — typically replies instantly</p>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-1">
                    <ClipboardList size={14} /> Details
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[70vh]">
                  <LeadSummaryPanel data={leadData} fieldOverrides={fields} title={profile.panelTitle} cta={profile.cta} />
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
            <LeadSummaryPanel data={leadData} fieldOverrides={fields} title={profile.panelTitle} cta={profile.cta} />
          </div>
        </div>
      </div>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default LeadResponder;
