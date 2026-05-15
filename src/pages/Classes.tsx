import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Laptop, MapPin, Users } from 'lucide-react';
import { trackCTAClick } from '@/utils/analytics';
import {
  CANONICAL_ORIGIN,
  ClassSession,
  getUpcomingSessions,
  getPastSessions,
} from '@/data/classSessions';

/**
 * /classes — the program-level hub.
 *
 * Always renders a real listing page (even with one session), so the
 * route stays structurally consistent as more sessions are added. To add
 * a new session, append an object to api/_classes.json — this page picks
 * it up automatically with no code changes.
 *
 * Sections:
 *   • Hero with program tagline
 *   • Upcoming sessions card grid
 *   • Past sessions archive (only if any exist)
 *   • "What we teach" overview
 *   • "Bring a class to your city" CTA
 */

const Classes: React.FC = () => {
  const upcoming = getUpcomingSessions();
  const past = getPastSessions();
  const hubUrl = `${CANONICAL_ORIGIN}/classes`;
  const featuredOgImage = upcoming[0]
    ? `${CANONICAL_ORIGIN}/api/og-image?slug=${upcoming[0].slug}`
    : `${CANONICAL_ORIGIN}/og-default.png`;

  useEffect(() => {
    trackCTAClick('classes_hub_view', 'classes_hub');
  }, []);

  return (
    <div className="dca-classes-hub">
      <Helmet>
        <title>AI Classes — In-Person Sessions for Kids, Teens & Adults | Digital Craft</title>
        <meta
          name="description"
          content="Hands-on, in-person AI classes from Digital Craft. Taught in libraries and community spaces. Browse upcoming sessions, see pricing, and reserve a seat."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={hubUrl} />
        <meta
          property="og:title"
          content="AI Classes — In-Person Sessions | Digital Craft"
        />
        <meta
          property="og:description"
          content="Hands-on, in-person AI classes. Youth, adult, and family tracks. Browse upcoming sessions."
        />
        <meta property="og:image" content={featuredOgImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI Classes — In-Person Sessions | Digital Craft" />
        <meta name="twitter:image" content={featuredOgImage} />
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
          --green:#1a6b4a;--green-mid:#2d9b6e;--gold:#c9913a;--gold-deep:#8a5d18;
          --ink:#1a1714;--mid:#5a5450;--rule:#e2ddd7;--cream:#fdf8f2;--cream-soft:#fbf3e8;
          font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;
          background:var(--cream);
          color:var(--ink);
          min-height:100vh;
        }
        .dca-classes-hub * { box-sizing:border-box; }
        .dca-classes-hub a { color:inherit; text-decoration:none; }
        .dca-classes-hub .top-band { height:4px; background:linear-gradient(90deg,#2d9b6e,#c9913a,#4a63d4); }

        .dca-classes-hub .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 32px; max-width:1240px; margin:0 auto; }
        .dca-classes-hub .brand { font-family:'Playfair Display',serif; font-weight:700; font-size:18px; color:var(--ink); }
        .dca-classes-hub .brand em { color:var(--gold); font-style:italic; }
        .dca-classes-hub .topbar-cta { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--green); padding:8px 14px; border:1.5px solid var(--green); border-radius:30px; transition:background .15s,color .15s; }
        .dca-classes-hub .topbar-cta:hover { background:var(--green); color:white; }

        /* ===== HERO ===== */
        .dca-classes-hub .hero { background:var(--ink); color:white; padding:80px 32px 88px; position:relative; overflow:hidden; }
        .dca-classes-hub .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 80% at 85% 50%, rgba(45,155,110,.18) 0%, transparent 65%), radial-gradient(ellipse 50% 60% at 5% 100%, rgba(201,145,58,.14) 0%, transparent 70%); pointer-events:none; }
        .dca-classes-hub .hero-inner { max-width:1180px; margin:0 auto; position:relative; }
        .dca-classes-hub .hero-eyebrow { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); margin-bottom:18px; font-weight:600; display:inline-flex; align-items:center; gap:9px; }
        .dca-classes-hub .hero-dot { width:7px; height:7px; border-radius:50%; background:var(--gold); box-shadow:0 0 0 4px rgba(201,145,58,.2); }
        .dca-classes-hub .hero-title { font-family:'Playfair Display',serif; font-size:clamp(36px,6vw,68px); font-weight:900; line-height:1.02; letter-spacing:-.015em; max-width:880px; }
        .dca-classes-hub .hero-title em { font-style:italic; color:var(--gold); }
        .dca-classes-hub .hero-sub { font-size:18px; color:#c8c2ba; line-height:1.55; max-width:680px; margin-top:22px; }
        .dca-classes-hub .hero-stats { display:flex; flex-wrap:wrap; gap:32px; margin-top:36px; padding-top:30px; border-top:1px solid rgba(255,255,255,.08); }
        .dca-classes-hub .hero-stat-num { font-family:'Playfair Display',serif; font-size:34px; font-weight:900; color:var(--gold); line-height:1; letter-spacing:-.02em; }
        .dca-classes-hub .hero-stat-label { font-family:'DM Mono',monospace; font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; color:#c8c2ba; margin-top:6px; }

        /* ===== Section frame ===== */
        .dca-classes-hub .section { max-width:1180px; margin:0 auto; padding:64px 32px; }
        .dca-classes-hub .section-eyebrow { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--green); margin-bottom:12px; font-weight:600; }
        .dca-classes-hub .section-title { font-family:'Playfair Display',serif; font-size:clamp(26px,4vw,38px); font-weight:900; line-height:1.1; margin-bottom:14px; letter-spacing:-.005em; }
        .dca-classes-hub .section-title em { font-style:italic; color:var(--gold); }
        .dca-classes-hub .section-lead { font-size:16px; color:var(--mid); line-height:1.6; max-width:640px; margin-bottom:36px; }

        /* ===== Session card grid ===== */
        .dca-classes-hub .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px; }
        .dca-classes-hub .card {
          background:white;
          border:1px solid var(--rule);
          border-radius:18px;
          padding:0;
          display:flex; flex-direction:column;
          transition:transform .15s, box-shadow .2s, border-color .15s;
          overflow:hidden;
          position:relative;
        }
        .dca-classes-hub .card:hover { transform:translateY(-3px); box-shadow:0 18px 40px rgba(0,0,0,.08); border-color:var(--green-mid); }
        .dca-classes-hub .card-strip { height:5px; background:linear-gradient(90deg, var(--green-mid) 0%, var(--gold) 100%); }
        .dca-classes-hub .card-body { padding:26px 28px 16px; flex:1; display:flex; flex-direction:column; gap:12px; }
        .dca-classes-hub .card-eyebrow { font-family:'DM Mono',monospace; font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--gold-deep); font-weight:700; }
        .dca-classes-hub .card-title { font-family:'Playfair Display',serif; font-size:24px; font-weight:900; line-height:1.12; letter-spacing:-.005em; color:var(--ink); }
        .dca-classes-hub .card-title em { font-style:italic; color:var(--gold-deep); }
        .dca-classes-hub .card-blurb { font-size:14px; color:var(--mid); line-height:1.6; }
        .dca-classes-hub .card-meta { display:flex; flex-wrap:wrap; gap:7px; margin-top:6px; }
        .dca-classes-hub .meta-chip { font-size:11.5px; color:var(--ink); background:var(--cream-soft); border:1px solid var(--rule); border-radius:30px; padding:5px 11px; line-height:1.3; display:inline-flex; align-items:center; gap:5px; }
        .dca-classes-hub .meta-chip svg { color:var(--gold-deep); }
        .dca-classes-hub .card-foot { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 28px 22px; border-top:1px dashed var(--rule); margin-top:8px; }
        .dca-classes-hub .card-price { font-family:'Playfair Display',serif; font-size:13px; color:var(--mid); }
        .dca-classes-hub .card-price strong { font-size:22px; font-weight:900; color:var(--gold); line-height:1; }
        .dca-classes-hub .card-cta { font-family:'DM Mono',monospace; font-size:10.5px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color:var(--green); display:inline-flex; align-items:center; gap:6px; transition:gap .15s; }
        .dca-classes-hub .card:hover .card-cta { gap:9px; color:#155a3c; }

        .dca-classes-hub .status-pill { display:inline-flex; align-items:center; gap:5px; font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:.14em; text-transform:uppercase; padding:4px 10px; border-radius:30px; font-weight:700; align-self:flex-start; }
        .dca-classes-hub .status-pill::before { content:''; width:6px; height:6px; border-radius:50%; }
        .dca-classes-hub .status-open { background:rgba(45,155,110,.12); color:var(--green); }
        .dca-classes-hub .status-open::before { background:var(--green-mid); }
        .dca-classes-hub .status-waitlist { background:rgba(201,145,58,.16); color:var(--gold-deep); }
        .dca-classes-hub .status-waitlist::before { background:var(--gold); }
        .dca-classes-hub .status-closed { background:rgba(0,0,0,.08); color:var(--mid); }
        .dca-classes-hub .status-closed::before { background:var(--mid); }

        .dca-classes-hub .empty {
          background:white; border:1.5px dashed var(--rule); border-radius:16px;
          padding:48px 32px; text-align:center; color:var(--mid); font-size:14.5px; line-height:1.6;
        }
        .dca-classes-hub .empty strong { color:var(--ink); display:block; font-family:'Playfair Display',serif; font-size:20px; margin-bottom:6px; font-weight:700; }

        /* ===== What we teach ===== */
        .dca-classes-hub .teach {
          background:white;
          border-top:1px solid var(--rule); border-bottom:1px solid var(--rule);
          margin-top:32px;
        }
        .dca-classes-hub .teach-inner { max-width:1180px; margin:0 auto; padding:64px 32px; }
        .dca-classes-hub .teach-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:24px; margin-top:32px; }
        .dca-classes-hub .teach-card { display:flex; flex-direction:column; gap:10px; }
        .dca-classes-hub .teach-icon {
          width:44px; height:44px; border-radius:12px;
          background:linear-gradient(135deg, var(--cream-soft), white);
          border:1px solid var(--rule);
          display:inline-flex; align-items:center; justify-content:center; color:var(--gold-deep);
        }
        .dca-classes-hub .teach-card-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; }
        .dca-classes-hub .teach-card-body { font-size:14px; color:var(--mid); line-height:1.6; }

        /* ===== Past sessions ===== */
        .dca-classes-hub .past-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }
        .dca-classes-hub .past-card {
          background:white; border:1px solid var(--rule); border-radius:12px;
          padding:18px 20px;
          transition:border-color .15s;
        }
        .dca-classes-hub .past-card:hover { border-color:var(--mid); }
        .dca-classes-hub .past-card-eyebrow { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--mid); margin-bottom:6px; }
        .dca-classes-hub .past-card-title { font-family:'Playfair Display',serif; font-size:16px; font-weight:700; color:var(--ink); }
        .dca-classes-hub .past-card-meta { font-size:12px; color:var(--mid); margin-top:6px; }

        /* ===== Bring-a-class CTA ===== */
        .dca-classes-hub .cta-bring {
          background:linear-gradient(135deg, var(--ink) 0%, #2a2622 100%);
          color:white; border-radius:20px; padding:48px 44px;
          margin:32px auto 64px;
          max-width:1180px;
          display:grid; grid-template-columns:1fr auto; gap:32px; align-items:center;
          position:relative; overflow:hidden;
        }
        .dca-classes-hub .cta-bring::before {
          content:''; position:absolute; right:-60px; top:-60px;
          width:240px; height:240px; border-radius:50%;
          background:radial-gradient(circle, rgba(201,145,58,.22) 0%, transparent 70%);
          pointer-events:none;
        }
        .dca-classes-hub .cta-bring-title { font-family:'Playfair Display',serif; font-size:clamp(22px,3vw,30px); font-weight:900; line-height:1.15; letter-spacing:-.005em; }
        .dca-classes-hub .cta-bring-title em { color:var(--gold); font-style:italic; }
        .dca-classes-hub .cta-bring-sub { font-size:15px; color:#c8c2ba; margin-top:10px; line-height:1.55; max-width:620px; }
        .dca-classes-hub .cta-bring-button {
          display:inline-flex; align-items:center; gap:9px;
          background:var(--gold); color:var(--ink);
          padding:14px 22px; border-radius:11px;
          font-weight:700; font-size:14.5px;
          transition:transform .12s, background .15s, box-shadow .15s;
          box-shadow:0 8px 24px rgba(201,145,58,.32);
          white-space:nowrap;
          position:relative;
        }
        .dca-classes-hub .cta-bring-button:hover { background:#deaa55; transform:translateY(-1px); box-shadow:0 12px 30px rgba(201,145,58,.42); }

        @media (max-width: 740px) {
          .dca-classes-hub .hero { padding:60px 24px 64px; }
          .dca-classes-hub .section { padding:48px 24px; }
          .dca-classes-hub .cta-bring { grid-template-columns:1fr; padding:36px 28px; margin:24px 18px 48px; }
        }
      `}</style>

      <div className="top-band" />
      <div className="topbar">
        <Link to="/" className="brand">
          Digital<em>Craft</em>
        </Link>
        <Link to="/" className="topbar-cta" onClick={() => trackCTAClick('classes_hub_back_to_home', 'classes_topbar')}>
          ← Digital Craft Home
        </Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-dot" />
            In-person sessions · DFW &amp; beyond
          </div>
          <h1 className="hero-title">
            Learn AI <em>in a room with people</em>.<br />
            Bring a laptop, leave a better thinker.
          </h1>
          <p className="hero-sub">
            Hands-on, small-group AI classes taught in libraries and community spaces. Built for
            kids, teens, and working adults — no prior AI experience required. Every session ends
            with a real project you made yourself.
          </p>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{upcoming.length || '—'}</div>
              <div className="hero-stat-label">Upcoming session{upcoming.length === 1 ? '' : 's'}</div>
            </div>
            <div>
              <div className="hero-stat-num">8</div>
              <div className="hero-stat-label">Weeks per program</div>
            </div>
            <div>
              <div className="hero-stat-num">10–99</div>
              <div className="hero-stat-label">Age range we teach</div>
            </div>
            <div>
              <div className="hero-stat-num">$30+</div>
              <div className="hero-stat-label">Drop-in pricing</div>
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="section">
        <div className="section-eyebrow">Upcoming</div>
        <h2 className="section-title">
          Reserve a seat — <em>upcoming sessions</em>.
        </h2>
        <p className="section-lead">
          Each session runs for 8 Tuesdays at a partner venue. Drop-in or full-track pricing.
          Family rates available.
        </p>

        {upcoming.length === 0 ? (
          <div className="empty">
            <strong>No public sessions on the schedule right now</strong>
            We're between cohorts. Drop us a note below to be the first to hear when the next one
            opens.
          </div>
        ) : (
          <div className="grid">
            {upcoming.map((s) => (
              <SessionCard key={s.slug} session={s} />
            ))}
          </div>
        )}
      </section>

      {/* WHAT WE TEACH */}
      <div className="teach">
        <div className="teach-inner">
          <div className="section-eyebrow">What we teach</div>
          <h2 className="section-title">
            Eight weeks. <em>Real AI fluency.</em>
          </h2>
          <p className="section-lead">
            Every program is hands-on from week one. Students leave with a working project
            they made — a study plan, a writing workflow, a script, a household system.
          </p>
          <div className="teach-grid">
            <div className="teach-card">
              <div className="teach-icon"><Laptop size={22} /></div>
              <div className="teach-card-title">Prompt engineering, for real</div>
              <div className="teach-card-body">
                The four prompts every student should know by heart. Structure, specificity,
                refinement. No "AI prompt magic words" — just clear thinking on a keyboard.
              </div>
            </div>
            <div className="teach-card">
              <div className="teach-icon"><BookOpen size={22} /></div>
              <div className="teach-card-title">Writing, research & code</div>
              <div className="teach-card-body">
                Outline, draft, revise. Solve math and debug code with AI. Source-checking and
                citation hygiene so students stay honest about what's theirs and what's not.
              </div>
            </div>
            <div className="teach-card">
              <div className="teach-icon"><Users size={22} /></div>
              <div className="teach-card-title">For kids, teens, and adults</div>
              <div className="teach-card-body">
                Youth and adult tracks meet back-to-back so whole families can attend. We pace each
                track for its audience — homework + creative projects for youth, real workflows
                for adults.
              </div>
            </div>
            <div className="teach-card">
              <div className="teach-icon"><MapPin size={22} /></div>
              <div className="teach-card-title">In-person, in your community</div>
              <div className="teach-card-body">
                Taught at libraries and community spaces. No commuting downtown, no fluorescent
                hotel meeting rooms. Small groups, real conversations, real people.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAST */}
      {past.length > 0 && (
        <section className="section">
          <div className="section-eyebrow">Archive</div>
          <h2 className="section-title">
            Past <em>sessions</em>.
          </h2>
          <p className="section-lead">
            Want to see what previous cohorts learned? Each archive page keeps the full curriculum
            and pricing as it ran.
          </p>
          <div className="past-grid">
            {past.map((s) => (
              <Link
                key={s.slug}
                to={`/classes/${s.slug}`}
                className="past-card"
                onClick={() => trackCTAClick(`classes_hub_past:${s.slug}`, 'classes_hub_past')}
              >
                <div className="past-card-eyebrow">
                  {s.seasonLabel} · {s.location.city}, {s.location.state}
                </div>
                <div className="past-card-title">{s.shortName}</div>
                <div className="past-card-meta">{s.dateLabel}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* BRING-A-CLASS CTA */}
      <div className="cta-bring">
        <div>
          <h3 className="cta-bring-title">
            Want a class in <em>your library or community space?</em>
          </h3>
          <p className="cta-bring-sub">
            We partner with libraries, schools, and community organizations across DFW (and
            beyond) to bring hands-on AI classes to your space. Tell us where to teach next.
          </p>
        </div>
        <a
          href="mailto:mutaaf@digitalcraftai.com?subject=Host%20an%20AI%20class%20at%20our%20venue"
          className="cta-bring-button"
          onClick={() => trackCTAClick('classes_hub_host_class', 'classes_hub_cta')}
        >
          Host a class at your venue
          <ArrowRight size={16} />
        </a>
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: ClassSession;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const minPrice = session.tracks.reduce((m, t) => {
    const n = parseInt(t.price.replace(/[^0-9]/g, ''), 10);
    return Number.isNaN(n) ? m : Math.min(m, n);
  }, Number.POSITIVE_INFINITY);

  return (
    <Link
      to={`/classes/${session.slug}`}
      className="card"
      onClick={() => trackCTAClick(`classes_hub_card:${session.slug}`, 'classes_hub_grid')}
    >
      <div className="card-strip" />
      <div className="card-body">
        <div className="card-eyebrow">
          {session.seasonLabel} · {session.location.city}, {session.location.state}
        </div>
        <div className="card-title">{session.shortName}</div>
        <div className={`status-pill status-${session.status}`}>
          {session.status === 'open'
            ? 'Registration open'
            : session.status === 'waitlist'
            ? 'Waitlist only'
            : 'Closed'}
        </div>
        <div className="card-blurb">{session.hubBlurb}</div>
        <div className="card-meta">
          <span className="meta-chip">📅 {session.dateLabel}</span>
          <span className="meta-chip">⏰ {session.timeLabel}</span>
          <span className="meta-chip">📍 {session.location.venue}</span>
          <span className="meta-chip">👥 {session.audience}</span>
        </div>
      </div>
      <div className="card-foot">
        <div className="card-price">
          From <strong>${minPrice !== Number.POSITIVE_INFINITY ? minPrice : '—'}</strong>
        </div>
        <span className="card-cta">
          See details &amp; register <ArrowRight size={13} />
        </span>
      </div>
    </Link>
  );
};

export default Classes;
