import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, type LucideIcon } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import PhoneDemo, { type PhoneScript } from './PhoneDemo';
import Savings from './Savings';
import Sentences from './Sentences';
import { useReveal } from './keynote';
import { openTry } from './TrySheet';
import { CALENDLY } from './verticals';
import { useFold } from './fold';

// The keynote template for the long-tail SEO landings (/ai-for-<trade>, 2026-11-12), after
// IndustryLanding: one idea per screen, huge type, a product shot, the visitor's own numbers.
// Each page keeps its own <Helmet> (title, meta, canonical, JSON-LD) and passes its words in as
// SeoLandingData. The H1 carries the search phrase ("AI for Plumbers") over a short headline.
// No stats walls, no invented numbers: the phone is labelled an illustration, the calculator an
// estimate, and FAQ text renders verbatim so it always matches the page's FAQPage JSON-LD.

export type Track = [cta: string, location: string];
export type DemoKind = 'chat' | 'quote' | 'voice';
export interface SeoDemo { to: string; title: string; line: string; kind: DemoKind; location: string }
export interface SeoPain { title: string; line: string }
export interface SeoFaqItem { q: string; a: string }
export interface SeoLandingData {
  testid: string;             // 'concrete-contractors' → -demo-cta, -faq-card, -footer-cta
  vertical: string;           // VERTICALS key the "see it on your company" sheet opens on
  icon: LucideIcon;
  name: string;               // the search phrase, first line of the H1: 'AI for Plumbers'
  headline: string;           // short sentences, the big line of the H1
  lead: string;               // one sentence
  phone: PhoneScript;
  primary: { to: string; label: string; track: Track };
  book: Track;                // hero "Book a call"
  painTitle: string;
  pains: SeoPain[];           // 3
  demos: SeoDemo[];           // 2 or 3
  job: { label: string; value: number };
  faqs?: SeoFaqItem[];
  close: { book: Track; try: { to: string; label: string; track: Track } };
  pricing: { to: string; label: string };
}

export const Chev: React.FC<{ className?: string }> = ({ className = '' }) => <ChevronRight size={18} strokeWidth={2.2} className={`mt-px ${className}`} />;
const rise = (i: number) => ({ '--i': i }) as React.CSSProperties;

