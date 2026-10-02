import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { FileText, ExternalLink } from 'lucide-react';
import {
  AGENT_PROMPTS,
  AGENT_PROMPTS_CAVEAT,
  AGENT_PROMPTS_GENERATED_AT,
  COLLECTION_PAGE_NAME,
  PAGE_H1,
  PAGE_URL,
  resolveAgentPromptGithubUrl,
} from '@/data/agentPrompts';
import { TRUST_PAGE_LABELS } from '@/data/trustPageLabels';
import { useRecordTrustPageVisit } from '@/hooks/useRecordTrustPageVisit';

// Ticket 0109 - /agent-prompts transparency page. Mirrors
// `src/pages/AgentFleet.tsx` (ticket 0090) end-to-end: the direct
// structural peer for a trust-family public page backed by a
// `src/data/` typed constant emitting CollectionPage + BreadcrumbList
// JSON-LD.
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer greped every `tests/e2e/*.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and
// confirmed every predecessor is URL-scoped so a sibling
// `/agent-prompts`-scoped pair cannot collide. Documented in the ticket
// Implementation log.
//
// Per the 2026-05-25 mirror-source rule, PAGE_H1, PAGE_URL,
// COLLECTION_PAGE_NAME, AGENT_PROMPTS_CAVEAT, and AGENT_PROMPTS_GENERATED_AT
// are module-level constants (emitted by scripts/generate-agent-prompts.ts)
// read by the Helmet meta tag, the visible render, AND the JSON-LD blocks
// so the three surfaces cannot drift. They live in `src/data/agentPrompts.ts`
// so `tests/e2e/agent-prompts-page.spec.ts` can import them without
// pulling react-helmet-async into the Playwright test collector.
//
// Per the 2026-05-07 em-dash Hard NO every string in this page uses
// hyphens; the excerpt body is a byte-identical quote of the committed
// `.claude/agents/*.md` file and is scoped out of the Hard NO per
// acceptance box 11 (quoting from version-controlled source material is
// not the same as the agent writing copy).

const ORIGIN = 'https://digitalcraftai.com';

// BreadcrumbList (Home -> Agent Prompts). URL-scoped so it cannot collide
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

// CollectionPage URL-scoped to /agent-prompts. Per the 2026-05-25
// mirror-source rule the `description` field reads from the same
// AGENT_PROMPTS_CAVEAT constant used by the Helmet meta tag AND the
// visible explainer paragraph, and `dateModified` reads from the same
// AGENT_PROMPTS_GENERATED_AT constant that drives the "Last reviewed"
// line.
const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: COLLECTION_PAGE_NAME,
  description: AGENT_PROMPTS_CAVEAT,
  url: PAGE_URL,
  dateModified: AGENT_PROMPTS_GENERATED_AT,
  inLanguage: 'en-US',
  isPartOf: {
    '@type': 'WebSite',
    name: 'DigitalCraft AI',
    url: ORIGIN,
  },
};

// Sibling trust-page cross-link strip (ticket 0090 pattern). Each chip
// carries dark: variants per the AGENTS.md dark-mode Hard NO.
const SIBLING_CHIPS: readonly { label: string; href: string }[] = [
  { label: 'Agent fleet', href: '/agent-fleet' },
  { label: 'Model card', href: '/model-card' },
  { label: 'How we ship', href: '/how-we-ship' },
  { label: 'Hallucination safeguards', href: '/hallucination-safeguards' },
  { label: 'Trust', href: '/trust' },
];

const AgentPrompts: React.FC = () => {
  const { content } = useContent();
  useRecordTrustPageVisit({
    path: '/agent-prompts',
    label: TRUST_PAGE_LABELS['/agent-prompts'],
  });
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('agent_prompts_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={AGENT_PROMPTS_CAVEAT} />
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
            <FileText size={16} />
            Agent instruction transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p
            data-testid="agent-prompts-last-reviewed"
            className="text-sm text-gray-500 dark:text-gray-400 mb-6"
          >
            {`Last reviewed: ${AGENT_PROMPTS_GENERATED_AT}`}
          </p>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed text-left">
            {AGENT_PROMPTS_CAVEAT}
          </p>
        </div>
      </section>

      {/* Per-agent rows (single-column so a reviewer scans top to bottom) */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {AGENT_PROMPTS.map((row) => (
              <article
                key={row.agentId}
                data-testid="agent-prompt-row"
                id={row.agentId}
                className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                  <h2
                    data-testid="agent-prompt-name"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {row.agentId}
                  </h2>
                  <span
                    data-testid="agent-prompt-role"
                    className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                  >
                    {row.role}
                  </span>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Prompt file path
                    </dt>
                    <dd
                      data-testid="agent-prompt-file-path"
                      className="font-mono text-xs text-gray-800 dark:text-gray-200 break-all"
                    >
                      {row.filePath}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Full-prompt char count
                    </dt>
                    <dd
                      data-testid="agent-prompt-char-count"
                      className="font-mono text-xs text-gray-800 dark:text-gray-200"
                    >
                      {row.fullCharCount}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
                      Last modified SHA
                    </dt>
                    <dd
                      data-testid="agent-prompt-sha"
                      className="font-mono text-xs text-gray-800 dark:text-gray-200"
                    >
                      {row.lastModifiedSha}
                    </dd>
                  </div>
                  <div className="flex items-end">
                    <a
                      href={resolveAgentPromptGithubUrl(row.agentId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid="agent-prompt-github-link"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      onClick={() =>
                        trackCTAClick(`agent_prompts_github_${row.agentId}`, 'agent_prompts')
                      }
                    >
                      View full prompt
                      <ExternalLink size={12} aria-hidden="true" />
                    </a>
                  </div>
                </dl>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Prompt excerpt (first 2000 characters)
                  </div>
                  <pre
                    data-testid="agent-prompt-excerpt"
                    className="whitespace-pre-wrap break-all rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-3 text-xs font-mono text-gray-800 dark:text-gray-200 max-h-96 overflow-y-auto"
                  >
                    {row.excerpt}
                  </pre>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            {"How this page is maintained: scripts/generate-agent-prompts.ts reads every .claude/agents/*.md file at build time and emits src/data/agentPrompts.ts. A new agent file adds a row with its last-modified SHA; a renamed or deleted agent file fails the build loudly rather than silently rendering a stale row. The page is reviewed at least quarterly regardless of shipped work."}
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
                data-testid={`agent-prompts-sibling-${chip.href.slice(1)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
                onClick={() =>
                  trackCTAClick(`agent_prompts_sibling_${chip.href.slice(1)}`, 'agent_prompts')
                }
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

export default AgentPrompts;
