import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { trackCTAClick } from '@/utils/analytics';

/**
 * Landing page for the AI Classes program at Valley Ranch Library.
 * Visual language is intentionally distinct from the rest of the site
 * (cream/green/gold + Playfair/DM Sans) so the program reads as a
 * standalone offering, while the registration sub-page reuses the
 * same palette for visual continuity.
 *
 * Styles are scoped under .dca-classes-page so they don't bleed.
 */

const TRACKS = [
  { price: '$30', name: 'Youth Drop-In', sub: 'Per session · Ages 10–18', note: 'Try a single Tuesday before committing to the full track.' },
  { price: '$200', name: 'Youth Full Track', sub: 'All 8 sessions · Ages 10–18', note: 'Best progression — every session builds on the last.' },
  { price: '$175', name: 'Youth Early Bird', sub: 'All 8 sessions · Limited spots', badge: 'Limited', tone: 'gold', note: 'Save $25 when you commit early. First-come, first-served.' },
  { price: '$30', name: 'Adult Drop-In', sub: 'Per session', note: 'Sample the curriculum before deciding on a full track.' },
  { price: '$200', name: 'Adult Full Track', sub: 'All 8 sessions', note: 'Designed for working professionals — bring your real workflows.' },
  { price: '$175', name: 'Adult Early Bird', sub: 'All 8 sessions · Limited spots', badge: 'Limited', tone: 'gold', note: 'Same content as the full track, $25 off for early registrations.' },
  { price: '$300', name: 'Joint Track', sub: 'Both sessions · 8 weeks', badge: 'Best for Families', tone: 'green', note: 'Parent and child learn side-by-side. Includes the 10% sibling discount when applicable.' },
] as const;

const CURRICULUM = [
  { week: 'Week 1', title: 'Meet Your AI', body: 'Set up Claude Pro on your laptop. Learn what AI actually does — and what it can\'t. First prompt, first project.' },
  { week: 'Week 2', title: 'Prompt Engineering Foundations', body: 'How to ask AI for what you actually want. Specificity, structure, and the four prompts every student should know by heart.' },
  { week: 'Week 3', title: 'Writing & Research with AI', body: 'Outline, draft, and revise with Claude. Source-checking, citations, and how to keep your own voice in the work.' },
  { week: 'Week 4', title: 'AI for Math & Code', body: 'Solve problems, debug code, and learn to read what AI gives you back. Project: build your first mini script.' },
  { week: 'Week 5', title: 'Personalized Learning Plans', body: 'Use AI as a tutor — for a class you\'re taking now or a skill you\'ve always wanted. Build a 30-day plan with Claude.' },
  { week: 'Week 6', title: 'Automating the Boring Stuff', body: 'Email drafts, summaries, scheduling, meeting notes. Adult track focuses on workflows; youth track on homework + creative projects.' },
  { week: 'Week 7', title: 'AI Safety, Bias & Citizenship', body: 'When AI is wrong. When it\'s biased. When you should not trust it. Conversation, not just lecture.' },
  { week: 'Week 8', title: 'Showcase & Capstone', body: 'Present what you built. Families and friends invited. Certificate of completion for full-track students.' },
] as const;

const FAQS = [
  { q: 'Who is this class for?', a: 'Two tracks run back-to-back every Tuesday. The youth track (ages 10–18) meets from 5:30 to 6:30 PM. The adult track meets from 6:30 to 7:30 PM. Joint families learn together across both hours.' },
  { q: 'Do I need to know anything about AI to start?', a: 'No. The curriculum starts at zero — opening Claude for the first time, writing your first prompt. By Week 8 you\'ll be using AI fluently for real work.' },
  { q: 'What do I need to bring?', a: 'A personal laptop (tablets and phones won\'t work for the coursework) and an active Claude Pro subscription ($20/month, cancel anytime). Both are required for every session.' },
  { q: 'Why Claude Pro specifically?', a: 'Claude is the AI tool we teach throughout the course — it\'s what every assignment, project, and live demo uses. The Pro subscription gives you the same model and tools we use in class. You can cancel after the course ends.' },
  { q: 'What if I miss a session?', a: 'Full-track students get session recap notes and the week\'s exercises by email. We do not refund missed sessions, but you can make up work asynchronously.' },
  { q: 'Is there a sibling discount?', a: 'Yes — 10% off when two or more siblings register together. The discount is applied automatically when you select the sibling option on the registration form.' },
  { q: 'Are refunds available?', a: 'Drop-in registrations are charged per session. Full-track and early-bird registrations are paid in full at signup. All sales are final after the first session.' },
] as const;

