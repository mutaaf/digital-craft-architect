import type { VercelRequest, VercelResponse } from '@vercel/node';
import { CLASS_SESSIONS, type ClassSession } from './_classSessions.js';

/**
 * Returns a downloadable .ics file for a class session — used by the
 * "Add to Calendar" component on /classes/<slug>. Apple Calendar, Outlook
 * desktop, and any RFC-5545-compatible client will import the file as a
 * single recurring event covering every Tuesday in the session run.
 *
 *   GET /api/class-calendar?slug=valley-ranch-summer-2026
 *
 * Cached aggressively at the edge — the session data only changes on
 * redeploy.
 */

export const config = { maxDuration: 5 };

function toUtcBasic(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function parseHM(s: string | undefined, fallback: number): number {
  if (!s) return fallback;
  const [h, m] = s.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return fallback;
  return h * 60 + m;
}

/** Fold a long iCal line at 75 octets per RFC 5545 §3.1. */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    const chunk = line.slice(i, i + (i === 0 ? 75 : 74));
    out.push(i === 0 ? chunk : ' ' + chunk);
    i += i === 0 ? 75 : 74;
  }
  return out.join('\r\n');
}

/** Escape per RFC 5545 §3.3.11: backslash, semicolon, comma, newline. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

function buildIcs(session: ClassSession, origin: string): string {
  const start = new Date(session.startDate);
  const startMin = parseHM(session.scheduleStartTime, 17 * 60 + 30);
  const endMin = parseHM(session.scheduleEndTime, 19 * 60 + 30);
  const durationMin = Math.max(30, endMin - startMin);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const until = toUtcBasic(new Date(session.endDate));
  const stamp = toUtcBasic(new Date());
  const uid = `dca-class-${session.slug}@digitalcraftai.com`;
  const url = `${origin}/classes/${session.slug}`;
  const description = `${session.social.ogDescription}\\n\\nFull details: ${url}`;

  // Lines must be \r\n separated; long lines folded to <=75 octets.
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Digital Craft//AI Classes//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toUtcBasic(start)}`,
    `DTEND:${toUtcBasic(end)}`,
    `RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=${until}`,
    `SUMMARY:${esc(session.shortName)}`,
    fold(`DESCRIPTION:${esc(description).replace(/\\\\n\\\\n/g, '\\n\\n')}`),
    fold(`LOCATION:${esc(`${session.location.venue}, ${session.location.city}, ${session.location.state}`)}`),
    fold(`URL:${url}`),
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${esc(session.shortName)} starts tomorrow — laptop + Claude Pro ready?`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const slug = (req.query.slug as string) || '';
  const session = CLASS_SESSIONS.find((s) => s.slug === slug);
  if (!session) {
    res.status(404).send('Class session not found');
    return;
  }
  const origin = `https://${req.headers.host || 'digitalcraftai.com'}`;
  const ics = buildIcs(session, origin);
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}.ics"`);
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(ics);
}
