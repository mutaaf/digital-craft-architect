import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import StickyCTA from '@/components/StickyCTA';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { Fence, PhoneOff, Clock, MessageSquare, ArrowRight, Phone, Calculator, Star, Mic, ClipboardList } from 'lucide-react';

// Ticket 0096 - long-tail landing page for the "AI for fencing contractors"
// query class. Reuses the three existing home-services demos verbatim
// (lead-responder, estimate, voice-followup) - no new demo, no new backend,
// no new pricing data.
// Modeled on src/pages/AiForTreeServices.tsx (ticket 0092) per the ticket
// engineering notes; the file structure, JSON-LD emission, and FAQ
// mirror-source pattern are 1:1 with the tree-services predecessor, with
// fencing-contractor-specific copy in every string slot.

// Mirror-source constants: every visible string that also appears inside a
// JSON-LD block is defined ONCE here so a copy edit cannot drift the visible
// text and the structured data apart.
const HERO_H1 =
  'AI for Fencing Contractors That Are Done Losing After-Hours Same-Week Measure Requests to Voicemail While the Crew Is on a Saturday Install';
const META_DESCRIPTION =
  'AI for residential and light-commercial fencing contractors: after-hours inbound quote requests from homeowners who want a same-week measure that go to voicemail while a crew is on a Saturday install, long-tail linear-footage and material-choice triage a dispatcher cannot answer without seeing the yard, and next-morning measure-appointment and crew-on-the-way confirmations that slip between the site visit and the arrival. Live demos built for fencing contractors - try in under 60 seconds.';
const SERVICE_DESCRIPTION =
  'AI call capture, guided quoting, and appointment-window and crew-on-the-way follow-up built for residential and light-commercial fencing contractors, single-crew wood-privacy installers running a skid steer and a post-hole auger, two-crew chain-link-and-vinyl operations, full-service outfits selling ornamental aluminum, cedar privacy, chain link, PVC picket, and welded wire, repair-and-gate-service specialists replacing storm-damaged panels, and HOA-and-property-manager subs. After-hours same-week measure inbounds when both crews are on Saturday installs, linear-footage and material-choice triage a dispatcher cannot resolve without a photo or a site visit, and follow-up cadence that carries a booking from measure confirmation through crew arrival.';

const PAIN_POINTS = [
  {
    icon: PhoneOff,
    title: 'After-hours inbound quote requests go to voicemail while the crew is on a Saturday install',
    desc: 'A homeowner who just watched a storm take out three panels of chain link on the side yard, or who needs 180 linear feet of 6-foot cedar privacy for a new pool code sign-off, is not going to leave a voicemail and wait until Monday morning. She calls the first three fence companies she finds on Google and books whichever picks up first with a same-week measure. The shop with both crews on a Saturday install and no office cover loses the after-hours quote request to the company two listings down that answered on the first ring or texted a ballpark linear-footage range back inside 60 seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Long-tail linear-footage and material-choice triage lands at 8pm with nobody there to see the yard',
    desc: 'A caller with 180 linear feet of cedar privacy on a corner lot, a chain-link replacement on a storm-damaged run, an ornamental aluminum pool-code question, a vinyl picket gate-width question for an HOA setback, and a welded-wire question for a horse paddock needs someone who can weigh material (wood privacy, vinyl, ornamental aluminum, chain link, PVC picket, welded wire), height (4ft, 5ft, 6ft, 8ft), gate count and widths, post-spacing, HOA setback rules, and pool-code sign-off against the crew you can dispatch this week. Dispatchers off the clock cannot see the yard, and the caller books the company that walked her through a clear ballpark first.',
  },
  {
    icon: Star,
    title: 'Next-morning measure-appointment and crew-on-the-way confirmations slip between the site visit and the arrival',
    desc: 'A confirmed next-morning fence measure commonly runs from the initial call through a next-day two-hour arrival window through the crew-on-the-way text and then through the install-day confirmation. Manual follow-up on each job slips off the office list when the front desk is already dispatching the next same-week measure, and the homeowner starts calling the office at 9:15am asking whether the estimator is still coming and whether the appointment is still on.',
  },
];

const STATS = [
  { value: '24/7', label: 'After-hours same-week measure and quote-request capture', icon: Clock },
  { value: '<60s', label: 'Average AI reply to a new lead', icon: MessageSquare },
  { value: '3', label: 'Live demos calibrated for fencing-contractor workflows', icon: Fence },
  { value: '48h', label: 'From signup to a working AI agent', icon: Fence },
];

