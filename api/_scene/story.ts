// Ticket 0119 - the story around the stage: chapters, a narrator, and timing. aurora-field plays
// the beats; this turns any valid board (the bundled default, Edge Config, the AI director) into
// the words and the rail the heroes show beside it. Nothing here is free text from a board: the
// narrator's lines are written here, keyed by what a beat is (its trade, its moment, its claim),
// so a board can't make the site say something new. Copy rules (AGENTS.md): no em-dash, no
// numbers that aren't in a claim.
import { CLAIMS, TRADE_LABEL, jobForClaim, type BuilderBeat, type Caption, type CrewBeat, type Storyboard, type TradeBeat } from './board';

export type Beat = Storyboard['beats'][number];
export type Voice = 'cto' | 'root';
export type ChapterId = 'miss' | 'build' | 'catch' | 'crew';
export type Chapter = { id: ChapterId; label: string; first: number; last: number };
export type Phase = 'draw' | 'moment' | 'missed' | 'ai' | 'fill' | 'caption' | 'crew' | 'hold' | 'typing' | 'prompting' | 'agents';

const isTrade = (b: Beat): b is TradeBeat => 'trade' in b;
const isCrew = (b: Beat): b is CrewBeat => 'crew' in b;
const isBuilder = (b: Beat): b is BuilderBeat => 'builder' in b && !('crew' in b);

const LABELS: Record<Voice, Record<ChapterId, string>> = {
  cto: { miss: 'The miss', build: 'The build', catch: 'The catch', crew: 'The crew' },
  root: { miss: 'The miss', build: 'The system', catch: 'The catch', crew: 'Your crew' },
};

export function chapterOf(b: Beat): ChapterId {
  if (isTrade(b)) return b.missed ? 'miss' : 'catch';
  if (isCrew(b)) return 'crew';
  return 'build';
}

// consecutive beats of one kind make a chapter; a board without a miss simply has three
export function chapters(board: Storyboard, voice: Voice = 'cto'): Chapter[] {
  const out: Chapter[] = [];
  board.beats.forEach((b, i) => {
    const id = chapterOf(b), last = out[out.length - 1];
    if (last && last.id === id) last.last = i;
    else out.push({ id, label: LABELS[voice][id], first: i, last: i });
  });
  return out;
}

// roughly how long aurora-field's stage spends on a beat (its own defaults), for the rail's progress
export function beatMs(b: Beat): number {
  if (isCrew(b)) return (b.hold || 4500) + 1400;
  if (isBuilder(b)) {
    const typed = b.prompt ? b.prompt.text.length * 38 : 0, hold = b.hold || 3200;
    if (b.builder === 'typing') return 3600 + Math.max(typed + 900, 1100 + hold);
    if (b.builder === 'prompting') return typed + 76 + 500 + 900 + hold;
    return 1500 + hold;
  }
  const draw = (b.draw && b.draw.ms) || 3200, moment = b.moment ? b.moment.ms || 1400 : 0;
  if (b.missed) return draw + moment + 500 + (b.missed.ms || 1800) + (b.hold || 2400);
  return draw + moment + ((b.ai && b.ai.ms) || 900) + ((b.fill && b.fill.ms) || 1100) + (b.hold || 3600);
}

