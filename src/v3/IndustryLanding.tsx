import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import LiveChatBubble from '@/components/LiveChatBubble';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import PhoneDemo, { type PhoneScript } from './PhoneDemo';
import Savings from './Savings';
import { useReveal } from './keynote';
import { openTry } from './TrySheet';
import { TryField, BookCall, StickyTry } from './Cta';
import { CALENDLY, VERTICALS, domainOf } from './verticals';
import { useFold } from './fold';
import Sentences from './Sentences';

// The keynote template every industry page renders (2026-11-12, after the homepage; the owner's bar is
// "Apple and Tesla standards"): one idea per screen, huge type, a product shot, the visitor's own
// numbers, the plans, plain answers, one close. Each page keeps its own <Helmet> (SEO, JSON-LD) and
// passes its words in as an IndustryKeynote (src/data/industryKeynote.ts). No invented client claims:
// the phone is labelled an illustration and the calculator an estimate.

export interface IndustryTile { title: string; line: string; to: string; cta: string }
export interface IndustryPlan { name: string; price: string; was?: string; for: string; features: string[]; highlight?: boolean }
export interface IndustryKeynote {
  key: string;            // VERTICALS key (src/v3/verticals.ts)
  name: string;           // 'Dental'
  audience: string;       // 'dental practices'
  business: string;       // 'practice' (as in "see it on your practice")
  headline: string;       // ≤ 6 words, ends with a period
  sub: string;            // one sentence
  phone: PhoneScript;
  big: { value: string; line: string; muted: string };  // a capability, never a client claim
  tiles: IndustryTile[];  // 3 or 4, each opens a live demo
  job: { label: string; value: number };                // the calculator's default
  plans: IndustryPlan[];
  plansNote?: string;
  faqs: { q: string; a: string }[];
}

const Chev = () => <ChevronRight size={18} strokeWidth={2.2} className="mt-px" />;

