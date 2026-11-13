// Per-industry content for the three shared demo tools (2026-11-13, owner: "we need all ... demos
// fixed up"). Before this, dental/salon/fitness/kidsplay/restaurant/autorepair/homeservices "estimators"
// rendered the construction square-foot calculator, healthcare/legal "schedulers" rendered the events
// guest-count proposal, and every industry's voice follow-up rendered the property negotiator.
//  - QuoteBuilder (src/pages/shared/QuoteBuilder.tsx)         reads QUOTE[vertical]
//  - AppointmentScheduler (src/pages/shared/AppointmentScheduler.tsx) reads SCHEDULE[vertical]
//  - VoiceFollowUp (src/pages/shared/VoiceFollowUp.tsx)        reads VOICE[vertical]
// Prices are illustrative ballparks, matched to src/data/chatProfiles.ts, and every screen says so.

import type { Vertical } from '@/contexts/DemoContext';

/* ─────────────────────────── Quote builder ─────────────────────────── */

export interface QuoteService {
  id: string;
  label: string;
  sub: string;
  low: number;
  high: number;
  perUnit?: boolean;           // multiplied by the quantity
  included?: number;           // a package that covers this many units…
  extraEach?: number;          // …and charges this per unit beyond it
}
export interface QuoteOption { id: string; label: string; sub: string; mult: number }
export interface QuoteExtra { id: string; label: string; low: number; high: number; perUnit?: boolean }

export interface QuoteProfile {
  path: string;
  title: string;               // "Treatment Estimator"
  h1: string;
  intro: string;
  seo: string;
  serviceStep: string;         // "What do you need?"
  services: QuoteService[];
  qty?: { label: string; unit: string; units: string; min: number; max: number; def: number; step?: number };
  options?: { step: string; list: QuoteOption[] };
  extras: { step: string; list: QuoteExtra[] };
  period?: string;             // "/month"
  fine: string;                // the honest small print
  next: string;                // what the AI does next, shown on the result
  cta: string;
}

