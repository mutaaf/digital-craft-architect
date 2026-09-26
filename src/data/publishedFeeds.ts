// Ticket 0098 - canonical source of truth for the /feeds.opml OPML 2.0
// subscription index. `scripts/generate-feeds-opml.ts` reads this array
// verbatim and emits one <outline> per entry, in this exact order. The
// e2e spec (tests/e2e/feeds-opml-subscription-index.spec.ts) also imports
// this constant per the 2026-06-07 mirror-source-across-src-tests lesson,
// so a future feed addition lands in exactly one place.
//
// Per the 2026-09-12 code-beats-prose lesson, the actual shipped feeds
// were verified at branch head against the emitting generator scripts
// AND against `public/`. The ticket prose named `/blog/rss.xml`; the
// shipped blog generator (`scripts/generate-rss.ts`) writes to
// `public/rss.xml`, so the canonical URL is `/rss.xml`. Deviation
// recorded in the ticket 0098 Implementation log.
//
// No em-dash characters (2026-05-07 Hard NO); every title is hyphen-only.

export interface PublishedFeed {
  /** Stable identifier, also used as the React list key if ever rendered. */
  id: string;
  /** Human-readable feed title surfaced in feed readers on import. */
  title: string;
  /** Absolute URL to the feed document itself (RSS XML or JSON Feed). */
  xmlUrl: string;
  /** Absolute URL to the feed's canonical HTML companion page. */
  htmlUrl: string;
  /** Feed format; either RSS 2.0 XML or JSON Feed 1.1. */
  type: 'rss' | 'json';
}

const BASE = 'https://digitalcraftai.com';

export const PUBLISHED_FEEDS: readonly PublishedFeed[] = [
  {
    id: 'blog-rss',
    title: 'Digital Craft AI Blog',
    xmlUrl: `${BASE}/rss.xml`,
    htmlUrl: `${BASE}/blog`,
    type: 'rss',
  },
  {
    id: 'changelog-rss',
    title: 'Digital Craft AI Changelog',
    xmlUrl: `${BASE}/changelog/rss.xml`,
    htmlUrl: `${BASE}/changelog`,
    type: 'rss',
  },
  {
    id: 'changelog-json',
    title: 'Digital Craft AI Changelog (JSON Feed)',
    xmlUrl: `${BASE}/changelog.json`,
    htmlUrl: `${BASE}/changelog`,
    type: 'json',
  },
  {
    id: 'case-studies-rss',
    title: 'Digital Craft AI Case Studies',
    xmlUrl: `${BASE}/case-studies/rss.xml`,
    htmlUrl: `${BASE}/case-studies`,
    type: 'rss',
  },
  {
    id: 'compare-json',
    title: 'Digital Craft AI Comparisons (JSON Feed)',
    xmlUrl: `${BASE}/compare.json`,
    htmlUrl: `${BASE}/compare`,
    type: 'json',
  },
];
