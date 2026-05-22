/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
// TODO(eng): typecheck baseline, see docs/backlog/0005
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { BookOpen, ArrowRight, Phone } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  slug: string;
  definition: React.ReactNode;
}

// Plain-language definitions of the AI and automation terms that come up most
// often in sales conversations with non-technical business owners.
const TERMS: GlossaryTerm[] = [
  { term: 'A/B Testing', slug: 'ab-testing', definition: 'Comparing two versions of a page or message by splitting traffic between them and measuring which one converts better.' },
  { term: 'AI Agent', slug: 'ai-agent', definition: 'Software that can understand a goal, make decisions, and take actions on its own, such as qualifying a lead or booking an appointment without step-by-step instructions.' },
  { term: 'API (Application Programming Interface)', slug: 'api', definition: 'A standard way for two software systems to talk to each other, used to connect your AI tools to your CRM, calendar, or phone system.' },
  { term: 'Artificial Intelligence (AI)', slug: 'artificial-intelligence', definition: 'Computer systems that perform tasks normally requiring human intelligence, such as understanding language, recognizing patterns, and making recommendations.' },
  { term: 'Chatbot', slug: 'chatbot', definition: <>An automated assistant that holds a text conversation with website visitors to answer questions and capture lead details. See the <Link to="/construction/demo/lead-responder" className="text-primary hover:underline">AI lead responder demo</Link>.</> },
  { term: 'Churn', slug: 'churn', definition: 'The rate at which customers stop doing business with you over a given period. Reducing churn is usually cheaper than acquiring new customers.' },
  { term: 'Conversational AI', slug: 'conversational-ai', definition: 'AI designed to hold natural, back-and-forth conversations by voice or text, rather than responding with rigid menus or scripted replies.' },
  { term: 'Conversion Rate', slug: 'conversion-rate', definition: 'The percentage of visitors or leads who take a desired action, such as booking a call or submitting a form.' },
  { term: 'CRM (Customer Relationship Management)', slug: 'crm', definition: 'Software that stores your contacts, leads, and deal history in one place so nothing falls through the cracks.' },
  { term: 'Customer Lifetime Value (LTV)', slug: 'customer-lifetime-value', definition: 'The total revenue you can expect from a single customer over the entire relationship.' },
  { term: 'Fine-Tuning', slug: 'fine-tuning', definition: 'Further training a general AI model on your own data so it speaks in your brand voice and understands your specific business.' },
  { term: 'GPT-4o', slug: 'gpt-4o', definition: 'A multimodal large language model from OpenAI that powers many of the text, vision, and chat features in our demos.' },
  { term: 'Hallucination', slug: 'hallucination', definition: 'When an AI model produces confident but incorrect or made-up information. Careful system design and guardrails reduce it.' },
  { term: 'Inbound Lead', slug: 'inbound-lead', definition: 'A potential customer who reaches out to you first through a form, call, or message, rather than being cold-contacted.' },
  { term: 'Intent Detection', slug: 'intent-detection', definition: "The AI's ability to figure out what a person actually wants from their message, so it can route or respond appropriately." },
  { term: 'Knowledge Base', slug: 'knowledge-base', definition: 'A structured collection of your business information that an AI uses to answer questions accurately about your services, pricing, and policies.' },
  { term: 'Large Language Model (LLM)', slug: 'large-language-model', definition: 'An AI model trained on vast amounts of text that can understand and generate human-like language, powering chatbots and writing assistants.' },
  { term: 'Lead Qualification', slug: 'lead-qualification', definition: 'Determining whether a prospect is a good fit and ready to buy, based on budget, timeline, and need.' },
  { term: 'Lead Scoring', slug: 'lead-scoring', definition: <>Ranking leads by how likely they are to convert, using signals like budget, urgency, and decision-making authority. Try the <Link to="/construction/demo/lead-scoring" className="text-primary hover:underline">lead scoring demo</Link>.</> },
  { term: 'Machine Learning (ML)', slug: 'machine-learning', definition: 'A branch of AI where systems learn patterns from data and improve over time without being explicitly programmed for every case.' },
  { term: 'Marketing Automation', slug: 'marketing-automation', definition: 'Using software to handle repetitive marketing tasks like follow-up emails, lead nurturing, and campaign tracking automatically.' },
  { term: 'Natural Language Processing (NLP)', slug: 'natural-language-processing', definition: 'The field of AI focused on understanding and generating human language, the foundation of chatbots and voice assistants.' },
  { term: 'No-Show', slug: 'no-show', definition: 'A scheduled appointment or call where the prospect does not appear. Automated reminders and confirmations reduce no-show rates.' },
  { term: 'Nurture Sequence', slug: 'nurture-sequence', definition: 'A planned series of follow-up messages that keep a lead engaged over time until they are ready to buy.' },
  { term: 'Outbound Calling', slug: 'outbound-calling', definition: <>Proactively contacting leads or customers by phone. AI <Link to="/construction/demo/voice-negotiator" className="text-primary hover:underline">voice agents</Link> can place these calls at scale for reminders and follow-up.</> },
  { term: 'Prompt Engineering', slug: 'prompt-engineering', definition: 'The practice of crafting the instructions given to an AI model to get accurate, useful, on-brand responses.' },
  { term: 'Retrieval-Augmented Generation (RAG)', slug: 'retrieval-augmented-generation', definition: 'A technique that lets an AI pull in your real, up-to-date business data before answering, instead of relying only on its training.' },
  { term: 'Return on Investment (ROI)', slug: 'roi', definition: <>A measure of the profit generated relative to the cost of an investment, often used to justify automation spend. Estimate yours with the <Link to="/construction#roi-calculator" className="text-primary hover:underline">ROI calculator</Link>.</> },
  { term: 'Sentiment Analysis', slug: 'sentiment-analysis', definition: 'Automatically detecting whether a message or review is positive, negative, or neutral, useful for prioritizing responses.' },
  { term: 'Speech-to-Text (STT)', slug: 'speech-to-text', definition: 'Technology that converts spoken words into written text, letting voice AI understand what a caller is saying.' },
  { term: 'Speed-to-Lead', slug: 'speed-to-lead', definition: 'How fast you respond to a new lead. Responding within minutes dramatically increases the odds of connecting and closing.' },
  { term: 'Text-to-Speech (TTS)', slug: 'text-to-speech', definition: 'Technology that converts written text into natural-sounding spoken audio, giving voice AI its voice.' },
  { term: 'Token', slug: 'token', definition: 'The small chunks of text an AI model reads and generates. AI usage and cost are often measured in tokens.' },
  { term: 'UTM Parameters', slug: 'utm-parameters', definition: 'Tags added to a URL that tell your analytics which campaign, source, or ad sent a visitor, so you can measure what works.' },
  { term: 'Voice AI', slug: 'voice-ai', definition: <>AI that conducts spoken phone conversations, handling tasks like lead follow-up, appointment reminders, and negotiation. See the <Link to="/construction/demo/voice-negotiator" className="text-primary hover:underline">voice negotiator demo</Link>.</> },
  { term: 'Webhook', slug: 'webhook', definition: 'An automated message sent from one app to another when an event happens, used to trigger workflows in real time.' },
  { term: 'Workflow Automation', slug: 'workflow-automation', definition: 'Connecting tools and steps so a process runs automatically end to end, reducing manual handoffs and errors.' },
];

