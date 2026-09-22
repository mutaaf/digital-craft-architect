import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Rocket, ArrowRight, Phone } from 'lucide-react';
import { SHIP_LOOP_STAGES, SHIP_LOOP_GATES, SHIP_LOOP_HARD_NOS } from '@/data/shipLoopStages';

// Ticket 0083 - /how-we-ship transparency page. Mirrors Security.tsx (0081)
// and the "In effect since" chip pattern from Ethics.tsx (0077). Pre-write
// grep (2026-05-30): zero `=== 'TechArticle'` predicates site-wide, every
// `=== 'BreadcrumbList'` predicate URL-scoped by its own goto helper.
// Mirror-source (2026-05-25): META_DESCRIPTION drives Helmet meta AND
// TechArticle.description; SHIP_LOOP_STAGES/_GATES/_HARD_NOS drive visible
// cards, JSON-LD, and e2e assertions from one constant in `src/data/`.

const META_DESCRIPTION =
  'A dated description of the autonomous-agent ship loop the site runs on today: groom, ship, review, and auto-merge, with the exact gating checks and Hard-NO commitments the agents enforce. Verify the cadence yourself against the live /changelog, /changelog/rss.xml, and /changelog.json feeds.';

const PAGE_H1 = 'How we ship';
const PAGE_URL = 'https://digitalcraftai.com/how-we-ship';
const ORIGIN = 'https://digitalcraftai.com';
const DATE_PUBLISHED = '2026-09-18';
const DATE_MODIFIED = SHIP_LOOP_STAGES.map((s) => s.lastReviewed).sort().slice(-1)[0];

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: ORIGIN },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: PAGE_URL },
  ],
};

const TECH_ARTICLE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: PAGE_H1,
  description: META_DESCRIPTION,
  datePublished: DATE_PUBLISHED,
  dateModified: DATE_MODIFIED,
  url: PAGE_URL,
  author: { '@type': 'Organization', name: 'Digital Craft AI' },
  about: { '@type': 'Thing', name: 'Autonomous agent ship loop' },
  inLanguage: 'en-US',
};

const EVIDENCE_CHIPS: readonly { href: string; label: string }[] = [
  { href: '/changelog', label: 'Public changelog' },
  { href: '/changelog/rss.xml', label: 'RSS feed of every ship' },
  { href: '/changelog.json', label: 'JSON Feed of every ship' },
];

const HowWeShip: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('how_we_ship_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(TECH_ARTICLE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Rocket size={16} />
            Process transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">{PAGE_H1}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A dated description of the autonomous-agent loop this site runs on today. Every stage,
            every gate, and every Hard-NO below is mirrored from the vendor's public AGENTS.md
            contract. Verify the cadence yourself against the live evidence links at the bottom.
          </p>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">The ship loop</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHIP_LOOP_STAGES.map((s) => (
              <article key={s.id} id={`stage-${s.id}`} data-testid="ship-loop-stage-card" className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{s.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 flex-1">{s.description}</p>
                <span data-testid="ship-loop-stage-cadence" className="inline-flex self-start items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30 mb-3">
                  {s.cadence}
                </span>
                <div data-testid="ship-loop-stage-last-reviewed" className="text-xs text-gray-500 dark:text-gray-400">
                  {`Last reviewed: ${s.lastReviewed}`}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">Gates every PR must pass</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 max-w-2xl mx-auto">
            The exact GitHub check names that gate squash-merge to main. Everything else (Vercel
            preview, Lighthouse warnings) is informational and does not block ship.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {SHIP_LOOP_GATES.map((g) => (
              <span key={g} data-testid="ship-loop-gate-chip" className="inline-flex items-center px-3 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs font-mono text-gray-800 dark:text-gray-200">
                {g}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">Hard NOs the agents enforce</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 max-w-2xl mx-auto">
            Each bullet is an automatic request-changes by the review agent. Every commitment
            carries an in-effect-since date so a reviewer can attach the URL to a procurement file.
          </p>
          <ul className="space-y-4">
            {SHIP_LOOP_HARD_NOS.map((n) => (
              <li key={n.id} id={n.id} data-testid="ship-loop-hardno-item" className="scroll-mt-28 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-5">
                <p className="font-semibold text-gray-900 dark:text-white leading-relaxed mb-3">{n.statement}</p>
                <span data-testid="ship-loop-hardno-since" className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs text-gray-600 dark:text-gray-300">
                  {`In effect since ${n.sinceDate}`}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">See it for yourself</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-6 max-w-2xl mx-auto">
            The cadence above is not a marketing claim. Read the last dozen ships on the public
            changelog, or subscribe from your feed reader:
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            {EVIDENCE_CHIPS.map((c) => (
              <Link key={c.href} to={c.href} data-testid="ship-loop-evidence-chip" className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors" onClick={() => trackCTAClick(`how_we_ship_evidence_${c.href}`, 'how_we_ship')}>
                {c.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ticket 0090 - additive sibling-link strip pointing at /agent-fleet.
          Placed as its own section so `EVIDENCE_CHIPS` above stays at three
          entries (its e2e Box 9 asserts toHaveCount(3)) and no existing chip
          is reordered or edited. Dark: variants per the AGENTS.md Hard NO. */}
      <section className="py-10 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Sibling trust surfaces
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              to="/agent-fleet"
              data-testid="how-we-ship-agent-fleet-chip"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              onClick={() => trackCTAClick('how_we_ship_agent_fleet_chip', 'how_we_ship')}
            >
              Agent fleet
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">Confirm the rhythm on a discovery call</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Forward this URL to your engineering lead first. When they are satisfied the cadence
            is real, book a 30-minute discovery call and we will walk through the tickets you
            would want us to pick up first.
          </p>
          <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors" onClick={() => trackCTAClick('how_we_ship_strategy_call', 'how_we_ship')}>
            <Phone size={18} />
            Book the Discovery Call
          </a>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default HowWeShip;
