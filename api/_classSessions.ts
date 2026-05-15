/**
 * Class sessions data layer.
 *
 * ╔════════════════════════════════════════════════════════════════════╗
 * ║  HOW TO ADD A NEW CLASS / SESSION                                  ║
 * ╠════════════════════════════════════════════════════════════════════╣
 * ║  Open  api/_classes.json  and append a new object to the array,    ║
 * ║  matching the ClassSession shape declared below. That's it —       ║
 * ║  rebuild and:                                                      ║
 * ║                                                                    ║
 * ║    • /classes lists it on the hub                                  ║
 * ║    • /classes/<slug> renders the full landing page                 ║
 * ║    • /classes/<slug>/register renders the registration form        ║
 * ║    • /api/og-image?slug=<slug> generates a branded OG image        ║
 * ║    • /api/class-calendar?slug=<slug> serves a downloadable .ics    ║
 * ║    • sitemap.xml + crawler meta auto-update                        ║
 * ║                                                                    ║
 * ║  No React / TypeScript / page redesign needed.                     ║
 * ╚════════════════════════════════════════════════════════════════════╝
 *
 * This file is kept under /api/* so Vercel's serverless function bundler
 * can include it for /api/og, /api/og-html, /api/og-image, and
 * /api/class-calendar. src/data/classSessions.ts re-exports from here so
 * React pages keep importing from `@/data/classSessions`.
 */

// Node 22 ESM (Vercel's serverless runtime) requires explicit JSON import
// attributes. Vite/esbuild on the React side also honors this syntax.
import classesJson from './_classes.json' with { type: 'json' };

export interface TrackOption {
  key: string;
  price: string;
  name: string;
  sub: string;
  note: string;
  badge?: { label: string; tone: 'green' | 'gold' };
  formLabel: string;
  feature?: boolean;
  detail?: {
    bestFor: string;
    schedule: string;
    audience: string;
    includes: string[];
    whyThis: string;
  };
}

export interface CurriculumWeek {
  week: string;
  title: string;
  body: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ParticipantTrackChoice {
  label: string;
}

export interface SessionRequirement {
  icon: string;
  title: string;
  body: string;
  link?: { href: string; text: string };
}

export interface ClassSession {
  slug: string;
  shortName: string;
  title: string;
  titleHighlight: string;
  titleSecondLine?: string;
  eyebrow: string;
  heroSub: string;
  hubBlurb: string;
  audience: string;
  status: 'open' | 'waitlist' | 'closed';
  location: { venue: string; city: string; state: string; address?: string };
  dateLabel: string;
  seasonLabel: string;
  timeLabel: string;
  startDate: string;
  endDate: string;
  repeatFrequency?: string;
  byDay?: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  pillars: Array<{ icon: string; title: string; body: string }>;
  tracks: TrackOption[];
  curriculum: CurriculumWeek[];
  requirements: SessionRequirement[];
  faqs: FAQItem[];
  participantTracks: ParticipantTrackChoice[];
  enableSiblingDiscount: boolean;
  referralSources: string[];
  formspreeEndpoint: string;
  contact: { email: string; phone: string };
  social: {
    ogTitle: string;
    ogDescription: string;
    imageHeadline: string;
    imageSubhead: string;
    imageFooter: string;
  };
  accents?: { primary: string; secondary: string };
}

export const CANONICAL_ORIGIN = 'https://digitalcraftai.com';

/**
 * Source of truth for all class sessions — populated from api/_classes.json.
 * The cast is checked at runtime below for the few fields that matter most.
 */
export const CLASS_SESSIONS: ClassSession[] = (() => {
  const data = classesJson as unknown as ClassSession[];
  if (!Array.isArray(data)) {
    throw new Error('api/_classes.json must be a JSON array of class sessions');
  }
  data.forEach((s, i) => {
    if (!s || typeof s.slug !== 'string' || !s.slug) {
      throw new Error(`api/_classes.json[${i}] is missing required "slug"`);
    }
    if (!Array.isArray(s.tracks) || s.tracks.length === 0) {
      throw new Error(`api/_classes.json[${i}] (${s.slug}) needs at least one track`);
    }
  });
  return data;
})();

/** Look up a session by slug. */
export function getSessionBySlug(slug: string | undefined): ClassSession | undefined {
  if (!slug) return undefined;
  return CLASS_SESSIONS.find((s) => s.slug === slug);
}

/** First session whose startDate is in the future, or the most recent if none. */
export function getDefaultSession(now: Date = new Date()): ClassSession {
  const upcoming = CLASS_SESSIONS.filter(
    (s) => new Date(s.startDate).getTime() >= now.getTime(),
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  if (upcoming.length > 0) return upcoming[0];
  return CLASS_SESSIONS[CLASS_SESSIONS.length - 1];
}

/** Upcoming sessions (open/waitlist + startDate in the future), sorted by date. */
export function getUpcomingSessions(now: Date = new Date()): ClassSession[] {
  return CLASS_SESSIONS.filter(
    (s) => s.status !== 'closed' && new Date(s.endDate).getTime() >= now.getTime(),
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

/** Past sessions (endDate in the past), sorted newest-first. */
export function getPastSessions(now: Date = new Date()): ClassSession[] {
  return CLASS_SESSIONS.filter(
    (s) => new Date(s.endDate).getTime() < now.getTime(),
  ).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

/** All sessions, sorted earliest start-date first. */
export function getSessionsForHub(): ClassSession[] {
  return [...CLASS_SESSIONS].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
}
