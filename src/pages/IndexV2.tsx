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

const CALENDLY = 'https://calendly.com/mutaaf';

const CREDENTIALS = [
  { org: 'Motorola Solutions', role: 'Engineering Leadership', era: '— 2019' },
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

const CAPABILITIES = [
  {
    n: '01',
    tag: 'Lead Intake / GPT-4o',
    title: 'Voice-first lead intake that closes',
    body:
      'Every inbound call captured, qualified, and routed — before your competitor picks up.',
    to: '/construction/demo/lead-responder',
  },
  {
    n: '02',
    tag: 'Voice AI / Vapi + ElevenLabs',
    title: 'Live voice negotiation, 24/7',
    body:
      'An AI that makes the follow-up call, handles objections, and books the meeting. Browser demo, live in three clicks.',
    to: '/construction/demo/voice-negotiator',
  },
  {
    n: '03',
    tag: 'Multi-agent pipeline',
    title: 'Deal analysis in under a minute',
    body:
      'Paste a listing URL. The system extracts specs, pulls comps, runs the deal, drafts the seller note. Ready to send.',
    to: '/realestate/demo/property-negotiator',
  },
  {
    n: '04',
    tag: 'Structured output',
    title: 'Estimates while the lead is still hot',
    body:
      'A guided estimator that turns an inquiry into a printable proposal in the time it takes to walk back to your truck.',
    to: '/construction/demo/estimate',
  },
  {
    n: '05',
    tag: 'Ops automation',
    title: 'Review engine that runs itself',
    body:
      'SMS review requests, dashboard, response templates. Built for a construction owner who hated chasing reviews.',
    to: '/construction/demo/reviews',
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

const HeroV2: React.FC = () => (
  <section className="relative overflow-hidden border-b border-white/10 pt-28 pb-20 md:pt-36 md:pb-28">
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 -right-40 h-[640px] w-[640px] rounded-full opacity-[0.18] blur-3xl"
      style={{
        background:
          'radial-gradient(closest-side, #c96e2c, transparent 70%)',
      }}
    />
    <div className="container mx-auto max-w-6xl px-6">
      <div className="mb-14 flex items-center justify-between">
        <Eyebrow>§ Masthead / Vol. VII · MMXXVI</Eyebrow>
        <Eyebrow muted>Fractional CTO · On Retainer</Eyebrow>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-10">
        <div className="col-span-12 md:col-span-8">
          <h1
            className="v2-display v2-rise text-[13vw] leading-[0.88] text-bone md:text-[110px] lg:text-[128px]"
            style={{ fontWeight: 360 }}
          >
            Your{' '}
            <span
              className="italic text-copper"
              style={{ fontWeight: 380 }}
            >
              Fortune&nbsp;100
            </span>
            <br />
            technology
            <br />
            champion.{' '}
            <span className="text-bone/40">On retainer.</span>
          </h1>
        </div>

        <div
          className="col-span-12 flex flex-col justify-end md:col-span-4 v2-rise"
          style={{ animationDelay: '180ms' }}
        >
          <p className="font-editorial text-lg leading-relaxed text-bone/70 md:text-xl">
            You don't need another vendor.
            <br />
            You need the engineer your biggest competitor
            wishes they could hire.
            <br />
            <span className="text-bone">Now you can.</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
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
              className="inline-flex items-center gap-2 rounded-full border border-bone/20 px-6 py-3 font-mono text-[13px] uppercase tracking-wider text-bone/80 transition hover:border-bone hover:text-bone"
            >
              What He Ships ↓
            </a>
          </div>
        </div>
      </div>

      <div
        className="mt-20 grid grid-cols-2 gap-y-6 border-t border-white/10 pt-8 md:grid-cols-4 v2-fade"
        style={{ animationDelay: '420ms' }}
      >
        {METRICS.map((m) => (
          <div key={m.k}>
            <div
              className="v2-display text-3xl text-bone md:text-4xl"
              style={{ fontWeight: 400 }}
            >
              {m.k}
            </div>
            <div className="v2-mono mt-2 text-bone/50">{m.v}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProvenanceV2: React.FC = () => (
  <section className="relative border-b border-white/10 py-24 md:py-32">
    <div className="container mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 md:col-span-4">
          <Eyebrow>§ 01 — Provenance</Eyebrow>
          <h2
            className="v2-display mt-6 text-4xl text-bone md:text-5xl"
            style={{ fontWeight: 400 }}
          >
            Where the résumé came from.
          </h2>
          <p className="mt-6 font-editorial text-base leading-relaxed text-bone/60">
            Three names you recognize. A decade of building systems
            the rest of the market copies five years later.
          </p>
        </div>

        <div className="col-span-12 md:col-span-8">
          <ul className="divide-y divide-white/10">
            {CREDENTIALS.map((c, i) => (
              <li
                key={c.org}
                className="flex items-baseline justify-between gap-6 py-6 md:py-8"
                style={{
                  animation: `v2-rise 800ms ${200 + i * 120}ms both`,
                }}
              >
                <div>
                  <div
                    className="v2-display text-3xl text-bone md:text-5xl"
                    style={{ fontWeight: 380 }}
                  >
                    {c.org}
                  </div>
                  <div className="mt-2 font-editorial text-bone/50">
                    {c.role}
                  </div>
                </div>
                <div className="v2-mono shrink-0 text-copper">{c.era}</div>
              </li>
            ))}
          </ul>

          <blockquote
            className="mt-10 border-l-2 border-copper pl-6 font-editorial text-xl italic leading-relaxed text-bone/80 md:text-2xl"
          >
            “I built the systems at the companies your competitors
            aspire to. I now build them for operators who run real
            businesses — the ones Fortune 100 talent never shows up for.”
          </blockquote>
        </div>
      </div>
    </div>
  </section>
);

const MandateV2: React.FC = () => (
  <section className="v2-bone-bg relative py-24 md:py-32">
    <div className="container mx-auto max-w-6xl px-6">
      <div className="mb-16 flex items-end justify-between gap-6 border-b border-ink/15 pb-6">
        <div>
          <span className="v2-mono text-copper">§ 02 — The Mandate</span>
          <h2
            className="v2-display mt-4 max-w-2xl text-4xl text-ink md:text-6xl"
            style={{ fontWeight: 400 }}
          >
            What a champion
            <br />
            <span className="italic">actually does for you.</span>
          </h2>
        </div>
        <p className="hidden max-w-xs font-editorial text-ink/60 md:block">
          Five mandates. One retainer. No hourly billing games, no
          vendor triangulation, no slideware.
        </p>
      </div>

      <ul>
        {MANDATE.map((m, i) => (
          <li
            key={m.n}
            className="group grid grid-cols-12 gap-6 border-b border-ink/15 py-8 transition-colors hover:bg-ink/[0.03] md:py-10"
            style={{ animation: `v2-rise 700ms ${i * 80}ms both` }}
          >
            <div className="col-span-2 md:col-span-1">
              <span className="v2-mono text-copper">{m.n}</span>
            </div>
            <div className="col-span-10 md:col-span-5">
              <h3
                className="v2-display text-2xl text-ink md:text-4xl"
                style={{ fontWeight: 400 }}
              >
                {m.title}
              </h3>
            </div>
            <div className="col-span-12 md:col-span-6">
              <p className="font-editorial text-lg leading-relaxed text-ink/70">
                {m.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

const CapabilitiesV2: React.FC = () => (
  <section
    id="capabilities"
    className="relative border-b border-white/10 py-24 md:py-32"
  >
    <div className="container mx-auto max-w-6xl px-6">
      <div className="mb-16 flex items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <Eyebrow>§ 03 — Portfolio</Eyebrow>
          <h2
            className="v2-display mt-4 max-w-3xl text-4xl text-bone md:text-6xl"
            style={{ fontWeight: 400 }}
          >
            What your CTO
            <br />
            <span className="italic text-copper">has already shipped.</span>
          </h2>
        </div>
        <p className="hidden max-w-xs font-editorial text-bone/55 md:block">
          Every demo is live. Every one runs on your company's data
          the moment you drop your URL.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {CAPABILITIES.map((c, i) => (
          <Link
            key={c.n}
            to={c.to}
            onClick={() =>
              trackCTAClick(`capability_${c.n}`, 'v2_capabilities')
            }
            className={`group relative col-span-12 md:col-span-6 ${
              i === 0 ? 'md:col-span-12' : ''
            } rounded-sm border border-white/10 bg-ink-soft/40 p-8 transition hover:border-copper/60 hover:bg-ink-soft/80 md:p-10`}
            style={{ animation: `v2-rise 700ms ${i * 100}ms both` }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-4">
                  <span className="v2-mono text-copper">{c.n}</span>
                  <span className="v2-mono text-bone/40">{c.tag}</span>
                </div>
                <h3
                  className={`v2-display mt-5 text-ink text-bone ${
                    i === 0
                      ? 'text-4xl md:text-6xl'
                      : 'text-2xl md:text-3xl'
                  }`}
                  style={{ fontWeight: 400 }}
                >
                  {c.title}
                </h3>
                <p
                  className={`mt-4 max-w-2xl font-editorial leading-relaxed text-bone/65 ${
                    i === 0 ? 'text-xl' : 'text-base'
                  }`}
                >
                  {c.body}
                </p>
              </div>
              <ArrowUpRight
                className="shrink-0 text-bone/40 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-copper"
                size={i === 0 ? 28 : 22}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const ChampionV2: React.FC<{ photo: string; bio: string }> = ({
  photo,
  bio,
}) => (
  <section className="v2-bone-bg relative py-24 md:py-32">
    <div className="container mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-12 gap-10">
        <div className="col-span-12 md:col-span-5">
          <div className="relative">
            <div className="absolute -inset-3 border border-ink/15" />
            <img
              src={photo}
              alt="Mutaaf — Fractional CTO"
              className="relative z-10 h-[560px] w-full object-cover grayscale contrast-[1.05]"
            />
            <div className="absolute -bottom-4 -right-4 z-20 bg-copper px-4 py-2">
              <span className="v2-mono text-bone">The Champion</span>
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-7">
          <span className="v2-mono text-copper">§ 04 — The Operator</span>
          <h2
            className="v2-display mt-4 text-4xl text-ink md:text-6xl"
            style={{ fontWeight: 400 }}
          >
            One engineer.
            <br />
            <span className="italic">In your corner.</span>
          </h2>
          <p className="mt-8 font-editorial text-xl leading-relaxed text-ink/75">
            {bio}
          </p>
          <p className="mt-4 font-editorial text-xl leading-relaxed text-ink/75">
            A retainer isn't a seat on a Slack channel. It's a direct
            line to the person who has shipped at the scale you're
            trying to reach — and who treats your roadmap like a
            founder would.
          </p>

          <div className="mt-10 border-t border-ink/15 pt-6">
            <span className="v2-mono text-ink/50">Ledger</span>
            <ul className="mt-4 divide-y divide-ink/10">
              {LEDGER.map((l) => (
                <li
                  key={l.y}
                  className="flex items-baseline gap-6 py-3"
                >
                  <span className="v2-mono w-16 shrink-0 text-copper">
                    {l.y}
                  </span>
                  <span className="font-editorial text-ink/80">
                    {l.t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const EngageV2: React.FC = () => (
  <section className="relative overflow-hidden py-28 md:py-36">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        background:
          'radial-gradient(circle at 30% 50%, #c96e2c 0%, transparent 60%)',
      }}
    />
    <div className="container relative mx-auto max-w-6xl px-6">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-8">
          <Eyebrow>§ 05 — Engage</Eyebrow>
          <h2
            className="v2-display mt-6 text-5xl text-bone md:text-7xl lg:text-8xl"
            style={{ fontWeight: 380 }}
          >
            Put a{' '}
            <span className="italic text-copper">Fortune 100</span>{' '}
            engineer
            <br />
            in your corner.
          </h2>
          <p className="mt-8 max-w-xl font-editorial text-xl leading-relaxed text-bone/70">
            Thirty-minute discovery call. No pitch. We'll map the one
            system that, if built, would change your P&L most this
            quarter — and whether I'm the right person to build it.
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
            className="group inline-flex w-full items-center justify-between gap-4 border border-bone/30 bg-bone px-8 py-6 text-ink transition hover:bg-copper hover:text-bone"
          >
            <div className="text-left">
              <div className="v2-mono text-ink/60 group-hover:text-bone/70">
                Book discovery
              </div>
              <div
                className="v2-display mt-1 text-2xl"
                style={{ fontWeight: 400 }}
              >
                30 min · No pitch
              </div>
            </div>
            <ArrowRight
              className="shrink-0 transition group-hover:translate-x-1"
              size={28}
            />
          </a>
        </div>
      </div>
    </div>
  </section>
);

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
        <title>
          Your Fortune 100 Technology Champion · DigitalCraft AI
        </title>
        <meta
          name="description"
          content="A Fortune 100-caliber fractional CTO on retainer. Strategic architecture, AI systems, and shipped engineering for operators who refuse to lose to better-tooled competitors."
        />
      </Helmet>
      <Navbar />
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
