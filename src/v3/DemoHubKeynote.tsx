import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus } from 'lucide-react';
import DemoNavbar from '@/components/construction/DemoNavbar';
import CompanySetupForm from '@/components/construction/CompanySetupForm';
import DemoVideoCards from '@/components/DemoVideoCards';
import { trackCTAClick, trackDemoClick } from '@/utils/analytics';
import { CALENDLY } from './verticals';
import Sentences from './Sentences';

// The keynote shell every industry demo hub renders (2026-11-12): a centered promise, the "make it
// yours" field, then each demo as a big tile you open. Each hub keeps its own <Helmet>, its ?site=
// loading and its demo list; the long SEO intro stays on the page, folded under "How these demos work".

export interface HubDemo { to: string; title: string; description: string; icon: React.ReactNode; tags?: string[] }

const firstSentence = (s: string) => (s.match(/^.*?[.!?](\s|$)/)?.[0] ?? s).trim();

const DemoHubKeynote: React.FC<{
  industry: string;            // 'Dental'
  analyticsKey: string;        // 'dental'
  companyName?: string | null; // set once ?site= has personalized the hub
  title?: React.ReactNode;     // overrides the default headline
  sub?: React.ReactNode;
  demos: HubDemo[];
  videoVertical?: string;      // DemoVideoCards vertical label, when the hub had one
  videoPoster?: string;        // DemoVideoCards poster, when the hub passed one
  seoIntro?: React.ReactNode;
  lead?: React.ReactNode;      // sits just above the setup field (e.g. the resume-your-demo prompt)
  extra?: React.ReactNode;     // anything a hub showed besides its demo list
  crumbs?: React.ReactNode;    // breadcrumbs: just under the demo bar, where the tools put theirs
}> = ({ industry, analyticsKey, companyName, title, sub, demos, videoVertical, videoPoster, seoIntro, lead, extra, crumbs }) => (
  <div className="min-h-screen bg-white text-[#1d1d1f]">
    <DemoNavbar />
    {crumbs && <div className="mx-auto max-w-[1180px] px-5 [&_a:hover]:!text-[#1d1d1f] [&_nav]:max-w-none [&_nav]:!px-0 [&_ol]:!text-[#6e6e73] [&_[aria-current]]:!text-[#1d1d1f]">{crumbs}</div>}

    <section className="px-5 pb-14 pt-14 text-center md:pb-20 md:pt-20">
      <div className="v3-rise mb-4 text-[17px] font-semibold text-aurora md:text-[19px]" style={{ '--i': 0 } as React.CSSProperties}>
        {companyName ? `Built for ${companyName}` : `Live ${industry.toLowerCase()} demos`}
      </div>
      <h1 className="v3-rise k-h2 mx-auto mb-5 max-w-[16ch]" style={{ '--i': 1 } as React.CSSProperties}>
        {title ?? (companyName ? <>Your AI, answering as {companyName}.</> : <Sentences text="See it work. On your business." />)}
      </h1>
      <p className="v3-rise k-lead mx-auto max-w-[34ch]" style={{ '--i': 2 } as React.CSSProperties}>
        {sub ?? `${demos.length} working demos. No signup. Add your website and every one speaks as you.`}
      </p>
    </section>

    <div className="mx-auto max-w-[760px] px-5">{lead}<CompanySetupForm /></div>

    <section className="mx-auto max-w-[1180px] px-5 pb-20 pt-6 md:pb-28">
      <div className={`grid gap-4 md:gap-5 ${demos.length % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
        {demos.map((d, i) => (
          <Link
            key={d.to}
            to={d.to}
            onClick={() => trackDemoClick(d.title, analyticsKey)}
            className="v3-rise k-tile group flex min-h-[280px] flex-col p-8 transition-colors hover:bg-[#ececf0] md:p-10"
            style={{ '--i': 3 + i } as React.CSSProperties}
          >
            <span className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-white text-aurora [&_svg]:h-7 [&_svg]:w-7" aria-hidden>{d.icon}</span>
            <h2 className="mb-2 text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] md:text-[26px]">{d.title}</h2>
            <p className="mb-6 line-clamp-4 text-[16px] leading-relaxed text-[#6e6e73]">{firstSentence(d.description)}</p>
            <span className="k-link mt-auto">Open the demo <ChevronRight size={18} strokeWidth={2.2} className="mt-px transition-transform group-hover:translate-x-0.5" /></span>
          </Link>
        ))}
      </div>
    </section>

    {extra}

    {videoVertical && (
      <section className="bg-[#f5f5f7] px-5 py-20 md:py-28">
        <div className="mx-auto max-w-[1140px]"><DemoVideoCards vertical={videoVertical} poster={videoPoster} /></div>
      </section>
    )}

    {seoIntro && (
      <section className="mx-auto max-w-[880px] px-5 py-16 md:py-20">
        <details className="group border-y border-[#d2d2d7]">
          <summary className="flex min-h-[72px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-[19px] font-semibold md:text-[21px] [&::-webkit-details-marker]:hidden">
            How these demos work
            <Plus size={22} className="shrink-0 text-[#86868b] transition-transform duration-300 group-open:rotate-45" aria-hidden />
          </summary>
          <div className="space-y-4 pb-8 text-[17px] leading-relaxed text-[#6e6e73] [&_h2]:hidden [&_section]:m-0 [&_section]:border-0 [&_section]:bg-transparent [&_section]:p-0 [&_strong]:text-[#1d1d1f]">{seoIntro}</div>
        </details>
      </section>
    )}

    <section className="bg-[#1d1d1f] px-5 py-24 text-center text-white md:py-32">
      <h2 className="k-h2 mx-auto mb-5 max-w-[14ch]">Want this on your website?</h2>
      <p className="k-lead mx-auto mb-9 max-w-[30ch] !text-[#a1a1a6]">One call to scope it. Live in two weeks.</p>
      <a href={CALENDLY} target="_blank" rel="noopener noreferrer" onClick={() => trackCTAClick('book_a_call', `${analyticsKey}_demo_hub`)} className="k-pill bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]">Book a free 30-minute call</a>
      <p className="mt-4 text-[14px] text-[#a1a1a6]">Free · 30 minutes · By video</p>
    </section>
  </div>
);

export default DemoHubKeynote;
