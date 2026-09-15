import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/utils/analytics';
import { blogPosts } from '@/data/blogPosts';
import { ArrowRight, Calendar, Clock, Rss } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Ticket 0079 - CollectionPage + ItemList + BreadcrumbList JSON-LD on
// the /blog index. Emission pattern mirrored from
// `src/pages/case-studies/CaseStudiesHub.tsx` (ticket 0057), the
// closest peer for "hub page emitting the same three-block triple over
// a shared data constant".
//
// 2026-05-25 mirror-source rule: META_DESCRIPTION is the single string
// the Helmet `<meta name="description">` AND the CollectionPage
// JSON-LD `description` both read from, so a future copy edit
// propagates to both surfaces in one render. The new e2e spec asserts
// the two match byte-for-byte.
//
// 2026-05-07 em-dash Hard NO: every string in this module - the H1,
// supporting paragraph, RSS chip label, meta description, JSON-LD
// strings - uses hyphens, not the U+2014 em-dash character. Per-post
// titles are read verbatim from `src/data/blogPosts.ts`; a pre-code
// grep confirmed no shipped title carries U+2014.

const SITE_URL = 'https://digitalcraftai.com';
const BLOG_URL = `${SITE_URL}/blog`;
const ITEM_LIST_ID = `${BLOG_URL}#posts`;

const META_DESCRIPTION =
  'Insights on AI automation for construction, real estate, and event planning businesses. Learn how AI is transforming traditional industries.';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: BLOG_URL },
  ],
};

const COLLECTION_PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Digital Craft AI Blog',
  url: BLOG_URL,
  description: META_DESCRIPTION,
  inLanguage: 'en-US',
  isPartOf: { '@type': 'WebSite', url: SITE_URL },
  mainEntity: { '@id': ITEM_LIST_ID },
};

// ItemList built by mapping over the shared `blogPosts` constant so a
// future post appended there surfaces automatically in both the grid
// and the schema. Each ListItem.url is an absolute
// https://digitalcraftai.com URL; item is nested as BlogPosting with
// datePublished and Organization author (the same author the leaf
// BlogPosting from src/pages/BlogPost.tsx emits).
const ITEM_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  '@id': ITEM_LIST_ID,
  name: 'Digital Craft AI Blog Posts',
  itemListOrder: 'https://schema.org/ItemListOrderDescending',
  numberOfItems: blogPosts.length,
  itemListElement: blogPosts.map((post, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}/blog/${post.slug}`,
    name: post.title,
    item: {
      '@type': 'BlogPosting',
      '@id': `${SITE_URL}/blog/${post.slug}`,
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.date,
      author: {
        '@type': 'Organization',
        name: post.author,
        url: SITE_URL,
      },
    },
  })),
};

const Blog = () => {
  const { content } = useContent();
  useAnalytics('G-JQ53W917HT');

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>Blog | DigitalCraft AI</title>
        <meta name="description" content={META_DESCRIPTION} />
        <meta property="og:title" content="Blog | DigitalCraft AI" />
        <meta property="og:description" content="Insights on AI automation for construction, real estate, and event planning businesses." />
        <link rel="canonical" href={BLOG_URL} />
        <script type="application/ld+json">{JSON.stringify(COLLECTION_PAGE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(ITEM_LIST_SCHEMA)}</script>
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
                        {new Date(post.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
