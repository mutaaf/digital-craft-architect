/**
 * Class sessions data model — the single source of truth for in-person
 * teaching sessions Digital Craft runs (e.g. Valley Ranch Library AI
 * Classes). Every session declared here:
 *
 *   1. gets its own /classes/<slug> landing page and /classes/<slug>/register
 *      registration form (rendered by ClassSession.tsx / ClassRegistration.tsx),
 *   2. is listed on the /classes hub,
 *   3. is emitted into the sitemap by scripts/generate-sitemap.ts, and
 *   4. is served a per-session OG image (/api/og-image?slug=…) plus
 *      per-session social meta tags (/api/og + /api/og-html) when link
 *      previewers fetch /classes/<slug>.
 *
 * To add a new session: append a ClassSession to CLASS_SESSIONS below and
 * rebuild. No other file needs to change.
 *
 * Kept framework-agnostic (no React/JSX imports) so /api/* serverless
 * functions can import this module directly.
 */

export interface TrackOption {
  /** Stable key used in form values / analytics. */
  key: string;
  /** Display price (e.g. "$30"). */
  price: string;
  /** Track name (e.g. "Youth Drop-In"). */
  name: string;
  /** One-line subtitle (e.g. "Per session · Ages 10–18"). */
  sub: string;
  /** Long-form explanation shown on the landing page. */
  note: string;
  /** Optional badge (e.g. "Limited", "Best for Families"). */
  badge?: { label: string; tone: 'green' | 'gold' };
  /** Full label submitted to the form ("Youth Full Track — $200 / 8 sessions"). */
  formLabel: string;
  /** Whether this track spans the full width on landing/register grids. */
  feature?: boolean;
  /** Detail content shown in the interactive picker on the register page. */
  detail?: {
    /** "Best for" callout line. */
    bestFor: string;
    /** Schedule line ("Tuesdays 5:30–6:30 PM · 8 weeks"). */
    schedule: string;
    /** Audience age / experience descriptor. */
    audience: string;
    /** What's included in this track. */
    includes: string[];
    /** Why someone should pick this track. */
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
  /** URL slug — must be unique. */
  slug: string;
  /** Short event name shown on hub cards ("AI Classes — Valley Ranch Library"). */
  shortName: string;
  /** Full marketing title used on the landing page hero. */
  title: string;
  /** Italic-highlighted portion of the title (rendered in gold). */
  titleHighlight: string;
  /** Optional second line of the hero (e.g. "for kids, teens, and adults."). */
  titleSecondLine?: string;
  /** Eyebrow / kicker shown above the hero title. */
  eyebrow: string;
  /** One-paragraph hero subtitle. */
  heroSub: string;
  /** Short subtitle used on hub cards. */
  hubBlurb: string;
  /** Audience descriptor used on hub cards ("Youth (10–18) & Adults"). */
  audience: string;
  /** Status used to filter on the hub. */
  status: 'open' | 'waitlist' | 'closed';
  /** Location info. */
  location: {
    venue: string;
    city: string;
    state: string;
    /** Optional address line shown on the landing page. */
    address?: string;
  };
  /** Date string shown in chips ("June 16 – August 4, 2026"). */
  dateLabel: string;
  /** Short version for hub cards ("Summer 2026"). */
  seasonLabel: string;
  /** Time chip ("Tuesdays · 5:30–7:30 PM"). */
  timeLabel: string;
  /** ISO start date used for JSON-LD + filtering. */
  startDate: string;
  /** ISO end date used for JSON-LD. */
  endDate: string;
  /** schema.org repeatFrequency (e.g. "P1W"). */
  repeatFrequency?: string;
  /** schema.org byDay (e.g. "https://schema.org/Tuesday"). */
  byDay?: string;
  /** schema.org start/end time per session. */
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  /** Pillars / audience cards on the landing page. */
  pillars: Array<{ icon: string; title: string; body: string }>;
  /** Sortable list of tracks rendered on landing + register pages. */
  tracks: TrackOption[];
  /** Curriculum weeks shown on landing page. */
  curriculum: CurriculumWeek[];
  /** Requirements section. */
  requirements: SessionRequirement[];
  /** FAQ section. */
  faqs: FAQItem[];
  /** Choices for the per-participant track dropdown on the registration form. */
  participantTracks: ParticipantTrackChoice[];
  /** Whether the registration form should show the sibling-discount toggle. */
  enableSiblingDiscount: boolean;
  /** Referral sources offered on the registration form. */
  referralSources: string[];
  /** Formspree endpoint for this session's registration form. */
  formspreeEndpoint: string;
  /** Contact info shown at the bottom of every classes/register page. */
  contact: { email: string; phone: string };
  /** Social meta for /classes/<slug>. */
  social: {
    ogTitle: string;
    ogDescription: string;
    /** Headline shown on the dynamic OG image. */
    imageHeadline: string;
    /** Subhead line shown on the OG image (e.g. dates). */
    imageSubhead: string;
    /** Footer line on the OG image (e.g. location). */
    imageFooter: string;
  };
  /** Optional accent overrides (defaults to the gold/green palette). */
  accents?: { primary: string; secondary: string };
}

export const CANONICAL_ORIGIN = 'https://digitalcraftai.com';

export const CLASS_SESSIONS: ClassSession[] = [
  {
    slug: 'valley-ranch-summer-2026',
    shortName: 'AI Classes — Valley Ranch Library',
    title: 'Hands-on AI Classes',
    titleHighlight: 'AI Classes',
    titleSecondLine: 'for kids, teens, and adults.',
    eyebrow: 'Digital Craft · Valley Ranch Library · Summer 2026',
    heroSub:
      "Eight Tuesdays at Valley Ranch Library in Irving, TX. We teach the same AI tools that engineers, writers, and small-business owners use every day — starting from your very first prompt. Bring a laptop, leave with a new skill.",
    hubBlurb:
      'An eight-week, hands-on AI program for youth (ages 10–18) and adults. Drop-in or full-track. Family pricing available.',
    audience: 'Youth (10–18) & Adults',
    status: 'open',
    location: { venue: 'Valley Ranch Library', city: 'Irving', state: 'TX' },
    dateLabel: 'June 16 – August 4, 2026',
    seasonLabel: 'Summer 2026',
    timeLabel: 'Tuesdays · 5:30–7:30 PM',
    startDate: '2026-06-16T17:30:00-05:00',
    endDate: '2026-08-04T19:30:00-05:00',
    repeatFrequency: 'P1W',
    byDay: 'https://schema.org/Tuesday',
    scheduleStartTime: '17:30',
    scheduleEndTime: '19:30',
    pillars: [
      {
        icon: '🎒',
        title: 'Youth · Ages 10–18',
        body: '5:30–6:30 PM. AI for homework, creative writing, math, and first coding projects. We focus on doing the work with AI — not letting AI do it for you.',
      },
      {
        icon: '💼',
        title: 'Adults',
        body: '6:30–7:30 PM. AI for real work — email, writing, research, scheduling, light automation. Bring the tasks you actually want to offload.',
      },
      {
        icon: '👨‍👩‍👧',
        title: 'Families',
        body: 'The joint track covers both sessions and includes the 10% sibling discount. Learning the same thing as your kid is the fastest way to make it stick at home.',
      },
    ],
    tracks: [
      {
        key: 'youth-drop',
        price: '$30',
        name: 'Youth Drop-In',
        sub: 'Per session · Ages 10–18',
        note: 'Try a single Tuesday before committing to the full track.',
        formLabel: 'Youth Drop-In — $30/session',
        detail: {
          bestFor: 'Curious students testing the waters',
          schedule: 'Tuesdays 5:30–6:30 PM · Pay per session',
          audience: 'Ages 10–18 · No experience required',
          includes: [
            'One 60-minute session of your choice',
            'Live, in-person instruction with hands-on activities',
            'Take-home prompt sheet for that week',
            'Pay only for the weeks you attend',
          ],
          whyThis: "Perfect if you're not sure yet whether the full 8 weeks is right for you. Show up, try it, decide after.",
        },
      },
      {
        key: 'youth-full',
        price: '$200',
        name: 'Youth Full Track',
        sub: 'All 8 sessions · Ages 10–18',
        note: 'Best progression — every session builds on the last.',
        formLabel: 'Youth Full Track — $200 / 8 sessions',
        detail: {
          bestFor: 'Students serious about building real AI skills',
          schedule: 'Tuesdays 5:30–6:30 PM · 8 weeks · June 16 – August 4',
          audience: 'Ages 10–18 · No experience required',
          includes: [
            'All 8 sessions (60 min each)',
            'Weekly take-home exercises with feedback',
            'Capstone project + Week 8 showcase',
            'Certificate of completion',
            'Session recap notes if you miss a week',
          ],
          whyThis: "The curriculum is sequenced — Week 8 is only possible if you've done Weeks 1–7. Saves $40 vs. drop-in.",
        },
      },
      {
        key: 'youth-eb',
        price: '$175',
        name: 'Youth Early Bird',
        sub: 'All 8 sessions · Limited spots',
        badge: { label: 'Limited', tone: 'gold' },
        note: 'Save $25 when you commit early. First-come, first-served.',
        formLabel: 'Youth Early Bird — $175 / 8 sessions',
        detail: {
          bestFor: 'Families ready to commit before seats fill',
          schedule: 'Tuesdays 5:30–6:30 PM · 8 weeks · June 16 – August 4',
          audience: 'Ages 10–18 · No experience required',
          includes: [
            'Everything in the Full Track',
            '$25 off — paid in full at registration',
            'Priority seat selection if the class fills',
          ],
          whyThis: 'Same exact program as Full Track, $25 cheaper. Seats are limited and go in registration order — this price disappears when they fill.',
        },
      },
      {
        key: 'adult-drop',
        price: '$30',
        name: 'Adult Drop-In',
        sub: 'Per session',
        note: 'Sample the curriculum before deciding on a full track.',
        formLabel: 'Adult Drop-In — $30/session',
        detail: {
          bestFor: 'Professionals scoping the program before committing',
          schedule: 'Tuesdays 6:30–7:30 PM · Pay per session',
          audience: 'Adults · All experience levels welcome',
          includes: [
            'One 60-minute session of your choice',
            'Live, in-person instruction tailored to working professionals',
            'Take-home prompt sheet for that week',
            'Pay only for the weeks you attend',
          ],
          whyThis: "Good fit if your schedule is uncertain. Walk in, see if it's for you, register for the full track after if you want.",
        },
      },
      {
        key: 'adult-full',
        price: '$200',
        name: 'Adult Full Track',
        sub: 'All 8 sessions',
        note: 'Designed for working professionals — bring your real workflows.',
        formLabel: 'Adult Full Track — $200 / 8 sessions',
        detail: {
          bestFor: 'Working professionals who want AI fluency for real work',
          schedule: 'Tuesdays 6:30–7:30 PM · 8 weeks · June 16 – August 4',
          audience: 'Adults · All experience levels welcome',
          includes: [
            'All 8 sessions (60 min each)',
            'Weekly workflows you can apply to your job immediately',
            'Capstone: an AI workflow built for your real work',
            'Certificate of completion',
            'Session recap notes if you miss a week',
          ],
          whyThis: 'Each week we take real tasks (email, research, scheduling, documents) and rebuild them with AI. By Week 8 you have working systems, not just notes.',
        },
      },
      {
        key: 'adult-eb',
        price: '$175',
        name: 'Adult Early Bird',
        sub: 'All 8 sessions · Limited spots',
        badge: { label: 'Limited', tone: 'gold' },
        note: 'Same content as the full track, $25 off for early registrations.',
        formLabel: 'Adult Early Bird — $175 / 8 sessions',
        detail: {
          bestFor: 'Adults who know they want in — committing early',
          schedule: 'Tuesdays 6:30–7:30 PM · 8 weeks · June 16 – August 4',
          audience: 'Adults · All experience levels welcome',
          includes: [
            'Everything in the Full Track',
            '$25 off — paid in full at registration',
            'Priority seat selection if the class fills',
          ],
          whyThis: 'Identical program to Full Track, $25 cheaper. Capped at a fixed number of seats — this price ends when those are claimed.',
        },
      },
      {
        key: 'joint',
        price: '$300',
        name: 'Joint Track',
        sub: 'Both sessions · 8 weeks',
        badge: { label: 'Best for Families', tone: 'green' },
        note: 'Parent and child learn side-by-side. Includes the 10% sibling discount when applicable.',
        formLabel: 'Joint Track (Youth + Adult) — $300 / 8 sessions',
        feature: true,
        detail: {
          bestFor: 'Parent + child learning AI together',
          schedule: 'Tuesdays 5:30–7:30 PM (back-to-back) · 8 weeks',
          audience: 'One youth (10–18) + one adult, from the same family',
          includes: [
            'All 8 weeks of BOTH the youth and adult sessions',
            'Two seats — one in each hour',
            'Shared family take-home challenge each week',
            '10% sibling discount applied automatically if you add a second youth',
            'Two certificates of completion',
          ],
          whyThis: "The fastest way to make AI stick at home — when both generations speak the same language about it, kids actually use what they learn. Saves $100 vs. buying both Full Tracks separately.",
        },
      },
    ],
    curriculum: [
      { week: 'Week 1', title: 'Meet Your AI', body: "Set up Claude Pro on your laptop. Learn what AI actually does — and what it can't. First prompt, first project." },
      { week: 'Week 2', title: 'Prompt Engineering Foundations', body: 'How to ask AI for what you actually want. Specificity, structure, and the four prompts every student should know by heart.' },
      { week: 'Week 3', title: 'Writing & Research with AI', body: 'Outline, draft, and revise with Claude. Source-checking, citations, and how to keep your own voice in the work.' },
      { week: 'Week 4', title: 'AI for Math & Code', body: 'Solve problems, debug code, and learn to read what AI gives you back. Project: build your first mini script.' },
      { week: 'Week 5', title: 'Personalized Learning Plans', body: "Use AI as a tutor — for a class you're taking now or a skill you've always wanted. Build a 30-day plan with Claude." },
      { week: 'Week 6', title: 'Automating the Boring Stuff', body: 'Email drafts, summaries, scheduling, meeting notes. Adult track focuses on workflows; youth track on homework + creative projects.' },
      { week: 'Week 7', title: 'AI Safety, Bias & Citizenship', body: "When AI is wrong. When it's biased. When you should not trust it. Conversation, not just lecture." },
      { week: 'Week 8', title: 'Showcase & Capstone', body: 'Present what you built. Families and friends invited. Certificate of completion for full-track students.' },
    ],
    requirements: [
      {
        icon: '💻',
        title: 'Your own laptop',
        body: "Any Mac, Windows, or Chromebook with a current browser. Tablets and phones aren't enough for the coursework — you'll be writing, coding, and switching windows throughout the session.",
      },
      {
        icon: '🤖',
        title: 'Claude Pro subscription',
        body: '$20/month, cancel anytime. Sign up before Week 1. This is the AI tool we teach throughout the course.',
        link: { href: 'https://claude.ai', text: 'claude.ai' },
      },
    ],
    faqs: [
      { q: 'Who is this class for?', a: 'Two tracks run back-to-back every Tuesday. The youth track (ages 10–18) meets from 5:30 to 6:30 PM. The adult track meets from 6:30 to 7:30 PM. Joint families learn together across both hours.' },
      { q: 'Do I need to know anything about AI to start?', a: "No. The curriculum starts at zero — opening Claude for the first time, writing your first prompt. By Week 8 you'll be using AI fluently for real work." },
      { q: 'What do I need to bring?', a: "A personal laptop (tablets and phones won't work for the coursework) and an active Claude Pro subscription ($20/month, cancel anytime). Both are required for every session." },
      { q: 'Why Claude Pro specifically?', a: "Claude is the AI tool we teach throughout the course — it's what every assignment, project, and live demo uses. The Pro subscription gives you the same model and tools we use in class. You can cancel after the course ends." },
      { q: 'What if I miss a session?', a: "Full-track students get session recap notes and the week's exercises by email. We do not refund missed sessions, but you can make up work asynchronously." },
      { q: 'Is there a sibling discount?', a: 'Yes — 10% off when two or more siblings register together. The discount is applied automatically when you select the sibling option on the registration form.' },
      { q: 'Are refunds available?', a: 'Drop-in registrations are charged per session. Full-track and early-bird registrations are paid in full at signup. All sales are final after the first session.' },
    ],
    participantTracks: [
      { label: 'Youth (Ages 10–18) · 5:30–6:30 PM' },
      { label: 'Adult · 6:30–7:30 PM' },
      { label: 'Joint (Both Sessions)' },
    ],
    enableSiblingDiscount: true,
    referralSources: [
      'Valley Ranch Library',
      'Social Media (Instagram / Facebook)',
      'Friend or Family Referral',
      'Nextdoor / Community Group',
      'Email Newsletter',
      'Flyer',
      'Google Search',
      'Other',
    ],
    formspreeEndpoint: 'https://formspree.io/f/mojrgdad',
    contact: { email: 'mutaaf@digitalcraftai.com', phone: '(972) 900-0292' },
    social: {
      ogTitle: 'AI Classes at Valley Ranch Library — Summer 2026',
      ogDescription:
        'Eight-week hands-on AI program for youth (ages 10–18) and adults. Tuesdays, June 16 – August 4, 2026 at Valley Ranch Library, Irving TX.',
      imageHeadline: 'AI Classes',
      imageSubhead: 'Valley Ranch Library · Summer 2026',
      imageFooter: 'Tue · Jun 16 – Aug 4 · Irving, TX',
    },
  },
];

/** Look up a session by slug. */
export function getSessionBySlug(slug: string | undefined): ClassSession | undefined {
  if (!slug) return undefined;
  return CLASS_SESSIONS.find((s) => s.slug === slug);
}

/** First session whose startDate is in the future, or the most recent if none. */
export function getDefaultSession(now: Date = new Date()): ClassSession {
  const upcoming = CLASS_SESSIONS
    .filter((s) => new Date(s.startDate).getTime() >= now.getTime())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  if (upcoming.length > 0) return upcoming[0];
  return CLASS_SESSIONS[CLASS_SESSIONS.length - 1];
}

/** Sessions sorted newest start-date first, for the hub list. */
export function getSessionsForHub(): ClassSession[] {
  return [...CLASS_SESSIONS].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
}
