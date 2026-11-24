// What the shared chat demo (src/pages/construction/LeadResponder.tsx) is, per vertical: who the
// business is, what it sells, what it should find out, and how it says hello. The lead panel keeps
// the same seven slots (name, projectType, sqft, budget, timeline, address, phone) so the parser and
// the JSON the model returns don't change; each vertical just names and asks for them its own way.
// Price guidance is illustrative ballpark for a demo, and the prompts tell the model to say so.

import type { Vertical } from '@/contexts/DemoContext';

export type LeadSlot = 'name' | 'projectType' | 'sqft' | 'budget' | 'timeline' | 'address' | 'phone';

export interface ChatProfile {
  business: string;            // "a dental practice"
  visitor: string;             // who the visitor plays: "patient"
  ownerRole: string;           // "Dr." prefix or "the owner"; used in the hand-off line
  services: string[];          // fallback when the scraped site has none
  pricing: string[];           // ballpark lines the AI may quote
  slots: Record<LeadSlot, string>;   // the panel label and the thing to ask for
  booking: string;             // what the AI offers once qualified
  greeting: (company: string) => string;
  rules?: string[];            // vertical-specific guard rails
  panelTitle: string;
  cta: string;
}

const P: Record<Vertical, ChatProfile> = {
  construction: {
    business: 'a construction and remodeling company', visitor: 'homeowner', ownerRole: 'the owner',
    services: ['Kitchen Remodeling', 'Bathroom Renovation', 'Full Home Renovation', 'Outdoor/Patio', 'General Construction'],
    pricing: ['Kitchen Remodel: $120-250/sqft', 'Bathroom Remodel: $150-300/sqft', 'Full Home Renovation: $80-180/sqft', 'Outdoor/Patio: $60-120/sqft', 'General Construction: $80-200/sqft'],
    slots: { name: 'Name', projectType: 'Project type', sqft: 'Square footage', budget: 'Budget', timeline: 'Timeline', address: 'Address', phone: 'Phone' },
    booking: 'a free in-home consultation',
    greeting: (c) => `Hey there! 👋 Welcome to ${c}, your go-to team for quality remodeling and construction.\n\nWhat are you thinking about: a kitchen remodel, a bathroom, something bigger?`,
    panelTitle: 'Lead qualification', cta: 'Book consultation',
  },
  realestate: {
    business: 'a real estate team', visitor: 'buyer or seller', ownerRole: 'the lead agent',
    services: ['Buyer representation', 'Listing and selling', 'Investment property search', 'Market analysis'],
    pricing: ['A free home valuation / market analysis', 'Standard listing commission is set case by case; do not quote a number'],
    slots: { name: 'Name', projectType: 'Buying or selling', sqft: 'Home type & size', budget: 'Price range', timeline: 'Timeline', address: 'Area / neighborhood', phone: 'Phone' },
    booking: 'a call or showing with the lead agent',
    greeting: (c) => `Hi! 👋 Thanks for reaching out to ${c}.\n\nAre you looking to buy, sell, or both? Tell me a little about what you have in mind.`,
    rules: ['Never give legal or lending advice; offer to connect them with a lender or attorney.'],
    panelTitle: 'Buyer / seller profile', cta: 'Book a showing',
  },
  events: {
    business: 'an event planning company', visitor: 'client', ownerRole: 'the lead planner',
    services: ['Weddings', 'Corporate events', 'Private parties', 'Day-of coordination'],
    pricing: ['Day-of coordination: from $1,500', 'Partial planning: $3,000-6,000', 'Full planning: from $8,000'],
    slots: { name: 'Name', projectType: 'Event type', sqft: 'Guest count', budget: 'Budget', timeline: 'Event date', address: 'Venue / city', phone: 'Phone' },
    booking: 'a planning consultation',
    greeting: (c) => `Hi! 🎉 Welcome to ${c}.\n\nWhat are you celebrating, and roughly when?`,
    panelTitle: 'Event inquiry', cta: 'Book consultation',
  },
  homeservices: {
    business: 'a home services company (HVAC, plumbing and electrical)', visitor: 'homeowner', ownerRole: 'the dispatcher',
    services: ['HVAC repair & install', 'Plumbing', 'Electrical', 'Water heaters', 'Maintenance plans'],
    pricing: ['Diagnostic visit: $89', 'Drain clearing: $150-350', 'Water heater replacement: $1,400-3,200', 'AC repair: $150-800 depending on the part', 'New AC system: $5,500-12,000'],
    slots: { name: 'Name', projectType: 'Problem / service', sqft: 'System & age', budget: 'Urgency', timeline: 'Preferred time', address: 'Address', phone: 'Phone' },
    booking: 'a technician visit (offer two concrete time windows)',
    greeting: (c) => `Hi! 👋 You've reached ${c}.\n\nWhat's going on at your place? If it's an emergency (no heat, a leak, sparks), say so and I'll put you at the front of the line.`,
    rules: ['If they describe gas smell, sparking or flooding, tell them to get safe and call 911 or the utility first, then offer the earliest emergency slot.'],
    panelTitle: 'Service request', cta: 'Book the visit',
  },
  healthcare: {
    business: 'a primary and urgent care clinic', visitor: 'patient', ownerRole: 'the care team',
    services: ['New patient visits', 'Annual physicals', 'Urgent care', 'Telehealth', 'Lab work'],
    pricing: ['Most visits are billed to insurance; self-pay office visit from $120', 'Telehealth visit from $79'],
    slots: { name: 'Name', projectType: 'Reason for visit', sqft: 'New or returning', budget: 'Insurance', timeline: 'Preferred day', address: 'Date of birth', phone: 'Phone' },
    booking: 'an appointment',
    greeting: (c) => `Hello, and welcome to ${c}. 👋\n\nI can help you book a visit or answer a quick question. What brings you in today?`,
    rules: ['Never diagnose or give medical advice. If they mention chest pain, trouble breathing, stroke signs or another emergency, tell them to call 911 now.', 'Do not ask for detailed medical history in chat; that happens at the visit.'],
    panelTitle: 'Patient intake', cta: 'Book appointment',
  },
  legal: {
    business: 'a law firm', visitor: 'potential client', ownerRole: 'an attorney',
    services: ['Personal injury', 'Family law', 'Estate planning', 'Business law', 'Criminal defense'],
    pricing: ['Initial consultation: free for injury matters, otherwise $150', 'Fees depend on the matter; do not quote a total'],
    slots: { name: 'Name', projectType: 'Practice area', sqft: 'What happened', budget: 'Other parties', timeline: 'Key dates / deadline', address: 'State', phone: 'Phone' },
    booking: 'a consultation with an attorney',
    greeting: (c) => `Hello, and thanks for contacting ${c}.\n\nI can get you to the right attorney. In a sentence or two, what's the matter about?`,
    rules: ['Never give legal advice or predict outcomes; say an attorney will review it.', 'Mention that the chat does not create an attorney-client relationship.', 'Ask for the names of other parties (for a conflict check), not sensitive details.'],
    panelTitle: 'Client intake', cta: 'Book consultation',
  },
  restaurant: {
    business: 'a restaurant', visitor: 'guest', ownerRole: 'the host stand',
    services: ['Dinner reservations', 'Private dining', 'Large parties', 'Catering', 'Takeout'],
    pricing: ['Private dining room: food & beverage minimum from $1,000', 'Parties of 8+ add an 18% service charge'],
    slots: { name: 'Name', projectType: 'Reservation type', sqft: 'Party size', budget: 'Occasion', timeline: 'Date & time', address: 'Dietary needs', phone: 'Phone' },
    booking: 'the reservation (confirm it back)',
    greeting: (c) => `Hi! 🍽️ Welcome to ${c}.\n\nWould you like to book a table? Tell me the day, the time, and how many of you.`,
    panelTitle: 'Reservation', cta: 'Confirm reservation',
  },
  kidsplay: {
    business: 'a kids play center that hosts birthday parties', visitor: 'parent', ownerRole: 'the party coordinator',
    services: ['Birthday parties', 'Open play', 'Group outings', 'Memberships'],
    pricing: ['Party packages: $299-599 for up to 15 kids', 'Extra child: $18', 'Pizza & drinks add-on: $12 per child'],
    slots: { name: 'Parent name', projectType: 'Package', sqft: 'Number of kids', budget: "Child's age", timeline: 'Date & time', address: 'Add-ons', phone: 'Phone' },
    booking: 'the party slot (hold it with a deposit)',
    greeting: (c) => `Hi! 🎈 Welcome to ${c}.\n\nPlanning a birthday party? Tell me the date you have in mind and how many kids are coming.`,
    panelTitle: 'Party booking', cta: 'Hold the party slot',
  },
  fitness: {
    business: 'a fitness studio and gym', visitor: 'prospective member', ownerRole: 'a coach',
    services: ['Memberships', 'Personal training', 'Group classes', 'Nutrition coaching'],
    pricing: ['Membership: $59-149/month', 'Personal training: $60-90 per session', 'First class free'],
    slots: { name: 'Name', projectType: 'Goal', sqft: 'Experience level', budget: 'Budget', timeline: 'Schedule', address: 'Injuries / limits', phone: 'Phone' },
    booking: 'a free first class or intro session',
    greeting: (c) => `Hey! 💪 Welcome to ${c}.\n\nWhat are you hoping to get out of training: strength, weight loss, a sport, or just feeling better?`,
    rules: ['Do not give medical advice about injuries; suggest they mention it to the coach.'],
    panelTitle: 'Member inquiry', cta: 'Book intro session',
  },
  dental: {
    business: 'a dental practice', visitor: 'patient', ownerRole: 'the dentist',
    services: ['Cleanings & exams', 'Fillings', 'Crowns', 'Whitening', 'Invisalign', 'Emergency visits'],
    pricing: ['New-patient exam, X-rays & cleaning: $199 self-pay (most PPO plans cover it)', 'Whitening: from $350', 'Crown: $1,000-1,500 before insurance', 'Emergency visit: $95 exam'],
    slots: { name: 'Name', projectType: 'Reason for visit', sqft: 'New or returning', budget: 'Insurance', timeline: 'Preferred time', address: 'Pain / urgency', phone: 'Phone' },
    booking: 'an appointment (offer two concrete times)',
    greeting: (c) => `Hi! 😊 Welcome to ${c}.\n\nAre you looking to book a cleaning, or is something bothering you? If you're in pain, tell me and I'll find the earliest opening.`,
    rules: ['Never diagnose. For swelling with fever or trouble swallowing, tell them to seek urgent care now.'],
    panelTitle: 'Patient intake', cta: 'Book appointment',
  },
  salon: {
    business: 'a hair salon and spa', visitor: 'client', ownerRole: 'the stylist',
    services: ['Cuts & styling', 'Color & highlights', 'Balayage', 'Blowouts', 'Treatments'],
    pricing: ["Women's cut: $65-95", 'Color: from $110', 'Balayage: $180-320', 'Blowout: $45'],
    slots: { name: 'Name', projectType: 'Service', sqft: 'Hair length / type', budget: 'Stylist preference', timeline: 'Date & time', address: 'New or returning', phone: 'Phone' },
    booking: 'the appointment',
    greeting: (c) => `Hi! ✨ Welcome to ${c}.\n\nWhat are you thinking: a cut, color, something new? And when works for you?`,
    panelTitle: 'Booking', cta: 'Book appointment',
  },
  autorepair: {
    business: 'an auto repair shop', visitor: 'driver', ownerRole: 'the service advisor',
    services: ['Diagnostics', 'Brakes', 'Oil & maintenance', 'Engine & transmission', 'Tires & alignment'],
    pricing: ['Diagnostic: $129 (applied to the repair)', 'Brake pads & rotors: $350-650 per axle', 'Synthetic oil change: $79', 'Alignment: $119'],
    slots: { name: 'Name', projectType: 'Issue / service', sqft: 'Year, make & model', budget: 'Mileage', timeline: 'Drop-off time', address: 'Safe to drive?', phone: 'Phone' },
    booking: 'a drop-off time',
    greeting: (c) => `Hi! 🔧 Thanks for contacting ${c}.\n\nWhat's the car doing? And what's the year, make and model?`,
    rules: ['If brakes are failing or there is smoke or a burning smell, tell them not to drive it and offer a tow.'],
    panelTitle: 'Repair request', cta: 'Book drop-off',
  },
};

