// Ticket 0117 - shared by /api/scene (GET serves, POST directs and publishes) and the CTO hero (CrewOfLight).
// The hero's story is data: a storyboard aurora-field's stage plays. This module holds what
// keeps it on-message and safe whoever writes the board (a person in Edge Config, the AI
// director, or the bundled default): the vertical -> trade map, the curated claims every
// caption must come from, the default "missed moment -> AI -> outcome" board, and the checks.
// Copy rules (AGENTS.md): no em-dash, conservative claims, no invented numbers.

export type Caption = { who?: string; did: string; metric?: { to: number; from?: number; prefix?: string; suffix?: string; ms?: number } };
export type TradeBeat = { trade: string; moment?: { text: string; at?: string; ms?: number }; ai?: { ms?: number; text?: string }; fill?: { from?: string; ms?: number }; caption?: Caption; hold?: number; draw?: { ms?: number } };
export type CrewBeat = { crew: string[] | true; builder?: boolean; caption?: Caption; hold?: number };
export type BuilderBeat = { builder: 'typing' | 'prompting' | 'agents'; prompt?: { text: string; code?: boolean; ms?: number }; agents?: string[]; caption?: Caption; hold?: number };
export type Storyboard = { version: 1; loop?: boolean; beats: Array<TradeBeat | CrewBeat | BuilderBeat> };

// /ai-for-<slug> pages and the hero's verticals, as aurora-field trades
export const TRADE_BY_VERTICAL: Record<string, string> = {
  construction: 'contractor', contractors: 'contractor', realestate: 'realtor', 'real-estate': 'realtor',
  plumbers: 'plumber', hvac: 'hvac', roofers: 'roofer', electricians: 'electrician', painters: 'painter',
  landscapers: 'landscaper', 'property-managers': 'manager', 'cleaning-services': 'cleaner', 'pest-control': 'pest',
  'pool-service': 'pool', 'restoration-services': 'restoration', 'moving-companies': 'mover', 'solar-installers': 'solar',
  'window-installers': 'window', 'garage-door-companies': 'garagedoor', 'tree-services': 'arborist',
  'fencing-contractors': 'fencer', 'concrete-contractors': 'concrete', hospitality: 'host',
};
export const TRADE_LABEL: Record<string, string> = {
  contractor: 'Contractor', realtor: 'Realtor', plumber: 'Plumber', hvac: 'HVAC tech', roofer: 'Roofer', electrician: 'Electrician',
  painter: 'Painter', landscaper: 'Landscaper', manager: 'Property manager', cleaner: 'Cleaning crew', pest: 'Pest control',
  pool: 'Pool service', restoration: 'Restoration', mover: 'Mover', solar: 'Solar installer', window: 'Window installer',
  garagedoor: 'Garage door tech', arborist: 'Tree service', fencer: 'Fence builder', concrete: 'Concrete finisher', host: 'Hospitality',
};

// The only outcomes a caption may state. Each mirrors something the site already claims (the
// CTO page's METRICS and OUTCOMES, the demos). Edge Config may add to this list; nobody, the
// AI director included, can caption a board with anything else.
export const CLAIMS: Record<string, Caption> = {
  'lead-response': { did: 'Lead response · under 60s' },
  'estimate-hour': { did: 'Estimate sent · under an hour' },
  'call-booked': { did: 'Call answered · job booked' },
  'after-hours': { did: 'After-hours call · answered and booked' },
  'review-request': { did: 'Review request · sent after the job' },
  'ops-hours': { did: 'Ops hours reclaimed · 20 hr/wk', metric: { to: 20, suffix: ' hr/wk', ms: 1100 } },
  'deal-analyzed': { did: 'Deal analyzed · comps and an offer' },
  'lead-qualified': { did: 'Lead qualified · follow-up booked' },
  'no-new-hires': { did: 'Scaled ops · zero new hires' },
  crew: { did: 'Your whole crew · on autopilot' },
  // the builder's beats: what DigitalCraft does, in the site's own words
  'builder-writes': { who: 'The builder', did: 'Custom AI systems · built end to end' },
  'builder-prompts': { who: 'The builder', did: 'Your workflow · handed to agents' },
  'agents-work': { who: 'The agents', did: 'On the job · around the clock' },
};

// What may appear on the builder's screen. A prompt reads like a promise, so it is curated like a
// claim: each mirrors one of the claims above. Edge Config may add to this list.
export const PROMPTS: string[] = [
  "agents.run('answer-calls', { after: '6pm' })",
  'answer every missed call and book the job',
  'send every estimate within the hour',
  'ask every happy customer for a review',
  'qualify every new lead and book a follow-up',
];

// which agent does the work behind each claim (aurora-field agent jobs)
const JOB_BY_CLAIM: Record<string, string> = {
  'lead-response': 'answer', 'call-booked': 'answer', 'after-hours': 'answer', 'estimate-hour': 'estimate', 'review-request': 'review',
  'deal-analyzed': 'analyze', 'lead-qualified': 'followup', 'ops-hours': 'schedule', 'no-new-hires': 'schedule',
};
const JOB_LABEL: Record<string, string> = { answer: 'Agent · answering', estimate: 'Agent · estimating', review: 'Agent · asking for reviews', analyze: 'Agent · analyzing', followup: 'Agent · following up', schedule: 'Agent · scheduling' };

