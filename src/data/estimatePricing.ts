export interface ProjectType {
  id: string;
  label: string;
  icon: string;
  lowPerSqft: number;
  highPerSqft: number;
  defaultSqft: number;
  minSqft: number;
  maxSqft: number;
  timelineWeeksLow: number;
  timelineWeeksHigh: number;
}

export interface FinishLevel {
  id: string;
  label: string;
  description: string;
  multiplier: number;
}

export interface Extra {
  id: string;
  label: string;
  description: string;
  flatCost: number | null;
  perSqftCost: number | null;
}

export const PROJECT_TYPES: ProjectType[] = [
  { id: 'kitchen', label: 'Kitchen Remodel', icon: 'UtensilsCrossed', lowPerSqft: 120, highPerSqft: 250, defaultSqft: 200, minSqft: 50, maxSqft: 800, timelineWeeksLow: 4, timelineWeeksHigh: 8 },
  { id: 'bathroom', label: 'Bathroom Remodel', icon: 'Bath', lowPerSqft: 150, highPerSqft: 300, defaultSqft: 100, minSqft: 30, maxSqft: 400, timelineWeeksLow: 3, timelineWeeksHigh: 6 },
  { id: 'full_home', label: 'Full Home Renovation', icon: 'Home', lowPerSqft: 80, highPerSqft: 180, defaultSqft: 1500, minSqft: 500, maxSqft: 5000, timelineWeeksLow: 8, timelineWeeksHigh: 20 },
  { id: 'outdoor', label: 'Outdoor / Patio', icon: 'TreePine', lowPerSqft: 60, highPerSqft: 120, defaultSqft: 400, minSqft: 100, maxSqft: 2000, timelineWeeksLow: 2, timelineWeeksHigh: 6 },
  { id: 'other', label: 'Other Project', icon: 'Hammer', lowPerSqft: 80, highPerSqft: 200, defaultSqft: 300, minSqft: 50, maxSqft: 3000, timelineWeeksLow: 2, timelineWeeksHigh: 12 },
];

export const FINISH_LEVELS: FinishLevel[] = [
  { id: 'standard', label: 'Standard', description: 'Quality materials, clean finishes — great value', multiplier: 1.0 },
  { id: 'mid_range', label: 'Mid-Range', description: 'Upgraded fixtures, better countertops & tile', multiplier: 1.35 },
  { id: 'premium', label: 'Premium', description: 'High-end everything — custom cabinetry, designer tile', multiplier: 1.8 },
];

export const EXTRAS: Extra[] = [
  { id: 'permit', label: 'Permit Management', description: 'We handle all permits and inspections', flatCost: 1500, perSqftCost: null },
  { id: 'design', label: 'Design Consultation', description: '3D renderings and material selection', flatCost: 2500, perSqftCost: null },
  { id: 'demo', label: 'Demo & Haul-Away', description: 'Full demolition and debris removal', flatCost: null, perSqftCost: 8 },
];

export interface EstimateBreakdown {
  demoPrep: { low: number; high: number };
  materials: { low: number; high: number };
  labor: { low: number; high: number };
  overhead: { low: number; high: number };
  contingency: { low: number; high: number };
  extras: { label: string; cost: number }[];
  totalLow: number;
  totalHigh: number;
  timelineLow: number;
  timelineHigh: number;
}

export function calculateEstimate(
  projectType: ProjectType,
  sqft: number,
  finish: FinishLevel,
  selectedExtras: Extra[]
): EstimateBreakdown {
  const baseLow = projectType.lowPerSqft * sqft * finish.multiplier;
  const baseHigh = projectType.highPerSqft * sqft * finish.multiplier;

  const demoPrep = { low: Math.round(baseLow * 0.10), high: Math.round(baseHigh * 0.10) };
  const materials = { low: Math.round(baseLow * 0.40), high: Math.round(baseHigh * 0.40) };
  const labor = { low: Math.round(baseLow * 0.35), high: Math.round(baseHigh * 0.35) };
  const overhead = { low: Math.round(baseLow * 0.10), high: Math.round(baseHigh * 0.10) };
  const contingency = { low: Math.round(baseLow * 0.05), high: Math.round(baseHigh * 0.05) };

  const extras = selectedExtras.map((e) => ({
    label: e.label,
    cost: e.flatCost ?? (e.perSqftCost! * sqft),
  }));

  const extrasTotal = extras.reduce((sum, e) => sum + e.cost, 0);

  return {
    demoPrep,
    materials,
    labor,
    overhead,
    contingency,
    extras,
    totalLow: demoPrep.low + materials.low + labor.low + overhead.low + contingency.low + extrasTotal,
    totalHigh: demoPrep.high + materials.high + labor.high + overhead.high + contingency.high + extrasTotal,
    timelineLow: Math.round(projectType.timelineWeeksLow * finish.multiplier),
    timelineHigh: Math.round(projectType.timelineWeeksHigh * finish.multiplier),
  };
}