const IndustryLanding: React.FC<{ data: IndustryKeynote; belowHero?: React.ReactNode; afterPlans?: React.ReactNode }> = ({ data: d, belowHero, afterPlans }) => {
  const { content } = useContent();
  const { form } = useFold();
  useReveal([content]);
  const v = VERTICALS.find((x) => x.key === d.key);
  const Icon = v?.icon;
  const hub = v?.hub ?? `/${d.key}/demo`;
  const tryIt = (where: string) => () => { trackCTAClick('v3_try', `${d.key}_${where}`); openTry({ vertical: d.key }); };
  const open = form === 'open';
  const mvp = content?.mvpPromotion;

  const words = (
    <div className={open ? '' : 'text-center'}>
      <div className={`v3-rise mb-4 flex items-center gap-2 text-[17px] font-semibold text-aurora md:text-[21px] ${open ? '' : 'justify-center'}`} style={{ '--i': 0 } as React.CSSProperties}>
        {Icon && <Icon size={20} strokeWidth={2.2} aria-hidden />} For {d.audience}
      </div>
      <h1 className={`v3-rise k-hero mb-5 max-w-[15ch] text-[#1d1d1f] ${open ? '' : 'mx-auto'}`} style={{ '--i': 1 } as React.CSSProperties}><Sentences text={d.headline} /></h1>
      <p className={`v3-rise k-lead mb-8 max-w-[32ch] ${open ? '' : 'mx-auto'}`} style={{ '--i': 2 } as React.CSSProperties}>{d.sub}</p>
      <div className="v3-rise" style={{ '--i': 3 } as React.CSSProperties}>
        <TryField where={`${d.key}_hero`} vertical={d.key} placeholder={`your${d.business.replace(/\s+/g, '')}.com`} align={open ? 'left' : 'center'} />
        <div className={`mt-5 ${open ? '' : 'text-center'}`}><BookCall where={`${d.key}_hero`} /></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
      <Navbar />

      {/* 1 · the promise and the product */}
      {open ? (
        <section style={{ display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }}>
          <div className="flex items-center justify-center overflow-hidden bg-[#f5f5f7] pt-16"><PhoneDemo script={d.phone} /></div>
          <div aria-hidden />
          <div className="flex flex-col justify-center px-10 pt-16">{words}</div>
        </section>
      ) : (
        <section className="px-5 pt-28 md:pt-36">
          {words}
          <div className="v3-rise mt-14 md:mt-20" style={{ '--i': 4 } as React.CSSProperties}><PhoneDemo script={d.phone} /></div>
        </section>
      )}

      {belowHero && <div className="mt-20 md:mt-28">{belowHero}</div>}

      {/* 2 · one number */}
      <section className="mt-28 bg-[#f5f5f7] px-5 py-28 text-center md:mt-40 md:py-40">
        <div className="k-in k-spread">
          <div className="k-giant text-[#1d1d1f]">{d.big.value}</div>
          <p className="k-lead mx-auto mt-6 max-w-[28ch]">{d.big.line} <span className="text-[#1d1d1f]">{d.big.muted}</span></p>
        </div>
      </section>

      {/* 3 · what it does */}
      <section className="k-wide mx-auto max-w-[1180px] px-5 py-28 md:py-40">
        <h2 className="k-in k-h2 k-pane-l mb-14 text-center md:mb-20">Built for {d.audience}.</h2>
        <div className={`k-spread grid gap-4 md:gap-5 ${d.tiles.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {d.tiles.map((t) => (
            <Link key={t.title} to={t.to} className="k-in k-tile group flex min-h-[260px] flex-col p-9 transition-colors hover:bg-[#ececf0] md:min-h-[300px] md:p-12">
              <h3 className="mb-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] md:text-[34px]">{t.title}</h3>
              <p className="mb-6 text-[17px] text-[#6e6e73]">{t.line}</p>
              <span className="k-link mt-auto">{t.cta} <Chev /></span>
            </Link>
          ))}
        </div>
        <div className="k-in k-pane-l mt-12 text-center">
          <Link to={hub} className="k-link">All {d.name.toLowerCase()} demos <Chev /></Link>
        </div>
      </section>

      {/* 4 · what it's worth */}
      <section className="bg-[#f5f5f7] px-5 py-28 md:py-40">
        <div className="k-wide mx-auto max-w-[1080px]">
          <h2 className="k-in k-h2 k-pane-l mb-4 text-center">What it&rsquo;s worth to you.</h2>
          <p className="k-in k-lead k-pane-l mx-auto mb-14 max-w-[28ch] text-center md:mb-20">Move the sliders. Your numbers, your answer.</p>
          <div className="k-in k-spread-card rounded-[32px] bg-white p-8 md:p-14">
            <Savings className="k-spread" defaultJob={d.job.value} jobLabel={d.job.label} buildPrice={Number(mvp?.price?.replace(/[^0-9.]/g, '')) || 4999} onAction={tryIt('savings')} />
          </div>
        </div>
      </section>

      {/* 5 · plans */}
      {d.plans.length > 0 && (
        <section id="pricing" className="k-wide mx-auto max-w-[1180px] scroll-mt-20 px-5 py-28 md:py-40">
          <h2 className="k-in k-h2 k-pane-l mb-4 text-center">Pick a plan.</h2>
          <p className="k-in k-lead k-pane-l mx-auto mb-14 max-w-[32ch] text-center md:mb-20">{d.plansNote ?? 'Live in two weeks. No long-term contract.'}</p>
          <div className={`k-in k-spread grid gap-4 md:gap-5 ${d.plans.length === 3 ? 'md:grid-cols-3' : d.plans.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-4'}`}>
            {d.plans.map((p) => (
              <div key={p.name} className={`flex flex-col rounded-[28px] p-8 md:p-10 ${p.highlight ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7]'}`}>
                <div className={`mb-1 text-[15px] font-semibold ${p.highlight ? 'text-[#7BE3C3]' : 'text-aurora'}`}>{p.highlight ? 'Most popular' : ' '}</div>
                <h3 className="text-[24px] font-semibold tracking-[-0.02em]">{p.name}</h3>
                <p className={`mb-6 text-[15px] ${p.highlight ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{p.for}</p>
                <div className="mb-6">
                  <span className="v3-num text-[48px] font-semibold leading-none tracking-[-0.045em]">{p.price}</span>
                  <span className={p.highlight ? 'text-[#a1a1a6]' : 'text-[#86868b]'}>/mo</span>
                  {p.was && <span className={`ml-2 text-[15px] line-through ${p.highlight ? 'text-[#6e6e73]' : 'text-[#a1a1a6]'}`}>{p.was}</span>}
                </div>
                <ul className={`mb-8 space-y-2.5 text-[15px] ${p.highlight ? 'text-[#d2d2d7]' : 'text-[#424245]'}`}>
                  {p.features.slice(0, 4).map((f) => <li key={f}>{f}</li>)}
                </ul>
                <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick(`tier_${p.name.toLowerCase()}`, `${d.key}_pricing`)} className={`k-pill mt-auto ${p.highlight ? 'bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]' : 'k-pill-dark'}`}>Start with {p.name}</a>
              </div>
            ))}
          </div>
          <p className="k-in mt-8 text-center text-[15px] text-[#6e6e73]">Every plan starts with a free 30-minute call. Live in two weeks. Cancel anytime.</p>
        </section>
      )}

      {afterPlans}

      {/* 6 · plain answers */}
      {d.faqs.length > 0 && (
        <section className="bg-[#f5f5f7] px-5 py-28 md:py-40">
          <div className="k-spread mx-auto max-w-[880px] !items-start">
            <h2 className="k-in k-h2 mb-14 text-center md:mb-20">Questions, answered.</h2>
            <div className="k-in divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
              {d.faqs.map((f) => (
                <details key={f.q} className="group">
                  <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-semibold tracking-[-0.01em] md:text-[21px] [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <Plus size={22} className="shrink-0 text-[#86868b] transition-transform duration-300 group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="pb-7 pr-10 text-[17px] leading-relaxed text-[#6e6e73]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7 · the close */}
      <section className="px-5 py-28 text-center md:py-44">
        <div className="k-in k-spread">
          <div>
            <h2 className="k-hero mx-auto mb-6 max-w-[12ch]">See it answer as you.</h2>
            <p className="k-lead mx-auto mb-10 max-w-[30ch]">Your website in. Every {d.name.toLowerCase()} demo, personalized.</p>
          </div>
          <TryField where={`${d.key}_close`} vertical={d.key} placeholder={`your${d.business.replace(/\s+/g, '')}.com`} size="normal" />
        </div>
      </section>

      {content?.form && <div className="k-pane-r bg-[#f5f5f7]"><ContactForm data={content.form} /></div>}
      {content?.footer && <div className="k-pane-r"><Footer data={content.footer} /></div>}
      <StickyTry where={d.key} vertical={d.key} />
      <LiveChatBubble />
    </div>
  );
};

export default IndustryLanding;
