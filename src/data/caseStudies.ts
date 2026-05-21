// Detailed, narrative case studies surfaced at /case-studies/:slug.
// These go deeper than the homepage CaseStudies carousel (CMS-driven).
// Companies are anonymized; figures are representative of typical DCA
// engagements and kept in line with the conservative claims used site-wide.

export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudyDetail {
  slug: string;
  vertical: string;
  verticalPath: string;
  demoPath: string;
  company: string;
  industry: string;
  location: string;
  title: string;
  summary: string;
  heroStat: CaseStudyMetric;
  challenge: string[];
  solution: string[];
  results: CaseStudyMetric[];
  quote: { text: string; author: string };
  tags: string[];
}

export const caseStudies: CaseStudyDetail[] = [
  {
    slug: 'construction',
    vertical: 'Construction',
    verticalPath: '/construction',
    demoPath: '/construction/demo',
    company: 'A regional general contractor (anonymized)',
    industry: 'Commercial & residential construction',
    location: 'Dallas-Fort Worth, TX',
    title: 'How a Construction Firm Booked More Jobs by Answering Leads Instantly',
    summary:
      'A growing general contractor was losing bids because leads went unanswered for hours. With an AI lead responder and voice follow-up, they cut response time to under a minute and booked more estimates from the same ad spend.',
    heroStat: { value: '92%', label: 'faster lead response' },
    challenge: [
      'The team was generating plenty of leads from paid ads and referrals, but the office staff could only reply between job-site visits. Most quote requests sat for two to four hours before anyone responded.',
      'By then, prospects had often called a competitor. The owner suspected they were losing winnable jobs, but had no easy way to staff a faster response without adding payroll.',
    ],
    solution: [
      'We deployed an AI lead responder that replies to every web and form inquiry within seconds, qualifies the project type, budget, and timeline, then books a site visit on the calendar.',
      'For higher-value leads, an AI voice agent follows up with a friendly call to confirm details and answer common questions, handing off warm prospects to the estimator with full context.',
    ],
    results: [
      { value: 'Under 60s', label: 'average first response' },
      { value: '2x', label: 'more estimates booked' },
      { value: '15 hrs', label: 'admin time saved weekly' },
    ],
    quote: {
      text: 'We stopped losing jobs to whoever called back first, because now we are always first.',
      author: 'Owner, general contractor (anonymized)',
    },
    tags: ['Lead Response', 'Voice AI', 'Construction'],
  },
  {
    slug: 'real-estate',
    vertical: 'Real Estate',
    verticalPath: '/realestate',
    demoPath: '/realestate/demo',
    company: 'An independent investor & agent team (anonymized)',
    industry: 'Residential real estate & investing',
    location: 'Houston, TX',
    title: 'How a Real Estate Team Analyzed More Deals Without Hiring',
    summary:
      'A small investor-agent team was drowning in inbound seller leads and spending nights running comps by hand. AI deal analysis and outbound voice calls let them screen more opportunities and reach sellers faster.',
    heroStat: { value: '3x', label: 'more deals screened weekly' },
    challenge: [
      'Every motivated-seller lead needed manual research: pulling comps, estimating repairs, and modeling a fair offer. The team could only get to a fraction of them before the leads went cold.',
      'Outbound calling was just as slow. With only two people dialing, most sellers never got a timely callback, and promising deals slipped to better-staffed competitors.',
    ],
    solution: [
      'We set up an AI deal analyzer that ingests a property address or listing, generates comps, estimates a bid range, and drafts seller outreach in minutes instead of hours.',
      'An AI voice negotiator handles first-touch outbound calls, gauges seller motivation, and books callbacks for the human team, so the agents spend their time only on live, interested sellers.',
    ],
    results: [
      { value: '3x', label: 'deals analyzed per week' },
      { value: 'Same day', label: 'seller follow-up' },
      { value: '40%', label: 'more booked callbacks' },
    ],
    quote: {
      text: 'The AI does the grunt work overnight. We wake up to deals already scored and sellers already called.',
      author: 'Investor & agent (anonymized)',
    },
    tags: ['Deal Analysis', 'Voice AI', 'Real Estate'],
  },
  {
    slug: 'events',
    vertical: 'Events',
    verticalPath: '/events',
    demoPath: '/events/demo',
    company: 'A boutique events & catering company (anonymized)',
    industry: 'Event planning & catering',
    location: 'Austin, TX',
    title: 'How an Events Company Turned Inquiries Into Booked Dates',
    summary:
      'An event planning business was missing inquiries during peak season and sending slow, generic quotes. AI inquiry handling and instant proposal drafts helped them respond around the clock and convert more bookings.',
    heroStat: { value: '24/7', label: 'inquiry coverage' },
    challenge: [
      'Inquiries arrived at all hours, especially evenings and weekends when the small team was already running events. Many sat overnight, and couples planning weddings often booked the first vendor to reply.',
      'Building each proposal by hand took an hour or more, so the team could only quote a handful of prospects per day during the busiest months.',
    ],
    solution: [
      'We added an AI inquiry qualifier that captures event type, date, headcount, and budget the moment someone reaches out, then confirms availability and next steps automatically.',
      'A smart proposal generator drafts a tailored package and price estimate in minutes, which the team reviews and sends, keeping a personal touch without the manual busywork.',
    ],
    results: [
      { value: 'Minutes', label: 'to first response' },
      { value: '50%', label: 'faster proposals' },
      { value: 'More', label: 'peak-season bookings' },
    ],
    quote: {
      text: 'We finally stop losing weekend inquiries. Every lead gets a real reply, even when we are on site.',
      author: 'Owner, events & catering (anonymized)',
    },
    tags: ['Inquiry Handling', 'Proposals', 'Events'],
  },
];

export function getCaseStudy(slug: string): CaseStudyDetail | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
