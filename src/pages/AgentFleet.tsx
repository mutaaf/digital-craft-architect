import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Bot } from 'lucide-react';
import {
  AGENT_FLEET_ROWS,
  COLLECTION_PAGE_NAME,
  META_DESCRIPTION,
  PAGE_H1,
  PAGE_URL,
} from '@/data/agentFleet';

// Ticket 0090 - /agent-fleet AI-labor transparency page. Mirrors
// `src/pages/ModelCard.tsx` (ticket 0088) end-to-end: the direct
// structural peer for a trust-family public page backed by a
// `src/data/` typed constant emitting CollectionPage + BreadcrumbList
// JSON-LD.
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer greped every `tests/e2e/*.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and
// confirmed every predecessor is URL-scoped so a sibling
// `/agent-fleet`-scoped pair cannot collide. Predecessors:
// `/compare`, `/case-studies`, `/subprocessors`, `/security`,
// `/ai-for-hospitality`, `/blog`, `/model-card`. Grep result documented
// in the ticket's Implementation log.
//
// Per the 2026-05-25 mirror-source rule PAGE_H1, PAGE_URL,
// META_DESCRIPTION, and COLLECTION_PAGE_NAME are module-level constants
// read by the Helmet meta tag, the visible render, AND the JSON-LD
// blocks so the three surfaces cannot drift. The four strings live in
// `src/data/agentFleet.ts` so `tests/e2e/agent-fleet-page.spec.ts` can
// import them without pulling react-helmet-async into the Playwright
// test collector (which runs in Node ESM and cannot resolve the Helmet
// named export). The page re-imports them and uses them verbatim; the
// mirror-source rule is preserved because there is still exactly one
// source of truth.
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses
// hyphens; Self-Review greps the diff for U+2014 before pushing.

const ORIGIN = 'https://digitalcraftai.com';

// BreadcrumbList (Home -> Agent fleet). URL-scoped so it cannot collide
// with any predecessor BreadcrumbList block per the 2026-05-30
// second-@type lesson.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: PAGE_H1, item: PAGE_URL },
  ],
};

// CollectionPage whose mainEntity is an ItemList numbering the agent rows.
// Each ListItem.url is a fragment link back to the matching row card `id`
// so a schema graph walker resolves in-page. Per the 2026-05-25 mirror-
// source rule the `description` field reads from the same
// META_DESCRIPTION constant used by the Helmet meta tag.
const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: META_DESCRIPTION,
  url: PAGE_URL,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'DigitalCraft AI',
    url: ORIGIN,
  },
  mainEntity: {
    '@type': 'ItemList',
    numberOfItems: AGENT_FLEET_ROWS.length,
    itemListElement: AGENT_FLEET_ROWS.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${row.name} agent`,
      url: `${PAGE_URL}#${row.id}`,
    })),
  },
};

// Sibling trust-page cross-link strip (ticket 0088 pattern). Each chip
// carries dark: variants per the AGENTS.md dark-mode Hard NO.
const SIBLING_CHIPS: readonly { label: string; href: string }[] = [
  { label: 'How we ship', href: '/how-we-ship' },
  { label: 'Model card', href: '/model-card' },
  { label: 'Sub-processors', href: '/subprocessors' },
  { label: 'Security', href: '/security' },
  { label: 'Ethics', href: '/ethics' },
  { label: 'Uptime', href: '/uptime' },
  { label: 'Playbook', href: '/playbook' },
  { label: 'Trust', href: '/trust' },
];

const AgentFleet: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('agent_fleet_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Bot size={16} />
            AI-labor transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            One dated row per autonomous agent that runs on this codebase today.
            Each row names the agent, its role, the exact branch prefix it opens
            PRs under, its invocation cadence, and the guardrails that bound it.
            Forward the URL to your engineering lead, your compliance reviewer,
            or your insurance carrier as documentary evidence of the AI-labor
            inventory behind the ship velocity.
          </p>
        </div>
      </section>

      {/* Rows grid (single-column so a reviewer scans top to bottom) */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {AGENT_FLEET_ROWS.map((row) => (
              <article
                key={row.id}
                data-testid="agent-fleet-row"
                id={row.id}
                className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h2
                    data-testid="agent-fleet-name"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {row.name}
                  </h2>
                  <span
                    data-testid="agent-fleet-since"
                    className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                  >
                    {`Since ${row.sinceDate}`}
                  </span>
                </div>
                <div
                  data-testid="agent-fleet-role"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3"
                >
                  {row.role}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span
                    data-testid="agent-fleet-branch-prefix"
                    className="inline-flex items-center px-2.5 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs font-mono text-gray-800 dark:text-gray-200"
                  >
                    {row.branchPrefix}
                  </span>
                  <span
                    data-testid="agent-fleet-cadence"
                    className="inline-flex items-center px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-xs text-gray-700 dark:text-gray-300"
                  >
                    {row.cadence}
                  </span>
                </div>
                <p
                  data-testid="agent-fleet-intended-use"
                  className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
                >
                  {row.intendedUse}
                </p>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Guardrails
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {row.guardrails.map((guardrail) => (
                      <li key={guardrail} data-testid="agent-fleet-guardrail">
                        {guardrail}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            {"How this page is maintained: every change to `.claude/agents/` or to the AGENTS.md branch-prefix or Hard-NO sections triggers a review of the affected rows. A new agent file adds a row with its adoption date; an agent retirement removes the row. The page is reviewed at least quarterly regardless of shipped work."}
          </p>
        </div>
      </section>

      {/* Sibling trust surfaces strip */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Sibling trust surfaces
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SIBLING_CHIPS.map((chip) => (
              <Link
                key={chip.href}
                to={chip.href}
                data-testid={`agent-fleet-sibling-${chip.href.slice(1)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
                onClick={() => trackCTAClick(`agent_fleet_sibling_${chip.href.slice(1)}`, 'agent_fleet')}
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default AgentFleet;
