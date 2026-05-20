import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import CompanySetupForm from '@/components/construction/CompanySetupForm';
import { useDemoContext } from '@/contexts/DemoContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calculator,
  ArrowRight,
  Sparkles,
  Phone,
} from 'lucide-react';
import { trackDemoClick, trackCTAClick } from '@/utils/analytics';
import StickyCTA from '@/components/StickyCTA';
import DemoVideoCards from '@/components/DemoVideoCards';

const DemoHub = () => {
  const { company, isCustomized, loadFromUrl, isLoading } = useDemoContext();
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-load from ?site= param
  useEffect(() => {
    const site = searchParams.get('site');
    if (site && !isCustomized && !isLoading) {
      loadFromUrl(site);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when company loads
  useEffect(() => {
    if (isCustomized && company?.website) {
      const domain = company.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (searchParams.get('site') !== domain) {
        setSearchParams({ site: domain }, { replace: true });
      }
    }
  }, [isCustomized, company, searchParams, setSearchParams]);

  const name = company?.companyName || 'DigitalCraft AI';
  const possessive = company?.companyName ? `${company.companyName}'s` : "DigitalCraft AI's";

  const demos = [
    {
      to: '/kidsplay/demo/party-booker',
      icon: <MessageSquare size={28} />,
      title: 'AI Party Booking Qualifier',
      description: `Chat with ${possessive} AI as a parent looking to book a birthday party. Watch it qualify the inquiry, recommend packages, and handle booking — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
    },
    {
      to: '/kidsplay/demo/packages',
      icon: <Calculator size={28} />,
      title: 'Smart Party Package Estimator',
      description: `Pick a party type, choose your add-ons, and get a branded package quote using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
    },
    {
      to: '/kidsplay/demo/voice-booking',
      icon: <Phone size={28} />,
      title: 'AI Voice Booking Agent',
      description:
        'Call the AI and book a party by voice. Experience natural conversation about packages, availability, and pricing — with live transcription and a full call summary.',
      tags: ['Vapi Voice AI', 'Live Transcription', 'GPT-4o'],
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Kids Play & Family Entertainment | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Party Booking Qualifier, Smart Package Estimator, and Voice Booking Agent. See the future of your venue.`
    : 'Three working AI proof-of-concepts for kids play places and family entertainment centers: Party Booking Qualifier, Smart Package Estimator, and AI Voice Booking Agent.';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-8 sm:mb-10 animate-fade-in">
          <Badge variant="secondary" className="mb-4">
            <Sparkles size={14} className="mr-1" /> Built for {name}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">Kids Play AI Automation Demos</h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Three working proof-of-concepts showing exactly how AI will transform {possessive}{' '}
            party bookings, package pricing, and voice-based booking.
          </p>
        </div>

        <CompanySetupForm />

        {/* SEO intro section */}
        <section className="mb-10 bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            AI for Kids Play Places: Interactive Automation Demos
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed">
            <p>
              If you run a kids play place, indoor playground, trampoline park, or family
              entertainment center, you already know the bottlenecks: parents calling about
              birthday parties during your busiest hours, inquiries that sit unanswered until
              the next morning, seasonal spikes that overwhelm your front desk, and walk-in
              confusion that frustrates families and staff alike. These three kids play
              automation demos let you experience, hands-on, how AI solves each of those
              problems — personalized to your own venue, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Party Booking Qualifier</strong> to see how a GPT-4o
              chatbot handles parent inquiries in real time, qualifying party size, child age,
              preferred date, and package preferences while booking on your behalf. The AI
              responds to every inquiry in under 60 seconds — even at 10pm on a Saturday —
              so you never lose a booking to a competitor who answered faster.
            </p>
            <p>
              Next, try the <strong>Smart Party Package Estimator</strong>. Parents select a
              party type, choose their guest count, and add extras like face painting, character
              appearances, food packages, or photo booths. The tool generates a branded price
              breakdown instantly, giving parents the transparency they want and saving your
              staff from answering the same pricing questions dozens of times a day.
            </p>
            <p>
              Finally, the <strong>AI Voice Booking Agent</strong> takes it one step further:
              parents can call your venue and speak naturally to the AI, which answers
              questions about availability, walks them through package options, and books their
              party — all with live transcription and a post-call summary. This is the same
              production AI stack we deploy for clients, running on real voice AI technology
              with natural speech recognition and response.
            </p>
            <p>
              Enter your venue website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you are evaluating AI
              for your play place, looking for a smarter party booking system, or simply curious
              what modern automation looks like in family entertainment, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </div>
        </section>

        <DemoVideoCards vertical="Kids Play" />

        <div className="grid gap-6">
          {demos.map((d, i) => (
            <Link key={d.to} to={d.to} onClick={() => trackDemoClick(d.title, 'kidsplay')} className="group animate-slide-up" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
              <Card className="p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4 sm:gap-5 transition-all hover:shadow-lg hover:border-primary/30">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${d.color}`}>
                  {d.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                    {d.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                    {d.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0 self-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={20} />
                </Button>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-400 mb-4">
            Ready to see these systems live in your venue?
          </p>
          <Button asChild size="lg" className="gap-2">
            <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', 'kidsplay_demo_hub')}>
              Book a Call with DigitalCraft AI <ArrowRight size={18} />
            </a>
          </Button>
        </div>
      </div>
      <StickyCTA />
    </div>
  );
};

export default DemoHub;
