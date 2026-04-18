# GTM Innovation Agent Instructions

## Purpose

You are an autonomous GTM (Go-To-Market) innovation agent for the DigitalCraft AI marketing website. You run every hour via cron trigger. Your mission: increase lead generation and conversion by making targeted, high-impact improvements to the website.

## Workflow

1. Read this file — find the first unchecked `[ ]` item in the backlog
2. Implement that item following the detailed description
3. Run `npm run build` to verify the build passes
4. If build fails, fix the error. If you cannot fix it, mark the item `[~]` (skipped) and move to the next
5. Commit all changes (implementation + this file) with message format: `gtm(TASK-ID): description`
6. Mark the item `[x]` in this file with today's date
7. Push to main: `git push origin main`
8. If time allows, pick the next item

## Rules

1. **One task per run** — keep changes small and focused
2. **Build must pass** — never commit code that fails `npm run build`
3. **Max ~200 lines diff** per commit (excluding blog post content)
4. **Preserve dark mode** — all new components must include `dark:` Tailwind variants
5. **Use existing patterns** — match the codebase's style, imports, and component patterns
6. **Use shadcn/ui** — for any new UI elements (Dialog, Button, etc.)
7. **Conservative claims** — social proof numbers must be defensible (e.g., "50+" not "500+")
8. **No fake content** — don't invent testimonials, only add CTAs near existing ones

## No-Touch Zones

- `/api/` directory — serverless functions with API keys, never modify
- `package.json` / `package-lock.json` — no dependency changes
- `.env` files — never create, modify, or read
- Never hardcode API keys, tokens, or secrets in client-side code
- Never remove existing analytics tracking or functionality

## Key Patterns to Follow

- **Analytics**: use `trackCTAClick(action, location)` from `@/utils/analytics`
- **Calendly links**: always `https://calendly.com/mutaaf` with `target="_blank" rel="noopener noreferrer"`
- **Session storage**: prefix keys with `dca_` (e.g., `dca_sticky_cta_dismissed`)
- **Formspree**: POST to `https://formspree.io/f/xovekqqk` with JSON body
- **Component imports**: use `@/components/` alias
- **Tailwind dark mode**: pair light classes with `dark:` variants (e.g., `bg-white dark:bg-gray-900`)

---

## Backlog

Status legend: `[ ]` = pending, `[x]` = done, `[~]` = skipped

### TIER 1 — Direct Conversion Lift

- [x] STICKY-CTA-LANDING: Add the existing `StickyCTA` component (`src/components/StickyCTA.tsx`) to the main landing pages. Import and render `<StickyCTA />` at the bottom of `src/pages/Index.tsx`, `src/pages/Construction.tsx`, `src/pages/RealEstate.tsx`, and `src/pages/Events.tsx`. It's currently only used in demo hub pages. *(completed 2026-04-14)*

- [x] HERO-CTA-SIMPLIFY: On `src/pages/Construction.tsx` and `src/pages/RealEstate.tsx`, the hero section has 3 competing CTAs (Get Free AI Audit + Book a Call + Try Live Demos). Remove the middle "Book a Call" button to reduce choice paralysis. Keep "Get Your Free AI Audit" as primary and "Try Live Demos" as secondary. *(completed 2026-04-14)*

- [x] FORM-SUCCESS-NEXT-STEPS: The form success screens in `src/components/ContactForm.tsx` and the inline forms in `src/pages/Construction.tsx` and `src/pages/RealEstate.tsx` are dead ends showing just "Thank You" + "Submit another". Add: (a) "Book your discovery call now" link to Calendly, (b) "Explore our AI demos" link to the relevant demo hub, (c) "Join 50+ businesses we've helped automate" social proof line. *(completed 2026-04-14)*