const Classes: React.FC = () => {
  useEffect(() => {
    trackCTAClick('classes_landing_view', 'classes_landing');
  }, []);

  return (
    <div className="dca-classes-page">
      <Helmet>
        <title>AI Classes at Valley Ranch Library — Summer 2026 | Digital Craft</title>
        <meta
          name="description"
          content="Hands-on AI classes for youth (ages 10–18) and adults at Valley Ranch Library in Irving, TX. Eight Tuesdays, June 16 – August 4, 2026. Learn Claude, prompt engineering, AI writing, code, and automation. Family tracks available."
        />
        <meta
          name="keywords"
          content="AI classes Irving TX, AI classes Valley Ranch Library, AI summer camp, Claude classes, prompt engineering for kids, AI for teens, AI for adults, AI literacy, Digital Craft AI classes"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalcraft.ai/classes" />
        <meta property="og:title" content="AI Classes at Valley Ranch Library — Summer 2026" />
        <meta property="og:description" content="Eight-week hands-on AI program for youth and adults in Irving, TX. Tuesdays, June 16 – August 4, 2026." />
        <link rel="canonical" href="https://digitalcraft.ai/classes" />
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
            name: 'AI Classes — Digital Craft at Valley Ranch Library',
            description:
              'Eight-week hands-on AI program for youth (10–18) and adults. Learn Claude, prompt engineering, AI writing, code, and automation.',
            startDate: '2026-06-16T17:30:00-05:00',
            endDate: '2026-08-04T19:30:00-05:00',
            eventSchedule: {
              '@type': 'Schedule',
              repeatFrequency: 'P1W',
              byDay: 'https://schema.org/Tuesday',
              startTime: '17:30',
              endTime: '19:30',
            },
            location: {
              '@type': 'Place',
              name: 'Valley Ranch Library',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Irving',
                addressRegion: 'TX',
                addressCountry: 'US',
              },
            },
            organizer: {
              '@type': 'Organization',
              name: 'Digital Craft AI',
              url: 'https://digitalcraft.ai',
            },
            offers: [
              { '@type': 'Offer', name: 'Youth Drop-In', price: '30', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Youth Full Track', price: '200', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Youth Early Bird', price: '175', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Adult Drop-In', price: '30', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Adult Full Track', price: '200', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Adult Early Bird', price: '175', priceCurrency: 'USD' },
              { '@type': 'Offer', name: 'Joint (Youth + Adult)', price: '300', priceCurrency: 'USD' },
            ],
          })}
        </script>
      </Helmet>

      {/* Scoped styles — share palette + typography with /classes/register so
          the two pages feel like one experience. */}
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
        .dca-classes-page .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 80% at 80% 50%, rgba(45,155,110,.15) 0%, transparent 70%); }
        .dca-classes-page .hero::after { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 50% 60% at 10% 100%, rgba(201,145,58,.10) 0%, transparent 70%); }
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
        .dca-classes-page .cta-block::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 80% at 80% 50%, rgba(45,155,110,.18) 0%, transparent 70%); }
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
          to="/classes/register"
          className="topbar-cta"
          onClick={() => trackCTAClick('classes_register', 'classes_topbar')}
        >
          Register →
        </Link>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-tag">Digital Craft · Valley Ranch Library · Summer 2026</div>
          <h1 className="hero-title">
            Hands-on <em>AI Classes</em><br />
            for kids, teens, and adults.
          </h1>
          <p className="hero-sub">
            Eight Tuesdays at Valley Ranch Library in Irving, TX. We teach the same AI tools that
            engineers, writers, and small-business owners use every day — starting from your very
            first prompt. Bring a laptop, leave with a new skill.
          </p>
          <div className="hero-meta">
            <span className="meta-chip">📅 June 16 – August 4, 2026</span>
            <span className="meta-chip">📍 Valley Ranch Library, Irving TX</span>
            <span className="meta-chip">⏰ Tuesdays · 5:30–7:30 PM</span>
            <span className="meta-chip">👥 Youth (10–18) &amp; Adult tracks</span>
          </div>
          <div className="hero-ctas">
            <Link
              to="/classes/register"
              className="btn-primary"
              onClick={() => trackCTAClick('classes_register', 'classes_hero')}
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
          <div className="pillar">
            <div className="pillar-icon">🎒</div>
            <div className="pillar-title">Youth · Ages 10–18</div>
            <div className="pillar-body">
              5:30–6:30 PM. AI for homework, creative writing, math, and first coding projects. We
              focus on doing the work <em>with</em> AI — not letting AI do it for you.
            </div>
          </div>
          <div className="pillar">
            <div className="pillar-icon">💼</div>
            <div className="pillar-title">Adults</div>
            <div className="pillar-body">
              6:30–7:30 PM. AI for real work — email, writing, research, scheduling, light
              automation. Bring the tasks you actually want to offload.
            </div>
          </div>
          <div className="pillar">
            <div className="pillar-icon">👨‍👩‍👧</div>
            <div className="pillar-title">Families</div>
            <div className="pillar-body">
              The joint track covers both sessions and includes the 10% sibling discount. Learning
              the same thing as your kid is the fastest way to make it stick at home.
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="section" id="curriculum">
        <div className="eyebrow">Eight weeks</div>
        <h2 className="section-title">
          What you'll <em>actually learn</em>.
        </h2>
        <p className="section-lead">
          Every Tuesday builds on the last. By Week 8 you'll have shipped a real project using AI —
          a research paper, a study plan, a script, a workflow, whatever you came in wanting to
          build.
        </p>
        <div className="curriculum">
          {CURRICULUM.map((w) => (
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
          {TRACKS.map((t, i) => (
            <div key={t.name} className={`track-card${i === 6 ? ' feature full-span' : ''}`}>
              <div className="track-price">{t.price}</div>
              <div className="track-name">{t.name}</div>
              <div className="track-sub">{t.sub}</div>
              <div className="track-note">{t.note}</div>
              {'badge' in t && t.badge && (
                <div className={`track-badge${t.tone === 'gold' ? ' gold' : ''}`}>{t.badge}</div>
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
          <div className="req">
            <div className="req-icon">💻</div>
            <div>
              <div className="req-title">Your own laptop</div>
              <div className="req-body">
                Any Mac, Windows, or Chromebook with a current browser. Tablets and phones aren't
                enough for the coursework — you'll be writing, coding, and switching windows
                throughout the session.
              </div>
            </div>
          </div>
          <div className="req">
            <div className="req-icon">🤖</div>
            <div>
              <div className="req-title">Claude Pro subscription</div>
              <div className="req-body">
                $20/month, cancel anytime. Sign up at{' '}
                <a href="https://claude.ai" target="_blank" rel="noreferrer">claude.ai</a>{' '}
                before Week 1. This is the AI tool we teach throughout the course.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-narrow">
        <div className="eyebrow">Questions</div>
        <h2 className="section-title">
          Frequently <em>asked</em>.
        </h2>
        <div style={{ marginTop: 24 }}>
          {FAQS.map((f) => (
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
          to="/classes/register"
          className="btn-primary"
          onClick={() => trackCTAClick('classes_register', 'classes_footer_cta')}
        >
          Register Now →
        </Link>
      </div>

      <div className="footer-strip">
        Questions? Email <a href="mailto:mutaaf@digitalcraftai.com">mutaaf@digitalcraftai.com</a> or
        call <a href="tel:9729000292">(972) 900-0292</a>
      </div>
    </div>
  );
};

export default Classes;
