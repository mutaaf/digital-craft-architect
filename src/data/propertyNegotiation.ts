export interface PropertyData {
  address: string;
  askingPrice: number;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  propertyType: string;
  condition: string;
  lotSize: string;
  daysOnMarket: number | null;
  listingSource: string;
  notes: string;
  acreage: number | null;
  zoning: string | null;
  utilities: string | null;
  sellerMotivation: string | null;
}

export interface NegotiationReport {
  recommendedOffer: number;
  discountPercent: number;
  leveragePoints: string[];
  strategy: {
    initialOffer: string;
    counterStrategy: string;
    walkawayPoint: string;
    timeline: string;
  };
  contingencies: string[];
  roiProjection: {
    purchasePrice: number;
    estimatedRehab: number;
    arv: number;
    potentialProfit: number;
    roiPercent: number;
    holdingCosts: number;
  };
  marketContext: string;
  riskFactors: string[];
  summary: string;
  dealType: string;
  confidenceScore: number;
}

export interface ComparableProperty {
  address: string;
  salePrice: number;
  sqft: number | null;
  acreage: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  saleDate: string;
  distanceMiles: number;
  daysOnMarket: number | null;
  pricePerSqft: number | null;
  pricePerAcre: number | null;
  notes: string;
}

export interface SellerMessage {
  type: 'initial' | 'follow_up' | 'counter_offer';
  label: string;
  subject: string;
  body: string;
  tone: string;
  format: 'sms' | 'email';
}

export type AgentStepStatus = 'pending' | 'running' | 'complete' | 'error';

export interface AgentStep {
  id: 'extract' | 'comps' | 'analysis' | 'messages';
  label: string;
  status: AgentStepStatus;
  summary: string;
  durationMs: number | null;
}

export interface AgentResult {
  property: PropertyData;
  comps: ComparableProperty[];
  report: NegotiationReport;
  sellerMessages: SellerMessage[];
  elapsedMs: number;
}

export const PROPERTY_TYPES = [
  { id: 'single_family', label: 'Single Family' },
  { id: 'multi_family', label: 'Multi Family' },
  { id: 'condo', label: 'Condo' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: 'land', label: 'Vacant Land' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'mixed_use', label: 'Mixed Use' },
];

export const CONDITION_OPTIONS = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
  { id: 'poor', label: 'Poor' },
  { id: 'unknown', label: 'Unknown' },
];

export function emptyProperty(): PropertyData {
  return {
    address: '',
    askingPrice: 0,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 0,
    yearBuilt: 2000,
    propertyType: 'single_family',
    condition: 'unknown',
    lotSize: '',
    daysOnMarket: null,
    listingSource: 'manual',
    notes: '',
    acreage: null,
    zoning: null,
    utilities: null,
    sellerMotivation: null,
  };
}
