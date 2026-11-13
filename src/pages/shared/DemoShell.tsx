import React from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Sparkles } from 'lucide-react';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import DataDisclosureChip from '@/components/DataDisclosureChip';

/** The frame every shared demo sits in: nav, title, the SEO paragraph, the tool, related demos. */
const DemoShell: React.FC<{ title: string; company: string; h1: string; intro: string; seo: string; wide?: boolean; children: React.ReactNode }> = ({ title, company, h1, intro, seo, wide, children }) => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <Helmet>
        <title>{`${title} demo | ${company}`}</title>
        <meta name="description" content={seo.slice(0, 155)} />
        <meta property="og:title" content={`${title} demo | DigitalCraft AI`} />
        <meta property="og:description" content={intro} />
      </Helmet>
      <DemoNavbar />
      <main className={`${wide ? 'max-w-5xl' : 'max-w-3xl'} mx-auto px-5 py-10 sm:px-6 sm:py-14`}>
        <header className="relative mb-10 text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <DataDisclosureChip demoPath={pathname} />
            <span className="inline-flex min-h-[28px] items-center gap-1 rounded-full bg-[var(--v3-aurora-wash)] px-3 text-[13px] font-medium text-[var(--v3-aurora-deep)]">
              <Sparkles size={13} aria-hidden /> {title}
            </span>
          </div>
          <h1 className="k-demo-title mb-3">{h1}</h1>
          <p>{intro}</p>
        </header>
        {children}
        <div className="mt-16 border-t border-[#e8e8ed] pt-10"><p className="k-demo-seo !mb-0">{seo}</p></div>
      </main>
      <RelatedDemos currentPath={pathname} />
    </div>
  );
};

export default DemoShell;

/** A choice tile: big tap target, clear selected state. */
export const Choice: React.FC<{ on: boolean; onClick: () => void; title: string; sub?: string; right?: React.ReactNode; role?: 'radio' | 'checkbox' }> = ({ on, onClick, title, sub, right, role = 'radio' }) => (
  <button
    type="button"
    role={role}
    aria-checked={on}
    onClick={onClick}
    className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-aurora/20 ${on ? 'border-aurora ring-1 ring-aurora' : 'border-[#e8e8ed] hover:border-[#c7c7cc]'}`}
  >
    <span aria-hidden className={`flex h-5 w-5 shrink-0 items-center justify-center border-2 ${role === 'radio' ? 'rounded-full' : 'rounded-md'} ${on ? 'border-aurora bg-aurora' : 'border-[#c7c7cc]'}`}>
      {on && <span className={`${role === 'radio' ? 'h-2 w-2 rounded-full bg-white' : 'text-[11px] font-bold leading-none text-white'}`}>{role === 'checkbox' ? '✓' : ''}</span>}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-[16px] font-medium leading-snug text-[#1d1d1f]">{title}</span>
      {sub && <span className="block text-[14px] leading-snug text-[#6e6e73]">{sub}</span>}
    </span>
    {right && <span className="shrink-0 text-[14px] tabular-nums text-[#6e6e73]">{right}</span>}
  </button>
);

export const StepTitle: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <h2 className="mb-3 flex items-center gap-3 text-[19px] font-semibold tracking-tight text-[#1d1d1f]">
    <span aria-hidden className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1d1d1f] text-[13px] font-semibold text-white">{n}</span>
    {children}
  </h2>
);

/** A text message from the business, as the customer would see it. */
export const Sms: React.FC<{ from: string; children: React.ReactNode }> = ({ from, children }) => (
  <div className="max-w-[340px]">
    <p className="mb-1 pl-3 text-[12px] text-[#86868b]">{from}</p>
    <p className="rounded-[20px] rounded-bl-md bg-[#e9e9eb] px-4 py-2.5 text-[15px] leading-snug text-[#1d1d1f]">{children}</p>
  </div>
);

export const money = (n: number) => `$${Math.round(n).toLocaleString()}`;
export const range = (lo: number, hi: number) => (Math.round(lo) === Math.round(hi) ? money(lo) : `${money(lo)}–${money(hi)}`);
