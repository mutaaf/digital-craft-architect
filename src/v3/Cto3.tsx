import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowDown, ArrowRight, ArrowUpRight, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick, trackEvent, useAnalytics, useEngagementTracking } from '@/utils/analytics';
import { currentHostTag } from '@/utils/hostVariant';
import { FOUNDER_CREDENTIALS } from '@/data/founder';
import { MANDATE, METRICS, OUTCOMES } from '@/data/ctoCopy';
import { StageWindow } from './deck';
import { CALENDLY } from './verticals';
import { useFold } from './fold';

// v3 landing for cto.digitalcraftai.com, daylight edition (2026-11-12, the owner's notes: lighter,
// outcomes first, fewer words). Copper is this site's accent. Every number is the CTO site's own
// (src/data/ctoCopy.ts); nothing here adds one.

const converted = (name: string) => trackEvent('landing_conversion', 'conversion', `${currentHostTag()}:${name}`);
const COPPER = 'text-[#c2611f]';
const rise = (i: number) => ({ '--i': i }) as React.CSSProperties;

const Cto3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);

  const open = form === 'open';
  const book = (where: string) => () => { trackCTAClick('book_discovery', where); converted(`book_discovery_${where}`); };

  const words = (
    <div>
      <div className="v3-rise v3-eyebrow mb-5 flex items-center gap-2.5" style={rise(0)}>
        <span className="v3-tick" /> Fractional CTO · on retainer
      </div>
      <h1 className={`v3-rise mb-5 font-semibold leading-[1.0] text-gray-900 ${open ? 'text-[50px]' : 'text-[42px] sm:text-[56px] lg:text-[68px]'}`} style={rise(1)}>
        Book more jobs.<br />Close more deals.<br />Run ops on <span className={`v3-serif italic ${COPPER}`}>autopilot.</span>
      </h1>
      <p className="v3-rise mb-7 max-w-[32rem] text-lg leading-relaxed text-gray-600 md:text-xl" style={rise(2)}>
        A Fortune 100 technology leader on your team, for less than one senior hire.
      </p>
      <div className="v3-rise mb-8 flex flex-col gap-2 sm:flex-row" style={rise(3)}>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={book('v3_cto_hero')} className="v3-btn v3-btn-copper">Book a discovery call <ArrowUpRight size={17} /></a>
        <a href="#outcomes" onClick={() => trackCTAClick('see_outcomes', 'v3_cto_hero')} className="v3-btn v3-btn-ghost">See the results <ArrowDown size={16} /></a>
      </div>
      <ol className="v3-rise flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-gray-600" style={rise(4)} aria-label="Career">
        {[...FOUNDER_CREDENTIALS].reverse().map((c) => (
          <li key={c.org} className="flex items-center gap-3"><span className="font-medium text-gray-900">{c.org.replace(' Entertainment & ESPN Technology', ' · ESPN')}</span><span className="text-gray-400" aria-hidden>→</span></li>
        ))}
        <li className={COPPER}>your CTO</li>
      </ol>
    </div>
  );

  const numbers = (
    <div className="v3-card v3-rise overflow-hidden" style={rise(5)}>
      <div className="flex items-center justify-between border-b border-night-hair px-5 py-3.5 md:px-6">
        <span className="v3-eyebrow !text-[10.5px]">What clients got</span>
        <span className={`v3-eyebrow !text-[10.5px] ${COPPER}`}>real results</span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-night-hair">
        {METRICS.map((m, i) => (
          <div key={m.k} className={`px-5 py-6 md:px-6 md:py-8 ${i === 0 ? 'bg-[#fbf1e9]' : 'bg-night-deck'}`}>
            <div className={`v3-num text-[38px] font-semibold leading-none md:text-[52px] ${i === 0 ? COPPER : 'text-gray-900'}`}>{m.k}</div>
            <div className="mt-2 text-sm text-gray-700">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const quotes = (content?.testimonials ?? []).filter((t) => /Overwatch|TryMinded|Recyclops/i.test(t.position)).slice(0, 3);

  return (
    <div className="min-h-screen overflow-x-clip text-gray-800">
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
        <meta name="theme-color" content="#F6F4EF" />
      </Helmet>
      <Navbar />

      {open ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }}>
          <div className="flex items-center px-8 pb-10 pt-24">{numbers}</div>
          <div aria-hidden />
          <div className="flex flex-col justify-center px-8 pb-10 pt-24">{words}</div>
        </section>
      ) : (
        <section className="relative pt-24 md:pt-32">
          <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {words}
            {numbers}
          </div>
        </section>
      )}

      {/* ── outcomes ────────────────────────────────────────────────────────────────────── */}
      <section id="outcomes" className="mx-auto mt-20 max-w-[1240px] scroll-mt-24 px-4 md:mt-28 md:px-6">
        <h2 className="mb-8 text-3xl font-semibold text-gray-900 md:text-[44px]">What the retainer <span className={`v3-serif italic ${COPPER}`}>changed.</span></h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OUTCOMES.map((o) => (
            <article key={o.client} className="v3-card flex flex-col p-6">
              <div className="v3-eyebrow mb-5 !text-[10.5px]">{o.vertical}</div>
              <div className="v3-num mb-1 text-[34px] font-semibold leading-tight text-gray-900">{o.headline}</div>
              <div className={`mb-5 ${COPPER}`}>{o.label}</div>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-night-hair pt-4 text-xs text-gray-500">
                <span>{o.client}</span><span className="font-medium text-gray-700">{o.chip}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── the mandate, with the storyboard as the one screen ──────────────────────────── */}
      <section id="mandate" className="mx-auto mt-20 max-w-[1240px] scroll-mt-24 px-4 md:mt-28 md:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="mb-8 text-3xl font-semibold text-gray-900 md:text-[44px]">What I own for you.</h2>
            <ol className="divide-y divide-night-hair border-y border-night-hair">
              {MANDATE.map((m) => (
                <li key={m.n} className="grid grid-cols-[40px_1fr] gap-2 py-4">
                  <span className={`v3-mono pt-0.5 text-sm ${COPPER}`}>{m.n}</span>
                  <div><div className="text-lg font-semibold text-gray-900">{m.title}</div><p className="text-[15px] text-gray-600">{m.body.split(/(?<=\.) /)[0]}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <StageWindow host="cto" label="On retainer" className="overflow-hidden rounded-[18px]" height="h-[380px] md:h-[480px]" />
        </div>
      </section>

      {/* ── in their words ──────────────────────────────────────────────────────────────── */}
      {quotes.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6" aria-label="What clients say">
          <div className="grid gap-3 md:grid-cols-3">
            {quotes.map((t) => (
              <figure key={t.position} className="v3-card flex flex-col p-6">
                <blockquote className="mb-5 text-[16px] leading-relaxed text-gray-800">&ldquo;{t.quote.split(/(?<=\.) /).slice(0, 2).join(' ')}&rdquo;</blockquote>
                <figcaption className="mt-auto text-sm"><span className="font-semibold text-gray-900">{t.author}</span><span className="text-gray-500"> · {t.position}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── engage ──────────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mb-20 mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6">
        <div className="relative overflow-hidden rounded-[24px] bg-gray-900 px-6 py-14 md:px-16 md:py-20" style={{ backgroundImage: 'radial-gradient(70% 120% at 15% 50%, rgba(201,110,44,0.28), transparent 60%)' }}>
          <h2 className="mb-4 max-w-3xl text-4xl font-semibold leading-[1.02] text-white md:text-6xl">A Fortune 100 CTO, <span className="v3-serif italic text-[#e89862]">in your corner.</span></h2>
          <p className="mb-8 max-w-lg text-lg text-gray-300">30 minutes. No pitch. The one system that would move your P&amp;L most this quarter.</p>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={book('v3_cto_engage')} className="v3-btn v3-btn-copper !min-h-[54px] !px-7 text-lg">
            <Phone size={18} /> Book the call <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Cto3;
