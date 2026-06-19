import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ClipboardList, ArrowRight, Phone } from 'lucide-react';

// Ticket 0061 - Public /questions-to-ask-an-ai-vendor buyer-side artifact.
// Mirrors the Playbook.tsx (ticket 0059) page-shell pattern: Navbar, Footer,
// ScrollProgress, Helmet, sectioned content with anchor links, two JSON-LD
// blocks (FAQPage + BreadcrumbList). Per the 2026-05-25 mirror-source rule
// visible rendering AND FAQPage mainEntity[] both derive from VENDOR_QUESTIONS;
// Helmet meta + page H1 share single constants. Per the 2026-05-30
// second-@type lesson, the pre-write grep confirmed every existing FAQPage
// predicate is URL-scoped (the pricing-faq spec's findComponentFaqPage filter
// narrows by mainEntity question-set, the spec only navigates to /construction
// and /realestate) and every BreadcrumbList predicate is URL-scoped to its
// own page, so a new /questions-to-ask-an-ai-vendor-scoped pair does not
// collide. Grep recorded in the ticket's Implementation log.

interface VendorQuestion {
  id: string;
  question: string;
  whyItMatters: string;
  ourAnswerHref?: string;
  ourAnswerLabel?: string;
}

const META_DESCRIPTION =
  'A buyer-side checklist of 11 specific questions to ask any AI services vendor before signing, covering data handling, model and provider transparency, pricing, deployment process, what breaks when the AI is wrong, exit terms, and how to compare honest vendors against the rest.';

const PAGE_H1 = 'Questions to Ask Any AI Services Vendor Before You Sign';

