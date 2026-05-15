import React, { useEffect, useRef, useState } from 'react';
import { CalendarPlus, Apple, Check } from 'lucide-react';
import { ClassSession } from '@/data/classSessions';
import {
  googleCalendarUrl,
  icsDownloadUrl,
  outlookCalendarUrl,
  yahooCalendarUrl,
} from '@/lib/calendarLinks';
import { trackCTAClick } from '@/utils/analytics';

/**
 * "Add to Calendar" dropdown with one entry per major calendar provider.
 *
 * Used in two places:
 *   1. On the session landing page as a promo touchpoint — visitors can
 *      save the dates without registering (soft conversion lever).
 *   2. In the post-registration success modal as the primary follow-on
 *      action.
 *
 * Style modes:
 *   - "promo"  → cream/gold/blue full-bleed card (landing-page hero use)
 *   - "modal"  → compact green button (works inside the success modal)
 *   - "inline" → small outline pill (works in any narrow context)
 */

type Variant = 'promo' | 'modal' | 'inline';

interface Props {
  session: ClassSession;
  variant?: Variant;
  /** Analytics source string used in trackCTAClick calls. */
  source?: string;
}

const AddToCalendar: React.FC<Props> = ({ session, variant = 'promo', source = 'classes_add_to_calendar' }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleProviderClick = (provider: string) => {
    trackCTAClick(`${source}:${provider}:${session.slug}`, source);
    setOpen(false);
  };

  const providers: Array<{
    key: string;
    label: string;
    sub: string;
    href: string;
    icon: React.ReactNode;
    download?: boolean;
    target?: string;
  }> = [
    {
      key: 'google',
      label: 'Google Calendar',
      sub: 'gmail.com',
      href: googleCalendarUrl(session),
      icon: <span style={{ fontSize: 16 }}>📅</span>,
      target: '_blank',
    },
    {
      key: 'apple',
      label: 'Apple Calendar',
      sub: 'iPhone, Mac · downloads .ics',
      href: icsDownloadUrl(session),
      icon: <Apple size={15} />,
      download: true,
    },
    {
      key: 'outlook',
      label: 'Outlook',
      sub: 'outlook.com',
      href: outlookCalendarUrl(session),
      icon: <span style={{ fontSize: 14, fontWeight: 800, color: '#0078d4' }}>O</span>,
      target: '_blank',
    },
    {
      key: 'yahoo',
      label: 'Yahoo Calendar',
      sub: 'yahoo.com',
      href: yahooCalendarUrl(session),
      icon: <span style={{ fontSize: 14, fontWeight: 800, color: '#6001d2' }}>Y!</span>,
      target: '_blank',
    },
    {
      key: 'ics',
      label: 'Other / Download .ics',
      sub: 'Any RFC-5545 calendar app',
      href: icsDownloadUrl(session),
      icon: <span style={{ fontSize: 14 }}>📥</span>,
      download: true,
    },
  ];

  const sessionCount = (() => {
    const start = new Date(session.startDate).getTime();
    const end = new Date(session.endDate).getTime();
    const weeks = Math.round((end - start) / (7 * 24 * 60 * 60 * 1000)) + 1;
    return Math.max(1, weeks);
  })();

  return (
    <div className={`atc atc-${variant}`} ref={rootRef}>
      <style>{`
        .atc { position:relative; display:inline-block; font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif; }

        /* ====== PROMO variant — full-bleed card for landing page ====== */
        .atc-promo { display:block; width:100%; }
        .atc-promo .atc-card {
          background:linear-gradient(135deg, #fdf8f2 0%, #fbf3e8 100%);
          border:1.5px solid #e8d5a0;
          border-radius:16px;
          padding:24px 28px;
          display:flex; flex-wrap:wrap; gap:18px; align-items:center; justify-content:space-between;
          position:relative;
          overflow:hidden;
        }
        .atc-promo .atc-card::before {
          content:''; position:absolute; right:-30px; top:-30px;
          width:160px; height:160px; border-radius:50%;
          background:radial-gradient(circle, rgba(201,145,58,.18) 0%, transparent 70%);
          pointer-events:none;
        }
        .atc-promo .atc-info { min-width:240px; flex:1; position:relative; }
        .atc-promo .atc-eyebrow {
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:11px; letter-spacing:.16em; text-transform:uppercase;
          color:#8a5d18; font-weight:700; margin-bottom:6px;
        }
        .atc-promo .atc-title {
          font-family:'Playfair Display',serif;
          font-size:22px; font-weight:900; color:#1a1714; line-height:1.15;
          letter-spacing:-.005em;
        }
        .atc-promo .atc-title em { font-style:italic; color:#8a5d18; }
        .atc-promo .atc-sub {
          font-size:13.5px; color:#5a4e30; line-height:1.55; margin-top:6px; max-width:480px;
        }
        .atc-promo .atc-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
        .atc-promo .atc-chip {
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:10.5px; letter-spacing:.08em;
          background:white; border:1px solid rgba(138,93,24,.25);
          color:#5a4e30; padding:4px 10px; border-radius:30px; font-weight:600;
        }
        .atc-promo .atc-button-wrap { position:relative; }
        .atc-promo .atc-button {
          display:inline-flex; align-items:center; gap:9px;
          background:#1a1714; color:white; border:none;
          padding:14px 22px; border-radius:11px;
          font-weight:700; font-size:14.5px; cursor:pointer;
          box-shadow:0 10px 28px rgba(26,23,20,.18);
          transition:transform .12s, box-shadow .15s;
          font-family:inherit;
        }
        .atc-promo .atc-button:hover { transform:translateY(-1px); box-shadow:0 14px 34px rgba(26,23,20,.28); }
        .atc-promo .atc-button-caret { opacity:.6; }

        /* ====== MODAL variant — used in the success modal ====== */
        .atc-modal { display:block; width:100%; }
        .atc-modal .atc-button {
          display:inline-flex; align-items:center; justify-content:center; gap:9px;
          width:100%;
          background:#1a6b4a; color:white; border:none;
          padding:13px 18px; border-radius:10px;
          font-weight:700; font-size:14px; cursor:pointer;
          box-shadow:0 6px 18px rgba(45,155,110,.28);
          transition:background .15s, transform .1s, box-shadow .15s;
          font-family:inherit;
        }
        .atc-modal .atc-button:hover { background:#155a3c; transform:translateY(-1px); box-shadow:0 10px 24px rgba(45,155,110,.38); }

        /* ====== INLINE variant — small pill ====== */
        .atc-inline .atc-button {
          display:inline-flex; align-items:center; gap:7px;
          background:transparent; color:#1a1714;
          border:1.5px solid #e2ddd7; padding:8px 14px; border-radius:30px;
          font-size:12.5px; font-weight:600; cursor:pointer;
          transition:border-color .15s, background .15s;
          font-family:inherit;
        }
        .atc-inline .atc-button:hover { border-color:#2d9b6e; background:#f8fdf9; }

        /* ====== Dropdown menu ====== */
        .atc-menu {
          position:absolute;
          right:0; top:calc(100% + 8px);
          background:white;
          border-radius:14px;
          box-shadow:0 24px 60px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.04);
          min-width:280px;
          padding:8px;
          z-index:200;
          animation:atc-menu-in .18s ease-out;
        }
        @keyframes atc-menu-in {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .atc-promo .atc-menu, .atc-modal .atc-menu { left:auto; }
        .atc-menu-header {
          font-family:ui-monospace,'JetBrains Mono',monospace;
          font-size:10px; letter-spacing:.14em; text-transform:uppercase;
          color:#8a847a; font-weight:600;
          padding:6px 14px 10px;
        }
        .atc-menu a {
          display:flex; align-items:center; gap:11px;
          padding:9px 12px;
          border-radius:9px;
          color:#1a1714; text-decoration:none;
          transition:background .12s;
        }
        .atc-menu a:hover { background:#fdf8f2; }
        .atc-menu-icon {
          width:30px; height:30px; border-radius:8px;
          background:#f4efe6; display:flex; align-items:center; justify-content:center;
          flex-shrink:0; color:#1a1714;
        }
        .atc-menu-text { display:flex; flex-direction:column; min-width:0; }
        .atc-menu-label { font-size:13.5px; font-weight:600; line-height:1.2; }
        .atc-menu-sub { font-size:11.5px; color:#8a847a; line-height:1.3; margin-top:2px; }
        .atc-menu-footer {
          font-size:11px; color:#8a847a; padding:10px 14px 6px; border-top:1px solid #f4efe6; margin-top:4px;
          line-height:1.45;
        }
        .atc-menu-footer strong { color:#1a6b4a; }

        @media (max-width: 640px) {
          .atc-menu { right:0; min-width:260px; }
          .atc-promo .atc-card { flex-direction:column; align-items:flex-start; }
          .atc-promo .atc-button-wrap { width:100%; }
          .atc-promo .atc-button { width:100%; justify-content:center; }
        }
      `}</style>

      {variant === 'promo' && (
        <div className="atc-card">
          <div className="atc-info">
            <div className="atc-eyebrow">Save the dates · No registration needed</div>
            <div className="atc-title">
              Add all <em>{sessionCount} sessions</em> to your calendar.
            </div>
            <div className="atc-sub">
              Get a calendar block + reminder 24 hours before each Tuesday — so you never have to remember.
              Works with Google, Apple, Outlook, or Yahoo.
            </div>
            <div className="atc-chips">
              <span className="atc-chip">📅 {session.dateLabel}</span>
              <span className="atc-chip">⏰ {session.timeLabel}</span>
              <span className="atc-chip">📍 {session.location.venue}</span>
            </div>
          </div>
          <div className="atc-button-wrap">
            <button
              type="button"
              className="atc-button"
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <CalendarPlus size={17} />
              Add to my calendar
              <span className="atc-button-caret">▾</span>
            </button>
            {open && <ProviderMenu providers={providers} onPick={handleProviderClick} sessionCount={sessionCount} />}
          </div>
        </div>
      )}

      {variant === 'modal' && (
        <div className="atc-button-wrap">
          <button
            type="button"
            className="atc-button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <CalendarPlus size={16} />
            Add all {sessionCount} sessions to your calendar
            <span style={{ opacity: 0.7 }}>▾</span>
          </button>
          {open && <ProviderMenu providers={providers} onPick={handleProviderClick} sessionCount={sessionCount} />}
        </div>
      )}

      {variant === 'inline' && (
        <div className="atc-button-wrap">
          <button
            type="button"
            className="atc-button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <CalendarPlus size={14} />
            Add to calendar
          </button>
          {open && <ProviderMenu providers={providers} onPick={handleProviderClick} sessionCount={sessionCount} />}
        </div>
      )}
    </div>
  );
};

interface ProviderMenuProps {
  providers: Array<{
    key: string;
    label: string;
    sub: string;
    href: string;
    icon: React.ReactNode;
    download?: boolean;
    target?: string;
  }>;
  onPick: (provider: string) => void;
  sessionCount: number;
}

const ProviderMenu: React.FC<ProviderMenuProps> = ({ providers, onPick, sessionCount }) => {
  return (
    <div className="atc-menu" role="menu">
      <div className="atc-menu-header">Choose your calendar</div>
      {providers.map((p) => (
        <a
          key={p.key}
          href={p.href}
          target={p.target}
          rel={p.target === '_blank' ? 'noreferrer' : undefined}
          download={p.download ? true : undefined}
          role="menuitem"
          onClick={() => onPick(p.key)}
        >
          <div className="atc-menu-icon">{p.icon}</div>
          <div className="atc-menu-text">
            <span className="atc-menu-label">{p.label}</span>
            <span className="atc-menu-sub">{p.sub}</span>
          </div>
        </a>
      ))}
      <div className="atc-menu-footer">
        <Check size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
        Adds <strong>{sessionCount} weekly events</strong> with a 24-hour reminder.
      </div>
    </div>
  );
};

export default AddToCalendar;