const DEMO_CARDS = [
  {
    icon: MessageSquare,
    title: 'AI Lead Responder for Fencing Contractors',
    desc: 'A chat agent that qualifies the material (wood privacy, vinyl, ornamental aluminum, chain link, PVC picket, welded wire), the linear footage and height (4ft, 5ft, 6ft, 8ft), the gate count and gate widths, the property type (residential, HOA, light-commercial, property-manager), the job type (new install, panel replacement, storm-damage repair, gate service), and the callback number in under 60 seconds, then books the earliest measure slot - even at 9pm on a Sunday. Reuses the live home-services lead responder, no signup.',
    to: '/homeservices/demo/lead-responder',
    cta: 'Try the Fencing Contractor Lead Responder',
    location: 'fencing_contractors_lead_responder',
    matters: 'The company that answers on the first ring books the same-week measure; the one that hits voicemail loses the after-hours quote request.',
  },
  {
    icon: Calculator,
    title: 'AI Quote Generator for Fence Installs and Repairs',
    desc: 'A guided estimator that walks a homeowner through material, linear footage, height, gate count, and new-install-versus-repair interest, then returns a defensible per-job ballpark your estimator can confirm on the measure. Reuses the live home-services estimate demo.',
    to: '/homeservices/demo/estimate',
    cta: 'Try the Fencing Contractor Quote Demo',
    location: 'fencing_contractors_estimate',
    matters: 'A same-hour ballpark beats a next-day written quote every time the homeowner is comparing three fence companies before her weekend deck project starts.',
  },
  {
    icon: Mic,
    title: 'AI Voice Follow-Up for Measure and Crew-on-the-Way Calls',
    desc: 'A voice agent that calls a homeowner the evening before the next-morning measure to confirm the two-hour arrival window, calls again the morning of when the estimator heads out, and calls once more after the install to ask for a five-star review while the crew name is still fresh. Reuses the live home-services voice follow-up demo.',
    to: '/homeservices/demo/voice-followup',
    cta: 'Try the Fencing Contractor Voice Demo',
    location: 'fencing_contractors_voice_followup',
    matters: 'A homeowner who hears a friendly voice the night before and the morning of the measure stops calling the office at 9:15am and leaves a five-star review the same day.',
  },
];

// FAQ items - single source of truth for both the visible cards and the
// FAQPage JSON-LD block per the 2026-05-25 mirror-source rule. Hyphen-only,
// defensible language, no invented client quotes, no manufacturer endorsement
// or certification-count claims per the ticket Out of scope box.
const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Will the AI answer an after-hours same-week measure request the way a fence-company office manager would?',
    a: 'Yes. The AI qualifies the material (wood privacy, vinyl, ornamental aluminum, chain link, PVC picket, welded wire), the linear footage and height (4ft, 5ft, 6ft, 8ft), the gate count and gate widths, the property type (residential, HOA, light-commercial, property-manager), the job type (new install, panel replacement, storm-damage repair, gate service), and the callback number in under 60 seconds, then books the earliest measure slot on your calendar. The homeowner hears a natural conversation, not a menu tree.',
  },
  {
    q: 'What happens with long-tail questions about linear footage, material choice, HOA setback, or pool-code sign-off?',
    a: 'The AI asks the same follow-up questions a seasoned dispatcher would (material, linear footage, height, gate count and widths, post-spacing, HOA setback rules, pool-code sign-off, storm-damaged panel replacement) and returns a defensible per-job ballpark from the same home-services estimate demo, then hands the qualified lead to your estimator with the intake already filled in. City permit rules and neighborhood-specific HOA constraints stay with your team, so the AI never quotes a stale permit fee or a setback rule it should not.',
  },
  {
    q: 'Can the AI call a homeowner the night before and the morning of the measure so they stop calling the office?',
    a: 'Yes. The voice follow-up demo triggers a callback the evening before the measure to confirm the two-hour arrival window, calls again the morning of when the estimator heads out, and calls once more after the install to ask for a review while the crew name is still fresh. If a milestone slips or the crew is running behind, the AI flags the delay to your dispatcher instead of leaving the homeowner guessing.',
  },
];

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'AI for Fencing Contractors',
      item: 'https://digitalcraftai.com/ai-for-fencing-contractors',
    },
  ],
};

const SERVICE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI for Fencing Contractors',
  description: SERVICE_DESCRIPTION,
  provider: {
    '@type': 'Organization',
    name: 'DigitalCraft AI',
    url: 'https://digitalcraftai.com',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: 'AI Automation for Fencing Contractors',
  url: 'https://digitalcraftai.com/ai-for-fencing-contractors',
};

// Mirror-source: mainEntity strings come directly from FAQ_ITEMS so the
// visible FAQ cards and the FAQPage block can never drift.
const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
};