// ---- the narrator ----
// "a roofer", "an HVAC tech": acronyms keep their capitals and take the article they're said with
const lower = (label: string) => label.split(' ').map((w) => (w.length > 1 && w === w.toUpperCase() ? w : w.toLowerCase())).join(' ');
const A = (label: string) => (/^([aeiou]|HVAC)/i.test(label) ? 'an ' : 'a ') + lower(label);
// the narrator talks about people: "a pool tech", not "a pool service"
const PERSON: Record<string, string> = { pool: 'pool tech', pest: 'pest control tech', restoration: 'restoration crew', arborist: 'tree crew', host: 'host', solar: 'solar installer' };
function tradeName(t: TradeBeat['trade']): string {
  return typeof t === 'string' ? PERSON[t] || TRADE_LABEL[t] || t : 'business owner';
}
// "9:47 PM · missed call" -> the time, and what kind of moment it is
function readMoment(text = ''): { when: string; kind: 'call' | 'lead' | 'quote' | 'queue' | 'urgent' | 'other' } {
  const [when = '', what = ''] = text.split('·').map((x) => x.trim());
  const w = what.toLowerCase();
  const kind = /call|voicemail/.test(w) && !/water|heat|stuck/.test(w) ? 'call'
    : /lead|inquiry|booking/.test(w) ? 'lead'
    : /quote|bid|estimate|question/.test(w) ? 'quote'
    : /ticket/.test(w) ? 'queue'
    : /heat|water|stuck|storm/.test(w) ? 'urgent' : 'other';
  return { when: /\d|night|sat|sun|mon|fri/i.test(when) ? when : '', kind };
}
// "Same night." for 9:47 PM, "Same morning." for Sat 7:12 AM
function partOfDay(when: string): string {
  const t = /(\d{1,2}):\d{2}\s*(AM|PM)/i.exec(when);
  if (!t) return /night|storm/i.test(when) ? 'night' : 'moment';
  const h = (+t[1] % 12) + (t[2].toUpperCase() === 'PM' ? 12 : 0);
  return h < 5 || h >= 18 ? 'night' : h < 12 ? 'morning' : 'afternoon';
}
const RINGS: Record<string, [string, string]> = {   // [first time, the second time round]
  call: ['The phone rings.', 'The phone rings again.'],
  lead: ['A new lead comes in.', 'The lead comes in again.'],
  quote: ['Someone asks for a quote.', 'The same request comes in.'],
  queue: ['The week starts behind.', 'Monday comes around again.'],
  urgent: ['Somebody needs help, now.', 'The same emergency.'],
  other: ['Something needs an answer.', 'The same moment.'],
};
// keyed by the loss's claim id
const LOST: Record<string, string> = {
  'missed-call': 'Nobody picks up. The job goes to whoever does.',
  'missed-lead': 'Nobody writes back. The lead goes cold.',
  'missed-estimate': 'The quote waits for Monday. The customer doesn\'t.',
  'missed-deal': 'The numbers wait for the weekend. Another buyer moves first.',
  'missed-ops': 'The owner spends the day on admin instead of the work.',
};
// keyed by the outcome's claim id, then by the agent's job
const CATCH: Record<string, string> = {
  'call-booked': 'This time, an agent picks up.', 'after-hours': 'This time, an agent picks up.',
  'lead-response': 'This time, an agent replies right away.', 'lead-qualified': 'This time, an agent qualifies the lead.',
  'estimate-hour': 'This time, an agent writes the estimate.', 'deal-analyzed': 'This time, an agent runs the numbers.',
  'ops-hours': 'This time, an agent works the queue.', 'no-new-hires': 'This time, an agent works the queue.',
  'review-request': 'This time, an agent asks for the review.',
  answer: 'This time, an agent picks up.', estimate: 'This time, an agent writes the estimate.', followup: 'This time, an agent follows up.',
  analyze: 'This time, an agent runs the numbers.', schedule: 'This time, an agent works the queue.', review: 'This time, an agent asks for the review.',
};
// keyed by claim id, so only an approved outcome gets a line
const OUTCOME: Record<string, string> = {
  'call-booked': 'Booked before the ladder comes down.',
  'after-hours': 'Answered after hours. On the calendar by morning.',
  'lead-response': 'Answered in under a minute, while the lead is still warm.',
  'estimate-hour': 'The estimate is out within the hour.',
  'review-request': 'The review request goes out the day the job is done.',
  'ops-hours': 'Twenty hours a week, back to the owner.',
  'deal-analyzed': 'Comps pulled. Offer drafted. Ready to send.',
  'lead-qualified': 'Qualified, with the follow-up already booked.',
  'no-new-hires': 'More work handled, and nobody new on payroll.',
};
const BUILD: Record<Voice, Record<BuilderBeat['builder'], string>> = {
  cto: { typing: 'So I build the system around how you already work.', prompting: 'Then I brief the agents, in plain English.', agents: 'They clock in. They never clock out.' },
  root: { typing: 'So we build the system around how you already work.', prompting: 'Then we brief the agents, in plain English.', agents: 'They clock in. They never clock out.' },
};
const FINALE: Record<Voice, string> = {
  cto: 'Every trade. One builder. A crew of agents that never sleeps.',
  root: 'Every trade on your team, with agents that never sleep.',
};

function claimIdOf(c: Caption | undefined, claims: Record<string, Caption>): string | null {
  if (!c) return null;
  for (const [k, v] of Object.entries(claims)) if (v.did === c.did) return k;
  return null;
}
export function claimOf(b: Beat, claims: Record<string, Caption> = CLAIMS): string | null { return claimIdOf(b.caption, claims); }

// What the narrator says during a beat's phase. `board` gives context: the beat that repeats the
// miss says "this time", and a trade's first appearance is introduced.
export function narrate(board: Storyboard, index: number, phase: Phase | string, voice: Voice = 'cto', claims: Record<string, Caption> = CLAIMS): string {
  const b = board.beats[index];
  if (!b) return '';
  if (isCrew(b)) return FINALE[voice];
  if (isBuilder(b)) return BUILD[voice][b.builder] || '';
  const name = tradeName(b.trade), m = readMoment(b.moment?.text), claim = claimOf(b, claims) || '', job = jobForClaim(claim || 'lead-response');
  const missedBefore = board.beats.slice(0, index).some((x) => isTrade(x) && x.missed && JSON.stringify(x.trade) === JSON.stringify(b.trade));
  const firstCatch = board.beats.findIndex((x) => isTrade(x) && !x.missed) === index;
  if (b.missed) {
    if (phase === 'draw') return `Meet ${A(name)}. Great at the work.`;
    if (phase === 'moment') return [m.when, RINGS[m.kind][0]].filter(Boolean).join('. ');
    return LOST[claim] || (m.kind === 'lead' ? LOST['missed-lead'] : LOST['missed-call']);
  }
  if (phase === 'draw') return missedBefore ? `Same ${lower(name)}. Same ${partOfDay(m.when)}.` : firstCatch ? `${A(name).replace(/^a/, 'A')}.` : `Next, ${A(name)}.`;
  if (phase === 'moment') return [m.when, RINGS[m.kind][missedBefore ? 1 : 0]].filter(Boolean).join('. ');
  if (phase === 'ai') return CATCH[claim] || CATCH[job] || CATCH.answer;
  return OUTCOME[claim] || CATCH[claim] || CATCH[job] || '';
}

// The whole story as text, one line per beat: the transcript screen readers get, and the
// reduced-motion fallback's reading.
export function transcript(board: Storyboard, voice: Voice = 'cto', claims: Record<string, Caption> = CLAIMS): string[] {
  return board.beats.map((b, i) => {
    if (!isTrade(b)) return narrate(board, i, isCrew(b) ? 'crew' : (b as BuilderBeat).builder, voice, claims);
    const lines = b.missed ? ['draw', 'moment', 'missed'] : ['draw', 'moment', 'ai', 'caption'];
    return lines.map((p) => narrate(board, i, p, voice, claims)).filter((x, k, all) => x && all.indexOf(x) === k).join(' ');
  });
}
