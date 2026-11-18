#!/usr/bin/env node
// npm run clips: short LinkedIn demo clips (1080x1350, 4:5) of three construction demos.
//
//   npm run clips                       build, capture every take, cut every clip in store/clips/clips.json
//   npm run clips -- --skip-capture     re-cut from the takes already in dist-clips/raw/ (caption or edit changes)
//   npm run clips -- --only=dc-estimate one clip (no contact sheet)
//
// Each take drives a real demo page of the production build (vite preview on 127.0.0.1) at a phone's width
// (540x675 CSS drawn at 2x into 1080x1350), with a visible cursor and scripted clicks and typing, so every take is
// the same. Playwright's recording keeps CSS pixels whatever the device scale, so the phone layout is made by
// zooming the page 2x and doubling every width breakpoint in its stylesheets (phone()): sharp text, phone layout.
// - Estimate: no network at all; the price is the page's own pricing table (src/data/estimatePricing.ts).
// - Lead responder and review replies normally call OpenAI through /api/stream and /api/chat. No paid API is
//   called here: those two routes are answered by the fixtures in scripts/clips-fixtures.mjs, written to the
//   same rules as the pages' own system prompts and returned in the same wire format. Those takes carry an
//   on-screen "Sample conversation" tag so nobody mistakes a scripted answer for a live one.
// Output in dist-clips/ (gitignored); scripts/clips-lib.mjs does the cutting; store/clips/POSTING.md says what to post.
import { execFileSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { main } from './clips-lib.mjs';
import { LEAD_TURNS, REVIEW, REVIEW_REPLIES } from './clips-fixtures.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.CLIPS_PORT) || 4831;
const BASE = `http://127.0.0.1:${PORT}`;
const CONTEXT = { hasTouch: true, colorScheme: 'light', reducedMotion: 'no-preference' };
const ZOOM = 2;

// A cursor the viewer can follow (a phone has none, so the taps would be invisible), plus an optional tag, and the
// phone layout at 2x: html zoomed, each (min|max)-width media rule doubled so the 1080 px window lays out as 540.
function overlay(tag, zoom) {
  const done = new WeakSet();
  const phone = () => {
    for (const sheet of document.styleSheets) {
      if (done.has(sheet)) continue;
      let rules;
      try { rules = sheet.cssRules; } catch { continue; }
      done.add(sheet);
      // vh units would count the real (2x) window too: a 70vh sheet would run off the bottom, so they are halved.
      const vh = (st) => { for (let i = 0; i < st.length; i++) { const p = st[i], v = st.getPropertyValue(p); if (/[\d.](d|s|l)?vh\b/.test(v)) st.setProperty(p, v.replace(/([\d.]+)(d|s|l)?vh\b/g, (_, n, u) => `${n / zoom}${u || ''}vh`), st.getPropertyPriority(p)); } };
      const walk = (list) => {
        for (const r of list) {
          if (r.style) vh(r.style);
          if (r.media && r.cssRules) { const t = r.media.mediaText, n = t.replace(/(min|max)-width:\s*([\d.]+)px/g, (_, k, v) => `${k}-width: ${v * zoom}px`); if (n !== t) r.media.mediaText = n; }
          if (r.cssRules) walk(r.cssRules);
        }
      };
      walk(rules);
    }
  };
  new MutationObserver(phone).observe(document, { childList: true, subtree: true });
  addEventListener('load', phone);
  const add = () => {
    const z = document.createElement('style');
    z.textContent = `html{zoom:${zoom}}`;
    document.head.appendChild(z);
    phone();
    if (document.getElementById('__clip_cursor')) return;
    const c = document.createElement('div');
    c.id = '__clip_cursor';
    c.style.cssText = 'position:fixed;left:270px;top:560px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;background:rgba(15,23,42,.35);border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.35);z-index:2147483647;pointer-events:none;transition:left .45s cubic-bezier(.3,.7,.2,1),top .45s cubic-bezier(.3,.7,.2,1),transform .12s';
    document.documentElement.appendChild(c);
    if (tag) {
      const t = document.createElement('div');
      t.textContent = tag;
      t.style.cssText = 'position:fixed;right:10px;bottom:10px;padding:4px 10px;border-radius:999px;background:rgba(15,23,42,.82);color:#fff;font:600 11px -apple-system,system-ui,sans-serif;letter-spacing:.02em;z-index:2147483646;pointer-events:none';
      document.documentElement.appendChild(t);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add); else add();
}

// Moves the cursor onto a target, presses, and clicks it for real.
async function tap(page, locator, wait = 350) {
  await locator.scrollIntoViewIfNeeded();
  const b = await locator.boundingBox();
  // The cursor lives inside the zoomed page, so it is placed in the page's own (unzoomed) pixels.
  await page.evaluate(({ x, y }) => { const c = document.getElementById('__clip_cursor'); c.style.left = x + 'px'; c.style.top = y + 'px'; }, { x: (b.x + b.width / 2) / ZOOM, y: (b.y + b.height / 2) / ZOOM });
  await page.waitForTimeout(500);
  await page.evaluate(() => { const c = document.getElementById('__clip_cursor'); c.style.transform = 'scale(.7)'; setTimeout(() => { c.style.transform = ''; }, 140); });
  await locator.click();
  await page.waitForTimeout(wait);
}

const scrollTo = (page, locator, block = 'start', settle = 900) => locator.evaluate((el, block) => el.scrollIntoView({ behavior: 'smooth', block }), block).then(() => page.waitForTimeout(settle));

// The returning-visitor, exit-intent and similar banners read localStorage; a fresh context has none, which is
// what a first-time visitor from a LinkedIn post sees.
async function open(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
}

// An OpenAI-style stream (data: {choices:[{delta:{content}}]}) for /api/stream, as api/stream.ts forwards it.
const sse = (text) => text.match(/\S+\s*/g).map((w) => `data: ${JSON.stringify({ choices: [{ delta: { content: w } }] })}\n\n`).join('') + 'data: [DONE]\n\n';

const TAKES = [
  {
    name: 'estimate',
    context: CONTEXT,
    init: overlay,
    drive: async (page, mark) => {
      await open(page, '/construction/demo/estimate');
      mark('page');
      await scrollTo(page, page.getByText('What type of project?'), 'start', 1100);
      mark('type');
      await tap(page, page.getByText('Kitchen Remodel', { exact: true }).first());
      await tap(page, page.getByRole('button', { name: 'Next' }));
      mark('size');
      const box = page.locator('input[type=number]');
      await box.scrollIntoViewIfNeeded();
      await tap(page, box, 150);
      await box.selectText();
      await box.pressSequentially('240', { delay: 160 });
      await page.waitForTimeout(500);
      await tap(page, page.getByRole('button', { name: 'Next' }));
      mark('finish');
      await tap(page, page.getByText('Premium', { exact: true }));
      await tap(page, page.getByRole('button', { name: 'Next' }));
      mark('extras');
      await tap(page, page.getByText('Permit Management', { exact: true }));
      await tap(page, page.getByText('Design Consultation', { exact: true }));
      mark('generate');
      await tap(page, page.getByRole('button', { name: /Generate Estimate/ }), 200);
      mark('result');
      await scrollTo(page, page.getByText('Ballpark Estimate', { exact: true }), 'center', 2000);
      mark('result_top');
      await page.evaluate(() => window.scrollBy({ top: 420, behavior: 'smooth' }));
      await page.waitForTimeout(2200);
      mark('breakdown');
      await page.evaluate(() => window.scrollBy({ top: 420, behavior: 'smooth' }));
      await page.waitForTimeout(2200);
      mark('end');
    },
  },
  {
    name: 'lead',
    context: CONTEXT,
    init: [overlay, 'Sample conversation'],
    drive: async (page, mark) => {
      let turn = 0;
      await page.route('**/api/stream', async (route) => {
        const text = LEAD_TURNS[Math.min(turn++, LEAD_TURNS.length - 1)].reply;
        await new Promise((r) => setTimeout(r, 900));   // the model's first token
        await route.fulfill({ status: 200, headers: { 'content-type': 'text/event-stream' }, body: sse(text) });
      });
      await open(page, '/construction/demo/lead-responder');
      mark('page');
      await scrollTo(page, page.getByText('Online', { exact: false }).first(), 'start', 1000);
      mark('chat');
      const input = page.locator('textarea');
      for (const [i, t] of LEAD_TURNS.entries()) {
        await tap(page, input, 100);
        await input.pressSequentially(t.user, { delay: 38 });
        mark(`ask${i + 1}`);
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => !document.querySelector('textarea')?.disabled, null, { timeout: 20000 });
        await page.waitForTimeout(1400);
        mark(`reply${i + 1}`);
      }
      await tap(page, page.getByRole('button', { name: /Lead Info/ }), 900);
      mark('lead');
      await page.waitForTimeout(3000);
      mark('end');
    },
  },
  {
    name: 'reviews',
    context: CONTEXT,
    init: [overlay, 'Sample output'],
    drive: async (page, mark) => {
      await page.route('**/api/chat', async (route) => {
        await new Promise((r) => setTimeout(r, 1800));   // the model thinking: the button shows its spinner
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ choices: [{ message: { role: 'assistant', content: JSON.stringify({ replies: REVIEW_REPLIES }) } }] }) });
      });
      await open(page, '/construction/demo/reviews');
      mark('page');
      const heading = page.getByText('Smart Reply Generator').first();
      await scrollTo(page, heading, 'start', 1300);
      mark('generator');
      const box = page.locator('textarea').first();
      await tap(page, box, 100);
      await box.pressSequentially(REVIEW, { delay: 26 });
      mark('typed');
      await page.waitForTimeout(400);
      await tap(page, page.getByRole('button', { name: /Generate 3 replies/ }), 100);
      mark('generate');
      await page.getByText(REVIEW_REPLIES[0].content.slice(0, 30)).waitFor({ timeout: 20000 });
      mark('replies');
      await scrollTo(page, page.getByText(REVIEW_REPLIES[0].content.slice(0, 30)), 'center', 2400);
      mark('reply1');
      await scrollTo(page, page.getByText(REVIEW_REPLIES[2].content.slice(0, 30)), 'center', 2600);
      mark('reply3');
      await page.waitForTimeout(800);
      mark('end');
    },
  },
];

let server;
await main({
  chromium,
  root: ROOT,
  title: 'DigitalCraft AI: LinkedIn demo clips',
  takes: TAKES.map((t) => {
    const [fn, tag] = Array.isArray(t.init) ? t.init : [t.init];
    return { ...t, init: { content: `(${fn})(${JSON.stringify(tag || '')}, ${ZOOM})` } };
  }),
  before: async () => {
    if (!process.argv.includes('--skip-capture')) {
      console.log('building dist/');
      execFileSync('npx', ['tsx', 'scripts/sync-classes-data.ts'], { cwd: ROOT, stdio: 'ignore' });
      execFileSync('npx', ['vite', 'build', '--logLevel', 'warn'], { cwd: ROOT, stdio: 'inherit' });
      server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore', detached: true });
      for (let i = 0; i < 60; i++) {
        try { if ((await fetch(BASE + '/')).ok) break; } catch { /* starting */ }
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    return {};
  },
  after: async () => { if (server) { try { process.kill(-server.pid); } catch { /* gone */ } } },
});
