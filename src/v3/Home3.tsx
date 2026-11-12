import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowUpRight, Check, Phone, MessageSquare, Calculator, PhoneCall, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/ContactForm';
import LiveChatBubble from '@/components/LiveChatBubble';
import { useContent } from '@/hooks/useContent';
import { useAnalytics, useEngagementTracking, trackCTAClick } from '@/utils/analytics';
import { ORGANIZATION_SCHEMA } from '@/data/organizationSchema';
import { DEMO_GROUPS } from '@/data/demoCatalog';
import { FOUNDER_CREDENTIALS } from '@/data/founder';
import { METRICS } from '@/data/ctoCopy';
import { AskPrompt, CellHead, Gauge, LaunchKeys, Rules, StageWindow, Tag, useScanOnce, type Route } from './deck';
import { openTry } from './TrySheet';
import { CALENDLY, VERTICALS, domainOf } from './verticals';
import { useFold } from './fold';

// v3 landing for digitalcraftai.com (the beta overhaul, after mutaafaziz.com's Mission Control):
// the sky (the Crew of Light storyboard) under a headline, "try it on your company" one field away,
// then ONE instrument: what we build · by the numbers · ask this site · how our agents behave ·
// four launch keys. Pricing, the founder, clients' words and the contact form follow on the night.
// On the iPhone Duo open, the sky takes the left page and the words the right; nothing on the hinge.

const PRODUCT_NAME = 'Digital Craft AI Automation';
const DEMO_COUNT = DEMO_GROUPS.reduce((n, g) => n + g.demos.length, 0);
const INDUSTRY_COUNT = DEMO_GROUPS.length;
const LEAD_RESPONSE = METRICS.find((m) => /lead response/i.test(m.v))?.k ?? '< 60s';

// what a visitor might call their industry, for the ask router
const KEYWORDS: Record<string, string> = {
  construction: 'construction|contractor|builder|remodel|renovat|general contract',
  realestate: 'real estate|realtor|realty|wholesal|brokerage|investor|flipp',
  homeservices: 'home service|handyman|repair service',
  events: 'events?\\b|wedding|venue|planner',
  healthcare: 'health ?care|clinic|medical|doctor|therap|chiropract',
  legal: 'law firm|lawyer|attorney|legal',
  restaurant: 'restaurant|cafe|caf\u00e9|catering|bakery|diner',
  kidsplay: 'kids|birthday part|play ?place|trampoline|play center',
  fitness: 'gym|fitness|yoga|pilates|crossfit',
  dental: 'dental|dentist|orthodont',
  salon: 'salon|spa\\b|barber|nail',
  autorepair: 'auto ?repair|mechanic|car repair|body shop|auto shop',
};

const BUILD = [
  { icon: MessageSquare, name: 'Lead responder', line: 'Answers every inquiry, day or night, and qualifies it before you call back.', to: '/construction/demo/lead-responder' },
  { icon: Calculator, name: 'Estimates & proposals', line: 'Turns a request into a priced, itemized estimate while the customer is still interested.', to: '/construction/demo/estimate' },
  { icon: PhoneCall, name: 'Voice agent', line: 'Picks up the phone, books the job, follows up. Talk to it in your browser.', to: '/construction/demo/voice-negotiator' },
  { icon: Star, name: 'Reviews & follow-up', line: 'Asks happy customers for reviews and answers every one in your voice.', to: '/construction/demo/reviews' },
];

const RULES = [
  { title: 'It never makes up a price', body: 'Quotes come from your price book and the numbers you give it. When it doesn’t know, it says so and hands off.', proof: '/hallucination-safeguards', proofLabel: 'Safeguards' },
  { title: 'A person can always take over', body: 'Every conversation can be handed to you or your team, and the agent tells customers who they’re talking to.', proof: '/ethics', proofLabel: 'Our commitments' },
  { title: 'Your data stays yours', body: 'What we keep, for how long, and how to have it deleted, in plain words.', proof: '/data-retention', proofLabel: 'Data retention' },
  { title: 'Every model is named', body: 'Which AI does what, and every company that touches your data, listed publicly.', proof: '/subprocessors', proofLabel: 'Subprocessors' },
  { title: 'Built with security in the room', body: 'Keys stay on the server, calls are proxied, and the controls are written down.', proof: '/security', proofLabel: 'Security' },
  { title: 'Shipped in public', body: 'What changed and when, so you can see the work, not just hear about it.', proof: '/changelog', proofLabel: 'Changelog' },
];

