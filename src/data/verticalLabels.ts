// Ticket 0100 - Single source of truth for /ai-for-<vertical> display
// labels. The label constant is authored ONCE here and imported by both the
// vertical page's `useRecordVerticalVisit` call AND the RecentVerticalsCard
// on /my dashboard per the 2026-05-25 mirror-source rule. The 17 shipped
// long-tail vertical routes plus the `/ai-for-hospitality` hub are covered.
//
// Every string is hyphen-only per the 2026-05-07 em-dash Hard NO.

export const VERTICAL_LABELS = {
  '/ai-for-plumbers': 'Plumbers',
  '/ai-for-hvac': 'HVAC',
  '/ai-for-roofers': 'Roofers',
  '/ai-for-electricians': 'Electricians',
  '/ai-for-painters': 'Painters',
  '/ai-for-landscapers': 'Landscapers',
  '/ai-for-property-managers': 'Property Managers',
  '/ai-for-cleaning-services': 'Cleaning Services',
  '/ai-for-pest-control': 'Pest Control',
  '/ai-for-pool-service': 'Pool Service',
  '/ai-for-restoration-services': 'Restoration Services',
  '/ai-for-moving-companies': 'Moving Companies',
  '/ai-for-solar-installers': 'Solar Installers',
  '/ai-for-window-installers': 'Window Installers',
  '/ai-for-garage-door-companies': 'Garage Door Companies',
  '/ai-for-tree-services': 'Tree Services',
  '/ai-for-fencing-contractors': 'Fencing Contractors',
  '/ai-for-concrete-contractors': 'Concrete Contractors',
  '/ai-for-hospitality': 'Hospitality',
} as const;

export type VerticalPath = keyof typeof VERTICAL_LABELS;

export const VERTICAL_PATHS: readonly VerticalPath[] = Object.keys(
  VERTICAL_LABELS,
) as VerticalPath[];
