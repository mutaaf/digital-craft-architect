import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackCTAClick, trackFormSubmission } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import { submitLead } from '@/utils/submitLead';
import { useContent } from '@/hooks/useContent';
import { streamChat } from '@/utils/openaiChat';
import { setQuizPersona } from '@/utils/quizPersonaStore';
import { decodeQuizTierParam, encodeQuizTierParam } from './quizTierShareParams';
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  Zap,
  Rocket,
  Sparkles,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
  Copy,
  Check,
} from 'lucide-react';

interface QuizOption { label: string; value: string; points: number }
interface QuizQuestion { id: string; question: string; options: QuizOption[] }

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'business_type',
    question: 'What type of business do you run?',
    options: [
      { label: 'Construction', value: 'construction', points: 0 },
      { label: 'Real Estate', value: 'realestate', points: 0 },
      { label: 'Home Services (HVAC, Plumbing)', value: 'homeservices', points: 0 },
      { label: 'Healthcare / Medical Practice', value: 'healthcare', points: 0 },
      { label: 'Legal / Law Firm', value: 'legal', points: 0 },
      { label: 'Restaurant / Food Service', value: 'restaurant', points: 0 },
      { label: 'Fitness / Gym', value: 'fitness', points: 0 },
      { label: 'Dental / Orthodontics', value: 'dental', points: 0 },
      { label: 'Salon / Spa', value: 'salon', points: 0 },
      { label: 'Auto Repair', value: 'autorepair', points: 0 },
      { label: 'Events / Entertainment', value: 'events', points: 0 },
      { label: 'Other', value: 'other', points: 0 },
    ],
  },
  {
    id: 'lead_volume',
    question: 'How many new leads or inquiries do you get per month?',
    options: [
      { label: 'Fewer than 10', value: '<10', points: 1 },
      { label: '10–50', value: '10-50', points: 2 },
      { label: '50–100', value: '50-100', points: 3 },
      { label: 'More than 100', value: '100+', points: 3 },
    ],
  },
  {
    id: 'current_tools',
    question: 'What tools do you currently use to manage leads?',
    options: [
      { label: 'Pen & paper / spreadsheets', value: 'manual', points: 1 },
      { label: 'Basic CRM (HubSpot free, Zoho, etc.)', value: 'basic_crm', points: 2 },
      { label: 'Advanced CRM with automations', value: 'advanced_crm', points: 3 },
      { label: 'Custom-built system', value: 'custom', points: 3 },
    ],
  },
  {
    id: 'response_time',
    question: 'How quickly do you typically respond to a new lead?',
    options: [
      { label: 'Under 1 hour', value: '<1h', points: 1 },
      { label: '1–4 hours', value: '1-4h', points: 2 },
      { label: '4–24 hours', value: '4-24h', points: 3 },
      { label: 'More than 24 hours', value: '24h+', points: 3 },
    ],
  },
  {
    id: 'team_size',
    question: 'How large is your team?',
    options: [
      { label: 'Just me', value: '1', points: 1 },
      { label: '2–10 people', value: '2-10', points: 2 },
      { label: '11–50 people', value: '11-50', points: 3 },
      { label: '50+ people', value: '50+', points: 3 },
    ],
  },
  {
    id: 'pain_point',
    question: 'What is your biggest operational challenge?',
    options: [
      { label: 'Responding to leads fast enough', value: 'lead_response', points: 0 },
      { label: 'Creating estimates or proposals', value: 'estimates', points: 0 },
      { label: 'Following up with past clients', value: 'followup', points: 0 },
      { label: 'Managing online reviews', value: 'reviews', points: 0 },
      { label: 'Scheduling and coordination', value: 'scheduling', points: 0 },
    ],
  },
  {
    id: 'budget',
    question: 'What monthly budget could you invest in AI tools?',
    options: [
      { label: 'Under $500/month', value: '<500', points: 1 },
      { label: '$500–$1,500/month', value: '500-1500', points: 2 },
      { label: '$1,500–$5,000/month', value: '1500-5000', points: 3 },
      { label: '$5,000+/month', value: '5000+', points: 3 },
    ],
  },
];