export const QUOTE: Partial<Record<Vertical, QuoteProfile>> = {
  homeservices: {
    path: '/homeservices/demo/estimate', title: 'Estimate Generator', h1: 'A price range before the truck rolls.',
    intro: 'Pick the job, how soon, and any add-ons. Your customer sees a fair range in seconds.',
    seo: 'This AI estimate demo shows how HVAC, plumbing and electrical companies give homeowners a transparent price range before booking a visit. Customers pick the job, the urgency and any add-ons, and the estimate updates instantly. Instead of a "call for a quote" form that loses half its visitors, the homeowner leaves with a number and a booked time window.',
    serviceStep: 'What needs doing?',
    services: [
      { id: 'diag', label: 'Diagnostic visit', sub: 'A tech finds the problem', low: 89, high: 89 },
      { id: 'drain', label: 'Drain clearing', sub: 'Sink, tub or main line', low: 150, high: 350 },
      { id: 'heater', label: 'Water heater', sub: 'Replace a tank unit', low: 1400, high: 3200 },
      { id: 'acrepair', label: 'AC repair', sub: 'Depends on the part', low: 150, high: 800 },
      { id: 'acnew', label: 'New AC system', sub: 'Installed and permitted', low: 5500, high: 12000 },
      { id: 'panel', label: 'Electrical panel', sub: 'Upgrade to 200 amp', low: 1800, high: 4000 },
    ],
    options: { step: 'How soon?', list: [
      { id: 'sched', label: 'This week', sub: 'Standard rate', mult: 1 },
      { id: 'same', label: 'Today', sub: 'Same-day dispatch', mult: 1.15 },
      { id: 'after', label: 'Tonight or weekend', sub: 'After-hours rate', mult: 1.5 },
    ] },
    extras: { step: 'Anything else?', list: [
      { id: 'plan', label: 'Yearly maintenance plan', low: 149, high: 199 },
      { id: 'permit', label: 'Permit and inspection', low: 100, high: 300 },
      { id: 'haul', label: 'Old unit haul-away', low: 50, high: 100 },
    ] },
    fine: 'Illustrative prices for a demo. The tech confirms the final price on site before any work starts.',
    next: 'The AI texts the estimate, offers two arrival windows, and books the visit.',
    cta: 'Book this visit',
  },
  restaurant: {
    path: '/restaurant/demo/catering', title: 'Catering Estimator', h1: 'A catering quote in one minute.',
    intro: 'Headcount, style and extras. The quote builds itself while the planner is still on your site.',
    seo: 'This AI catering estimator demo shows how restaurants turn catering inquiries into quotes while the planner is still interested. Guests pick a service style, a headcount and a menu level, add bar service or rentals, and see a per-guest and total price straight away. The AI then sends the quote and holds the date, so catering leads stop waiting days for a callback.',
    serviceStep: 'What style of service?',
    services: [
      { id: 'dropoff', label: 'Drop-off buffet', sub: 'Delivered and set up', low: 18, high: 24, perUnit: true },
      { id: 'buffet', label: 'Staffed buffet', sub: 'Servers on site', low: 32, high: 45, perUnit: true },
      { id: 'plated', label: 'Plated dinner', sub: 'Three courses, served', low: 55, high: 85, perUnit: true },
      { id: 'cocktail', label: 'Cocktail reception', sub: 'Passed bites and stations', low: 28, high: 40, perUnit: true },
    ],
    qty: { label: 'How many guests?', unit: 'guest', units: 'guests', min: 10, max: 400, def: 50, step: 5 },
    options: { step: 'Menu level', list: [
      { id: 'classic', label: 'Classic', sub: 'Our most-ordered dishes', mult: 1 },
      { id: 'signature', label: 'Signature', sub: "The chef's specialties", mult: 1.2 },
      { id: 'chef', label: "Chef's table", sub: 'Custom menu', mult: 1.45 },
    ] },
    extras: { step: 'Add-ons', list: [
      { id: 'bar', label: 'Bar service', low: 15, high: 22, perUnit: true },
      { id: 'dessert', label: 'Dessert table', low: 6, high: 9, perUnit: true },
      { id: 'rentals', label: 'Linens and rentals', low: 4, high: 8, perUnit: true },
      { id: 'cake', label: 'Cake cutting', low: 75, high: 150 },
    ] },
    fine: 'Illustrative prices for a demo. Tax and an 18% service charge are added on the final contract.',
    next: 'The AI emails the quote, holds the date for 48 hours, and asks for the menu tasting.',
    cta: 'Hold my date',
  },
  kidsplay: {
    path: '/kidsplay/demo/packages', title: 'Package Estimator', h1: 'The right party, priced in seconds.',
    intro: 'Pick a package and how many kids. Parents see the total before they ever call.',
    seo: 'This AI party package estimator demo shows how kids play centers help parents choose and price a birthday party online. Parents pick a package, enter the number of kids and add food or extras, and the price updates instantly, including extra children beyond the package. The AI then holds the slot with a deposit, so weekend parties fill without the front desk on the phone.',
    serviceStep: 'Which package?',
    services: [
      { id: 'basic', label: 'Play party', sub: 'Up to 10 kids, 90 minutes', low: 299, high: 299, included: 10, extraEach: 18 },
      { id: 'deluxe', label: 'Deluxe party', sub: 'Up to 15 kids, private room', low: 449, high: 449, included: 15, extraEach: 18 },
      { id: 'ultimate', label: 'Ultimate party', sub: 'Up to 20 kids, host and room', low: 599, high: 599, included: 20, extraEach: 18 },
    ],
    qty: { label: 'How many kids?', unit: 'child', units: 'kids', min: 5, max: 40, def: 15 },
    extras: { step: 'Food and extras', list: [
      { id: 'pizza', label: 'Pizza and drinks', low: 12, high: 12, perUnit: true },
      { id: 'cake', label: 'Birthday cake', low: 45, high: 65 },
      { id: 'goodie', label: 'Goodie bags', low: 6, high: 6, perUnit: true },
      { id: 'adult', label: 'Adult snack tray', low: 49, high: 49 },
    ] },
    fine: 'Illustrative prices for a demo. A deposit holds the slot; the balance is due on the day.',
    next: 'The AI shows open Saturday slots, takes the deposit, and sends the invite link.',
    cta: 'Hold this party',
  },
  fitness: {
    path: '/fitness/demo/membership', title: 'Membership Estimator', h1: 'The right plan, and what it costs.',
    intro: 'Pick how you train and how long you commit. The monthly price is right there.',
    seo: 'This AI membership estimator demo shows how gyms and fitness studios match prospects to the right plan and show the price up front. Visitors pick how they like to train, a commitment length and add-ons like personal training, and see their monthly cost instantly. The AI then books a free first class, so price-shoppers become trial members instead of bouncing.',
    serviceStep: 'How do you want to train?',
    services: [
      { id: 'gym', label: 'Open gym', sub: 'Equipment, any hour', low: 59, high: 59 },
      { id: 'classes', label: 'Gym and classes', sub: 'Unlimited group classes', low: 99, high: 99 },
      { id: 'premium', label: 'Premium', sub: 'Classes, recovery, guest passes', low: 149, high: 149 },
    ],
    options: { step: 'Commitment', list: [
      { id: 'm2m', label: 'Month to month', sub: 'Cancel anytime', mult: 1 },
      { id: 'six', label: '6 months', sub: 'Save 10%', mult: 0.9 },
      { id: 'year', label: '12 months', sub: 'Save 20%', mult: 0.8 },
    ] },
    extras: { step: 'Add-ons', list: [
      { id: 'pt', label: 'Personal training, 4 sessions', low: 240, high: 360 },
      { id: 'nutrition', label: 'Nutrition coaching', low: 79, high: 99 },
      { id: 'towel', label: 'Towel and locker', low: 15, high: 15 },
    ] },
    period: '/month',
    fine: 'Illustrative prices for a demo. Your first class is free.',
    next: 'The AI books a free first class and texts a reminder the night before.',
    cta: 'Book my free class',
  },
  dental: {
    path: '/dental/demo/estimate', title: 'Treatment Estimator', h1: 'What will it cost? Answered.',
    intro: 'Pick the treatment and how many teeth. Patients see a self-pay range before they call.',
    seo: 'This AI treatment estimator demo shows how dental practices answer the question patients ask most: what will it cost? Patients pick a treatment, the number of teeth and any add-ons, and see a self-pay range in plain language. The AI explains that insurance often covers part of it, then books an exam, so cost-anxious patients book instead of putting it off.',
    serviceStep: 'Which treatment?',
    services: [
      { id: 'newpt', label: 'New-patient visit', sub: 'Exam, X-rays and cleaning', low: 199, high: 199 },
      { id: 'filling', label: 'Filling', sub: 'Tooth-colored', low: 150, high: 300, perUnit: true },
      { id: 'crown', label: 'Crown', sub: 'Porcelain', low: 1000, high: 1500, perUnit: true },
      { id: 'rootcanal', label: 'Root canal', sub: 'Front or back tooth', low: 900, high: 1400, perUnit: true },
      { id: 'whitening', label: 'Whitening', sub: 'In-office', low: 350, high: 650 },
      { id: 'invisalign', label: 'Clear aligners', sub: 'Full treatment', low: 3500, high: 6500 },
    ],
    qty: { label: 'How many teeth?', unit: 'tooth', units: 'teeth', min: 1, max: 8, def: 1 },
    extras: { step: 'Comfort and extras', list: [
      { id: 'nitrous', label: 'Laughing gas', low: 50, high: 100 },
      { id: 'xray', label: '3D scan', low: 150, high: 250 },
      { id: 'guard', label: 'Night guard', low: 300, high: 500 },
    ] },
    fine: 'Self-pay ranges for a demo. Insurance often covers part of it; the dentist confirms after an exam.',
    next: 'The AI checks their insurance, explains what is likely covered, and books the exam.',
    cta: 'Book an exam',
  },
  salon: {
    path: '/salon/demo/services', title: 'Service Estimator', h1: 'Know the price before the chair.',
    intro: 'Pick the service, the stylist level and any treatments. No surprises at checkout.',
    seo: 'This AI service estimator demo shows how salons price a visit before the client books. Clients pick a service, a stylist level and add-on treatments, and see the price range straight away. The AI then books the right stylist for the right length of time, so color clients stop getting booked into haircut slots and checkout has no surprises.',
    serviceStep: 'What are you booking?',
    services: [
      { id: 'cut', label: "Women's cut", sub: 'Wash, cut and style', low: 65, high: 95 },
      { id: 'mens', label: "Men's cut", sub: 'Cut and finish', low: 35, high: 55 },
      { id: 'color', label: 'Color', sub: 'Single process', low: 110, high: 180 },
      { id: 'balayage', label: 'Balayage', sub: 'Hand-painted', low: 180, high: 320 },
      { id: 'blowout', label: 'Blowout', sub: 'Wash and style', low: 45, high: 60 },
      { id: 'keratin', label: 'Smoothing treatment', sub: 'Lasts about 3 months', low: 250, high: 400 },
    ],
    options: { step: 'Stylist level', list: [
      { id: 'stylist', label: 'Stylist', sub: 'Great work, best value', mult: 1 },
      { id: 'senior', label: 'Senior stylist', sub: '5+ years', mult: 1.2 },
      { id: 'master', label: 'Master stylist', sub: 'Our most requested', mult: 1.4 },
    ] },
    extras: { step: 'Treatments', list: [
      { id: 'gloss', label: 'Gloss or toner', low: 40, high: 60 },
      { id: 'bond', label: 'Bond repair treatment', low: 30, high: 45 },
      { id: 'deep', label: 'Deep conditioning', low: 25, high: 35 },
    ] },
    fine: 'Illustrative prices for a demo. Final price depends on hair length and thickness.',
    next: 'The AI books the right stylist for the right length of time and sends prep tips.',
    cta: 'Book this service',
  },
  autorepair: {
    path: '/autorepair/demo/estimate', title: 'Repair Estimator', h1: 'A fair repair range, up front.',
    intro: 'Pick the repair and the parts you want. Drivers see a range before they drop off the keys.',
    seo: 'This AI repair estimator demo shows how auto shops give drivers an honest price range before drop-off. Drivers pick the repair, the parts grade and any add-on maintenance, and see the range instantly. The AI then books a drop-off time and texts updates, so shoppers who call five shops pick the one that answered first.',
    serviceStep: 'What does the car need?',
    services: [
      { id: 'diag', label: 'Diagnostic', sub: 'Check engine light and more', low: 129, high: 129 },
      { id: 'brakes', label: 'Brake pads and rotors', sub: 'Per axle', low: 350, high: 650, perUnit: true },
      { id: 'oil', label: 'Synthetic oil change', sub: 'With inspection', low: 79, high: 99 },
      { id: 'align', label: 'Alignment', sub: 'Four wheels', low: 119, high: 149 },
      { id: 'battery', label: 'Battery', sub: 'Tested and installed', low: 180, high: 280 },
      { id: 'timing', label: 'Timing belt', sub: 'With water pump', low: 600, high: 1100 },
    ],
    qty: { label: 'How many axles?', unit: 'axle', units: 'axles', min: 1, max: 2, def: 1 },
    options: { step: 'Parts', list: [
      { id: 'econ', label: 'Economy', sub: 'Budget aftermarket', mult: 0.85 },
      { id: 'oe', label: 'OE-equivalent', sub: 'Same spec, less cost', mult: 1 },
      { id: 'oem', label: 'Dealer OEM', sub: 'Factory parts', mult: 1.25 },
    ] },
    extras: { step: 'While it is in', list: [
      { id: 'rotate', label: 'Tire rotation', low: 25, high: 40 },
      { id: 'cabin', label: 'Cabin air filter', low: 45, high: 70 },
      { id: 'flush', label: 'Brake fluid flush', low: 120, high: 180 },
    ] },
    fine: 'Illustrative prices for a demo. The diagnostic fee is applied to the repair.',
    next: 'The AI books a drop-off time, texts updates, and sends photos before any extra work.',
    cta: 'Book a drop-off',
  },
};

