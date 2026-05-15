import { ClassSession, CANONICAL_ORIGIN } from '@/data/classSessions';

/**
 * Helpers that turn a ClassSession into "add to calendar" links for every
 * major calendar provider. All time math runs in absolute UTC so a visitor
 * in Pacific or London gets the same correct event window as someone in the
 * venue's local timezone.
 *
 * Used by the AddToCalendar component on /classes/<slug> and inside the
 * post-registration success modal.
 */

/** Parse "HH:MM" into minutes since midnight, defaulting to a sane fallback. */
function parseHM(s: string | undefined, fallback: number): number {
  if (!s) return fallback;
  const [h, m] = s.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return fallback;
  return h * 60 + m;
}

/** "20260616T223000Z" — UTC basic format used by ICS + most calendar URLs. */
export function toUtcBasic(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

export interface SessionCalendarParams {
  startUtc: Date;
  endUtc: Date;
  /** UTC basic format date — "until" boundary for the RRULE. */
  untilUtcBasic: string;
  title: string;
  description: string;
  location: string;
  url: string;
}

/** Derive calendar params from a ClassSession. */
export function classSessionCalendarParams(session: ClassSession): SessionCalendarParams {
  const startUtc = new Date(session.startDate);
  const startMin = parseHM(session.scheduleStartTime, 17 * 60 + 30);
  const endMin = parseHM(session.scheduleEndTime, 19 * 60 + 30);
  const durationMin = Math.max(30, endMin - startMin);
  const endUtc = new Date(startUtc.getTime() + durationMin * 60_000);
  // UNTIL: end of the final session day. Use the session.endDate timestamp.
  const untilUtcBasic = toUtcBasic(new Date(session.endDate));
  return {
    startUtc,
    endUtc,
    untilUtcBasic,
    title: session.shortName,
    description: `${session.social.ogDescription}\n\nFull details: ${CANONICAL_ORIGIN}/classes/${session.slug}`,
    location: `${session.location.venue}, ${session.location.city}, ${session.location.state}`,
    url: `${CANONICAL_ORIGIN}/classes/${session.slug}`,
  };
}

export function googleCalendarUrl(session: ClassSession): string {
  const p = classSessionCalendarParams(session);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: p.title,
    dates: `${toUtcBasic(p.startUtc)}/${toUtcBasic(p.endUtc)}`,
    details: p.description,
    location: p.location,
    recur: `RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=${p.untilUtcBasic}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(session: ClassSession): string {
  // Outlook.com web doesn't support RRULE in the create URL — only one event.
  // We supply the first session; users can set recurrence after import,
  // or use the .ics download below which carries the full RRULE.
  const p = classSessionCalendarParams(session);
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    startdt: p.startUtc.toISOString(),
    enddt: p.endUtc.toISOString(),
    subject: p.title,
    body: p.description,
    location: p.location,
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

export function yahooCalendarUrl(session: ClassSession): string {
  const p = classSessionCalendarParams(session);
  // Yahoo expects duration as HHmm. 02 hours = "0200".
  const durMs = p.endUtc.getTime() - p.startUtc.getTime();
  const durMin = Math.round(durMs / 60_000);
  const durH = Math.floor(durMin / 60);
  const durM = durMin % 60;
  const duration = `${String(durH).padStart(2, '0')}${String(durM).padStart(2, '0')}`;
  const params = new URLSearchParams({
    v: '60',
    title: p.title,
    st: toUtcBasic(p.startUtc),
    dur: duration,
    desc: p.description,
    in_loc: p.location,
  });
  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/** Returns the URL to the server-rendered .ics download for Apple Calendar /
 *  Outlook desktop / any RFC-5545 client. */
export function icsDownloadUrl(session: ClassSession): string {
  return `${CANONICAL_ORIGIN}/api/class-calendar?slug=${encodeURIComponent(session.slug)}`;
}