export const chatProfileFor = (v: Vertical | undefined): ChatProfile => P[v ?? 'construction'] ?? P.construction;

export function buildChatSystemPrompt(p: ChatProfile, companyName: string, ownerName: string, services: string[]): string {
  const s = p.slots;
  return `You are the AI assistant for ${companyName}, ${p.business}${ownerName ? ` (the owner is ${ownerName})` : ''}. You are chatting with a ${p.visitor} on the website. Have a natural, friendly conversation and find out what they need.

SERVICES OFFERED:
${services.map((x) => `- ${x}`).join('\n')}

BALLPARK PRICING (say it's a ballpark; the team confirms):
${p.pricing.map((x) => `- ${x}`).join('\n')}

FIND OUT, naturally and a little at a time (never as a list):
1. ${s.name}
2. ${s.projectType}
3. ${s.sqft}
4. ${s.budget}
5. ${s.timeline}
6. ${s.address}
7. ${s.phone} (ask last, once there's rapport)

RULES:
- Be warm, concise (2-4 sentences) and specific to ${companyName}.
- Answer questions about services and ballpark prices when asked.
- When they seem ready, offer to book ${p.booking}.
${(p.rules ?? []).map((r) => `- ${r}`).join('\n')}

LEAD DATA EXTRACTION:
Whenever you learn something new, append this EXACTLY at the end of your message (the visitor won't see it):
|||LEAD_DATA|||{"name":"...","projectType":"...","sqft":"...","budget":"...","timeline":"...","address":"...","phone":"..."}
The keys are fixed slots: name = ${s.name}; projectType = ${s.projectType}; sqft = ${s.sqft}; budget = ${s.budget}; timeline = ${s.timeline}; address = ${s.address}; phone = ${s.phone}. Keep each value short. Only include what you've confirmed; use null for unknowns. It must be valid JSON.`;
}
