// Ticket 0117 - POST /api/scene-direct (admin): direct and publish the CTO hero's storyboards.
//   Authorization: Bearer $DIRECTOR_TOKEN
//   { prompt: "...", key?: "cto" | "default" | "vertical:<slug>", publish?: true }  the AI director writes a board (and publishes it)
//   { publish: <storyboard>, key?: ... }                                              publish a board written by hand or in the studio
// Boards are validated against aurora-field's vocabulary, the house rules and the approved
// claims before anything is written. Publishing writes Edge Config ("scenes"); /api/scene
// serves it within a minute, no deploy.
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { claimsFrom, direct, readScenes, validateBoard, writeScenes, type Scenes } from './_scene/lib';
import type { Storyboard } from './_scene/board';

export const config = { maxDuration: 60 };

// the aurora-field studio publishes from GitHub Pages; local studio runs too
const ORIGINS = new Set(['https://mutaaf.github.io', 'http://localhost:8080', 'http://localhost:8765']);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = String(req.headers.origin || '');
  if (ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = process.env.DIRECTOR_TOKEN;
  if (!token) return res.status(503).json({ error: 'The director is not configured (DIRECTOR_TOKEN).' });
  if (String(req.headers.authorization || '') !== `Bearer ${token}`) return res.status(401).json({ error: 'Not authorized.' });

  const body = (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body) || {};
  const key = String(body.key || 'cto');
  if (!/^(cto|default|vertical:[a-z-]{2,40})$/.test(key)) return res.status(400).json({ error: 'key must be cto, default or vertical:<slug>' });
  const scenes: Scenes = (await readScenes()) || {};
  const claims = claimsFrom(scenes);

  let board: Storyboard | null = null;
  try {
    if (typeof body.prompt === 'string' && body.prompt.trim()) board = await direct(body.prompt, claims);
    else if (body.publish && typeof body.publish === 'object') board = body.publish as Storyboard;
    else return res.status(400).json({ error: 'Send a prompt or a storyboard to publish.' });
  } catch (e) {
    return res.status(502).json({ error: (e as Error).message });
  }
  const v = validateBoard(board, claims);
  if (!v.ok) return res.status(422).json({ error: 'The storyboard is not valid.', errors: v.errors, board });
  const shouldPublish = body.publish === true || (body.publish && typeof body.publish === 'object');
  if (!shouldPublish) return res.status(200).json({ ok: true, published: false, board });

  const next: Scenes = { ...scenes, byVertical: { ...(scenes.byVertical || {}) } };
  if (key === 'cto') next.cto = board; else if (key === 'default') next.default = board; else next.byVertical![key.slice(9)] = board;
  try { await writeScenes(next); } catch (e) { return res.status(502).json({ error: (e as Error).message, board }); }
  return res.status(200).json({ ok: true, published: true, key, board });
}
