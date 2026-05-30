// Ticket 0025 - shared source of truth for the homepage Organization JSON-LD
// block. Every constant here mirrors a string already rendered elsewhere on
// the site (footer tel href, content.json socialLinks, BlogPost publisher
// logo). Keep this file under 40 lines: it is a data module, not a component.

export const ORG_NAME = 'DigitalCraft AI';
export const ORG_URL = 'https://digitalcraftai.com';

// Same logo URL the BlogPost publisher uses in src/pages/BlogPost.tsx line 63.
export const ORG_LOGO = 'https://digitalcraftai.com/og-default.png';

// E.164 format of the tel:+19723523293 href at src/components/Footer.tsx
// line 125. A test asserts both end with the same digit sequence.
export const ORG_PHONE_E164 = '+1-972-352-3293';

// The two public profiles already linked from public/content.json
// footer.socialLinks. A test asserts each entry also appears in content.json
// so the schema cannot drift past what the footer actually renders.
export const SAME_AS_URLS: readonly string[] = [
  'https://linkedin.com/in/mutaaf',
  'https://calendly.com/mutaaf',
];

// Description is intentionally NOT included here: the homepage component
// spreads this object then sets description from content.seo.description at
// render time, so a homepage copy edit propagates to the schema in one render.
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: ORG_NAME,
  url: ORG_URL,
  logo: ORG_LOGO,
  sameAs: [...SAME_AS_URLS],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: ORG_PHONE_E164,
      contactType: 'sales',
      areaServed: 'US',
    },
  ],
} as const;
