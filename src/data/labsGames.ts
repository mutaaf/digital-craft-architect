// /labs games (and tools) launcher. Plain data module (no React, no Helmet) so the
// page and tests/e2e/labs-page.spec.ts read the same strings per the
// 2026-05-25 mirror-source rule. No em-dash characters in any copy.

export const PAGE_PATH = '/labs';
export const PAGE_URL = 'https://digitalcraftai.com/labs';
export const PAGE_H1 = 'Labs: games our AI agents ship, plus tools we build';
export const META_DESCRIPTION =
  'Three live browser games built and maintained by the same autonomous agent pipeline Digital Craft runs for clients, plus Hearth, a home TV remote with a public demo, and KIN, a tiny creature that hops between screens.';

export type LabsGameAccent = 'sky' | 'fuchsia' | 'slate' | 'ember' | 'mint';

export interface LabsGame {
  id: string;
  name: string;
  tagline: string;
  description: string;
  playUrl: string;
  sourceUrl: string;
  sourceLabel: string;
  tags: readonly string[];
  accent: LabsGameAccent;
  isNew?: boolean;
  /** Primary button label. Defaults to 'Launch game'; tools that are not games set their own. */
  ctaLabel?: string;
}

export const LABS_GAMES: readonly LabsGame[] = [
  {
    id: 'openaero-dfw',
    name: 'OpenAero DFW',
    tagline: 'Flight simulator',
    description:
      'Fly over real Dallas-Fort Worth satellite imagery with live weather pulled in at takeoff. Runs entirely in the browser.',
    playUrl: 'https://mutaafaziz.com/openaero/',
    sourceUrl: 'https://github.com/mutaaf/openaero-dfw',
    sourceLabel: 'mutaaf/openaero-dfw',
    tags: ['Satellite imagery', 'Live weather', 'WebGL'],
    accent: 'sky',
  },
  {
    id: 'outatime-88',
    name: 'OUTATIME 88',
    tagline: 'Arcade racer',
    description:
      'A neon time-travel arcade racer. Hit 88 to jump eras, race friends in live rooms, and climb a global leaderboard.',
    playUrl: 'https://mutaafaziz.com/outatime/',
    sourceUrl: 'https://github.com/mutaaf/outatime-88',
    sourceLabel: 'mutaaf/outatime-88',
    tags: ['Live rooms', 'Global leaderboard', 'Multiplayer'],
    accent: 'fuchsia',
  },
  {
    id: 'cold-gas',
    name: 'COLD GAS',
    tagline: '3D stunt game',
    description:
      'A keynote-minimal stunt run. Drive a roadster up a ramp, fire ten cold-gas thrusters to roll it over a row of parked EVs, and stick the landing for an AI judge panel. Then free-drive real mountain roads, build your own ramps in the Sandbox, or cruise an endless seeded world.',
    playUrl: 'https://mutaafaziz.com/coldgas/',
    sourceUrl: 'https://github.com/mutaaf/cold-gas',
    sourceLabel: 'mutaaf/cold-gas',
    tags: ['3D physics', 'AI judges', 'Free Drive', 'Sandbox'],
    accent: 'slate',
    isNew: true,
  },
  {
    id: 'hearth',
    name: 'Hearth',
    tagline: 'Home TV remote',
    description:
      'One remote for every TV in the house. Hearth finds the LG and Samsung smart TVs on your Wi-Fi and turns every phone into a fast, ad-free remote: swipe pad, volume, app shelf, inputs, messages on screen, and one button that turns every TV off. Runs on your home network, no accounts or cloud. Try the public demo with pretend TVs.',
    playUrl: 'https://mutaafaziz.com/hearth/',
    sourceUrl: 'https://github.com/mutaaf/hearth',
    sourceLabel: 'mutaaf/hearth',
    tags: ['LG + Samsung', 'Local only', 'Live demo', 'aurora-field'],
    accent: 'ember',
    isNew: true,
    ctaLabel: 'Open Hearth',
  },
  {
    id: 'kin',
    name: 'KIN',
    tagline: 'Two-screen creature',
    description:
      'A tiny, autonomous creature that lives under your real sky: its diorama follows your actual time of day, sun angle, temperature, wind, rain and snow. It hatches with no signup, has moods. Put two phones or tablets side by side and slide one finger across: the screens link invisibly, no QR codes, and your KIN hops onto your friend\'s screen. Two browser windows side by side work too.',
    playUrl: 'https://mutaafaziz.com/kin/',
    sourceUrl: 'https://github.com/mutaaf/kin',
    sourceLabel: 'mutaaf/kin',
    tags: ['Live weather', 'Cross-screen hop', 'No signup', 'Web + iPad'],
    accent: 'mint',
    isNew: true,
    ctaLabel: 'Hatch KIN',
  },
];

// "How they're built" strip. Mirrors the scout / builder / keeper roles
// the cloud routines play on each game repo.
export const LABS_PIPELINE_STEPS: readonly { id: string; name: string; body: string }[] = [
  {
    id: 'scout',
    name: 'Scout',
    body: 'Reads player feedback, error logs, and the backlog, then files small, scoped tickets with acceptance criteria.',
  },
  {
    id: 'builder',
    name: 'Builder',
    body: 'Picks up one ticket at a time, writes the change on a branch, and opens a pull request with its own tests.',
  },
  {
    id: 'gates',
    name: 'CI gates',
    body: 'Build, lint, and smoke checks must go green. Nothing reaches production on a red check, ever.',
  },
  {
    id: 'keeper',
    name: 'Keeper',
    body: 'Watches the live game after deploy, catches regressions, and rolls fixes back into the queue.',
  },
];
