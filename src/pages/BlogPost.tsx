import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useContent } from '@/hooks/useContent';
import { useAnalytics } from '@/utils/analytics';
import { getBlogPost, blogPosts } from '@/data/blogPosts';
import { ArrowLeft, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { content } = useContent();
  useAnalytics('G-JQ53W917HT');

  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const currentIndex = blogPosts.findIndex((p) => p.slug === post.slug);
  const nextPost = blogPosts[currentIndex + 1];
  const prevPost = blogPosts[currentIndex - 1];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{post.title} | DigitalCraft AI</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://digitalcraftai.com/blog/${post.slug}`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "author": {
            "@type": "Organization",
            "name": post.author,
            "url": "https://digitalcraftai.com"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DigitalCraft AI",
            "url": "https://digitalcraftai.com"
          },
          "mainEntityOfPage": `https://digitalcraftai.com/blog/${post.slug}`
        })}</script>
      </Helmet>

      <Navbar />

      <article className="pt-24 md:pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors mb-8">
              <ArrowLeft size={16} />
              Back to Blog
            </Link>

            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-10">
              <span className="inline-flex items-center gap-1">
                <Calendar size={14} />
                {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} />
                {post.readTime}
              </span>
            </div>

            <div
              className="prose prose-lg dark:prose-invert max-w-none
                prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                prose-li:text-gray-700 dark:prose-li:text-gray-300
                prose-strong:text-gray-900 dark:prose-strong:text-white
                prose-a:text-primary hover:prose-a:text-primary/80"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Navigation between posts */}
            <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8 flex justify-between gap-4">
              {prevPost ? (
                <Link to={`/blog/${prevPost.slug}`} className="group text-left">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                    <ArrowLeft size={12} /> Previous
                  </span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {prevPost.title}
                  </span>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="group text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end mb-1">
                    Next <ArrowRight size={12} />
                  </span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors">
                    {nextPost.title}
                  </span>
                </Link>
              ) : <div />}
            </div>
          </div>
        </div>
      </article>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default BlogPost;