/* ─────────────────────────── Appointment scheduler ─────────────────────────── */

export interface ScheduleReason { id: string; label: string; sub: string; minutes: number; fee?: string; prep: string[]; urgent?: boolean }
export interface ScheduleProfile {
  path: string;
  title: string;
  h1: string;
  intro: string;
  seo: string;
  reasonStep: string;
  reasons: ScheduleReason[];
  withStep: string;
  with: { id: string; label: string; sub: string }[];
  modes: { id: string; label: string }[];
  nameLabel: string;
  extraField?: { label: string; placeholder: string; note: string };
  fine: string;
  confirmText: (o: { company: string; first: string; reason: string; who: string; when: string; mode: string }) => string;
  reminderText: (o: { company: string; first: string; when: string; prep: string }) => string;
}

export const SCHEDULE: Partial<Record<Vertical, ScheduleProfile>> = {
  healthcare: {
    path: '/healthcare/demo/scheduler', title: 'Scheduler', h1: 'Booked in four taps. No hold music.',
    intro: 'Patients pick why they are coming, who they see and a time. The AI confirms and reminds them.',
    seo: 'This AI appointment scheduler demo shows how clinics let patients book the right visit type with the right provider, at any hour. Patients pick a reason for the visit, a provider and an open time; sick visits are offered same-day slots first. The AI sends the confirmation, what to bring and a reminder, which cuts phone volume at the front desk and reduces no-shows.',
    reasonStep: 'What is the visit for?',
    reasons: [
      { id: 'new', label: 'New patient visit', sub: '40 minutes', minutes: 40, prep: ['Photo ID and insurance card', 'A list of your current medications', 'Arrive 15 minutes early for forms'] },
      { id: 'physical', label: 'Annual physical', sub: '30 minutes', minutes: 30, prep: ['Fast for 8 hours if you want lab work', 'Your insurance card'] },
      { id: 'sick', label: 'Sick visit', sub: 'Same-day slots first', minutes: 20, urgent: true, prep: ['Your insurance card', 'When symptoms started and any temperature readings'] },
      { id: 'follow', label: 'Follow-up', sub: '15 minutes', minutes: 15, prep: ['Any new test results or questions'] },
      { id: 'tele', label: 'Telehealth', sub: 'Video from home', minutes: 15, fee: 'Self-pay from $79', prep: ['A quiet spot with good light', 'The link we text you 10 minutes before'] },
    ],
    withStep: 'Who would you like to see?',
    with: [
      { id: 'any', label: 'First available', sub: 'Fastest' },
      { id: 'md', label: 'A physician', sub: 'MD or DO' },
      { id: 'np', label: 'A nurse practitioner', sub: 'Often sooner' },
    ],
    modes: [{ id: 'office', label: 'In the office' }, { id: 'video', label: 'By video' }],
    nameLabel: 'Patient name',
    fine: 'A demo with sample availability. The AI never gives medical advice; anything urgent goes straight to a nurse or 911.',
    confirmText: ({ company, first, reason, who, when, mode }) => `Hi ${first}, you're booked at ${company}: ${reason.toLowerCase()} with ${who.toLowerCase()}, ${when}, ${mode.toLowerCase()}. Reply C to confirm or R to reschedule.`,
    reminderText: ({ company, first, when, prep }) => `Reminder from ${company}: see you ${when}, ${first}. Please bring ${prep}.`,
  },
  legal: {
    path: '/legal/demo/consultation', title: 'Consultation Scheduler', h1: 'From inquiry to consultation, in one visit.',
    intro: 'Clients pick their matter, the attorney and a time. The AI runs the conflict check first.',
    seo: 'This AI consultation scheduler demo shows how law firms turn an inquiry into a booked consultation with the right attorney. The prospective client picks the type of matter, an attorney and a time, and gives the other party\'s name so the firm can run a conflict check before the meeting. The AI sends the confirmation and what documents to bring, so intake staff spend time on clients instead of calendars.',
    reasonStep: 'What is the matter about?',
    reasons: [
      { id: 'pi', label: 'Personal injury', sub: 'Free consultation', minutes: 30, fee: 'Free', prep: ['Photos, the police report and medical bills', 'Your insurance information'] },
      { id: 'family', label: 'Family law', sub: 'Divorce, custody, support', minutes: 45, fee: '$150', prep: ['Any court papers you have received', 'A rough list of assets and debts'] },
      { id: 'estate', label: 'Estate planning', sub: 'Wills and trusts', minutes: 45, fee: '$150', prep: ['A list of what you own and who you want it to go to'] },
      { id: 'business', label: 'Business law', sub: 'Contracts and disputes', minutes: 30, fee: '$150', prep: ['The contract or letter in question'] },
      { id: 'criminal', label: 'Criminal defense', sub: 'Urgent matters first', minutes: 30, fee: '$150', urgent: true, prep: ['Any paperwork from the arrest or court date'] },
    ],
    withStep: 'Who would you like to meet?',
    with: [
      { id: 'any', label: 'First available attorney', sub: 'Fastest' },
      { id: 'partner', label: 'A senior partner', sub: '20+ years' },
      { id: 'assoc', label: 'An associate attorney', sub: 'Often sooner' },
    ],
    modes: [{ id: 'office', label: 'In the office' }, { id: 'video', label: 'By video' }, { id: 'phone', label: 'By phone' }],
    nameLabel: 'Your name',
    extraField: { label: 'Other party\'s name', placeholder: 'e.g. Acme Insurance', note: 'For the conflict check. The AI checks it before the meeting is confirmed.' },
    fine: 'A demo with sample availability. Booking a consultation does not create an attorney-client relationship, and the AI never gives legal advice.',
    confirmText: ({ company, first, reason, who, when, mode }) => `Hi ${first}, your ${reason.toLowerCase()} consultation at ${company} is set: ${who.toLowerCase()}, ${when}, ${mode.toLowerCase()}. We'll confirm once our conflict check clears.`,
    reminderText: ({ company, first, when, prep }) => `Reminder from ${company}: your consultation is ${when}, ${first}. Please bring ${prep}.`,
  },
};

