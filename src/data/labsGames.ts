// /labs games launcher. Plain data module (no React, no Helmet) so the
// page and tests/e2e/labs-page.spec.ts read the same strings per the
// 2026-05-25 mirror-source rule. No em-dash characters in any copy.

export const PAGE_PATH = '/labs';
export const PAGE_URL = 'https://digitalcraftai.com/labs';
export const PAGE_H1 = 'Labs: games our AI agents build and ship';
export const META_DESCRIPTION =
  'Three live browser games built and maintained by the same autonomous agent pipeline Digital Craft runs for clients: scout, builder, and keeper agents behind CI gates.';

export type LabsGameAccent = 'sky' | 'fuchsia' | 'slate';

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
