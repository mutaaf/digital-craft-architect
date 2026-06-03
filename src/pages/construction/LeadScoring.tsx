import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import DataDisclosureChip from '@/components/DataDisclosureChip';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { streamChat } from '@/utils/openaiChat';
import {
  Gauge,
  RotateCcw,
  Sparkles,
  Loader2,
  DollarSign,
  Clock,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';

type Rating = 'Strong' | 'Moderate' | 'Weak';

interface Factor {
  label: string;
  rating: Rating;
  note: string;
}

interface ScoreResult {
  score: number;
  tier: string;
  factors: Factor[];
  summary: string;
  recommendedAction: string;
}

const SAMPLE_LEAD = `Name: Mike Johnson
Phone: (972) 555-0142
Email: mike.j@gmail.com
Project: Full kitchen remodel, ~250 sq ft
Budget: "Looking to spend $40k-$55k"
Timeline: "Want to start within 3 weeks, our old kitchen flooded"
Notes: Homeowner, says he and his wife make decisions together. Already got one other quote. Found us on Google.`;

const FACTOR_META: Record<string, { icon: JSX.Element; color: string }> = {
  'Budget Fit': { icon: <DollarSign size={18} />, color: 'text-green-600 dark:text-green-400' },
  'Urgency Signals': { icon: <Clock size={18} />, color: 'text-orange-600 dark:text-orange-400' },
  'Decision-Maker Status': { icon: <UserCheck size={18} />, color: 'text-blue-600 dark:text-blue-400' },
};

const ratingClasses: Record<Rating, string> = {
  Strong: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Moderate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Weak: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const LeadScoring = () => {
  const location = useLocation();
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';

  const [leadInfo, setLeadInfo] = useState('');
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const score = async () => {
    setIsGenerating(true);
    setResult(null);
    setGenerated(true);

    const prompt = `You are an AI lead-scoring engine for ${companyName}, a construction company. Score this inbound lead from 1 to 100 based on how likely it is to convert into a paying project. Higher is better.

LEAD INFO:
${leadInfo}

Evaluate three factors: "Budget Fit" (does their budget match a real construction project?), "Urgency Signals" (how soon do they need work done?), and "Decision-Maker Status" (are they the person who can say yes?).

Return ONLY a JSON object with these exact fields:
{
  "score": <integer 1-100>,
  "tier": "<Hot Lead | Warm Lead | Cold Lead>",
  "factors": [
    {"label": "Budget Fit", "rating": "<Strong | Moderate | Weak>", "note": "<one sentence>"},
    {"label": "Urgency Signals", "rating": "<Strong | Moderate | Weak>", "note": "<one sentence>"},
    {"label": "Decision-Maker Status", "rating": "<Strong | Moderate | Weak>", "note": "<one sentence>"}
  ],
  "summary": "<one to two sentences explaining the score>",
  "recommendedAction": "<one sentence next step for the sales team>"
}`;

    let raw = '';
    try {
      await streamChat(
        [
          { role: 'system', content: 'You are a construction sales AI. Return only valid JSON, no markdown.' },
          { role: 'user', content: prompt },
        ],
        (chunk) => {
          raw += chunk;
        },
      );
      const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
      const parsed: ScoreResult = JSON.parse(cleaned);
      setResult(parsed);
    } catch {
      setResult({
        score: 82,
        tier: 'Hot Lead',
        factors: [
          { label: 'Budget Fit', rating: 'Strong', note: 'Stated $40k to $55k budget aligns with a full kitchen remodel.' },
          { label: 'Urgency Signals', rating: 'Strong', note: 'Wants to start within 3 weeks due to flood damage, a high-motivation signal.' },
          { label: 'Decision-Maker Status', rating: 'Moderate', note: 'Homeowner, but decisions are shared with spouse, so loop both in.' },
        ],
        summary: 'A motivated homeowner with a realistic budget and a near-term deadline. Competing against one other quote, so speed and trust matter.',
        recommendedAction: 'Call within the hour and offer an on-site estimate this week before the competitor closes.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setLeadInfo('');
    setResult(null);
    setGenerated(false);
  };

  const scoreColor = (s: number) =>
    s >= 70
      ? 'text-green-600 dark:text-green-400'
      : s >= 40
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Lead Scoring Demo | {companyName} | DigitalCraft AI</title>
        <meta
          name="description"
          content="Paste a lead from a form submission and watch AI score it 1 to 100 with reasoning on budget fit, urgency, and decision-maker status. Live demo for construction companies."
        />
      </Helmet>
      <DemoNavbar />

      <div className="relative max-w-2xl mx-auto px-4 py-8 sm:py-10">
        <DataDisclosureChip demoPath={location.pathname} />
        <div className="text-center mb-6 animate-fade-in">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> AI Lead Scoring
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            AI Lead Scoring for Construction Companies
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Paste a lead from a form, email, or voicemail and get an instant 1 to 100 priority score with
            the reasoning behind it, so your team calls the hottest leads first.
          </p>
        </div>

        {/* SEO / context intro */}
        <section className="mb-8 bg-white dark:bg-gray-900 rounded-xl p-5 sm:p-6 border border-gray-200 dark:border-gray-800 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <p>
            Not every lead deserves the same response. This AI lead scoring demo reads a raw inbound
            inquiry the way an experienced estimator would and grades it across three signals that
            actually predict revenue: <strong>budget fit</strong>, <strong>urgency</strong>, and
            whether you are talking to the real <strong>decision-maker</strong>. In seconds you get a
            priority score, a tier, and a recommended next step. That is the difference between chasing
            tire-kickers and closing the homeowner who is ready to start next week.
          </p>
        </section>

        {!generated ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <label
                htmlFor="lead-info"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Paste lead info
              </label>
              <button
                type="button"
                onClick={() => setLeadInfo(SAMPLE_LEAD)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Use sample lead
              </button>
            </div>
            <Textarea
              id="lead-info"
              value={leadInfo}
              onChange={(e) => setLeadInfo(e.target.value)}
              placeholder="Paste the lead's name, contact info, project details, budget, timeline, and any notes from the form submission..."
              className="min-h-[180px] resize-y"
            />
            <Button onClick={score} disabled={leadInfo.trim().length < 15} className="w-full">
              <Gauge size={16} className="mr-2" /> Score This Lead
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in space-y-5">
            {isGenerating && !result && (
              <div className="flex items-center justify-center gap-3 py-12 text-primary">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm font-medium">Scoring your lead...</span>
              </div>
            )}

            {result && (
              <>
                {/* Score header */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-bold ${scoreColor(result.score)}`}>
                      {result.score}
                    </span>
                    <span className="text-lg text-gray-400 dark:text-gray-500">/100</span>
                  </div>
                  <Badge className="mt-2" variant="secondary">
                    {result.tier}
                  </Badge>
                  <Progress value={result.score} className="mt-4 h-2" />
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{result.summary}</p>
                </div>

                {/* Factor breakdown */}
                <div className="space-y-3">
                  {result.factors.map((f, idx) => {
                    const meta = FACTOR_META[f.label] || {
                      icon: <Sparkles size={18} />,
                      color: 'text-primary',
                    };
                    return (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 animate-fade-in"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className={meta.color}>{meta.icon}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {f.label}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ratingClasses[f.rating] || ratingClasses.Moderate}`}
                          >
                            {f.rating}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{f.note}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Recommended action */}
                <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-5 border border-primary/20">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                    Recommended next step
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.recommendedAction}</p>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw size={16} className="mr-2" /> Score Another Lead
                  </Button>
                  <Button asChild>
                    <a
                      href="https://calendly.com/mutaaf"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackCTAClick('book_a_call', 'lead_scoring_demo')}
                    >
                      Automate Lead Scoring <ArrowRight size={16} className="ml-2" />
                    </a>
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default LeadScoring;
