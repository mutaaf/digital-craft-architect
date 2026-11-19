import { HardHat, Building2, PartyPopper, Wrench, Heart, Scale, UtensilsCrossed, Gamepad2, Dumbbell, Stethoscope, Scissors, Car, type LucideIcon } from 'lucide-react';

export const CALENDLY = 'https://calendly.com/mutaaf';

// Every industry with a demo hub. Each hub reads ?site=<domain> and personalizes its demos to that
// company (src/pages/*/DemoHub.tsx), so "try it on your company" is one link.
export interface Vertical { key: string; label: string; short: string; path: string; hub: string; icon: LucideIcon }
export const VERTICALS: Vertical[] = [
  { key: 'construction', label: 'Construction', short: 'Construction', path: '/construction', hub: '/construction/demo', icon: HardHat },
  { key: 'realestate', label: 'Real Estate', short: 'Real estate', path: '/realestate', hub: '/realestate/demo', icon: Building2 },
  { key: 'homeservices', label: 'Home Services', short: 'Home services', path: '/homeservices', hub: '/homeservices/demo', icon: Wrench },
  { key: 'events', label: 'Events', short: 'Events', path: '/events', hub: '/events/demo', icon: PartyPopper },
  { key: 'healthcare', label: 'Healthcare', short: 'Healthcare', path: '/healthcare', hub: '/healthcare/demo', icon: Heart },
  { key: 'legal', label: 'Law Firms', short: 'Law', path: '/legal', hub: '/legal/demo', icon: Scale },
  { key: 'restaurant', label: 'Restaurants', short: 'Restaurants', path: '/restaurant', hub: '/restaurant/demo', icon: UtensilsCrossed },
  { key: 'kidsplay', label: 'Kids Play', short: 'Kids play', path: '/kidsplay', hub: '/kidsplay/demo', icon: Gamepad2 },
  { key: 'fitness', label: 'Fitness & Gyms', short: 'Fitness', path: '/fitness', hub: '/fitness/demo', icon: Dumbbell },
  { key: 'dental', label: 'Dental', short: 'Dental', path: '/dental', hub: '/dental/demo', icon: Stethoscope },
  { key: 'salon', label: 'Salons & Spas', short: 'Salons', path: '/salon', hub: '/salon/demo', icon: Scissors },
  { key: 'autorepair', label: 'Auto Repair', short: 'Auto repair', path: '/autorepair', hub: '/autorepair/demo', icon: Car },
];

/** "https://www.Acme-Roofing.com/about?x" → "acme-roofing.com"; null when it isn't a site */
export function domainOf(input: string | null | undefined): string | null {
  if (!input) return null;
  const m = input.match(/(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)+[a-z]{2,})(?:[/?#:]|\s|$)/i);
  return m ? m[1].toLowerCase() : null;
}

export const tryUrl = (vertical: string, site: string | null) => {
  const v = VERTICALS.find((x) => x.key === vertical) ?? VERTICALS[0];
  return site ? `${v.hub}?site=${encodeURIComponent(site)}` : v.hub;
};
