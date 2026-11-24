// Catalog of every live demo (moved out of src/pages/Demos.tsx so the v3 landing can count from it).
// Sourced 1:1 from the /.../demo/<tool> routes in src/App.tsx; no demo is invented.
export interface DemoLink {
  title: string;
  description: string;
  // Path of an existing /.../demo/<tool> route registered in src/App.tsx.
  path: string;
}

export interface DemoGroup {
  vertical: string;
  demos: DemoLink[];
}

// Catalog of every live demo, sourced 1:1 from the /.../demo/<tool> routes in
// src/App.tsx. Adding a demo route there is a one-line addition here. No demo is
// invented; each path below resolves to a registered route.
export const DEMO_GROUPS: DemoGroup[] = [
  {
    vertical: 'Construction',
    demos: [
      { title: 'AI Lead Responder', description: 'Qualifies inbound construction leads in under a minute by project type, budget, and timeline.', path: '/construction/demo/lead-responder' },
      { title: 'Smart Estimate Generator', description: 'Builds an interactive cost estimate for additions, kitchens, baths, and renovations.', path: '/construction/demo/estimate' },
      { title: 'Invoice Generator', description: 'Turns project details into a clean, itemized invoice in seconds.', path: '/construction/demo/invoice' },
      { title: 'SMS Follow-Up Sequence', description: 'Drafts a multi-step text follow-up sequence to keep leads warm.', path: '/construction/demo/sms-sequence' },
      { title: 'Lead Scoring', description: 'Scores a pasted lead from 1 to 100 with reasoning on budget fit and urgency.', path: '/construction/demo/lead-scoring' },
      { title: 'Review System', description: 'Automates Google review requests and on-brand responses at scale.', path: '/construction/demo/reviews' },
      { title: 'Deal Analyzer', description: 'Runs comps, calculates a max bid, and drafts seller outreach for a property.', path: '/construction/demo/property-negotiator' },
      { title: 'Voice Negotiator', description: 'A live AI voice agent that calls sellers, qualifies, and negotiates by phone.', path: '/construction/demo/voice-negotiator' },
    ],
  },
  {
    vertical: 'Real Estate',
    demos: [
      { title: 'AI Lead Responder', description: 'Captures buyer intent, budget, and timeline, then schedules follow-up automatically.', path: '/realestate/demo/lead-responder' },
      { title: 'Deal Analyzer', description: 'Extracts property data, runs comparable sales, and drafts seller messages.', path: '/realestate/demo/property-negotiator' },
      { title: 'Contract Drafter', description: 'Drafts purchase contracts and addenda from your deal inputs.', path: '/realestate/demo/contract' },
      { title: 'Market Analyzer', description: 'Summarizes local market data to support a pricing or offer decision.', path: '/realestate/demo/market-analysis' },
      { title: 'Voice Negotiator', description: 'An AI voice agent that makes seller calls and negotiates with humans by phone.', path: '/realestate/demo/voice-negotiator' },
    ],
  },
  {
    vertical: 'Events',
    demos: [
      { title: 'Inquiry Qualifier', description: 'Qualifies event inquiries by date, headcount, budget, and venue needs.', path: '/events/demo/inquiry' },
      { title: 'Proposal Generator', description: 'Turns event requirements into a polished, itemized proposal.', path: '/events/demo/proposal' },
      { title: 'Voice Booking Agent', description: 'A voice agent that fields booking calls and captures event details.', path: '/events/demo/voice-booking' },
    ],
  },
  {
    vertical: 'Home Services',
    demos: [
      { title: 'AI Lead Responder', description: 'Qualifies service requests and books the right job type fast.', path: '/homeservices/demo/lead-responder' },
      { title: 'Estimate Generator', description: 'Produces a quick, transparent estimate for common service jobs.', path: '/homeservices/demo/estimate' },
      { title: 'Voice Follow-Up', description: 'An AI voice agent that follows up on quotes and reschedules no-shows.', path: '/homeservices/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Healthcare',
    demos: [
      { title: 'Patient Intake', description: 'Collects intake details and routes patients to the right next step.', path: '/healthcare/demo/intake' },
      { title: 'Scheduler', description: 'Proposes appointment slots and confirms bookings conversationally.', path: '/healthcare/demo/scheduler' },
      { title: 'Voice Follow-Up', description: 'A voice agent for appointment reminders and recall outreach.', path: '/healthcare/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Legal',
    demos: [
      { title: 'Client Intake', description: 'Screens potential clients and gathers matter details before a consult.', path: '/legal/demo/intake' },
      { title: 'Consultation Scheduler', description: 'Turns an intake into a scheduled consultation with the right attorney.', path: '/legal/demo/consultation' },
      { title: 'Voice Follow-Up', description: 'A voice agent that follows up on consultations and missed calls.', path: '/legal/demo/voice-followup' },
    ],
  },
  {
    vertical: 'Restaurant',
    demos: [
      { title: 'Reservations Assistant', description: 'Handles reservation requests and answers common guest questions.', path: '/restaurant/demo/reservations' },
      { title: 'Catering Estimator', description: 'Builds a catering quote from headcount, menu, and event details.', path: '/restaurant/demo/catering' },
      { title: 'Review System', description: 'Requests and responds to guest reviews to protect your reputation.', path: '/restaurant/demo/reviews' },
    ],
  },
  {
    vertical: 'Kids Play',
    demos: [
      { title: 'Party Booker', description: 'Qualifies party inquiries and captures the details to book.', path: '/kidsplay/demo/party-booker' },
      { title: 'Package Estimator', description: 'Recommends and prices the right party package for the request.', path: '/kidsplay/demo/packages' },
      { title: 'Voice Booking Agent', description: 'A voice agent that takes booking calls and confirms party slots.', path: '/kidsplay/demo/voice-booking' },
    ],
  },
  {
    vertical: 'Fitness',
    demos: [
      { title: 'Lead Qualifier', description: 'Qualifies membership inquiries by goals, schedule, and budget.', path: '/fitness/demo/lead-qualifier' },
      { title: 'Membership Estimator', description: 'Matches a prospect to the right plan and shows pricing instantly.', path: '/fitness/demo/membership' },
      { title: 'Voice Retention', description: 'A voice agent that re-engages lapsed members and books them back.', path: '/fitness/demo/voice-retention' },
    ],
  },
  {
    vertical: 'Dental',
    demos: [
      { title: 'Patient Intake', description: 'Collects new-patient details and routes urgent cases first.', path: '/dental/demo/intake' },
      { title: 'Treatment Estimator', description: 'Estimates treatment costs and explains options in plain language.', path: '/dental/demo/estimate' },
      { title: 'Voice Recall', description: 'A voice agent that handles recall reminders and re-books cleanings.', path: '/dental/demo/voice-recall' },
    ],
  },
  {
    vertical: 'Salon',
    demos: [
      { title: 'Booking Assistant', description: 'Books appointments and answers service questions conversationally.', path: '/salon/demo/booking' },
      { title: 'Service Estimator', description: 'Prices a service or package based on what the client wants.', path: '/salon/demo/services' },
      { title: 'Voice Rebook', description: 'A voice agent that follows up to rebook clients after a visit.', path: '/salon/demo/voice-rebook' },
    ],
  },
  {
    vertical: 'Auto Repair',
    demos: [
      { title: 'Service Advisor', description: 'Triages repair requests and captures vehicle and issue details.', path: '/autorepair/demo/advisor' },
      { title: 'Repair Estimator', description: 'Gives a quick estimate range for common repair jobs.', path: '/autorepair/demo/estimate' },
      { title: 'Voice Reminder', description: 'A voice agent for service reminders and overdue maintenance calls.', path: '/autorepair/demo/voice-reminder' },
    ],
  },
];
