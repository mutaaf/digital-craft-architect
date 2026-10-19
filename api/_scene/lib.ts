// Ticket 0117 - server side of the CTO hero's live storyboards: read and write them in Vercel
// Edge Config, validate them (aurora-field's validate() plus the house rules in board.ts),
// and the AI director, which writes boards from a prompt or a visitor's vertical using only
// the vocabulary and the approved claims.
import { createHash } from 'node:crypto';
import AF from './aurora-field.cjs';
import { CLAIMS, DEFAULT_STORYBOARD, TRADE_LABEL, checkClaims, houseText, type Caption, type Storyboard, type TradeBeat } from './board';

export type Scenes = { default?: Storyboard; cto?: Storyboard; byVertical?: Record<string, Storyboard>; claims?: Record<string, Caption> };

export function claimsFrom(scenes: Scenes | null): Record<string, Caption> {
  return { ...CLAIMS, ...(scenes?.claims || {}) };
}

export function validateBoard(board: unknown, claims: Record<string, Caption>): { ok: boolean; errors: string[] } {
  const v = AF.validate(board, { text: houseText });
  if (!v.ok) return v;
  const c = checkClaims(board as Storyboard, claims);
  return { ok: !c.length, errors: c };
}

// Edge Config holds one key, "scenes". Without EDGE_CONFIG the site plays its bundled default.
export async function readScenes(): Promise<Scenes | null> {
  if (!process.env.EDGE_CONFIG) return null;
  try {
    const { get } = await import('@vercel/edge-config');
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

export function etagOf(body: string): string {
  return '"' + createHash('sha1').update(body).digest('hex').slice(0, 20) + '"';
}

// ---- the AI director ----
// It never writes free text for outcomes: each beat names a trade (or a custom figure from the
// vocabulary), a short moment, and a claim id. The server turns that into a storyboard.
type DirectedBeat = { trade: string | null; custom: { label: string; pose: string; props: string[] } | null; moment: string | null; at: string | null; claim: string };
const ANCHORS = ['head', 'chest', 'hand', 'prop', 'feet'];

function directorSchema(claims: Record<string, Caption>) {
  const V = AF.vocab(), claimIds = Object.keys(claims).filter((k) => k !== 'crew');
  const nul = (s: Record<string, unknown>) => ({ ...s, type: [s.type as string, 'null'] });
  return {
    name: 'storyboard',
    strict: true,
    schema: {
      type: 'object', additionalProperties: false, required: ['beats', 'crew'],
      properties: {
        beats: { type: 'array', minItems: 1, maxItems: 5, items: {
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

export function toBoard(out: { beats: DirectedBeat[]; crew: string[] }, claims: Record<string, Caption>): Storyboard {
  const beats: Storyboard['beats'] = [];
  for (const b of out.beats) {
    const claim = claims[b.claim] || CLAIMS['lead-response'];
    const trade = b.trade || (b.custom ? { pose: b.custom.pose, props: b.custom.props } : null);
    if (!trade) continue;
    const who = b.trade ? TRADE_LABEL[b.trade] || b.trade : (b.custom!.label || '').slice(0, 32);
    const beat: TradeBeat = { trade: trade as TradeBeat['trade'], caption: { who, ...claim } };
    if (b.moment) beat.moment = { text: b.moment.replace(/—/g, '·').slice(0, 48), at: b.at && ANCHORS.includes(b.at) ? b.at : 'hand' };
    beats.push(beat);
  }
  const crew = (out.crew || []).slice(0, 6);
  beats.push({ crew: crew.length ? crew : (DEFAULT_STORYBOARD.beats[DEFAULT_STORYBOARD.beats.length - 1] as { crew: string[] }).crew, caption: claims.crew || CLAIMS.crew, hold: 4500 });
  return { version: 1, loop: true, beats };
}

const SYSTEM = `You direct a 20-40 second hero animation for DigitalCraft AI, which builds AI systems (lead response, estimates, after-hours answering, reviews, deal analysis, ops automation) for trades and local businesses.
Each beat shows one worker drawn in light, the moment their business slipped (a missed call, a voicemail, a late lead), then AI catching it, then the outcome.
Rules:
- Use trades from the list. If the audience has no matching trade, use "custom" with a short label (e.g. "Dentist") and a pose and props from the lists; otherwise custom is null.
- "moment" is under 40 characters, formatted "<time or day> · <what happened>", e.g. "9:47 PM · missed call" or "Sat 7:12 AM · voicemail". No em-dashes. No invented statistics.
- "claim" picks the outcome from the allowed claim ids only; choose the one that best answers the moment.
- "at" is where the moment shows on the figure: hand for calls held in hand, prop for tools or paperwork.
- 2 to 4 beats, the audience's own trade first, then related trades. "crew" lists up to 6 trades for the closing lineup.`;

export async function direct(prompt: string, claims: Record<string, Caption>): Promise<Storyboard> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('the director needs OPENAI_API_KEY');
  const ids = Object.entries(claims).filter(([k]) => k !== 'crew').map(([k, c]) => `${k}: ${c.did}`).join('\n');
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
