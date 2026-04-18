import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/utils/analytics';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, Calendar, Clock, Rss } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Blog = () => {
  const { content } = useContent();
  useAnalytics('G-JQ53W917HT');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Blog | DigitalCraft AI</title>
        <meta name="description" content="Insights on AI automation for construction, real estate, and event planning businesses. Learn how AI is transforming traditional industries." />
        <meta property="og:title" content="Blog | DigitalCraft AI" />
        <meta property="og:description" content="Insights on AI automation for construction, real estate, and event planning businesses." />
        <link rel="canonical" href="https://digitalcraftai.com/blog" />
      </Helmet>

      <Navbar />

      <section className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              How AI is transforming construction, real estate, and event planning.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            {blogPosts.map((post, i) => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group block animate-slide-up"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <article className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary/30 transition-all">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                    <ArrowRight size={18} className="text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="text-center py-6">
        <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors">
          <Rss size={16} />
          Subscribe via RSS
        </a>
      </div>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Blog;
