import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import LiveChatBubble from '@/components/LiveChatBubble';
import { useContent } from '@/hooks/useContent';
import { useAnalytics, useEngagementTracking, trackCTAClick } from '@/utils/analytics';
import { ORGANIZATION_SCHEMA } from '@/data/organizationSchema';
import Savings from './Savings';
import PhoneDemo from './PhoneDemo';
import { useReveal } from './keynote';
import { openTry } from './TrySheet';
import { TryField, BookCall, StickyTry } from './Cta';
import { CALENDLY } from './verticals';
import { useFold } from './fold';

// v3 landing for digitalcraftai.com, the keynote pass (2026-11-12; the owner: "not approved by Apple
// and Tesla standards"). One idea per screen, huge type, white space, a product shot instead of a
// diagram, pill buttons, nothing that reads like a dashboard. Results are the site's existing public
// client outcomes; the phone is labelled an illustration; the calculator is the visitor's estimate.

const PRODUCT_NAME = 'Digital Craft AI Automation';

const Chev = () => <ChevronRight size={18} strokeWidth={2.2} className="mt-px" />;

const Home3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();
  useReveal([content]);

  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);
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
  const lowest = tiers?.tiers.reduce((m, t) => Math.min(m, t.price), Infinity);
  const quote = content?.testimonials?.find((t) => /Residential/i.test(t.position));

  const go = (where: string) => () => { trackCTAClick('v3_try', where); openTry(); };

  const open = form === 'open';
  const heroWords = (
    <div className={open ? '' : 'text-center'}>
      <div className="v3-rise mb-4 text-[17px] font-semibold text-aurora md:text-[21px]" style={{ '--i': 0 } as React.CSSProperties}>DigitalCraft AI</div>
      <h1 className={`v3-rise k-hero mb-5 max-w-[11ch] text-[#1d1d1f] ${open ? '' : 'mx-auto'}`} style={{ '--i': 1 } as React.CSSProperties}>Never miss a job again.</h1>
      <p className={`v3-rise k-lead mb-8 ${open ? '' : 'mx-auto'}`} style={{ '--i': 2 } as React.CSSProperties}>AI that answers, quotes and books.<br />While you work.</p>
      <div className="v3-rise" style={{ '--i': 3 } as React.CSSProperties}>
        <TryField where="home_hero" align={open ? 'left' : 'center'} />
        <div className={`mt-5 ${open ? '' : 'text-center'}`}><BookCall where="v3_hero" /></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
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

      {/* ── 1 · the promise and the product ─────────────────────────────────────────────── */}
      {open ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }}>
          <div className="flex items-center justify-center overflow-hidden bg-[#f5f5f7] pt-16"><PhoneDemo /></div>
          <div aria-hidden />
          <div className="flex flex-col justify-center px-10 pt-16">{heroWords}</div>
        </section>
      ) : (
        <section className="px-5 pt-28 md:pt-36">
          {heroWords}
          <div className="v3-rise mt-14 md:mt-20" style={{ '--i': 4 } as React.CSSProperties}><PhoneDemo /></div>
        </section>
      )}

      {/* ── 2 · one number ──────────────────────────────────────────────────────────────── */}
      <section className="mt-28 bg-[#f5f5f7] px-5 py-28 text-center md:mt-40 md:py-40">
        <div className="k-in k-spread">
          <div className="k-giant text-[#1d1d1f]">47<span className="text-aurora">s</span></div>
          <div>
            <p className="k-lead mx-auto mt-6 max-w-[26ch]">Time to answer a new lead. <span className="text-[#1d1d1f]">It used to take hours.</span></p>
            <p className="mt-3 text-[14px] text-[#6e6e73]">A residential development client</p>
          </div>
        </div>
      </section>

      {/* ── 3 · what it does ────────────────────────────────────────────────────────────── */}
      <section className="k-wide mx-auto max-w-[1180px] px-5 py-28 md:py-40">
        <h2 className="k-in k-h2 k-pane-l mb-14 text-center md:mb-20">Four jobs. Done for you.</h2>
        <div className="k-spread grid gap-4 md:grid-cols-2 md:gap-5">
          {/* calls */}
          <Link to="/construction/demo/voice-negotiator" className="k-in k-tile group flex min-h-[400px] flex-col p-9 md:p-12">
            <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">Answers every call.</h3>
            <p className="mb-4 text-[17px] text-[#6e6e73]">Nights, weekends, holidays.</p>
            <span className="k-link">Talk to it <Chev /></span>
            <div className="mt-auto flex h-24 items-end justify-center gap-[5px] pt-10" aria-hidden>
              {[18, 34, 52, 28, 64, 80, 46, 70, 38, 58, 84, 50, 30, 62, 40, 22, 48, 26, 14].map((h, i) => <span key={i} className="w-[6px] rounded-full bg-aurora/80" style={{ height: `${h}%` }} />)}
            </div>
          </Link>
          {/* estimates */}
          <Link to="/construction/demo/estimate" className="k-in k-tile group flex min-h-[400px] flex-col p-9 md:p-12">
            <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">Quotes in minutes.</h3>
            <p className="mb-4 text-[17px] text-[#6e6e73]">Priced from your numbers.</p>
            <span className="k-link">Build one <Chev /></span>
            <div className="mx-auto mt-auto w-full max-w-[300px] rounded-2xl bg-white p-5 text-[14px] shadow-[0_20px_40px_-24px_rgba(0,0,0,0.3)]" aria-hidden>
              {[['Tear-off & haul', '$2,180'], ['Architectural shingles', '$6,420'], ['Flashing & vents', '$940']].map(([a, b]) => <div key={a} className="flex justify-between py-1.5 text-[#6e6e73]"><span>{a}</span><span className="v3-num text-[#1d1d1f]">{b}</span></div>)}
              <div className="mt-2 flex justify-between border-t border-[#e8e8ed] pt-3 font-semibold"><span>Total</span><span className="v3-num">$9,540</span></div>
            </div>
          </Link>
          {/* follow-up */}
          <Link to="/construction/demo/sms-sequence" className="k-in k-tile group flex min-h-[400px] flex-col p-9 md:p-12">
            <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">Follows up. Every time.</h3>
            <p className="mb-4 text-[17px] text-[#6e6e73]">No lead goes cold again.</p>
            <span className="k-link">See the sequence <Chev /></span>
            <div className="mt-auto flex items-center justify-between gap-2 pt-10" aria-hidden>
              {['Day 0', 'Day 1', 'Day 3', 'Day 7', 'Booked'].map((d, i) => (
                <div key={d} className="flex flex-1 flex-col items-center gap-2">
                  <span className={`h-4 w-4 rounded-full ${i === 4 ? 'bg-aurora ring-4 ring-aurora/20' : 'bg-[#d2d2d7]'}`} />
                  <span className={`text-[12.5px] ${i === 4 ? 'font-semibold text-aurora' : 'text-[#6e6e73]'}`}>{d}</span>
                </div>
              ))}
            </div>
          </Link>
          {/* reviews */}
          <Link to="/construction/demo/reviews" className="k-in k-tile group flex min-h-[400px] flex-col p-9 md:p-12">
            <h3 className="mb-2 text-[28px] font-semibold tracking-[-0.03em] md:text-[34px]">Five stars, on autopilot.</h3>
            <p className="mb-4 text-[17px] text-[#6e6e73]">Asks happy customers. Replies in your voice.</p>
            <span className="k-link">See how <Chev /></span>
            <div className="mt-auto flex justify-center gap-1.5 pt-10 text-[#c2611f]" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={44} fill="currentColor" strokeWidth={0} />)}
            </div>
          </Link>
        </div>
      </section>

      {/* ── 4 · what it's worth to you ──────────────────────────────────────────────────── */}
      <section className="bg-[#f5f5f7] px-5 py-28 md:py-40">
        <div className="k-wide mx-auto max-w-[1080px]">
          <h2 className="k-in k-h2 k-pane-l mb-4 text-center">What missed calls cost you.</h2>
          <p className="k-in k-lead k-pane-l mx-auto mb-14 max-w-[28ch] text-center md:mb-20">Move the sliders. Your numbers, your answer.</p>
          <div className="k-in k-spread-card rounded-[32px] bg-white p-8 md:p-14">
            <Savings className="k-spread" buildPrice={buildPrice} monthly={plus?.price ?? 999} onAction={go('savings')} />
          </div>
        </div>
      </section>

      {/* ── 5 · proof ───────────────────────────────────────────────────────────────────── */}
      <section className="k-wide mx-auto max-w-[1180px] px-5 py-28 md:py-40">
        <div className="k-in k-spread grid gap-12 text-center md:grid-cols-3 md:gap-6">
          {[['< 1 hr', 'to send an estimate.', 'It used to take days.'], ['0', 'hours retyping bookings.', 'It used to be 20 a week.'], ['6 wks', 'to pay for itself.', 'For a development firm.']].map(([n, a, b]) => (
            <div key={a}>
              <div className="v3-num text-[64px] font-semibold leading-none tracking-[-0.05em] md:text-[80px]">{n}</div>
              <div className="mt-3 text-[19px] text-[#1d1d1f]">{a}</div>
              <div className="text-[17px] text-[#6e6e73]">{b}</div>
            </div>
          ))}
        </div>
        {quote && (
          <figure className="k-in k-pane-l mx-auto mt-24 max-w-[820px] text-center md:mt-32">
            <blockquote className="text-[26px] font-medium leading-[1.3] tracking-[-0.02em] md:text-[36px]">&ldquo;{quote.quote.split(/(?<=\.) /).slice(0, 1).join(' ')}&rdquo;</blockquote>
            <figcaption className="mt-6 text-[15px] text-[#6e6e73]">{quote.author}, {quote.position}</figcaption>
          </figure>
        )}
      </section>

      {/* ── 6 · the price ───────────────────────────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-20 bg-[#f5f5f7] px-5 py-28 text-center md:py-40">
        <div className="k-in k-spread">
          <div>
            <h2 className="k-h2 mb-4">{mvp?.price ?? '$4,999'}. Live in two weeks.</h2>
            <p className="k-lead mx-auto mb-10 max-w-[32ch]">One fixed price to build it. You own the code. Keep it running from ${Number.isFinite(lowest) ? lowest : 399}/month.</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('mvp_cta', 'v3_pricing')} className="k-pill k-pill-dark">Book a free 30-minute call</a>
            <button type="button" onClick={go('pricing')} className="k-link">Try it first <Chev /></button>
          </div>
        </div>
        {tiers && (
          <div className="k-in k-spread mx-auto mt-16 grid max-w-[900px] gap-4 sm:grid-cols-3">
            {tiers.tiers.map((t) => (
              <div key={t.name} className={`rounded-[24px] bg-white p-7 text-left ${t.highlighted ? 'ring-2 ring-aurora' : ''}`}>
                <div className="mb-1 text-[15px] font-semibold text-[#6e6e73]">{t.name}{t.highlighted && <span className="ml-2 text-aurora">Most popular</span>}</div>
                <div className="v3-num text-[40px] font-semibold tracking-[-0.04em]">${t.price.toLocaleString('en-US')}<span className="text-[17px] font-normal text-[#86868b]">/mo</span></div>
                <div className="mt-2 text-[15px] text-[#6e6e73]">{t.features.slice(0, 2).join(' · ')}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── 7 · the close ───────────────────────────────────────────────────────────────── */}
      <section className="px-5 py-28 text-center md:py-44">
        <div className="k-in k-spread">
          <div>
            <h2 className="k-hero mx-auto mb-6 max-w-[12ch]">See it answer as you.</h2>
            <p className="k-lead mx-auto mb-10 max-w-[28ch]">Your website in. Every demo, personalized. Twenty seconds.</p>
          </div>
          <TryField where="home_close" size="normal" />
        </div>
      </section>

      {content?.form && <div className="k-pane-r bg-[#f5f5f7]"><ContactForm data={content.form} /></div>}
      {content?.footer && <div className="k-pane-r"><Footer data={content.footer} /></div>}
      <StickyTry where="home" />
      <LiveChatBubble />
    </div>
  );
};

export default Home3;