// A trade's default beat: the moment it went wrong, and the claim that answers it
const MOMENT_BY_TRADE: Record<string, [string, string, string]> = {
  contractor: ['8:41 PM · new lead', 'prop', 'lead-response'],
  realtor: ['11:03 PM · new lead', 'hand', 'deal-analyzed'],
  plumber: ['Sat 7:12 AM · voicemail', 'prop', 'estimate-hour'],
  roofer: ['9:47 PM · missed call', 'hand', 'call-booked'],
  electrician: ['6:58 PM · missed call', 'hand', 'after-hours'],
  manager: ['Mon 8:00 AM · 14 tickets', 'prop', 'ops-hours'],
  hvac: ['2:16 AM · no heat', 'prop', 'after-hours'],
  painter: ['Sun 4:30 PM · quote request', 'prop', 'estimate-hour'],
  landscaper: ['7:05 AM · missed call', 'prop', 'call-booked'],
  cleaner: ['10:22 PM · booking request', 'prop', 'lead-response'],
  pest: ['9:13 PM · missed call', 'hand', 'after-hours'],
  pool: ['Sun 8:02 AM · new lead', 'prop', 'lead-qualified'],
  restoration: ['3:40 AM · water damage call', 'hand', 'after-hours'],
  mover: ['Fri 6:45 PM · quote request', 'prop', 'estimate-hour'],
  solar: ['Sat 1:20 PM · site question', 'prop', 'lead-qualified'],
  window: ['5:52 PM · quote request', 'prop', 'estimate-hour'],
  garagedoor: ['7:31 AM · door stuck', 'hand', 'after-hours'],
  arborist: ['Storm night · 6 calls', 'prop', 'call-booked'],
  fencer: ['Sun 11:10 AM · new lead', 'prop', 'lead-response'],
  concrete: ['4:48 PM · bid request', 'prop', 'estimate-hour'],
  host: ['9:58 PM · booking inquiry', 'hand', 'lead-response'],
};

export function jobForClaim(claim: string): string { return JOB_BY_CLAIM[claim] || 'answer'; }
export function beatFor(trade: string, claims: Record<string, Caption> = CLAIMS): TradeBeat {
  const [text, at, claim] = MOMENT_BY_TRADE[trade] || ['After hours · missed call', 'hand', 'lead-response'];
  return { trade, moment: { text, at }, ai: { text: JOB_LABEL[jobForClaim(claim)] }, caption: { who: TRADE_LABEL[trade] || trade, ...(claims[claim] || CLAIMS[claim]) } };
}

// The story opens with the person behind the AI: the builder writes the system, briefs his agents,
// and they step out to work. Trades follow; the finale puts him at his desk in front of the crew.
export function builderIntro(jobs: string[], prompt = PROMPTS[1]): BuilderBeat[] {
  return [
    { builder: 'typing', prompt: { text: PROMPTS[0], code: true }, caption: CLAIMS['builder-writes'], hold: 2400 },
    { builder: 'prompting', prompt: { text: prompt }, caption: CLAIMS['builder-prompts'], hold: 1800 },
    { builder: 'agents', agents: jobs.slice(0, 3), caption: CLAIMS['agents-work'], hold: 3200 },
  ];
}

export const DEFAULT_STORYBOARD: Storyboard = {
  version: 1,
  loop: true,
  beats: [
    ...builderIntro(['answer', 'estimate', 'analyze']),
    beatFor('roofer'),
    beatFor('plumber'),
    beatFor('realtor'),
    { crew: ['contractor', 'plumber', 'electrician', 'roofer', 'manager', 'realtor'], builder: true, caption: CLAIMS.crew, hold: 5000 },
  ],
};

export function tradeForVertical(v?: string | null): string | null {
  if (!v) return null;
  const k = String(v).toLowerCase().replace(/^\/?ai-for-/, '').replace(/[^a-z-]/g, '');
  return TRADE_BY_VERTICAL[k] || (Object.values(TRADE_BY_VERTICAL).includes(k) ? k : null);
}

// The visitor's own trade comes first after the builder's intro: moved up if the board has it,
// added (with its default beat) if not
export function personalize(board: Storyboard, trade: string | null): Storyboard {
  if (!trade) return board;
  const beats = board.beats.slice();
  const at = beats.findIndex((b) => 'trade' in b && b.trade === trade);
  const mine = at >= 0 ? beats.splice(at, 1)[0] : beatFor(trade);
  let intro = 0; while (intro < beats.length && 'builder' in beats[intro] && !('crew' in beats[intro])) intro++;
  beats.splice(intro, 0, mine);
  return { ...board, beats: beats.slice(0, 12) };
}

// House rules on top of aurora-field's validate(): no em-dash, and every caption is a known claim
export function houseText(v: string): string | null {
  return v.includes('—') ? 'no em-dash (AGENTS.md)' : null;
}
export function checkClaims(board: Storyboard, claims: Record<string, Caption> = CLAIMS, prompts: string[] = PROMPTS): string[] {
  const allowed = new Set(Object.values(claims).map((c) => c.did));
  const okPrompts = new Set(prompts);
  const errs: string[] = [];
  board.beats.forEach((b, i) => {
    if ('builder' in b && typeof b.builder === 'string' && b.prompt && !okPrompts.has(b.prompt.text)) errs.push(`beats[${i}].prompt.text: "${b.prompt.text}" is not an approved prompt`);
    if (b.caption && !allowed.has(b.caption.did)) errs.push(`beats[${i}].caption.did: "${b.caption.did}" is not an approved claim`);
    if (b.caption?.metric) {
      const ok = Object.values(claims).some((c) => c.did === b.caption!.did && c.metric && c.metric.to === b.caption!.metric!.to);
      if (!ok) errs.push(`beats[${i}].caption.metric: numbers come only from a claim`);
    }
  });
  return errs;
}
