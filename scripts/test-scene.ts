// Ticket 0117 - tests for the hero's live storyboards: the shared board rules, the director's
// output conversion, and both API handlers against mock requests (no network, no secrets).
//   npx tsx scripts/test-scene.ts
import assert from 'node:assert/strict';
import AF from '../api/_scene/aurora-field.cjs';
import { CLAIMS, DEFAULT_STORYBOARD, ROOT_STORYBOARD, TRADE_BY_VERTICAL, TRADE_LABEL, beatFor, checkClaims, houseText, missedBeatFor, personalize, tradeForVertical, type Storyboard, type TradeBeat } from '../api/_scene/board';
import { chapters, narrate, transcript } from '../api/_scene/story';
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
const trades = (b: Storyboard) => b.beats.flatMap((x) => ('trade' in x ? [`${x.missed ? 'miss:' : ''}${x.trade}`] : []));
await test('the story has four acts: the miss, the build, the catch (the same moment), the crew', () => {
  for (const [b, voice] of [[DEFAULT_STORYBOARD, 'cto'], [ROOT_STORYBOARD, 'root']] as const) {
    assert.deepEqual(chapters(b, voice).map((c) => c.id), ['miss', 'build', 'catch', 'crew']);
    const miss = b.beats[0] as TradeBeat, echo = b.beats[4] as TradeBeat;
    assert.ok(miss.missed && !miss.ai, 'it opens on a miss, and no AI comes');
    assert.equal(echo.trade, miss.trade); assert.equal(echo.moment?.text, miss.moment?.text, 'the same moment is caught');
    assert.deepEqual(b.beats.slice(1, 4).map((x) => (x as { builder: string }).builder), ['typing', 'prompting', 'agents']);
    assert.equal((b.beats[b.beats.length - 1] as { builder?: boolean }).builder, true, 'the finale puts the builder in front of the crew');
  }
  assert.deepEqual(trades(DEFAULT_STORYBOARD), ['miss:roofer', 'roofer', 'plumber', 'realtor']);
  assert.equal((ROOT_STORYBOARD.beats[1] as { caption: { who: string } }).caption.who, 'DigitalCraft', 'the company site speaks as the company');
});
await test("the visitor's trade becomes the story's hero, on any board", () => {
  const p = personalize(DEFAULT_STORYBOARD, 'plumber');
  assert.deepEqual(trades(p), ['miss:plumber', 'plumber', 'realtor'], 'misses, is caught, and gets no second turn');
  assert.equal((p.beats[2] as { prompt: { text: string } }).prompt.text, 'send every estimate within the hour', "the builder's prompt answers the miss");
  const pool = personalize(DEFAULT_STORYBOARD, 'pool');
  assert.deepEqual(trades(pool), ['miss:pool', 'pool', 'plumber', 'realtor']);
  assert.ok((pool.beats[pool.beats.length - 1] as { crew: string[] }).crew.includes('pool'), 'and joins the crew');
  for (const t of Object.keys(TRADE_LABEL)) assert.ok(validateBoard(personalize(DEFAULT_STORYBOARD, t), CLAIMS).ok, t);
  const old = { version: 1 as const, beats: [beatFor('roofer'), { crew: ['roofer'], caption: CLAIMS.crew }] };   // a board from before the miss
  assert.deepEqual(trades(personalize(old, 'hvac')), ['hvac', 'roofer']);
  const uncaught = { version: 1 as const, beats: [missedBeatFor('roofer'), { crew: ['roofer'], caption: CLAIMS.crew }] };   // hand-written: a miss with no catch
  assert.deepEqual(trades(personalize(uncaught, 'plumber')), ['miss:plumber', 'plumber'], "the visitor's trade is always caught");
});
await test('the narrator: written here, keyed by beat, no em-dash, no numbers outside the claims', () => {
  const lines = transcript(DEFAULT_STORYBOARD, 'cto');
  assert.equal(lines.length, DEFAULT_STORYBOARD.beats.length);
  assert.match(lines[0], /^Meet a roofer\. .*9:47 PM\. The phone rings\. Nobody picks up/);
  assert.match(lines[4], /^Same roofer\. Same night\. .*rings again\. This time, an agent picks up\./);
  assert.match(transcript(ROOT_STORYBOARD, 'root')[1], /^So we build/);
  assert.equal(narrate(personalize(DEFAULT_STORYBOARD, 'hvac'), 0, 'draw'), 'Meet an HVAC tech. Great at the work.');
  for (const t of Object.keys(TRADE_LABEL)) for (const voice of ['cto', 'root'] as const) for (const l of transcript(personalize(DEFAULT_STORYBOARD, t), voice)) {
    assert.ok(!houseText(l), l);
    for (const n of l.replace(/\d{1,2}:\d{2} (AM|PM)/g, '').match(/\d+/g) || []) assert.fail(`"${l}" says ${n}, which no claim backs`);
  }
});
await test('a missed beat is valid for every trade, and its caption is an approved loss', () => {
  for (const t of Object.keys(TRADE_LABEL)) {
    const m = missedBeatFor(t);
    assert.ok(validateBoard({ version: 1, beats: [m] }, CLAIMS).ok, t);
    assert.ok(Object.entries(CLAIMS).some(([k, c]) => k.startsWith('missed-') && c.did === m.caption?.did), t);
  }
  assert.equal(AF.validate({ version: 1, beats: [{ ...missedBeatFor('roofer'), ai: { text: 'x' } }] }).ok, false, 'a miss has no AI');
});
await test("what types on the builder's screen is curated like a claim", () => {
  const b = JSON.parse(JSON.stringify(DEFAULT_STORYBOARD));
  b.beats[2].prompt.text = 'guarantee 10x revenue';
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
  assert.deepEqual(chapters(b).map((c) => c.id), ['miss', 'build', 'catch', 'crew'], 'directed boards take the same shape');
  assert.equal((b.beats[0] as TradeBeat).trade, 'pool'); assert.ok((b.beats[0] as TradeBeat).missed);
  assert.equal((b.beats[5] as { caption: { who: string } }).caption.who, 'Dentist');
  assert.deepEqual((b.beats[3] as { agents: string[] }).agents, ['followup', 'answer', 'estimate'], "the intro's agents do the jobs behind the chosen claims");
  assert.equal((b.beats[b.beats.length - 1] as { builder?: boolean }).builder, true);
  assert.ok(!(b.beats[5] as { moment: { text: string } }).moment.text.includes('—'));
  assert.ok(transcript(b).every((l) => l.length > 0), 'the narrator has a line for a custom figure too');
});
await test('GET /api/scene: the host\'s default, the trade as hero, an ETag, then 304', async () => {
  delete process.env.EDGE_CONFIG;
  const a = await get('?host=cto&vertical=pool-service');
  assert.equal(a.status, 200);
  const body = await a.json();
  assert.equal(body.beats[0].trade, 'pool'); assert.ok(body.beats[0].missed);
  assert.equal((await (await get('?host=root')).json()).beats[0].trade, 'contractor', 'the company site has its own story');
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
