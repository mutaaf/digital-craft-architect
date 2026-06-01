import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { streamChat } from '@/utils/openaiChat';
import {
  MessageCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Loader2,
  Clock,
} from 'lucide-react';

interface SMS {
  day: string;
  time: string;
  message: string;
}

const SMSSequence = () => {
  const location = useLocation();
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';

  const [leadName, setLeadName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [leadSource, setLeadSource] = useState('Website form');
  const [messages, setMessages] = useState<SMS[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setIsGenerating(true);
    setMessages([]);
    setGenerated(true);

    const prompt = `Generate a 5-message SMS nurture sequence for a construction lead with these details:
- Lead name: ${leadName}
- Project type: ${projectType}
- Lead source: ${leadSource}
- Company name: ${companyName}

Return ONLY a JSON array of 5 objects with fields: "day" (e.g. "Day 0", "Day 1"), "time" (e.g. "Immediately", "10:00 AM"), "message" (the actual SMS text, under 160 chars each).

Make messages natural, conversational, and progressively more persuasive. First message is an immediate response. Space them: Day 0, Day 1, Day 3, Day 5, Day 7. Include the lead's name. Last message should create gentle urgency.`;

    let raw = '';
    try {
      await streamChat(
        [{ role: 'system', content: 'You are a construction marketing AI. Return only valid JSON arrays, no markdown.' },
         { role: 'user', content: prompt }],
        (chunk) => { raw += chunk; },
      );
      const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed: SMS[] = JSON.parse(cleaned);
      setMessages(parsed);
    } catch {
      setMessages([
        { day: 'Day 0', time: 'Immediately', message: `Hi ${leadName}! Thanks for reaching out to ${companyName} about your ${projectType} project. When's a good time to chat?` },
        { day: 'Day 1', time: '10:00 AM', message: `Hey ${leadName}, just following up on your ${projectType} inquiry. We'd love to schedule a quick call to discuss your project. Reply YES and I'll send some times.` },
        { day: 'Day 3', time: '2:00 PM', message: `${leadName}, we've helped dozens of homeowners with similar ${projectType} projects. Would a free estimate be helpful? No obligation.` },
        { day: 'Day 5', time: '11:00 AM', message: `Quick check-in, ${leadName} — still thinking about your ${projectType} project? We have availability opening up next week and can lock in current pricing.` },
        { day: 'Day 7', time: '9:00 AM', message: `Last note, ${leadName}: our schedule is filling up fast this month. If you're still interested in the ${projectType} work, reply and we'll get you on the calendar before spots close.` },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setLeadName('');
    setProjectType('');
    setLeadSource('Website form');
    setMessages([]);
    setGenerated(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI SMS Sequence Demo | {companyName} | DigitalCraft AI</title>
        <meta name="description" content="Generate a 5-message SMS nurture sequence for construction leads. See AI-powered follow-up messaging in action." />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-10">
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> AI SMS Tool
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            SMS Nurture Sequence Generator
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Enter a lead's details and get a 5-message SMS drip sequence with optimal timing.
          </p>
        </div>

        {!generated ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lead Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Name *</label>
              <Input value={leadName} onChange={(e) => setLeadName(e.target.value)} placeholder="Mike Johnson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Type *</label>
              <Input value={projectType} onChange={(e) => setProjectType(e.target.value)} placeholder="Kitchen remodel, deck build, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lead Source</label>
              <Input value={leadSource} onChange={(e) => setLeadSource(e.target.value)} placeholder="Website form, Google, referral..." />
            </div>
            <Button onClick={generate} disabled={leadName.length < 2 || projectType.length < 2} className="w-full mt-2">
              <MessageCircle size={16} className="mr-2" /> Generate SMS Sequence
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-4">
            {isGenerating && messages.length === 0 && (
              <div className="flex items-center justify-center gap-3 py-12 text-primary">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Crafting your SMS sequence...</span>
              </div>
            )}

            {/* iPhone-style SMS bubbles */}
            <div className="space-y-5">
              {messages.map((sms, idx) => (
                <div key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                  {/* Timing badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-gray-400" />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {sms.day} · {sms.time}
                    </span>
                  </div>
                  {/* SMS bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] bg-primary text-white rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed shadow-sm">
                      {sms.message}
                    </div>
                  </div>
                  <p className="text-right text-[10px] text-gray-400 mt-1">
                    {sms.message.length} chars
                  </p>
                </div>
              ))}
            </div>

            {!isGenerating && messages.length > 0 && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={reset}>
                  <RotateCcw size={16} className="mr-2" /> Generate Another
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default SMSSequence;
