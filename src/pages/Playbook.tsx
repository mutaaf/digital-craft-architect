import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Compass, ArrowRight, Phone } from 'lucide-react';

// Ticket 0059 - Public methodology page at /playbook. Mirrors the Trust.tsx
// page shell. Mirror-source rule (2026-05-25): visible rendering AND HowTo
// step[] both derive from PLAYBOOK_STEPS; Helmet meta + HowTo description
// share META_DESCRIPTION; H1 + HowTo name share PLAYBOOK_H1. Pre-write
// JSON-LD grep (2026-05-30): zero HowTo matches site-wide; BreadcrumbList
// matches are all URL-scoped to other pages. Grep recorded on the ticket.

interface PlaybookStep {
  number: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  activities: readonly string[];
  youProvide: string;
}

const META_DESCRIPTION =
  'How Digital Craft AI structures a deployment in four steps: discovery and pain mapping, demo personalization with your own website data, a pilot scoped to one funnel, then a documented review and decision on expansion.';

const PLAYBOOK_H1 = 'How We Deploy AI in Your Business';

const PLAYBOOK_STEPS: readonly PlaybookStep[] = [
  {
    number: 1,
    title: 'Discovery and pain mapping',
    description:
      'A 30-minute strategy call where we listen for the specific funnel leakage worth targeting first. No pitch deck, no canned process diagram.',
    activities: [
      'You walk us through your current intake, follow-up, and quoting flow.',
      'We identify the single biggest leakage point (slow lead response, abandoned quotes, missed follow-ups, or review collection gaps).',
      'You leave with a written one-paragraph scope of the pilot we would run, not a proposal.',
    ],
    youProvide:
      '30 minutes on a video call and the rough numbers you already track (leads per week, close rate, average ticket size).',
  },
  {
    number: 2,
    title: 'Demo personalization with your own website data',
    description:
      'We point our existing demo platform at your real website so you experience the AI tools branded to your company before you commit to anything.',
    activities: [
      'You enter your URL on the demo hub for your industry and our scraper builds a company profile in your browser.',
      'You run the lead-responder, estimate, and voice negotiator demos against that profile and copy the transcripts to anyone on your team.',
      'We walk through which demo most closely matches the pilot scope from step one.',
    ],
    youProvide: 'Your website URL and 30 minutes to click through the demos that match the pilot.',
  },
  {
    number: 3,
    title: 'Pilot deployment scoped to one funnel',
    description:
      'A 2 to 4 week pilot on a single funnel (lead intake OR estimate follow-up OR review collection, never all three at once) with weekly check-ins and a written success criterion.',
    activities: [
      'We configure the AI on a real phone number, real inbox, or real form connected to your business.',
      'You sign off on the system prompt and the guardrails before the AI goes live.',
      'Weekly 15-minute check-ins on the call recordings, transcripts, and the one success metric (faster response, more booked appointments, or more reviews collected).',
    ],
    youProvide:
      'Access to one funnel (a phone number to forward, an inbox to monitor, or a form to wire up), the success criterion in writing, and weekly 15 minutes for review.',
  },
  {
    number: 4,
    title: 'Review and expansion decision',
    description:
      'A documented review of pilot results against the success criterion, then a deliberate decision to expand to additional funnels or wind down. No upsell pressure.',
    activities: [
      'We share a written one-page summary of pilot metrics versus the success criterion you wrote in step three.',
      'You decide: expand to the next funnel, keep the pilot funnel running at current scope, or wind down with a clean handoff.',
      'If expanding, we scope the next pilot the same way we scoped this one.',
    ],
    youProvide:
      '30 minutes to read the review summary and one decision (expand, keep, or wind down).',
  },
];

// HowTo step[] derived from PLAYBOOK_STEPS via .map so a future change to a
// step's title or description updates both rendering and schema.
const HOWTO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: PLAYBOOK_H1,
  description: META_DESCRIPTION,
  totalTime: 'P4W',
  step: PLAYBOOK_STEPS.map((s) => ({
    '@type': 'HowToStep',
    position: s.number,
    name: s.title,
    text: s.description,
    url: `https://digitalcraftai.com/playbook#step-${s.number}`,
  })),
};

// Sibling BreadcrumbList (Home -> Playbook), matching the pattern used by
// src/pages/Trust.tsx and src/pages/Changelog.tsx.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Playbook',
      item: 'https://digitalcraftai.com/playbook',
    },
  ],
};

const Playbook: React.FC = () => {
  const { content } = useContent();

  // Deep-link scroll for /playbook#step-N. requestAnimationFrame so the
  // scroll fires after the step blocks mount; guarded against missing window
  // and missing target id.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || hash.length < 2) return;
    const id = hash.slice(1);
    const raf = window.requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PLAYBOOK_H1} | Playbook | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href="https://digitalcraftai.com/playbook" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(HOWTO_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Compass size={16} />
            Playbook
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PLAYBOOK_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Four steps, in order: discovery and pain mapping, demo personalization with your own
            website data, a pilot scoped to one funnel, then a documented review and decision on
            expansion. Read this before a strategy call so we can spend the call on step three.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {PLAYBOOK_STEPS.map((s) => (
              <a
                key={s.number}
                href={`#step-${s.number}`}
                onClick={() => trackCTAClick(`playbook_step_${s.number}`, 'playbook')}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {`Step ${s.number}: ${s.title}`}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Step blocks */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12">
            {PLAYBOOK_STEPS.map((s) => (
              <article
                key={s.number}
                id={`step-${s.number}`}
                data-testid="playbook-step"
                className="scroll-mt-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white font-semibold">
                    {s.number}
                  </span>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {s.title}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  {s.description}
                </p>
                <ul className="mt-3 list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300">
                  {s.activities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  <strong className="text-gray-700 dark:text-gray-200">What you provide:</strong>{' '}
                  {s.youProvide}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready for step one?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Book the 30-minute discovery call. We will listen for the funnel leakage worth
            targeting first and leave you with a written one-paragraph scope, no proposal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('playbook_strategy_call', 'playbook')}
            >
              <Phone size={18} />
              Book the Discovery Call
            </a>
            <Link
              to="/demos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('playbook_view_demos', 'playbook')}
            >
              Browse the Demos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Playbook;
