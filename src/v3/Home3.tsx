import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowUpRight, Check, Phone, MessageSquare, Calculator, PhoneCall, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import LiveChatBubble from '@/components/LiveChatBubble';
import { useContent } from '@/hooks/useContent';
import { useAnalytics, useEngagementTracking, trackCTAClick } from '@/utils/analytics';
import { ORGANIZATION_SCHEMA } from '@/data/organizationSchema';
import { StageWindow } from './deck';
import Savings from './Savings';
import { openTry } from './TrySheet';
import { CALENDLY, VERTICALS, domainOf } from './verticals';
import { useFold } from './fold';

// v3 landing for digitalcraftai.com, daylight edition (2026-11-12, the owner's notes: lighter, show the
// customer what they get and what it saves them, far fewer words). Order: the promise + their own
// numbers (Savings), what clients actually got, what you get (each one live), how it works, their
// words, the price, one close. Client results are the site's existing public ones (content.json,
// src/data/ctoCopy.ts); the calculator is the visitor's estimate and says so.

const PRODUCT_NAME = 'Digital Craft AI Automation';

const RESULTS = [
  { before: 'Hours', after: '47 sec', what: 'to answer a new lead', who: 'Residential development firm' },
  { before: 'Days', after: '< 1 hr', what: 'to send an estimate', who: 'Multi-location service business' },
  { before: '20 hrs/wk', after: '0', what: 'of retyping bookings', who: 'Family entertainment center' },
  { before: '', after: '6 weeks', what: 'to pay for itself', who: 'Residential development firm' },
];

const GET = [
  { icon: PhoneCall, title: 'Every call answered', line: 'Day, night, weekends. It books the job.', to: '/construction/demo/voice-negotiator' },
  { icon: MessageSquare, title: 'Every lead in 60 seconds', line: 'Texts back, qualifies, schedules.', to: '/construction/demo/lead-responder' },
  { icon: Calculator, title: 'Estimates same day', line: 'Priced from your numbers, sent while they’re hot.', to: '/construction/demo/estimate' },
  { icon: Star, title: 'More 5-star reviews', line: 'Asks happy customers, replies in your voice.', to: '/construction/demo/reviews' },
];

const rise = (i: number) => ({ '--i': i }) as React.CSSProperties;