/* ─────────────────────────── Voice follow-up ─────────────────────────── */

export interface VoiceProfile {
  path: string;
  title: string;               // "Voice Recall"
  h1: string;
  intro: string;
  seo: string;
  business: string;            // "a dental practice"
  caller: string;              // "the front desk"
  contact: string;             // "Patient"
  contactPlaceholder: string;
  purposes: { id: string; label: string; goal: string }[];
  detailLabel: string;
  detailPlaceholder: string;
  notesPlaceholder: string;
  slots: string;
  strategy: string[];
  rules: string[];
  opener: (company: string, first: string, purpose: string) => string;
}

export const VOICE: Partial<Record<Vertical, VoiceProfile>> = {
  homeservices: {
    path: '/homeservices/demo/voice-followup', title: 'Voice Follow-Up', h1: 'Every quote gets a call back.',
    intro: 'The AI calls about open quotes and missed visits, answers questions, and books the job.',
    seo: 'This AI voice follow-up demo shows how HVAC, plumbing and electrical companies follow up on every open quote and missed appointment without tying up the office. Enter a customer and the job, and the AI calls, answers questions about the quote, handles price objections politely and books a visit window. After the call you get a transcript and a summary.',
    business: 'a home services company (HVAC, plumbing and electrical)', caller: 'the office', contact: 'Customer', contactPlaceholder: 'e.g. Dana Lopez',
    purposes: [
      { id: 'quote', label: 'Follow up on a quote', goal: 'see if they have questions about the quote and book the job' },
      { id: 'noshow', label: 'Reschedule a missed visit', goal: 'find a new time for the visit they missed' },
      { id: 'tuneup', label: 'Seasonal tune-up', goal: 'book their seasonal tune-up before the rush' },
    ],
    detailLabel: 'Job', detailPlaceholder: 'e.g. Water heater replacement, quoted $2,400',
    notesPlaceholder: 'e.g. 15-year-old tank, leaking at the base. Asked about financing.',
    slots: 'Tuesday 8 to 10am, Wednesday 1 to 3pm, Friday 10am to noon',
    strategy: ['Remind them of the job and the quote', 'Answer questions and price concerns honestly', 'Offer two arrival windows', 'Confirm the address and the best number'],
    rules: ['If they describe gas smell, sparks or flooding, tell them to call 911 or the emergency line now.', 'Never pressure; offer financing info if price is the concern.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. I'm following up on the quote we sent over. Do you have a quick minute?`,
  },
  healthcare: {
    path: '/healthcare/demo/voice-followup', title: 'Voice Follow-Up', h1: 'Reminders and recalls, made by voice.',
    intro: 'The AI calls patients who are due, confirms appointments, and rebooks no-shows.',
    seo: 'This AI voice follow-up demo shows how clinics call patients who are due for a visit, confirm tomorrow\'s appointments and rebook no-shows, without front-desk staff on the phone all afternoon. Enter a patient and the reason, and the AI calls, offers open times and books one, never giving medical advice. After the call you get a transcript and summary.',
    business: 'a primary and urgent care clinic', caller: 'the front desk', contact: 'Patient', contactPlaceholder: 'e.g. Maria Chen',
    purposes: [
      { id: 'recall', label: 'Due for a visit', goal: 'book their overdue annual physical or follow-up' },
      { id: 'confirm', label: 'Confirm an appointment', goal: "confirm tomorrow's appointment or reschedule it" },
      { id: 'noshow', label: 'Rebook a no-show', goal: 'kindly rebook the appointment they missed' },
    ],
    detailLabel: 'Visit', detailPlaceholder: 'e.g. Annual physical, last seen March 2025',
    notesPlaceholder: 'e.g. Prefers mornings. Needs fasting labs.',
    slots: 'Monday 9am, Wednesday 11:30am, Thursday 4pm',
    strategy: ['Say who is calling and why', 'Offer open times that fit', 'Remind them what to bring', 'Never discuss results or give medical advice'],
    rules: ['Never give medical advice or discuss test results; offer a nurse callback instead.', 'If they describe an emergency, tell them to call 911.', 'Do not say the diagnosis or reason for the visit out loud beyond the visit type.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. I'm calling about scheduling your next visit. Is now an okay time?`,
  },
  legal: {
    path: '/legal/demo/voice-followup', title: 'Voice Follow-Up', h1: 'No inquiry goes cold.',
    intro: 'The AI calls back missed calls and unbooked inquiries, and schedules the consultation.',
    seo: 'This AI voice follow-up demo shows how law firms call back missed calls and unbooked inquiries within minutes, before the prospective client hires someone else. Enter the person and their matter, and the AI calls, collects the basics, explains the consultation and books it, without giving legal advice. After the call you get a transcript and summary for intake.',
    business: 'a law firm', caller: 'the intake team', contact: 'Prospective client', contactPlaceholder: 'e.g. James Carter',
    purposes: [
      { id: 'missed', label: 'Return a missed call', goal: 'find out what they need and book a consultation' },
      { id: 'unbooked', label: 'Follow up an inquiry', goal: 'book the consultation they asked about online' },
      { id: 'reminder', label: 'Consultation reminder', goal: 'confirm their consultation and what to bring' },
    ],
    detailLabel: 'Matter', detailPlaceholder: 'e.g. Car accident last week, rear-ended',
    notesPlaceholder: 'e.g. Submitted the web form at 9pm. Has the police report.',
    slots: 'Tuesday 10am, Wednesday 2pm, Friday 9am',
    strategy: ['Return the call and confirm the matter', 'Collect the basics for a conflict check', 'Explain the consultation and the fee', 'Book a time with an attorney'],
    rules: ['Never give legal advice or predict an outcome; the attorney covers that in the consultation.', 'Booking does not create an attorney-client relationship; say so if asked.', 'Ask for the other party\'s name for a conflict check.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. You reached out to us, and I wanted to make sure we got back to you. Do you have a minute?`,
  },
  kidsplay: {
    path: '/kidsplay/demo/voice-booking', title: 'Voice Booking Agent', h1: 'Party calls, answered and booked.',
    intro: 'The AI calls parents back, picks the package, and holds the Saturday slot.',
    seo: 'This AI voice booking demo shows how kids play centers call parents back about birthday parties and book them, even on the busiest weekend. Enter the parent and the party details, and the AI calls, recommends a package, checks the date and holds the slot with a deposit. After the call you get a transcript and a booking summary.',
    business: 'a kids play center that hosts birthday parties', caller: 'the party coordinator', contact: 'Parent', contactPlaceholder: 'e.g. Priya Shah',
    purposes: [
      { id: 'inquiry', label: 'Party inquiry callback', goal: 'pick a package and hold a party date' },
      { id: 'deposit', label: 'Hold expiring', goal: 'confirm the party and take the deposit before the hold expires' },
      { id: 'details', label: 'Party-week check-in', goal: 'confirm headcount, food and allergies' },
    ],
    detailLabel: 'Party', detailPlaceholder: "e.g. Maya's 6th birthday, about 15 kids",
    notesPlaceholder: 'e.g. Wants a Saturday afternoon. One child has a nut allergy.',
    slots: 'Saturday 11am, Saturday 2pm, Sunday 1pm',
    strategy: ['Get excited about the birthday', 'Recommend the package that fits the headcount', 'Offer open slots', 'Hold it with a deposit and note allergies'],
    rules: ['Always ask about food allergies.', 'Packages run 299 to 599 dollars for up to 20 kids; extra kids are 18 dollars each.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}! This is calling from ${c} about the birthday party you asked about. Is now a good time?`,
  },
  fitness: {
    path: '/fitness/demo/voice-retention', title: 'Voice Retention', h1: 'Lapsed members, welcomed back.',
    intro: 'The AI calls members who stopped coming, listens, and books them back in.',
    seo: 'This AI voice retention demo shows how gyms and studios call lapsed members before they cancel. Enter the member and how long they have been away, and the AI calls, asks what got in the way, offers a fix like a different class time or a plan freeze, and books their next visit. After the call you get a transcript and a summary.',
    business: 'a fitness studio and gym', caller: 'the membership team', contact: 'Member', contactPlaceholder: 'e.g. Chris Morgan',
    purposes: [
      { id: 'lapsed', label: 'Lapsed member', goal: 'find out what got in the way and book their next class' },
      { id: 'cancel', label: 'Asked to cancel', goal: 'understand why and offer a freeze or a cheaper plan before they go' },
      { id: 'trial', label: 'Trial ending', goal: 'turn their trial into a membership' },
    ],
    detailLabel: 'Membership', detailPlaceholder: 'e.g. Gym and classes, last visit 5 weeks ago',
    notesPlaceholder: 'e.g. Used to come to 6am spin. Mentioned a new job.',
    slots: 'Tomorrow 6am spin, Thursday 6pm strength, Saturday 9am yoga',
    strategy: ['Check in like a friend, not a bill collector', 'Ask what got in the way', 'Offer a fix: new class time, freeze, coach session', 'Book the next visit'],
    rules: ['Never guilt them. If they want to cancel, offer a freeze once, then respect it.'],
    opener: (c, f) => `Hey${f ? ` ${f}` : ''}, this is calling from ${c}. We've missed you around here, and I just wanted to check in. Got a minute?`,
  },
  dental: {
    path: '/dental/demo/voice-recall', title: 'Voice Recall', h1: 'Recall calls that fill the schedule.',
    intro: 'The AI calls patients due for a cleaning, handles questions, and books them in.',
    seo: 'This AI voice recall demo shows how dental practices call patients who are overdue for a cleaning or unscheduled treatment, without the front desk spending afternoons on the phone. Enter the patient and what they are due for, and the AI calls, answers insurance and cost questions in plain language and books two concrete times. After the call you get a transcript and a summary.',
    business: 'a dental practice', caller: 'the front desk', contact: 'Patient', contactPlaceholder: 'e.g. Sam Rivera',
    purposes: [
      { id: 'recall', label: 'Due for a cleaning', goal: 'book their six-month cleaning and exam' },
      { id: 'treatment', label: 'Unscheduled treatment', goal: 'book the treatment the dentist recommended' },
      { id: 'noshow', label: 'Missed appointment', goal: 'kindly rebook the appointment they missed' },
    ],
    detailLabel: 'Due for', detailPlaceholder: 'e.g. Cleaning, last visit 9 months ago',
    notesPlaceholder: 'e.g. Delta PPO. Nervous patient, likes early mornings.',
    slots: 'Tuesday 8am, Wednesday 3:30pm, Friday 10am',
    strategy: ['Say who is calling and why', 'Answer insurance and cost questions simply', 'Offer two concrete times', 'Confirm and send a text reminder'],
    rules: ['Never diagnose. Anything clinical goes to the dentist.', 'If they have swelling or severe pain, offer the same-day emergency slot.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. Our records show you're due for a visit, and I'd love to get you on the schedule. Is now a good time?`,
  },
  salon: {
    path: '/salon/demo/voice-rebook', title: 'Voice Rebook', h1: 'The next visit, booked before they forget.',
    intro: 'The AI calls clients after a visit, checks they are happy, and books the next one.',
    seo: 'This AI voice rebook demo shows how salons keep the chair full by calling clients when they are due for their next visit. Enter the client, their last service and their stylist, and the AI calls, checks they loved the result, and books the next appointment with the same stylist. After the call you get a transcript and a summary.',
    business: 'a hair salon and spa', caller: 'the front desk', contact: 'Client', contactPlaceholder: 'e.g. Olivia Brooks',
    purposes: [
      { id: 'rebook', label: 'Due for next visit', goal: 'book their next appointment with the same stylist' },
      { id: 'checkin', label: 'After-visit check-in', goal: 'make sure they love the result and book the next visit' },
      { id: 'lapsed', label: "Haven't been in a while", goal: 'welcome them back and book a visit' },
    ],
    detailLabel: 'Last service', detailPlaceholder: 'e.g. Balayage with Jess, 8 weeks ago',
    notesPlaceholder: 'e.g. Likes Saturday mornings. Asked about a gloss next time.',
    slots: 'Thursday 5pm, Saturday 10am, Saturday 1pm',
    strategy: ['Check they love the result', 'Suggest the right time for their next visit', 'Book with the same stylist', 'Mention an add-on only if it fits'],
    rules: ['If they were unhappy, apologize, and offer a free fix with the stylist or the manager.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. Just checking in after your last visit. Do you have a quick minute?`,
  },
  autorepair: {
    path: '/autorepair/demo/voice-reminder', title: 'Voice Reminder', h1: 'Due for service? The shop calls.',
    intro: 'The AI calls drivers who are due or overdue, explains why it matters, and books a drop-off.',
    seo: 'This AI voice reminder demo shows how auto repair shops call customers who are due for maintenance or who declined a repair last visit. Enter the driver, the vehicle and what is due, and the AI calls, explains why it matters in plain language without scare tactics, and books a drop-off time. After the call you get a transcript and a summary.',
    business: 'an auto repair shop', caller: 'the service advisor', contact: 'Customer', contactPlaceholder: 'e.g. Marcus Hill',
    purposes: [
      { id: 'due', label: 'Maintenance due', goal: 'book their due maintenance' },
      { id: 'declined', label: 'Declined repair', goal: 'follow up on the repair they postponed last visit' },
      { id: 'ready', label: 'Car is ready', goal: 'tell them the car is ready and confirm pickup' },
    ],
    detailLabel: 'Vehicle and service', detailPlaceholder: 'e.g. 2019 Honda CR-V, oil change and rotation due',
    notesPlaceholder: 'e.g. Front pads at 3mm last visit. Prefers a loaner.',
    slots: 'Monday 7:30am, Tuesday 8am, Thursday noon',
    strategy: ['Say what is due and why it matters', 'Give a price range if asked', 'Offer drop-off times and a loaner or shuttle', 'Confirm the vehicle and best number'],
    rules: ['No scare tactics. Explain plainly and let them decide.', 'Prices: synthetic oil change 79 dollars, brake pads and rotors 350 to 650 dollars per axle.'],
    opener: (c, f) => `Hi${f ? ` ${f}` : ''}, this is calling from ${c}. I'm calling about your vehicle. Do you have a quick minute?`,
  },
};

export function buildVoicePrompt(p: VoiceProfile, o: { company: string; contact: string; purposeId: string; detail: string; notes: string; slots: string }): string {
  const purpose = p.purposes.find((x) => x.id === o.purposeId) || p.purposes[0];
  return `You're calling on behalf of ${o.company}, ${p.business}. You're from ${p.caller}. The goal of this call: ${purpose.goal}.

CONTEXT:
- ${p.contact}: ${o.contact || 'Not given'}
- ${p.detailLabel}: ${o.detail || 'Not given'}
- Notes: ${o.notes || 'None'}
- Open times you can offer: ${o.slots}

HOW YOU TALK:
You sound like a real person: warm, natural, relaxed. Short sentences and contractions. One or two sentences at a time, then let them talk. Match their energy. Never give your name unless asked; you're just "calling from ${o.company}".

Write everything as spoken words. Your text goes through text-to-speech. No dollar signs, special characters or digits for money; say prices the way you'd say them out loud, like "about seventy nine dollars" or "around two thousand four hundred".

YOUR PLAN:
${p.strategy.map((s, i) => `${i + 1}. ${s}`).join('\n')}

GROUND RULES:
${p.rules.map((r) => `- ${r}`).join('\n')}
- If they're busy, offer to call back at a better time and ask when.
- If they ask, be honest that you're an AI assistant for ${o.company}.
- Don't be pushy. If they say no, thank them and wrap up kindly.

WRAPPING UP:
Once a time is confirmed (or they decline), recap it in one sentence, thank them, say goodbye, and call the endCall function.`;
}
