import React, { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowDown, Check, Clock, Users, Gift } from 'lucide-react';
import { trackCTAClick, trackFormSubmission } from '@/utils/analytics';
import {
  CANONICAL_ORIGIN,
  ClassSession,
  CLASS_SESSIONS,
  getDefaultSession,
  getSessionBySlug,
} from '@/data/classSessions';

/**
 * Per-session registration form. The form's tracks, audience options,
 * referral sources, Formspree endpoint and meta tags all come from the
 * matching ClassSession in src/data/classSessions.ts.
 *
 * Mounted at /classes/<slug>/register. The bare /classes/register URL
 * (kept for backwards compat with the originally-deployed flyer/QR codes)
 * renders the default upcoming session via the legacyDefault prop.
 */

interface Props {
  /** When true, use the default upcoming session instead of params.slug.
   *  Used by the legacy /classes/register route. */
  legacyDefault?: boolean;
}

const ClassRegistration: React.FC<Props> = ({ legacyDefault = false }) => {
  const params = useParams<{ slug: string }>();
  const session: ClassSession | undefined = legacyDefault
    ? getDefaultSession()
    : getSessionBySlug(params.slug);

  const [selectedTrack, setSelectedTrack] = useState<string>('');
  const [hasSibling, setHasSibling] = useState(false);
  const [trackError, setTrackError] = useState(false);

  const registerUrl = session
    ? `${CANONICAL_ORIGIN}/classes/${session.slug}/register`
    : `${CANONICAL_ORIGIN}/classes`;

  // QR points back at this page itself so flyer scans land directly on the form.
  const qrTarget = useMemo(() => {
    if (typeof window === 'undefined' || !session) return registerUrl;
    return `${window.location.origin}/classes/${session.slug}/register`;
  }, [session, registerUrl]);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrTarget)}&color=1a1714&bgcolor=ffffff&qzone=1&ecc=H`;

  useEffect(() => {
    if (session) {
      trackCTAClick(`classes_register_view:${session.slug}`, 'classes_register_page');
    }
  }, [session]);

  if (!session) {
    return <Navigate to="/classes" replace />;
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!selectedTrack) {
      e.preventDefault();
      setTrackError(true);
      document.getElementById('trackSelector')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    trackFormSubmission(`classes_register_submit:${session.slug}`, selectedTrack);
    // Let Formspree handle the POST + redirect.
  };

  const ogTitle = `Register — ${session.social.ogTitle}`;
  const ogDescription = `Register for ${session.social.ogTitle}. ${session.dateLabel} · ${session.location.venue}, ${session.location.city} ${session.location.state}. ${session.timeLabel}.`;
  const ogImage = `${CANONICAL_ORIGIN}/api/og-image?slug=${session.slug}`;

  return (
    <div className="dca-reg-page">
      <Helmet>
        <title>{`${ogTitle} | Digital Craft`}</title>
        <meta name="description" content={ogDescription} />
        <meta name="robots" content="noindex" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={registerUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={registerUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <style>{`
        .dca-reg-page {
          --green:#1a6b4a;--green-mid:#2d9b6e;--green-light:#e8f5ef;
          --blue:#2b3fa0;--blue-light:#eaedff;
          --gold:#c9913a;--ink:#1a1714;--mid:#5a5450;
          --rule:#e2ddd7;--cream:#fdf8f2;--white:#fff;--error:#c0392b;
          font-family:'DM Sans',sans-serif;
          background:var(--cream);
          color:var(--ink);
          min-height:100vh;
        }
        .dca-reg-page * { box-sizing:border-box; }
        .dca-reg-page .top-band { height:4px; background:linear-gradient(90deg,#2d9b6e,#c9913a,#4a63d4); }

        .dca-reg-page .reg-header { background:var(--ink); color:white; padding:32px 40px 28px; position:relative; overflow:hidden; }
        .dca-reg-page .reg-header::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 80% at 80% 50%, rgba(45,155,110,.15) 0%, transparent 70%); pointer-events:none; }
        .dca-reg-page .header-back { display:inline-flex; align-items:center; gap:6px; color:#c8c2ba; font-size:12px; text-decoration:none; margin-bottom:12px; position:relative; font-family:'DM Mono',monospace; letter-spacing:.08em; text-transform:uppercase; }
        .dca-reg-page .header-back:hover { color:var(--gold); }
        .dca-reg-page .header-tag { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); margin-bottom:10px; position:relative; }
        .dca-reg-page .header-title { font-family:'Playfair Display',serif; font-size:clamp(26px,5vw,42px); font-weight:900; line-height:1.05; position:relative; }
        .dca-reg-page .header-title em { font-style:italic; color:var(--gold); }
        .dca-reg-page .header-meta { display:flex; flex-wrap:wrap; gap:12px; margin-top:16px; position:relative; }
        .dca-reg-page .meta-chip { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:30px; padding:6px 14px; font-size:12px; color:#c8c2ba; }

        .dca-reg-page .reg-body { max-width:980px; margin:0 auto; padding:36px 24px 60px; }

        .dca-reg-page .pricing-summary { display:grid; grid-template-columns:repeat(auto-fill,minmax(155px,1fr)); gap:10px; margin-bottom:8px; }
        .dca-reg-page .ps-card { background:white; border:2px solid var(--rule); border-radius:12px; padding:14px 16px; cursor:pointer; transition:border-color .15s,box-shadow .15s; position:relative; display:block; }
        .dca-reg-page .ps-card:hover { border-color:var(--green-mid); box-shadow:0 4px 16px rgba(0,0,0,.06); }
        .dca-reg-page .ps-card.selected { border-color:var(--green); box-shadow:0 0 0 3px rgba(45,155,110,.15); }
        .dca-reg-page .ps-card.selected::after { content:'✓'; position:absolute; top:8px; right:10px; color:var(--green); font-weight:700; font-size:13px; }
        .dca-reg-page .ps-price { font-family:'Playfair Display',serif; font-size:24px; font-weight:900; color:var(--gold); line-height:1; }
        .dca-reg-page .ps-name { font-size:13px; font-weight:600; color:var(--ink); margin-top:3px; }
        .dca-reg-page .ps-note { font-size:11px; color:var(--mid); margin-top:2px; line-height:1.4; }
        .dca-reg-page .ps-badge { display:inline-block; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; background:var(--green); color:white; padding:2px 8px; border-radius:4px; margin-top:6px; font-weight:500; }
        .dca-reg-page .ps-badge.gold { background:var(--gold); }
        .dca-reg-page .ps-card input[type=radio] { position:absolute; opacity:0; pointer-events:none; }

        .dca-reg-page .form-section { background:white; border:1px solid var(--rule); border-radius:14px; padding:26px; margin-bottom:18px; }
        .dca-reg-page .section-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; margin-bottom:18px; display:flex; align-items:center; gap:10px; }
        .dca-reg-page .section-num { width:26px; height:26px; background:var(--ink); color:white; border-radius:50%; font-family:'DM Mono',monospace; font-size:11px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }

        .dca-reg-page .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .dca-reg-page .form-grid .full { grid-column:1/-1; }
        @media(max-width:540px) { .dca-reg-page .form-grid { grid-template-columns:1fr; } }

        .dca-reg-page .field { display:flex; flex-direction:column; gap:5px; }
        .dca-reg-page .field label { font-size:12.5px; font-weight:600; color:var(--ink); }
        .dca-reg-page .field label .req { color:var(--error); margin-left:2px; }
        .dca-reg-page .field input,
        .dca-reg-page .field select,
        .dca-reg-page .field textarea {
          border:1.5px solid var(--rule); border-radius:8px; padding:10px 13px;
          font-family:'DM Sans',sans-serif; font-size:14px; color:var(--ink);
          background:var(--cream); transition:border-color .15s,box-shadow .15s; outline:none;
          width:100%;
        }
        .dca-reg-page .field input:focus,
        .dca-reg-page .field select:focus,
        .dca-reg-page .field textarea:focus {
          border-color:var(--green-mid); box-shadow:0 0 0 3px rgba(45,155,110,.1); background:white;
        }
        .dca-reg-page .field textarea { resize:vertical; min-height:80px; }
        .dca-reg-page .field-hint { font-size:11.5px; color:var(--mid); }

        .dca-reg-page .radio-group { display:flex; flex-direction:column; gap:8px; }
        .dca-reg-page .radio-option { display:flex; align-items:center; gap:10px; padding:10px 13px; border:1.5px solid var(--rule); border-radius:8px; cursor:pointer; transition:border-color .15s,background .15s; font-size:13.5px; }
        .dca-reg-page .radio-option:hover { border-color:var(--green-mid); background:#f8fdf9; }
        .dca-reg-page .radio-option input { accent-color:var(--green); width:16px; height:16px; flex-shrink:0; }
        .dca-reg-page .check-group { display:flex; flex-direction:column; gap:8px; }
        .dca-reg-page .check-option { display:flex; align-items:flex-start; gap:10px; padding:10px 13px; border:1.5px solid var(--rule); border-radius:8px; cursor:pointer; }
        .dca-reg-page .check-option:hover { border-color:var(--green-mid); background:#f8fdf9; }
        .dca-reg-page .check-option input { accent-color:var(--green); width:16px; height:16px; flex-shrink:0; margin-top:1px; }
        .dca-reg-page .check-option-text { font-size:13.5px; line-height:1.4; }
        .dca-reg-page .check-option-sub { font-size:11.5px; color:var(--mid); margin-top:2px; }

        .dca-reg-page .participant-block { background:var(--cream); border:1.5px dashed var(--rule); border-radius:10px; padding:16px; margin-top:14px; }
        .dca-reg-page .participant-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--mid); margin-bottom:12px; }
        .dca-reg-page .form-divider { height:1px; background:var(--rule); margin:16px 0; }

        .dca-reg-page .terms-box { background:#fdf5e8; border:1px solid #e8d5a0; border-radius:10px; padding:16px; font-size:12.5px; color:#5a4e30; line-height:1.6; margin-bottom:16px; }

        .dca-reg-page .submit-btn { width:100%; background:var(--green); color:white; border:none; border-radius:10px; padding:16px; font-family:'DM Sans',sans-serif; font-size:15px; font-weight:700; cursor:pointer; transition:background .2s,transform .1s; letter-spacing:.02em; }
        .dca-reg-page .submit-btn:hover { background:#155a3c; transform:translateY(-1px); }
        .dca-reg-page .submit-btn:active { transform:translateY(0); }
        .dca-reg-page .submit-note { font-size:11.5px; color:var(--mid); text-align:center; margin-top:10px; line-height:1.6; }
        .dca-reg-page .submit-note a { color:var(--green); text-decoration:none; font-weight:600; }

        .dca-reg-page .qr-section { background:var(--ink); border-radius:14px; padding:28px; margin-bottom:18px; display:flex; flex-wrap:wrap; gap:24px; align-items:center; }
        .dca-reg-page .qr-frame { background:white; border-radius:10px; padding:12px; display:inline-flex; flex-shrink:0; }
        .dca-reg-page .qr-frame img { display:block; width:140px; height:140px; }
        .dca-reg-page .qr-info { flex:1; min-width:200px; }
        .dca-reg-page .qr-info-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; color:white; margin-bottom:6px; }
        .dca-reg-page .qr-info-sub { font-size:12.5px; color:#8a8480; line-height:1.6; margin-bottom:10px; }
        .dca-reg-page .qr-link { font-family:'DM Mono',monospace; font-size:11px; color:var(--gold); letter-spacing:.04em; word-break:break-all; }

        @media(max-width:600px) {
          .dca-reg-page .reg-header { padding:24px 22px 20px; }
          .dca-reg-page .reg-body { padding:24px 16px 48px; }
          .dca-reg-page .pricing-summary { grid-template-columns:1fr 1fr; }
          .dca-reg-page .qr-section { flex-direction:column; align-items:flex-start; }
        }

        /* === Session tabs === */
        .dca-reg-page .session-tabs { display:flex; gap:6px; margin-bottom:20px; padding:5px; background:white; border:1px solid var(--rule); border-radius:12px; overflow-x:auto; }
        .dca-reg-page .session-tab { display:flex; flex-direction:column; gap:2px; padding:10px 16px; border-radius:8px; text-decoration:none; color:var(--mid); white-space:nowrap; transition:background .15s,color .15s; cursor:pointer; border:none; background:transparent; font-family:inherit; text-align:left; flex-shrink:0; }
        .dca-reg-page .session-tab:hover { background:var(--cream); color:var(--ink); }
        .dca-reg-page .session-tab.active { background:var(--ink); color:white; }
        .dca-reg-page .session-tab.active .session-tab-meta { color:rgba(255,255,255,.7); }
        .dca-reg-page .session-tab-name { font-family:'DM Sans',sans-serif; font-weight:700; font-size:13px; letter-spacing:-.005em; }
        .dca-reg-page .session-tab-meta { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--mid); }

        /* === Interactive track picker === */
        .dca-reg-page .picker {
          display:grid;
          grid-template-columns:minmax(260px, 320px) 1fr;
          gap:18px;
          align-items:start;
        }
        .dca-reg-page .picker-list { display:flex; flex-direction:column; gap:8px; }
        .dca-reg-page .picker-card {
          background:white;
          border:2px solid var(--rule);
          border-radius:11px;
          padding:14px 16px;
          cursor:pointer;
          transition:border-color .15s, box-shadow .15s, transform .12s, background .15s;
          text-align:left;
          font-family:inherit;
          position:relative;
          display:flex;
          gap:14px;
          align-items:center;
          width:100%;
        }
        .dca-reg-page .picker-card:hover { border-color:var(--green-mid); transform:translateY(-1px); }
        .dca-reg-page .picker-card.selected { border-color:var(--green); background:#f8fdf9; box-shadow:0 0 0 3px rgba(45,155,110,.15); }
        .dca-reg-page .picker-card-price { font-family:'Playfair Display',serif; font-size:22px; font-weight:900; color:var(--gold); line-height:1; min-width:62px; }
        .dca-reg-page .picker-card-body { flex:1; min-width:0; }
        .dca-reg-page .picker-card-name { font-size:13.5px; font-weight:700; color:var(--ink); line-height:1.2; }
        .dca-reg-page .picker-card-sub { font-size:11.5px; color:var(--mid); margin-top:2px; line-height:1.35; }
        .dca-reg-page .picker-card-badge { display:inline-block; font-family:'DM Mono',monospace; font-size:9px; letter-spacing:.1em; text-transform:uppercase; background:var(--green); color:white; padding:2px 7px; border-radius:4px; margin-top:6px; font-weight:500; }
        .dca-reg-page .picker-card-badge.gold { background:var(--gold); }
        .dca-reg-page .picker-card-check { width:22px; height:22px; border-radius:50%; border:2px solid var(--rule); flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:border-color .15s, background .15s; }
        .dca-reg-page .picker-card.selected .picker-card-check { border-color:var(--green); background:var(--green); }

        .dca-reg-page .picker-detail {
          background:linear-gradient(180deg, var(--cream) 0%, white 100%);
          border:1.5px solid var(--rule);
          border-radius:14px;
          padding:24px 26px;
          position:sticky;
          top:18px;
          animation:dca-detail-in .25s ease-out;
        }
        @keyframes dca-detail-in {
          from { opacity:0; transform:translateY(6px); }
          to { opacity:1; transform:translateY(0); }
        }
        .dca-reg-page .picker-detail-eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold); font-weight:600; margin-bottom:6px; }
        .dca-reg-page .picker-detail-header { display:flex; flex-wrap:wrap; align-items:baseline; gap:12px; margin-bottom:6px; }
        .dca-reg-page .picker-detail-price { font-family:'Playfair Display',serif; font-size:38px; font-weight:900; color:var(--gold); line-height:1; }
        .dca-reg-page .picker-detail-name { font-family:'Playfair Display',serif; font-size:22px; font-weight:700; color:var(--ink); line-height:1.15; }
        .dca-reg-page .picker-detail-why { font-size:14px; color:var(--mid); line-height:1.6; margin:14px 0 18px; padding:14px 16px; background:white; border-left:3px solid var(--gold); border-radius:6px; }
        .dca-reg-page .picker-detail-rows { display:flex; flex-direction:column; gap:10px; margin-bottom:18px; }
        .dca-reg-page .picker-detail-row { display:flex; gap:11px; font-size:13px; color:var(--ink); line-height:1.5; align-items:flex-start; }
        .dca-reg-page .picker-detail-row svg { color:var(--green); flex-shrink:0; margin-top:1px; }
        .dca-reg-page .picker-detail-row-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--mid); margin-right:4px; }
        .dca-reg-page .picker-detail-includes { background:white; border:1px solid var(--rule); border-radius:10px; padding:14px 16px; margin-bottom:18px; }
        .dca-reg-page .picker-detail-includes-label { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--green); font-weight:600; margin-bottom:9px; }
        .dca-reg-page .picker-detail-includes ul { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:7px; }
        .dca-reg-page .picker-detail-includes li { display:flex; gap:9px; font-size:13px; color:var(--ink); line-height:1.5; align-items:flex-start; }
        .dca-reg-page .picker-detail-includes li svg { color:var(--green); flex-shrink:0; margin-top:2px; }
        .dca-reg-page .picker-detail-continue {
          width:100%; background:var(--green); color:white; border:none;
          border-radius:10px; padding:13px 16px; font-family:'DM Sans',sans-serif;
          font-weight:700; font-size:14px; cursor:pointer; letter-spacing:.01em;
          display:inline-flex; align-items:center; justify-content:center; gap:8px;
          transition:background .15s,transform .1s;
        }
        .dca-reg-page .picker-detail-continue:hover { background:#155a3c; transform:translateY(-1px); }

        .dca-reg-page .picker-empty {
          background:white; border:1.5px dashed var(--rule); border-radius:14px;
          padding:48px 24px; text-align:center; color:var(--mid);
          font-size:14px; line-height:1.6;
        }
        .dca-reg-page .picker-empty-icon { font-size:30px; opacity:.4; margin-bottom:12px; }

        @media(max-width:760px) {
          .dca-reg-page .picker { grid-template-columns:1fr; }
          .dca-reg-page .picker-detail { position:static; }
        }
      `}</style>

      <div className="top-band" />

      <div className="reg-header">
        <Link to={`/classes/${session.slug}`} className="header-back">
          <ArrowLeft size={12} /> Back to {session.shortName.replace(/^AI Classes — /, '')}
        </Link>
        <div className="header-tag">{session.eyebrow}</div>
        <div className="header-title">
          Register for <em>{session.titleHighlight}</em>
        </div>
        <div className="header-meta">
          <span className="meta-chip">📅 {session.dateLabel}</span>
          <span className="meta-chip">
            📍 {session.location.venue}, {session.location.city} {session.location.state}
          </span>
          <span className="meta-chip">⏰ {session.timeLabel}</span>
        </div>
      </div>

      <div className="reg-body">
        {CLASS_SESSIONS.length > 1 && (
          <div className="session-tabs" role="tablist" aria-label="Switch session">
            {CLASS_SESSIONS.map((s) => (
              <Link
                key={s.slug}
                to={`/classes/${s.slug}/register`}
                role="tab"
                aria-selected={s.slug === session.slug}
                className={`session-tab${s.slug === session.slug ? ' active' : ''}`}
                onClick={() => trackCTAClick(`classes_register_session_tab:${s.slug}`, 'classes_register_tabs')}
              >
                <span className="session-tab-name">{s.shortName.replace(/^AI Classes — /, '')}</span>
                <span className="session-tab-meta">
                  {s.seasonLabel} · {s.location.city} {s.location.state}
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="qr-section">
          <div className="qr-frame">
            <img src={qrSrc} alt={`QR code linking to the ${session.shortName} registration page`} />
          </div>
          <div className="qr-info">
            <div className="qr-info-title">Scan to Register</div>
            <div className="qr-info-sub">
              Share this QR code on social media, print it on the flyer, or display it at the
              venue. Scanning takes anyone directly to this registration form.
            </div>
            <div className="qr-link">{qrTarget.replace(/^https?:\/\//, '')}</div>
          </div>
        </div>

        <form action={session.formspreeEndpoint} method="POST" id="regForm" onSubmit={handleSubmit}>
          <input type="hidden" name="selected_track" value={selectedTrack} />
          <input type="hidden" name="session_slug" value={session.slug} />
          <input type="hidden" name="session_name" value={session.shortName} />
          <input
            type="hidden"
            name="_subject"
            value={`New Registration — ${session.shortName}`}
          />

          {/* STEP 1: TRACK — interactive two-column picker */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-num">1</div>Choose Your Track &amp; Pricing
            </div>
            <p style={{ fontSize: 13.5, color: 'var(--mid)', marginTop: -8, marginBottom: 16, lineHeight: 1.6 }}>
              Click a track on the left to see what's included. {session.tracks.length} options —
              from drop-in to family.
            </p>
            <div className="picker" id="trackSelector">
              <div className="picker-list" role="radiogroup" aria-label="Class track">
                {session.tracks.map((t) => {
                  const isSelected = selectedTrack === t.formLabel;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`picker-card${isSelected ? ' selected' : ''}`}
                      onClick={() => {
                        setSelectedTrack(t.formLabel);
                        setTrackError(false);
                        trackCTAClick(`classes_track_pick:${t.key}`, 'classes_register_picker');
                      }}
                    >
                      <div className="picker-card-price">{t.price}</div>
                      <div className="picker-card-body">
                        <div className="picker-card-name">{t.name}</div>
                        <div className="picker-card-sub">{t.sub}</div>
                        {t.badge && (
                          <div className={`picker-card-badge${t.badge.tone === 'gold' ? ' gold' : ''}`}>
                            {t.badge.label}
                          </div>
                        )}
                      </div>
                      <div className="picker-card-check" aria-hidden="true">
                        {isSelected && <Check size={14} strokeWidth={3} color="white" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                {(() => {
                  const selected = session.tracks.find((t) => t.formLabel === selectedTrack);
                  if (!selected) {
                    return (
                      <div className="picker-empty">
                        <div className="picker-empty-icon">👈</div>
                        Pick a track on the left to see what's included, who it's for, and the
                        full schedule.
                      </div>
                    );
                  }
                  return (
                    <div className="picker-detail" key={selected.key}>
                      <div className="picker-detail-eyebrow">You're choosing</div>
                      <div className="picker-detail-header">
                        <div className="picker-detail-price">{selected.price}</div>
                        <div className="picker-detail-name">{selected.name}</div>
                      </div>
                      {selected.detail && (
                        <>
                          <div className="picker-detail-why">{selected.detail.whyThis}</div>
                          <div className="picker-detail-rows">
                            <div className="picker-detail-row">
                              <Gift size={16} />
                              <span>
                                <span className="picker-detail-row-label">Best for</span>
                                {selected.detail.bestFor}
                              </span>
                            </div>
                            <div className="picker-detail-row">
                              <Clock size={16} />
                              <span>
                                <span className="picker-detail-row-label">Schedule</span>
                                {selected.detail.schedule}
                              </span>
                            </div>
                            <div className="picker-detail-row">
                              <Users size={16} />
                              <span>
                                <span className="picker-detail-row-label">Audience</span>
                                {selected.detail.audience}
                              </span>
                            </div>
                          </div>
                          <div className="picker-detail-includes">
                            <div className="picker-detail-includes-label">What's included</div>
                            <ul>
                              {selected.detail.includes.map((inc) => (
                                <li key={inc}>
                                  <Check size={14} strokeWidth={3} />
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                      <button
                        type="button"
                        className="picker-detail-continue"
                        onClick={() => {
                          trackCTAClick(`classes_track_continue:${selected.key}`, 'classes_register_picker');
                          document
                            .getElementById('contactSection')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        Continue with {selected.name}
                        <ArrowDown size={15} />
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
            {trackError && (
              <p style={{ color: 'var(--error)', fontSize: '12.5px', marginTop: 8 }}>
                ⚠ Please select a track before continuing.
              </p>
            )}
          </div>

          {/* STEP 2: CONTACT */}
          <div className="form-section" id="contactSection">
            <div className="section-title">
              <div className="section-num">2</div>Your Contact Information
            </div>
            <div className="form-grid">
              <div className="field">
                <label>First Name <span className="req">*</span></label>
                <input type="text" name="first_name" placeholder="Jane" required />
              </div>
              <div className="field">
                <label>Last Name <span className="req">*</span></label>
                <input type="text" name="last_name" placeholder="Smith" required />
              </div>
              <div className="field">
                <label>Email Address <span className="req">*</span></label>
                <input type="email" name="email" placeholder="jane@email.com" required />
              </div>
              <div className="field">
                <label>Phone Number</label>
                <input type="tel" name="phone" placeholder="(555) 000-0000" />
              </div>
              <div className="field full">
                <label>Zip Code <span className="req">*</span></label>
                <input type="text" name="zip_code" placeholder="75062" maxLength={10} style={{ maxWidth: 160 }} required />
              </div>
            </div>
          </div>

          {/* STEP 3: PARTICIPANT */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-num">3</div>Participant Information
            </div>

            <div className="participant-block">
              <div className="participant-label">Participant 1</div>
              <div className="form-grid">
                <div className="field">
                  <label>First Name <span className="req">*</span></label>
                  <input type="text" name="participant_1_first_name" placeholder="First name" required />
                </div>
                <div className="field">
                  <label>Last Name <span className="req">*</span></label>
                  <input type="text" name="participant_1_last_name" placeholder="Last name" required />
                </div>
                <div className="field">
                  <label>Age <span className="req">*</span></label>
                  <input type="number" name="participant_1_age" placeholder="e.g. 14" min={5} max={99} style={{ maxWidth: 120 }} required />
                </div>
                <div className="field">
                  <label>Track <span className="req">*</span></label>
                  <select name="participant_1_track" required defaultValue="">
                    <option value="">— Select —</option>
                    {session.participantTracks.map((c) => (
                      <option key={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="field full">
                  <label>School / Organization (optional)</label>
                  <input type="text" name="participant_1_school" placeholder="e.g. Valley Ranch Middle School" />
                </div>
              </div>
            </div>

            {session.enableSiblingDiscount && (
              <>
                <div className="form-divider" />

                <div className="field">
                  <label>Are you registering siblings? (10% discount applies)</label>
                  <div className="radio-group" style={{ marginTop: 6, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <label className="radio-option" style={{ flex: 1, minWidth: 130 }}>
                      <input
                        type="radio"
                        name="has_sibling"
                        value="No"
                        checked={!hasSibling}
                        onChange={() => setHasSibling(false)}
                      /> No
                    </label>
                    <label className="radio-option" style={{ flex: 1, minWidth: 130 }}>
                      <input
                        type="radio"
                        name="has_sibling"
                        value="Yes"
                        checked={hasSibling}
                        onChange={() => setHasSibling(true)}
                      /> Yes — add sibling
                    </label>
                  </div>
                </div>

                {hasSibling && (
                  <div style={{ marginTop: 14 }}>
                    <div className="participant-block">
                      <div className="participant-label">Participant 2 · Sibling (10% discount applied)</div>
                      <div className="form-grid">
                        <div className="field">
                          <label>First Name</label>
                          <input type="text" name="participant_2_first_name" placeholder="First name" />
                        </div>
                        <div className="field">
                          <label>Last Name</label>
                          <input type="text" name="participant_2_last_name" placeholder="Last name" />
                        </div>
                        <div className="field">
                          <label>Age</label>
                          <input type="number" name="participant_2_age" placeholder="e.g. 11" min={5} max={99} style={{ maxWidth: 120 }} />
                        </div>
                        <div className="field">
                          <label>Track</label>
                          <select name="participant_2_track" defaultValue="">
                            <option value="">— Select —</option>
                            {session.participantTracks.map((c) => (
                              <option key={c.label}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* STEP 4: DETAILS */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-num">4</div>A Few More Details
            </div>
            <div className="form-grid">
              <div className="field full">
                <label>How did you hear about us?</label>
                <select name="referral_source" defaultValue="">
                  <option value="">— Select —</option>
                  {session.referralSources.map((src) => (
                    <option key={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div className="field full">
                <label>Prior experience with AI tools?</label>
                <div className="radio-group" style={{ marginTop: 6 }}>
                  <label className="radio-option">
                    <input type="radio" name="ai_experience" value="None — total beginner" /> None — total beginner
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="ai_experience" value="Some — used ChatGPT a few times" /> A little — I've used ChatGPT or similar a few times
                  </label>
                  <label className="radio-option">
                    <input type="radio" name="ai_experience" value="Moderate — use AI tools regularly" /> Moderate — I use AI tools regularly
                  </label>
                </div>
              </div>
              <div className="field full">
                <label>Questions or special accommodations?</label>
                <textarea name="questions_accommodations" placeholder="Anything we should know..." />
              </div>
            </div>
          </div>

          {/* STEP 5: CONFIRM */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-num">5</div>Confirm &amp; Register
            </div>

            <div
              style={{
                background: '#fff8ee',
                border: '1.5px solid #e8c97a',
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 16,
                display: 'flex',
                gap: 14,
                alignItems: 'flex-start',
              }}
            >
              <div style={{ fontSize: 22, flexShrink: 0, lineHeight: 1.2 }}>⚠️</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#7a4e10', marginBottom: 8 }}>
                  Required for Every Session
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {session.requirements.map((r) => (
                    <div
                      key={r.title}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#5a3a0a' }}
                    >
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{r.icon}</span>
                      <span>
                        <strong>{r.title}</strong> —{' '}
                        {r.link ? (
                          <>
                            {r.body.split(r.link.text)[0]}
                            <a
                              href={r.link.href}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--green)', fontWeight: 600 }}
                            >
                              {r.link.text}
                            </a>
                            {r.body.split(r.link.text)[1] ?? ''}
                          </>
                        ) : (
                          r.body
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="terms-box">
              <strong>What to know before you register:</strong> Sessions are held at{' '}
              {session.location.venue}, {session.location.city} {session.location.state}.{' '}
              {session.timeLabel} · {session.dateLabel}. A personal laptop and a Claude Pro
              subscription ($20/month, cancel anytime) are required for all sessions. Drop-in
              payments are due per session. Full-track and early-bird payments are due in full at
              registration.{' '}
              {session.enableSiblingDiscount &&
                'The 10% sibling discount applies when two or more siblings register together. '}
              All sales are final — no refunds after the first session.
            </div>

            <div className="check-group" style={{ marginBottom: 18 }}>
              <label className="check-option">
                <input type="checkbox" name="agreed_to_terms" value="Yes" required />
                <div className="check-option-text">
                  I have read and agree to the terms above.
                  <div className="check-option-sub">Required to complete registration.</div>
                </div>
              </label>
              <label className="check-option">
                <input type="checkbox" name="email_updates" value="Yes" />
                <div className="check-option-text">
                  I'd like to receive updates and reminders by email.
                  <div className="check-option-sub">No spam — just session reminders and announcements.</div>
                </div>
              </label>
            </div>

            <button type="submit" className="submit-btn">Complete Registration →</button>
            <p className="submit-note">
              You'll receive a confirmation email after submitting.
              <br />
              Questions? Email{' '}
              <a href={`mailto:${session.contact.email}`}>{session.contact.email}</a> or call{' '}
              <a href={`tel:${session.contact.phone.replace(/[^0-9]/g, '')}`}>
                {session.contact.phone}
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassRegistration;
