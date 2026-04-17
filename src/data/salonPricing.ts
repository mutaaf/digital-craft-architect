export interface SalonServiceType {
  id: string;
  label: string;
  icon: string;
  lowPrice: number;
  highPrice: number;
  duration: string;
}

export interface SalonTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface SalonAddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number;
}

export interface SalonServiceCategory {
  id: string;
  label: string;
  services: SalonServiceType[];
}

export const SERVICE_CATEGORIES: SalonServiceCategory[] = [
  {
    id: 'haircuts',
    label: 'Haircuts & Styling',
    services: [
      { id: 'womens_cut', label: "Women's Haircut & Style", icon: 'Scissors', lowPrice: 45, highPrice: 120, duration: '45-60 min' },
      { id: 'mens_cut', label: "Men's Haircut", icon: 'Scissors', lowPrice: 25, highPrice: 60, duration: '30-45 min' },
      { id: 'blowout', label: 'Blowout & Style', icon: 'Wind', lowPrice: 35, highPrice: 75, duration: '30-45 min' },
      { id: 'updo', label: 'Updo / Formal Style', icon: 'Crown', lowPrice: 65, highPrice: 150, duration: '60-90 min' },
      { id: 'kids_cut', label: "Children's Haircut", icon: 'Smile', lowPrice: 20, highPrice: 40, duration: '20-30 min' },
    ],
  },
  {
    id: 'color',
    label: 'Color & Treatments',
    services: [
      { id: 'single_color', label: 'Single Process Color', icon: 'Palette', lowPrice: 75, highPrice: 150, duration: '60-90 min' },
      { id: 'highlights', label: 'Highlights / Balayage', icon: 'Sparkles', lowPrice: 120, highPrice: 300, duration: '90-180 min' },
      { id: 'color_correction', label: 'Color Correction', icon: 'RefreshCw', lowPrice: 200, highPrice: 500, duration: '180-300 min' },
      { id: 'gloss', label: 'Gloss / Toner', icon: 'Droplet', lowPrice: 35, highPrice: 75, duration: '30-45 min' },
      { id: 'keratin', label: 'Keratin Treatment', icon: 'Shield', lowPrice: 200, highPrice: 400, duration: '120-180 min' },
    ],
  },
  {
    id: 'spa',
    label: 'Spa Services',
    services: [
      { id: 'facial', label: 'Classic Facial', icon: 'Flower2', lowPrice: 75, highPrice: 175, duration: '60-90 min' },
      { id: 'massage', label: 'Swedish Massage', icon: 'Hand', lowPrice: 80, highPrice: 180, duration: '60-90 min' },
      { id: 'manicure', label: 'Manicure', icon: 'Hand', lowPrice: 25, highPrice: 60, duration: '30-45 min' },
      { id: 'pedicure', label: 'Pedicure', icon: 'Footprints', lowPrice: 35, highPrice: 75, duration: '45-60 min' },
      { id: 'body_wrap', label: 'Body Wrap / Scrub', icon: 'Leaf', lowPrice: 100, highPrice: 250, duration: '60-90 min' },
    ],
  },
  {
    id: 'bridal',
    label: 'Bridal & Special Occasion',
    services: [
      { id: 'bridal_hair', label: 'Bridal Hair & Style', icon: 'Crown', lowPrice: 150, highPrice: 400, duration: '90-120 min' },
      { id: 'bridal_makeup', label: 'Bridal Makeup', icon: 'Palette', lowPrice: 100, highPrice: 300, duration: '60-90 min' },
      { id: 'bridal_trial', label: 'Bridal Trial Session', icon: 'CalendarCheck', lowPrice: 75, highPrice: 200, duration: '60-90 min' },
      { id: 'bridesmaid', label: 'Bridesmaid Hair & Makeup', icon: 'Users', lowPrice: 80, highPrice: 200, duration: '45-75 min' },
      { id: 'special_occasion', label: 'Special Occasion Package', icon: 'PartyPopper', lowPrice: 120, highPrice: 350, duration: '60-120 min' },
    ],
  },
];

export const SALON_TIERS: SalonTier[] = [
  { id: 'classic', label: 'Classic', description: 'Quality service with trusted products — great value', multiplier: 1.0 },
  { id: 'premium', label: 'Premium', description: 'Upgraded products, extended time, and enhanced techniques', multiplier: 1.4 },
  { id: 'luxury', label: 'Luxury', description: 'Top-tier products, senior stylist, VIP experience', multiplier: 1.85 },
];

export const SALON_ADDONS: SalonAddOn[] = [
  { id: 'deep_condition', label: 'Deep Conditioning Treatment', description: 'Intensive hydration and repair for damaged hair', flatCost: 35 },
  { id: 'scalp_treatment', label: 'Scalp Treatment', description: 'Exfoliating and nourishing scalp therapy', flatCost: 45 },
  { id: 'olaplex', label: 'Olaplex Bond Repair', description: 'Professional bond-building treatment added to any color service', flatCost: 50 },
  { id: 'hot_towel', label: 'Hot Towel & Aromatherapy', description: 'Relaxing hot towel wrap with essential oils', flatCost: 20 },
  { id: 'lash_tint', label: 'Lash or Brow Tint', description: 'Semi-permanent tinting for fuller-looking lashes or brows', flatCost: 30 },
  { id: 'paraffin', label: 'Paraffin Wax Treatment', description: 'Moisturizing paraffin dip for hands or feet', flatCost: 25 },
];

export interface SalonEstimateBreakdown {
  services: { label: string; low: number; high: number }[];
  addOns: { label: string; cost: number }[];
  tierMultiplier: number;
  tierLabel: string;
  subtotalLow: number;
  subtotalHigh: number;
  totalLow: number;
  totalHigh: number;
  estimatedDuration: string;
}
