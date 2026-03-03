export interface ProposalServiceType {
  id: string;
  label: string;
  icon: string;
  lowPerGuest: number;
  highPerGuest: number;
  defaultGuests: number;
  minGuests: number;
  maxGuests: number;
  timeline: string;
}

export interface ProposalTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface ProposalExtra {
  id: string;
  label: string;
  description: string;
  flatCost: number;
}

export const SERVICE_TYPES: ProposalServiceType[] = [
  { id: 'dj', label: 'DJ / Entertainment', icon: 'Music', lowPerGuest: 15, highPerGuest: 45, defaultGuests: 100, minGuests: 20, maxGuests: 500, timeline: '1–2 days setup' },
  { id: 'catering', label: 'Catering / Food Cart', icon: 'UtensilsCrossed', lowPerGuest: 25, highPerGuest: 80, defaultGuests: 80, minGuests: 20, maxGuests: 500, timeline: '1–3 days prep' },
  { id: 'decor', label: 'Decoration / Florals', icon: 'Flower2', lowPerGuest: 10, highPerGuest: 35, defaultGuests: 100, minGuests: 20, maxGuests: 500, timeline: '1–2 days setup' },
  { id: 'photo', label: 'Photography / Video', icon: 'Camera', lowPerGuest: 8, highPerGuest: 25, defaultGuests: 100, minGuests: 20, maxGuests: 500, timeline: '1 day (event day)' },
  { id: 'planning', label: 'Full Planning / Coordination', icon: 'ClipboardList', lowPerGuest: 20, highPerGuest: 60, defaultGuests: 80, minGuests: 20, maxGuests: 300, timeline: '4–12 weeks' },
  { id: 'venue', label: 'Venue Styling', icon: 'Landmark', lowPerGuest: 12, highPerGuest: 40, defaultGuests: 100, minGuests: 50, maxGuests: 500, timeline: '1–2 days setup' },
];

export const PROPOSAL_TIERS: ProposalTier[] = [
  { id: 'essential', label: 'Essential', description: 'Quality service with everything you need — great value', multiplier: 1.0 },
  { id: 'premium', label: 'Premium', description: 'Upgraded options, better materials, and extra polish', multiplier: 1.4 },
  { id: 'luxury', label: 'Luxury', description: 'The full experience — top-tier everything, white-glove service', multiplier: 2.0 },
];

export const PROPOSAL_EXTRAS: ProposalExtra[] = [
  { id: 'setup', label: 'Setup & Breakdown', description: 'Full setup before the event and complete breakdown after', flatCost: 500 },
  { id: 'overtime', label: 'Overtime Hours', description: 'Extended service hours beyond the standard package', flatCost: 400 },
  { id: 'travel', label: 'Travel Fee', description: 'Coverage for travel to venue outside local area', flatCost: 150 },
  { id: 'custom', label: 'Custom Extras', description: 'Special requests, themed additions, or custom elements', flatCost: 300 },
];

export interface ProposalBreakdown {
  equipment: { low: number; high: number };
  staffing: { low: number; high: number };
  design: { low: number; high: number };
  logistics: { low: number; high: number };
  contingency: { low: number; high: number };
  extras: { label: string; cost: number }[];
  totalLow: number;
  totalHigh: number;
  timeline: string;
}

export function calculateProposal(
  serviceType: ProposalServiceType,
  guests: number,
  tier: ProposalTier,
  selectedExtras: ProposalExtra[]
): ProposalBreakdown {
  const baseLow = serviceType.lowPerGuest * guests * tier.multiplier;
  const baseHigh = serviceType.highPerGuest * guests * tier.multiplier;

  const equipment = { low: Math.round(baseLow * 0.25), high: Math.round(baseHigh * 0.25) };
  const staffing = { low: Math.round(baseLow * 0.35), high: Math.round(baseHigh * 0.35) };
  const design = { low: Math.round(baseLow * 0.20), high: Math.round(baseHigh * 0.20) };
  const logistics = { low: Math.round(baseLow * 0.15), high: Math.round(baseHigh * 0.15) };
  const contingency = { low: Math.round(baseLow * 0.05), high: Math.round(baseHigh * 0.05) };

  const extras = selectedExtras.map((e) => ({
    label: e.label,
    cost: e.flatCost,
  }));

  const extrasTotal = extras.reduce((sum, e) => sum + e.cost, 0);

  return {
    equipment,
    staffing,
    design,
    logistics,
    contingency,
    extras,
    totalLow: equipment.low + staffing.low + design.low + logistics.low + contingency.low + extrasTotal,
    totalHigh: equipment.high + staffing.high + design.high + logistics.high + contingency.high + extrasTotal,
    timeline: serviceType.timeline,
  };
}