const Home3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  const [site, setSite] = useState('');
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);
  // honor /#contact and /#pricing (the navbar's links from other pages) once content is in
  useEffect(() => {
    if (!content || !window.location.hash) return;
    const t = window.setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
    return () => window.clearTimeout(t);
  }, [content]);

  const seo = content?.seo;
  const mvp = content?.mvpPromotion;
  const tiers = content?.pricingTiers;
  const buildPrice = Number(mvp?.price?.replace(/[^0-9.]/g, '')) || 4999;
  const plus = tiers?.tiers.find((t) => t.highlighted) ?? tiers?.tiers[0];

  const tryHere = (e: React.FormEvent) => {
    e.preventDefault();
    trackCTAClick('v3_hero_try', domainOf(site) ? 'with_site' : 'empty');
    openTry({ site: domainOf(site) || site || null });
  };

  const open = form === 'open';
  const words = (
    <div>
      <div className="v3-rise v3-eyebrow mb-5 flex items-center gap-2.5" style={rise(0)}>
        <span className="v3-tick" /> For contractors, home services &amp; local businesses
      </div>
      <h1 className={`v3-rise mb-5 font-semibold leading-[1.02] text-gray-900 ${open ? 'text-[50px]' : 'text-[42px] sm:text-[56px] lg:text-[68px]'}`} style={rise(1)}>
        Stop losing jobs to <span className="v3-serif italic text-aurora">missed calls.</span>
      </h1>
      <p className="v3-rise mb-7 max-w-[32rem] text-lg leading-relaxed text-gray-600 md:text-xl" style={rise(2)}>
        AI that answers every lead, sends the estimate and books the job, while you&rsquo;re on site.
      </p>
      <form onSubmit={tryHere} className={`v3-rise mb-4 flex max-w-[32rem] flex-col gap-2 ${open ? '' : 'sm:flex-row'}`} style={rise(3)}>
        <label htmlFor="v3-hero-site" className="sr-only">Your company website</label>
        <input id="v3-hero-site" className="v3-input flex-1" inputMode="url" autoCapitalize="none" spellCheck={false} placeholder="yourcompany.com" value={site} onChange={(e) => setSite(e.target.value)} />
        <button type="submit" className="v3-btn v3-btn-aurora">See it on my company <ArrowRight size={17} /></button>
      </form>
      <div className="v3-rise flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600" style={rise(4)}>
        <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-aurora" /> Free, no signup</span>
        <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-aurora" /> Live in 2 weeks</span>
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_discovery', 'v3_hero')} className="inline-flex items-center gap-1.5 font-medium text-gray-900 underline-offset-4 hover:underline">
          <Phone size={15} /> Book a call
        </a>
      </div>
    </div>
  );
  const calc = <Savings className="v3-rise" buildPrice={buildPrice} monthly={plus?.price ?? 999} />;

  return (
    <div className="min-h-screen overflow-x-clip text-gray-800">
      <Helmet>
        <title>{seo?.title ?? 'DigitalCraft AI | AI Automation for Traditional Industries'}</title>
        {seo && <meta name="description" content={seo.description} />}
        {seo && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalcraftai.com/" />
        {seo && <meta property="og:title" content={seo.title} />}
        {seo && <meta property="og:description" content={seo.description} />}
        <meta property="og:image" content="/og-default.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://digitalcraftai.com/" />
        {seo && <script type="application/ld+json">{JSON.stringify({ ...ORGANIZATION_SCHEMA, description: seo.description })}</script>}
        {tiers && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org', '@type': 'Product', name: PRODUCT_NAME, description: tiers.subheadline,
            brand: { '@type': 'Brand', name: 'Digital Craft AI' }, url: 'https://digitalcraftai.com',
            offers: tiers.tiers.map((t) => ({ '@type': 'Offer', name: t.name, description: t.description, price: String(t.price), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: t.ctaLink, category: t.period })),
          })}</script>
        )}
      </Helmet>
      <Navbar />

      {/* ── the promise, and what it's worth to you ─────────────────────────────────────── */}
      {open ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }}>
          <div className="flex items-center px-8 pb-10 pt-24">{calc}</div>
          <div aria-hidden />
          <div className="flex flex-col justify-center px-8 pb-10 pt-24">{words}</div>
        </section>
      ) : (
        <section className="relative pt-24 md:pt-32">
          <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {words}
            <div style={rise(5)}>{calc}</div>
          </div>
        </section>
      )}

      {/* ── built for ───────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-14 max-w-[1240px] px-4 md:mt-20 md:px-6" aria-label="Industries">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="v3-eyebrow shrink-0">Built for</span>
          {VERTICALS.map((v) => (
            <Link key={v.key} to={v.path} className="v3-chip shrink-0 bg-white"><v.icon size={14} /> {v.label}</Link>
          ))}
        </div>
      </section>

      {/* ── what clients actually got ───────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6" aria-labelledby="v3-results">
        <h2 id="v3-results" className="mb-8 text-3xl font-semibold text-gray-900 md:text-[44px]">What clients <span className="v3-serif italic text-aurora">got back.</span></h2>
        <div className="grid grid-cols-2 gap-2.5 md:gap-3 lg:grid-cols-4">
          {RESULTS.map((r) => (
            <div key={r.what} className="v3-card flex flex-col p-4 md:p-6">
              <div className="mb-3 flex items-center gap-2 text-[13px] text-gray-500 md:text-sm">
                {r.before ? <><span className="line-through decoration-[#c2611f]/60">{r.before}</span><ArrowRight size={14} /></> : <span>Paid back in</span>}
              </div>
              <div className="v3-num mb-1 text-[32px] font-semibold leading-none text-gray-900 md:text-[44px]">{r.after}</div>
              <div className="mb-4 text-[14px] text-gray-700 md:text-base">{r.what}</div>
              <div className="mt-auto text-xs text-gray-500">{r.who}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── what you get (each one live) ────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6" aria-labelledby="v3-get">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 id="v3-get" className="text-3xl font-semibold text-gray-900 md:text-[44px]">What you get.</h2>
          <button type="button" onClick={() => { trackCTAClick('v3_get_try', 'root'); openTry(); }} className="inline-flex items-center gap-1.5 font-medium text-aurora hover:underline">Try all of it on your company <ArrowRight size={16} /></button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {GET.map((g) => (
            <Link key={g.title} to={g.to} className="v3-card group grid grid-cols-[44px_1fr] gap-x-4 p-5 transition-transform hover:-translate-y-0.5 lg:flex lg:flex-col lg:p-6">
              <span className="row-span-3 grid h-11 w-11 lg:mb-5 place-items-center rounded-xl bg-[var(--v3-aurora-wash)] text-aurora"><g.icon size={21} /></span>
              <div className="mb-1 text-lg font-semibold text-gray-900">{g.title}</div>
              <div className="mb-3 text-[15px] text-gray-600 lg:mb-5">{g.line}</div>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-aurora">Try it live <ArrowUpRight size={15} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── how it works, with the storyboard as the one screen ─────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6" aria-labelledby="v3-how">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 id="v3-how" className="mb-8 text-3xl font-semibold text-gray-900 md:text-[44px]">Live in two weeks.</h2>
            <ol className="space-y-6">
              {[
                ['A 30-minute call', 'You tell us where jobs slip away.'],
                [`We build it, ${mvp?.price ?? '$4,999'} fixed`, 'On your phone line, your website, your price book.'],
                ['It works while you do', 'Leads answered, estimates out, jobs on the calendar.'],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="v3-num grid h-9 w-9 shrink-0 place-items-center rounded-full border border-night-hair bg-white text-sm font-semibold text-aurora">{i + 1}</span>
                  <div><div className="text-lg font-semibold text-gray-900">{t}</div><div className="text-gray-600">{d}</div></div>
                </li>
              ))}
            </ol>
          </div>
          <StageWindow host="root" label="A missed call, caught" className="overflow-hidden rounded-[18px]" height="h-[380px] md:h-[480px]" />
        </div>
      </section>

      {/* ── in their words ──────────────────────────────────────────────────────────────── */}
      {content?.testimonials && content.testimonials.length > 0 && (
        <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6" aria-label="What clients say">
          <div className="grid gap-3 md:grid-cols-3">
            {content.testimonials.filter((t) => /Residential|Family Entertainment|Multi-Location/i.test(t.position)).slice(0, 3).map((t) => (
              <figure key={t.position} className="v3-card flex flex-col p-6">
                <div className="mb-3 flex gap-0.5 text-[#c2611f]" aria-label="5 stars">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill="currentColor" />)}</div>
                <blockquote className="mb-5 text-[16px] leading-relaxed text-gray-800">&ldquo;{t.quote.split(/(?<=\.) /).slice(0, 2).join(' ')}&rdquo;</blockquote>
                <figcaption className="mt-auto text-sm"><span className="font-semibold text-gray-900">{t.author}</span><span className="text-gray-500"> · {t.position}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── the price ───────────────────────────────────────────────────────────────────── */}
      {(mvp || tiers) && (
        <section id="pricing" className="mx-auto mt-20 max-w-[1240px] scroll-mt-24 px-4 md:mt-28 md:px-6">
          <h2 className="mb-8 text-3xl font-semibold text-gray-900 md:text-[44px]">One price to build. <span className="v3-serif italic text-gray-500">A small one to keep.</span></h2>
          <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr_1fr]">
            {mvp?.enabled && (
              <div className="v3-card flex flex-col !border-aurora/40 bg-[var(--v3-aurora-wash)] p-6">
                <div className="v3-eyebrow mb-3 !text-aurora">Build · fixed price</div>
                <div className="v3-num text-5xl font-semibold text-gray-900">{mvp.price}</div>
                <div className="mb-5 text-gray-700">Working in {mvp.subheadline.toLowerCase().replace(/^in /, '')}. You own the code.</div>
                <a href={mvp.ctaLink} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('mvp_cta', 'v3_pricing')} className="v3-btn v3-btn-aurora mt-auto">Book a free call <ArrowRight size={16} /></a>
              </div>
            )}
            {tiers?.tiers.map((t) => (
              <div key={t.name} className={`v3-card flex flex-col p-6 ${t.highlighted ? '!border-gray-900' : ''}`}>
                <div className="mb-3 flex items-center gap-2"><span className="v3-eyebrow">Keep · {t.name}</span>{t.highlighted && <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">{t.badge || 'Popular'}</span>}</div>
                <div className="mb-4"><span className="v3-num text-4xl font-semibold text-gray-900">${t.price.toLocaleString('en-US')}</span><span className="text-gray-500"> /mo</span></div>
                <ul className="mb-6 space-y-1.5 text-sm text-gray-700">
                  {t.features.slice(0, 3).map((f) => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-aurora" />{f}</li>)}
                </ul>
                <a href={t.ctaLink} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick(`tier_${t.name.toLowerCase()}`, 'v3_pricing')} className={`v3-btn mt-auto text-sm ${t.highlighted ? 'v3-btn-aurora' : 'v3-btn-ghost'}`}>{t.ctaText}</a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── the close ───────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-20 max-w-[1240px] px-4 md:mt-28 md:px-6">
        <div className="relative overflow-hidden rounded-[24px] bg-gray-900 px-6 py-14 text-center md:py-20" style={{ backgroundImage: 'radial-gradient(70% 120% at 50% 0%, rgba(123,227,195,0.18), transparent 60%)' }}>
          <h2 className="mx-auto mb-4 max-w-3xl text-4xl font-semibold text-white md:text-6xl">Watch it answer as <span className="v3-serif italic text-[#7BE3C3]">you.</span></h2>
          <p className="mx-auto mb-8 max-w-md text-lg text-gray-300">Your website in. Every demo, personalized. 20 seconds.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => { trackCTAClick('v3_close_try', 'root'); openTry(); }} className="v3-btn w-full bg-[#7BE3C3] text-gray-900 hover:bg-white sm:w-auto">See it on my company <ArrowRight size={17} /></button>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'v3_close')} className="v3-btn w-full border border-white/25 text-white hover:border-white sm:w-auto"><Phone size={16} /> Book a call</a>
          </div>
        </div>
      </section>

      {content?.form && <div className="mt-12">{<ContactForm data={content.form} />}</div>}
      {content?.footer && <Footer data={content.footer} />}
      <LiveChatBubble />
    </div>
  );
};

export default Home3;
