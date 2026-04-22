import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { trackCTAClick, trackFormSubmission } from '@/utils/analytics';
import { getUtmParams } from '@/utils/utmTracker';
import { ArrowRight, ArrowLeft, Brain, Zap, Rocket } from 'lucide-react';

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

type Tier = 'getting_started' | 'ready' | 'advanced';

const TIERS: Record<Tier, { label: string; color: string; icon: React.ElementType; description: string }> = {
  getting_started: {
    label: 'Getting Started',
    color: 'text-amber-600 dark:text-amber-400',
    icon: Brain,
    description: 'You have clear opportunities to benefit from AI automation. Start with one key workflow — like lead response — and build from there.',
  },
  ready: {
    label: 'Ready for AI',
    color: 'text-blue-600 dark:text-blue-400',
    icon: Zap,
    description: 'Your business is well-positioned for AI automation. You have the volume and infrastructure to see fast ROI.',
  },
  advanced: {
    label: 'Advanced — Ready to Scale',
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

const AIReadinessQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isQuizDone = step === QUESTIONS.length;
  const tier = isQuizDone ? computeTier(answers) : null;
  const tierInfo = tier ? TIERS[tier] : null;
  const vertical = answers.business_type || 'other';
  const demoLink = VERTICAL_DEMOS[vertical] || VERTICAL_DEMOS.other;

  const selectAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setTimeout(() => setStep((s) => Math.min(s + 1, QUESTIONS.length)), 300);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('https://formspree.io/f/xovekqqk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          quiz_tier: tier,
          quiz_business_type: vertical,
          quiz_answers: JSON.stringify(answers),
          ...getUtmParams(),
          _subject: '[Quiz] AI Readiness',
        }),
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

  return (
    <>
      <Helmet>
        <title>AI Readiness Quiz | DigitalCraft AI</title>
        <meta name="description" content="Take our free 2-minute quiz to discover how ready your business is for AI automation and get personalized recommendations." />
      </Helmet>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50 dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-2xl">
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
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 md:p-8">
              {tierInfo && (
                <div className="text-center mb-8">
                  <tierInfo.icon className={`h-14 w-14 mx-auto mb-4 ${tierInfo.color}`} />
                  <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${tierInfo.color}`}>
                    {tierInfo.label}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
                    {tierInfo.description}
                  </p>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recommended Next Steps
                </h3>
                <div className="space-y-3">
                  <Link
                    to={demoLink.path}
                    onClick={() => trackCTAClick('quiz_try_demos', 'ai_readiness_quiz')}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group"
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium">{demoLink.label}</span>
                    <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="https://calendly.com/mutaaf"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackCTAClick('quiz_book_call', 'ai_readiness_quiz')}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors group"
                  >
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Book a Free Strategy Call</span>
                    <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AIReadinessQuiz;
