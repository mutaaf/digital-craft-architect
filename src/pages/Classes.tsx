import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate } from 'react-router-dom';
import { trackCTAClick } from '@/utils/analytics';
import { CANONICAL_ORIGIN, getSessionsForHub } from '@/data/classSessions';
import ClassSession from './classes/ClassSession';

/**
 * The /classes hub.
 *
 * When there is only a single session declared, we render that session's
 * landing page directly so the URL still feels like a dedicated program
 * page (which is how it was deployed originally). Once there are multiple
 * sessions, this should be replaced by a true index — but until then we
 * keep the deployed UX intact for the lone Valley Ranch program.
 *
 * Multi-session hub UI lives in MultiSessionHub() below for when we cross
 * that threshold.
 */

const Classes: React.FC = () => {
  const sessions = getSessionsForHub();

  useEffect(() => {
    trackCTAClick('classes_hub_view', 'classes_hub');
  }, []);

  if (sessions.length === 0) {
    return <Navigate to="/" replace />;
  }
  if (sessions.length === 1) {
    return <ClassSession session={sessions[0]} />;
  }
  return <MultiSessionHub />;
};

const MultiSessionHub: React.FC = () => {
  const sessions = getSessionsForHub();
  const hubUrl = `${CANONICAL_ORIGIN}/classes`;
  const hubOgImage = `${CANONICAL_ORIGIN}/api/og-image?slug=${sessions[0]?.slug ?? ''}`;

  return (
    <div className="dca-classes-hub">
      <Helmet>
        <title>AI Classes — In-Person Sessions | Digital Craft</title>
        <meta
          name="description"
          content="In-person AI classes from Digital Craft. Hands-on programs for youth and adults — see upcoming sessions, locations, and pricing."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={hubUrl} />
        <meta property="og:title" content="AI Classes — In-Person Sessions | Digital Craft" />
        <meta
          property="og:description"
          content="In-person AI classes from Digital Craft. Hands-on programs for youth and adults."
        />
        <meta property="og:image" content={hubOgImage} />
        <link rel="canonical" href={hubUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </Helmet>

      <style>{`
        .dca-classes-hub {
          --green:#1a6b4a;--green-mid:#2d9b6e;--gold:#c9913a;
          --ink:#1a1714;--mid:#5a5450;--rule:#e2ddd7;--cream:#fdf8f2;
          font-family:'DM Sans',sans-serif;
          background:var(--cream);
          color:var(--ink);
          min-height:100vh;
        }
        .dca-classes-hub * { box-sizing:border-box; }
        .dca-classes-hub a { color:inherit; text-decoration:none; }
        .dca-classes-hub .top-band { height:4px; background:linear-gradient(90deg,#2d9b6e,#c9913a,#4a63d4); }
        .dca-classes-hub .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 32px; }
        .dca-classes-hub .brand { font-family:'Playfair Display',serif; font-weight:700; font-size:18px; color:var(--ink); }
        .dca-classes-hub .brand em { color:var(--gold); font-style:italic; }

        .dca-classes-hub .hero { background:var(--ink); color:white; padding:72px 40px; position:relative; overflow:hidden; }
        .dca-classes-hub .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 80% at 80% 50%, rgba(45,155,110,.15) 0%, transparent 70%); pointer-events:none; }
        .dca-classes-hub .hero-inner { max-width:980px; margin:0 auto; position:relative; }
        .dca-classes-hub .hero-eyebrow { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }
        .dca-classes-hub .hero-title { font-family:'Playfair Display',serif; font-size:clamp(34px,6vw,60px); font-weight:900; line-height:1.05; }
        .dca-classes-hub .hero-title em { font-style:italic; color:var(--gold); }
        .dca-classes-hub .hero-sub { font-size:17px; color:#c8c2ba; line-height:1.6; max-width:640px; margin-top:18px; }

        .dca-classes-hub .grid { max-width:980px; margin:0 auto; padding:48px 32px 80px; display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; }
        .dca-classes-hub .card { background:white; border:1px solid var(--rule); border-radius:16px; padding:26px 28px; display:flex; flex-direction:column; gap:14px; transition:transform .15s,box-shadow .15s; }
        .dca-classes-hub .card:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(0,0,0,.06); }
        .dca-classes-hub .card-eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--green); }
        .dca-classes-hub .card-title { font-family:'Playfair Display',serif; font-size:22px; font-weight:900; line-height:1.15; }
        .dca-classes-hub .card-blurb { font-size:14px; color:var(--mid); line-height:1.6; }
        .dca-classes-hub .card-meta { display:flex; flex-wrap:wrap; gap:8px; }
        .dca-classes-hub .meta-chip { font-size:11.5px; color:var(--mid); background:var(--cream); border:1px solid var(--rule); border-radius:30px; padding:5px 11px; }
        .dca-classes-hub .card-cta { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--green); margin-top:auto; padding-top:8px; border-top:1px solid var(--rule); }
        .dca-classes-hub .status-pill { display:inline-block; font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; padding:3px 9px; border-radius:30px; font-weight:600; }
        .dca-classes-hub .status-open { background:rgba(45,155,110,.12); color:var(--green); }
        .dca-classes-hub .status-waitlist { background:rgba(201,145,58,.15); color:#8a5d18; }
        .dca-classes-hub .status-closed { background:rgba(0,0,0,.08); color:var(--mid); }
      `}</style>

      <div className="top-band" />
      <div className="topbar">
        <Link className="brand" to="/">Digital<em>Craft</em></Link>
      </div>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">In-person sessions</div>
          <h1 className="hero-title">
            Learn AI <em>in a room with people</em>.
          </h1>
          <p className="hero-sub">
            Hands-on, small-group AI classes taught in libraries and community spaces across DFW.
            Pick a session, bring a laptop, leave a better thinker with AI.
          </p>
        </div>
      </section>

      <div className="grid">
        {sessions.map((s) => (
          <Link
            key={s.slug}
            to={`/classes/${s.slug}`}
            className="card"
            onClick={() => trackCTAClick(`classes_hub_card:${s.slug}`, 'classes_hub')}
          >
            <div className="card-eyebrow">
              {s.seasonLabel} · {s.location.city}, {s.location.state}
            </div>
            <div className="card-title">{s.shortName}</div>
            <div className="card-blurb">{s.hubBlurb}</div>
            <div className="card-meta">
              <span className="meta-chip">📅 {s.dateLabel}</span>
              <span className="meta-chip">📍 {s.location.venue}</span>
              <span className="meta-chip">⏰ {s.timeLabel}</span>
              <span className={`status-pill status-${s.status}`}>
                {s.status === 'open' ? 'Registration open' : s.status === 'waitlist' ? 'Waitlist' : 'Closed'}
              </span>
            </div>
            <div className="card-cta">See details &amp; register →</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Classes;
