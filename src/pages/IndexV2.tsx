import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import NavbarV2 from '@/components/v2/NavbarV2';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import {
  useAnalytics,
  useEngagementTracking,
  trackCTAClick,
} from '@/utils/analytics';
import { trackEvent } from '@/utils/analytics';
import { currentHostTag } from '@/utils/hostVariant';

const trackLandingConversion = (name: string) => {
  trackEvent('landing_conversion', 'conversion', `${currentHostTag()}:${name}`);
};
import {
  useInView,
  LivePulse,
  TypingPreview,
  WaveformPreview,
  CompsPreview,
  SMSPreview,
  EstimatorPreview,
} from '@/components/v2/LivePreviews';

const CALENDLY = 'https://calendly.com/mutaaf';

const CREDENTIALS = [
  { roman: 'I',   org: 'Motorola Solutions', role: 'Engineering Leadership', era: '—2019' },
  { roman: 'II',  org: 'Amazon',             role: 'Driver Communications',  era: '2021' },
  { roman: 'III', org: 'Disney',             role: 'Live Sports Streaming',  era: '2022' },
];

const OUTCOME_TICKER = [
  { client: 'Residential Development Firm', metric: 'Lead response · hours → 47s' },
  { client: 'Family Entertainment Center',  metric: '20 hrs/wk manual entry → zero' },
  { client: 'TryMinded',                    metric: 'Telemed platform · shipped in months' },
  { client: 'Recyclops',                    metric: 'Ops scaled with zero new hires' },
  { client: 'Multi-Location Service Co.',   metric: 'Estimates · days → under an hour' },
  { client: 'Independent Event Studio',     metric: '12 integrations · zero manual ops' },
  { client: 'Overwatch Digital Health',     metric: 'Compliance milestones · ahead of plan' },
];

const OUTCOMES = [
  {
    vertical: 'Construction',
    client: 'Residential Development Firm',
    headline: '< 60 seconds',
    label: 'Lead response',
    body:
      'Down from "whenever someone saw the voicemail." Estimate turnaround went from days to under an hour. More jobs booked. More jobs closed.',
    chip: 'ROI paid in month 1',
  },
  {
    vertical: 'Family Entertainment',
    client: 'Family Entertainment Center',
    headline: '20 hrs/week',
    label: 'Manual data entry eliminated',
    body:
      'AI intake captures every party inquiry and auto-populates ops across four disconnected systems. Staff stopped retyping; owner stopped supervising it.',
    chip: '40–45 parties / weekend',
  },
  {
    vertical: 'Digital Health',
    client: 'TryMinded',
    headline: 'Shipped in months',
    label: 'Not years',
    body:
      'Production telemedicine platform with AI intake, end-to-end. What a full in-house team would have taken a year to build — with a roadmap the team could operate on day one.',
    chip: 'CTO engagement, not staffing',
  },
  {
    vertical: 'Logistics',
    client: 'Recyclops',
    headline: 'Zero new hires',
    label: 'To scale ops across markets',
    body:
      'Multi-year retainer automating dispatch and coordination. The ops team grew throughput without growing headcount — the way software is supposed to work.',
    chip: 'Multi-year partnership',
  },
];

const STUDIO = [
  {
    n: '01',
    role: 'AI Systems',
    craft: 'LLM pipelines, agent orchestration, RAG, evals.',
    stack: 'GPT-4o · Claude · LangGraph · Vercel AI',
  },
  {
    n: '02',
    role: 'Voice & Conversation',
    craft: 'Production voice stacks, latency budgets, prompt choreography.',
    stack: 'Vapi · ElevenLabs · Deepgram · Twilio',
  },
  {
    n: '03',
    role: 'Product Engineering',
    craft: 'Shipping what the roadmap calls for. End-to-end delivery.',
    stack: 'TypeScript · React · Node · Postgres · Vercel',
  },
  {
    n: '04',
    role: 'Design & Brand',
    craft: 'Interfaces that feel considered. Identities that outlast a trend cycle.',
    stack: 'Figma · Framer · brand systems',
  },
  {
    n: '05',
    role: 'Ops, Data & Security',
    craft: 'Reliability, observability, compliance. Production readiness as a practice.',
    stack: 'Sentry · OpenTelemetry · SOC2 readiness',
  },
];