const VERTICAL_DEMOS: Record<string, { label: string; path: string }> = {
  construction: { label: 'Construction AI Demos', path: '/construction/demo' },
  realestate: { label: 'Real Estate AI Demos', path: '/realestate/demo' },
  homeservices: { label: 'Home Services AI Demos', path: '/homeservices/demo' },
  healthcare: { label: 'Healthcare AI Demos', path: '/healthcare/demo' },
  legal: { label: 'Legal AI Demos', path: '/legal/demo' },
  restaurant: { label: 'Restaurant AI Demos', path: '/restaurant/demo' },
  fitness: { label: 'Fitness AI Demos', path: '/fitness/demo' },
  dental: { label: 'Dental AI Demos', path: '/dental/demo' },
  salon: { label: 'Salon & Spa AI Demos', path: '/salon/demo' },
  autorepair: { label: 'Auto Repair AI Demos', path: '/autorepair/demo' },
  events: { label: 'Events AI Demos', path: '/events/demo' },
  other: { label: 'All Industry Demos', path: '/industries' },
};

// Ticket 0052 - exported so quizTierShareParams can `import type { Tier }`.
export type Tier = 'getting_started' | 'ready' | 'advanced';

const TIERS: Record<Tier, { label: string; color: string; icon: React.ElementType; description: string }> = {
  getting_started: {
    label: 'Getting Started',
    color: 'text-amber-600 dark:text-amber-400',
    icon: Brain,
    description: 'You have clear opportunities to benefit from AI automation. Start with one key workflow - like lead response - and build from there.',
  },
  ready: {
    label: 'Ready for AI',
    color: 'text-blue-600 dark:text-blue-400',
    icon: Zap,
    description: 'Your business is well-positioned for AI automation. You have the volume and infrastructure to see fast ROI.',
  },
  advanced: {
    label: 'Advanced - Ready to Scale',
    color: 'text-green-600 dark:text-green-400',
    icon: Rocket,
    description: 'You\'re primed for enterprise-grade AI. Consider a full-stack automation suite covering lead capture, estimates, follow-up, and voice AI.',
  },
};

function computeTier(answers: Record<string, string>): Tier {
  let score = 0;
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    if (opt) score += opt.points;
  }
  if (score >= 12) return 'advanced';
  if (score >= 8) return 'ready';
  return 'getting_started';
}

function computeScore(answers: Record<string, string>): { total: number; max: number } {
  let score = 0;
  let max = 0;
  for (const q of QUESTIONS) {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    const topPoints = Math.max(...q.options.map((o) => o.points));
    if (topPoints > 0) {
      max += topPoints;
      if (opt) score += opt.points;
    }
  }
  return { total: score, max };
}

interface Dimension {
  key: string;
  label: string;
  value: number;     // 0..1
  display: string;
  tone: 'strong' | 'mixed' | 'opportunity';
}

const VOLUME_DIM: Record<string, number> = { '<10': 0.25, '10-50': 0.55, '50-100': 0.8, '100+': 1 };
const TOOL_DIM:   Record<string, number> = { manual: 0.25, basic_crm: 0.55, advanced_crm: 0.85, custom: 1 };
const SPEED_DIM:  Record<string, number> = { '<1h': 1, '1-4h': 0.75, '4-24h': 0.4, '24h+': 0.15 };
const TEAM_DIM:   Record<string, number> = { '1': 0.25, '2-10': 0.55, '11-50': 0.85, '50+': 1 };
const BUDGET_DIM: Record<string, number> = { '<500': 0.3, '500-1500': 0.6, '1500-5000': 0.9, '5000+': 1 };

function toneOf(v: number): Dimension['tone'] {
  if (v >= 0.7) return 'strong';
  if (v >= 0.4) return 'mixed';
  return 'opportunity';
}