// 11 questions covering the required topic set from the ticket: data handling,
// model/provider transparency, pricing model and churn, deployment process,
// what breaks when AI is wrong, uptime track record, ship velocity, comparable
// vendor comparisons, exit and data export, security posture, defensible
// efficacy claims, cross-vertical generalization. Topics are merged where
// honest (efficacy + cross-vertical sit naturally as two distinct questions).
const VENDOR_QUESTIONS: readonly VendorQuestion[] = [
  {
    id: 'data-handling',
    question: 'Where exactly does my customer data go, and which third parties touch it?',
    whyItMatters:
      'Any AI vendor either routes your calls and chats through their own infrastructure or proxies them to one or more model providers (OpenAI, Anthropic, Vapi, Deepgram, ElevenLabs, and so on). A vendor that cannot name the exact list of third parties and the exact data each one sees is either hiding a longer list than they want to admit or has never audited their own data flow. Either answer should slow you down. Ask for the list in writing and ask which of those third parties retain prompts or transcripts for model training.',
    ourAnswerHref: '/trust',
    ourAnswerLabel: 'See our data-handling page',
  },
  {
    id: 'model-provider',
    question: 'Which AI model and which provider powers each surface, and can I see it change in your changelog?',
    whyItMatters:
      'The honest answer names a specific model and a specific provider per surface (chat uses one provider, voice uses another, transcription uses a third). A vendor that says only "we use AI" or "we use the best model for the job" is either obfuscating the cost structure or has not designed the system carefully enough to track which model handles which task. Ask for the names. Ask how you would learn when they change a model under you.',
    ourAnswerHref: '/changelog',
    ourAnswerLabel: 'Read our changelog',
  },
  {
    id: 'pricing-model',
    question: 'How is pricing structured, and what happens to my data and access if I stop paying?',
    whyItMatters:
      'A flat monthly fee, a per-conversation fee, and a per-minute voice fee all behave very differently when your call volume spikes or your team churns. A vendor that will not write down the unit they bill on (per conversation, per minute, per active user, per workflow) is preserving the option to reprice you after you depend on them. Ask the same vendor what happens to your saved transcripts, your trained prompts, and your phone-number forwarding the day you stop paying.',
  },
  {
    id: 'deployment-process',
    question: 'What does the first 30 days actually look like, step by step?',
    whyItMatters:
      'A real deployment process names the discovery call, the success metric you agree on in writing, the single funnel the pilot will touch, the guardrails you sign off on before the AI goes live, and the weekly check-in cadence. A vendor whose first 30 days collapse into "we will get you set up" has not deployed enough times to know what the first 30 days actually look like. Ask for the written playbook before the second sales call.',
    ourAnswerHref: '/playbook',
    ourAnswerLabel: 'Read our playbook',
  },
  {
    id: 'failure-mode',
    question: 'What happens when the AI is wrong on a real customer, and how would I find out?',
    whyItMatters:
      'Every production AI system mishandles real conversations sometimes. The honest vendor will describe the specific failure modes they have seen (an AI that booked a duplicate appointment, an AI that quoted an out-of-scope job, an AI that misheard a phone number on a noisy call) and the specific guardrails and human-in-the-loop escalation paths in place. A vendor whose answer is "our AI does not get things wrong" is either lying or has never shipped to a real production funnel.',
  },
  {
    id: 'uptime-track-record',
    question: 'What has your uptime actually been over the past 90 days, and where can I read the incident history?',
    whyItMatters:
      'A real uptime number is a public page with timestamps and incident notes a buyer can audit without a login. A vendor that quotes "99.9% uptime" with no public page is quoting a marketing number, not an operational one. Ask for the URL of the public status page and ask how long the last incident lasted.',
    ourAnswerHref: '/uptime',
    ourAnswerLabel: 'See our uptime page',
  },
  {
    id: 'ship-velocity',
    question: 'How often do you ship changes, and where do I read what shipped last week?',
    whyItMatters:
      'A vendor that ships weekly improvements is investing in the product; a vendor whose last public ship note is six months old is probably investing in sales instead. Ask for the changelog URL. Read the last four entries. Pattern-match the ratio of customer-facing improvements to internal refactors.',
    ourAnswerHref: '/changelog',
    ourAnswerLabel: 'Read our changelog',
  },
  {
    id: 'vendor-comparison',
    question: 'Who do you lose deals to, and where on your own site do you compare yourself against them honestly?',
    whyItMatters:
      'A vendor that maintains public side-by-side comparisons against the two or three competitors they most often lose to is operating from a position of "we know what we are good at and where we are not the right fit." A vendor whose answer is "we are the best at everything" or who refuses to name a comparable competitor is hiding either the cost difference or a feature gap. Ask for the comparison page URL.',
    ourAnswerHref: '/compare',
    ourAnswerLabel: 'See our comparison hub',
  },
  {
    id: 'exit-terms',
    question: 'On the day I cancel, how do I export my transcripts, prompts, contacts, and integrations?',
    whyItMatters:
      'Exit terms are the single best predictor of how a vendor treats long-tenured customers, because they are the one clause a vendor writes when they are negotiating against their own incentive to lock you in. Ask for the data-export format (CSV, JSON, a downloadable archive), the time window (same day, 30 days, no guarantee), and the call-forwarding handoff process so your real phone number is yours, not theirs.',
  },
  {
    id: 'security-posture',
    question: 'What is your security posture, and what would I tell my own security team about you?',
    whyItMatters:
      'A vendor that has thought about security can name the data each third party sees, the encryption at rest and in transit, the retention windows on transcripts and recordings, whether prompts feed any provider training data, and the breach-notification timeline. A vendor whose security answer is one sentence is either pre-revenue or has not been asked the question by a buyer with a security team. If you have a security team, ask the vendor to fill out your real questionnaire.',
    ourAnswerHref: '/trust',
    ourAnswerLabel: 'See our data-handling page',
  },
  {
    id: 'defensible-claims',
    question: 'Which of your efficacy claims can you defend with a specific customer and a specific number?',
    whyItMatters:
      'Any vendor whose homepage claims "10x more leads" or "90% answer rate" should be able to name the specific customer, the specific time window, and the specific baseline that produced the number. A vendor that cannot attach a real customer name to a real number is showing you a marketing claim, not a result. Ask for one defensible case study with the customer reachable for a reference call.',
  },
];

