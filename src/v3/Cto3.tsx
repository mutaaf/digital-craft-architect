import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowDown, ArrowRight, ArrowUpRight, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick, trackEvent, useAnalytics, useEngagementTracking } from '@/utils/analytics';
import { currentHostTag } from '@/utils/hostVariant';
import { FOUNDER_CREDENTIALS } from '@/data/founder';
import { MANDATE, METRICS, OUTCOMES, STUDIO } from '@/data/ctoCopy';
import { AskPrompt, CellHead, Gauge, LaunchKeys, StageWindow, Tag, useScanOnce, type Route } from './deck';
import { CALENDLY } from './verticals';
import { useFold } from './fold';

// v3 landing for cto.digitalcraftai.com (the beta overhaul): the same instrument deck as the company
// site, wearing copper. Customer outcomes first, then the mandate, the studio, and one call to book.
// Copy is the CTO site's own (src/data/ctoCopy.ts); nothing here adds a number.

const converted = (name: string) => trackEvent('landing_conversion', 'conversion', `${currentHostTag()}:${name}`);

const Cto3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  const deck = useScanOnce<HTMLDivElement>();
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();
  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);

  const routes: Route[] = [
    { test: /\b(book|call|talk|meet|contact|email|hire|available|availability)\b/i, answer: () => <>Thirty-minute discovery call, no pitch. <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="text-[#e89862] underline">Pick a time</a>.</> },
    { test: /\b(price|pricing|cost|how much|retainer|rate|budget)\b/i, answer: () => <>A retainer that costs less than a single senior hire. The exact shape depends on the mandate; that&rsquo;s what the first call is for.</> },
    { test: /\b(who|background|experience|resume|cv|disney|amazon|motorola|espn)\b/i, answer: () => <>{FOUNDER_CREDENTIALS.map((c) => `${c.org} (${c.years})`).join(' · ')}. Fractional CTO since 2019.</> },
    { test: /\b(ai|agent|llm|gpt|claude|voice|automation)\b/i, answer: () => <>Custom agents, voice AI and LLM pipelines, wired into the tools your team already uses. <a href="https://digitalcraftai.com/demos" className="text-[#e89862] underline">See them running</a>.</> },
    { test: /\b(outcome|result|proof|case|client|roi)\b/i, answer: () => <>Lead response from hours to under a minute; twenty hours a week of manual entry gone; ops scaled with zero new hires. <a href="#outcomes" className="text-[#e89862] underline">The outcomes</a>.</> },
    { test: /\b(crisis|outage|broke|down|vendor|due diligence)\b/i, answer: () => <>Crisis response is part of the mandate: when production breaks or due diligence lands on Friday, you call someone who has been there.</> },
    { test: /\b(hi|hello|hey)\b/i, answer: () => <>Hello. Ask about outcomes, the retainer, or the background.</> },
  ];

  const open = form === 'open';
  return (
    <div className="min-h-screen overflow-x-clip text-gray-200">
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
        <meta name="theme-color" content="#0B0F12" />
      </Helmet>
      <Navbar />

      {/* ── the sky ─────────────────────────────────────────────────────────────────────── */}
      <section className={open ? '' : 'relative pt-24 md:pt-32'} style={open ? { display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' } : undefined}>
        {open && <StageWindow host="cto" label="On retainer" className="h-full !border-y-0 !border-l-0" height="h-[calc(100svh-44px)]" />}
        {open && <div aria-hidden />}
        <div className={open ? 'flex flex-col justify-center px-8 pb-12 pt-24' : 'mx-auto grid max-w-[1320px] items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.02fr_1fr] lg:gap-14'}>
          <div>
            <div className="v3-rise v3-eyebrow mb-6 flex items-center gap-2.5" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="v3-tick" /> Fractional CTO <span className="text-gray-700">/</span> on retainer
            </div>
            <h1 className={open ? "v3-rise mb-6 text-[52px] font-semibold leading-[1.02] text-white" : "v3-rise mb-6 text-[44px] font-semibold leading-[1.0] text-white sm:text-[58px] lg:text-[74px]"} style={{ '--i': 1 } as React.CSSProperties}>
              Book more jobs.<br />Close more deals.<br />Run ops on <span className="v3-serif italic text-[#e89862]">autopilot.</span>
            </h1>
            <p className="v3-rise mb-8 max-w-[34rem] text-lg leading-relaxed text-gray-400 md:text-xl" style={{ '--i': 2 } as React.CSSProperties}>
              Custom AI systems that <span className="text-gray-100">book, qualify and close</span>, delivered end-to-end on a retainer that costs less than a single senior hire. Shipped, not pitched.
            </p>
            <div className="v3-rise mb-10 flex flex-col gap-2 sm:flex-row" style={{ '--i': 3 } as React.CSSProperties}>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => { trackCTAClick('book_discovery', 'v3_cto_hero'); converted('book_discovery_hero'); }} className="v3-btn v3-btn-copper">
                Book a discovery call <ArrowUpRight size={17} />
              </a>
              <a href="#outcomes" onClick={() => trackCTAClick('see_outcomes', 'v3_cto_hero')} className="v3-btn v3-btn-ghost">See the outcomes <ArrowDown size={16} /></a>
            </div>
            {/* the credential spine */}
            <ol className="v3-rise flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-400" style={{ '--i': 4 } as React.CSSProperties} aria-label="Career">
              {[...FOUNDER_CREDENTIALS].reverse().map((c) => (
                <li key={c.org} className="flex items-center gap-3"><span className="text-gray-200">{c.org.replace(' Entertainment & ESPN Technology', ' · ESPN')}</span><span className="text-gray-700" aria-hidden>→</span></li>
              ))}
              <li className="text-[#e89862]">fractional CTO since 2019</li>
            </ol>
          </div>
          {!open && <StageWindow host="cto" label="On retainer" className="v3-rise" />}
        </div>
      </section>

      {/* ── readings ────────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-[1320px] px-4 md:mt-24 md:px-6" aria-label="Client outcomes in numbers">
        <div className="grid grid-cols-2 gap-px border border-night-hair bg-night-hair md:grid-cols-4">
          {METRICS.map((m, i) => <Gauge key={m.k} value={m.k} label={m.v} note="client outcome" accent={i === 0 ? 'text-[#e89862]' : 'text-white'} />)}
        </div>
      </section>

      {/* ── outcomes ────────────────────────────────────────────────────────────────────── */}
      <section id="outcomes" className="mx-auto mt-24 max-w-[1320px] scroll-mt-24 px-4 md:mt-32 md:px-6">
        <div className="mb-10 max-w-2xl">
          <div className="v3-eyebrow mb-4">Customer outcomes, not a résumé</div>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">What the retainer <span className="v3-serif italic text-gray-400">actually changed.</span></h2>
        </div>
        <div ref={deck.ref} className="v3-deck v3-brackets">
          {deck.scan && <div className="v3-scan" aria-hidden />}
          {OUTCOMES.map((o, i) => (
            <article key={o.client} className="v3-cell col-span-12 flex flex-col md:col-span-6">
              <div className="mb-6 flex items-center justify-between gap-3"><Tag>{String(i + 1).padStart(2, '0')} · {o.vertical}</Tag><span className="text-xs text-gray-500">{o.client}</span></div>
              <div className="mb-1 text-4xl font-semibold tracking-tight text-white md:text-5xl">{o.headline}</div>
              <div className="mb-4 text-[#e89862]">{o.label}</div>
              <p className="mb-6 text-gray-400">{o.body}</p>
              <span className="mt-auto inline-flex w-fit items-center gap-2 rounded-full border border-night-hair px-3 py-1 text-xs text-gray-300"><span className="v3-dot" />{o.chip}</span>
            </article>
          ))}
          <LaunchKeys
            where="cto_deck"
            keys={[
              { n: 1, title: 'Book a call', sub: '30 minutes, no pitch', to: CALENDLY, external: true },
              { n: 2, title: 'The mandate', sub: 'What I own for you', to: '#mandate', external: true },
              { n: 3, title: 'Live AI demos', sub: 'The systems, running', to: 'https://digitalcraftai.com/demos', external: true },
              { n: 4, title: 'Case studies', sub: 'The longer stories', to: '/case-studies' },
            ]}
          />
        </div>
      </section>

      {/* ── the mandate + ask ───────────────────────────────────────────────────────────── */}
      <section id="mandate" className="mx-auto mt-24 max-w-[1320px] scroll-mt-24 px-4 md:mt-32 md:px-6">
        <div className="v3-deck">
          <div className="v3-cell col-span-12 lg:col-span-7">
            <CellHead tag="mandate" title="What I own for you" />
            <ol className="divide-y divide-night-hair border-y border-night-hair">
              {MANDATE.map((m) => (
                <li key={m.n} className="grid grid-cols-[44px_1fr] gap-2 py-5">
                  <span className="v3-mono pt-1 text-sm text-[#e89862]">{m.n}</span>
                  <div><div className="mb-1 text-lg font-semibold text-white">{m.title}</div><p className="text-sm leading-relaxed text-gray-400">{m.body}</p></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="v3-cell col-span-12 lg:col-span-5">
            <CellHead tag="ask" title="Ask anything" aside={<Tag className="hidden sm:block">a router, not a model</Tag>} />
            <AskPrompt
              where="cto"
              routes={routes}
              greeting={<>Ask about outcomes, the retainer, or the background.</>}
              chips={['what does it cost?', 'what changed for clients?', 'what’s your background?', 'can you build AI agents?']}
              fallback={<>I&rsquo;m a simple router, not a model, so that one&rsquo;s for the call. <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="text-[#e89862] underline">Book thirty minutes</a>.</>}
            />
          </div>
        </div>
      </section>

      {/* ── the studio ──────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[1320px] px-4 md:mt-32 md:px-6" aria-label="The studio">
        <div className="mb-10 max-w-2xl">
          <div className="v3-eyebrow mb-4">The studio behind the retainer</div>
          <h2 className="text-4xl font-semibold text-white md:text-5xl">One accountable lead. <span className="v3-serif italic text-gray-400">Five crafts.</span></h2>
        </div>
        <div className="border-y border-night-hair">
          {STUDIO.map((s) => (
            <div key={s.n} className="grid gap-2 border-b border-night-hair py-6 last:border-b-0 md:grid-cols-[60px_1.1fr_1.4fr_1.3fr] md:items-baseline md:gap-6">
              <span className="v3-mono text-sm text-gray-600">{s.n}</span>
              <div className="text-xl font-semibold text-white">{s.role}</div>
              <div className="text-gray-400">{s.craft}</div>
              <div className="v3-mono text-xs text-gray-500">{s.stack}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── engage ──────────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mb-24 mt-24 max-w-[1320px] px-4 md:mt-32 md:px-6">
        <div className="relative overflow-hidden border border-night-hair px-6 py-16 md:px-16 md:py-24" style={{ background: 'radial-gradient(70% 120% at 20% 50%, rgba(201,110,44,0.16), transparent 60%), var(--v3-deck)' }}>
          <div className="v3-eyebrow mb-5">Engage</div>
          <h2 className="mb-6 max-w-3xl text-5xl font-semibold leading-[0.98] text-white md:text-7xl">A Fortune 100 CTO, <span className="v3-serif italic text-[#e89862]">in your corner.</span></h2>
          <p className="mb-10 max-w-xl text-lg text-gray-400">Thirty-minute discovery call. No pitch. We&rsquo;ll map the one system that, if built, would change your P&amp;L most this quarter, and whether I&rsquo;m the right person to build it.</p>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => { trackCTAClick('book_discovery', 'v3_cto_engage'); converted('book_discovery_engage'); }} className="v3-btn v3-btn-copper !min-h-[56px] !px-7 text-lg">
            <Phone size={18} /> Book the call <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Cto3;