function computeDimensions(answers: Record<string, string>): Dimension[] {
  const vol = VOLUME_DIM[answers.lead_volume] ?? 0.3;
  const tool = TOOL_DIM[answers.current_tools] ?? 0.3;
  const speed = SPEED_DIM[answers.response_time] ?? 0.3;
  const team = TEAM_DIM[answers.team_size] ?? 0.3;
  const budget = BUDGET_DIM[answers.budget] ?? 0.3;
  const label = (m: Record<string, string>, k: string) => m[k] ?? '-';
  const VOLLABEL: Record<string,string> = { '<10':'<10/mo','10-50':'10–50/mo','50-100':'50–100/mo','100+':'100+/mo' };
  const TOOLLABEL: Record<string,string> = { manual:'Manual', basic_crm:'Basic CRM', advanced_crm:'Advanced CRM', custom:'Custom' };
  const SPEEDLABEL: Record<string,string> = { '<1h':'<1h','1-4h':'1–4h','4-24h':'4–24h','24h+':'>24h' };
  const TEAMLABEL: Record<string,string> = { '1':'Solo','2-10':'2–10','11-50':'11–50','50+':'50+' };
  const BUDGETLABEL: Record<string,string> = { '<500':'<$500','500-1500':'$500–1.5K','1500-5000':'$1.5K–5K','5000+':'$5K+' };
  return [
    { key: 'volume', label: 'Lead volume',       value: vol,    display: label(VOLLABEL, answers.lead_volume),     tone: toneOf(vol) },
    { key: 'speed',  label: 'Response speed',    value: speed,  display: label(SPEEDLABEL, answers.response_time), tone: toneOf(speed) },
    { key: 'tools',  label: 'Tooling maturity',  value: tool,   display: label(TOOLLABEL, answers.current_tools),  tone: toneOf(tool) },
    { key: 'team',   label: 'Team scale',        value: team,   display: label(TEAMLABEL, answers.team_size),      tone: toneOf(team) },
    { key: 'budget', label: 'Budget fit',        value: budget, display: label(BUDGETLABEL, answers.budget),       tone: toneOf(budget) },
  ];
}

interface ROI {
  hoursReclaimable: number;
  revenueAtRisk: number;
  payback: string;
}

const LEAD_COUNT:  Record<string, number> = { '<10': 5, '10-50': 25, '50-100': 75, '100+': 150 };
const LEAK_RATE:   Record<string, number> = { '<1h': 0.05, '1-4h': 0.15, '4-24h': 0.35, '24h+': 0.55 };
const TEAM_COUNT:  Record<string, number> = { '1': 1, '2-10': 5, '11-50': 25, '50+': 75 };
const INVEST:      Record<string, number> = { '<500': 400, '500-1500': 1000, '1500-5000': 3000, '5000+': 6000 };
const AOV_BY_VERTICAL: Record<string, number> = {
  construction: 12000, realestate: 25000, homeservices: 800, healthcare: 400,
  legal: 3000, restaurant: 200, fitness: 1800, dental: 900,
  salon: 250, autorepair: 500, events: 4500, other: 1500,
};

function computeROI(answers: Record<string, string>): ROI {
  const leads = LEAD_COUNT[answers.lead_volume] ?? 25;
  const leak = LEAK_RATE[answers.response_time] ?? 0.2;
  const team = TEAM_COUNT[answers.team_size] ?? 5;
  const monthlyInvest = INVEST[answers.budget] ?? 1000;
  const aov = AOV_BY_VERTICAL[answers.business_type] ?? 1500;

  const hoursReclaimable = Math.round(team * 12); // ~12 hrs/month/person from manual ops
  const revenueAtRisk = Math.round(leads * leak * aov * 0.25); // conservative recoverable slice
  // Simple payback: monthly invest vs. 1/12 of recoverable revenue
  const monthsToPayback = revenueAtRisk > 0
    ? Math.max(1, Math.round(monthlyInvest / Math.max(revenueAtRisk / 3, 200)))
    : 6;
  const payback = monthsToPayback <= 1 ? '~1 month' : `~${monthsToPayback} months`;

  return { hoursReclaimable, revenueAtRisk, payback };
}