// FAQPage mainEntity[] derived from VENDOR_QUESTIONS via .map so a future
// change to a question or its whyItMatters text updates the visible
// rendering AND the schema in one place per the 2026-05-25 mirror-source
// rule. The acceptedAnswer text is the plain-text whyItMatters explainer,
// NOT a marketing answer (the page is buyer-side; the FAQPage block must
// read as a buyer artifact too).
const FAQPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  name: PAGE_H1,
  description: META_DESCRIPTION,
  mainEntity: VENDOR_QUESTIONS.map((q) => ({
    '@type': 'Question',
    name: q.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: q.whyItMatters,
    },
  })),
};

// Sibling BreadcrumbList (Home -> Questions to Ask an AI Vendor), matching
// the pattern used by src/pages/Playbook.tsx and src/pages/Trust.tsx.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Questions to Ask an AI Vendor',
      item: 'https://digitalcraftai.com/questions-to-ask-an-ai-vendor',
    },
  ],
};

const QuestionsToAskAnAiVendor: React.FC = () => {
  const { content } = useContent();

  // Deep-link scroll for /questions-to-ask-an-ai-vendor#q-N. Mirrors the
  // Playbook.tsx pattern: guards against missing window and missing target
  // id, uses requestAnimationFrame so the scroll fires after the blocks
  // mount.
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
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link
          rel="canonical"
          href="https://digitalcraftai.com/questions-to-ask-an-ai-vendor"
        />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQPAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ClipboardList size={16} />
            Buyer Checklist
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A buyer-side checklist you can bring into any AI vendor call. Each question is one
            you should be able to ask anyone selling you AI services, including us. Where the
            answer lives on a canonical page on this site, the row links to it so you can audit
            our answer before the call.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {VENDOR_QUESTIONS.map((q, idx) => (
              <a
                key={q.id}
                href={`#q-${idx + 1}`}
                onClick={() =>
                  trackCTAClick(`vendor_questions_q${idx + 1}`, 'vendor_questions')
                }
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {`Q${idx + 1}`}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Question blocks */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-10">
            {VENDOR_QUESTIONS.map((q, idx) => (
              <article
                key={q.id}
                id={`q-${idx + 1}`}
                data-testid="vendor-question"
                className="scroll-mt-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="inline-flex items-center justify-center min-w-9 h-9 px-3 rounded-full bg-primary text-white font-semibold text-sm">
                    {`Q${idx + 1}`}
                  </span>
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                    {q.question}
                  </h2>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  <strong className="text-gray-700 dark:text-gray-200">
                    Why this matters:
                  </strong>{' '}
                  {q.whyItMatters}
                </p>
                {q.ourAnswerHref && q.ourAnswerLabel ? (
                  <p className="mt-4 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      How Digital Craft answers this:
                    </span>{' '}
                    <Link
                      to={q.ourAnswerHref}
                      data-testid="vendor-question-answer-link"
                      onClick={() =>
                        trackCTAClick(
                          `vendor_questions_answer_${q.id}`,
                          'vendor_questions',
                        )
                      }
                      className="text-primary hover:text-primary/80 dark:hover:text-primary/80 font-medium inline-flex items-center gap-1"
                    >
                      {q.ourAnswerLabel}
                      <ArrowRight size={14} />
                    </Link>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to put us through the same checklist?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Bring this page into a 30-minute discovery call. We will answer every row honestly,
            including the ones where we are not the right fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('vendor_questions_strategy_call', 'vendor_questions')
              }
            >
              <Phone size={18} />
              Book the Discovery Call
            </a>
            <Link
              to="/playbook"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('vendor_questions_view_playbook', 'vendor_questions')
              }
            >
              Read our Playbook
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default QuestionsToAskAnAiVendor;
