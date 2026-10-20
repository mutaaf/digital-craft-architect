// Ticket 0117 - the CTO hero's storyboards, live. One Edge function (the Hobby plan allows 12
// serverless functions per deployment; Edge functions don't count against it).
//
// GET /api/scene?host=cto&vertical=roofers
//   Edge Config "scenes" if set (else the bundled default), the visitor's trade first,
//   validated, ETag-cached. Edit the board (Edge Config, the aurora-field studio, or POST below)
//   and open pages follow within a minute. A vertical with no trade figure (dental, legal, …)
//   can get a board from the AI director when SCENE_DIRECTOR=on; those cache for a day.
//
// POST /api/scene   Authorization: Bearer $DIRECTOR_TOKEN   (admin)
//   { prompt: "...", key?: "cto" | "default" | "vertical:<slug>", publish?: true }  the AI director writes a board (and publishes it)
//   { publish: <storyboard>, key?: ... }                                              publish a board written by hand or in the studio
//   Boards are validated (aurora-field vocabulary, house rules, approved claims) before anything is written.
import { DEFAULT_STORYBOARD, personalize, tradeForVertical, type Storyboard } from './_scene/board';
import { claimsFrom, direct, etagOf, promptsFrom, readScenes, validateBoard, writeScenes, type Scenes } from './_scene/lib';

export const config = { runtime: 'edge' };

// verticals the site serves that have no trade figure yet; the director may compose one
const DIRECTABLE = new Set(['healthcare', 'legal', 'restaurant', 'kidsplay', 'fitness', 'dental', 'salon', 'autorepair', 'events']);
// the aurora-field studio publishes from GitHub Pages; local studio runs too
const ORIGINS = new Set(['https://mutaaf.github.io', 'http://localhost:8080', 'http://localhost:8765']);
const directed = new Map<string, Storyboard>();
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {   // best effort, per isolate: 5 director calls a minute per address
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 60_000);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}
// compare secrets in constant time: hash both, then compare every byte
async function sameSecret(a: string, b: string): Promise<boolean> {
  const h = async (x: string) => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(x)));
  const [x, y] = await Promise.all([h(a), h(b)]);
  let diff = 0; for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}
const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers } });

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'GET') return serve(req);
  const origin = req.headers.get('origin') || '';
  const cors: Record<string, string> = ORIGINS.has(origin)
    ? { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Headers': 'authorization, content-type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', Vary: 'Origin' }
    : {};
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method === 'POST') return admin(req, cors);
  return json({ error: 'Method not allowed' }, 405);
}

async function serve(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const host = url.searchParams.get('host') || '', vertical = (url.searchParams.get('vertical') || '').toLowerCase().replace(/[^a-z-]/g, '').slice(0, 40);
  const scenes = await readScenes(), claims = claimsFrom(scenes), trade = tradeForVertical(vertical);
  let board: Storyboard = scenes?.byVertical?.[vertical] || (host === 'cto' && scenes?.cto) || scenes?.default || DEFAULT_STORYBOARD;
  let longCache = false;

  if (!trade && vertical && DIRECTABLE.has(vertical) && process.env.SCENE_DIRECTOR === 'on' && !scenes?.byVertical?.[vertical]) {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'anon';
    try {
      if (!directed.has(vertical) && !limited(ip)) directed.set(vertical, await direct(`Audience: ${vertical} businesses visiting a fractional CTO's site.`, claims));
      if (directed.has(vertical)) { board = directed.get(vertical)!; longCache = true; }
    } catch (e) { console.error('scene: director failed', e); }
  }

  board = personalize(board, trade);
  const v = validateBoard(board, claims, promptsFrom(scenes));
  if (!v.ok) {   // a bad board in Edge Config never reaches visitors: they get the default, and the logs say why
    console.error('scene: invalid storyboard, serving the default:', v.errors.join('; '));
    board = personalize(DEFAULT_STORYBOARD, trade);
  }
  const body = JSON.stringify(board), etag = await etagOf(body);
  const headers = { ETag: etag, 'Cache-Control': longCache ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=60, stale-while-revalidate=600' };
  if (req.headers.get('if-none-match') === etag) return new Response(null, { status: 304, headers });
  return new Response(body, { status: 200, headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' } });
}

async function admin(req: Request, cors: Record<string, string>): Promise<Response> {
  const token = process.env.DIRECTOR_TOKEN;
  if (!token) return json({ error: 'The director is not configured (DIRECTOR_TOKEN).' }, 503, cors);
  if (!(await sameSecret(req.headers.get('authorization') || '', `Bearer ${token}`))) return json({ error: 'Not authorized.' }, 401, cors);
  let body: Record<string, unknown>;
  try { body = (await req.json()) as Record<string, unknown>; } catch { return json({ error: 'Send JSON.' }, 400, cors); }
  const key = String(body.key || 'cto');
  if (!/^(cto|default|vertical:[a-z-]{2,40})$/.test(key)) return json({ error: 'key must be cto, default or vertical:<slug>' }, 400, cors);
  const scenes: Scenes = (await readScenes()) || {};
  const claims = claimsFrom(scenes);

  let board: Storyboard;
  try {
    if (typeof body.prompt === 'string' && body.prompt.trim()) board = await direct(body.prompt, claims);
    else if (body.publish && typeof body.publish === 'object') board = body.publish as Storyboard;
    else return json({ error: 'Send a prompt or a storyboard to publish.' }, 400, cors);
  } catch (e) {
    return json({ error: (e as Error).message }, 502, cors);
  }
  const v = validateBoard(board, claims, promptsFrom(scenes));
  if (!v.ok) return json({ error: 'The storyboard is not valid.', errors: v.errors, board }, 422, cors);
  const shouldPublish = body.publish === true || (!!body.publish && typeof body.publish === 'object');
  if (!shouldPublish) return json({ ok: true, published: false, board }, 200, cors);

  const next: Scenes = { ...scenes, byVertical: { ...(scenes.byVertical || {}) } };
  if (key === 'cto') next.cto = board; else if (key === 'default') next.default = board; else next.byVertical![key.slice(9)] = board;
  try { await writeScenes(next); } catch (e) { return json({ error: (e as Error).message, board }, 502, cors); }
  return json({ ok: true, published: true, key, board }, 200, cors);
}
