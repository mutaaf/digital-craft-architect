---
id: 0113
title: Canonical founder facts module mirrored from mutaafaziz.com
status: groomed
priority: P1
area: trust
created: 2026-10-19
owner: gtm-innovation
---

## User story

As a construction or real estate owner who searches the founder's name after
a strategy call, I want this site and mutaafaziz.com to tell the same story
(same name, titles, dates, and claims), so that I trust the person I am about
to put on retainer.

## Why now (four lenses)

### Product Owner
Founder facts are hard-coded in four places (`IndexV2.tsx` CREDENTIALS and
ChampionV2 chips, `CTOCallout.tsx`, `content.json` founder, meta
descriptions) and contradict the personal site. Example: the timeline says the
practice launched in 2019 "after" Motorola, but the résumé has Motorola running
2018 to 2021. One data module, mirrored from `mutaafaziz.com/llms.txt`, removes
the contradiction and keeps it removed.

### Stakeholder
The personal site is the canonical source (owner decision, 2026-10-19). Its
rule is "never name Digital Craft clients". This site names three clients in
the founder timeline, which leaks past that rule.

### User (in the real moment of use)
A buyer opens both sites in two tabs. Today they see "Mutaaf" with no surname
on one tab and "Mutaaf Aziz, Disney Entertainment & ESPN" on the other. After
this change both tabs say the same thing.

### Growth
"Disney Entertainment & ESPN Technology" is a stronger and more specific
credential than "Disney", and it is currently missing here.

## Acceptance criteria

- [ ] `src/data/founder.ts` exports `FOUNDER_NAME` ('Mutaaf Aziz'),
      `FOUNDER_URL` ('https://mutaafaziz.com'), `FOUNDER_ROLE`
      ('Founder, DigitalCraft AI'; DigitalCraft spelling on this site, the personal site keeps its own), `FOUNDER_YEARS`
      ('15+ years in software, 10+ leading teams'), `FOUNDER_BOOK`
      ('a seven-figure book of retained, recurring clients'), and
      `FOUNDER_CREDENTIALS` (Disney Entertainment & ESPN Technology 2022 to
      present; Amazon Flex 2021 to 2022; Motorola Solutions 2018 to 2021).
      A header comment names `mutaafaziz.com/llms.txt` as the source.
- [ ] The IndexV2 credentials strip, ChampionV2 chips, and `CTOCallout`
      org line render from `founder.ts`, not literals.
- [ ] The ChampionV2 heading and the photo `alt` use the full name.
- [ ] The `content.json` founder bio leads with the full name and role, keeps
      "Fractional CTO since 2019", and has no client names.
- [ ] The `content.json` founder timeline matches the résumé dates and names
      no Digital Craft clients.
- [ ] The root `Founder.tsx` section renders `FOUNDER_NAME` and uses it as the
      image `alt`.
- [ ] e2e: `/` and `/?force=cto` both contain "Mutaaf Aziz" and
      "Disney Entertainment & ESPN", and neither contains "Overwatch",
      "Recyclops", or "TryMinded" inside the founder sections.
- [ ] New copy has no em-dash character. Existing dark-mode variants are kept.

## Out of scope

- Visual redesign of the founder sections (see 0116).
- JSON-LD changes (see 0114).
- Client names elsewhere (IndexV2 outcome ticker and case studies,
  `Construction.tsx`, content.json testimonials). They are tracked as a
  follow-up for the owner, and the e2e test scopes to the founder sections only.
- Replacing the stock founder photo. It is flagged to the owner, because no
  real headshot exists in either repo.

## Engineering notes

- Follow the `src/data/organizationSchema.ts` style: a small data module with
  comments.
- `src/pages/IndexV2.tsx`: CREDENTIALS L31, ChampionV2 ~L855-910, meta
  descriptions ~L1004/1015/1029.
- `src/components/CTOCallout.tsx` L136-142.
- `public/content.json` founder L149+. Types are in `src/hooks/useContent.ts`.
- Test: `tests/e2e/founder-facts-parity.spec.ts`.
- New deps: no. Privacy surface: no.

## Implementation log
