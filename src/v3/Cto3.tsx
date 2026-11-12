import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick, trackEvent, useAnalytics, useEngagementTracking } from '@/utils/analytics';
import { currentHostTag } from '@/utils/hostVariant';
import { FOUNDER_CREDENTIALS } from '@/data/founder';
import { MANDATE, OUTCOMES } from '@/data/ctoCopy';
import { useReveal } from './keynote';
import { CALENDLY } from './verticals';
import { useFold } from './fold';

// v3 landing for cto.digitalcraftai.com, the keynote pass (2026-11-12). One idea per screen, huge
// type, white space; copper is this site's accent. Every number is the CTO site's own
// (src/data/ctoCopy.ts); nothing here adds one.

const converted = (name: string) => trackEvent('landing_conversion', 'conversion', `${currentHostTag()}:${name}`);
const Chev = () => <ChevronRight size={18} strokeWidth={2.2} className="mt-px" />;
const ORGS = [...FOUNDER_CREDENTIALS].reverse().map((c) => c.org.replace(' Entertainment & ESPN Technology', ' · ESPN').replace(' Solutions', ''));

const Cto3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();
  useReveal([content]);
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);

  const open = form === 'open';
  const book = (where: string) => () => { trackCTAClick('book_discovery', where); converted(`book_discovery_${where}`); };
  const quote = content?.testimonials?.find((t) => /TryMinded/i.test(t.position));

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
      <Helmet>
        <title>Your Fortune 100 CTO, on retainer · DigitalCraft</title>
        <meta name="description" content="A fractional CTO who has shipped at Motorola, Amazon, and Disney, now on retainer for operators who want strategic technology leadership, not just tools. Book more jobs. Close more deals. Run ops on autopilot." />
        <link rel="canonical" href="https://cto.digitalcraftai.com" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cto.digitalcraftai.com" />
        <meta property="og:title" content="Your Fortune 100 CTO, on retainer · DigitalCraft" />
        <meta property="og:description" content="A fractional CTO who has shipped at Motorola, Amazon, and Disney, now on retainer for operators who want strategic technology leadership, not just tools." />
        <meta property="og:image" content="https://cto.digitalcraftai.com/og-cto.svg" />
        <meta property="og:site_name" content="DigitalCraft · CTO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#FFFFFF" />
      </Helmet>
      <Navbar />

      {/* ── 1 · the promise ─────────────────────────────────────────────────────────────── */}
      <section className={`flex min-h-[92svh] flex-col justify-center px-5 pb-16 pt-28 text-center md:pt-32`} style={open ? { marginLeft: 'calc(var(--v3-hinge-l) + var(--v3-hinge-w))' } : undefined}>
        <div className="v3-rise mb-4 text-[17px] font-semibold text-[#c2611f] md:text-[21px]" style={{ '--i': 0 } as React.CSSProperties}>Fractional CTO</div>
        <h1 className="v3-rise k-hero mx-auto mb-6 max-w-[12ch]" style={{ '--i': 1 } as React.CSSProperties}>A Fortune 100 CTO. On retainer.</h1>
        <p className="v3-rise k-lead mx-auto mb-9 max-w-[34ch]" style={{ '--i': 2 } as React.CSSProperties}>Book more jobs. Close more deals. Run ops on autopilot. For less than one senior hire.</p>
        <div className="v3-rise flex flex-col items-center justify-center gap-4 sm:flex-row" style={{ '--i': 3 } as React.CSSProperties}>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={book('v3_cto_hero')} className="k-pill bg-[#c2611f] text-white hover:bg-[#a9531a]">Book a discovery call</a>
          <a href="#outcomes" onClick={() => trackCTAClick('see_outcomes', 'v3_cto_hero')} className="k-link !text-[#c2611f]">See the results <Chev /></a>
        </div>
        <div className="v3-rise mx-auto mt-20 flex max-w-[760px] flex-wrap items-center justify-center gap-x-10 gap-y-3 md:mt-28" style={{ '--i': 4 } as React.CSSProperties} aria-label="Where the founder led engineering">
          {ORGS.map((o) => <span key={o} className="text-[22px] font-semibold tracking-[-0.03em] text-[#a1a1a6] md:text-[28px]">{o}</span>)}
        </div>
      </section>

      {/* ── 2 · one number ──────────────────────────────────────────────────────────────── */}
      <section id="outcomes" className="scroll-mt-16 bg-[#f5f5f7] px-5 py-28 text-center md:py-40">
        <div className="k-in">
          <div className="k-giant">0</div>
          <p className="k-lead mx-auto mt-6 max-w-[26ch]">New hires needed to scale ops across markets. <span className="text-[#1d1d1f]">The software did it.</span></p>
          <p className="mt-3 text-[14px] text-[#86868b]">A multi-year logistics client</p>
        </div>
      </section>

      {/* ── 3 · what changed ────────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1180px] px-5 py-28 md:py-40">
        <h2 className="k-in k-h2 mb-14 text-center md:mb-20">What the retainer changed.</h2>
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {OUTCOMES.map((o) => (
            <article key={o.client} className="k-in k-tile flex min-h-[300px] flex-col p-9 md:p-12">
              <div className="mb-auto text-[15px] font-semibold text-[#c2611f]">{o.vertical}</div>
              <div className="mt-10 text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[60px]">{o.headline}</div>
              <div className="mt-2 text-[19px] text-[#6e6e73]">{o.label}.</div>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4 · what I own ──────────────────────────────────────────────────────────────── */}
      <section id="mandate" className="scroll-mt-16 bg-[#f5f5f7] px-5 py-28 md:py-40">
        <div className="mx-auto max-w-[880px]">
          <h2 className="k-in k-h2 mb-14 text-center md:mb-20">What I own for you.</h2>
          <ol className="k-in divide-y divide-[#d2d2d7]">
            {MANDATE.map((m) => (
              <li key={m.n} className="py-7 md:py-8">
                <div className="text-[26px] font-semibold tracking-[-0.03em] md:text-[32px]">{m.title}</div>
                <p className="mt-1 text-[17px] text-[#6e6e73] md:text-[19px]">{m.body.split(/(?<=\.) /)[0]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 5 · in their words ──────────────────────────────────────────────────────────── */}
      {quote && (
        <section className="px-5 py-28 md:py-40">
          <figure className="k-in mx-auto max-w-[860px] text-center">
            <blockquote className="text-[26px] font-medium leading-[1.3] tracking-[-0.02em] md:text-[38px]">&ldquo;{quote.quote.split(/(?<=\.) /).slice(0, 2).join(' ').replace(/ — .*$/, '.')}&rdquo;</blockquote>
            <figcaption className="mt-6 text-[15px] text-[#86868b]">{quote.author}, {quote.position}</figcaption>
          </figure>
        </section>
      )}

      {/* ── 6 · engage ──────────────────────────────────────────────────────────────────── */}
      <section className="bg-[#1d1d1f] px-5 py-28 text-center text-white md:py-44">
        <div className="k-in">
          <h2 className="k-hero mx-auto mb-6 max-w-[13ch]">A Fortune 100 CTO, <span className="text-[#e89862]">in your corner.</span></h2>
          <p className="k-lead mx-auto mb-10 max-w-[30ch] !text-[#a1a1a6]">Thirty minutes. No pitch. The one system that would move your P&amp;L most this quarter.</p>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={book('v3_cto_engage')} className="k-pill bg-[#c2611f] text-white hover:bg-[#d97b36]">Book the call</a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Cto3;