/** Navbar + content + Footer on white, with the scroll reveal wired up */
export const SeoShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { content } = useContent();
  useReveal([content]);
  return (
    <div className="min-h-screen overflow-x-clip bg-white text-[#1d1d1f]">
      <Navbar />
      {children}
      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

/**
 * The opening screen: the search phrase small and green, the headline huge, one line, the actions,
 * then the product shot. On an open foldable the phone takes the left page and the words the right;
 * with no phone the words split across the two pages instead of sitting on the hinge.
 */
export const SeoHero: React.FC<{ icon: LucideIcon; name: string; headline: string; lead: React.ReactNode; actions: React.ReactNode; phone?: PhoneScript }> = ({ icon: Icon, name, headline, lead, actions, phone }) => {
  const { form } = useFold();
  const open = form === 'open';
  const h1 = (
    <h1 className={`mb-5 ${open ? '' : 'mx-auto'}`}>
      <span className={`v3-rise mb-4 flex items-center gap-2 text-[17px] font-semibold tracking-[-0.01em] text-aurora md:text-[21px] ${open ? '' : 'justify-center'}`} style={rise(0)}>
        <Icon size={20} strokeWidth={2.2} aria-hidden /> {name}
      </span>
      <span className={`v3-rise k-hero block max-w-[14ch] text-[#1d1d1f] ${open ? '' : 'mx-auto'}`} style={rise(1)}><Sentences text={headline} /></span>
    </h1>
  );
  const rest = (
    <>
      <p className={`v3-rise k-lead mb-8 max-w-[34ch] ${open ? '' : 'mx-auto'}`} style={rise(2)}>{lead}</p>
      <div className={`v3-rise flex flex-col items-center gap-4 sm:flex-row ${open ? 'sm:items-center' : 'sm:justify-center'}`} style={rise(3)}>{actions}</div>
    </>
  );

  if (open) {
    return (
      <section style={{ display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }}>
        {phone ? (
          <div className="flex items-center justify-center overflow-hidden bg-[#f5f5f7] pt-16"><PhoneDemo script={phone} /></div>
        ) : (
          <div className="flex flex-col justify-center px-10 pt-16">{h1}</div>
        )}
        <div aria-hidden />
        <div className="flex flex-col justify-center px-10 pt-16">{phone ? <>{h1}{rest}</> : rest}</div>
      </section>
    );
  }
  return (
    <section className="px-5 pt-28 text-center md:pt-36">
      {h1}
      {rest}
      {phone && <div className="v3-rise mt-14 md:mt-20" style={rise(4)}><PhoneDemo script={phone} /></div>}
    </section>
  );
};

/** hairline question rows; the question is the h3 and the answer the first p, verbatim */
export const SeoFaq: React.FC<{ faqs: SeoFaqItem[]; testid?: string; title?: string; className?: string }> = ({ faqs, testid, title = 'Questions, answered.', className = '' }) => (
  <section className={`px-5 py-28 md:py-40 ${className}`}>
    <div className="mx-auto max-w-[880px]">
      <h2 className="k-in k-h2 mb-14 text-center md:mb-20">{title}</h2>
      <div className="k-in divide-y divide-[#d2d2d7] border-y border-[#d2d2d7]">
        {faqs.map((f) => (
          <details key={f.q} className="group" data-testid={testid}>
            <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.01em] md:text-[21px]">{f.q}</h3>
              <Plus size={22} className="shrink-0 text-[#86868b] transition-transform duration-300 group-open:rotate-45" aria-hidden />
            </summary>
            <p className="pb-7 pr-10 text-[17px] leading-relaxed text-[#6e6e73]">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

/** the one dark surface: the close */
export const SeoClose: React.FC<{ title: string; line: string; children: React.ReactNode; foot?: React.ReactNode }> = ({ title, line, children, foot }) => (
  <section className="bg-[#1d1d1f] px-5 py-28 text-center text-white md:py-40">
    <div className="k-in">
      <h2 className="k-hero mx-auto mb-6 max-w-[12ch]"><Sentences text={title} /></h2>
      <p className="k-lead mx-auto mb-10 max-w-[30ch] !text-[#a1a1a6]">{line}</p>
      <div className="flex flex-col items-center justify-center gap-5 sm:flex-row">{children}</div>
      {foot && <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[15px] text-[#a1a1a6]">{foot}</div>}
    </div>
  </section>
);

// small, wordless pictures of what each demo does (decoration; the tile's words carry the meaning)
const DemoArt: React.FC<{ kind: DemoKind; inbound: string }> = ({ kind, inbound }) => {
  if (kind === 'chat') return (
    <div className="mt-auto flex flex-col gap-1.5 pt-10" aria-hidden>
      <span className="k-bub k-bub-in !max-w-[86%] !animate-none"><span className="line-clamp-2">{inbound}</span></span>
      <span className="k-bub k-bub-out !max-w-[70%] !animate-none">On it. Thursday at 9 or Saturday at 10?</span>
    </div>
  );
  if (kind === 'quote') return (
    <div className="mx-auto mt-auto w-full max-w-[320px] pt-10" aria-hidden>
      <div className="rounded-2xl bg-white p-5 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.3)]">
        {[78, 64, 52].map((w) => <div key={w} className="flex items-center justify-between gap-6 py-2"><span className="h-2.5 rounded-full bg-[#e8e8ed]" style={{ width: `${w}%` }} /><span className="h-2.5 w-10 rounded-full bg-[#d2d2d7]" /></div>)}
        <div className="mt-2 flex items-center justify-between border-t border-[#e8e8ed] pt-3"><span className="text-[14px] font-semibold">Estimate</span><span className="h-3 w-16 rounded-full bg-aurora/80" /></div>
      </div>
    </div>
  );
  return (
    <div className="mt-auto flex h-24 items-end justify-center gap-[5px] pt-10" aria-hidden>
      {[18, 34, 52, 28, 64, 80, 46, 70, 38, 58, 84, 50, 30, 62, 40, 22, 48, 26, 14].map((h, i) => <span key={i} className="w-[6px] rounded-full bg-aurora/80" style={{ height: `${h}%` }} />)}
    </div>
  );
};

const SeoLanding: React.FC<{ data: SeoLandingData }> = ({ data: d }) => {
  const { content } = useContent();
  const mvp = content?.mvpPromotion;
  const tryIt = () => { trackCTAClick('v3_try', `${d.testid}_savings`); openTry({ vertical: d.vertical }); };

  return (
    <SeoShell>
      {/* 1 · the promise and the product */}
      <SeoHero
        icon={d.icon}
        name={d.name}
        headline={d.headline}
        lead={d.lead}
        phone={d.phone}
        actions={<>
          <Link to={d.primary.to} onClick={() => trackCTAClick(...d.primary.track)} className="k-pill k-pill-brand">{d.primary.label}</Link>
          <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick(...d.book)} className="k-link">Book a call <Chev /></a>
        </>}
      />

      {/* 2 · where the work slips */}
      <section className="mt-28 bg-[#f5f5f7] px-5 py-28 md:mt-40 md:py-40">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="k-in k-h2 mx-auto mb-14 max-w-[16ch] text-center md:mb-20"><Sentences text={d.painTitle} /></h2>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {d.pains.map((p, i) => (
              <div key={p.title} className="k-in flex min-h-[220px] flex-col rounded-[28px] bg-white p-9 md:min-h-[280px] md:p-10" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="v3-num mb-8 text-[15px] font-semibold text-aurora">0{i + 1}</span>
                <h3 className="mb-3 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[28px]">{p.title}</h3>
                <p className="text-[17px] leading-snug text-[#6e6e73]">{p.line}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · what you get: each demo, live */}
      <section className="mx-auto max-w-[1180px] px-5 py-28 md:py-40">
        <h2 className="k-in k-h2 mb-4 text-center">Try it now.</h2>
        <p className="k-in k-lead mx-auto mb-14 max-w-[30ch] text-center md:mb-20">Live demos. No signup. One tap each.</p>
        <div className={`grid gap-4 md:gap-5 ${d.demos.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
          {d.demos.map((demo) => (
            <Link
              key={demo.to}
              to={demo.to}
              data-testid={`${d.testid}-demo-cta`}
              onClick={() => trackCTAClick('demo_card', demo.location)}
              className="k-in k-tile group flex min-h-[420px] flex-col p-9 transition-colors hover:bg-[#ececf0] md:min-h-[460px] md:p-8 lg:p-12"
            >
              <h3 className="mb-2 text-[28px] font-semibold leading-[1.1] tracking-[-0.03em] lg:text-[34px]">{demo.title}</h3>
              <p className="mb-6 text-[17px] text-[#6e6e73]">{demo.line}</p>
              <span className="k-link">Open the demo <Chev className="transition-transform group-hover:translate-x-0.5" /></span>
              <DemoArt kind={demo.kind} inbound={d.phone.inbound} />
            </Link>
          ))}
        </div>
      </section>

      {/* 4 · what it's worth */}
      <section className="bg-[#f5f5f7] px-5 py-28 md:py-40">
        <div className="mx-auto max-w-[1080px]">
          <h2 className="k-in k-h2 mb-4 text-center">What it&rsquo;s worth to you.</h2>
          <p className="k-in k-lead mx-auto mb-14 max-w-[28ch] text-center md:mb-20">Move the sliders. Your numbers, your answer.</p>
          <div className="k-in rounded-[32px] bg-white p-8 md:p-14">
            <Savings defaultJob={d.job.value} jobLabel={d.job.label} buildPrice={Number(mvp?.price?.replace(/[^0-9.]/g, '')) || 4999} onAction={tryIt} actionLabel="See it on your company" />
          </div>
        </div>
      </section>

      {/* 5 · plain answers */}
      {d.faqs && d.faqs.length > 0 && <SeoFaq faqs={d.faqs} testid={`${d.testid}-faq-card`} />}

      {/* 6 · the close */}
      <SeoClose
        title="Put it to work."
        line="Thirty minutes. We set it up on your real website while you watch."
        foot={<>
          <Link to={d.pricing.to} className="hover:text-white">{d.pricing.label}</Link>
          <Link to="/quiz" className="hover:text-white">Take the 2-minute AI readiness quiz</Link>
        </>}
      >
        <a href={CALENDLY} target="_blank" rel="noopener noreferrer" data-testid={`${d.testid}-footer-cta`} onClick={() => trackCTAClick(...d.close.book)} className="k-pill bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]">Book a call</a>
        <Link to={d.close.try.to} onClick={() => trackCTAClick(...d.close.try.track)} className="k-link !text-[#7BE3C3]">{d.close.try.label} <Chev /></Link>
      </SeoClose>
    </SeoShell>
  );
};

export default SeoLanding;
