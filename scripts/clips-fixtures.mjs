// Scripted model answers for the demo clips (scripts/clips.mjs), so a recording never calls a paid API.
// Each one follows the rules of the page's own system prompt, so it reads like what the live demo returns:
// - lead responder (src/pages/construction/LeadResponder.tsx): 2-4 sentences, ballpark ranges from its pricing
//   guidance (kitchen $120-250/sqft), the hidden |||LEAD_DATA||| JSON after every reply, phone asked last,
//   a consultation with the owner (Ro, the page's default) once the lead is ready;
// - smart replies (src/pages/construction/ReviewSystem.tsx): three tones, 2-4 sentences each, specific to the
//   review, no legal fault, an offer to talk offline, no em dashes, nothing the reviewer didn't say.
// The person, place and phone number are made up (555-01xx is reserved for fiction).

const data = (o) => `\n|||LEAD_DATA|||${JSON.stringify({ name: null, projectType: null, sqft: null, budget: null, timeline: null, address: null, phone: null, ...o })}`;

export const LEAD_TURNS = [
  {
    user: 'Hi! Thinking about redoing our kitchen, maybe 200 sq ft.',
    reply: 'A kitchen remodel at around 200 sq ft usually lands between $24,000 and $50,000, depending on finishes. What budget range feels comfortable, and when would you like to start?'
      + data({ projectType: 'Kitchen Remodel', sqft: '200' }),
  },
  {
    user: "Around $40k. Hoping to start in March. I'm Dana, in Plano.",
    reply: "Thanks, Dana! $40k fits a solid mid-range kitchen, and March is very doable if we plan this winter. What's the best number to reach you?"
      + data({ name: 'Dana', projectType: 'Kitchen Remodel', sqft: '200', budget: '$40,000', timeline: 'March', address: 'Plano' }),
  },
  {
    user: '214-555-0147',
    reply: "Got it! Ro can come out for a free in-home consultation to measure and talk through options. Would a weekday evening or Saturday morning work better?"
      + data({ name: 'Dana', projectType: 'Kitchen Remodel', sqft: '200', budget: '$40,000', timeline: 'March', address: 'Plano', phone: '214-555-0147' }),
  },
];

export const REVIEW = 'Crew showed up two hours late on day one and nobody called us. The tile work looks great though.';

export const REVIEW_REPLIES = [
  { tone: 'professional', content: 'Thank you for the feedback on your project. You should have had a call when the crew was running two hours behind on day one. We are glad the tile came out well. Please reach out to Ro directly so we can talk it through.' },
  { tone: 'warm', content: "Thanks for taking the time to write this. We're really glad you love the tile! Waiting two hours with no call isn't how we want anyone to start a project, and Ro would love to hear more. Give us a call anytime." },
  { tone: 'apologetic', content: "We're sorry the crew arrived two hours late on day one and nobody called you. That's on us. We're happy the tile turned out great, and Ro would like to talk it through, so please call us directly." },
];