const Home3: React.FC = () => {
  const { content } = useContent();
  const { form } = useFold();
  const [site, setSite] = useState('');
  const deck = useScanOnce<HTMLDivElement>();
  useAnalytics('G-JQ53W917HT');
  useEngagementTracking();

  useEffect(() => { if (!window.location.hash) window.scrollTo(0, 0); }, []);
  // honor /#contact and /#pricing (the navbar's links from other pages) once content is in
  useEffect(() => {
    if (!content || !window.location.hash) return;
    const t = window.setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 120);
    return () => window.clearTimeout(t);
  }, [content]);

  const seo = content?.seo;
  const mvp = content?.mvpPromotion;
  const tiers = content?.pricingTiers;
  const lowestRetainer = tiers?.tiers.reduce((m, t) => Math.min(m, t.price), Infinity);
  const priceAnswer = mvp
    ? <>A working product in {mvp.subheadline.toLowerCase().replace(/^in /, '')}, fixed at {mvp.price}. Support retainers from ${lowestRetainer}/month. <a href="#pricing" className="text-aurora underline">See pricing</a></>
    : <>Fixed-price builds and monthly retainers. <a href="#pricing" className="text-aurora underline">See pricing</a></>;

  const routes: Route[] = [
    { test: /\b(book|call me|talk|meet|meeting|contact|email|reach|hire)\b/i, answer: () => <>Thirty minutes with the founder, no pitch. <a href={CALENDLY} target="_blank" rel="noopener noreferrer" className="text-aurora underline">Pick a time</a>, or leave a note in the <a href="#contact" className="text-aurora underline">contact form</a>.</> },
    { test: /\b(price|pricing|cost|costs|how much|budget|expensive|cheap)\b|\$/i, answer: () => priceAnswer },
    { test: /\b(phone|voice|calls?|answer(ing)?|receptionist|after hours)\b/i, answer: () => <>Yes. The voice agent picks up, qualifies and books. <Link to="/construction/demo/voice-negotiator" className="text-aurora underline">Talk to it now</Link>, in your browser.</> },
    { test: /\b(safe|secure|security|privacy|private|data|hipaa|gdpr|trust)\b/i, answer: () => <>Keys never reach the browser, every vendor is listed, and you can have your data deleted. <Link to="/trust" className="text-aurora underline">The trust center</Link>.</> },
    { test: /\b(who|founder|behind|human|person|mutaaf|are you real)\b/i, answer: () => <>Mutaaf Aziz: fractional CTO since 2019, with engineering leadership at {FOUNDER_CREDENTIALS.map((c) => c.org.split(' ')[0]).join(', ')}. <a href="https://cto.digitalcraftai.com" className="text-aurora underline">The CTO side</a>.</> },
    { test: /\b(demo|try|show|see it|example|my company|my website)\b/i, answer: () => <>Best way to see it: on your own company. <button type="button" onClick={() => openTry()} className="text-aurora underline">Give us your website</button> and every demo answers as you.</> },
    ...VERTICALS.map((v) => ({ test: new RegExp(`\\b(${KEYWORDS[v.key]})`, 'i'), answer: () => <>There {(DEMO_GROUPS.find((g) => g.demos.some((d) => d.path.startsWith(v.hub)))?.demos.length ?? 0) === 1 ? 'is one live demo' : `are ${DEMO_GROUPS.find((g) => g.demos.some((d) => d.path.startsWith(v.hub)))?.demos.length ?? 'several'} live demos`} for {v.label.toLowerCase()}. <Link to={v.hub} className="text-aurora underline">Open them</Link>, or <button type="button" onClick={() => openTry({ vertical: v.key })} className="text-aurora underline">run them on your company</button>.</> })),
    { test: /\b(roof|plumb|hvac|electric|paint|landscap|clean|pest|pool|solar|window|garage|tree|fenc|concrete|moving|restoration)/i, answer: (q) => { const m = q.match(/roof|plumb|hvac|electric|paint|landscap|clean|pest|pool|solar|window|garage|tree|fenc|concrete|moving|restoration/i)?.[0].toLowerCase(); const slug: Record<string, string> = { roof: 'roofers', plumb: 'plumbers', hvac: 'hvac', electric: 'electricians', paint: 'painters', landscap: 'landscapers', clean: 'cleaning-services', pest: 'pest-control', pool: 'pool-service', solar: 'solar-installers', window: 'window-installers', garage: 'garage-door-companies', tree: 'tree-services', fenc: 'fencing-contractors', concrete: 'concrete-contractors', moving: 'moving-companies', restoration: 'restoration-services' }; return <>Yes, trades like yours are the point. <Link to={`/ai-for-${slug[m || 'roof']}`} className="text-aurora underline">What AI does for a business like yours</Link>, or <button type="button" onClick={() => openTry({ vertical: 'homeservices' })} className="text-aurora underline">run the demos on your company</button>.</>; } },
    { test: /\b(hi|hello|hey|yo|sup)\b/i, answer: () => <>Hello. Ask me what it costs, whether it can answer your phone, or who&rsquo;s behind it.</> },
    { test: /\b(app|install|offline|home screen)\b/i, answer: () => <>This site installs like an app: Share → Add to Home Screen on iPhone, or Install in Chrome. It even works offline.</> },
  ];

  const tryHere = (e: React.FormEvent) => {
    e.preventDefault();
    trackCTAClick('v3_hero_try', domainOf(site) ? 'with_site' : 'empty');
    openTry({ site: domainOf(site) || site || null });
  };

  const open = form === 'open';
  const heroGrid: React.CSSProperties | undefined = open
    ? { display: 'grid', gridTemplateColumns: 'var(--v3-hinge-l) var(--v3-hinge-w) 1fr', minHeight: '100svh' }
    : undefined;

  return (
    <div className="min-h-screen overflow-x-clip text-gray-200">
      <Helmet>
        <title>{seo?.title ?? 'DigitalCraft AI | AI Automation for Traditional Industries'}</title>
        {seo && <meta name="description" content={seo.description} />}
        {seo && <meta name="keywords" content={seo.keywords} />}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://digitalcraftai.com/" />
        {seo && <meta property="og:title" content={seo.title} />}
        {seo && <meta property="og:description" content={seo.description} />}
        <meta property="og:image" content="/og-default.png" />
        <meta property="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://digitalcraftai.com/" />
        {seo && <script type="application/ld+json">{JSON.stringify({ ...ORGANIZATION_SCHEMA, description: seo.description })}</script>}
        {tiers && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org', '@type': 'Product', name: PRODUCT_NAME, description: tiers.subheadline,
            brand: { '@type': 'Brand', name: 'Digital Craft AI' }, url: 'https://digitalcraftai.com',
            offers: tiers.tiers.map((t) => ({ '@type': 'Offer', name: t.name, description: t.description, price: String(t.price), priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: t.ctaLink, category: t.period })),
          })}</script>
        )}
      </Helmet>
      <Navbar />

      {/* ── the sky ──────────────────────────────────────────────────────────────────────── */}
      <section className={open ? '' : 'relative pt-24 md:pt-32'} style={heroGrid}>
        {open && <StageWindow host="root" label="After hours" className="h-full !border-y-0 !border-l-0" height="h-[calc(100svh-44px)]" />}
        {open && <div aria-hidden />}
        <div className={open ? 'flex flex-col justify-center px-8 pb-12 pt-24' : 'mx-auto grid max-w-[1320px] items-center gap-10 px-4 md:px-6 lg:grid-cols-[1.02fr_1fr] lg:gap-14'}>
          <div>
            <div className="v3-rise v3-eyebrow mb-6 flex items-center gap-2.5" style={{ '--i': 0 } as React.CSSProperties}>
              <span className="v3-tick" /> Digital Craft AI <span className="text-gray-700">/</span> <span className="v3-dot" /> live
            </div>
            <h1 className={open ? "v3-rise mb-6 text-[52px] font-semibold leading-[1.02] text-white" : "v3-rise mb-6 text-[42px] font-semibold leading-[1.02] text-white sm:text-[56px] lg:text-[72px]"} style={{ '--i': 1 } as React.CSSProperties}>
              The lead that came in at 9pm?{' '}
              <span className="v3-serif italic text-aurora">Answered.</span>
            </h1>
            <p className="v3-rise mb-8 max-w-[34rem] text-lg leading-relaxed text-gray-400 md:text-xl" style={{ '--i': 2 } as React.CSSProperties}>
              DigitalCraft builds the AI that answers your leads, writes your estimates and follows up, for the businesses that build, fix and serve. Watch it work on your own company before you spend a dollar.
            </p>
            <form onSubmit={tryHere} className={`v3-rise mb-5 flex max-w-[34rem] flex-col gap-2 ${open ? "" : "sm:flex-row"}`} style={{ '--i': 3 } as React.CSSProperties}>
              <label htmlFor="v3-hero-site" className="sr-only">Your company website</label>
              <input id="v3-hero-site" className="v3-input flex-1" inputMode="url" autoCapitalize="none" spellCheck={false} placeholder="yourcompany.com" value={site} onChange={(e) => setSite(e.target.value)} />
              <button type="submit" className="v3-btn v3-btn-aurora">Try it on my company <ArrowRight size={17} /></button>
            </form>
            <div className="v3-rise flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500" style={{ '--i': 4 } as React.CSSProperties}>
              <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_discovery', 'v3_hero')} className="inline-flex items-center gap-1.5 text-gray-300 hover:text-white">
                <Phone size={15} /> or book a call with the founder
              </a>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-aurora" /> no signup</span>
              <span className="inline-flex items-center gap-1.5"><Check size={14} className="text-aurora" /> about 20 seconds</span>
            </div>
          </div>
          {!open && <StageWindow host="root" label="After hours" className="v3-rise" />}
        </div>
      </section>

      {/* ── built for: the industries ─────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-16 max-w-[1320px] px-4 md:mt-24 md:px-6" aria-label="Industries">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="v3-eyebrow shrink-0">Built for</span>
          {VERTICALS.map((v) => (
            <Link key={v.key} to={v.path} className="v3-chip shrink-0"><v.icon size={14} /> {v.label}</Link>
          ))}
        </div>
      </section>

      {/* ── the instrument ────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-8 max-w-[1320px] px-4 md:px-6" aria-label="Overview">
        <div ref={deck.ref} className="v3-deck v3-brackets">
          {deck.scan && <div className="v3-scan" aria-hidden />}

          <div className="v3-cell col-span-12 lg:col-span-5">
            <CellHead tag="01 · build" title="What we build" />
            <ul className="space-y-1">
              {BUILD.map((b) => (
                <li key={b.name}>
                  <Link to={b.to} className="group -mx-3 flex gap-4 rounded-lg px-3 py-3 transition-colors hover:bg-white/[0.03]">
                    <b.icon size={20} className="mt-0.5 shrink-0 text-aurora" />
                    <span>
                      <span className="flex items-center gap-1.5 font-semibold text-white">{b.name} <ArrowUpRight size={14} className="text-gray-600 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-aurora" /></span>
                      <span className="mt-0.5 block text-sm leading-relaxed text-gray-400">{b.line}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 flex flex-col lg:col-span-7">
            <div className="v3-cell !pb-0"><CellHead tag="02 · readings" title="By the numbers" /></div>
            <div className="grid flex-1 grid-cols-2 gap-px bg-night-hair">
              <Gauge value={DEMO_COUNT} label="Live demos you can run right now" note="counted from the demo catalog" accent="text-aurora" />
              <Gauge value={INDUSTRY_COUNT} label="Industries with their own demos" note="counted from the demo catalog" />
              <Gauge value={LEAD_RESPONSE} label="Lead response for a construction client" note="client outcome" />
              <Gauge value="2019" label="Fractional CTO since" note="the founder" accent="text-[#e89862]" />
            </div>
          </div>

          <div className="v3-cell col-span-12 lg:col-span-7">
            <CellHead tag="03 · ask" title="Ask this site anything" aside={<Tag className="hidden sm:block">a simple router, not a model</Tag>} />
            <AskPrompt
              where="root"
              routes={routes}
              greeting={<>Ask about prices, phones, privacy, your industry, or who&rsquo;s behind this.</>}
              chips={['what does it cost?', 'can it answer my phone?', 'is my data safe?', 'who’s behind this?', 'I run a roofing company']}
              fallback={<>I&rsquo;m a simple router, not a model, so I didn&rsquo;t catch that. Try &ldquo;pricing&rdquo;, &ldquo;voice&rdquo;, or your industry. Or <a href="#contact" className="text-aurora underline">ask a human</a>.</>}
            />
          </div>

          <div className="v3-cell col-span-12 lg:col-span-5">
            <CellHead tag="04 · rules" title="How our agents behave" />
            <Rules rules={RULES} />
          </div>

          <LaunchKeys
            where="root_deck"
            keys={[
              { n: 1, title: 'Live demos', sub: `All ${DEMO_COUNT}, by industry`, to: '/demos' },
              { n: 2, title: 'Industries', sub: 'Find yours', to: '/industries' },
              { n: 3, title: 'Fractional CTO', sub: 'Strategy on retainer', to: 'https://cto.digitalcraftai.com', external: true },
              { n: 4, title: 'The playbook', sub: 'How we ship AI', to: '/playbook' },
            ]}
          />
        </div>
      </section>

      {/* ── pricing ───────────────────────────────────────────────────────────────────────── */}
      {(mvp || tiers) && (
        <section id="pricing" className="mx-auto mt-24 max-w-[1320px] scroll-mt-24 px-4 md:mt-32 md:px-6">
          <div className="mb-10 max-w-2xl">
            <div className="v3-eyebrow mb-4">Pricing</div>
            <h2 className="text-4xl font-semibold text-white md:text-5xl">Fixed to build. <span className="v3-serif italic text-gray-400">Small to keep running.</span></h2>
          </div>
          <div className="v3-deck">
            {mvp?.enabled && (
              <div className="v3-cell col-span-12 flex flex-col lg:col-span-5" style={{ background: 'linear-gradient(160deg, rgba(123,227,195,0.08), transparent 55%), var(--v3-deck)' }}>
                <Tag className="mb-3 block">build · {mvp.priceLabel.toLowerCase()}</Tag>
                <div className="mb-1 text-lg font-semibold text-white">{mvp.headline.charAt(0) + mvp.headline.slice(1).toLowerCase().replace(/\bai\b/, 'AI').replace(/\bmvp\b/, 'MVP')}</div>
                <div className="mb-4 flex items-baseline gap-3"><span className="text-6xl font-semibold tracking-tight text-white">{mvp.price}</span><span className="text-gray-400">{mvp.subheadline.toLowerCase()}</span></div>
                <p className="mb-6 text-gray-400">{mvp.description}</p>
                <ul className="mb-8 space-y-2.5 text-sm text-gray-300">
                  {mvp.features.map((f) => <li key={f} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-aurora" />{f}</li>)}
                </ul>
                <a href={mvp.ctaLink} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('mvp_cta', 'v3_pricing')} className="v3-btn v3-btn-aurora mt-auto">{mvp.ctaText} <ArrowRight size={16} /></a>
              </div>
            )}
            {tiers && (
              <div className="col-span-12 grid gap-px bg-night-hair sm:grid-cols-3 lg:col-span-7">
                {tiers.tiers.map((t) => (
                  <div key={t.name} className="relative flex flex-col bg-night-deck p-6">
                    <Tag className="mb-3 block">keep · {t.period}</Tag>
                    <div className="mb-1 flex items-center gap-2 font-semibold text-white">{t.name}{t.highlighted && <span className="rounded-full border border-aurora/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-aurora">{t.badge || 'Popular'}</span>}</div>
                    <div className="mb-3"><span className="text-4xl font-semibold tracking-tight text-white">${t.price}</span><span className="text-sm text-gray-500"> /mo</span></div>
                    <p className="mb-5 text-sm text-gray-400">{t.description}</p>
                    <ul className="mb-6 space-y-2 text-[13.5px] text-gray-300">
                      {t.features.map((f) => <li key={f} className="flex gap-2"><Check size={14} className="mt-1 shrink-0 text-gray-500" />{f}</li>)}
                    </ul>
                    <a href={t.ctaLink} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick(`tier_${t.name.toLowerCase()}`, 'v3_pricing')} className={`v3-btn mt-auto text-sm ${t.highlighted ? 'v3-btn-aurora' : 'v3-btn-ghost'}`}>{t.ctaText}</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── the founder ───────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[1320px] px-4 md:mt-32 md:px-6" data-testid="founder-section">
        <div className="v3-deck">
          <div className="v3-cell col-span-12 lg:col-span-7">
            <div className="v3-eyebrow mb-5 flex items-center gap-2"><span className="v3-tick" /> Who builds it</div>
            <p className="text-2xl leading-snug text-white md:text-[32px] md:leading-[1.25]">
              {content?.founder?.bio?.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.') ?? 'Mutaaf Aziz, Founder, DigitalCraft AI.'}
            </p>
            <a href="https://cto.digitalcraftai.com" className="mt-8 inline-flex items-center gap-2 text-aurora hover:underline">Meet the fractional CTO side <ArrowUpRight size={16} /></a>
          </div>
          <div className="col-span-12 grid gap-px bg-night-hair lg:col-span-5">
            {FOUNDER_CREDENTIALS.map((c) => (
              <div key={c.org} className="bg-night-deck px-6 py-5">
                <div className="font-semibold text-white">{c.org}</div>
                <div className="text-sm text-gray-400">{c.title}</div>
                <div className="v3-tag mt-1 !normal-case !tracking-normal">{c.years}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── in their words ────────────────────────────────────────────────────────────────── */}
      {content?.testimonials && content.testimonials.length > 0 && (
        <section className="mt-24 md:mt-32" aria-label="What clients say">
          <div className="mx-auto mb-8 max-w-[1320px] px-4 md:px-6">
            <div className="v3-eyebrow mb-4">In their words</div>
          </div>
          <div className="flex snap-x snap-mandatory gap-px overflow-x-auto px-4 pb-4 [scrollbar-width:none] md:px-[max(24px,calc((100vw-1320px)/2+24px))] [&::-webkit-scrollbar]:hidden">
            {content.testimonials.map((t) => (
              <figure key={t.quote.slice(0, 32)} className="w-[86vw] max-w-[440px] shrink-0 snap-start border border-night-hair bg-night-deck p-7">
                <blockquote className="mb-6 text-[17px] leading-relaxed text-gray-200">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="text-sm"><span className="font-semibold text-white">{t.author}</span><span className="text-gray-500"> · {t.position}</span></figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── the close ─────────────────────────────────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[1320px] px-4 md:mt-32 md:px-6">
        <div className="v3-brackets relative overflow-hidden border border-night-hair px-6 py-16 text-center md:py-24" style={{ background: 'radial-gradient(80% 120% at 50% 0%, rgba(123,227,195,0.10), transparent 60%), var(--v3-deck)' }}>
          <h2 className="mx-auto mb-5 max-w-3xl text-4xl font-semibold text-white md:text-6xl">See it answer as <span className="v3-serif italic text-aurora">you</span>.</h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-400">Your website in, every demo personalized out. Then, if it fits, thirty minutes with the founder.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => { trackCTAClick('v3_close_try', 'root'); openTry(); }} className="v3-btn v3-btn-aurora w-full sm:w-auto">Try it on my company <ArrowRight size={17} /></button>
            <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'v3_close')} className="v3-btn v3-btn-ghost w-full sm:w-auto"><Phone size={16} /> Book a call</a>
          </div>
        </div>
      </section>

      {content?.form && <div className="mt-12">{<ContactForm data={content.form} />}</div>}
      {content?.footer && <Footer data={content.footer} />}
      <LiveChatBubble />
    </div>
  );
};

export default Home3;
