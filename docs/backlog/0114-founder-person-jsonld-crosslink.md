---
id: 0114
title: Founder Person JSON-LD and footer cross-link to mutaafaziz.com
status: groomed
priority: P1
area: seo
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a buyer, or an AI assistant answering "who runs DigitalCraft AI?", I want
the site to say machine-readably who the founder is and to link to the
founder's own site, so that the company and the person resolve to one entity.

## Why now (four lenses)

### Product Owner
The Organization JSON-LD has no `founder`, and the site never links to
mutaafaziz.com. The personal site already links here, so the link only goes
one way.

### Stakeholder
Entity linking (Organization `founder` -> Person `sameAs`) connects the two
domains for search engines and LLM crawlers. That compounds the authority of
both sites.

### User (in the real moment of use)
One footer link: "Built by Mutaaf Aziz". It opens the founder's site in a new
tab.

### Growth
It turns founder-name searches into DigitalCraft visits, and DigitalCraft
visits into a credibility check that converts.

## Acceptance criteria

- [ ] `ORGANIZATION_SCHEMA` in `src/data/organizationSchema.ts` has
      `founder: { '@type': 'Person', name, url, jobTitle, sameAs }`. The values
      come from `src/data/founder.ts` (0113). `sameAs` includes
      https://mutaafaziz.com, https://github.com/mutaaf, and
      https://linkedin.com/in/mutaaf.
- [ ] The static Organization block in `index.html` carries the same
      `founder` object.
- [ ] `content.json` `footer.socialLinks` includes https://mutaafaziz.com, so
      the existing sameAs-vs-footer test still passes.
- [ ] The footer renders a "Built by Mutaaf Aziz" link to
      https://mutaafaziz.com with `rel="noopener"` and `target="_blank"`.
- [ ] e2e: extend `tests/e2e/homepage-organization-jsonld.spec.ts` to assert
      `founder.name` and `founder.url`.
- [ ] Light and dark footer both verified.

## Out of scope

- Adding a Person schema on other pages.
- Changes to mutaafaziz.com (tracked in that repo).

## Engineering notes

- Depends on 0113.
- `src/data/organizationSchema.ts`, `index.html` L27-48,
  `src/components/Footer.tsx`, `public/content.json` footer.socialLinks.
- New deps: no.

## Implementation log