const METRICS = [
  { k: '< 60s', v: 'Lead response' },
  { k: '< 1hr', v: 'Estimate turnaround' },
  { k: '20 hr/wk', v: 'Ops hours reclaimed' },
  { k: '0', v: 'New hires required' },
];

const MANDATE = [
  {
    n: '01',
    title: 'Strategic Architecture',
    body:
      'Roadmaps that survive contact with reality. Build-vs-buy, stack selection, compliance, scale. The 18-month plan you can actually operate against.',
  },
  {
    n: '02',
    title: 'AI Systems & Integration',
    body:
      'Custom agents, voice AI, LLM pipelines, workflow automation — wired into the tools your team already uses. Not slideware. Shipped.',
  },
  {
    n: '03',
    title: 'Team & Vendor Leadership',
    body:
      'Technical interviewing, vendor selection, contract review. I sit in the rooms where your technology decisions get made and represent your interests.',
  },
  {
    n: '04',
    title: 'Product Engineering',
    body:
      'When you need something built now, I build it — or direct the team that does. Platforms, dashboards, integrations, data systems.',
  },
  {
    n: '05',
    title: 'Crisis Response',
    body:
      'When production breaks, a vendor ghosts, or due diligence lands on Friday — you call the person who has been there before.',
  },
];

const Eyebrow: React.FC<{ children: React.ReactNode; muted?: boolean }> = ({
  children,
  muted,
}) => (
  <span
    className={`v2-mono inline-block ${
      muted ? 'text-bone/40' : 'text-copper'
    }`}
  >
    {children}
  </span>
);

