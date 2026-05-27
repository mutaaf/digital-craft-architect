import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ShieldCheck, ArrowRight, Phone } from 'lucide-react';

// Ticket 0018 - How-the-demos-work transparency page at /trust.
//
// Every factual claim on this page is sourced from existing files in the repo,
// cited inline so a future editor can re-verify without trusting marketing copy:
//
//   - Provider list (OpenAI, Vapi, ElevenLabs, Deepgram, Firecrawl, Jina,
//     Formspree, Sentry, Google Analytics) and the "API keys never reach the
//     browser" claim: CLAUDE.md "Tech Stack" + "Environment Variables" tables
//     and the "Key Design Decisions" list, backed by the /api/ proxy pattern
//     in api/*.ts.
//   - Conversation/AI cache TTL + storage prefix: src/utils/aiCache.ts
//     (PREFIX = 'dca_deal_', DEFAULT_TTL = 30 * 60 * 1000).
//   - Demo company profile in localStorage, per-vertical key scoping:
//     src/contexts/DemoContext.tsx (storageKey() returns
//     `dca_demo_company_${vertical}`); per ticket 0010.
//   - Formspree-only email path (newsletter, course optin, estimate capture):
//     src/components/Footer.tsx, src/components/EmailCourseOptin.tsx,
//     src/components/construction/estimate/EmailEstimateCapture.tsx;
//     per tickets 0002 and 0015.
//   - HIPAA pointer wording mirrors src/pages/SmallBusiness.tsx FAQ #117-118.
//   - Public contact mailbox already published in src/pages/Classes.tsx:383
//     and src/pages/classes/ClassSession.tsx (mutaaf@digitalcraftai.com).
//
// Per the 2026-05-25 SEO Pilot lesson (docs/LESSONS.md), /trust is NOT in the
// index.html SEO Pilot pages table, so document.title falls back to homepage
// title on SPA navigation; Helmet still drives our meta[name="description"].

type Section = {
  id: string;
  heading: string;
  body: React.ReactNode;
};

// Single source for the page's meta description, reused by Helmet so editors
// only have to change it in one place.
const TRUST_DESCRIPTION =
  'How the Digital Craft AI demos handle your data. The third-party providers we use, where scraped website data and voice call audio actually go, what we never store on our servers, and how to request deletion.';

// Single source for the provider list. The visible card and the page narrative
// both read from this array so they cannot drift, and the e2e spec checks each
// expected name appears in the rendered body.
const PROVIDERS: { name: string; purpose: string }[] = [
  { name: 'OpenAI', purpose: 'GPT-4o powers chat, vision, and streaming completions across every demo.' },
  { name: 'Vapi', purpose: 'Voice infrastructure for browser WebRTC calls and outbound phone calls in the voice negotiator demo.' },
  { name: 'ElevenLabs', purpose: 'Neural text-to-speech (Cassidy voice, Turbo v2.5) used inside Vapi for the AI voice.' },
  { name: 'Deepgram', purpose: 'Speech-to-text (Nova-2) used inside Vapi to transcribe what callers say.' },
  { name: 'Firecrawl', purpose: 'Primary web scraper for the "enter your website" demo personalization flow.' },
  { name: 'Jina', purpose: 'Reader-mode fallback when Firecrawl is unavailable; same purpose, same flow.' },
  { name: 'Formspree', purpose: 'Receives newsletter sign-ups, the 5-day email course opt-in, and "email me this estimate" submissions.' },
  { name: 'Sentry', purpose: 'Error tracking for browser-side exceptions so we can fix bugs visitors hit.' },
  { name: 'Google Analytics', purpose: 'Aggregated page-view and CTA-click counts (property G-JQ53W917HT).' },
];

