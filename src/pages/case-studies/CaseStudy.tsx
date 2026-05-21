import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { useAnalytics, trackCTAClick } from '@/utils/analytics';
import { getCaseStudy } from '@/data/caseStudies';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, MapPin, Building2, Quote } from 'lucide-react';

const CaseStudy = () => {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useContent();
  useAnalytics('G-JQ53W917HT');

  const study = slug ? getCaseStudy(slug) : undefined;

  if (!study) {
    return <Navigate to="/#case-studies" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{study.title} | DigitalCraft AI Case Study</title>
        <meta name="description" content={study.summary} />
        <meta property="og:title" content={study.title} />
        <meta property="og:description" content={study.summary} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://digitalcraftai.com/case-studies/${study.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://digitalcraftai.com' },
            { '@type': 'ListItem', position: 2, name: study.vertical, item: `https://digitalcraftai.com${study.verticalPath}` },
            { '@type': 'ListItem', position: 3, name: study.title, item: `https://digitalcraftai.com/case-studies/${study.slug}` },
          ],
        })}</script>
      </Helmet>

      <Navbar />

      <article className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/#case-studies" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-8">
              <ArrowLeft size={16} />
              Back to Success Stories
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {study.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900 dark:text-white">
              {study.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
              <span className="inline-flex items-center gap-1"><Building2 size={14} />{study.industry}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={14} />{study.location}</span>
            </div>

            {/* Headline stat */}
            <div className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 mb-10 text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary">{study.heroStat.value}</div>
              <div className="text-sm uppercase tracking-wide text-gray-600 dark:text-gray-300 mt-1">{study.heroStat.label}</div>
            </div>

            <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-10">{study.summary}</p>

            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">The Challenge</h2>
            {study.challenge.map((para, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{para}</p>
            ))}

            <h2 className="text-2xl font-bold mb-3 mt-8 text-gray-900 dark:text-white">The Solution</h2>
            {study.solution.map((para, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{para}</p>
            ))}

            <h2 className="text-2xl font-bold mb-4 mt-8 text-gray-900 dark:text-white">The Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {study.results.map((metric) => (
                <div key={metric.label} className="rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{metric.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{metric.label}</div>
                </div>
              ))}
            </div>

            <blockquote className="relative rounded-2xl bg-gray-50 dark:bg-gray-900 border-l-4 border-primary p-6 mb-12">
              <Quote className="text-primary/40 mb-2" size={24} />
              <p className="text-lg italic text-gray-800 dark:text-gray-200 mb-2">{study.quote.text}</p>
              <cite className="text-sm not-italic text-gray-500 dark:text-gray-400">{study.quote.author}</cite>
            </blockquote>

            {/* CTA */}
            <div className="rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/20 p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Want results like these for your business?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Book a free AI audit, or try the same tools live in our {study.vertical.toLowerCase()} demos.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://calendly.com/mutaaf"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCTAClick('book_a_call', 'case_study')}
                  className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Book a Free AI Audit <ArrowRight size={18} />
                </a>
                <Link
                  to={study.demoPath}
                  onClick={() => trackCTAClick('try_demos', 'case_study')}
                  className="inline-flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Try the Live Demos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default CaseStudy;
