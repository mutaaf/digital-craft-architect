// Ticket 0113 - canonical founder facts. Source of truth is the founder's
// personal site, https://mutaafaziz.com/llms.txt (owner decision 2026-10-19).
// Every founder surface on this site (IndexV2 credentials strip and Champion
// section, CTOCallout org line, root Founder section) renders from here, and
// public/content.json founder copy is asserted against these strings by
// tests/e2e/founder-facts-parity.spec.ts. Edit llms.txt first, then mirror.
// Do not add client names here: the personal site never names them.

export const FOUNDER_NAME = 'Mutaaf Aziz';
export const FOUNDER_URL = 'https://mutaafaziz.com';

// llms.txt says "Founder, Digital Craft AI"; this site's brand spelling is
// "DigitalCraft AI" (coordinator decision 2026-10-19).
export const FOUNDER_ROLE = 'Founder, DigitalCraft AI';
export const FOUNDER_YEARS = '15+ years in software, 10+ leading teams';
// Verbatim from llms.txt. Do not round, restate, or put a number on it.
export const FOUNDER_BOOK = 'a seven-figure book of retained, recurring clients';

export interface FounderCredential {
  org: string;
  title: string;
  years: string;
}

// Newest first, matching the llms.txt "Work" list.
export const FOUNDER_CREDENTIALS: readonly FounderCredential[] = [
  {
    org: 'Disney Entertainment & ESPN Technology',
    title: 'Sr. Software Engineering Manager, Watch Experiences',
    years: '2022 to present',
  },
  { org: 'Amazon Flex', title: 'Engineering leadership', years: '2021 to 2022' },
  {
    org: 'Motorola Solutions',
    title: 'Sr. Software Engineering Manager',
    years: '2018 to 2021',
  },
];
