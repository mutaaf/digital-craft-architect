export interface ServiceType {
  id: string;
  label: string;
  icon: string;
  lowPerUnit: number;
  highPerUnit: number;
  unit: string;
  defaultUnits: number;
  minUnits: number;
  maxUnits: number;
  timelineHoursLow: number;
  timelineHoursHigh: number;
}

export interface ServiceTier {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface AddOn {
  id: string;
  label: string;
  description: string;
  flatCost: number | null;
  perUnitCost: number | null;
}

/* ───────────────────── HVAC Install / Repair ───────────────────── */

export const HVAC_SERVICES: ServiceType[] = [
  { id: 'hvac_install', label: 'Full HVAC System Install', icon: 'Thermometer', lowPerUnit: 4000, highPerUnit: 8500, unit: 'system', defaultUnits: 1, minUnits: 1, maxUnits: 4, timelineHoursLow: 8, timelineHoursHigh: 16 },
  { id: 'ac_repair', label: 'AC Repair / Diagnostics', icon: 'Snowflake', lowPerUnit: 150, highPerUnit: 600, unit: 'visit', defaultUnits: 1, minUnits: 1, maxUnits: 1, timelineHoursLow: 1, timelineHoursHigh: 4 },
  { id: 'furnace_repair', label: 'Furnace Repair', icon: 'Flame', lowPerUnit: 200, highPerUnit: 800, unit: 'visit', defaultUnits: 1, minUnits: 1, maxUnits: 1, timelineHoursLow: 1, timelineHoursHigh: 4 },
  { id: 'duct_cleaning', label: 'Duct Cleaning', icon: 'Wind', lowPerUnit: 3, highPerUnit: 7, unit: 'sqft', defaultUnits: 2000, minUnits: 500, maxUnits: 6000, timelineHoursLow: 3, timelineHoursHigh: 6 },
  { id: 'hvac_maintenance', label: 'Seasonal Tune-Up', icon: 'Settings', lowPerUnit: 80, highPerUnit: 200, unit: 'unit', defaultUnits: 1, minUnits: 1, maxUnits: 4, timelineHoursLow: 1, timelineHoursHigh: 2 },
];

/* ───────────────────── Plumbing ───────────────────── */

export const PLUMBING_SERVICES: ServiceType[] = [
  { id: 'water_heater', label: 'Water Heater Install', icon: 'Droplets', lowPerUnit: 1200, highPerUnit: 3500, unit: 'unit', defaultUnits: 1, minUnits: 1, maxUnits: 2, timelineHoursLow: 3, timelineHoursHigh: 8 },
  { id: 'drain_cleaning', label: 'Drain Cleaning', icon: 'ArrowDownToLine', lowPerUnit: 150, highPerUnit: 450, unit: 'drain', defaultUnits: 1, minUnits: 1, maxUnits: 5, timelineHoursLow: 1, timelineHoursHigh: 3 },
  { id: 'pipe_repair', label: 'Pipe Repair / Repipe', icon: 'Wrench', lowPerUnit: 5, highPerUnit: 15, unit: 'linear ft', defaultUnits: 50, minUnits: 5, maxUnits: 500, timelineHoursLow: 2, timelineHoursHigh: 16 },
  { id: 'sewer_line', label: 'Sewer Line Repair', icon: 'Construction', lowPerUnit: 2500, highPerUnit: 8000, unit: 'job', defaultUnits: 1, minUnits: 1, maxUnits: 1, timelineHoursLow: 4, timelineHoursHigh: 16 },
  { id: 'fixture_install', label: 'Fixture Install (faucet, toilet)', icon: 'ShowerHead', lowPerUnit: 200, highPerUnit: 600, unit: 'fixture', defaultUnits: 1, minUnits: 1, maxUnits: 8, timelineHoursLow: 1, timelineHoursHigh: 4 },
];

/* ───────────────────── Electrical ───────────────────── */

export const ELECTRICAL_SERVICES: ServiceType[] = [
  { id: 'panel_upgrade', label: 'Electrical Panel Upgrade', icon: 'Zap', lowPerUnit: 1500, highPerUnit: 4000, unit: 'panel', defaultUnits: 1, minUnits: 1, maxUnits: 2, timelineHoursLow: 4, timelineHoursHigh: 10 },
  { id: 'outlet_install', label: 'Outlet / Switch Install', icon: 'PlugZap', lowPerUnit: 150, highPerUnit: 350, unit: 'outlet', defaultUnits: 2, minUnits: 1, maxUnits: 20, timelineHoursLow: 1, timelineHoursHigh: 4 },
  { id: 'rewiring', label: 'Whole-Home Rewiring', icon: 'Cable', lowPerUnit: 4, highPerUnit: 9, unit: 'sqft', defaultUnits: 1500, minUnits: 500, maxUnits: 5000, timelineHoursLow: 16, timelineHoursHigh: 40 },
  { id: 'lighting_install', label: 'Lighting Install (recessed, fixtures)', icon: 'Lightbulb', lowPerUnit: 200, highPerUnit: 500, unit: 'fixture', defaultUnits: 4, minUnits: 1, maxUnits: 30, timelineHoursLow: 2, timelineHoursHigh: 8 },
  { id: 'ev_charger', label: 'EV Charger Install', icon: 'BatteryCharging', lowPerUnit: 800, highPerUnit: 2500, unit: 'unit', defaultUnits: 1, minUnits: 1, maxUnits: 4, timelineHoursLow: 3, timelineHoursHigh: 6 },
];

/* ───────────────────── Landscaping ───────────────────── */

export const LANDSCAPING_SERVICES: ServiceType[] = [
  { id: 'landscape_design', label: 'Full Landscape Design & Install', icon: 'TreePine', lowPerUnit: 5, highPerUnit: 20, unit: 'sqft', defaultUnits: 1000, minUnits: 200, maxUnits: 10000, timelineHoursLow: 16, timelineHoursHigh: 80 },
  { id: 'lawn_maintenance', label: 'Weekly Lawn Maintenance', icon: 'Scissors', lowPerUnit: 40, highPerUnit: 120, unit: 'visit', defaultUnits: 4, minUnits: 1, maxUnits: 8, timelineHoursLow: 1, timelineHoursHigh: 3 },
  { id: 'irrigation', label: 'Sprinkler / Irrigation Install', icon: 'Droplets', lowPerUnit: 2, highPerUnit: 5, unit: 'sqft', defaultUnits: 2000, minUnits: 500, maxUnits: 15000, timelineHoursLow: 8, timelineHoursHigh: 24 },
  { id: 'tree_service', label: 'Tree Removal / Trimming', icon: 'Axe', lowPerUnit: 300, highPerUnit: 2000, unit: 'tree', defaultUnits: 1, minUnits: 1, maxUnits: 10, timelineHoursLow: 2, timelineHoursHigh: 8 },
  { id: 'hardscape', label: 'Patio / Hardscape', icon: 'Layers', lowPerUnit: 15, highPerUnit: 40, unit: 'sqft', defaultUnits: 300, minUnits: 50, maxUnits: 2000, timelineHoursLow: 16, timelineHoursHigh: 40 },
];

/* ───────────────────── Roofing ───────────────────── */

export const ROOFING_SERVICES: ServiceType[] = [
  { id: 'roof_replace', label: 'Full Roof Replacement', icon: 'Home', lowPerUnit: 4, highPerUnit: 12, unit: 'sqft', defaultUnits: 2000, minUnits: 500, maxUnits: 6000, timelineHoursLow: 16, timelineHoursHigh: 40 },
  { id: 'roof_repair', label: 'Roof Repair (leak, shingle)', icon: 'Hammer', lowPerUnit: 300, highPerUnit: 1500, unit: 'repair', defaultUnits: 1, minUnits: 1, maxUnits: 5, timelineHoursLow: 2, timelineHoursHigh: 8 },
  { id: 'gutter_install', label: 'Gutter Install / Replace', icon: 'ArrowDownToLine', lowPerUnit: 6, highPerUnit: 15, unit: 'linear ft', defaultUnits: 150, minUnits: 20, maxUnits: 500, timelineHoursLow: 4, timelineHoursHigh: 10 },
  { id: 'roof_inspection', label: 'Roof Inspection', icon: 'Search', lowPerUnit: 150, highPerUnit: 400, unit: 'inspection', defaultUnits: 1, minUnits: 1, maxUnits: 1, timelineHoursLow: 1, timelineHoursHigh: 2 },
  { id: 'skylight', label: 'Skylight Install', icon: 'Sun', lowPerUnit: 1000, highPerUnit: 3000, unit: 'skylight', defaultUnits: 1, minUnits: 1, maxUnits: 6, timelineHoursLow: 4, timelineHoursHigh: 8 },
];

/* ───────────────────── Service Tiers ───────────────────── */

export const SERVICE_TIERS: ServiceTier[] = [
  { id: 'standard', label: 'Standard', description: 'Quality work with reliable equipment and materials', multiplier: 1.0 },
  { id: 'premium', label: 'Premium', description: 'Upgraded brands, extended warranty, priority scheduling', multiplier: 1.35 },
  { id: 'elite', label: 'Elite', description: 'Top-tier equipment, lifetime warranty, same-day service', multiplier: 1.75 },
];

/* ───────────────────── Common Add-Ons ───────────────────── */

export const ADD_ONS: AddOn[] = [
  { id: 'permit', label: 'Permit & Inspection', description: 'We handle all permits and code inspections', flatCost: 500, perUnitCost: null },
  { id: 'emergency', label: 'Emergency / After-Hours', description: 'Priority dispatch outside business hours', flatCost: 250, perUnitCost: null },
  { id: 'maintenance_plan', label: 'Annual Maintenance Plan', description: '2 seasonal tune-ups + priority scheduling', flatCost: 350, perUnitCost: null },
  { id: 'disposal', label: 'Old Equipment Disposal', description: 'Haul-away and responsible recycling', flatCost: 150, perUnitCost: null },
];

/* ───────────────────── All Categories ───────────────────── */

export interface ServiceCategory {
  id: string;
  label: string;
  services: ServiceType[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'hvac', label: 'HVAC Install & Repair', services: HVAC_SERVICES },
  { id: 'plumbing', label: 'Plumbing', services: PLUMBING_SERVICES },
  { id: 'electrical', label: 'Electrical', services: ELECTRICAL_SERVICES },
  { id: 'landscaping', label: 'Landscaping', services: LANDSCAPING_SERVICES },
  { id: 'roofing', label: 'Roofing', services: ROOFING_SERVICES },
];
