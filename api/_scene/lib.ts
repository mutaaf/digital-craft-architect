// Ticket 0117 - server side of the CTO hero's live storyboards: read and write them in Vercel
// Edge Config, validate them (aurora-field's validate() plus the house rules in board.ts),
// and the AI director, which writes boards from a prompt or a visitor's vertical using only
// the vocabulary and the approved claims.
import AF from './aurora-field.cjs';
import { CLAIMS, DEFAULT_STORYBOARD, PROMPTS, TRADE_LABEL, builderIntro, checkClaims, handled, houseText, jobForClaim, jobLabel, missOf, promptForClaim, type Caption, type Storyboard, type TradeBeat } from './board';

export type Scenes = { default?: Storyboard; cto?: Storyboard; root?: Storyboard; byVertical?: Record<string, Storyboard>; claims?: Record<string, Caption>; prompts?: string[] };

export function promptsFrom(scenes: Scenes | null): string[] { return [...PROMPTS, ...(scenes?.prompts || [])]; }

export function claimsFrom(scenes: Scenes | null): Record<string, Caption> {
  return { ...CLAIMS, ...(scenes?.claims || {}) };
}

export function validateBoard(board: unknown, claims: Record<string, Caption>, prompts: string[] = PROMPTS): { ok: boolean; errors: string[] } {
  const v = AF.validate(board, { text: houseText });
  if (!v.ok) return v;
  const c = checkClaims(board as Storyboard, claims, prompts);
  return { ok: !c.length, errors: c };
}

// Edge Config holds one key, "scenes". Without EDGE_CONFIG the site plays its bundled default.
export async function readScenes(): Promise<Scenes | null> {
  if (!process.env.EDGE_CONFIG) return null;
  try {
    const { get } = await import('@vercel/global-config');   // the renamed @vercel/edge-config
    return ((await get('scenes')) as Scenes) || null;
  } catch (e) {
    console.error('scene: edge config read failed', e);
    return null;
  }
}

export async function writeScenes(scenes: Scenes): Promise<void> {
  const id = process.env.EDGE_CONFIG_ID, token = process.env.VERCEL_API_TOKEN, team = process.env.VERCEL_TEAM_ID;
  if (!id || !token) throw new Error('publishing needs EDGE_CONFIG_ID and VERCEL_API_TOKEN');
  const url = `https://api.vercel.com/v1/edge-config/${id}/items${team ? `?teamId=${team}` : ''}`;
  const r = await fetch(url, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ operation: 'upsert', key: 'scenes', value: scenes }] }) });
  if (!r.ok) throw new Error(`edge config write failed: ${r.status} ${await r.text().catch(() => '')}`);
}

// Web Crypto, so this runs on the Edge runtime as well as in Node
export async function etagOf(body: string): Promise<string> {
  const d = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(body));
  return '"' + Array.from(new Uint8Array(d)).map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 20) + '"';
}

// ---- the AI director ----
// It never writes free text for outcomes: each beat names a trade (or a custom figure from the
// vocabulary), a short moment, and a claim id. The server turns that into a storyboard.
// the director picks outcomes; the crew, builder and loss captions are the story's own
const isOutcome = (k: string) => k !== 'crew' && k !== 'agents-work' && !k.startsWith('builder-') && !k.startsWith('missed-');
type DirectedBeat = { trade: string | null; custom: { label: string; pose: string; props: string[] } | null; moment: string | null; at: string | null; claim: string };
const ANCHORS = ['head', 'chest', 'hand', 'prop', 'feet'];

function directorSchema(claims: Record<string, Caption>) {
  const V = AF.vocab(), claimIds = Object.keys(claims).filter(isOutcome);
  const nul = (s: Record<string, unknown>) => ({ ...s, type: [s.type as string, 'null'] });
  return {
    name: 'storyboard',
    strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['beats', 'crew'],
      properties: {
        beats: { type: 'array', minItems: 1, maxItems: 4, items: {
          type: 'object', additionalProperties: false, required: ['trade', 'custom', 'moment', 'at', 'claim'],
          properties: {
            trade: { type: ['string', 'null'], enum: [...V.trades.filter((t) => !t.startsWith('inline')), null] },
            custom: nul({ type: 'object', additionalProperties: false, required: ['label', 'pose', 'props'], properties: {
              label: { type: 'string' }, pose: { type: 'string', enum: V.poses }, props: { type: 'array', maxItems: 3, items: { type: 'string', enum: V.props } } } }),
            moment: { type: ['string', 'null'] },
            at: { type: ['string', 'null'], enum: [...ANCHORS, null] },
            claim: { type: 'string', enum: claimIds },
          } } },
        crew: { type: 'array', maxItems: 6, items: { type: 'string', enum: V.trades.filter((t) => !t.startsWith('inline')) } },
      },
    },
  };
}