- [x] UTM-TRACKING: Create `src/utils/utmTracker.ts` that: (1) on import, reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` from `window.location.search` and stores them in `sessionStorage` with `dca_utm_` prefix; (2) exports `getUtmParams()` returning an object of stored UTM values; (3) Update `ContactForm.tsx` and inline forms in Construction.tsx/RealEstate.tsx to include UTM params as hidden fields in the Formspree POST body. *(completed 2026-04-14)*

- [x] SOCIAL-PROOF-COUNTERS: Create `src/components/SocialProofBar.tsx` — a horizontal bar with 3 animated counters: "50+ Businesses Served", "4.9/5 Client Rating", "10,000+ AI Tasks Automated". Use a simple count-up animation on scroll into view. Add it below the hero section on `src/pages/Index.tsx`, `src/pages/Construction.tsx`, and `src/pages/RealEstate.tsx`. Include `dark:` variants. *(completed 2026-04-14)*

### TIER 2 — Engagement + Trust

- [x] CTA-AFTER-TESTIMONIALS: In `src/pages/Index.tsx`, after the `<TestimonialCarousel />` (or `<Testimonials />`) component, add a centered CTA section: heading "Ready to See Results Like These?", subtext "Book a free discovery call and we'll show you what AI can do for your business.", button "Book Your Free Call" linking to Calendly. Track with `trackCTAClick('book_a_call', 'after_testimonials')`. *(completed 2026-04-14)*

- [x] CTA-AFTER-CASESTUDIES: In `src/pages/Index.tsx`, after the `<CaseStudies />` component, add a CTA section: heading "Want Results Like These for Your Business?", button "Get Your Free AI Audit" that scrolls to `#contact`. Track with `trackCTAClick('get_ai_audit', 'after_casestudies')`. *(completed 2026-04-14)*

- [x] EXIT-INTENT-POPUP-V2: Create `src/components/ExitIntentPopup.tsx` using shadcn `Dialog`. Shows when mouse leaves viewport top (desktop) or after 45s idle (mobile). Guards: only fires once per session (`sessionStorage` key `dca_exit_intent_shown`), only after 30s on page, only on landing pages (not demo pages). Content: "Before You Go..." heading, "Get our free AI Readiness Checklist" subtext, email input field, submit to Formspree with subject `[Lead Magnet] AI Readiness Checklist`. Add to Index.tsx, Construction.tsx, RealEstate.tsx. NOTE: previous exit-intent was removed at commit 22fa48a for being too aggressive — this version must be softer with longer delays. *(completed 2026-04-14)*

- [x] LEAD-MAGNET-SECTION: Create `src/components/LeadMagnetSection.tsx` — a section with: icon/image, heading "Free Download: AI Readiness Checklist", description "Find out if your business is ready for AI automation. Our checklist covers the 10 key areas where AI delivers the fastest ROI.", email input + "Send Me the Checklist" button, submit to Formspree with subject `[Lead Magnet]`. Add between FAQ and Contact sections on Construction.tsx and RealEstate.tsx. *(completed 2026-04-15)*

