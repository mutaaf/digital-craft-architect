export interface RepairCategory {
  id: string;
  label: string;
  icon: string;
  services: RepairService[];
}

export interface RepairService {
  id: string;
  label: string;
  lowPrice: number;
  highPrice: number;
  laborHoursLow: number;
  laborHoursHigh: number;
}

export interface RepairTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface RepairAddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number | null;
  percentCost: number | null;
}

export const REPAIR_CATEGORIES: RepairCategory[] = [
  {
    id: 'routine',
    label: 'Routine Maintenance',
    icon: 'Wrench',
    services: [
      { id: 'oil_change', label: 'Oil Change & Filter', lowPrice: 35, highPrice: 120, laborHoursLow: 0.5, laborHoursHigh: 1 },
      { id: 'tire_rotation', label: 'Tire Rotation & Balance', lowPrice: 40, highPrice: 80, laborHoursLow: 0.5, laborHoursHigh: 1 },
      { id: 'fluid_flush', label: 'Coolant / Transmission Flush', lowPrice: 100, highPrice: 250, laborHoursLow: 1, laborHoursHigh: 2 },
      { id: 'air_filter', label: 'Air & Cabin Filter Replacement', lowPrice: 30, highPrice: 80, laborHoursLow: 0.25, laborHoursHigh: 0.5 },
      { id: 'spark_plugs', label: 'Spark Plug Replacement', lowPrice: 80, highPrice: 350, laborHoursLow: 1, laborHoursHigh: 3 },
    ],
  },
  {
    id: 'brakes',
    label: 'Brake & Suspension',
    icon: 'Disc',
    services: [
      { id: 'brake_pads', label: 'Brake Pad Replacement (per axle)', lowPrice: 150, highPrice: 400, laborHoursLow: 1, laborHoursHigh: 2 },
      { id: 'rotor_resurface', label: 'Rotor Resurface / Replace', lowPrice: 200, highPrice: 600, laborHoursLow: 1.5, laborHoursHigh: 3 },
      { id: 'struts', label: 'Strut / Shock Replacement (pair)', lowPrice: 350, highPrice: 900, laborHoursLow: 2, laborHoursHigh: 4 },
      { id: 'alignment', label: 'Wheel Alignment', lowPrice: 80, highPrice: 180, laborHoursLow: 0.5, laborHoursHigh: 1 },
    ],
  },
  {
    id: 'engine',
    label: 'Engine & Transmission',
    icon: 'Cog',
    services: [
      { id: 'diagnostics', label: 'Engine Diagnostics (check engine light)', lowPrice: 80, highPrice: 150, laborHoursLow: 0.5, laborHoursHigh: 1.5 },
      { id: 'timing_belt', label: 'Timing Belt / Chain Replacement', lowPrice: 500, highPrice: 2000, laborHoursLow: 3, laborHoursHigh: 8 },
      { id: 'transmission_repair', label: 'Transmission Repair / Rebuild', lowPrice: 1500, highPrice: 5000, laborHoursLow: 8, laborHoursHigh: 20 },
      { id: 'head_gasket', label: 'Head Gasket Replacement', lowPrice: 1000, highPrice: 3000, laborHoursLow: 6, laborHoursHigh: 14 },
    ],
  },
  {
    id: 'body',
    label: 'Body & Collision',
    icon: 'Car',
    services: [
      { id: 'dent_repair', label: 'Paintless Dent Repair', lowPrice: 75, highPrice: 300, laborHoursLow: 0.5, laborHoursHigh: 2 },
      { id: 'bumper', label: 'Bumper Repair / Replace', lowPrice: 300, highPrice: 1500, laborHoursLow: 2, laborHoursHigh: 6 },
      { id: 'paint_panel', label: 'Panel Repaint (per panel)', lowPrice: 300, highPrice: 1000, laborHoursLow: 3, laborHoursHigh: 8 },
      { id: 'windshield', label: 'Windshield Replacement', lowPrice: 200, highPrice: 600, laborHoursLow: 1, laborHoursHigh: 2 },
    ],
  },
];

export const REPAIR_TIERS: RepairTier[] = [
  { id: 'economy', label: 'Economy', description: 'Aftermarket parts, reliable quality', multiplier: 1.0 },
  { id: 'oem', label: 'OEM', description: 'Original equipment manufacturer parts', multiplier: 1.3 },
  { id: 'premium', label: 'Premium / Performance', description: 'High-performance or dealer-grade parts', multiplier: 1.6 },
];

export const REPAIR_ADDONS: RepairAddOn[] = [
  { id: 'loaner', label: 'Loaner Vehicle', description: 'Complimentary loaner while your car is in the shop', flatCost: 50, percentCost: null },
  { id: 'pickup', label: 'Pick-Up & Drop-Off', description: 'We pick up your vehicle and return it when ready', flatCost: 75, percentCost: null },
  { id: 'warranty', label: 'Extended Warranty (24 mo)', description: '24-month / 24,000-mile warranty on parts and labor', flatCost: null, percentCost: 12 },
  { id: 'inspection', label: 'Multi-Point Inspection', description: 'Full 50-point vehicle health check', flatCost: 0, percentCost: null },
];
