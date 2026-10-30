import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContent } from '@/hooks/useContent';
import { trackCTAClick } from '@/utils/analytics';
import { ArrowRight, Cat, ClipboardList, ExternalLink, FlaskConical, Gauge, Github, Phone, Plane, Rocket, Tv, type LucideIcon } from 'lucide-react';
import {
  LABS_GAMES,
  LABS_PIPELINE_STEPS,
  META_DESCRIPTION,
  PAGE_H1,
  PAGE_URL,
  type LabsGame,
  type LabsGameAccent,
} from '@/data/labsGames';

// /labs games launcher. Three live games shipped and maintained by the
// same scout / builder / keeper agent pipeline Digital Craft sells, framed
// as working proof, plus Hearth (a home tool), KIN (a two-screen creature) and
// Chalk Talk (a coach's whiteboard), all built outside that pipeline. Copy lives in src/data/labsGames.ts (mirror-source).
// Every surface ships dark: variants per the AGENTS.md Hard NO.

const ORIGIN = 'https://digitalcraftai.com';

const BREADCRUMB_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'Labs', item: PAGE_URL },
  ],
};

const ACCENT_SCREEN: Record<LabsGameAccent, string> = {
  sky: 'from-sky-500/90 via-cyan-500/80 to-emerald-400/70 dark:from-sky-600/80 dark:via-cyan-700/70 dark:to-emerald-600/60',
  fuchsia: 'from-fuchsia-600/90 via-pink-500/80 to-amber-400/70 dark:from-fuchsia-700/80 dark:via-pink-700/70 dark:to-amber-600/60',
  slate: 'from-gray-900 via-gray-800 to-gray-700 dark:from-black dark:via-gray-900 dark:to-gray-800',
  ember: 'from-stone-900 via-stone-800 to-orange-600/90 dark:from-black dark:via-stone-900 dark:to-orange-700/80',
  mint: 'from-gray-950 via-slate-900 to-teal-300/80 dark:from-black dark:via-gray-900 dark:to-teal-500/70',
  court: 'from-slate-950 via-blue-950 to-orange-500/80 dark:from-black dark:via-slate-950 dark:to-orange-600/70',
};

const ACCENT_ICON: Record<string, LucideIcon> = {
  'openaero-dfw': Plane,
  'outatime-88': Gauge,
  'cold-gas': Rocket,
  hearth: Tv,
  kin: Cat,
  'chalk-talk': ClipboardList,
};

const GameCard: React.FC<{ game: LabsGame; index: number; wide?: boolean }> = ({ game, index, wide }) => {
  const Icon = ACCENT_ICON[game.id] ?? FlaskConical;
  return (
    <Card
      data-testid="labs-game-card"
      id={game.id}
      className={`group scroll-mt-28 flex flex-col${wide ? ' md:col-span-2' : ''} overflow-hidden rounded-2xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 dark:hover:border-primary/50`}
    >
      <a
        href={game.playUrl}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        onClick={() => trackCTAClick(`labs_play_${game.id}_screen`, 'labs')}
        className={`relative block h-44 bg-gradient-to-br ${ACCENT_SCREEN[game.accent]}`}
      >
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute left-4 top-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
          {`0${index + 1} / ${game.tagline}`}
        </div>
        {game.isNew && (
          <Badge
            data-testid="labs-game-new"
            className="absolute right-4 top-4 border-white/30 bg-white text-gray-900 hover:bg-white dark:bg-white dark:text-gray-900"
          >
            NEW
          </Badge>
        )}
        <Icon
          size={64}
          className="absolute bottom-4 right-5 text-white/90 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
        />
      </a>
      <CardHeader className="pb-2">
        <CardTitle data-testid="labs-game-name" className="text-xl text-gray-900 dark:text-white">
          {game.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{game.description}</p>
        <div className="flex flex-wrap gap-2">
          {game.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
        <a
          href={game.playUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="labs-game-play"
          onClick={() => trackCTAClick(`labs_play_${game.id}`, 'labs')}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
        >
          {game.ctaLabel ?? 'Launch game'}
          <ExternalLink size={14} aria-hidden="true" />
        </a>
        <a
          href={game.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="labs-game-source"
          onClick={() => trackCTAClick(`labs_source_${game.id}`, 'labs')}
          className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <Github size={14} aria-hidden="true" />
          {game.sourceLabel}
        </a>
      </CardFooter>
    </Card>
  );
};

const Labs: React.FC = () => {
  const { content } = useContent();
  const viewFiredRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (viewFiredRef.current) return;
    viewFiredRef.current = true;
    trackCTAClick('labs_view', 'page_mount');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Helmet>
        <title>{`${PAGE_H1} | DigitalCraft AI`}</title>
        <meta name="description" content={META_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:title" content={`${PAGE_H1} | DigitalCraft AI`} />
        <meta property="og:description" content={META_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>
      <Navbar />
      <ScrollProgress />

      {/* Hero */}
      <section className="pt-32 pb-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
            <FlaskConical size={16} />
            Digital Craft Labs
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">{PAGE_H1}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The three games are live, public, and maintained by the same autonomous agent
            pipeline we run for clients. Scout, builder, and keeper agents work every day behind
            CI gates. Play one for two minutes and you have seen the delivery engine behind every
            Digital Craft engagement. Hearth, KIN and Chalk Talk, the last three cards, are built
            outside that pipeline: one remote for every TV in the house, a tiny creature that hops
            from one screen to the next, and a coach's whiteboard you can talk to.
          </p>
        </div>
      </section>

      {/* Game cards */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2">
            {LABS_GAMES.map((game, i) => (
              <GameCard
                key={game.id}
                game={game}
                index={i}
                wide={i === LABS_GAMES.length - 1 && LABS_GAMES.length % 2 === 1}
              />
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Each card opens in a new tab. The games play best on a desktop browser with a keyboard.
          </p>
        </div>
      </section>

      {/* How they're built */}
      <section className="py-14 bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            How they're built
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center mb-10 max-w-2xl mx-auto">
            No game studio, no night shift. One pipeline, the same one we install for your business,
            with a human approving direction and the gates deciding what ships.
          </p>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LABS_PIPELINE_STEPS.map((step, i) => (
              <li
                key={step.id}
                data-testid="labs-pipeline-step"
                className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5"
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 font-mono text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{step.name}</h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { label: 'How we ship', href: '/how-we-ship' },
              { label: 'Meet the agent fleet', href: '/agent-fleet' },
              { label: 'Public changelog', href: '/changelog' },
            ].map((chip) => (
              <Link
                key={chip.href}
                to={chip.href}
                onClick={() => trackCTAClick(`labs_sibling_${chip.href.slice(1)}`, 'labs')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-sm text-gray-700 dark:text-gray-300 hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary transition-colors"
              >
                {chip.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Point the same pipeline at your business
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            The agents that keep these games running answer leads, draft estimates, and follow up
            with customers for service businesses. Try a live demo built from your own website, or
            book a 30-minute call to scope the first workflow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/demos"
              onClick={() => trackCTAClick('labs_cta_demos', 'labs')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
            >
              Try a live demo
              <ArrowRight size={18} />
            </Link>
            <a
              href="https://calendly.com/mutaaf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCTAClick('labs_cta_strategy_call', 'labs')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary font-medium transition-colors"
            >
              <Phone size={18} />
              Book a discovery call
            </a>
          </div>
        </div>
      </section>

      {content?.footer && <Footer data={content.footer} />}
    </div>
  );
};

export default Labs;
