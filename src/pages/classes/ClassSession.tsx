import React, { useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackCTAClick } from '@/utils/analytics';
import {
  CANONICAL_ORIGIN,
  ClassSession as ClassSessionData,
  getSessionBySlug,
} from '@/data/classSessions';

/**
 * Renders the public landing page for a single in-person class session.
 * All copy, pricing, curriculum and meta come from src/data/classSessions.ts —
 * this component is the visual template only.
 *
 * Styles are scoped under .dca-classes-page so they don't bleed into the rest
 * of the app. The same palette + typography is reused on /classes/<slug>/register
 * for visual continuity.
 */

interface Props {
  /** Allow rendering a specific session without the router (used by /classes hub featured card). */
  session?: ClassSessionData;
}

const ClassSession: React.FC<Props> = ({ session: sessionProp }) => {
  const params = useParams<{ slug: string }>();
  const session = sessionProp ?? getSessionBySlug(params.slug);

  useEffect(() => {
    if (session) {
      trackCTAClick(`classes_landing_view:${session.slug}`, 'classes_landing');
    }
  }, [session]);

  if (!session) {
    return <Navigate to="/classes" replace />;
  }

  const sessionUrl = `${CANONICAL_ORIGIN}/classes/${session.slug}`;
  const ogImage = `${CANONICAL_ORIGIN}/api/og-image?slug=${session.slug}`;

  return (
    <div className="dca-classes-page">
      <Helmet>
        <title>{`${session.social.ogTitle} | Digital Craft`}</title>
        <meta name="description" content={session.social.ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={sessionUrl} />
        <meta property="og:title" content={session.social.ogTitle} />
        <meta property="og:description" content={session.social.ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={session.social.ogTitle} />
        <meta name="twitter:description" content={session.social.ogDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={sessionUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationEvent',
            name: session.social.ogTitle,
            description: session.social.ogDescription,
            startDate: session.startDate,
            endDate: session.endDate,
            ...(session.repeatFrequency
              ? {
                  eventSchedule: {
                    '@type': 'Schedule',
                    repeatFrequency: session.repeatFrequency,
                    byDay: session.byDay,
                    startTime: session.scheduleStartTime,
                    endTime: session.scheduleEndTime,
                  },
                }
              : {}),
            location: {
              '@type': 'Place',
              name: session.location.venue,
              address: {
                '@type': 'PostalAddress',
                addressLocality: session.location.city,
                addressRegion: session.location.state,
                addressCountry: 'US',
              },
            },
            organizer: {
              '@type': 'Organization',
              name: 'Digital Craft AI',
              url: CANONICAL_ORIGIN,
            },
            offers: session.tracks.map((t) => ({
              '@type': 'Offer',
              name: t.name,
              price: t.price.replace(/[^0-9]/g, ''),
              priceCurrency: 'USD',
            })),
          })}
        </script>
      </Helmet>

      <style>{`
        .dca-classes-page {
          --green:#1a6b4a;--green-mid:#2d9b6e;--green-light:#e8f5ef;
          --blue:#2b3fa0;--blue-light:#eaedff;
          --gold:#c9913a;--ink:#1a1714;--mid:#5a5450;
          --rule:#e2ddd7;--cream:#fdf8f2;--white:#fff;
          font-family:'DM Sans',sans-serif;
          background:var(--cream);
          color:var(--ink);
          min-height:100vh;
        }
        .dca-classes-page * { box-sizing:border-box; }
        .dca-classes-page a { color:inherit; }

        .dca-classes-page .top-band { height:4px; background:linear-gradient(90deg,#2d9b6e,#c9913a,#4a63d4); }

        .dca-classes-page .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 32px; }
        .dca-classes-page .brand { font-family:'Playfair Display',serif; font-weight:700; font-size:18px; letter-spacing:.01em; color:var(--ink); text-decoration:none; }
        .dca-classes-page .brand em { color:var(--gold); font-style:italic; }
        .dca-classes-page .topbar-cta { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:var(--green); text-decoration:none; padding:8px 14px; border:1.5px solid var(--green); border-radius:30px; transition:background .15s,color .15s; }
        .dca-classes-page .topbar-cta:hover { background:var(--green); color:white; }

        .dca-classes-page .hero { background:var(--ink); color:white; padding:64px 40px 72px; position:relative; overflow:hidden; }
        .dca-classes-page .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 80% at 80% 50%, rgba(45,155,110,.15) 0%, transparent 70%); pointer-events:none; }
        .dca-classes-page .hero::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 50% 60% at 10% 100%, rgba(201,145,58,.10) 0%, transparent 70%); pointer-events:none; }
        .dca-classes-page .hero-inner { max-width:980px; margin:0 auto; position:relative; }
        .dca-classes-page .hero-tag { font-family:'DM Mono',monospace; font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }
        .dca-classes-page .hero-title { font-family:'Playfair Display',serif; font-size:clamp(34px,6vw,64px); font-weight:900; line-height:1.02; margin-bottom:18px; }
        .dca-classes-page .hero-title em { font-style:italic; color:var(--gold); }
        .dca-classes-page .hero-sub { font-size:17px; color:#c8c2ba; line-height:1.6; max-width:640px; margin-bottom:24px; }
        .dca-classes-page .hero-meta { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:28px; }
        .dca-classes-page .meta-chip { display:inline-flex; align-items:center; gap:7px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:30px; padding:7px 14px; font-size:12.5px; color:#c8c2ba; }
        .dca-classes-page .hero-ctas { display:flex; flex-wrap:wrap; gap:12px; }
        .dca-classes-page .btn-primary { display:inline-flex; align-items:center; gap:8px; background:var(--green); color:white; text-decoration:none; padding:14px 26px; border-radius:10px; font-weight:700; font-size:15px; transition:background .15s,transform .1s; }
        .dca-classes-page .btn-primary:hover { background:#155a3c; transform:translateY(-1px); }
        .dca-classes-page .btn-ghost { display:inline-flex; align-items:center; gap:8px; background:transparent; color:#c8c2ba; text-decoration:none; padding:14px 22px; border-radius:10px; border:1.5px solid rgba(255,255,255,.18); font-weight:600; font-size:14.5px; transition:background .15s; }
        .dca-classes-page .btn-ghost:hover { background:rgba(255,255,255,.06); color:white; }

        .dca-classes-page .section { max-width:980px; margin:0 auto; padding:64px 32px; }
        .dca-classes-page .section-narrow { max-width:780px; margin:0 auto; padding:48px 32px; }
        .dca-classes-page .eyebrow { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--green); margin-bottom:10px; }
        .dca-classes-page .section-title { font-family:'Playfair Display',serif; font-size:clamp(26px,4vw,38px); font-weight:900; line-height:1.1; margin-bottom:14px; }
        .dca-classes-page .section-title em { font-style:italic; color:var(--gold); }
        .dca-classes-page .section-lead { font-size:16px; color:var(--mid); line-height:1.6; max-width:640px; margin-bottom:36px; }

        .dca-classes-page .pillars { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; }
        .dca-classes-page .pillar { background:white; border:1px solid var(--rule); border-radius:14px; padding:24px; }
        .dca-classes-page .pillar-icon { font-size:24px; margin-bottom:10px; }
        .dca-classes-page .pillar-title { font-family:'Playfair Display',serif; font-size:18px; font-weight:700; margin-bottom:8px; }
        .dca-classes-page .pillar-body { font-size:14px; color:var(--mid); line-height:1.6; }

        .dca-classes-page .tracks-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:14px; }
        .dca-classes-page .tracks-grid .full-span { grid-column:1/-1; }
        .dca-classes-page .track-card { background:white; border:2px solid var(--rule); border-radius:14px; padding:22px; position:relative; }
        .dca-classes-page .track-card.feature { border-color:var(--green); box-shadow:0 0 0 3px rgba(45,155,110,.12); }
        .dca-classes-page .track-price { font-family:'Playfair Display',serif; font-size:32px; font-weight:900; color:var(--gold); line-height:1; }
        .dca-classes-page .track-name { font-size:15px; font-weight:700; color:var(--ink); margin-top:6px; }
        .dca-classes-page .track-sub { font-size:12.5px; color:var(--mid); margin-top:3px; line-height:1.4; }
        .dca-classes-page .track-note { font-size:12.5px; color:var(--mid); margin-top:12px; line-height:1.55; }
        .dca-classes-page .track-badge { display:inline-block; font-family:'DM Mono',monospace; font-size:9.5px; letter-spacing:.1em; text-transform:uppercase; background:var(--green); color:white; padding:3px 9px; border-radius:4px; margin-top:10px; font-weight:500; }
        .dca-classes-page .track-badge.gold { background:var(--gold); }

        .dca-classes-page .curriculum { display:grid; gap:14px; }
        .dca-classes-page .week { display:grid; grid-template-columns:120px 1fr; gap:24px; padding:24px 0; border-bottom:1px solid var(--rule); }
        .dca-classes-page .week:last-child { border-bottom:none; }
        .dca-classes-page .week-num { font-family:'DM Mono',monospace; font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--green); padding-top:4px; }
        .dca-classes-page .week-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:700; margin-bottom:8px; }
        .dca-classes-page .week-body { font-size:14.5px; color:var(--mid); line-height:1.7; }
        @media(max-width:640px) { .dca-classes-page .week { grid-template-columns:1fr; gap:6px; } }

        .dca-classes-page .reqs { background:white; border:1px solid var(--rule); border-radius:14px; padding:28px; display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .dca-classes-page .req { display:flex; gap:14px; align-items:flex-start; }
        .dca-classes-page .req-icon { font-size:28px; flex-shrink:0; line-height:1.1; }
        .dca-classes-page .req-title { font-weight:700; font-size:15px; margin-bottom:4px; }
        .dca-classes-page .req-body { font-size:13.5px; color:var(--mid); line-height:1.6; }
        .dca-classes-page .req-body a { color:var(--green); font-weight:600; text-decoration:none; }
        .dca-classes-page .req-body a:hover { text-decoration:underline; }
        @media(max-width:640px) { .dca-classes-page .reqs { grid-template-columns:1fr; } }

        .dca-classes-page .faq-item { background:white; border:1px solid var(--rule); border-radius:12px; padding:18px 22px; margin-bottom:10px; }
        .dca-classes-page .faq-q { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; margin-bottom:8px; }
        .dca-classes-page .faq-a { font-size:14px; color:var(--mid); line-height:1.65; }

        .dca-classes-page .cta-block { background:var(--ink); border-radius:18px; padding:48px 40px; text-align:center; color:white; position:relative; overflow:hidden; margin:48px 32px 64px; max-width:980px; }
        .dca-classes-page .cta-block.centered { margin-left:auto; margin-right:auto; }
        .dca-classes-page .cta-block::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 80% 50%, rgba(45,155,110,.18) 0%, transparent 70%); pointer-events:none; }
        .dca-classes-page .cta-title { font-family:'Playfair Display',serif; font-size:clamp(24px,3.5vw,32px); font-weight:900; margin-bottom:10px; position:relative; }
        .dca-classes-page .cta-title em { color:var(--gold); font-style:italic; }
        .dca-classes-page .cta-sub { font-size:15px; color:#c8c2ba; max-width:520px; margin:0 auto 22px; line-height:1.6; position:relative; }
        .dca-classes-page .cta-block .btn-primary { position:relative; }

        .dca-classes-page .footer-strip { padding:32px; text-align:center; font-size:13px; color:var(--mid); border-top:1px solid var(--rule); }
        .dca-classes-page .footer-strip a { color:var(--green); font-weight:600; text-decoration:none; }
        .dca-classes-page .footer-strip a:hover { text-decoration:underline; }
      `}</style>

      <div className="top-band" />

      <div className="topbar">
        <Link to="/" className="brand">
          Digital<em>Craft</em>
        </Link>
        <Link
          to={`/classes/${session.slug}/register`}
          className="topbar-cta"
          onClick={() => trackCTAClick(`classes_register:${session.slug}`, 'classes_topbar')}
        >
          Register →
        </Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">{session.eyebrow}</div>
          <h1 className="hero-title">
            {renderTitleWithHighlight(session.title, session.titleHighlight)}
            {session.titleSecondLine && (
              <>
                <br />
                {session.titleSecondLine}
              </>
            )}
          </h1>
          <p className="hero-sub">{session.heroSub}</p>
          <div className="hero-meta">
            <span className="meta-chip">📅 {session.dateLabel}</span>
            <span className="meta-chip">
              📍 {session.location.venue}, {session.location.city} {session.location.state}
            </span>
            <span className="meta-chip">⏰ {session.timeLabel}</span>
            <span className="meta-chip">👥 {session.audience}</span>
          </div>
          <div className="hero-ctas">
            <Link
              to={`/classes/${session.slug}/register`}
              className="btn-primary"
              onClick={() => trackCTAClick(`classes_register:${session.slug}`, 'classes_hero')}
            >
              Register Now →
            </Link>
            <a href="#curriculum" className="btn-ghost">See the curriculum</a>
          </div>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section className="section">
        <div className="eyebrow">Who it's for</div>
        <h2 className="section-title">
          Two tracks, <em>one classroom</em>.
        </h2>
        <p className="section-lead">
          Youth and adults learn back-to-back every Tuesday. Families can join both — parents and
          kids picking up AI together at the same library, in the same week.
        </p>
        <div className="pillars">
          {session.pillars.map((p) => (
            <div className="pillar" key={p.title}>
              <div className="pillar-icon">{p.icon}</div>
              <div className="pillar-title">{p.title}</div>
              <div className="pillar-body">{p.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="section" id="curriculum">
        <div className="eyebrow">{session.curriculum.length} weeks</div>
        <h2 className="section-title">
          What you'll <em>actually learn</em>.
        </h2>
        <p className="section-lead">
          Every Tuesday builds on the last. By the final week you'll have shipped a real project
          using AI — a research paper, a study plan, a script, a workflow, whatever you came in
          wanting to build.
        </p>
        <div className="curriculum">
          {session.curriculum.map((w) => (
            <div className="week" key={w.week}>
              <div className="week-num">{w.week}</div>
              <div>
                <div className="week-title">{w.title}</div>
                <div className="week-body">{w.body}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRACKS / PRICING */}
      <section className="section" id="pricing">
        <div className="eyebrow">Pricing</div>
        <h2 className="section-title">
          Pick the track that <em>fits your week</em>.
        </h2>
        <p className="section-lead">
          Drop in for a single Tuesday or commit to the full eight. Early-bird seats are limited
          and go quickly — they save you $25 over the full-track price.
        </p>
        <div className="tracks-grid">
          {session.tracks.map((t) => (
            <div
              key={t.key}
              className={`track-card${t.feature ? ' feature full-span' : ''}`}
            >
              <div className="track-price">{t.price}</div>
              <div className="track-name">{t.name}</div>
              <div className="track-sub">{t.sub}</div>
              <div className="track-note">{t.note}</div>
              {t.badge && (
                <div className={`track-badge${t.badge.tone === 'gold' ? ' gold' : ''}`}>
                  {t.badge.label}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="section-narrow">
        <div className="eyebrow">Before your first session</div>
        <h2 className="section-title">
          What you'll <em>need to bring</em>.
        </h2>
        <p className="section-lead">
          Two non-negotiables. The class moves fast — we don't want you watching from the sideline.
        </p>
        <div className="reqs">
          {session.requirements.map((r) => (
            <div className="req" key={r.title}>
              <div className="req-icon">{r.icon}</div>
              <div>
                <div className="req-title">{r.title}</div>
                <div className="req-body">
                  {r.link ? (
                    <>
                      {r.body.split(r.link.text)[0]}
                      <a href={r.link.href} target="_blank" rel="noreferrer">
                        {r.link.text}
                      </a>
                      {r.body.split(r.link.text)[1] ?? ''}
                    </>
                  ) : (
                    r.body
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="section-narrow">
        <div className="eyebrow">Questions</div>
        <h2 className="section-title">
          Frequently <em>asked</em>.
        </h2>
        <div style={{ marginTop: 24 }}>
          {session.faqs.map((f) => (
            <div className="faq-item" key={f.q}>
              <div className="faq-q">{f.q}</div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="cta-block centered">
        <h3 className="cta-title">
          Ready to <em>save a seat?</em>
        </h3>
        <p className="cta-sub">
          Early-bird pricing won't last. Registration takes about two minutes — you can pay
          per-session or in full.
        </p>
        <Link
          to={`/classes/${session.slug}/register`}
          className="btn-primary"
          onClick={() => trackCTAClick(`classes_register:${session.slug}`, 'classes_footer_cta')}
        >
          Register Now →
        </Link>
      </div>

      <div className="footer-strip">
        Questions? Email <a href={`mailto:${session.contact.email}`}>{session.contact.email}</a> or
        call <a href={`tel:${session.contact.phone.replace(/[^0-9]/g, '')}`}>{session.contact.phone}</a>
      </div>
    </div>
  );
};

function renderTitleWithHighlight(title: string, highlight: string): React.ReactNode {
  if (!highlight || !title.includes(highlight)) {
    return title;
  }
  const [before, after] = title.split(highlight);
  return (
    <>
      {before}
      <em>{highlight}</em>
      {after}
    </>
  );
}

export default ClassSession;