const Glossary: React.FC = () => {
  const { data } = useContent();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>AI & Automation Glossary | Key Terms Explained | DigitalCraft AI</title>
        <meta
          name="description"
          content="A plain-language glossary of AI and business automation terms like LLM, RAG, Voice AI, Lead Scoring, Speed-to-Lead, and CRM, explained for non-technical business owners."
        />
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <BookOpen size={16} />
            AI & Automation Glossary
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            AI Terms, <span className="text-primary">Explained Simply</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            AI and automation come with a lot of jargon. This glossary breaks down the
            {' '}{TERMS.length} terms you are most likely to hear when evaluating AI for your
            business, in plain language with no hype.
          </p>
        </div>
      </section>

      {/* Jump nav */}
      <section className="py-8 bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {TERMS.map((t) => (
              <a
                key={t.slug}
                href={`#${t.slug}`}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {t.term}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-3xl">
          <dl className="space-y-8">
            {TERMS.map((t) => (
              <div key={t.slug} id={t.slug} className="scroll-mt-28">
                <dt className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t.term}
                </dt>
                <dd className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t.definition}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Ready to Put These Ideas to Work?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Skip the jargon and see AI built for your industry. Book a free call or explore
            live demos personalized to your own business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('book_a_call', 'glossary_cta')}
            >
              <Phone size={18} />
              Book a Free Discovery Call
            </a>
            <Link
              to="/industries"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary rounded-lg font-medium transition-colors"
              onClick={() => trackCTAClick('view_industries', 'glossary_cta')}
            >
              Browse Industries
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {data && <Footer data={data.footer} />}
    </div>
  );
};

export default Glossary;
