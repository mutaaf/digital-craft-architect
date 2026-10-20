// Tickets 0117-0119 - shared by /api/scene (GET serves, POST directs and publishes) and the heroes (CrewOfLight).
// The hero's story is data: a storyboard aurora-field's stage plays. This module holds what
// keeps it on-message and safe whoever writes the board (a person in Edge Config, the AI
// director, or the bundled default): the vertical -> trade map, the curated claims every
// caption must come from, the default "missed moment -> AI -> outcome" board, and the checks.
// Copy rules (AGENTS.md): no em-dash, conservative claims, no invented numbers.

export type Caption = { who?: string; did: string; metric?: { to: number; from?: number; prefix?: string; suffix?: string; ms?: number } };
export type TradeBeat = { trade: string; moment?: { text: string; then?: string; at?: string; ms?: number }; ai?: { ms?: number; text?: string }; fill?: { from?: string; ms?: number }; missed?: { text?: string; ms?: number }; caption?: Caption; hold?: number; draw?: { ms?: number } };
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
  // the "before" (ticket 0119): what slips when nobody is there. No numbers, nothing a visitor could check and doubt.
  'missed-call': { did: 'Missed call · the job went elsewhere' },
  'missed-lead': { did: 'Lead went cold · nobody wrote back' },
  'missed-estimate': { did: 'Estimate waited · the bid was lost' },
  'missed-deal': { did: 'Deal sat · another buyer moved first' },
  'missed-ops': { did: 'Owner buried in admin · jobs waiting' },
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
// what slips when nobody is there, by the outcome that would have caught it: the moment's new text, and the claim it captions
const CALL: [string, string] = ['No answer · went to voicemail', 'missed-call'], LEAD: [string, string] = ['No reply · the lead went cold', 'missed-lead'];
const MISSED_BY_CLAIM: Record<string, [string, string]> = {
  'call-booked': CALL, 'after-hours': CALL, 'lead-response': LEAD, 'lead-qualified': LEAD, 'review-request': LEAD,
  'estimate-hour': ['No estimate · they hired someone else', 'missed-estimate'], 'deal-analyzed': ['No comps · the offer went elsewhere', 'missed-deal'],
  'ops-hours': ['Nobody on it · the queue grows', 'missed-ops'], 'no-new-hires': ['Nobody on it · the queue grows', 'missed-ops'],
};
// what the moment becomes once the agent has it: the same time, handled (aurora-field moment.then)
const HANDLED_BY_JOB: Record<string, string> = { answer: 'answered', estimate: 'estimate sent', review: 'review requested', analyze: 'comps pulled', followup: 'followed up', schedule: 'on the schedule' };
export function handled(text: string, job: string): string {
  return (text.split(' · ')[0] + ' · ' + (HANDLED_BY_JOB[job] || HANDLED_BY_JOB.answer)).slice(0, 48);
}
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
export function claimForTrade(trade: string): string { return (MOMENT_BY_TRADE[trade] || [])[2] || 'lead-response'; }
export function jobLabel(job: string): string { return JOB_LABEL[job] || JOB_LABEL.answer; }
export function beatFor(trade: string, claims: Record<string, Caption> = CLAIMS): TradeBeat {
  const [text, at, claim] = MOMENT_BY_TRADE[trade] || ['After hours · missed call', 'hand', 'lead-response'];
  const job = jobForClaim(claim);
  return { trade, moment: { text, then: handled(text, job), at }, ai: { text: JOB_LABEL[job] }, caption: { who: TRADE_LABEL[trade] || trade, ...(claims[claim] || CLAIMS[claim]) } };
}

// The same moment, before: nobody comes, the pen takes the drawing back, and the loss is captioned
// (any caught beat: a trade's default, or one the AI director wrote for a custom figure)
export function missOf(caught: TradeBeat, claim: string, claims: Record<string, Caption> = CLAIMS): TradeBeat {
  const [text, lost] = MISSED_BY_CLAIM[claim] || CALL;
  const moment = caught.moment && { text: caught.moment.text, ...(caught.moment.at ? { at: caught.moment.at } : {}) };   // never handled
  return { trade: caught.trade, ...(moment ? { moment } : {}), missed: { text }, caption: { who: caught.caption?.who, ...(claims[lost] || CLAIMS[lost]) }, hold: 2200 };
}
export function missedBeatFor(trade: string, claims: Record<string, Caption> = CLAIMS): TradeBeat {
  return missOf(beatFor(trade, claims), claimForTrade(trade), claims);
}

// the prompt the builder types answers the miss the story opened with
const PROMPT_BY_CLAIM: Record<string, string> = { 'estimate-hour': PROMPTS[2], 'review-request': PROMPTS[3], 'lead-qualified': PROMPTS[4], 'lead-response': PROMPTS[4], 'deal-analyzed': PROMPTS[4] };
export function promptForClaim(claim: string): string { return PROMPT_BY_CLAIM[claim] || PROMPTS[1]; }
export function promptForTrade(trade: string): string { return promptForClaim(claimForTrade(trade)); }

