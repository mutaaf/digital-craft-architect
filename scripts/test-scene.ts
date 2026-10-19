// Ticket 0117 - tests for the hero's live storyboards: the shared board rules, the director's
// output conversion, and both API handlers against mock requests (no network, no secrets).
//   npx tsx scripts/test-scene.ts
import assert from 'node:assert/strict';
import AF from '../api/_scene/aurora-field.cjs';
import { CLAIMS, DEFAULT_STORYBOARD, TRADE_BY_VERTICAL, beatFor, checkClaims, houseText, personalize, tradeForVertical } from '../api/_scene/board';
import { toBoard, validateBoard } from '../api/_scene/lib';
import scene from '../api/scene';
import sceneDirect from '../api/scene-direct';

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log('  ✓ ' + name); } catch (e) { console.error('  ✗ ' + name + '\n    ' + ((e as Error).stack || e)); process.exitCode = 1; }
}
function mock(method: string, query: Record<string, string> = {}, headers: Record<string, string> = {}, body?: unknown) {
  const out: { status: number; headers: Record<string, string>; body: string } = { status: 0, headers: {}, body: '' };
  const res = {
    setHeader(k: string, v: string) { out.headers[k.toLowerCase()] = v; return res; },
    status(s: number) { out.status = s; return res; },
    json(b: unknown) { out.body = JSON.stringify(b); return res; },
    send(b: string) { out.body = b; return res; },
    end() { return res; },
  };
  return { req: { method, query, headers, body } as never, res: res as never, out };
}

await test('the default board passes aurora-field, the house rules and the claims', () => {
  assert.deepEqual(validateBoard(DEFAULT_STORYBOARD, CLAIMS), { ok: true, errors: [] });
});
await test('every vertical maps to a real trade, and every trade has a valid beat', () => {
  const trades = AF.trades();
  for (const t of new Set(Object.values(TRADE_BY_VERTICAL))) {
    assert.ok(trades.includes(t), t + ' is an aurora-field trade');
    assert.ok(validateBoard({ version: 1, beats: [beatFor(t)] }, CLAIMS).ok, t + ' beat is valid');
  }
  assert.equal(tradeForVertical('/ai-for-pool-service'), 'pool');
  assert.equal(tradeForVertical('roofers'), 'roofer');
  assert.equal(tradeForVertical('dental'), null);
});
await test("personalize puts the visitor's trade first, adding it when missing", () => {
  assert.equal((personalize(DEFAULT_STORYBOARD, 'plumber').beats[0] as { trade: string }).trade, 'plumber');
  const p = personalize(DEFAULT_STORYBOARD, 'pool');
  assert.equal((p.beats[0] as { trade: string }).trade, 'pool'); assert.equal(p.beats.length, DEFAULT_STORYBOARD.beats.length + 1);
});
await test('captions must be approved claims; numbers come only from claims; no em-dash', () => {
  const free = { version: 1 as const, beats: [{ trade: 'roofer', caption: { who: 'Roofer', did: 'Revenue up 300%' } }] };
  assert.equal(validateBoard(free, CLAIMS).ok, false);
  const num = { version: 1 as const, beats: [{ trade: 'roofer', caption: { who: 'Roofer', did: CLAIMS['call-booked'].did, metric: { to: 38, suffix: 's' } } }] };
  assert.ok(checkClaims(num).length === 1, 'invented metric refused');
  assert.ok(houseText('a — b'));
  assert.equal(validateBoard({ version: 1, beats: [{ trade: 'roofer', moment: { text: '9 PM — missed' }, caption: CLAIMS['call-booked'] }] }, CLAIMS).ok, false);
});
await test("the director's output becomes a valid board, custom figures included", () => {
  const b = toBoard({ beats: [{ trade: 'pool', custom: null, moment: 'Sun 8:02 AM · new lead', at: 'prop', claim: 'lead-qualified' },
    { trade: null, custom: { label: 'Dentist', pose: 'tablet', props: ['clipboard'] }, moment: '7:40 PM — new patient call', at: 'hand', claim: 'after-hours' }], crew: ['pool', 'plumber'] }, CLAIMS);
  assert.deepEqual(validateBoard(b, CLAIMS), { ok: true, errors: [] });
  assert.equal((b.beats[1] as { caption: { who: string } }).caption.who, 'Dentist');
  assert.ok(!(b.beats[1] as { moment: { text: string } }).moment.text.includes('—'));
});
await test('GET /api/scene: the default, the trade first, an ETag, then 304', async () => {
  delete process.env.EDGE_CONFIG;
  const a = mock('GET', { host: 'cto', vertical: 'pool-service' });
  await scene(a.req, a.res);
  assert.equal(a.out.status, 200);
  const board = JSON.parse(a.out.body);
  assert.equal(board.beats[0].trade, 'pool');
  assert.match(a.out.headers['cache-control'], /s-maxage=60/);
  const b = mock('GET', { host: 'cto', vertical: 'pool-service' }, { 'if-none-match': a.out.headers.etag });
  await scene(b.req, b.res);
  assert.equal(b.out.status, 304);
  const c = mock('POST'); await scene(c.req, c.res); assert.equal(c.out.status, 405);
});
await test('POST /api/scene-direct: configured, authorized, validated before anything is written', async () => {
  delete process.env.DIRECTOR_TOKEN;
  let m = mock('POST', {}, { authorization: 'Bearer x' }, { publish: DEFAULT_STORYBOARD }); await sceneDirect(m.req, m.res); assert.equal(m.out.status, 503);
  process.env.DIRECTOR_TOKEN = 'secret';
  m = mock('POST', {}, { authorization: 'Bearer nope' }, { publish: DEFAULT_STORYBOARD }); await sceneDirect(m.req, m.res); assert.equal(m.out.status, 401);
  m = mock('POST', {}, { authorization: 'Bearer secret' }, { publish: { version: 1, beats: [{ trade: 'roofer', caption: { did: 'Best roofer in Texas' } }] } }); await sceneDirect(m.req, m.res);
  assert.equal(m.out.status, 422); assert.match(m.out.body, /approved claim/);
  delete process.env.EDGE_CONFIG_ID;
  m = mock('POST', {}, { authorization: 'Bearer secret' }, { publish: DEFAULT_STORYBOARD }); await sceneDirect(m.req, m.res);
  assert.equal(m.out.status, 502); assert.match(m.out.body, /EDGE_CONFIG_ID/);
  m = mock('POST', {}, { authorization: 'Bearer secret' }, { publish: DEFAULT_STORYBOARD, key: 'nope' }); await sceneDirect(m.req, m.res); assert.equal(m.out.status, 400);
  m = mock('OPTIONS', {}, { origin: 'https://mutaaf.github.io' }); await sceneDirect(m.req, m.res);
  assert.equal(m.out.status, 204); assert.equal(m.out.headers['access-control-allow-origin'], 'https://mutaaf.github.io');
});
console.log(`${passed} passed${process.exitCode ? ', with failures' : ''}`);
