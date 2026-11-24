// The CTO site's copy (moved out of src/pages/IndexV2.tsx so the v3 CTO landing shares it).
// Client outcomes are the owner's own wording; don't add numbers here that aren't already public.
export const OUTCOME_TICKER = [
  { client: 'Residential Development Firm', metric: 'Lead response · hours → 47s' },
  { client: 'Family Entertainment Center',  metric: '20 hrs/wk manual entry → zero' },
  { client: 'TryMinded',                    metric: 'Telemed platform · shipped in months' },
  { client: 'Recyclops',                    metric: 'Ops scaled with zero new hires' },
  { client: 'Multi-Location Service Co.',   metric: 'Estimates · days → under an hour' },
  { client: 'Independent Event Studio',     metric: '12 integrations · zero manual ops' },
  { client: 'Overwatch Digital Health',     metric: 'Compliance milestones · ahead of plan' },
];

export const OUTCOMES = [
  {
    vertical: 'Construction',
    client: 'Residential Development Firm',
    headline: '< 60 seconds',
    label: 'Lead response',
    body:
      'Down from "whenever someone saw the voicemail." Estimate turnaround went from days to under an hour. More jobs booked. More jobs closed.',
    chip: 'ROI paid in month 1',
  },
  {
    vertical: 'Family Entertainment',
    client: 'Family Entertainment Center',
    headline: '20 hrs/week',
    label: 'Manual data entry eliminated',
    body:
      'AI intake captures every party inquiry and auto-populates ops across four disconnected systems. Staff stopped retyping; owner stopped supervising it.',
    chip: '40–45 parties / weekend',
  },
  {
    vertical: 'Digital Health',
    client: 'TryMinded',
    headline: 'Shipped in months',
    label: 'Not years',
    body:
      'Production telemedicine platform with AI intake, end-to-end. What a full in-house team would have taken a year to build, with a roadmap the team could operate on day one.',
    chip: 'CTO engagement, not staffing',
  },
  {
    vertical: 'Logistics',
    client: 'Recyclops',
    headline: 'Zero new hires',
    label: 'To scale ops across markets',
    body:
      'Multi-year retainer automating dispatch and coordination. The ops team grew throughput without growing headcount, the way software is supposed to work.',
    chip: 'Multi-year partnership',
  },
];

export const STUDIO = [
  {
    n: '01',
    role: 'AI Systems',
    craft: 'LLM pipelines, agent orchestration, RAG, evals.',
    stack: 'GPT-4o · Claude · LangGraph · Vercel AI',
  },
  {
    n: '02',
    role: 'Voice & Conversation',
    craft: 'Production voice stacks, latency budgets, prompt choreography.',
    stack: 'Vapi · ElevenLabs · Deepgram · Twilio',
  },
  {
    n: '03',
    role: 'Product Engineering',
    craft: 'Shipping what the roadmap calls for. End-to-end delivery.',
    stack: 'TypeScript · React · Node · Postgres · Vercel',
  },
  {
    n: '04',
    role: 'Design & Brand',
    craft: 'Interfaces that feel considered. Identities that outlast a trend cycle.',
    stack: 'Figma · Framer · brand systems',
  },
  {
    n: '05',
    role: 'Ops, Data & Security',
    craft: 'Reliability, observability, compliance. Production readiness as a practice.',
    stack: 'Sentry · OpenTelemetry · SOC2 readiness',
  },
];

export const METRICS = [
  { k: '< 60s', v: 'Lead response' },
  { k: '< 1hr', v: 'Estimate turnaround' },
  { k: '20 hr/wk', v: 'Ops hours reclaimed' },
  { k: '0', v: 'New hires required' },
];

export const MANDATE = [
  {
    n: '01',
    title: 'Strategic Architecture',
    body:
      'Roadmaps that survive contact with reality. Build-vs-buy, stack selection, compliance, scale. The 18-month plan you can actually operate against.',
  },
  {
    n: '02',
    title: 'AI Systems & Integration',
    body:
      'Custom agents, voice AI, LLM pipelines, workflow automation, wired into the tools your team already uses. Not slideware. Shipped.',
  },
  {
    n: '03',
    title: 'Team & Vendor Leadership',
    body:
      'Technical interviewing, vendor selection, contract review. I sit in the rooms where your technology decisions get made and represent your interests.',
  },
  {
    n: '04',
    title: 'Product Engineering',
    body:
      'When you need something built now, I build it, or direct the team that does. Platforms, dashboards, integrations, data systems.',
  },
  {
    n: '05',
    title: 'Crisis Response',
    body:
      'When production breaks, a vendor ghosts, or due diligence lands on Friday, you call the person who has been there before.',
  },
];

