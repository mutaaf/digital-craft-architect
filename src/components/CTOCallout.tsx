import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { CTO_URL } from '@/utils/hostVariant';
import { trackCTAClick } from '@/utils/analytics';

export const CTOHeroSection: React.FC = () => (
  <section
    className="relative overflow-hidden py-16 md:py-24"
    style={{
      background:
        'linear-gradient(135deg, #0b0b0d 0%, #17171b 45%, #0b0b0d 100%)',
    }}
  >
    <div
      aria-hidden
      className="pointer-events-none absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
      style={{
        background: 'radial-gradient(closest-side, #c96e2c, transparent 70%)',
      }}
    />
    <div
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-0 h-[280px] w-[280px] rounded-full opacity-20 blur-3xl"
      style={{
        background: 'radial-gradient(closest-side, #e89862, transparent 70%)',
      }}
    />

    <div className="container relative mx-auto max-w-6xl px-4">
      <div className="grid grid-cols-12 items-center gap-8 md:gap-12">
        <div className="col-span-12 md:col-span-7">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-copper/40 bg-copper/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-copper"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            <Sparkles size={12} />
            Also available
          </div>

          <h2
            className="mt-5 text-4xl leading-[1.02] text-bone md:text-5xl lg:text-6xl"
            style={{
              fontFamily: "'Fraunces', 'Newsreader', Georgia, serif",
              fontVariationSettings: "'opsz' 144, 'SOFT' 30",
              fontWeight: 400,
              letterSpacing: '-0.03em',
            }}
          >
            Prefer a{' '}
            <span
              className="italic"
              style={{ color: '#c96e2c', fontWeight: 420 }}
            >
              Fortune 100 CTO
            </span>
            <br />
            on retainer?
          </h2>

          <p
            className="mt-5 max-w-xl text-lg leading-relaxed text-bone/75 md:text-xl"
            style={{ fontFamily: "'Newsreader', Georgia, serif" }}
          >
            For operators who want strategic technology leadership — not just a
            tool — we offer a dedicated fractional-CTO engagement. One named
            partner. A hand-picked bench. Outcomes tied to your P&L.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={CTO_URL}
              onClick={() => trackCTAClick('cto_hero_section_cta', 'v1_cto_section')}
              className="group inline-flex items-center gap-2 rounded-full bg-bone px-6 py-3 text-ink transition hover:bg-copper hover:text-bone"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: '13px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Meet the CTO
              <ArrowUpRight
                size={15}
                className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <a
              href={CTO_URL}
              onClick={() => trackCTAClick('cto_hero_section_link', 'v1_cto_section')}
              className="text-[13px] text-bone/60 transition hover:text-bone"
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              cto.digitalcraftai.com ↗
            </a>
          </div>
        </div>

        <div className="col-span-12 md:col-span-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { k: '< 60s', v: 'Lead response' },
              { k: '< 1hr', v: 'Estimate turnaround' },
              { k: '20 hr/wk', v: 'Ops reclaimed' },
              { k: '7+ yrs', v: 'Fractional CTO' },
            ].map((m) => (
              <div
                key={m.k}
                className="border border-white/10 bg-black/30 p-4 backdrop-blur-sm"
              >
                <div
                  className="text-2xl text-bone md:text-3xl"
                  style={{
                    fontFamily: "'Fraunces', 'Newsreader', Georgia, serif",
                    fontWeight: 400,
                  }}
                >
                  {m.k}
                </div>
                <div
                  className="mt-1 text-[10px] uppercase tracking-[0.14em] text-bone/50"
                  style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
                >
                  {m.v}
                </div>
              </div>
            ))}
          </div>
          <div
            className="mt-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-bone/45"
            style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace" }}
          >
            <span>Built systems at</span>
            <span className="text-bone/75">Motorola</span>
            <span className="text-copper/60">◆</span>
            <span className="text-bone/75">Amazon</span>
            <span className="text-copper/60">◆</span>
            <span className="text-bone/75">Disney</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);
