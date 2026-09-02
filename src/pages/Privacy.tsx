import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollProgress from '@/components/ScrollProgress';
import { useContent } from '@/hooks/useContent';
import { Shield } from 'lucide-react';

/**
 * The privacy policy for DigitalCraft AI and the products it operates.
 *
 * Everything on this page is a claim about what the code does, checked against
 * the code rather than written from a template. The website and the 18-0 game
 * are described separately because they behave very differently: the website
 * runs analytics, error monitoring and session replay, and the game runs none
 * of that. Collapsing them into one set of paragraphs would have made both
 * descriptions wrong.
 *
 * The game section is also the URL given to Apple and Google at review, so it
 * has to keep matching the app.
 */

const LAST_UPDATED = '2 September 2026';
const CONTACT = 'mutaaf@digitalcraftai.com';

const DESCRIPTION =
  'What DigitalCraft AI collects on this website and in the 18-0 game, why it is ' +
  'collected, who it goes to, and how to have it deleted.';

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({
  id,
  title,
  children,
}) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
    <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">{children}</div>
  </section>
);

const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-xl border border-primary/20 dark:border-primary/30 bg-primary/5 dark:bg-primary/10 p-5 space-y-3">
    {children}
  </div>
);

const Privacy: React.FC = () => {
  const { content } = useContent();

  return (
  <div className="min-h-screen bg-white dark:bg-gray-950">
    <Helmet>
      <title>Privacy Policy | DigitalCraft AI</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href="https://digitalcraftai.com/privacy" />
    </Helmet>
    <Navbar />
    <ScrollProgress />

    <section className="pt-32 pb-12 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
          <Shield size={16} />
          Privacy
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
          Privacy <span className="text-primary">Policy</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          What we collect, why, who it goes to, and how to have it removed. Written against
          what the code actually does.
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Last updated {LAST_UPDATED}
        </p>
      </div>
    </section>

    <div className="container mx-auto px-4 max-w-3xl py-12 space-y-14">
      <Section id="scope" title="What this covers">
        <p>
          DigitalCraft AI operates this website and the products listed here. The website and
          the 18-0 game are described separately because they behave very differently. The
          website runs analytics and error monitoring. The game runs neither.
        </p>
        <p>
          For how the interactive demos on this site handle a company website you enter, there
          is a longer explanation on the{' '}
          <Link to="/trust" className="text-primary hover:underline">
            trust page
          </Link>
          .
        </p>
      </Section>

      <Section id="website" title="This website">
        <p>You can read this site without giving us anything. When you do more than read:</p>
        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
          <li>
            <strong className="text-gray-900 dark:text-white">Contact and demo request forms.</strong>{' '}
            Your name, email address, company and message are submitted through Formspree,
            which delivers them to us by email.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Analytics.</strong> Google
            Analytics records pages viewed, approximate location, device and browser, and how
            you arrived. This uses cookies.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Error monitoring and session
            replay.</strong> Sentry records diagnostic details when something breaks, and
            replays a sampled share of browsing sessions so a fault can be reproduced. A replay
            captures interactions with pages on this site. It does not capture other tabs, and
            it is a sample rather than every visit.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">The interactive demos.</strong>{' '}
            If you enter your company website address, that page is fetched and read so the
            demo can be personalised to your business. The text is sent to OpenAI to generate
            the demo response. Voice demos additionally use Vapi, ElevenLabs and Deepgram to
            run the call, which means the audio and its transcript pass through those services.
            If you give a phone number for an outbound demo call, it is used to place that call.
          </li>
        </ul>
        <p>
          Demo results are cached in your browser for about thirty minutes so the same request
          is not run twice. That cache lives on your device.
        </p>
      </Section>

      <Section id="game" title="The 18-0 game">
        <p>
          <Link to="/" className="text-primary hover:underline">
            18-0
          </Link>{' '}
          is a football game published by DigitalCraft AI and available on the web and as a
          mobile app. It does not want your identity, and it is built so that it does not need
          one.
        </p>
        <p>
          There are no ads, no advertising identifiers, no third-party analytics, no tracking
          across other apps or websites, and nothing is sold or shared with data brokers. The
          error monitoring and session replay described above are not present in the game.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
          Playing without an account
        </h3>
        <p>
          You can play without signing in or giving us anything. Casual games are held on your
          device and never sent anywhere.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white pt-2">
          What is stored when you play ranked
        </h3>
        <p>
          Ranked play puts a score on a shared leaderboard, so it needs something to attach
          that score to. The game creates an anonymous account automatically: a random
          identifier, with no email address, no password, and no name attached to it unless you
          choose one.
        </p>
        <ul className="list-disc pl-5 space-y-2 marker:text-primary">
          <li>
            <strong className="text-gray-900 dark:text-white">An account identifier.</strong> A
            random value. It is not derived from your device, your phone number, or anything
            about you.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">A display name, if you set one.</strong>{' '}
            You choose it, it is visible to everyone on the leaderboard, and it can be changed
            once a month. Until you set one you are given a generated placeholder.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Your ranked games.</strong> The
            roster you built, the rating and record it earned, and when it was played.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Reports you file</strong> about
            another player's display name, so the same name is not reported twice by the same
            person.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">A record of server requests.</strong>{' '}
            Each request the game makes is logged with a request identifier, the account that
            made it, what was asked for, whether it was allowed or refused, how long it took,
            and which kind of client sent it. This is how forged scores and abuse are detected,
            and how a disputed leaderboard entry can be checked. It contains no message content
            and nothing about you beyond the account identifier.
          </li>
        </ul>
        <p>
          If you choose to sign in with Apple or Google so your seasons survive losing your
          phone, that provider tells us the email address on the account. Apple lets you hide
          it behind a relay address, and that works here.
        </p>
        <Callout>
          <p className="text-gray-700 dark:text-gray-200">
            <strong className="text-gray-900 dark:text-white">
              Gameplay statistics stay on your device.
            </strong>{' '}
            The game keeps a local record of how a session went, such as spins taken and which
            positions stall people, so the game can be tuned. It is held on the device and is
            not transmitted. There is no analytics service connected to the game.
          </p>
        </Callout>
      </Section>

      <Section id="where" title="Where it is kept">
        <p>
          Game data is held on{' '}
          <a
            href="https://supabase.com/privacy"
            rel="noopener noreferrer"
            target="_blank"
            className="text-primary hover:underline"
          >
            Supabase
          </a>
          , in a database hosted in Northern California, United States. If you are outside the
          United States, playing ranked means that data is stored there.
        </p>
        <p>
          This website is served by Vercel, and the web build of the game by GitHub Pages. Both
          receive the ordinary request information any web server does, including your IP
          address.
        </p>
      </Section>

      <Section id="deleting" title="Deleting it">
        <p>
          <strong className="text-gray-900 dark:text-white">Delete my account</strong> is inside
          the game, on the leaderboard screen. It does not require contacting anyone. It
          permanently removes your account, your display name, and every ranked game attached to
          it. Your leaderboard entries go with them.
        </p>
        <Callout>
          <p className="text-gray-700 dark:text-gray-200">
            One thing survives, and it is worth being plain about. The record of server requests
            described above is append-only. Nothing, including us, can edit or delete a row once
            it is written. That is deliberate: a log that could be quietly rewritten could not be
            used to settle a dispute about a score.
          </p>
          <p className="text-gray-700 dark:text-gray-200">
            What remains in it is the random account identifier and what that account asked the
            server to do. After deletion that identifier no longer corresponds to any account,
            any name, or any game. It is kept because an integrity record that the person it
            records can erase is not an integrity record.
          </p>
        </Callout>
        <p>
          For anything submitted through this website, such as a contact form or a demo request,
          write to us at the address below and we will remove it.
        </p>
      </Section>

      <Section id="children" title="Children">
        <p>
          Neither this website nor the game is directed at children under 13, and we do not
          knowingly collect anything from them. In the game there is no way for one player to
          send another a message, and the only thing a player can publish is a display name,
          which is filtered when it is chosen and can be reported by anyone.
        </p>
      </Section>

      <Section id="rights" title="Your rights">
        <p>
          Depending on where you live, you may have the right to access, correct, or delete what
          is held about you, and to object to its processing. In the game, deletion is built in
          and is immediate. For anything else, write to us.
        </p>
        <p>
          Because game accounts are anonymous by design, we usually cannot connect a request to
          an account without the account identifier, which you can find in the game. Asking for
          it is not an attempt to collect more about you. It is the only link that exists.
        </p>
      </Section>

      <Section id="changes" title="Changes">
        <p>
          If this changes, the date at the top changes with it, and the history of this page is
          public in the project repository.
        </p>
      </Section>

      <Section id="contact" title="Contact">
        <p>
          <a href={`mailto:${CONTACT}`} className="text-primary hover:underline font-medium">
            {CONTACT}
          </a>
        </p>
      </Section>
    </div>

    {content?.footer && <Footer data={content.footer} />}
  </div>
  );
};

export default Privacy;
