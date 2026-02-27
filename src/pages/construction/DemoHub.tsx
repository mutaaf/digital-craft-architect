import { Link } from 'react-router-dom';
import DemoNavbar from '@/components/construction/DemoNavbar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Calculator,
  Star,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

const demos = [
  {
    to: '/construction/demo/lead-responder',
    icon: <MessageSquare size={28} />,
    title: 'AI Lead Responder',
    description:
      'Chat with 448\'s AI as a homeowner. Watch it qualify leads, extract project details, and book consultations — all in real time.',
    tags: ['GPT-4o Streaming', 'Live Qualification'],
    color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  },
  {
    to: '/construction/demo/estimate',
    icon: <Calculator size={28} />,
    title: 'Smart Estimate Generator',
    description:
      'Pick a project type, enter your square footage, and get a branded ballpark estimate using 448\'s actual DFW pricing in under 60 seconds.',
    tags: ['Real Pricing', 'Branded Output'],
    color: 'bg-green-50 dark:bg-green-900/20 text-green-600',
  },
  {
    to: '/construction/demo/reviews',
    icon: <Star size={28} />,
    title: 'Review Request System',
    description:
      'Experience the automated SMS flow that turns completed projects into 5-star Google reviews — with Day 3 and Day 7 follow-ups.',
    tags: ['SMS Simulation', 'Analytics Dashboard'],
    color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600',
  },
];

const DemoHub = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
    <DemoNavbar />

    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">
          <Sparkles size={14} className="mr-1" /> Built for 448 Developments
        </Badge>
        <h1 className="text-4xl font-bold mb-3">Interactive POC Demos</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Three working proof-of-concepts showing exactly how AI will transform 448's
          lead capture, estimating, and reputation management.
        </p>
      </div>

      <div className="grid gap-6">
        {demos.map((d) => (
          <Link key={d.to} to={d.to} className="group">
            <Card className="p-6 flex flex-col sm:flex-row items-start gap-5 transition-all hover:shadow-lg hover:border-primary/30">
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
          Ready to see these systems live in your business?
        </p>
        <Button asChild size="lg" className="gap-2">
          <a href="https://calendly.com/mutaaf" target="_blank" rel="noopener noreferrer">
            Book a Call with DigitalCraft AI <ArrowRight size={18} />
          </a>
        </Button>
      </div>
    </div>
  </div>
);

export default DemoHub;
