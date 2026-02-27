export interface PropertyData {
  address: string;
  askingPrice: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  yearBuilt: number;
  propertyType: string;
  condition: string;
  lotSize: string;
  daysOnMarket: number | null;
  listingSource: string;
  notes: string;
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
}

export const PROPERTY_TYPES = [
  { id: 'single_family', label: 'Single Family' },
  { id: 'multi_family', label: 'Multi Family' },
  { id: 'condo', label: 'Condo' },
  { id: 'townhouse', label: 'Townhouse' },
  { id: 'land', label: 'Land' },
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
  };
}
