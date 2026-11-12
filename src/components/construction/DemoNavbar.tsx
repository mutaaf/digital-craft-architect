import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useDemoContext } from '@/contexts/DemoContext';
import { DEMO_GROUPS } from '@/data/demoCatalog';
import { VERTICALS } from '@/v3/verticals';
import Mark from '@/v3/Mark';

// The demo bar (keynote pass, 2026-11-12): the mark and whose demos these are, every demo for THIS
// industry (from the demo catalog, so dental shows dental's, not construction's), and the way back.
// Thin, white, translucent; the demo list scrolls sideways on a phone.

// fade only the edge that has more demos past it
const fadeEdges = (b: HTMLElement | null) => {
  if (!b) return;
  b.dataset.l = b.scrollLeft > 2 ? '1' : '';
  b.dataset.r = b.scrollLeft + b.clientWidth < b.scrollWidth - 2 ? '1' : '';
};

const short = (t: string) => t.replace(/^AI /, '').replace(/^Smart /, '');

const DemoNavbar = () => {
  const { pathname } = useLocation();
  const { company } = useDemoContext();
  const v = VERTICALS.find((x) => pathname.startsWith(x.hub)) ?? VERTICALS[0];
  const group = DEMO_GROUPS.find((g) => g.demos.some((d) => d.path.startsWith(v.hub + '/')));
  const strip = useRef<HTMLDivElement>(null);
  // the strip scrolls sideways when the list is long: bring the open demo into view (no animation)
  useEffect(() => {
    const box = strip.current;
    if (!box) return;
    const el = box.querySelector<HTMLElement>('[aria-current="page"]');
    if (el) box.scrollLeft = Math.max(0, el.offsetLeft - box.offsetLeft - (box.clientWidth - el.offsetWidth) / 2);
    fadeEdges(box);
  }, [pathname]);
  const name = company?.companyName ? (company.companyName.length > 22 ? company.companyName.slice(0, 22) + '…' : company.companyName) : 'DigitalCraft';

  return (
    <nav className="sticky top-0 z-50 border-b border-[#e8e8ed] bg-white/80 backdrop-blur-xl" style={{ WebkitBackdropFilter: 'blur(20px) saturate(1.6)' }} aria-label="Demos">
      <div className="mx-auto flex h-[52px] max-w-[1180px] items-center gap-4 px-4 md:px-5">
        <Link to={v.hub} className="flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
          <Mark size={28} className="-my-1" />
          <span className="max-w-[40vw] truncate sm:max-w-none">{name}</span>
          <span className="hidden font-normal text-[#86868b] sm:inline">{v.short} demos</span>
        </Link>
        <div ref={strip} onScroll={(e) => fadeEdges(e.currentTarget)} className="dc-demo-strip -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mx-auto flex shrink-0 items-center gap-1">
        {group?.demos.map((d) => {
            const on = pathname === d.path;
            return (
              <Link key={d.path} to={d.path} aria-current={on ? 'page' : undefined}
                className={`flex min-h-[32px] shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[13px] transition-colors ${on ? 'bg-[#1d1d1f] font-medium text-white' : 'text-[#424245] hover:bg-black/5'}`}>
                {short(d.title)}
              </Link>
            );
          })}
        </div>
        </div>
        <Link to={v.path} className="hidden shrink-0 items-center text-[14px] text-aurora hover:underline sm:flex">
          <ChevronLeft size={16} strokeWidth={2.2} /> {v.short}
        </Link>
      </div>
    </nav>
  );
};

export default DemoNavbar;
