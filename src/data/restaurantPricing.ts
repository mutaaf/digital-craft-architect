export interface CateringServiceType {
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

export interface CateringTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface CateringExtra {
  id: string;
  label: string;
  description: string;
  flatCost: number | null;
  perGuestCost: number | null;
}

export const CATERING_SERVICE_TYPES: CateringServiceType[] = [
  { id: 'private_dining', label: 'Private Dining', icon: 'Wine', lowPerGuest: 45, highPerGuest: 120, defaultGuests: 30, minGuests: 10, maxGuests: 100, timeline: '1-2 days prep' },
  { id: 'corporate_catering', label: 'Corporate Catering', icon: 'Briefcase', lowPerGuest: 25, highPerGuest: 75, defaultGuests: 50, minGuests: 15, maxGuests: 500, timeline: '2-3 days prep' },
  { id: 'event_packages', label: 'Event Packages', icon: 'PartyPopper', lowPerGuest: 55, highPerGuest: 150, defaultGuests: 80, minGuests: 20, maxGuests: 300, timeline: '1-2 weeks prep' },
  { id: 'meal_prep', label: 'Meal Prep Subscriptions', icon: 'Package', lowPerGuest: 10, highPerGuest: 30, defaultGuests: 20, minGuests: 5, maxGuests: 100, timeline: 'Weekly delivery' },
];

export const CATERING_TIERS: CateringTier[] = [
  { id: 'standard', label: 'Standard', description: 'Quality dishes, reliable service — great value for any event', multiplier: 1.0 },
  { id: 'premium', label: 'Premium', description: 'Upgraded menu options, specialty dishes, and elevated presentation', multiplier: 1.4 },
  { id: 'luxury', label: 'Luxury', description: 'Chef-curated tasting menus, white-glove service, premium ingredients', multiplier: 2.0 },
];

export const CATERING_EXTRAS: CateringExtra[] = [
  { id: 'bartender', label: 'Bartender & Bar Setup', description: 'Professional bartender with full bar setup and glassware', flatCost: 600, perGuestCost: null },
  { id: 'waitstaff', label: 'Additional Wait Staff', description: 'Extra servers for plated service or large events', flatCost: 400, perGuestCost: null },
  { id: 'dessert', label: 'Dessert Station', description: 'Custom dessert display with chef-prepared sweets', flatCost: null, perGuestCost: 8 },
  { id: 'linens', label: 'Linens & Tableware', description: 'Premium linens, charger plates, and centerpiece setup', flatCost: null, perGuestCost: 6 },
  { id: 'delivery', label: 'Delivery & Setup', description: 'Full delivery, setup, and breakdown at your venue', flatCost: 350, perGuestCost: null },
];

export interface CateringBreakdown {
  food: { low: number; high: number };
  staffing: { low: number; high: number };
  equipment: { low: number; high: number };
  logistics: { low: number; high: number };
  contingency: { low: number; high: number };
  extras: { label: string; cost: number }[];
  totalLow: number;
  totalHigh: number;
  timeline: string;
}

export function calculateCatering(
  serviceType: CateringServiceType,
  guests: number,
  tier: CateringTier,
  selectedExtras: CateringExtra[]
): CateringBreakdown {
  const baseLow = serviceType.lowPerGuest * guests * tier.multiplier;
  const baseHigh = serviceType.highPerGuest * guests * tier.multiplier;

  const food = { low: Math.round(baseLow * 0.40), high: Math.round(baseHigh * 0.40) };
  const staffing = { low: Math.round(baseLow * 0.30), high: Math.round(baseHigh * 0.30) };
  const equipment = { low: Math.round(baseLow * 0.15), high: Math.round(baseHigh * 0.15) };
  const logistics = { low: Math.round(baseLow * 0.10), high: Math.round(baseHigh * 0.10) };
  const contingency = { low: Math.round(baseLow * 0.05), high: Math.round(baseHigh * 0.05) };

  const extras = selectedExtras.map((e) => ({
    label: e.label,
    cost: e.flatCost ?? (e.perGuestCost! * guests),
  }));

  const extrasTotal = extras.reduce((sum, e) => sum + e.cost, 0);

  return {
    food,
    staffing,
    equipment,
    logistics,
    contingency,
    extras,
    totalLow: food.low + staffing.low + equipment.low + logistics.low + contingency.low + extrasTotal,
    totalHigh: food.high + staffing.high + equipment.high + logistics.high + contingency.high + extrasTotal,
    timeline: serviceType.timeline,
  };
}
