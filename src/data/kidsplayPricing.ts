export interface PartyType {
  id: string;
  label: string;
  icon: string;
  basePriceLow: number;
  basePriceHigh: number;
  defaultGuests: number;
  minGuests: number;
  maxGuests: number;
  perExtraGuest: number;
  duration: string;
  includes: string[];
}

export interface PartyTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface PartyAddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number;
  perGuestCost?: number;
}

export const PARTY_TYPES: PartyType[] = [
  {
    id: 'basic',
    label: 'Basic Party',
    icon: 'Cake',
    basePriceLow: 199,
    basePriceHigh: 299,
    defaultGuests: 10,
    minGuests: 6,
    maxGuests: 20,
    perExtraGuest: 15,
    duration: '1.5 hours',
    includes: [
      'Private party room for 1.5 hours',
      'Open play access for all guests',
      'Paper plates, cups, and napkins',
      'Dedicated party host',
    ],
  },
  {
    id: 'premium',
    label: 'Premium Party',
    icon: 'PartyPopper',
    basePriceLow: 349,
    basePriceHigh: 499,
    defaultGuests: 15,
    minGuests: 8,
    maxGuests: 30,
    perExtraGuest: 20,
    duration: '2 hours',
    includes: [
      'Private party room for 2 hours',
      'Unlimited play access for all guests',
      'Themed decorations and tableware',
      'Dedicated party host',
      'Pizza and drinks for all guests',
      'Goodie bags for each child',
    ],
  },
  {
    id: 'ultimate',
    label: 'Ultimate Party',
    icon: 'Crown',
    basePriceLow: 599,
    basePriceHigh: 899,
    defaultGuests: 20,
    minGuests: 10,
    maxGuests: 40,
    perExtraGuest: 25,
    duration: '2.5 hours',
    includes: [
      'Private party room for 2.5 hours',
      'VIP play access + exclusive attractions',
      'Premium themed decorations',
      'Dedicated party host + assistant',
      'Full catering: pizza, snacks, cake, drinks',
      'Personalized goodie bags',
      'Birthday child spotlight experience',
    ],
  },
  {
    id: 'custom',
    label: 'Custom / Private Event',
    icon: 'Star',
    basePriceLow: 999,
    basePriceHigh: 2500,
    defaultGuests: 30,
    minGuests: 15,
    maxGuests: 100,
    perExtraGuest: 30,
    duration: '3+ hours',
    includes: [
      'Full venue or section buyout',
      'Flexible duration (3+ hours)',
      'Custom theme and decorations',
      'Dedicated event coordinator',
      'Full catering with custom menu',
      'Entertainment and activities',
      'Setup and breakdown included',
    ],
  },
];

export const PARTY_TIERS: PartyTier[] = [
  {
    id: 'standard',
    label: 'Standard',
    description: 'Everything you need for a great party — solid value',
    multiplier: 1.0,
  },
  {
    id: 'deluxe',
    label: 'Deluxe',
    description: 'Upgraded experience with premium extras and more time',
    multiplier: 1.35,
  },
  {
    id: 'vip',
    label: 'VIP',
    description: 'The ultimate celebration — top-tier everything, white-glove service',
    multiplier: 1.75,
  },
];

export const PARTY_ADD_ONS: PartyAddOn[] = [
  {
    id: 'face-painting',
    label: 'Face Painting',
    description: 'Professional face painter for the duration of the party',
    flatCost: 150,
  },
  {
    id: 'character',
    label: 'Character Appearance',
    description: 'Costumed character visit with photos and interaction (30 min)',
    flatCost: 200,
  },
  {
    id: 'food-upgrade',
    label: 'Food Package Upgrade',
    description: 'Premium menu with hot dogs, chicken fingers, fruit, and ice cream',
    flatCost: 0,
    perGuestCost: 8,
  },
  {
    id: 'photo-booth',
    label: 'Photo Booth',
    description: 'Photo booth with props and instant prints for all guests',
    flatCost: 250,
  },
  {
    id: 'balloon-decor',
    label: 'Balloon Decorations',
    description: 'Custom balloon arch and table centerpieces',
    flatCost: 175,
  },
  {
    id: 'extra-time',
    label: 'Extra Hour',
    description: 'Extend the party by one additional hour',
    flatCost: 100,
  },
  {
    id: 'custom-cake',
    label: 'Custom Cake',
    description: 'Themed birthday cake from local bakery (serves up to 20)',
    flatCost: 85,
  },
  {
    id: 'party-favors',
    label: 'Premium Party Favors',
    description: 'Upgraded goodie bags with toys, candy, and personalized items',
    flatCost: 0,
    perGuestCost: 6,
  },
];

export interface PartyBreakdown {
  base: { low: number; high: number };
  addOns: number;
  tierMultiplier: number;
  total: { low: number; high: number };
}

export function calculatePartyBreakdown(
  partyType: PartyType,
  tier: PartyTier,
  addOns: PartyAddOn[],
  guestCount: number
): PartyBreakdown {
  const extraGuests = Math.max(0, guestCount - partyType.defaultGuests);
  const extraGuestCost = extraGuests * partyType.perExtraGuest;

  const baseLow = partyType.basePriceLow + extraGuestCost;
  const baseHigh = partyType.basePriceHigh + extraGuestCost;

  const addOnTotal = addOns.reduce((sum, a) => {
    const perGuest = (a.perGuestCost || 0) * guestCount;
    return sum + a.flatCost + perGuest;
  }, 0);

  const totalLow = Math.round((baseLow + addOnTotal) * tier.multiplier);
  const totalHigh = Math.round((baseHigh + addOnTotal) * tier.multiplier);

  return {
    base: { low: baseLow, high: baseHigh },
    addOns: addOnTotal,
    tierMultiplier: tier.multiplier,
    total: { low: totalLow, high: totalHigh },
  };
}
