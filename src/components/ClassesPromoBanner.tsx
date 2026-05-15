import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { getDefaultSession } from '@/data/classSessions';
import { trackCTAClick } from '@/utils/analytics';

/**
 * Inline promotional strip for the next upcoming in-person AI class session.
 * Rendered on the construction landing page (Index.tsx) just below the hero.
 *
 * Uses its own gold/green/cream palette (matching /classes) so it reads as a
 * separate offering from the consulting/automation main pitch. Hides itself
 * once the session's start date has passed so the next session takes over
 * automatically — or, if no session is upcoming, the banner stays out of
 * the page entirely.
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
          --promo-ink:#1a1714;
          --promo-gold:#c9913a;
          --promo-green:#1a6b4a;
          --promo-green-mid:#2d9b6e;
          --promo-cream:#fdf8f2;
          --promo-bone:#c8c2ba;
          font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
          background:var(--promo-ink);
          color:var(--promo-cream);
          position:relative;
          overflow:hidden;
          border-top:1px solid rgba(255,255,255,.04);
          border-bottom:1px solid rgba(255,255,255,.04);
        }
        .dca-classes-promo::before {
          content:''; position:absolute; inset:0;
          background:
            radial-gradient(ellipse 50% 80% at 85% 50%, rgba(45,155,110,.18) 0%, transparent 65%),
            radial-gradient(ellipse 40% 70% at 10% 100%, rgba(201,145,58,.12) 0%, transparent 70%);
          pointer-events:none;
        }
        .dca-classes-promo::after {
          content:''; position:absolute; top:0; left:0; right:0; height:3px;
          background:linear-gradient(90deg,#2d9b6e 0%,#c9913a 50%,#4a63d4 100%);
        }
        .dca-classes-promo .wrap {
          max-width:1180px; margin:0 auto;
          padding:28px 28px;
          display:grid;
          grid-template-columns:1fr auto;
          gap:32px;
          align-items:center;
          position:relative;
        }
        .dca-classes-promo .left { display:flex; flex-direction:column; gap:10px; min-width:0; }
        .dca-classes-promo .eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'DM Mono',ui-monospace,monospace;
          font-size:11px; letter-spacing:.18em; text-transform:uppercase;
          color:var(--promo-gold);
        }
        .dca-classes-promo .eyebrow .dot {
          width:7px; height:7px; border-radius:50%;
          background:var(--promo-gold);
          box-shadow:0 0 0 4px rgba(201,145,58,.18);
          animation:dca-promo-pulse 2.4s ease-in-out infinite;
        }
        @keyframes dca-promo-pulse {
          0%,100% { box-shadow:0 0 0 4px rgba(201,145,58,.18); }
          50% { box-shadow:0 0 0 8px rgba(201,145,58,.05); }
        }
        .dca-classes-promo .headline {
          font-family:'Playfair Display','Times New Roman',serif;
          font-size:clamp(22px,3vw,30px);
          font-weight:900;
          line-height:1.1;
          color:var(--promo-cream);
          letter-spacing:-.01em;
        }
        .dca-classes-promo .headline em { font-style:italic; color:var(--promo-gold); }
        .dca-classes-promo .meta {
          display:flex; flex-wrap:wrap; gap:14px 18px;
          font-size:13px; color:var(--promo-bone);
          margin-top:2px;
        }
        .dca-classes-promo .meta-item { display:inline-flex; align-items:center; gap:6px; }
        .dca-classes-promo .meta-item svg { color:var(--promo-gold); opacity:.85; }

        .dca-classes-promo .right {
          display:flex; flex-direction:column; align-items:flex-end; gap:12px;
          min-width:0;
        }
        .dca-classes-promo .countdown {
          display:flex; align-items:center; gap:10px;
        }
        .dca-classes-promo .count-block {
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.1);
          border-radius:10px;
          padding:8px 14px;
          text-align:center;
          min-width:62px;
        }
        .dca-classes-promo .count-num {
          font-family:'Playfair Display',serif;
          font-size:24px; font-weight:900; line-height:1;
          color:var(--promo-cream);
          font-variant-numeric:tabular-nums;
        }
        .dca-classes-promo .count-label {
          font-family:'DM Mono',monospace;
          font-size:9.5px; letter-spacing:.16em; text-transform:uppercase;
          color:var(--promo-bone);
          margin-top:4px;
        }

        .dca-classes-promo .cta-row {
          display:flex; align-items:center; gap:14px;
        }
        .dca-classes-promo .scarcity {
          font-family:'DM Mono',monospace;
          font-size:11px;
          letter-spacing:.06em;
          color:var(--promo-gold);
          text-transform:uppercase;
        }
        .dca-classes-promo .cta {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--promo-green-mid);
          color:white; text-decoration:none;
          padding:12px 22px; border-radius:10px;
          font-weight:700; font-size:14px;
          transition:background .15s,transform .1s,box-shadow .15s;
          box-shadow:0 8px 24px rgba(45,155,110,.25);
          border:1px solid rgba(255,255,255,.08);
          white-space:nowrap;
        }
        .dca-classes-promo .cta:hover { background:#22875f; transform:translateY(-1px); box-shadow:0 10px 28px rgba(45,155,110,.35); }
        .dca-classes-promo .cta:active { transform:translateY(0); }

        @media (max-width: 880px) {
          .dca-classes-promo .wrap { grid-template-columns:1fr; gap:18px; padding:24px 22px; }
          .dca-classes-promo .right { align-items:stretch; }
          .dca-classes-promo .cta-row { justify-content:space-between; flex-wrap:wrap; gap:10px; }
        }
        @media (max-width: 480px) {
          .dca-classes-promo .count-block { min-width:54px; padding:6px 10px; }
          .dca-classes-promo .count-num { font-size:20px; }
          .dca-classes-promo .headline { font-size:20px; }
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
            Learn AI in person at <em>{session.location.venue}</em>
            {' '}— for {session.audience.toLowerCase()}.
          </div>
          <div className="meta">
            <span className="meta-item">
              <Calendar size={13} />
              First session {startsToday ? 'today' : `in ${remaining.days} day${remaining.days === 1 ? '' : 's'}`} · {session.dateLabel}
            </span>
            <span className="meta-item">
              <MapPin size={13} />
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