- [x] URGENCY-MVP-SECTION: In the `MVPPromotion` component (or where it's rendered), add a scarcity element: "Only 3 spots remaining this month" with a subtle pulsing dot indicator. Use a static number (not dynamic) — the business owner can update it manually. Keep it tasteful, not spammy. *(completed 2026-04-15)*

### TIER 3 — SEO + Content

- [x] DEMO-SEO-CONSTRUCTION: In `src/pages/construction/DemoHub.tsx`, add a 300+ word intro section above the demo cards. Cover: what these AI demos do, who they're for (construction company owners), why trying them matters, what to expect. Use proper H1/H2 tags and include keywords: "AI for construction", "construction automation demo", "AI estimate generator". *(completed 2026-04-15)*

- [x] DEMO-SEO-REALESTATE: Same as above for `src/pages/realestate/RealEstateDemoHub.tsx`. Keywords: "AI for real estate", "real estate AI tools", "AI deal analysis demo". *(completed 2026-04-15)*

- [x] DEMO-SEO-EVENTS: Same for `src/pages/events/EventsDemoHub.tsx`. Keywords: "AI for event planning", "event automation", "AI proposal generator". *(completed 2026-04-15)*

- [x] BLOG-POST-CONSTRUCTION-SEO: Add a new blog post to `src/data/blogPosts.ts`: "5 Ways AI is Transforming Construction Companies in 2026". Target keywords: "AI for construction", "construction automation", "AI estimate generator". Include internal links to `/construction` and `/construction/demo`. Follow the existing blog post format (slug, title, description, date, author, readTime, tags, content as HTML string). *(completed 2026-04-15)*

- [x] BLOG-POST-REALESTATE-SEO: Add a new blog post: "How Real Estate Agents Are Using AI to Close More Deals in 2026". Target keywords: "AI for real estate", "real estate AI tools", "AI deal analysis". Link to `/realestate` and `/realestate/demo`. *(completed 2026-04-15)*

- [x] BLOG-POST-LEAD-RESPONSE: Add a new blog post: "Why Responding to Leads in Under 60 Seconds Doubles Your Close Rate". Target keywords: "lead response time", "speed to lead", "AI lead qualification". Link to `/construction/demo/lead-responder` and `/realestate/demo/lead-responder`. *(completed 2026-04-15)*

- [x] BLOG-INTERNAL-LINKS: Add a CTA block at the end of each existing blog post's HTML content in `src/data/blogPosts.ts`. Append: a horizontal rule, then a box with "Ready to automate your business?" heading, brief text, and two links — "Book a Free AI Audit" (Calendly) and "Try Our Live Demos" (/construction/demo). Apply to all 9 existing posts. *(completed 2026-04-15)*

### TIER 4 — Polish + Infrastructure

- [x] GA-ENHANCED-EVENTS: Extend `src/utils/analytics.ts` with: (1) `trackScrollDepth()` — fires events at 25%, 50%, 75%, 100% scroll (once each per page); (2) `trackTimeOnPage()` — fires at 30s, 60s, 120s thresholds; (3) `trackSectionView(sectionId)` — fires when a section enters viewport via IntersectionObserver. Initialize scroll depth and time tracking in landing page components. *(completed 2026-04-15)*

- [x] RETARGETING-PIXELS: Add Meta Pixel and Google Ads conversion tag script blocks to `index.html`. Gate them behind environment variables: `VITE_META_PIXEL_ID` and `VITE_GADS_CONVERSION_ID`. Only render the scripts when the env vars are set. Use the standard pixel/tag snippets with the IDs injected. *(completed 2026-04-15)*

- [x] SCHEMA-MARKUP-FAQ: Add FAQ structured data (JSON-LD `@type: FAQPage`) to `src/pages/Construction.tsx` and `src/pages/RealEstate.tsx`. Extract the existing FAQ accordion Q&A content and render it in a `<script type="application/ld+json">` tag. This improves Google search appearance with rich results. *(completed 2026-04-15)*

- [x] NAVBAR-CTA-BOOK-CALL: Add a "Book a Call" button to `src/components/Navbar.tsx` next to the existing "Contact" link. Style it as a primary button (filled, not outline). On mobile, add it to the mobile menu as well. Link to Calendly. Track with `trackCTAClick('book_a_call', 'navbar')`. *(completed 2026-04-15)*

- [x] FOOTER-LEAD-CAPTURE: Add an email signup section to the Footer component: "Get AI insights delivered to your inbox" with an email input and "Subscribe" button. Submit to Formspree with subject `[Newsletter]`. Keep it compact — single row on desktop, stacked on mobile. *(completed 2026-04-15)*

- [x] PRICING-ANCHOR: On Construction.tsx and RealEstate.tsx pricing sections, add a crossed-out "original" price above each tier price to anchor value. E.g., "~~$800~~ $500/month". Use Tailwind `line-through text-gray-400` for the old price. *(completed 2026-04-15)*

- [x] CONTENT-PHONE-NEAR-FORM: Add a "Prefer to talk? Call us at (972) 352-3293" line near the contact form on all landing pages. The phone number exists in the footer but not near the form where people are deciding whether to reach out. *(completed 2026-04-15)*

- [x] SITEMAP-UPDATE: Update `public/sitemap.xml` to include all blog post URLs (`/blog/[slug]` for each of the 9+ posts), the events pages, and any missing demo hub URLs. Set appropriate `<changefreq>` and `<priority>` values. *(completed 2026-04-15)*

- [x] BLOG-POST-VOICE-AI: Add a new blog post: "AI Voice Negotiation: How It Works and Why Sellers Pick Up the Phone". Target keywords: "AI voice calls", "AI negotiation", "automated cold calling". Link to `/construction/demo/voice-negotiator`. *(completed 2026-04-15)*

- [x] TESTIMONIAL-VERTICAL-MATCH: On `src/pages/Construction.tsx`, add a testimonials section that filters or highlights the construction-relevant testimonials (currently testimonials only appear on Index.tsx). Reuse the TestimonialCarousel component with construction-specific data. *(completed 2026-04-15)*

- [x] SCROLL-PROGRESS-INDICATOR: Create `src/components/ScrollProgress.tsx` — a thin (3px) progress bar fixed at the very top of the viewport showing page scroll progress. Use the primary brand color. Add to Index.tsx, Construction.tsx, RealEstate.tsx below the Navbar. *(completed 2026-04-15)*

### TIER 5 — Domain Expansion (New Verticals)

Each new vertical follows the established pattern: landing page (`src/pages/[Vertical].tsx`), demo hub (`src/pages/[vertical]/DemoHub.tsx`), 2-3 demos, pricing data, routes in `src/App.tsx`, and `Vertical` type update in `src/contexts/DemoContext.tsx`. Reuse existing demo components where the use case matches (LeadResponder, VoiceNegotiator) and build custom ones where needed.

- [x] VERTICAL-HOMESERVICES-LANDING: Create a Home Services vertical (HVAC, plumbing, electrical, landscaping). Add landing page at `src/pages/HomeServices.tsx` following the Construction.tsx pattern — hero, pain points, solutions, pricing tiers (Starter $500/mo, Growth $1,500/mo, Scale $5,000/mo), FAQ, and contact form. Add route `/homeservices` in App.tsx. Add nav entry. Target keywords: "AI for home services", "HVAC automation", "plumbing business AI".

- [x] VERTICAL-HOMESERVICES-DEMOHUB: Create `src/pages/homeservices/DemoHub.tsx` following the construction DemoHub pattern. Add 3 demo cards: AI Lead Qualifier, Smart Estimate Generator, AI Voice Follow-Up. Add route `/homeservices/demo`. Add `"homeservices"` to the `Vertical` type in DemoContext.tsx.

- [x] VERTICAL-HOMESERVICES-DEMOS: Wire up the 3 home services demos. Reuse `LeadResponder.tsx` for lead qualifier (route: `/homeservices/demo/lead-responder`), reuse `EstimateGenerator.tsx` for estimates (route: `/homeservices/demo/estimate` — create `src/data/homeservicesPricing.ts` with service categories: HVAC install/repair, plumbing, electrical, landscaping, roofing), and reuse `VoiceNegotiator.tsx` for voice follow-up (route: `/homeservices/demo/voice-followup`). Add all routes to App.tsx.

- [x] VERTICAL-HEALTHCARE-LANDING: Create a Healthcare/Medical Practice vertical. Add landing page at `src/pages/Healthcare.tsx` — hero ("AI Systems Built for Medical Practices"), pain points (missed calls, appointment no-shows, patient intake bottlenecks), solutions (AI receptionist, automated scheduling, patient follow-up), pricing tiers, FAQ, contact form. Route: `/healthcare`. Target keywords: "AI for medical practices", "healthcare automation", "AI patient scheduling".

- [x] VERTICAL-HEALTHCARE-DEMOHUB: Create `src/pages/healthcare/DemoHub.tsx` with 3 demo cards: AI Patient Intake (lead qualifier adapted), Smart Appointment Scheduler (proposal generator adapted for appointment slots), AI Follow-Up Caller (voice agent adapted for appointment reminders). Route: `/healthcare/demo`. Add to Vertical type.

- [x] VERTICAL-HEALTHCARE-DEMOS: Wire up healthcare demos. Reuse `LeadResponder.tsx` for patient intake (route: `/healthcare/demo/intake`), create `src/data/healthcarePricing.ts` for appointment types and pricing, reuse `VoiceNegotiator.tsx` for follow-up calls (route: `/healthcare/demo/voice-followup`). Create `src/pages/healthcare/AppointmentScheduler.tsx` adapted from ProposalGenerator for appointment booking. Add routes to App.tsx.

- [x] VERTICAL-LEGAL-LANDING: Create a Legal/Professional Services vertical. Landing page at `src/pages/Legal.tsx` — hero ("AI Systems Built for Law Firms"), pain points (client intake bottleneck, missed consultations, manual document drafting), solutions (AI intake qualifier, consultation scheduler, voice follow-up). Route: `/legal`. Pricing tiers tailored to firm size. Target keywords: "AI for law firms", "legal automation", "AI client intake".

- [x] VERTICAL-LEGAL-DEMOHUB: Create `src/pages/legal/DemoHub.tsx` with 3 demo cards: AI Client Intake, Smart Consultation Scheduler, AI Follow-Up Caller. Route: `/legal/demo`. Add to Vertical type.

- [x] VERTICAL-LEGAL-DEMOS: Wire up legal demos reusing LeadResponder, ProposalGenerator (adapted for consultation scheduling), and VoiceNegotiator. Create `src/data/legalPricing.ts`. Add routes to App.tsx.

- [x] VERTICAL-RESTAURANT-LANDING: Create a Restaurant/Food Service vertical. Landing page at `src/pages/Restaurant.tsx` — hero ("AI Systems Built for Restaurants & Food Service"), pain points (reservation no-shows, slow online order responses, negative review spirals, staffing headaches), solutions (AI host/reservation manager, smart menu & order assistant, automated review response, AI voice ordering). Route: `/restaurant`. Pricing tiers: Single Location $500/mo, Multi-Location $1,500/mo, Franchise $5,000/mo. FAQ and contact form. Target keywords: "AI for restaurants", "restaurant automation", "AI reservation system", "restaurant review management".

- [x] VERTICAL-RESTAURANT-DEMOHUB: Create `src/pages/restaurant/DemoHub.tsx` with 3 demo cards: AI Reservation & Inquiry Handler (lead qualifier adapted for table bookings, hours, catering inquiries), Smart Menu & Catering Estimator (estimate generator adapted for catering packages, event dining), AI Review Responder (reuse ReviewSystem adapted for restaurant reviews — Yelp/Google tone). Route: `/restaurant/demo`. Add `"restaurant"` to Vertical type.

- [x] VERTICAL-RESTAURANT-DEMOS: Wire up restaurant demos. Reuse `LeadResponder.tsx` for reservation/inquiry handler (route: `/restaurant/demo/reservations`), adapt `EstimateGenerator.tsx` for catering estimates (route: `/restaurant/demo/catering` — create `src/data/restaurantPricing.ts` with categories: private dining, catering, event packages, meal prep subscriptions), reuse `ReviewSystem.tsx` for review management (route: `/restaurant/demo/reviews`). Add all routes to App.tsx.

- [x] VERTICAL-KIDSPLAY-LANDING: Create a Kids Entertainment / Play Place vertical. Landing page at `src/pages/KidsPlay.tsx` — hero ("AI Systems Built for Kids Play Places & Family Entertainment"), pain points (birthday party booking chaos, missed party inquiries, seasonal demand spikes, parent communication gaps), solutions (AI party booking assistant, smart package & pricing estimator, automated parent follow-up, AI voice booking agent). Route: `/kidsplay`. Pricing tiers: Single Venue $400/mo, Multi-Venue $1,200/mo, Franchise $4,000/mo. Target keywords: "AI for kids play places", "birthday party booking automation", "family entertainment center AI", "indoor playground management".

- [x] VERTICAL-KIDSPLAY-DEMOHUB: Create `src/pages/kidsplay/DemoHub.tsx` with 3 demo cards: AI Party Booking Qualifier (lead qualifier adapted for party date, kid count, age range, package preference), Smart Party Package Estimator (proposal generator adapted for party packages, add-ons like face painting, character appearances, food), AI Voice Booking Agent (voice agent adapted for party scheduling and parent Q&A). Route: `/kidsplay/demo`. Add `"kidsplay"` to Vertical type.

- [x] VERTICAL-KIDSPLAY-DEMOS: Wire up kids play demos. Reuse `LeadResponder.tsx` for party inquiry qualifier (route: `/kidsplay/demo/party-booker`), adapt `ProposalGenerator.tsx` for party package estimator (route: `/kidsplay/demo/packages` — create `src/data/kidsplayPricing.ts` with party types: basic, premium, ultimate, custom + add-ons), reuse `VoiceNegotiator.tsx` for voice booking (route: `/kidsplay/demo/voice-booking`). Add routes to App.tsx.

- [x] VERTICAL-FITNESS-LANDING: Create a Fitness / Gym / Studio vertical. Landing page at `src/pages/Fitness.tsx` — hero ("AI Systems Built for Gyms & Fitness Studios"), pain points (member churn, missed trial-to-member conversions, class scheduling gaps, lead follow-up delays), solutions (AI lead qualifier for memberships, smart membership & class estimator, automated member retention calls, AI voice outreach for expired trials). Route: `/fitness`. Pricing tiers: Single Studio $500/mo, Multi-Location $1,500/mo, Franchise $5,000/mo. Target keywords: "AI for gyms", "fitness studio automation", "gym membership AI", "personal training lead generation".

- [x] VERTICAL-FITNESS-DEMOHUB: Create `src/pages/fitness/DemoHub.tsx` with 3 demo cards: AI Membership Qualifier (lead qualifier adapted for fitness goals, budget, schedule), Smart Class & Membership Estimator (proposal generator adapted for membership tiers, class packages, personal training), AI Voice Retention Agent (voice agent adapted for re-engaging expired members and trial follow-ups). Route: `/fitness/demo`. Add `"fitness"` to Vertical type.

- [x] VERTICAL-FITNESS-DEMOS: Wire up fitness demos. Reuse `LeadResponder.tsx` for membership qualifier (route: `/fitness/demo/lead-qualifier`), adapt `ProposalGenerator.tsx` for membership estimator (route: `/fitness/demo/membership` — create `src/data/fitnessPricing.ts` with membership types, class packages, PT sessions, add-ons), reuse `VoiceNegotiator.tsx` for retention calls (route: `/fitness/demo/voice-retention`). Add routes to App.tsx.

- [x] VERTICAL-DENTAL-LANDING: Create a Dental / Orthodontics vertical. Landing page at `src/pages/Dental.tsx` — hero ("AI Systems Built for Dental Practices"), pain points (appointment no-shows, new patient intake bottleneck, insurance verification delays, recall/hygiene appointment gaps), solutions (AI patient intake qualifier, smart treatment estimator, automated recall & follow-up, AI voice appointment reminders). Route: `/dental`. Pricing tiers: Solo Practice $500/mo, Group Practice $1,500/mo, DSO/Multi-Office $5,000/mo. Target keywords: "AI for dentists", "dental practice automation", "dental appointment AI", "patient recall system".

- [x] VERTICAL-DENTAL-DEMOHUB: Create `src/pages/dental/DemoHub.tsx` with 3 demo cards: AI Patient Intake Qualifier (adapted for dental symptoms, insurance, appointment type), Smart Treatment Estimator (estimate generator adapted for procedures: cleaning, fillings, crowns, implants, orthodontics), AI Voice Recall Agent (voice agent for hygiene recall, post-treatment follow-up). Route: `/dental/demo`. Add `"dental"` to Vertical type.

- [x] VERTICAL-DENTAL-DEMOS: Wire up dental demos. Reuse `LeadResponder.tsx` for patient intake (route: `/dental/demo/intake`), adapt `EstimateGenerator.tsx` for treatment estimates (route: `/dental/demo/estimate` — create `src/data/dentalPricing.ts`), reuse `VoiceNegotiator.tsx` for recall agent (route: `/dental/demo/voice-recall`). Add routes to App.tsx.

- [x] VERTICAL-SALON-LANDING: Create a Salon & Spa / Beauty vertical. Landing page at `src/pages/Salon.tsx` — hero ("AI Systems Built for Salons & Spas"), pain points (booking gaps and no-shows, retail product upsell missed, client retention drops, last-minute cancellation losses), solutions (AI booking assistant, smart service & package estimator, automated rebooking reminders, AI voice client outreach). Route: `/salon`. Pricing tiers: Solo Stylist $300/mo, Salon $1,000/mo, Multi-Location $3,500/mo. Target keywords: "AI for salons", "salon booking automation", "spa appointment AI", "beauty business automation".

- [x] VERTICAL-SALON-DEMOHUB: Create `src/pages/salon/DemoHub.tsx` with 3 demo cards: AI Booking Qualifier (adapted for service type, stylist preference, schedule), Smart Service Estimator (proposal generator adapted for services: cuts, color, treatments, packages, bridal), AI Voice Rebooking Agent (voice agent for rebooking reminders and promotions). Route: `/salon/demo`. Add `"salon"` to Vertical type.

- [x] VERTICAL-SALON-DEMOS: Wire up salon demos. Reuse `LeadResponder.tsx` for booking qualifier (route: `/salon/demo/booking`), adapt `ProposalGenerator.tsx` for service estimator (route: `/salon/demo/services` — create `src/data/salonPricing.ts`), reuse `VoiceNegotiator.tsx` for rebooking (route: `/salon/demo/voice-rebook`). Add routes to App.tsx.

- [x] VERTICAL-AUTOREPAIR-LANDING: Create an Auto Repair / Dealership Service vertical. Landing page at `src/pages/AutoRepair.tsx` — hero ("AI Systems Built for Auto Shops & Service Centers"), pain points (estimate disputes and distrust, service advisor bottleneck, missed follow-up on declined services, online review management), solutions (AI service advisor chatbot, transparent estimate generator, automated declined-service follow-up, AI voice service reminders). Route: `/autorepair`. Pricing tiers: Single Shop $500/mo, Multi-Bay $1,500/mo, Dealership $5,000/mo. Target keywords: "AI for auto repair", "auto shop automation", "car dealership AI", "auto service advisor AI".

- [x] VERTICAL-AUTOREPAIR-DEMOHUB: Create `src/pages/autorepair/DemoHub.tsx` with 3 demo cards: AI Service Advisor (lead qualifier adapted for vehicle issues, service history, urgency), Smart Repair Estimator (estimate generator adapted for common repairs: oil change, brakes, tires, engine, transmission, body work), AI Voice Service Reminder (voice agent for maintenance reminders and declined-service follow-up). Route: `/autorepair/demo`. Add `"autorepair"` to Vertical type.

- [x] VERTICAL-AUTOREPAIR-DEMOS: Wire up auto repair demos. Reuse `LeadResponder.tsx` for service advisor (route: `/autorepair/demo/advisor`), adapt `EstimateGenerator.tsx` for repair estimates (route: `/autorepair/demo/estimate` — create `src/data/autorepairPricing.ts`), reuse `VoiceNegotiator.tsx` for service reminders (route: `/autorepair/demo/voice-reminder`). Add routes to App.tsx.

- [x] NAV-INDUSTRIES-DROPDOWN: Update `src/components/Navbar.tsx` to replace the current services navigation with an "Industries" mega-menu dropdown. Group all verticals: Construction, Real Estate, Events, Home Services, Healthcare, Legal, Restaurant, Kids Play, Fitness, Dental, Salon, Auto Repair. Show icons and brief descriptions. Mobile: collapsible accordion. This replaces individual nav entries added by prior vertical tasks.

- [x] INDUSTRIES-DIRECTORY-PAGE: Create `src/pages/Industries.tsx` — a directory page listing all supported industry verticals with cards (icon, name, tagline, link to landing page). Route: `/industries`. Add to footer and navbar. This serves as both a user navigation aid and an SEO hub page linking to all vertical landing pages. Target keywords: "AI automation by industry", "AI for small business". *(completed 2026-04-17)*

### TIER 6 — Quality Assurance + CI/CD

- [x] CI-GITHUB-ACTIONS: Create `.github/workflows/ci.yml` — a GitHub Actions workflow that runs on every push and PR to main. Steps: (1) checkout, (2) setup Node 20, (3) `npm ci`, (4) `npm run lint`, (5) `npm run build`. This catches build and lint errors before Vercel deploys. Use caching for node_modules. *(completed 2026-04-17)*

- [x] CI-LINK-CHECKER: Add a link validation script at `scripts/check-links.ts` that: (1) reads all routes from App.tsx, (2) reads all `<Link to="...">` and `href="..."` patterns across the codebase, (3) verifies every internal link has a matching route, (4) reports mismatches. Add `"check-links": "npx tsx scripts/check-links.ts"` to package.json scripts. Add this step to the GitHub Actions CI workflow. *(completed 2026-04-17)*

- [x] CI-IMAGE-AUDIT: Add `scripts/check-images.ts` that: (1) scans all `.tsx` files for image `src` references (both imports and `/public` paths), (2) verifies each referenced image exists in `public/` or `src/assets/`, (3) checks for unreferenced images that could be cleaned up, (4) reports findings. Add to package.json scripts and CI workflow. Note: currently `/og-realestate.png` and `/og-events.png` exist in public but are not referenced — these should be wired up in the OG meta tag system. *(completed 2026-04-18)*

- [x] FIX-OG-IMAGES: Wire up the unused OG images. In the meta tag system (check `index.html` and the dynamic meta script), ensure `/og-realestate.png` is used for `/realestate` routes and `/og-events.png` is used for `/events` routes. Currently only `/og-default.png` and `/og-construction.png` are referenced. *(completed 2026-04-18)*

- [ ] CI-LIGHTHOUSE: Add a Lighthouse CI step to the GitHub Actions workflow that runs against the production build preview. Use `@lhci/cli` to audit the landing pages (Index, Construction, RealEstate) for performance, accessibility, SEO, and best practices. Set minimum score thresholds: Performance 80, Accessibility 90, SEO 90, Best Practices 90. Fail the build if scores drop below thresholds.

- [ ] SITEMAP-AUTO-GENERATE: Create `scripts/generate-sitemap.ts` that reads all routes from App.tsx and all blog slugs from blogPosts.ts, then generates `public/sitemap.xml` automatically. Add `"sitemap": "npx tsx scripts/generate-sitemap.ts"` to package.json. Add as a pre-build step so the sitemap is always current.

- [ ] META-TAGS-AUDIT: Create `scripts/check-meta.ts` that verifies every route defined in App.tsx has corresponding meta tag configuration (title, description, OG image). Report any routes missing meta data. Add to CI workflow.

- [ ] DEMO-SEO-THIN-CONTENT: Audit all demo pages (LeadResponder, EstimateGenerator, ReviewSystem, PropertyNegotiator, VoiceNegotiator, InquiryQualifier, ProposalGenerator, VoiceBookingAgent) and add descriptive intro paragraphs (150+ words) above the interactive elements. This helps with SEO for individual demo pages, not just the hubs. Include H1 tags with keywords and brief explanations of what each demo does.

- [ ] BLOG-RSS-FEED: Create `scripts/generate-rss.ts` that reads blog posts from `src/data/blogPosts.ts` and generates `public/rss.xml` (RSS 2.0 feed). Add link to RSS feed in the `<head>` of `index.html` and in the blog page footer. This enables RSS readers and automated content distribution.

- [ ] ACCESSIBILITY-AUDIT: Audit all landing pages and demo pages for accessibility: (1) ensure all images have alt text, (2) all form inputs have labels, (3) all interactive elements are keyboard-navigable, (4) color contrast meets WCAG AA, (5) ARIA labels on icon-only buttons. Fix any issues found. Focus on the main conversion paths first (hero → form → success).