function buildRoadmap(tier: Tier, answers: Record<string, string>) {
  const vertical = answers.business_type || 'other';
  const pain = answers.pain_point || 'lead_response';
  const painLabel: Record<string, string> = {
    lead_response: 'instant lead response',
    estimates: 'AI-generated estimates',
    followup: 'automated follow-up',
    reviews: 'review-request automation',
    scheduling: 'AI scheduling & coordination',
  };
  const firstPain = painLabel[pain];
  const tierPrefix = tier === 'advanced' ? 'Enterprise rollout'
    : tier === 'ready' ? 'Core automation'
    : 'Foundation';

  return [
    {
      window: 'Weeks 1–2',
      title: 'Quick wins',
      body: `Stand up ${firstPain} for your highest-volume channel. Wire into your existing ${answers.current_tools === 'manual' ? 'spreadsheets' : 'CRM'} so nothing else has to change on day one.`,
    },
    {
      window: 'Weeks 3–6',
      title: `${tierPrefix}`,
      body: tier === 'getting_started'
        ? `Add one more workflow - estimates or follow-up - and instrument it so you can see ROI in numbers.`
        : `Bundle intake, estimates, and follow-up into a connected flow. Launch a pilot for voice AI on one channel.`,
    },
    {
      window: 'Weeks 7–12',
      title: tier === 'advanced' ? 'Scale to the full stack' : 'Measure, compound, expand',
      body: tier === 'advanced'
        ? `Roll out voice AI, analytics dashboards, and a custom agent tuned to your ${vertical} operations. Instrument against revenue KPIs.`
        : `Benchmark against pre-launch baselines. Expand the pieces that paid back first; retire manual steps that are now redundant.`,
    },
  ];
}

function buildAIAnalysisPrompt(answers: Record<string, string>, tier: Tier) {
  const vertical = answers.business_type || 'other';
  const tierLabel = tier === 'advanced' ? 'Advanced / Ready to Scale'
    : tier === 'ready' ? 'Ready for AI'
    : 'Getting Started';
  const summary = QUESTIONS.map((q) => {
    const opt = q.options.find((o) => o.value === answers[q.id]);
    return `- ${q.question.replace(/\?$/, '')}: ${opt?.label || '-'}`;
  }).join('\n');

  return [
    {
      role: 'system' as const,
      content:
        "You are a senior fractional CTO named DigitalCraft. You advise operators in traditional industries on where AI automation pays back fastest. " +
        "Write a personalized 2-3 paragraph analysis based on the quiz answers below. " +
        "Rules: be specific to their industry, lead volume, and current tools. Name the single biggest opportunity for them. " +
        "Recommend ONE concrete first step they could ship in the next 30 days. " +
        "Prose only - no bullet points, no headings, no hedging, no generic platitudes. " +
        "Don't reference 'quiz' or 'answers'. Write as if you've just reviewed their operation. Under 180 words total.",
    },
    {
      role: 'user' as const,
      content:
        `Business profile\n` +
        `Industry: ${vertical}\n` +
        `Readiness tier: ${tierLabel}\n\n` +
        `Signals:\n${summary}\n\n` +
        `Write the analysis.`,
    },
  ];
}

/* ─────────────────────────── Results UI ─────────────────────────── */

const TONE_BAR: Record<Dimension['tone'], string> = {
  strong: 'bg-emerald-500',
  mixed: 'bg-amber-500',
  opportunity: 'bg-rose-500',
};
const TONE_LABEL: Record<Dimension['tone'], string> = {
  strong: 'Strong',
  mixed: 'Mixed',
  opportunity: 'Opportunity',
};
const TONE_TEXT: Record<Dimension['tone'], string> = {
  strong: 'text-emerald-700 dark:text-emerald-300',
  mixed: 'text-amber-700 dark:text-amber-300',
  opportunity: 'text-rose-700 dark:text-rose-300',
};

