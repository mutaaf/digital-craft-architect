import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { getDefaultSession } from '@/data/classSessions';
import { trackCTAClick } from '@/utils/analytics';

/**
 * Inline promotional strip for the next upcoming in-person AI class session.
 * Rendered on the main landing page just below the hero.
 *
 * Visual approach: warm cream background with the site's signature sky-blue
 * primary as the structural accent and gold as the editorial highlight.
 * The point is to read as a clearly-different OFFERING (in-person, premium,
 * limited) without breaking the otherwise blue/white site palette.
 *
 * Self-hides once the session's start date has passed; falls through with
 * `display:none` if there is no upcoming session at all.
 */

function timeUntil(date: Date): { days: number; hours: number; mins: number } | null {
  const diff = date.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
  };
}

const ClassesPromoBanner: React.FC = () => {
  const session = useMemo(() => getDefaultSession(), []);
  const startDate = useMemo(() => new Date(session.startDate), [session]);
  const [remaining, setRemaining] = useState(() => timeUntil(startDate));

  useEffect(() => {
    const id = setInterval(() => setRemaining(timeUntil(startDate)), 60000);
    return () => clearInterval(id);
  }, [startDate]);

  if (!remaining) return null;
  if (session.status === 'closed') return null;

  const startsToday = remaining.days === 0;
  const startsSoon = remaining.days <= 14;

  const trackPrice = session.tracks.reduce((min, t) => {
    const n = parseInt(t.price.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? min : Math.min(min, n);
  }, Number.POSITIVE_INFINITY);

  return (
    <section
      className="dca-classes-promo"
      aria-label={`In-person AI classes promotion — ${session.shortName}`}
    >
      <style>{`
        .dca-classes-promo {
          --pb-blue:#33C3F0;
          --pb-blue-deep:#1aa8d6;
          --pb-gold:#c9913a;
          --pb-gold-deep:#8a5d18;
          --pb-cream:#fdf8f2;
          --pb-cream-soft:#fbf3e8;
          --pb-ink:#1a1714;
          --pb-mid:#5a5450;
          --pb-rule:rgba(26,23,20,.08);
          font-family:-apple-system,BlinkMacSystemFont,'Inter','DM Sans',sans-serif;
          background:linear-gradient(180deg, var(--pb-cream) 0%, var(--pb-cream-soft) 100%);
          color:var(--pb-ink);
          position:relative;
          overflow:hidden;
          border-top:1px solid var(--pb-rule);
          border-bottom:1px solid var(--pb-rule);
        }
        .dca-classes-promo::before {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 55% 80% at 90% 50%, rgba(51,195,240,.10) 0%, transparent 65%),
            radial-gradient(ellipse 40% 70% at 5% 100%, rgba(201,145,58,.10) 0%, transparent 70%);
          pointer-events:none;
        }
        .dca-classes-promo::after {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg, var(--pb-blue) 0%, var(--pb-gold) 100%);
        }
        .dca-classes-promo .wrap {
          max-width:1180px; margin:0 auto;
          padding:26px 28px;
          display:grid;
          grid-template-columns:1fr auto;
          gap:32px;
          align-items:center;
          position:relative;
        }
        .dca-classes-promo .left { display:flex; flex-direction:column; gap:10px; min-width:0; }
        .dca-classes-promo .eyebrow {
          display:inline-flex; align-items:center; gap:9px;
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:11px; letter-spacing:.18em; text-transform:uppercase;
          color:var(--pb-gold-deep);
          font-weight:600;
        }
        .dca-classes-promo .eyebrow .dot {
          width:7px; height:7px; border-radius:50%;
          background:var(--pb-gold);
          box-shadow:0 0 0 4px rgba(201,145,58,.18);
          animation:dca-pb-pulse 2.4s ease-in-out infinite;
          flex-shrink:0;
        }
        @keyframes dca-pb-pulse {
          0%,100% { box-shadow:0 0 0 4px rgba(201,145,58,.18); }
          50% { box-shadow:0 0 0 8px rgba(201,145,58,.05); }
        }
        .dca-classes-promo .headline {
          font-family:'Inter',-apple-system,sans-serif;
          font-size:clamp(20px,2.7vw,28px);
          font-weight:800;
          line-height:1.18;
          color:var(--pb-ink);
          letter-spacing:-.01em;
        }
        .dca-classes-promo .headline .accent {
          color:var(--pb-gold-deep);
          font-weight:800;
          position:relative;
          white-space:nowrap;
        }
        .dca-classes-promo .headline .accent::after {
          content:''; position:absolute; left:0; right:0; bottom:-2px; height:3px;
          background:linear-gradient(90deg, transparent 0%, var(--pb-gold) 20%, var(--pb-gold) 80%, transparent 100%);
          opacity:.5;
        }
        .dca-classes-promo .meta {
          display:flex; flex-wrap:wrap; gap:12px 18px;
          font-size:13.5px; color:var(--pb-mid);
          margin-top:2px;
        }
        .dca-classes-promo .meta-item { display:inline-flex; align-items:center; gap:6px; }
        .dca-classes-promo .meta-item svg { color:var(--pb-blue-deep); opacity:.9; flex-shrink:0; }

        .dca-classes-promo .right {
          display:flex; flex-direction:column; align-items:flex-end; gap:12px;
          min-width:0;
        }
        .dca-classes-promo .countdown {
          display:flex; align-items:center; gap:8px;
        }
        .dca-classes-promo .count-block {
          background:white;
          border:1px solid var(--pb-rule);
          border-radius:10px;
          padding:8px 14px;
          text-align:center;
          min-width:62px;
          box-shadow:0 2px 6px rgba(26,23,20,.04);
        }
        .dca-classes-promo .count-num {
          font-family:'Inter',sans-serif;
          font-size:24px; font-weight:800; line-height:1;
          color:var(--pb-ink);
          font-variant-numeric:tabular-nums;
          letter-spacing:-.02em;
        }
        .dca-classes-promo .count-label {
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:9.5px; letter-spacing:.16em; text-transform:uppercase;
          color:var(--pb-mid);
          margin-top:4px;
          font-weight:500;
        }

        .dca-classes-promo .cta-row {
          display:flex; align-items:center; gap:14px;
        }
        .dca-classes-promo .scarcity {
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:11px;
          letter-spacing:.06em;
          color:var(--pb-gold-deep);
          text-transform:uppercase;
          font-weight:600;
        }
        .dca-classes-promo .cta {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--pb-blue);
          color:white; text-decoration:none;
          padding:12px 22px; border-radius:10px;
          font-weight:700; font-size:14px;
          transition:background .15s,transform .1s,box-shadow .15s;
          box-shadow:0 6px 20px rgba(51,195,240,.32);
          white-space:nowrap;
          position:relative;
        }
        .dca-classes-promo .cta::before {
          content:''; position:absolute; inset:-2px;
          border-radius:12px;
          background:linear-gradient(135deg, var(--pb-gold) 0%, transparent 50%);
          opacity:.18;
          pointer-events:none;
        }
        .dca-classes-promo .cta:hover { background:var(--pb-blue-deep); transform:translateY(-1px); box-shadow:0 10px 26px rgba(51,195,240,.4); }
        .dca-classes-promo .cta:active { transform:translateY(0); }
        .dca-classes-promo .cta svg { position:relative; }

        @media (max-width: 880px) {
          .dca-classes-promo .wrap { grid-template-columns:1fr; gap:18px; padding:22px 20px; }
          .dca-classes-promo .right { align-items:stretch; }
          .dca-classes-promo .cta-row { justify-content:space-between; flex-wrap:wrap; gap:10px; }
        }
        @media (max-width: 480px) {
          .dca-classes-promo .count-block { min-width:54px; padding:6px 10px; }
          .dca-classes-promo .count-num { font-size:20px; }
          .dca-classes-promo .headline { font-size:19px; }
        }
      `}</style>

      <div className="wrap">
        <div className="left">
          <div className="eyebrow">
            <span className="dot" />
            <Sparkles size={12} />
            New · {session.seasonLabel} In-Person AI Classes
          </div>
          <div className="headline">
            Learn AI in person at{' '}
            <span className="accent">{session.location.venue}</span>
            {' '}— for {session.audience.toLowerCase()}.
          </div>
          <div className="meta">
            <span className="meta-item">
              <Calendar size={14} />
              First session {startsToday ? 'today' : `in ${remaining.days} day${remaining.days === 1 ? '' : 's'}`} · {session.dateLabel}
            </span>
            <span className="meta-item">
              <MapPin size={14} />
              {session.location.venue}, {session.location.city} {session.location.state}
            </span>
          </div>
        </div>

        <div className="right">
          <div className="countdown" aria-label="Countdown to first session">
            <div className="count-block">
              <div className="count-num">{remaining.days}</div>
              <div className="count-label">days</div>
            </div>
            <div className="count-block">
              <div className="count-num">{remaining.hours}</div>
              <div className="count-label">hrs</div>
            </div>
            <div className="count-block">
              <div className="count-num">{remaining.mins}</div>
              <div className="count-label">min</div>
            </div>
          </div>
          <div className="cta-row">
            <div className="scarcity">
              {session.status === 'waitlist'
                ? '⚠ Waitlist only'
                : startsSoon
                ? '⚠ Early-bird seats filling fast'
                : trackPrice !== Number.POSITIVE_INFINITY
                ? `From $${trackPrice} · Early-bird limited`
                : 'Early-bird limited'}
            </div>
            <Link
              to={`/classes/${session.slug}`}
              className="cta"
              onClick={() => trackCTAClick(`classes_promo_banner:${session.slug}`, 'landing_classes_banner')}
            >
              See classes &amp; register
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClassesPromoBanner;
