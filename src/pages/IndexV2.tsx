import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import {
  useAnalytics,
  useEngagementTracking,
  trackCTAClick,
} from '@/utils/analytics';
import { trackVariantConversion } from '@/utils/abTest';
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
  { org: 'Motorola Solutions', role: 'Engineering Leadership', era: '—2019' },
  { org: 'Amazon', role: 'Driver Communications', era: '2021' },
  { org: 'Disney', role: 'Live Sports Streaming', era: '2022' },
];

const METRICS = [
  { k: 'Fortune 100', v: 'Shipped at' },
  { k: '7+ yrs', v: 'Fractional CTO' },
  { k: '11', v: 'Verticals live' },
  { k: '< 60s', v: 'Lead response' },
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

const LEDGER = [
  { y: '—2019', t: 'Engineering leadership at Motorola Solutions' },
  { y: '2019', t: 'Launched independent fractional-CTO practice' },
  { y: '2021', t: 'Amazon — driver-communications modernization' },
  { y: '2022', t: 'Disney — live sports & events streaming platform' },
  { y: '2023', t: 'Overwatch Digital Health, Recyclops, TryMinded on retainer' },
  { y: '2024', t: '448 Developments, Infinity Builders, CheekyMonkeys, DJ RubyRu' },
  { y: '2025', t: 'Launched DigitalCraft AI — productized across 11 verticals' },
  { y: '2026', t: 'Scaling productized delivery across active retainers' },
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
        <Eyebrow>§ Masthead / Vol. VII · MMXXVI</Eyebrow>
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
              fontSize: 'clamp(3.2rem, 11.5vw, 8.25rem)',
              lineHeight: 0.9,
            }}
          >
            Your{' '}
            <span className="italic text-copper" style={{ fontWeight: 380 }}>
              Fortune&nbsp;100
            </span>
            <br />
            technology
            <br />
            champion.
            <span className="ml-3 inline-block text-bone/35">On retainer.</span>
          </h1>
        </div>

        <div
          className="col-span-12 flex flex-col justify-end md:col-span-4 v2-rise"
          style={{ animationDelay: '180ms' }}
        >
          <p className="font-editorial text-lg leading-relaxed text-bone/75 md:text-xl">
            You don't need another vendor.
            <br />
            You need the engineer your biggest competitor wishes they could hire.
            <br />
            <span className="text-bone">Now you can.</span>
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={CALENDLY}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackCTAClick('book_discovery', 'v2_hero');
                trackVariantConversion('book_discovery_hero', 'b');
              }}
              className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-ink transition hover:bg-copper hover:text-bone"
            >
              Engage the Champion
              <ArrowUpRight
                size={16}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href="#capabilities"
              onClick={() => trackCTAClick('see_capabilities', 'v2_hero')}
              className="inline-flex items-center gap-2 rounded-full border border-bone/25 px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-bone/85 transition hover:border-bone hover:text-bone"
            >
              What He Ships ↓
            </a>
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