// Then the person behind the AI: the builder writes the system, briefs his agents, and they step
// out to work. `who` lets the company site say "DigitalCraft" where the CTO site says "The builder".
export function builderIntro(jobs: string[], prompt = PROMPTS[1], who?: string): BuilderBeat[] {
  const by = (c: Caption) => (who && c.who === 'The builder' ? { ...c, who } : c);
  return [
    { builder: 'typing', prompt: { text: PROMPTS[0], code: true }, caption: by(CLAIMS['builder-writes']), hold: 2200 },
    { builder: 'prompting', prompt: { text: prompt }, caption: by(CLAIMS['builder-prompts']), hold: 1600 },
    { builder: 'agents', agents: jobs.slice(0, 3), caption: CLAIMS['agents-work'], hold: 3000 },
  ];
}

// The story's shape (ticket 0119), four acts in at most 12 beats:
//   the miss   one trade's moment slips: nobody answers, and the drawing goes with it
//   the build  the builder writes the system, briefs the agents, and they step out
//   the catch  the same trade, the same moment, caught; then a couple more trades
//   the crew   everyone lit, the builder in front
// The agents on screen are the ones the story needs: the hero's own job first.
export function compose(hero: string, others: string[], crew: string[], opts: { who?: string; claims?: Record<string, Caption> } = {}): Storyboard {
  const claims = opts.claims || CLAIMS, rest = others.filter((t) => t !== hero).slice(0, 4);
  const jobs: string[] = [];
  for (const t of [hero, ...rest]) { const j = jobForClaim(claimForTrade(t)); if (!jobs.includes(j)) jobs.push(j); }
  for (const j of ['answer', 'estimate', 'review']) if (jobs.length < 3 && !jobs.includes(j)) jobs.push(j);
  const team = crew.includes(hero) ? crew : [hero, ...crew].slice(0, 6);
  return {
    version: 1,
    loop: true,
    beats: [
      missedBeatFor(hero, claims),
      ...builderIntro(jobs, promptForTrade(hero), opts.who),
      beatFor(hero, claims),
      ...rest.map((t) => ({ ...beatFor(t, claims), hold: 2600 })),
      { crew: team, builder: true, caption: claims.crew || CLAIMS.crew, hold: 5000 },
    ],
  };
}

const CREW = ['contractor', 'plumber', 'electrician', 'roofer', 'manager', 'realtor'];
// the CTO site: trades and investors (the headline books jobs, closes deals, runs ops)
export const DEFAULT_STORYBOARD: Storyboard = compose('roofer', ['plumber', 'realtor'], CREW);
// the company site (digitalcraftai.com): construction and real estate teams, product-led
export const ROOT_STORYBOARD: Storyboard = compose('contractor', ['realtor', 'manager'], CREW, { who: 'DigitalCraft' });
export function defaultBoard(host?: string | null): Storyboard { return host === 'root' ? ROOT_STORYBOARD : DEFAULT_STORYBOARD; }

export function tradeForVertical(v?: string | null): string | null {
  if (!v) return null;
  const k = String(v).toLowerCase().replace(/^\/?ai-for-/, '').replace(/[^a-z-]/g, '');
  return TRADE_BY_VERTICAL[k] || (Object.values(TRADE_BY_VERTICAL).includes(k) ? k : null);
}

// The visitor's own trade becomes the story's hero: on a board with a miss, it is the trade that
// misses and is then caught (and it joins the crew). An older board without a miss gets the
// trade first after the builder's intro: moved up if the board has it, added if not.
export function personalize(board: Storyboard, trade: string | null, claims: Record<string, Caption> = CLAIMS): Storyboard {
  if (!trade) return board;
  const miss = board.beats.findIndex((b) => 'trade' in b && !!b.missed);
  if (miss >= 0) {
    const was = (board.beats[miss] as TradeBeat).trade;
    if (was === trade) return board;
    const echo = board.beats.findIndex((b, i) => i > miss && 'trade' in b && b.trade === was && !b.missed);
    const beats = board.beats.flatMap((b, i) => {
      if (i === miss) return [missedBeatFor(trade, claims)];
      if (i === echo) return [beatFor(trade, claims)];
      if ('trade' in b && b.trade === trade) return [];   // already the hero: no second turn
      if ('builder' in b && b.builder === 'prompting' && b.prompt?.text === promptForTrade(was)) return [{ ...b, prompt: { ...b.prompt, text: promptForTrade(trade) } }];
      if ('crew' in b && Array.isArray(b.crew) && !b.crew.includes(trade)) return [{ ...b, crew: [trade, ...b.crew.filter((t) => t !== was)].slice(0, 8) }];
      return [b];
    });
    if (echo < 0) {   // a hand-written board that never catches its miss: the visitor's trade is caught after the intro
      let at = 1; while (at < beats.length && 'builder' in beats[at] && !('crew' in beats[at])) at++;
      beats.splice(at, 0, beatFor(trade, claims));
    }
    return { ...board, beats: beats.slice(0, 12) };
  }
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
