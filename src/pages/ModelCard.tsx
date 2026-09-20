import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Cpu, ExternalLink } from 'lucide-react';
import { MODEL_CARD_ROWS } from '@/data/modelCard';

// Ticket 0088 - /model-card AI provenance page. Mirrors `src/pages/Security.tsx`
// (ticket 0081) end-to-end: the direct structural peer for a trust-family
// public page backed by a `src/data/` typed constant emitting CollectionPage
// + BreadcrumbList JSON-LD.
//
// Per the 2026-05-30 second-@type lesson, BEFORE writing this page the
// implementer greped every `tests/e2e/*-jsonld.spec.ts` for
// `=== 'CollectionPage'` and `=== 'BreadcrumbList'` predicates and confirmed
// every predecessor is URL-scoped so a sibling /model-card-scoped block
// cannot collide (predecessors: /compare, /case-studies, /subprocessors,
// /ai-for-hospitality, /blog, /security). Grep result documented in the
// ticket Implementation log.
//
// Per the 2026-05-25 mirror-source rule PAGE_H1, PAGE_URL, META_DESCRIPTION,
// and COLLECTION_PAGE_NAME are module-level constants read by the Helmet
// meta tag AND the JSON-LD blocks AND the visible render so the three
// surfaces cannot drift.
//
// Per the 2026-05-07 em-dash Hard NO every rendered string uses hyphens.

const META_DESCRIPTION =
  'Dated list of every third-party AI model Digital Craft calls in production. One row per vendor with model family, intended use on this site, known limitations, and the adoption date. Forward the URL to your compliance reviewer or insurance carrier.';

const PAGE_H1 = 'AI Model Card';
const PAGE_URL = 'https://digitalcraftai.com/model-card';
const ORIGIN = 'https://digitalcraftai.com';
const COLLECTION_PAGE_NAME = 'Digital Craft AI Model Card';

// BreadcrumbList (Home -> AI Model Card). URL-scoped so it cannot collide
// with any predecessor BreadcrumbList block per the 2026-05-30 second-@type
// lesson.
const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'AI Model Card', item: PAGE_URL },
  ],
};

// CollectionPage whose mainEntity is an ItemList numbering the model rows.
// Each ListItem.url is a fragment link back to the matching row card `id`
// so a schema graph walker resolves in-page. Per the 2026-05-25 mirror-
// source rule the `description` field reads from the same META_DESCRIPTION
// constant used by the Helmet meta tag.
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
    numberOfItems: MODEL_CARD_ROWS.length,
    itemListElement: MODEL_CARD_ROWS.map((row, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: `${row.vendor} ${row.modelFamily}`,
      url: `${PAGE_URL}#${row.id}`,
    })),
  },
};

// Sibling trust-page cross-link strip (ticket 0081 pattern). Each chip
// carries dark: variants per the AGENTS.md dark-mode Hard NO.
const SIBLING_CHIPS: readonly { label: string; href: string }[] = [
  { label: 'Trust', href: '/trust' },
  { label: 'Sub-processors', href: '/subprocessors' },
  { label: 'Security', href: '/security' },
  { label: 'Ethics', href: '/ethics' },
  { label: 'Uptime', href: '/uptime' },
  { label: 'Playbook', href: '/playbook' },
  { label: 'How we ship', href: '/how-we-ship' },
];

const ModelCard: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('model_card_view', 'page_mount');
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
            <Cpu size={16} />
            AI Model Card
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {PAGE_H1}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            One dated row per third-party AI model Digital Craft calls in production.
            Vendor, model family, intended use on this site, known limitations, and the
            date the model was adopted here. Forward the URL to your compliance reviewer
            or your insurance carrier as documentary evidence of the AI supply chain.
          </p>
        </div>
      </section>

      {/* Rows grid (single-column so a compliance reviewer scans top to bottom) */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-6">
            {MODEL_CARD_ROWS.map((row) => (
              <article
                key={row.id}
                data-testid="model-card-row"
                id={row.id}
                className="scroll-mt-28 flex flex-col rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60 p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    <span data-testid="model-card-vendor">{row.vendor}</span>
                    <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
                    <span data-testid="model-card-family">{row.modelFamily}</span>
                  </h2>
                  <span
                    data-testid="model-card-since"
                    className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                  >
                    {`Since ${row.sinceDate}`}
                  </span>
                </div>
                <p
                  data-testid="model-card-intended-use"
                  className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4"
                >
                  {row.intendedUse}
                </p>
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                    Limitations
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                    {row.limitations.map((limitation) => (
                      <li key={limitation} data-testid="model-card-limitation">
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
                {row.vendorPolicyUrl ? (
                  <a
                    href={row.vendorPolicyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="model-card-policy-link"
                    className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline"
                    onClick={() => trackCTAClick(`model_card_policy_${row.id}`, 'model_card')}
                  >
                    {`Vendor policy: ${row.vendor}`}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : null}
              </article>
            ))}
          </div>
          <p className="mt-10 text-sm text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center leading-relaxed">
            {"How this page is maintained: every ship that touches /api/ or the sub-processor list triggers a review of the affected model rows. A model literal swap in `api/*.ts` advances that row's since date; a model retirement removes the row. The page is reviewed at least quarterly regardless of shipped work."}
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
                data-testid={`model-card-sibling-${chip.href.slice(1)}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
                onClick={() => trackCTAClick(`model_card_sibling_${chip.href.slice(1)}`, 'model_card')}
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

export default ModelCard;