/* ------------------------------- PROVENANCE ------------------------------- */
const ProvenanceV2: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section
      ref={ref}
      className="relative border-b border-white/10 py-20 md:py-32"
    >
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <Eyebrow>§ 01 — Provenance</Eyebrow>
            <h2
              className="v2-display mt-5 text-bone"
              style={{ fontWeight: 400, fontSize: 'clamp(2rem, 5.5vw, 3rem)' }}
            >
              Where the résumé came from.
            </h2>
            <p className="mt-5 font-editorial text-base leading-relaxed text-bone/65 md:text-lg">
              Three names you recognize. A decade of building systems the rest of
              the market copies five years later.
            </p>
          </div>

          <div className="col-span-12 md:col-span-8">
            <ul className="divide-y divide-white/10">
              {CREDENTIALS.map((c, i) => (
                <li
                  key={c.org}
                  className="flex items-baseline justify-between gap-6 py-6 md:py-8"
                  style={{
                    animation: inView
                      ? `v2-rise 800ms ${200 + i * 140}ms both`
                      : 'none',
                    opacity: inView ? 1 : 0,
                  }}
                >
                  <div>
                    <div
                      className="v2-display text-bone"
                      style={{
                        fontWeight: 380,
                        fontSize: 'clamp(1.6rem, 5.5vw, 3rem)',
                      }}
                    >
                      {c.org}
                    </div>
                    <div className="mt-2 font-editorial text-sm text-bone/55 md:text-base">
                      {c.role}
                    </div>
                  </div>
                  <div className="v2-mono shrink-0 text-copper">{c.era}</div>
                </li>
              ))}
            </ul>

            <blockquote
              className="mt-10 border-l-2 border-copper pl-5 font-editorial text-lg italic leading-relaxed text-bone/85 md:pl-6 md:text-2xl"
              style={{
                animation: inView ? 'v2-rise 900ms 700ms both' : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              “I built the systems at the companies your competitors aspire to. I
              now build them for operators who run real businesses — the ones
              Fortune 100 talent never shows up for.”
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
};

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
const ChampionV2: React.FC<{ photo: string; bio: string }> = ({
  photo,
  bio,
}) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section ref={ref} className="v2-bone-bg relative py-20 md:py-32">
      <div className="container mx-auto max-w-6xl px-5 sm:px-6">
        <div className="grid grid-cols-12 gap-8 md:gap-10">
          <div className="col-span-12 md:col-span-5">
            <div
              className="relative"
              style={{
                animation: inView ? 'v2-rise 900ms both' : 'none',
                opacity: inView ? 1 : 0,
              }}
            >
              <div className="absolute -inset-3 border border-ink/20" />
              <img
                src={photo}
                alt="Mutaaf — Fractional CTO"
                className="relative z-10 h-[420px] w-full object-cover grayscale contrast-[1.05] md:h-[560px]"
              />
              <div className="absolute -bottom-4 -right-4 z-20 bg-copper px-4 py-2">
                <span className="v2-mono text-bone">The Champion</span>
              </div>
            </div>
          </div>

          <div
            className="col-span-12 md:col-span-7"
            style={{
              animation: inView ? 'v2-rise 900ms 180ms both' : 'none',
              opacity: inView ? 1 : 0,
            }}
          >
            <span className="v2-mono text-copper">§ 04 — The Operator</span>
            <h2
              className="v2-display mt-4 text-ink"
              style={{ fontWeight: 400, fontSize: 'clamp(2.2rem, 6vw, 4rem)' }}
            >
              One engineer.
              <br />
              <span className="italic">In your corner.</span>
            </h2>
            <p className="mt-7 font-editorial text-lg leading-relaxed text-ink/80 md:text-xl">
              {bio}
            </p>
            <p className="mt-4 font-editorial text-lg leading-relaxed text-ink/80 md:text-xl">
              A retainer isn't a seat on a Slack channel. It's a direct line to
              the person who has shipped at the scale you're trying to reach —
              and who treats your roadmap like a founder would.
            </p>

            <div className="mt-10 border-t border-ink/15 pt-6">
              <span className="v2-mono text-ink/55">Ledger</span>
              <ul className="mt-4 divide-y divide-ink/10">
                {LEDGER.map((l) => (
                  <li
                    key={l.y}
                    className="flex items-baseline gap-4 py-3 md:gap-6"
                  >
                    <span className="v2-mono w-14 shrink-0 text-copper md:w-16">
                      {l.y}
                    </span>
                    <span className="font-editorial text-ink/85">{l.t}</span>
                  </li>
                ))}
              </ul>
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
          <Eyebrow>§ 05 — Engage</Eyebrow>
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
              trackVariantConversion('book_discovery_engage', 'b');
            }}
            className="group inline-flex w-full items-center justify-between gap-4 border border-bone/30 bg-bone px-6 py-5 text-ink transition hover:bg-copper hover:text-bone md:px-8 md:py-6"
          >
            <div className="text-left">
              <div className="v2-mono text-ink/60 group-hover:text-bone/70">
                Book discovery
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
  const bio =
    content?.founder?.bio ||
    'Fractional CTO since 2019 for healthcare, construction, recycling, and entertainment businesses.';

  return (
    <div ref={rootRef} className="v2-root min-h-screen">
      <Helmet>
        <title>Your Fortune 100 Technology Champion · DigitalCraft AI</title>
        <meta
          name="description"
          content="A Fortune 100-caliber fractional CTO on retainer. Strategic architecture, AI systems, and shipped engineering for operators who refuse to lose to better-tooled competitors."
        />
      </Helmet>
      <Navbar darkHero />
      <HeroV2 />
      <ProvenanceV2 />
      <MandateV2 />
      <CapabilitiesV2 />
      <ChampionV2 photo={photo} bio={bio} />
      <EngageV2 />
      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default IndexV2;