const nextAvailableSlot = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const OutcomesMarquee: React.FC = () => {
  const items = [...OUTCOME_TICKER, ...OUTCOME_TICKER];
  return (
    <div
      className="v2-marquee relative overflow-hidden border-y border-white/10 bg-ink-soft/40 py-5"
      aria-label="Client outcomes ticker"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent"
      />
      <div className="v2-marquee-track items-center gap-8">
        {items.map((o, i) => (
          <span
            key={`${o.client}-${i}`}
            className="flex shrink-0 items-center gap-8"
          >
            <span className="flex items-baseline gap-3">
              <span className="v2-mono text-copper/80">{o.client}</span>
              <span className="v2-display text-lg text-bone/90 md:text-xl" style={{ fontWeight: 400 }}>
                {o.metric}
              </span>
            </span>
            <span className="text-copper/60">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ---------------------------------- HERO ---------------------------------- */
const HeroV2: React.FC = () => (
  <section className="relative overflow-hidden border-b border-white/10 pt-24 pb-16 md:pt-36 md:pb-28">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full opacity-[0.22] blur-3xl md:h-[680px] md:w-[680px]"
      style={{
        background: 'radial-gradient(closest-side, #c96e2c, transparent 70%)',
        animation: 'v2-glow 6s ease-in-out infinite',
      }}
    />
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full opacity-[0.10] blur-3xl"
      style={{
        background: 'radial-gradient(closest-side, #e89862, transparent 70%)',
      }}
    />

    <div className="container mx-auto max-w-6xl px-5 sm:px-6">
      <div className="mb-8 flex items-center justify-between md:mb-14">
        <Eyebrow>§ Customer outcomes — not a résumé</Eyebrow>
        <Eyebrow muted>
          <span className="hidden sm:inline">Fractional CTO · </span>On Retainer
        </Eyebrow>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-8">
          <h1
            className="v2-display v2-rise text-bone"
            style={{
              fontWeight: 360,
              fontSize: 'clamp(2.8rem, 10vw, 7.5rem)',
              lineHeight: 0.92,
            }}
          >
            Book more jobs.
            <br />
            Close more deals.
            <br />
            Run ops on{' '}
            <span className="italic text-copper" style={{ fontWeight: 380 }}>
              autopilot.
            </span>
          </h1>
        </div>

        <div
          className="col-span-12 flex flex-col justify-end md:col-span-4 v2-rise"
          style={{ animationDelay: '180ms' }}
        >
          <p className="font-editorial text-lg leading-relaxed text-bone/80 md:text-xl">
            Custom AI systems that <span className="text-bone">book, qualify, and close</span> —
            delivered end-to-end on a retainer that costs less than a single senior hire.
            <br />
            <span className="text-bone/70 italic">Shipped, not pitched.</span>
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackCTAClick('book_discovery', 'v2_hero');
                trackLandingConversion('book_discovery_hero');
              }}
              className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-ink transition hover:bg-copper hover:text-bone"
            >
              Show Me the ROI
              <ArrowUpRight
                size={16}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#outcomes"
              onClick={() => trackCTAClick('see_outcomes', 'v2_hero')}
              className="inline-flex items-center gap-2 rounded-full border border-bone/25 px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-bone/85 transition hover:border-bone hover:text-bone"
            >
              See the Outcomes ↓
            </a>
          </div>

          <div className="mt-5 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-bone/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-copper opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-copper" />
            </span>
            Next discovery · {nextAvailableSlot()}
          </div>
        </div>
      </div>

      <div
        className="mt-14 grid grid-cols-2 gap-y-8 border-t border-white/10 pt-8 md:mt-20 md:grid-cols-4 v2-fade"
        style={{ animationDelay: '420ms' }}
      >
        {METRICS.map((m) => (
          <div key={m.k}>
            <div
              className="v2-display text-bone"
              style={{ fontWeight: 400, fontSize: 'clamp(1.8rem, 4.5vw, 2.5rem)' }}
            >
              {m.k}
            </div>
            <div className="v2-mono mt-2 text-bone/55">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* -------------------------------- OUTCOMES -------------------------------- */
const OutcomesV2: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section
      id="outcomes"
      ref={ref}
      className="relative border-b border-white/10 py-20 md:py-32"
    >
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>§ 01 — Outcomes</Eyebrow>
            <h2
              className="v2-display mt-4 max-w-3xl text-bone"
              style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
            >
              What <span className="italic text-copper">you</span> walk away with.
            </h2>
          </div>
          <p className="max-w-sm font-editorial text-base leading-relaxed text-bone/70 md:text-lg">
            Not deliverables. Not hours billed. The concrete P&L changes real
            operators have pointed to as the reason they stayed on retainer.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {OUTCOMES.map((o, i) => (
            <article
              key={o.client}
              className="group relative col-span-12 overflow-hidden rounded-md border border-white/10 bg-ink-soft/40 p-6 transition hover:border-copper/60 hover:bg-ink-soft/80 md:col-span-6 md:p-8"
              style={{
                animation: inView ? `v2-rise 700ms ${i * 100}ms both` : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: '#c96e2c' }}
              />

              <div className="relative flex items-center justify-between">
                <span className="v2-mono text-copper">
                  § {o.vertical}
                </span>
                <span className="v2-mono text-bone/45">{o.client}</span>
              </div>

              <div className="relative mt-6">
                <div
                  className="v2-display text-bone"
                  style={{
                    fontWeight: 400,
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
                    lineHeight: 1,
                  }}
                >
                  {o.headline}
                </div>
                <div className="mt-2 font-editorial text-lg italic text-bone/60">
                  {o.label}
                </div>
              </div>

              <p className="relative mt-6 font-editorial text-[15px] leading-relaxed text-bone/75 md:text-base">
                {o.body}
              </p>

              <div className="relative mt-6 inline-flex items-center gap-2 border border-copper/40 bg-copper/10 px-3 py-1.5">
                <span className="v2-mono text-[10px] text-copper">
                  {o.chip}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 md:mt-16 md:flex-row md:items-center">
          <p className="font-editorial text-base italic text-bone/60 md:text-lg">
            “Every retainer pays for itself before month three — or we renegotiate.”
          </p>
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackCTAClick('scope_my_outcome', 'v2_outcomes');
              trackLandingConversion('scope_my_outcome');
            }}
            className="group inline-flex items-center gap-2 rounded-full border border-bone/30 px-5 py-2.5 font-mono text-[12px] uppercase tracking-wider text-bone transition hover:border-copper hover:bg-copper hover:text-bone"
          >
            Scope my outcome
            <ArrowUpRight
              size={14}
              className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>
    </section>
  );
};

/* ----------------------------- TRUST STRIP -------------------------------- */
const TrustStripV2: React.FC = () => (
  <section className="border-b border-white/10 bg-ink/60 py-6">
    <div className="container mx-auto max-w-6xl px-5 sm:px-6">
      <div className="flex flex-col items-center justify-center gap-3 text-center md:flex-row md:gap-6">
        <span className="v2-mono text-bone/45">
          Built systems at
        </span>
        <div className="flex items-center gap-5 md:gap-8">
          {CREDENTIALS.map((c, i) => (
            <React.Fragment key={c.org}>
              <span
                className="v2-display italic text-bone/80"
                style={{
                  fontWeight: 400,
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                }}
              >
                {c.org}
              </span>
              {i < CREDENTIALS.length - 1 && (
                <span className="text-copper/60">◆</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  </section>
);

/* -------------------------------- MANDATE --------------------------------- */
const MandateV2: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section ref={ref} className="v2-bone-bg relative py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 border-b border-ink/15 pb-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="v2-mono text-copper">§ 02 — The Mandate</span>
            <h2
              className="v2-display mt-4 max-w-2xl text-ink"
              style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
            >
              What a champion
              <br />
              <span className="italic">actually does for you.</span>
            </h2>
          </div>
          <p className="max-w-xs font-editorial text-sm text-ink/65 md:text-base">
            Five mandates. One retainer. No hourly billing games, no vendor
            triangulation, no slideware.
          </p>
        </div>

        <ul>
          {MANDATE.map((m, i) => (
            <li
              key={m.n}
              className="group grid grid-cols-12 gap-4 border-b border-ink/15 py-7 transition-colors hover:bg-ink/[0.03] md:gap-6 md:py-10"
              style={{
                animation: inView ? `v2-rise 700ms ${i * 80}ms both` : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              <div className="col-span-2 md:col-span-1">
                <span className="v2-mono text-copper transition-colors group-hover:text-ink">
                  {m.n}
                </span>
              </div>
              <div className="col-span-10 md:col-span-5">
                <h3
                  className="v2-display text-ink"
                  style={{ fontWeight: 400, fontSize: 'clamp(1.4rem, 3.5vw, 2.25rem)' }}
                >
                  {m.title}
                </h3>
              </div>
              <div className="col-span-12 md:col-span-6">
                <p className="font-editorial text-base leading-relaxed text-ink/70 md:text-lg">
                  {m.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

/* ---------------------------- STUDIO (THE TEAM) ---------------------------- */
const StudioV2: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section
      ref={ref}
      className="relative border-b border-white/10 py-20 md:py-32"
      style={{ background: 'linear-gradient(180deg, #0b0b0d 0%, #0f0f12 100%)' }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 39h40v1H0zM39 0h1v40h-1z' fill='%23f4efe6'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="container relative mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>§ 04 — The Studio</Eyebrow>
            <h2
              className="v2-display mt-4 max-w-3xl text-bone"
              style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
            >
              A championship
              <br />
              <span className="italic text-copper">isn't a solo act.</span>
            </h2>
          </div>
          <p className="max-w-sm font-editorial text-base leading-relaxed text-bone/70 md:text-lg">
            You hire <span className="text-bone">the partner.</span> You get
            the firm. A hand-picked bench of craftsmen I've built over seven
            years — deployed to each engagement by need, not by seat.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          {STUDIO.map((s, i) => (
            <div
              key={s.n}
              className={`group relative col-span-12 overflow-hidden rounded-md border border-white/10 bg-ink-soft/40 p-6 transition hover:border-copper/50 hover:bg-ink-soft/70 md:p-7 ${
                i < 3 ? 'md:col-span-4' : 'md:col-span-6'
              }`}
              style={{
                animation: inView ? `v2-rise 700ms ${i * 90}ms both` : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: '#c96e2c' }}
              />
              <div className="relative flex items-baseline justify-between">
                <span className="v2-mono text-copper">{s.n}</span>
                <span className="v2-mono text-bone/35">Craft</span>
              </div>
              <h3
                className="v2-display relative mt-5 text-bone"
                style={{
                  fontWeight: 400,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}
              >
                {s.role}
              </h3>
              <p className="relative mt-3 font-editorial text-[15px] leading-relaxed text-bone/75">
                {s.craft}
              </p>
              <div className="relative mt-6 border-t border-white/10 pt-4">
                <span className="v2-mono text-[10px] text-bone/45">
                  {s.stack}
                </span>
              </div>
            </div>
          ))}
        </div>

        <blockquote
          className="mx-auto mt-14 max-w-3xl border-l-2 border-copper pl-5 font-editorial text-xl italic leading-relaxed text-bone/85 md:mt-20 md:pl-6 md:text-2xl"
          style={{
            animation: inView ? 'v2-rise 900ms 700ms both' : 'none',
            opacity: inView ? 1 : 0,
          }}
        >
          “Every engagement is mine to lead. The bench is mine to deploy.
          You'll always know whose hand is on the wheel.”
          <footer className="v2-mono mt-4 not-italic text-bone/50">
            — Mutaaf · Founding Partner
          </footer>
        </blockquote>
      </div>
    </section>
  );
};

/* --------------------------- CAPABILITIES BENTO --------------------------- */
interface CapCardProps {
  n: string;
  tag: string;
  title: string;
  body: string;
  to: string;
  preview: React.ReactNode;
  className?: string;
  variant?: 'hero' | 'default';
  delay?: number;
  inView: boolean;
}
const CapCard: React.FC<CapCardProps> = ({
  n,
  tag,
  title,
  body,
  to,
  preview,
  className,
  variant,
  delay = 0,
  inView,
}) => (
  <Link
    to={to}
    onClick={() => trackCTAClick(`capability_${n}`, 'v2_capabilities')}
    className={`group relative flex flex-col overflow-hidden rounded-md border border-white/10 bg-ink-soft/40 p-6 transition hover:border-copper/60 hover:bg-ink-soft/85 md:p-8 ${
      className || ''
    }`}
    style={{
      animation: inView ? `v2-rise 700ms ${delay}ms both` : 'none',
      opacity: inView ? 1 : 0,
    }}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      style={{
        background:
          'radial-gradient(circle at 85% 10%, rgba(201, 110, 44, 0.15), transparent 60%)',
      }}
    />

    <div className="relative flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="v2-mono text-copper">{n}</span>
        <span className="v2-mono text-bone/45">{tag}</span>
      </div>
      <div className="flex items-center gap-3">
        <LivePulse />
        <ArrowUpRight
          className="shrink-0 text-bone/40 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-copper"
          size={variant === 'hero' ? 26 : 20}
        />
      </div>
    </div>

    <h3
      className="v2-display relative mt-5 text-bone"
      style={{
        fontWeight: 400,
        fontSize:
          variant === 'hero'
            ? 'clamp(1.75rem, 4.2vw, 3rem)'
            : 'clamp(1.25rem, 2.4vw, 1.85rem)',
      }}
    >
      {title}
    </h3>
    <p
      className={`relative mt-3 max-w-2xl font-editorial leading-relaxed text-bone/70 ${
        variant === 'hero' ? 'text-lg' : 'text-[15px]'
      }`}
    >
      {body}
    </p>

    <div className="relative mt-auto pt-5">
      <div className="mb-3 h-px w-full bg-white/10" />
      {preview}
    </div>
  </Link>
);

const CapabilitiesV2: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section
      id="capabilities"
      ref={ref}
      className="relative border-b border-white/10 py-20 md:py-32"
    >
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-6 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>§ 03 — Portfolio</Eyebrow>
            <h2
              className="v2-display mt-4 max-w-3xl text-bone"
              style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
            >
              What your CTO
              <br />
              <span className="italic text-copper">has already shipped.</span>
            </h2>
          </div>
          <p className="max-w-xs font-editorial text-sm text-bone/60 md:text-base">
            Every preview is running live. Click any panel to open the full demo
            on your company's data.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-5">
          <CapCard
            inView={inView}
            delay={0}
            variant="hero"
            n="01"
            tag="Lead Intake / GPT-4o"
            title="Voice-first lead intake that closes."
            body="Every inbound call captured, qualified, and routed — before your competitor picks up."
            to="/construction/demo/lead-responder"
            className="col-span-12 md:col-span-8 md:row-span-2"
            preview={
              <div className="rounded-md bg-ink/60 p-4">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-bone/45">
                  <span>Incoming · (512) 555-0148</span>
                  <span className="text-copper">00:07</span>
                </div>
                <TypingPreview
                  lines={[
                    '> Caller: "Hi, I need a fence quote for a half-acre lot."',
                    '> AI: Captured — residential fence · 0.5 ac · zip 78704.',
                    '> Routed to: jobs@yourco.com · SMS sent to owner.',
                    '> Response time: 47 seconds. Beat competitor by 4h 12m.',
                  ]}
                />
              </div>
            }
          />

          <CapCard
            inView={inView}
            delay={120}
            n="02"
            tag="Voice AI / Vapi + ElevenLabs"
            title="Live voice negotiation, 24/7."
            body="An AI that makes the follow-up call, handles objections, and books the meeting."
            to="/construction/demo/voice-negotiator"
            className="col-span-12 md:col-span-4"
            preview={
              <div className="rounded-md bg-ink/60 p-4">
                <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-bone/45">
                  <span>Outbound · Cassidy v2.5</span>
                  <span className="text-copper">ON AIR</span>
                </div>
                <div className="flex h-[72px] items-center">
                  <WaveformPreview bars={24} />
                </div>
              </div>
            }
          />

          <CapCard
            inView={inView}
            delay={220}
            n="03"
            tag="Multi-agent pipeline"
            title="Deal analysis, under a minute."
            body="Paste a listing URL. Specs extracted, comps pulled, deal run, seller note drafted."
            to="/realestate/demo/property-negotiator"
            className="col-span-12 md:col-span-4"
            preview={
              <div className="rounded-md bg-ink/60 p-4">
                <CompsPreview />
              </div>
            }
          />

          <CapCard
            inView={inView}
            delay={320}
            n="04"
            tag="Structured output"
            title="Estimates while the lead is still hot."
            body="A guided estimator that turns an inquiry into a printable proposal in minutes."
            to="/construction/demo/estimate"
            className="col-span-12 md:col-span-6"
            preview={
              <div className="rounded-md bg-ink/60 p-4">
                <EstimatorPreview />
              </div>
            }
          />

          <CapCard
            inView={inView}
            delay={420}
            n="05"
            tag="Ops automation"
            title="Review engine that runs itself."
            body="SMS requests, dashboard, templated responses. Built for owners who hate chasing reviews."
            to="/construction/demo/reviews"
            className="col-span-12 md:col-span-6"
            preview={
              <div className="rounded-md bg-ink/60 p-4">
                <SMSPreview />
              </div>
            }
          />
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 md:mt-14">
          <span className="v2-mono text-bone/45">
            5 of 11 verticals shown · all demos live
          </span>
          <Link
            to="/industries"
            className="group inline-flex items-center gap-2 font-mono text-[13px] uppercase tracking-wider text-bone/80 transition hover:text-copper"
          >
            See the full catalog
            <ArrowRight
              size={14}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
};

/* -------------------------------- CHAMPION -------------------------------- */
const ChampionV2: React.FC<{ photo: string }> = ({ photo }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section ref={ref} className="v2-bone-bg relative py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-12 items-center gap-8 md:gap-10">
          <div className="col-span-12 md:col-span-4">
            <div
              className="relative"
              style={{
                animation: inView ? 'v2-rise 900ms both' : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              <div className="absolute -inset-2 border border-ink/20" />
              <img
                src={photo}
                alt="Mutaaf — Fractional CTO"
                className="relative z-10 h-[320px] w-full object-cover grayscale contrast-[1.05] md:h-[380px]"
              />
            </div>
          </div>

          <div
            className="col-span-12 md:col-span-8"
            style={{
              animation: inView ? 'v2-rise 900ms 180ms both' : 'none',
              opacity: inView ? 1 : 0,
            }}
          >
            <span className="v2-mono text-copper">§ 05 — Who's on the call</span>
            <h2
              className="v2-display mt-4 text-ink"
              style={{ fontWeight: 400, fontSize: 'clamp(1.9rem, 5vw, 3rem)' }}
            >
              You'll be working with{' '}
              <span className="italic">Mutaaf.</span>
            </h2>
            <p className="mt-5 font-editorial text-lg leading-relaxed text-ink/80 md:text-xl">
              Fractional CTO since 2019. The direct line on every retainer —
              not a lead, not a handoff, not an AM. The same person who scopes
              your outcome is the one who architects and ships it, with the
              studio executing under his direction.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[12px] uppercase tracking-wider text-ink/65">
              <span>Motorola Solutions</span>
              <span className="text-copper/70">◆</span>
              <span>Amazon</span>
              <span className="text-copper/70">◆</span>
              <span>Disney</span>
              <span className="text-copper/70">◆</span>
              <span>7 yrs fractional CTO</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------- ENGAGE --------------------------------- */
const EngageV2: React.FC = () => (
  <section className="relative overflow-hidden py-24 md:py-36">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-25"
      style={{
        background:
          'radial-gradient(circle at 30% 50%, #c96e2c 0%, transparent 60%)',
        animation: 'v2-glow 8s ease-in-out infinite',
      }}
    />
    <div className="container relative mx-auto max-w-6xl px-5 sm:px-6">
      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-8">
          <Eyebrow>§ 06 — Engage</Eyebrow>
          <h2
            className="v2-display mt-5 text-bone"
            style={{
              fontWeight: 380,
              fontSize: 'clamp(2.5rem, 8vw, 6rem)',
              lineHeight: 0.95,
            }}
          >
            Put a <span className="italic text-copper">Fortune 100</span> engineer
            <br />
            in your corner.
          </h2>
          <p className="mt-7 max-w-xl font-editorial text-lg leading-relaxed text-bone/75 md:text-xl">
            Thirty-minute discovery call. No pitch. We'll map the one system
            that, if built, would change your P&L most this quarter — and
            whether I'm the right person to build it.
          </p>
        </div>
        <div className="col-span-12 flex items-end md:col-span-4">
          <a
            href={CALENDLY}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackCTAClick('book_discovery', 'v2_engage');
              trackLandingConversion('book_discovery_engage');
            }}
            className="group inline-flex w-full items-center justify-between gap-4 border border-bone/30 bg-bone px-6 py-5 text-ink transition hover:bg-copper hover:text-bone md:px-8 md:py-6"
          >
            <div className="text-left">
              <div className="v2-mono text-ink/60 group-hover:text-bone/70">
                Next open · {nextAvailableSlot()}
              </div>
              <div
                className="v2-display mt-1 text-xl md:text-2xl"
                style={{ fontWeight: 400 }}
              >
                30 min · No pitch
              </div>
            </div>
            <ArrowRight
              className="shrink-0 transition group-hover:translate-x-1"
              size={26}
            />
          </a>
        </div>
      </div>
    </div>
  </section>
);

/* --------------------------------- PAGE ----------------------------------- */
const IndexV2: React.FC = () => {
  const { content } = useContent();
  const rootRef = useRef<HTMLDivElement | null>(null);

  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const photo =
    content?.founder?.photo ||
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80';

  return (
    <div ref={rootRef} className="v2-root min-h-screen">
      <Helmet>
        <title>Your Fortune 100 CTO, on retainer · DigitalCraft</title>
        <meta
          name="description"
          content="A fractional CTO who has shipped at Motorola, Amazon, and Disney — now on retainer for operators who want strategic technology leadership, not just tools. Book more jobs. Close more deals. Run ops on autopilot."
        />
        <link rel="canonical" href="https://cto.digitalcraftai.com" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cto.digitalcraftai.com" />
        <meta
          property="og:title"
          content="Your Fortune 100 CTO, on retainer · DigitalCraft"
        />
        <meta
          property="og:description"
          content="A fractional CTO who has shipped at Motorola, Amazon, and Disney — now on retainer for operators who want strategic technology leadership, not just tools."
        />
        <meta
          property="og:image"
          content="https://cto.digitalcraftai.com/og-cto.svg"
        />
        <meta property="og:site_name" content="DigitalCraft · CTO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="Your Fortune 100 CTO, on retainer · DigitalCraft"
        />
        <meta
          name="twitter:description"
          content="A fractional CTO who has shipped at Motorola, Amazon, and Disney — now on retainer for operators who want strategic technology leadership, not just tools."
        />
        <meta
          name="twitter:image"
          content="https://cto.digitalcraftai.com/og-cto.svg"
        />
      </Helmet>
      <NavbarV2 />
      <HeroV2 />
      <TrustStripV2 />
      <OutcomesV2 />
      <OutcomesMarquee />
      <MandateV2 />
      <CapabilitiesV2 />
      <StudioV2 />
      <ChampionV2 photo={photo} />
      <EngageV2 />
      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default IndexV2;