const AiForFencingContractors: React.FC = () => {
  const { content } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI for Fencing Contractors | After-Hours Measure Capture & Appointment Follow-Up</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="AI for Fencing Contractors | DigitalCraft AI" />
        <meta
          property="og:description"
          content="AI agents built for residential and light-commercial fencing contractors: never miss an after-hours same-week measure request, triage linear-footage and material and gate questions in under 60 seconds, and follow up the night before and morning of every measure. Live demos free."
        />
        <link rel="canonical" href="https://digitalcraftai.com/ai-for-fencing-contractors" />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <Fence size={16} />
            Built for residential and light-commercial fencing contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white leading-[1.1]">
            {HERO_H1}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            After-hours same-week measure requests that hit voicemail while the crew is on a Saturday install, long-tail linear-footage and material and gate questions a dispatcher cannot answer without seeing the yard, and next-morning measure-appointment and crew-on-the-way follow-ups that slip between the site visit and the arrival - the three gaps every fence company knows about. AI agents close them so your crews stay on jobs and your phone stops costing you same-week installs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              to="/homeservices/demo/lead-responder"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'fencing_contractors_hero_lead_responder')}
            >
              <MessageSquare size={18} />
              Try the Fencing Contractor Demo
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_call', 'fencing_contractors_hero')}
            >
              <Phone size={18} />
              Book a Fencing Contractor AI Strategy Call
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No signup. No credit card. Live demos personalized to your fencing-contractor company.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-950 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-11 h-11 mx-auto mb-3 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                  <s.icon size={22} />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Figures reflect target performance of the live demos, not individual client results.
          </p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Gaps Every Fencing Contractor Knows About
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              After-hours same-week measure requests dropped to voicemail while the crew is on a Saturday install, linear-footage and material and gate questions the dispatcher cannot answer at 8pm, and next-morning measure-appointment and crew-on-the-way follow-ups nobody sends between the site visit and arrival. AI agents stand in for the office manager who already had a full plate.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAIN_POINTS.map((p) => (
              <div
                key={p.title}
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <p.icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{p.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo CTA cards */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Three Live Demos Built for Fencing-Contractor Workflows
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              No setup form. No credit card. One tap to a working AI tool that already knows the fencing-contractor playbook.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEMO_CARDS.map((d) => (
              <div
                key={d.title}
                className="flex flex-col p-7 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <d.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{d.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-1">{d.desc}</p>
                <Link
                  to={d.to}
                  data-testid="fencing-contractors-demo-cta"
                  className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                  onClick={() => trackCTAClick('demo_card', d.location)}
                >
                  {d.cta}
                  <ArrowRight size={18} />
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
                  Why this matters: {d.matters}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - mirror-source with the FAQPage JSON-LD block above */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
              Common Questions From Fencing Contractor Owners
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Straight answers from the same three home-services demos, calibrated for fencing-contractor workflows.
            </p>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item) => (
              <div
                key={item.q}
                data-testid="fencing-contractors-faq-card"
                className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {item.q}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why now + pricing link */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Why Fencing Contractor Owners Are Adopting AI Now
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-center">
            An after-hours same-week measure request and a crew-on-the-way question are both same-hour decisions for the homeowner. The company that answers first and books the measure first wins the install; the shop that calls the night before the appointment keeps the homeowner off Google Maps looking for another fence company. AI agents pick up on a Sunday at 9pm when the caller is Googling fence installation off her phone before the weekend deck project starts, qualify the material and the linear footage and the gate count, and book the crew on your calendar without changing how your trucks work.
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Pricing lives on the{' '}
            <Link to="/homeservices" className="text-primary hover:underline">
              home services hub
            </Link>{' '}
            alongside plumbing, HVAC, roofing, electrical, painting, landscaping, cleaning, pest control, pool service, restoration, moving, solar, window, garage-door, and tree-service tiers. Prefer a tailored recommendation? Take the{' '}
            <Link to="/quiz" className="text-primary hover:underline">
              2-minute AI readiness quiz
            </Link>
            .
          </p>
          <div className="flex justify-center mt-6 gap-1 text-primary/40">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} fill="currentColor" />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Put AI to Work for Your Fencing Contractor Company
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
            Book a 15-minute strategy call and we will deploy a working AI agent against your real fencing-contractor-company website while you watch, or jump straight into the live demos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="fencing-contractors-footer-cta"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() =>
                trackCTAClick('fencing_contractors_book_call', 'fencing_contractors_footer')
              }
            >
              <Phone size={18} />
              Book a 15-minute strategy call
            </a>
            <Link
              to="/homeservices/demo/estimate"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('try_demo', 'fencing_contractors_bottom_estimate')}
            >
              <Calculator size={18} />
              Try the Fencing Contractor Quote Demo
            </Link>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
      <StickyCTA />
    </div>
  );
};

export default AiForFencingContractors;