// Directed boards take the story's shape (board.ts compose()): the first beat's moment is missed,
// the builder briefs the agents those beats need, the same moment is caught, the rest follow, the crew.
export function toBoard(out: { beats: DirectedBeat[]; crew: string[] }, claims: Record<string, Caption>): Storyboard {
  const caught: Array<{ beat: TradeBeat; claim: string }> = [];
  for (const b of out.beats) {
    const id = claims[b.claim] && isOutcome(b.claim) ? b.claim : 'lead-response';
    const trade = b.trade || (b.custom ? { pose: b.custom.pose, props: b.custom.props } : null);
    if (!trade) continue;
    const who = b.trade ? TRADE_LABEL[b.trade] || b.trade : (b.custom!.label || '').slice(0, 32);
    const beat: TradeBeat = { trade: trade as TradeBeat['trade'], ai: { text: jobLabel(jobForClaim(id)) }, caption: { who, ...claims[id] } };
    if (b.moment) { const text = b.moment.replace(/—/g, '·').slice(0, 48); beat.moment = { text, then: handled(text, jobForClaim(id)), at: b.at && ANCHORS.includes(b.at) ? b.at : 'hand' }; }
    caught.push({ beat, claim: id });
  }
  if (!caught.length) return DEFAULT_STORYBOARD;
  const jobs: string[] = [];
  for (const c of caught) { const j = jobForClaim(c.claim); if (!jobs.includes(j)) jobs.push(j); }
  for (const j of ['answer', 'estimate', 'review']) if (jobs.length < 3 && !jobs.includes(j)) jobs.push(j);
  const crew = (out.crew || []).slice(0, 6);
  const beats: Storyboard['beats'] = [
    missOf(caught[0].beat, caught[0].claim, claims),
    ...builderIntro(jobs, promptForClaim(caught[0].claim)),
    caught[0].beat,
    ...caught.slice(1, 4).map((c) => ({ ...c.beat, hold: 2600 })),
    { crew: crew.length ? crew : (DEFAULT_STORYBOARD.beats[DEFAULT_STORYBOARD.beats.length - 1] as { crew: string[] }).crew, builder: true, caption: claims.crew || CLAIMS.crew, hold: 5000 },
  ];
  return { version: 1, loop: true, beats };
}

const SYSTEM = `You direct a 20-40 second hero animation for DigitalCraft AI, which builds AI systems (lead response, estimates, after-hours answering, reviews, deal analysis, ops automation) for trades and local businesses.
The story: the first beat's moment is missed (nobody answers, the job is lost), the builder briefs AI agents, then that same moment is caught, then the other beats, then the whole crew. Each beat shows one worker drawn in light, the moment their business slipped (a missed call, a voicemail, a late lead), AI catching it, and the outcome.
Rules:
- Use trades from the list. If the audience has no matching trade, use "custom" with a short label (e.g. "Dentist") and a pose and props from the lists; otherwise custom is null.
- "moment" is under 40 characters, formatted "<time or day> · <what happened>", e.g. "9:47 PM · missed call" or "Sat 7:12 AM · voicemail". No em-dashes. No invented statistics.
- "claim" picks the outcome from the allowed claim ids only; choose the one that best answers the moment.
- "at" is where the moment shows on the figure: hand for calls held in hand, prop for tools or paperwork.
- 2 to 4 beats, the audience's own trade first, then related trades. "crew" lists up to 6 trades for the closing lineup.`;

export async function direct(prompt: string, claims: Record<string, Caption>): Promise<Storyboard> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('the director needs OPENAI_API_KEY');
  const ids = Object.entries(claims).filter(([k]) => isOutcome(k)).map(([k, c]) => `${k}: ${c.did}`).join('\n');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o', temperature: 0.5, max_tokens: 900, response_format: { type: 'json_schema', json_schema: directorSchema(claims) },
      messages: [{ role: 'system', content: SYSTEM + '\nAllowed claims:\n' + ids }, { role: 'user', content: prompt.slice(0, 600) }] }),
  });
  if (!r.ok) throw new Error(`director: openai ${r.status}`);
  const j = await r.json();
  const board = toBoard(JSON.parse(j.choices[0].message.content), claims);
  const v = validateBoard(board, claims);
  if (!v.ok) throw new Error('director wrote an invalid board: ' + v.errors.join('; '));
  return board;
}
