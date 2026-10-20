// Ticket 0117 - tests for the hero's live storyboards: the shared board rules, the director's
// output conversion, and both API handlers against mock requests (no network, no secrets).
//   npx tsx scripts/test-scene.ts
import assert from 'node:assert/strict';
import AF from '../api/_scene/aurora-field.cjs';
import { CLAIMS, DEFAULT_STORYBOARD, TRADE_BY_VERTICAL, beatFor, checkClaims, houseText, personalize, tradeForVertical } from '../api/_scene/board';
import { toBoard, validateBoard } from '../api/_scene/lib';
import scene from '../api/scene';

let passed = 0;
async function test(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log('  ✓ ' + name); } catch (e) { console.error('  ✗ ' + name + '\n    ' + ((e as Error).stack || e)); process.exitCode = 1; }
}
const BASE = 'https://cto.digitalcraftai.com/api/scene';
const get = (q = '', headers: Record<string, string> = {}) => scene(new Request(BASE + q, { headers }));
const post = (body: unknown, headers: Record<string, string> = {}) => scene(new Request(BASE, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) }));

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
await test("the story opens with the builder; the visitor's trade comes first after his intro", () => {
  assert.deepEqual(DEFAULT_STORYBOARD.beats.slice(0, 3).map((b) => (b as { builder: string }).builder), ['typing', 'prompting', 'agents']);
  assert.equal((DEFAULT_STORYBOARD.beats[DEFAULT_STORYBOARD.beats.length - 1] as { builder?: boolean }).builder, true, 'the finale puts him in front of the crew');
  assert.equal((personalize(DEFAULT_STORYBOARD, 'plumber').beats[3] as { trade: string }).trade, 'plumber');
  const p = personalize(DEFAULT_STORYBOARD, 'pool');
  assert.equal((p.beats[3] as { trade: string }).trade, 'pool'); assert.equal(p.beats.length, DEFAULT_STORYBOARD.beats.length + 1);
});
await test("what types on the builder's screen is curated like a claim", () => {
  const b = JSON.parse(JSON.stringify(DEFAULT_STORYBOARD));
  b.beats[1].prompt.text = 'guarantee 10x revenue';
  const v = validateBoard(b, CLAIMS); assert.equal(v.ok, false); assert.match(v.errors.join(' '), /approved prompt/);
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
  assert.equal((b.beats[4] as { caption: { who: string } }).caption.who, 'Dentist');
  assert.deepEqual((b.beats[2] as { agents: string[] }).agents, ['followup', 'answer', 'estimate'], "the intro's agents do the jobs behind the chosen claims");
  assert.equal((b.beats[b.beats.length - 1] as { builder?: boolean }).builder, true);
  assert.ok(!(b.beats[4] as { moment: { text: string } }).moment.text.includes('—'));
});
await test('GET /api/scene: the default, the trade first, an ETag, then 304', async () => {
  delete process.env.EDGE_CONFIG;
  const a = await get('?host=cto&vertical=pool-service');
  assert.equal(a.status, 200);
  assert.equal((await a.json()).beats[3].trade, 'pool');
  assert.match(a.headers.get('cache-control')!, /s-maxage=60/);
  const b = await get('?host=cto&vertical=pool-service', { 'if-none-match': a.headers.get('etag')! });
  assert.equal(b.status, 304);
  assert.equal((await scene(new Request(BASE, { method: 'PUT' }))).status, 405);
});
await test('POST /api/scene: configured, authorized, validated before anything is written', async () => {
  delete process.env.DIRECTOR_TOKEN;
  assert.equal((await post({ publish: DEFAULT_STORYBOARD }, { authorization: 'Bearer x' })).status, 503);
  process.env.DIRECTOR_TOKEN = 'secret';
  assert.equal((await post({ publish: DEFAULT_STORYBOARD }, { authorization: 'Bearer nope' })).status, 401);
  const bad = await post({ publish: { version: 1, beats: [{ trade: 'roofer', caption: { did: 'Best roofer in Texas' } }] } }, { authorization: 'Bearer secret' });
  assert.equal(bad.status, 422); assert.match(JSON.stringify(await bad.json()), /approved claim/);
  delete process.env.EDGE_CONFIG_ID;
  const nowrite = await post({ publish: DEFAULT_STORYBOARD }, { authorization: 'Bearer secret' });
  assert.equal(nowrite.status, 502); assert.match(JSON.stringify(await nowrite.json()), /EDGE_CONFIG_ID/);
  assert.equal((await post({ publish: DEFAULT_STORYBOARD, key: 'nope' }, { authorization: 'Bearer secret' })).status, 400);
  const pre = await scene(new Request(BASE, { method: 'OPTIONS', headers: { origin: 'https://mutaaf.github.io' } }));
  assert.equal(pre.status, 204); assert.equal(pre.headers.get('access-control-allow-origin'), 'https://mutaaf.github.io');
});
console.log(`${passed} passed${process.exitCode ? ', with failures' : ''}`);
