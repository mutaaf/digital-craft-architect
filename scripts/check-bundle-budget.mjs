#!/usr/bin/env node
// Performance budget for the JS every page downloads before first paint (2026-11-18).
// Run after `vite build`. Fails if the entry + its preloads grow past the budget, or if things we
// deliberately removed from the critical path creep back in.
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const BUDGET_KB = 120; // gzipped; was ~370 KB before the 2026-11-18 split, ~96 KB after
const html = readFileSync('dist/index.html', 'utf8');
const files = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.js)"/g)].map((m) => m[1]);
let total = 0;
for (const f of files) {
  const kb = gzipSync(readFileSync('dist' + f)).length / 1024;
  total += kb;
  console.log(`${kb.toFixed(1).padStart(7)} KB  ${f}`);
}
const problems = [];
if (total > BUDGET_KB) problems.push(`critical JS is ${total.toFixed(1)} KB gz, budget ${BUDGET_KB} KB`);
if (/gpteng/.test(html)) problems.push('the Lovable editor script is in the production HTML');
if (files.some((f) => /charts|recharts|radix|sentry/i.test(f))) problems.push('a heavy chunk (charts/radix/sentry) is preloaded on every page');
for (const f of files) if (/__SENTRY_DEBUG__/.test(readFileSync('dist' + f, 'utf8'))) problems.push(`Sentry SDK is in the critical path (${f}); it must stay lazy`);
console.log(`${total.toFixed(1).padStart(7)} KB  total critical JS (budget ${BUDGET_KB} KB)`);
if (problems.length) { console.error('\nBudget failed:\n - ' + problems.join('\n - ')); process.exit(1); }
