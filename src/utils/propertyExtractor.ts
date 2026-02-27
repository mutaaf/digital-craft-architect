import { chatWithVision } from './openaiVision';
import type { PropertyData, NegotiationReport } from '@/data/propertyNegotiation';

// ── Jina scraping (reuses pattern from websiteScraper.ts) ──────────────

async function fetchWithJina(url: string): Promise<string | null> {
  try {
    const resp = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Accept: 'text/markdown' },
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    return text.length > 100 ? text.slice(0, 15000) : null;
  } catch {
    return null;
  }
}

// ── JSON schemas for structured output ─────────────────────────────────

const PROPERTY_SCHEMA = {
  name: 'property_data',
  strict: true,
  schema: {
    type: 'object',
    required: [
      'address', 'askingPrice', 'bedrooms', 'bathrooms', 'sqft',
      'yearBuilt', 'propertyType', 'condition', 'lotSize', 'daysOnMarket', 'notes',
    ],
    additionalProperties: false,
    properties: {
      address: { type: 'string' },
      askingPrice: { type: 'number' },
      bedrooms: { type: 'number' },
      bathrooms: { type: 'number' },
      sqft: { type: 'number' },
      yearBuilt: { type: 'number' },
      propertyType: { type: 'string', enum: ['single_family', 'multi_family', 'condo', 'townhouse', 'land'] },
      condition: { type: 'string', enum: ['excellent', 'good', 'fair', 'poor', 'unknown'] },
      lotSize: { type: 'string' },
      daysOnMarket: { type: ['number', 'null'] },
      notes: { type: 'string' },
    },
  },
};

const REPORT_SCHEMA = {
  name: 'negotiation_report',
  strict: true,
  schema: {
    type: 'object',
    required: [
      'recommendedOffer', 'discountPercent', 'leveragePoints', 'strategy',
      'contingencies', 'roiProjection', 'marketContext', 'riskFactors', 'summary',
    ],
    additionalProperties: false,
    properties: {
      recommendedOffer: { type: 'number' },
      discountPercent: { type: 'number' },
      leveragePoints: { type: 'array', items: { type: 'string' } },
      strategy: {
        type: 'object',
        required: ['initialOffer', 'counterStrategy', 'walkawayPoint', 'timeline'],
        additionalProperties: false,
        properties: {
          initialOffer: { type: 'string' },
          counterStrategy: { type: 'string' },
          walkawayPoint: { type: 'string' },
          timeline: { type: 'string' },
        },
      },
      contingencies: { type: 'array', items: { type: 'string' } },
      roiProjection: {
        type: 'object',
        required: ['purchasePrice', 'estimatedRehab', 'arv', 'potentialProfit', 'roiPercent', 'holdingCosts'],
        additionalProperties: false,
        properties: {
          purchasePrice: { type: 'number' },
          estimatedRehab: { type: 'number' },
          arv: { type: 'number' },
          potentialProfit: { type: 'number' },
          roiPercent: { type: 'number' },
          holdingCosts: { type: 'number' },
        },
      },
      marketContext: { type: 'string' },
      riskFactors: { type: 'array', items: { type: 'string' } },
      summary: { type: 'string' },
    },
  },
};

// ── Extraction paths ───────────────────────────────────────────────────

const EXTRACT_SYSTEM = `You extract property listing data from the content provided.
Return accurate data found in the content. For missing fields use reasonable defaults:
- yearBuilt: 2000
- propertyType: "single_family"
- condition: "unknown"
- lotSize: "" if unknown
- daysOnMarket: null if unknown
- notes: any additional relevant details about the property`;

export async function extractFromUrl(url: string): Promise<PropertyData> {
  const scraped = await fetchWithJina(url);
  if (!scraped) {
    throw new Error('SCRAPE_FAILED');
  }

  const result = await chatWithVision(
    [
      { role: 'system', content: EXTRACT_SYSTEM },
      { role: 'user', content: `Property listing URL: ${url}\n\nListing content:\n${scraped}` },
    ],
    { temperature: 0.1, jsonSchema: PROPERTY_SCHEMA },
  );

  const data = JSON.parse(result);
  return { ...data, listingSource: detectSource(url) };
}

export async function extractFromImage(base64DataUrl: string): Promise<PropertyData> {
  const result = await chatWithVision(
    [
      { role: 'system', content: EXTRACT_SYSTEM },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract all property listing data from this screenshot:' },
          { type: 'image_url', image_url: { url: base64DataUrl } },
        ],
      },
    ],
    { temperature: 0.1, jsonSchema: PROPERTY_SCHEMA },
  );

  const data = JSON.parse(result);
  return { ...data, listingSource: 'wholesaler' };
}

function detectSource(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('zillow')) return 'zillow';
  if (lower.includes('realtor.com')) return 'realtor.com';
  if (lower.includes('redfin')) return 'redfin';
  return 'other';
}

// ── Negotiation report generation ──────────────────────────────────────

export async function generateNegotiationReport(
  property: PropertyData,
  companyName?: string,
): Promise<NegotiationReport> {
  const company = companyName || '448 Developments';

  const systemPrompt = `You are an expert real estate investment analyst working for ${company}.
Your job is to analyze a property and produce a detailed negotiation playbook to help the buyer purchase below asking price.

Use the 70% Rule for investment properties: Maximum Offer = (ARV × 70%) − Rehab Costs.
For retail/move-in-ready properties, target 5-15% below asking depending on market conditions and leverage points.

Be specific with dollar amounts. Analyze the property's weaknesses as negotiation leverage.
Consider days on market, condition, property type, and local market dynamics.
Provide actionable, concrete strategies — not generic advice.

Important:
- recommendedOffer should be a specific dollar amount
- discountPercent is the % below asking price
- roiProjection.purchasePrice should equal recommendedOffer
- All dollar amounts should be whole numbers (no cents)
- roiPercent should be calculated as (potentialProfit / totalInvestment) × 100`;

  const userPrompt = `Analyze this property and generate a complete negotiation playbook:

Address: ${property.address}
Asking Price: $${property.askingPrice.toLocaleString()}
Bedrooms: ${property.bedrooms}
Bathrooms: ${property.bathrooms}
Square Feet: ${property.sqft.toLocaleString()}
Year Built: ${property.yearBuilt}
Property Type: ${property.propertyType.replace('_', ' ')}
Condition: ${property.condition}
Lot Size: ${property.lotSize || 'Unknown'}
Days on Market: ${property.daysOnMarket ?? 'Unknown'}
Listing Source: ${property.listingSource}
Notes: ${property.notes || 'None'}`;

  const result = await chatWithVision(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.4, jsonSchema: REPORT_SCHEMA },
  );

  return JSON.parse(result);
}
