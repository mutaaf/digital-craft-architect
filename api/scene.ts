// Ticket 0117 - GET /api/scene?host=cto&vertical=roofers
// The CTO hero's storyboard, live: Edge Config's "scenes" if set (else the bundled default),
// the visitor's trade first, validated, ETag-cached. Change the board in Edge Config (or publish
// from the aurora-field studio through /api/scene-direct) and open pages follow within a minute.
// A vertical with no trade (dental, legal, …) can get a board from the AI director when
// SCENE_DIRECTOR=on; those are cached for a day at the edge.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { DEFAULT_STORYBOARD, personalize, tradeForVertical, type Storyboard } from './_scene/board';
import { claimsFrom, direct, etagOf, readScenes, validateBoard } from './_scene/lib';

export const config = { maxDuration: 20 };

// verticals the site serves that have no trade figure yet; the director may compose one
const DIRECTABLE = new Set(['healthcare', 'legal', 'restaurant', 'kidsplay', 'fitness', 'dental', 'salon', 'autorepair', 'events']);
const directed = new Map<string, Storyboard>();
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {   // best effort, per instance: 5 director calls a minute per address
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const host = String(req.query.host || ''), vertical = String(req.query.vertical || '').toLowerCase().replace(/[^a-z-]/g, '').slice(0, 40);
  const scenes = await readScenes(), claims = claimsFrom(scenes), trade = tradeForVertical(vertical);
  let board: Storyboard = scenes?.byVertical?.[vertical] || (host === 'cto' && scenes?.cto) || scenes?.default || DEFAULT_STORYBOARD;
  let longCache = false;

  if (!trade && vertical && DIRECTABLE.has(vertical) && process.env.SCENE_DIRECTOR === 'on' && !scenes?.byVertical?.[vertical]) {
    const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'anon';
    try {
      if (!directed.has(vertical) && !limited(ip)) directed.set(vertical, await direct(`Audience: ${vertical} businesses visiting a fractional CTO's site.`, claims));
      if (directed.has(vertical)) { board = directed.get(vertical)!; longCache = true; }
    } catch (e) { console.error('scene: director failed', e); }
  }

  board = personalize(board, trade);
  const v = validateBoard(board, claims);
  if (!v.ok) {   // a bad board in Edge Config never reaches visitors: they get the default, and the logs say why
    console.error('scene: invalid storyboard, serving the default:', v.errors.join('; '));
    board = personalize(DEFAULT_STORYBOARD, trade);
  }
  const body = JSON.stringify(board), etag = etagOf(body);
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', longCache ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=60, stale-while-revalidate=600');
  if (req.headers['if-none-match'] === etag) return res.status(304).end();
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(200).send(body);
}
