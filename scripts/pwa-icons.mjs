#!/usr/bin/env node
// Renders the installable app's icons (v3). The SVGs are the source; PNGs are drawn from them in
// headless Chromium (Playwright, already a dev dependency).
//
//   node scripts/pwa-icons.mjs            # write SVGs + PNGs into public/icons/
//   node scripts/pwa-icons.mjs --svg-only # SVGs only
//
// The mark: the polar night, a ring of aurora points in orbit (mutaafaziz.com's sky, from the other
// side) and the copper diamond at its centre, Digital Craft's tick. CTO wears the copper ring.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(process.cwd(), 'public/icons');
mkdirSync(OUT, { recursive: true });

function mark({ size = 512, pad = 0, bg = true, mono = false, ring = '#7BE3C3', core = '#C96E2C', radius = 112 } = {}) {
  const c = size / 2;
  const s = (size - pad * 2) / 512; // design on a 512 grid
  const back_ = [], front_ = [];
  // an orbit of points: an ellipse tilted -24deg, brighter towards the front
  const N = 46;
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2;
    const x = Math.cos(t) * 176, y = Math.sin(t) * 74;
    const a = (-24 * Math.PI) / 180;
    const rx = x * Math.cos(a) - y * Math.sin(a), ry = x * Math.sin(a) + y * Math.cos(a);
    const front = (Math.sin(t) + 1) / 2;
    const r = 4.2 + front * 5.2;
    const o = mono ? 1 : 0.35 + front * 0.65;
    (front > 0.5 ? front_ : back_).push(`<circle cx="${(c + rx * s).toFixed(1)}" cy="${(c + ry * s).toFixed(1)}" r="${(r * s).toFixed(2)}" fill="${mono ? '#fff' : ring}" fill-opacity="${o.toFixed(2)}"/>`);
  }
  const d = 92 * s; // the diamond's half-diagonal
  const diamond = `<path d="M${c} ${c - d} L${c + d} ${c} L${c} ${c + d} L${c - d} ${c} Z" fill="${mono ? '#fff' : core}"/>`;
  const inner = mono ? '' : `<path d="M${c} ${c - d * 0.46} L${c + d * 0.46} ${c} L${c} ${c + d * 0.46} L${c - d * 0.46} ${c} Z" fill="#0B0F12" fill-opacity=".9"/>`;
  // a satellite: one bright point leading the orbit
  // the satellite rides the orbit, leading it on the far right
  const st = -0.35, sa = (-24 * Math.PI) / 180, sx0 = Math.cos(st) * 176, sy0 = Math.sin(st) * 74;
  const sx = c + (sx0 * Math.cos(sa) - sy0 * Math.sin(sa)) * s, sy = c + (sx0 * Math.sin(sa) + sy0 * Math.cos(sa)) * s;
  const sat = mono ? '' : `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(28 * s).toFixed(1)}" fill="${ring}" fill-opacity=".16"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${(12 * s).toFixed(1)}" fill="#E8FFF6"/>`;
  const grid = mono || !bg ? '' : `<g stroke="#ffffff" stroke-opacity=".045" stroke-width="${(2 * s).toFixed(1)}">${[...Array(7)].map((_, i) => { const p = pad + ((i + 1) * (size - pad * 2)) / 8; return `<path d="M${p} 0V${size}M0 ${p}H${size}"/>`; }).join('')}</g>`;
  const glow = mono || !bg ? '' : `<radialGradient id="g" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="${ring}" stop-opacity=".16"/><stop offset="1" stop-color="${ring}" stop-opacity="0"/></radialGradient>`;
  const back = !bg ? '' : mono ? '' : `<rect width="${size}" height="${size}" rx="${radius * (size / 512)}" fill="#0B0F12"/><rect width="${size}" height="${size}" rx="${radius * (size / 512)}" fill="url(#g)"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><defs>${glow}</defs>${back}${grid}${back_.join('')}${diamond}${inner}${front_.join('')}${sat}</svg>`;
}

const files = {
  'icon.svg': mark({}),
  'icon-maskable.svg': mark({ pad: 72, radius: 0 }),
  'icon-monochrome.svg': mark({ bg: false, mono: true }),
  'icon-cto.svg': mark({ ring: '#E89862', core: '#7BE3C3' }),
  'icon-cto-maskable.svg': mark({ pad: 72, radius: 0, ring: '#E89862', core: '#7BE3C3' }),
};
for (const [name, svg] of Object.entries(files)) writeFileSync(join(OUT, name), svg);
writeFileSync(join(process.cwd(), 'public/favicon.svg'), mark({ size: 64, radius: 14 }));
console.log('wrote', Object.keys(files).length + 1, 'SVGs');

if (process.argv.includes('--svg-only')) process.exit(0);

const { chromium } = await import('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
const png = async (svgName, out, px) => {
  const svg = files[svgName];
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}"`)}</body></html>`);
  await page.locator('svg').screenshot({ path: join(OUT, out), omitBackground: true });
};
await png('icon.svg', 'icon-192.png', 192);
await png('icon.svg', 'icon-512.png', 512);
await png('icon-maskable.svg', 'icon-maskable-512.png', 512);
await png('icon-monochrome.svg', 'icon-monochrome-512.png', 512);
await png('icon-maskable.svg', 'apple-touch-icon.png', 180);
await png('icon-cto.svg', 'icon-cto-192.png', 192);
await png('icon-cto.svg', 'icon-cto-512.png', 512);
await png('icon-cto-maskable.svg', 'icon-cto-maskable-512.png', 512);
await browser.close();
console.log('wrote PNGs to public/icons/');
