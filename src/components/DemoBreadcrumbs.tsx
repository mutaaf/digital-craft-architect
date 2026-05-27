import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Ticket 0019 - reusable breadcrumb for any /{vertical}/demo or
// /{vertical}/demo/{slug} route. Reads useLocation(), splits the pathname,
// and renders a small visible breadcrumb plus a BreadcrumbList JSON-LD
// block built from the same crumb array (one source, no drift).

const ORIGIN = 'https://digitalcraftai.com';

// Display names for the 12 known verticals. Keep in sync with the route
// table in src/App.tsx; an unknown vertical falls back to a title-cased
// segment so the component still renders something sane.
const VERTICAL_NAMES: Record<string, string> = {
  construction: 'Construction',
  realestate: 'Real Estate',
  events: 'Events',
  homeservices: 'Home Services',
  healthcare: 'Healthcare',
  legal: 'Legal',
  restaurant: 'Restaurant',
  kidsplay: 'Kids Play',
  fitness: 'Fitness',
  dental: 'Dental',
  salon: 'Salon',
  autorepair: 'Auto Repair',
};

function titleCaseFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function verticalDisplayName(segment: string): string {
  return VERTICAL_NAMES[segment] ?? titleCaseFromSlug(segment);
}

type Crumb = {
  name: string;
  href: string;
};

function buildCrumbs(pathname: string): Crumb[] | null {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  const segments = trimmed.split('/').filter((s) => s.length > 0);

  // Expected shapes:
  //   ['vertical', 'demo']               -> 2 crumbs
  //   ['vertical', 'demo', 'slug']       -> 3 crumbs
  if (segments.length < 2 || segments.length > 3) return null;
  const [vertical, demo, slug] = segments;
  if (demo !== 'demo') return null;
  if (!vertical) return null;

  const crumbs: Crumb[] = [
    { name: verticalDisplayName(vertical), href: `/${vertical}` },
    { name: 'Demos', href: `/${vertical}/demo` },
  ];
  if (slug) {
    crumbs.push({
      name: titleCaseFromSlug(slug),
      href: `/${vertical}/demo/${slug}`,
    });
  }
  return crumbs;
}

function toSchema(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${ORIGIN}${c.href}`,
    })),
  };
}

const DemoBreadcrumbs = () => {
  const { pathname } = useLocation();
  const crumbs = buildCrumbs(pathname);
  if (!crumbs) return null;

  const schema = toSchema(crumbs);
  const lastIndex = crumbs.length - 1;

  return (
    <>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>
      <nav
        aria-label="Breadcrumb"
        className="max-w-6xl mx-auto w-full px-4 pt-4 sm:pt-5 text-xs sm:text-sm"
      >
        <ol className="flex flex-wrap items-center gap-1 text-gray-500 dark:text-gray-400">
          {crumbs.map((crumb, i) => {
            const isLast = i === lastIndex;
            return (
              <li key={crumb.href} data-breadcrumb-item className="inline-flex items-center gap-1">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="font-medium text-gray-700 dark:text-gray-200"
                  >
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
                {!isLast && (
                  <ChevronRight
                    aria-hidden="true"
                    className="size-3 text-gray-400 dark:text-gray-500"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default DemoBreadcrumbs;
