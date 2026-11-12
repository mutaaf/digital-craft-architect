import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  MessageSquare,
  Calculator,
  Star,
} from 'lucide-react';
import DemoHubKeynote from '@/v3/DemoHubKeynote';

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
      to: '/restaurant/demo/reservations',
      icon: <MessageSquare size={28} />,
      title: 'AI Reservation & Inquiry Handler',
      description: `Chat with ${possessive} AI as a hungry diner. Watch it handle reservations, answer menu questions, and route catering inquiries — all in real time.`,
      tags: ['GPT-4o Streaming', 'Live Qualification'],
    },
    {
      to: '/restaurant/demo/catering',
      icon: <Calculator size={28} />,
      title: 'Smart Catering Estimator',
      description: `Pick an event type, enter your guest count, and get a branded catering estimate using ${possessive} pricing in under 60 seconds.`,
      tags: ['Real Pricing', 'Branded Output'],
    },
    {
      to: '/restaurant/demo/reviews',
      icon: <Star size={28} />,
      title: 'AI Review Manager',
      description:
        'Experience the automated SMS flow that turns happy diners into 5-star Google reviews — with follow-ups and a live analytics dashboard.',
      tags: ['SMS Simulation', 'Analytics Dashboard'],
    },
  ];

  const ogTitle = isCustomized
    ? `See How AI Would Work for ${name} | DigitalCraft AI`
    : 'Interactive AI Demos for Restaurants | DigitalCraft AI';
  const ogDescription = isCustomized
    ? `Live AI demos customized for ${name}: Reservation Handler, Catering Estimator, and Review Manager. See the future of your restaurant.`
    : 'Three working AI proof-of-concepts for restaurants: Reservation & Inquiry Handler, Smart Catering Estimator, and AI Review Manager.';

  return (
    <>
      <Helmet>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:image" content="/og-construction.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content="/og-construction.png" />
      </Helmet>
      <DemoHubKeynote
        industry="Restaurant"
        analyticsKey="restaurant"
        companyName={isCustomized ? company?.companyName : null}
        demos={demos}
        videoVertical="Restaurants"
        seoIntro={
          <>
            <p>
              If you run a restaurant, you already know the bottlenecks: reservations that turn into
              no-shows, catering inquiries that sit unanswered during the dinner rush, and five-star
              dining experiences that never translate into five-star online reviews. These three
              restaurant automation demos let you experience, hands-on, how AI solves each of those
              problems — personalized to your own restaurant, not a generic slide deck.
            </p>
            <p>
              Start with the <strong>AI Reservation & Inquiry Handler</strong> to see how a GPT-4o
              chatbot manages table bookings, answers menu questions, handles dietary restriction
              requests, and routes catering inquiries in real time. The AI qualifies every inquiry
              instantly — no guest waits for a callback, no lead slips through the cracks during
              service hours.
            </p>
            <p>
              Next, try the <strong>Smart Catering Estimator</strong> — select an event type, enter
              your guest count, choose a service tier, and receive a branded catering proposal in
              under 60 seconds. Whether it is a corporate lunch for 50 or a wedding reception for
              200, the estimator uses your actual menu pricing to generate professional quotes that
              close deals faster than any spreadsheet ever could.
            </p>
            <p>
              The <strong>AI Review Manager</strong> simulates the automated SMS flow that turns
              satisfied diners into Google reviewers. It sends a thank-you text after the meal,
              follows up at Day 3 and Day 7, and includes a live analytics dashboard so you can
              track response rates and rating trends. Restaurants using this system typically see
              their review count double within 60 to 90 days.
            </p>
            <p>
              Enter your restaurant website above to see each demo branded to your business, or
              jump straight in with the default configuration. Whether you are evaluating AI for
              restaurant operations, looking for a smarter way to handle catering sales, or simply
              curious what modern automation looks like in food service, these demos give you a
              clear, no-commitment preview of the results.
            </p>
          </>
        }
      />
    </>
  );
};

export default DemoHub;
