import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpRight, X } from 'lucide-react';
import { isBetaHost, liveUrl } from '@/utils/beta';
import { useFold } from './fold';

// Every page on beta.digitalcraftai.com says so, and links to the same page on the live site
// (which stays untouched on main until the overhaul is merged).
const BetaBadge: React.FC = () => {
  useLocation(); // re-render on navigation so the live link follows the page
  const { form } = useFold();
  const [hidden, setHidden] = useState(() => { try { return sessionStorage.getItem('dc_v3_beta_hidden') === '1'; } catch { return false; } });
  if (!isBetaHost() || hidden) return null;
  return (
    <div
      className="fixed z-[56] flex items-center gap-1 rounded-full border border-[#c96e2c]/50 bg-[rgba(246,244,239,0.9)] py-1 pl-3 pr-1 text-[11.5px] text-gray-700 backdrop-blur md:bottom-4"
      style={{ bottom: 'calc(var(--v3-dock-h, 0px) + 12px)', left: form === 'open' ? 'calc(var(--v3-hinge-l) + var(--v3-hinge-w) + 12px)' : 12 }}
    >
      <span className="v3-mono font-semibold text-[#e89862]">β</span>
      <span className="ml-1 hidden sm:inline">Preview of the new site ·</span>
      <a href={liveUrl()} className="ml-1 inline-flex items-center gap-0.5 text-gray-900 underline-offset-2 hover:underline">
        current site <ArrowUpRight size={12} />
      </a>
      <button
        onClick={() => { setHidden(true); try { sessionStorage.setItem('dc_v3_beta_hidden', '1'); } catch { /* blocked */ } }}
        className="grid h-7 w-7 place-items-center rounded-full text-gray-500 hover:text-gray-900"
        aria-label="Hide the preview badge"
      >
        <X size={12} />
      </button>
    </div>
  );
};
export default BetaBadge;