const SECTIONS: Section[] = [
  {
    id: 'scraped-website-data',
    heading: 'Where your scraped website data goes',
    body: (
      <>
        <p>
          When you enter a company URL on a demo page, we send the URL to our serverless
          scraper (Firecrawl primary, Jina Reader fallback), pull back the public HTML
          you would see in a browser, and ask OpenAI to extract a small company profile
          (name, tagline, services, location). That profile lives only in your browser:
          we never write it to a Digital Craft database, and the next visitor on the same
          machine is the only person who will ever see it.
        </p>
        <p className="mt-3">
          The scrape itself goes through our serverless proxy so the Firecrawl and Jina
          API keys never touch your browser. If your site already exposes a robots.txt
          rule against crawling, the scrape will fail and the demo politely degrades to a
          generic example.
        </p>
      </>
    ),
  },
  {
    id: 'voice-call-audio',
    heading: 'Where your voice call audio and transcripts go',
    body: (
      <>
        <p>
          The voice negotiator demo can run in your browser (WebRTC) or as a real outbound
          phone call. Either way, the audio is handled by Vapi, which uses Deepgram for
          speech-to-text and ElevenLabs for text-to-speech. The conversation prompt is
          assembled in your browser, sent through our serverless proxy to OpenAI, and the
          live transcript is pulled from Vapi by polling every three seconds during the
          call.
        </p>
        <p className="mt-3">
          When the call ends, the transcript is summarized once via OpenAI and shown to
          you. We do not persist the audio or the transcript on a Digital Craft server.
          Vapi and the underlying providers (OpenAI, Deepgram, ElevenLabs) retain data
          under their own enterprise privacy terms; if you need that nailed down for a
          procurement review, ask and we will share the relevant DPAs.
        </p>
      </>
    ),
  },
  {
    id: 'email-form-submissions',
    heading: 'Where your email submissions go',
    body: (
      <>
        <p>
          Three places on the site accept your email: the footer newsletter, the 5-day AI
          implementation email course opt-in, and the optional "email me this estimate"
          field on the estimate demo. All three submit directly to Formspree (form id
          xovekqqk) and nowhere else. We do not relay these submissions through a Digital
          Craft database or a third-party marketing automation tool.
        </p>
        <p className="mt-3">
          Formspree forwards the message to our shared inbox. From there it is a regular
          email, not a tracked sequence; you can reply STOP to any reply and we will stop.
        </p>
      </>
    ),
  },
  {
    id: 'browser-storage',
    heading: 'What we keep in your browser storage',
    body: (
      <>
        <p>
          Personalization state lives in your browser, not on our servers. Specifically:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">localStorage</strong>: the
            scraped company profile, keyed per industry vertical (for example
            <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm">dca_demo_company_construction</code>).
            This is what makes the "continue your demo" prompt work when you come back the
            next day. Clearing localStorage resets it.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">sessionStorage</strong>: the
            AI response cache with the prefix
            <code className="mx-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-sm">dca_deal_</code>
            and a 30-minute TTL, so re-running the same deal analyzer step inside the same
            tab is instant and does not re-bill an OpenAI call. Closing the tab clears it.
          </li>
        </ul>
        <p className="mt-3">
          No third-party tracker writes these entries. You can inspect them yourself in
          your browser dev tools under Application &rarr; Storage.
        </p>
      </>
    ),
  },
  {
    id: 'never-stored',
    heading: 'What we never store on Digital Craft servers',
    body: (
      <>
        <p>
          The site is a static React app plus a thin serverless API. We do not run a
          customer database, an authentication system, or a CRM. Specifically, none of
          the following ever lands in a Digital Craft datastore:
        </p>
        <ul className="mt-3 list-disc pl-6 space-y-2">
          <li>Your scraped website profile (browser only).</li>
          <li>Your voice call audio or live transcript (handled by Vapi, summarized once, then discarded by us).</li>
          <li>Your chat conversations with the lead-responder demo (browser session only).</li>
          <li>Your estimate inputs or results, unless you explicitly email them to yourself, in which case Formspree carries the message.</li>
        </ul>
        <p className="mt-3">
          The serverless functions in our API proxy AI requests so the OpenAI, Vapi,
          Firecrawl, and Jina keys never reach your browser. They are stateless: a
          request arrives, the function calls the upstream provider, the response is
          streamed back, and nothing is logged at our layer beyond what Sentry needs to
          report an exception. For HIPAA-bound deployments we configure under BAAs with
          our providers; that is a sales-cycle conversation, not a default of the public
          demos.
        </p>
      </>
    ),
  },
  {
    id: 'deletion-contact',
    heading: 'How to request deletion or ask a question',
    body: (
      <>
        <p>
          Because the demos do not write your data to a Digital Craft database in the
          first place, "delete my data" is mostly a question of clearing your own browser
          storage and asking our upstream providers to do the same on their end. We are
          happy to help with both.
        </p>
        <p className="mt-3">
          Email{' '}
          <a
            href="mailto:mutaaf@digitalcraftai.com?subject=Data%20deletion%20request"
            className="text-primary hover:underline"
          >
            mutaaf@digitalcraftai.com
          </a>{' '}
          with the URL you scraped, the approximate time you ran the demo, and what you
          want removed. We will confirm what was browser-side only (which you can clear
          yourself in one click) and which providers we need to ask on your behalf.
        </p>
      </>
    ),
  },
];

const Trust: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>How Our Demos Handle Your Data | Trust & Privacy | DigitalCraft AI</title>
        <meta name="description" content={TRUST_DESCRIPTION} />
        <link rel="canonical" href="https://digitalcraftai.com/trust" />
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <ShieldCheck size={16} />
            Trust & Privacy
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            How Our Demos <span className="text-primary">Handle Your Data</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Plain-language answers to the questions a careful owner asks before pasting a
            real customer's data into an AI demo. No legalese, no popup, no claim that
            isn't already true in the code.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {s.heading}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Providers card */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              The third-party providers behind the demos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Generic AI vendors hide their stack. Ours is named here in full, with what
              each one is actually used for. If a provider is not on this list, we are
              not sending your data to it.
            </p>
            <ul className="space-y-3">
              {PROVIDERS.map((p) => (
                <li
                  key={p.name}
                  className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
                >
                  <span className="font-semibold text-gray-900 dark:text-white shrink-0 min-w-[7.5rem]">
                    {p.name}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                    {p.purpose}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
              Every AI provider key listed here lives in a Vercel serverless function, not
              the browser. The page you are reading right now made zero API calls to load.
            </p>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <article key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                  {s.heading}
                </h2>
                <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {s.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Comfortable? Try a Demo on Your Own Business.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Now that you know where your data goes, paste your website URL into any demo
            and see the AI built for your industry, personalized to your brand.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'trust_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
            <Link
              to="/demos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('view_demos', 'trust_cta')}
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

export default Trust;