interface ResultsPanelProps {
  tier: Tier | null;
  tierInfo: (typeof TIERS)[Tier] | null;
  score: { total: number; max: number };
  dimensions: Dimension[];
  roi: ROI | null;
  roadmap: ReturnType<typeof buildRoadmap>;
  aiAnalysis: string;
  aiStatus: 'idle' | 'streaming' | 'done' | 'error';
  demoLink: { label: string; path: string };
  answers: Record<string, string>;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({
  tier,
  tierInfo,
  score,
  dimensions,
  roi,
  roadmap,
  aiAnalysis,
  aiStatus,
  demoLink,
}) => {
  const scorePct = score.max > 0 ? Math.round((score.total / score.max) * 100) : 0;

  // Ticket 0052 - Copy share link. Mirrors ticket 0046 ROI pattern:
  // window.location.origin at runtime + iOS-Safari execCommand fallback.
  const [copied, setCopied] = useState(false);
  const shareOrigin = typeof window === 'undefined' ? 'https://digitalcraftai.com' : window.location.origin;
  const shareUrl = tier ? `${shareOrigin}/quiz?tier=${encodeQuizTierParam(tier)}` : '';
  const handleCopyShareLink = async () => {
    if (!tier) return;
    trackCTAClick('quiz_share_copy', 'quiz');
    const flash = () => { setCopied(true); setTimeout(() => setCopied(false), 2200); };
    try { await navigator.clipboard.writeText(shareUrl); flash(); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); flash(); } catch { /* silent */ }
      finally { document.body.removeChild(ta); }
    }
  };

  return (
    <div className="space-y-5">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600 dark:text-gray-300">
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
          />
          <span>Report generated · model gpt-4o</span>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 sm:inline">
          Analysis · real time
        </span>
      </div>

      {/* ── Hero: tier + score gauge ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {tierInfo && tier && (
            <div className="flex items-start gap-5">
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 ${tierInfo.color}`}>
                <tierInfo.icon className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
                  Your tier
                </div>
                <h2 className={`mt-0.5 text-2xl md:text-3xl font-bold ${tierInfo.color}`}>
                  {tierInfo.label}
                </h2>
                <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tierInfo.description}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              Readiness score
            </div>
            <TrendingUp size={14} className="text-primary" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900 dark:text-white">{score.total}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">/ {score.max}</span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-1000"
              style={{ width: `${scorePct}%` }}
              role="progressbar"
              aria-valuenow={scorePct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Readiness score ${scorePct} percent`}
            />
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            {scorePct}% · weighted composite
          </div>
        </div>
      </div>

      {/* ── Ticket 0052 - Copy share link ── */}
      {tier && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm dark:border-primary/40 dark:bg-primary/10">
          <Button type="button" onClick={handleCopyShareLink} data-testid="quiz-copy-share-link" className="inline-flex items-center gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy share link'}
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-300">
            Copies a /quiz?tier= link so a co-owner sees the same tier card.
          </span>
          {copied && (
            <span data-testid="quiz-copy-confirmation" role="status" className="text-xs text-emerald-700 dark:text-emerald-300">
              Share link copied to your clipboard
            </span>
          )}
        </div>
      )}

      {/* ── Dimensions ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              § Signal breakdown
            </div>
            <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              Where you sit across five dimensions
            </h3>
          </div>
          <Activity size={18} className="text-primary" />
        </div>
        <ul className="space-y-3">
          {dimensions.map((d, i) => (
            <li key={d.key}>
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                    {d.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {d.display}
                  </span>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-[0.14em] ${TONE_TEXT[d.tone]}`}>
                  {TONE_LABEL[d.tone]}
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className={`h-2 rounded-full ${TONE_BAR[d.tone]}`}
                  style={{
                    width: `${Math.round(d.value * 100)}%`,
                    transition: 'width 900ms cubic-bezier(0.22, 1, 0.36, 1)',
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Live AI Analysis ── */}
      <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-6 shadow-sm dark:border-primary/40 dark:from-primary/10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              § Live AI analysis
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-600 dark:text-gray-300">
            <span
              aria-hidden
              className={`inline-flex h-1.5 w-1.5 rounded-full ${
                aiStatus === 'streaming'
                  ? 'animate-pulse bg-primary shadow-[0_0_8px_hsl(var(--primary))]'
                  : aiStatus === 'done'
                  ? 'bg-emerald-500'
                  : aiStatus === 'error'
                  ? 'bg-rose-500'
                  : 'bg-gray-400'
              }`}
            />
            <span>
              {aiStatus === 'streaming'
                ? 'Streaming · gpt-4o'
                : aiStatus === 'done'
                ? 'Analysis complete'
                : aiStatus === 'error'
                ? 'Analysis unavailable'
                : 'Preparing analysis…'}
            </span>
          </div>
        </div>

        {aiStatus === 'idle' || (aiStatus === 'streaming' && aiAnalysis.length === 0) ? (
          <div className="space-y-2">
            <div className="h-3 w-11/12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-10/12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ) : aiStatus === 'error' ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We couldn't generate a live analysis right now. Your readiness score and projections
            below are still calibrated to your answers - and you can book a call to walk through
            them with a real engineer.
          </p>
        ) : (
          <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-100 dark:prose-invert">
            {aiAnalysis.split('\n\n').map((p, i) => (
              <p key={i} className="leading-relaxed">
                {p}
                {aiStatus === 'streaming' && i === aiAnalysis.split('\n\n').length - 1 && (
                  <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-primary align-middle" />
                )}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* ── ROI projection ── */}
      {roi && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                § Opportunity model
              </div>
              <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                What automation is worth to you
              </h3>
            </div>
            <DollarSign size={18} className="text-primary" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                <Clock size={12} /> Hours reclaimable
              </div>
              <div className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">
                ~{roi.hoursReclaimable}
                <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Across your team, from manual ops
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                <TrendingUp size={12} /> Revenue at risk
              </div>
              <div className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">
                ${roi.revenueAtRisk.toLocaleString()}
                <span className="ml-1 text-base font-medium text-gray-500 dark:text-gray-400">/mo</span>
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Slow-lead leakage at current response time
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-4">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                <Zap size={12} /> Payback window
              </div>
              <div className="mt-1.5 text-3xl font-bold text-gray-900 dark:text-white">
                {roi.payback}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                At your stated budget tier
              </div>
            </div>
          </div>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
            Projections are directional - calibrated to your answers, typical industry AOV, and
            recovery rates we've observed on retainers.
          </p>
        </div>
      )}

      {/* ── 90-day roadmap ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
              § Your 90-day plan
            </div>
            <h3 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
              How we'd sequence the build
            </h3>
          </div>
          <Calendar size={18} className="text-primary" />
        </div>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {roadmap.map((phase, i) => (
            <li
              key={phase.window}
              className="relative rounded-xl border border-gray-100 dark:border-gray-800 p-4"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                  {phase.window}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h4 className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                {phase.title}
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {phase.body}
              </p>
            </li>
          ))}
        </ol>
      </div>

      {/* ── CTAs ── */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900/60">
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Ready to move? Pick your next step.
        </h3>
        {/* Ticket 0046 - one outbound link to the standalone ROI
            calculator so quiz-takers can produce a shareable annual
            savings figure to send to a co-owner. Structural addition;
            no other changes to this file. */}
        <div className="mb-3">
          <Link
            to="/roi"
            onClick={() => trackCTAClick('quiz_calculate_roi', 'ai_readiness_quiz')}
            className="group flex items-center justify-between gap-3 rounded-xl border-2 border-primary/40 bg-white p-4 transition hover:border-primary dark:bg-gray-900"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                Calculate your ROI
              </div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Four inputs, visible math, a shareable savings link
              </div>
            </div>
            <ArrowRight
              size={18}
              className="shrink-0 text-primary transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Link
            to={demoLink.path}
            onClick={() => trackCTAClick('quiz_try_demos', 'ai_readiness_quiz')}
            className="group flex items-center justify-between gap-3 rounded-xl border-2 border-primary/40 bg-white p-4 transition hover:border-primary dark:bg-gray-900"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                {demoLink.label}
              </div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Interactive demos, personalized to your URL
              </div>
            </div>
            <ArrowRight
              size={18}
              className="shrink-0 text-primary transition-transform group-hover:translate-x-1"
            />
          </Link>
          <a
            href="https://calendly.com/mutaaf"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackCTAClick('quiz_book_call', 'ai_readiness_quiz')}
            className="group flex items-center justify-between gap-3 rounded-xl border-2 border-primary bg-primary p-4 text-white transition hover:brightness-105"
          >
            <div className="min-w-0">
              <div className="text-sm font-semibold">Book a free strategy call</div>
              <div className="mt-0.5 text-xs text-white/80">
                30 min · no pitch · walk through these numbers with a real engineer
              </div>
            </div>
            <ArrowRight
              size={18}
              className="shrink-0 transition-transform group-hover:translate-x-1"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ───────────────── Head metadata (ticket 0039) ─────────────────
 * Per the 2026-05-25 mirror-source rule, the meta description and the
 * Quiz JSON-LD `description` field read from a single constant so the
 * SERP snippet and the structured-data block can never drift. The
 * Quiz schema's `hasPart` is built by mapping over QUESTIONS so the
 * schema length always tracks the visible quiz length (today 7).
 * Sibling BreadcrumbList block matches the trade-page pattern in
 * src/pages/AiForRoofers.tsx and src/pages/AiForElectricians.tsx;
 * no @graph wrapper - Google parses sibling script tags independently.
 */
const META_DESCRIPTION =
  'Take our free 2-minute quiz to discover how ready your business is for AI automation and get personalized recommendations.';

const QUIZ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Quiz',
  name: 'AI Readiness Quiz',
  description: META_DESCRIPTION,
  educationalUse: 'Self-Assessment',
  assesses: 'AI automation readiness for small business operations',
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  hasPart: QUESTIONS.map((q) => ({
    '@type': 'Question',
    name: q.question,
    eduQuestionType: 'Multiple choice',
    suggestedAnswer: q.options.map((o) => ({
      '@type': 'Answer',
      text: o.label,
    })),
  })),
};

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI Readiness Quiz',
      item: 'https://digitalcraftai.com/quiz',
    },
  ],
};

const AIReadinessQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { content } = useContent();

  const [aiAnalysis, setAiAnalysis] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle');
  const aiAbortRef = useRef<AbortController | null>(null);
  const aiStartedRef = useRef(false);

  // Ticket 0052 - shared-tier deep-link. Lazy initializer reads the URL
  // once on mount; a missing / malformed value returns null. useRef guard
  // fires quiz_share_open exactly once per mount.
  const [sharedTier] = useState<Tier | null>(() =>
    decodeQuizTierParam(new URLSearchParams(window.location.search)),
  );
  const sharedTierOpenedRef = useRef(false);
  useEffect(() => {
    if (sharedTier !== null && !sharedTierOpenedRef.current) {
      sharedTierOpenedRef.current = true;
      trackCTAClick('quiz_share_open', 'quiz');
    }
  }, [sharedTier]);
  const sharedTierInfo = sharedTier ? TIERS[sharedTier] : null;

  // Reset scroll on SPA navigation into /quiz. Without this, entering
  // from the navbar while scrolled down on another page keeps you
  // pinned below the fold and the quiz looks broken.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const isQuizDone = step === QUESTIONS.length;
  const tier = isQuizDone ? computeTier(answers) : null;
  const tierInfo = tier ? TIERS[tier] : null;
  const vertical = answers.business_type || 'other';
  const demoLink = VERTICAL_DEMOS[vertical] || VERTICAL_DEMOS.other;

  // Ticket 0045 - persist the tier label + completion timestamp into the
  // additive dca_quiz_persona_v1 store so the /my dashboard can surface
  // it. Persona name and completedAt only; no per-question answers, no
  // ROI estimate, so the /trust disclosure stays narrow.
  useEffect(() => {
    if (isQuizDone && tierInfo) {
      setQuizPersona(tierInfo.label, Date.now());
    }
  }, [isQuizDone, tierInfo]);

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => setStep((s) => Math.min(s + 1, QUESTIONS.length)), 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await submitLead({
        email,
        quiz_tier: tier,
        quiz_business_type: vertical,
        quiz_answers: JSON.stringify(answers),
        ...getUtmParams(),
        _subject: '[Quiz] AI Readiness',
      });
      if (res.ok) {
        setEmailSubmitted(true);
        trackFormSubmission('ai_readiness_quiz');
        trackCTAClick('quiz_email_submit', 'ai_readiness_quiz');
      }
    } catch {
      // silent
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = QUESTIONS[step];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  const scoreSummary = isQuizDone ? computeScore(answers) : { total: 0, max: 0 };
  const dimensions = isQuizDone ? computeDimensions(answers) : [];
  const roi = isQuizDone ? computeROI(answers) : null;
  const roadmap = isQuizDone && tier ? buildRoadmap(tier, answers) : [];

  useEffect(() => {
    if (!emailSubmitted || !tier) return;
    if (aiStartedRef.current) return;
    aiStartedRef.current = true;

    const controller = new AbortController();
    aiAbortRef.current = controller;
    setAiStatus('streaming');
    setAiAnalysis('');

    streamChat(
      buildAIAnalysisPrompt(answers, tier),
      (delta) => setAiAnalysis((prev) => prev + delta),
      controller.signal,
    )
      .then(() => setAiStatus('done'))
      .catch(() => setAiStatus('error'));

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailSubmitted]);

  return (
    <>
      <Helmet>
        <title>AI Readiness Quiz | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(QUIZ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
        <div
          className={`container mx-auto px-4 ${
            emailSubmitted ? 'max-w-4xl' : 'max-w-2xl'
          }`}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              AI Readiness Quiz
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Answer 7 quick questions to see how AI can transform your business.
            </p>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-8">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!isQuizDone ? (
            <>
              {/* Ticket 0052 - shared-tier banner; hidden once step > 0. */}
              {sharedTier !== null && sharedTierInfo && step === 0 && (
                <aside data-testid="quiz-shared-tier-banner" className="mb-6 rounded-2xl border border-primary/30 bg-white p-5 shadow-sm dark:border-primary/40 dark:bg-gray-900">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">Shared result</div>
                  <div className="mt-3 flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 ${sharedTierInfo.color}`}>
                      <sharedTierInfo.icon className="h-6 w-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className={`text-xl md:text-2xl font-bold ${sharedTierInfo.color}`}>{sharedTierInfo.label}</h2>
                      <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{sharedTierInfo.description}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-700 dark:text-gray-200">Shared result. Take the quiz yourself to see your own tier.</p>
                  <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('quiz_share_book_call', 'quiz')} className="mt-3 inline-flex items-center gap-2 rounded-lg border-2 border-primary bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-105">
                    Book a Strategy Call <ArrowRight size={14} />
                  </a>
                </aside>
              )}
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Question {step + 1} of {QUESTIONS.length}
              </p>
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                {currentQ.question}
              </h2>
              <div className="space-y-3">
                {currentQ.options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => selectAnswer(currentQ.id, opt.value)}
                    className={`w-full text-left px-5 py-3.5 rounded-lg border-2 transition-all ${
                      answers[currentQ.id] === opt.value
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="mt-6 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 inline-flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              </div>
            </>
          ) : !emailSubmitted ? (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Your results are ready!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Enter your email to see your AI readiness score and personalized recommendations.
              </p>
              <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address for quiz results"
                  className="flex-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'See My Results'}
                </Button>
              </form>
              <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">No spam. Unsubscribe anytime.</p>
            </div>
          ) : (
            <ResultsPanel
              tier={tier}
              tierInfo={tierInfo}
              score={scoreSummary}
              dimensions={dimensions}
              roi={roi}
              roadmap={roadmap}
              aiAnalysis={aiAnalysis}
              aiStatus={aiStatus}
              demoLink={demoLink}
              answers={answers}
            />
          )}
        </div>
      </main>
      {content?.footer && <Footer data={content.footer} />}
    </>
  );
};

export default AIReadinessQuiz;
