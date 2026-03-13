import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 5 };

const SETUPCLAW_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0a"/>
      <stop offset="50%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Logo icon -->
  <rect x="488" y="80" width="56" height="56" rx="14" fill="#dc2626"/>
  <text x="516" y="118" font-family="Arial,Helvetica,sans-serif" font-size="26" font-weight="700" fill="white" text-anchor="middle">SC</text>

  <!-- Logo text -->
  <text x="600" y="118" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="700" fill="white" text-anchor="start" dx="28">SetupClaw</text>

  <!-- Headline line 1 -->
  <text x="600" y="200" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" fill="white" text-anchor="middle">Your team&#x27;s AI assistant —</text>

  <!-- Headline line 2 (red accent) -->
  <text x="600" y="255" font-family="Arial,Helvetica,sans-serif" font-size="44" font-weight="700" fill="#f87171" text-anchor="middle">deployed and secured from day one.</text>

  <!-- Subtitle -->
  <text x="600" y="320" font-family="Arial,Helvetica,sans-serif" font-size="22" fill="#9ca3af" text-anchor="middle">White-glove OpenClaw setup on a Mac Mini. No technical knowledge required.</text>

  <!-- Price card 1: Remote -->
  <rect x="280" y="370" width="260" height="100" rx="12" fill="none" stroke="#374151" stroke-width="1.5"/>
  <rect x="280" y="370" width="260" height="100" rx="12" fill="rgba(255,255,255,0.03)"/>
  <text x="410" y="415" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="white" text-anchor="middle">$5,000</text>
  <text x="410" y="448" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">Remote Setup</text>

  <!-- Price card 2: In-Person -->
  <rect x="660" y="370" width="260" height="100" rx="12" fill="none" stroke="#dc2626" stroke-width="1.5"/>
  <rect x="660" y="370" width="260" height="100" rx="12" fill="rgba(220,38,38,0.08)"/>
  <text x="790" y="415" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="white" text-anchor="middle">$6,000</text>
  <text x="790" y="448" font-family="Arial,Helvetica,sans-serif" font-size="16" fill="#9ca3af" text-anchor="middle">On-Site — DFW &amp; Austin</text>

  <!-- Location pills -->
  <rect x="270" y="510" width="180" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="#374151" stroke-width="1"/>
  <circle cx="290" cy="527" r="5" fill="#4ade80"/>
  <text x="303" y="533" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#d1d5db">Remote — Worldwide</text>

  <rect x="475" y="510" width="200" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="#374151" stroke-width="1"/>
  <circle cx="495" cy="527" r="5" fill="#f87171"/>
  <text x="508" y="533" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#d1d5db">Dallas–Fort Worth, TX</text>

  <rect x="700" y="510" width="150" height="34" rx="17" fill="rgba(255,255,255,0.06)" stroke="#374151" stroke-width="1"/>
  <circle cx="720" cy="527" r="5" fill="#f87171"/>
  <text x="733" y="533" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#d1d5db">Austin, TX</text>

  <!-- Footer branding -->
  <text x="600" y="590" font-family="Arial,Helvetica,sans-serif" font-size="18" fill="#6b7280" text-anchor="middle">
    <tspan fill="#6b7280">by </tspan>
    <tspan fill="#9ca3af" font-weight="600">Digital</tspan>
    <tspan fill="#33C3F0" font-weight="600">Craft</tspan>
    <tspan fill="#9ca3af" font-weight="600"> AI</tspan>
  </text>
</svg>`;

const DEFAULT_SVG = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="600" y="295" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="700" fill="white" text-anchor="middle">
    <tspan>Digital</tspan><tspan fill="#33C3F0">Craft</tspan><tspan> AI</tspan>
  </text>
  <text x="600" y="350" font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#94a3b8" text-anchor="middle">AI Automation for Traditional Industries</text>
</svg>`;

export default function handler(req: VercelRequest, res: VercelResponse) {
  const page = (req.query.page as string) || 'default';
  const svg = page === 'setupclaw' ? SETUPCLAW_SVG : DEFAULT_SVG;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.status(200).send(svg);
}
