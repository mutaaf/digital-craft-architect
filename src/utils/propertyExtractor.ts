import { cachedVision } from './aiCache';
import type {
  PropertyData,
  NegotiationReport,
  ComparableProperty,
  SellerMessage,
} from '@/data/propertyNegotiation';

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

const NULLABLE_NUMBER = { type: ['number', 'null'] as const };
const NULLABLE_STRING = { type: ['string', 'null'] as const };

const PROPERTY_SCHEMA = {
  name: 'property_data',
  strict: true,
  schema: {
    type: 'object',
    required: [
      'address', 'askingPrice', 'bedrooms', 'bathrooms', 'sqft',
      'yearBuilt', 'propertyType', 'condition', 'lotSize', 'daysOnMarket',
      'notes', 'acreage', 'zoning', 'utilities', 'sellerMotivation',
    ],
    additionalProperties: false,
    properties: {
      address: { type: 'string' },
      askingPrice: { type: 'number' },
      bedrooms: NULLABLE_NUMBER,
      bathrooms: NULLABLE_NUMBER,
      sqft: NULLABLE_NUMBER,
      yearBuilt: NULLABLE_NUMBER,
      propertyType: {
        type: 'string',
        enum: ['single_family', 'multi_family', 'condo', 'townhouse', 'land', 'commercial', 'industrial', 'mixed_use'],
      },
      condition: {
        type: 'string',
        enum: ['excellent', 'good', 'fair', 'poor', 'unknown'],
      },
      lotSize: { type: 'string' },
      daysOnMarket: NULLABLE_NUMBER,
      notes: { type: 'string' },
      acreage: NULLABLE_NUMBER,
      zoning: NULLABLE_STRING,
      utilities: NULLABLE_STRING,
      sellerMotivation: NULLABLE_STRING,
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
      'dealType', 'confidenceScore',
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
      dealType: { type: 'string' },
      confidenceScore: { type: 'number' },
    },
  },
};

const COMPS_SCHEMA = {
  name: 'comparable_properties',
  strict: true,
  schema: {
    type: 'object',
    required: ['comps'],
    additionalProperties: false,
    properties: {
      comps: {
        type: 'array',
        items: {
          type: 'object',
          required: [
            'address', 'salePrice', 'sqft', 'acreage', 'bedrooms', 'bathrooms',
            'saleDate', 'distanceMiles', 'daysOnMarket', 'pricePerSqft', 'pricePerAcre', 'notes',
          ],
          additionalProperties: false,
          properties: {
            address: { type: 'string' },
            salePrice: { type: 'number' },
            sqft: NULLABLE_NUMBER,
            acreage: NULLABLE_NUMBER,
            bedrooms: NULLABLE_NUMBER,
            bathrooms: NULLABLE_NUMBER,
            saleDate: { type: 'string' },
            distanceMiles: { type: 'number' },
            daysOnMarket: NULLABLE_NUMBER,
            pricePerSqft: NULLABLE_NUMBER,
            pricePerAcre: NULLABLE_NUMBER,
            notes: { type: 'string' },
          },
        },
      },
    },
  },
};

const MESSAGES_SCHEMA = {
  name: 'seller_messages',
  strict: true,
  schema: {
    type: 'object',
    required: ['messages'],
    additionalProperties: false,
    properties: {
      messages: {
        type: 'array',
        items: {
          type: 'object',
          required: ['type', 'label', 'subject', 'body', 'tone', 'format'],
          additionalProperties: false,
          properties: {
            type: { type: 'string', enum: ['initial', 'follow_up', 'counter_offer'] },
            label: { type: 'string' },
            subject: { type: 'string' },
            body: { type: 'string' },
            tone: { type: 'string' },
            format: { type: 'string', enum: ['sms', 'email'] },
          },
        },
      },
    },
  },
};

// ── Extraction paths ───────────────────────────────────────────────────

const EXTRACT_SYSTEM = `You extract property listing data from the content provided.
Return accurate data found in the content. For missing fields use reasonable defaults:
- yearBuilt: 2000 (null for land)
- propertyType: "single_family"
- condition: "unknown"
- lotSize: "" if unknown
- daysOnMarket: null if unknown
- notes: any additional relevant details about the property
- bedrooms/bathrooms/sqft: null if this is land or the data isn't available
- acreage: extract if available, null otherwise
- zoning: extract if available (residential, commercial, agricultural, mixed), null otherwise
- utilities: extract if available (e.g. "water, sewer, electric"), null otherwise
- sellerMotivation: detect from listing language (e.g. "motivated seller", "price reduced", "must sell"), null if none detected`;

export async function extractFromUrl(url: string): Promise<PropertyData> {
  const scraped = await fetchWithJina(url);
  if (!scraped) {
    throw new Error('SCRAPE_FAILED');
  }

  const result = await cachedVision(
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
  const result = await cachedVision(
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

// ── Comparable properties generation ────────────────────────────────────

function formatPropertySummary(p: PropertyData): string {
  const isLand = p.propertyType === 'land';
  const lines = [
    `Address: ${p.address}`,
    `Asking Price: $${p.askingPrice.toLocaleString()}`,
    `Property Type: ${p.propertyType.replace(/_/g, ' ')}`,
  ];
  if (!isLand) {
    if (p.bedrooms != null) lines.push(`Bedrooms: ${p.bedrooms}`);
    if (p.bathrooms != null) lines.push(`Bathrooms: ${p.bathrooms}`);
    if (p.sqft != null) lines.push(`Square Feet: ${p.sqft.toLocaleString()}`);
    if (p.yearBuilt != null) lines.push(`Year Built: ${p.yearBuilt}`);
  }
  if (p.acreage != null) lines.push(`Acreage: ${p.acreage}`);
  if (p.lotSize) lines.push(`Lot Size: ${p.lotSize}`);
  if (p.zoning) lines.push(`Zoning: ${p.zoning}`);
  lines.push(`Condition: ${p.condition}`);
  if (p.daysOnMarket != null) lines.push(`Days on Market: ${p.daysOnMarket}`);
  if (p.notes) lines.push(`Notes: ${p.notes}`);
  return lines.join('\n');
}

export async function generateComps(property: PropertyData): Promise<ComparableProperty[]> {
  const isLand = property.propertyType === 'land';

  const systemPrompt = `You are a real estate comparable sales analyst. Generate 4-6 realistic comparable property sales for the subject property below.

${isLand ? `This is a LAND deal. Focus comps on:
- Similar acreage within 2 miles
- Use pricePerAcre (not pricePerSqft)
- Set sqft, bedrooms, bathrooms to null
- Include zoning and utility notes` : `This is a ${property.propertyType.replace(/_/g, ' ')} deal. Focus comps on:
- Similar beds/baths/sqft within 2 miles
- Use pricePerSqft (not pricePerAcre unless property has notable acreage)
- Include condition and feature notes`}

Requirements:
- Sale dates within last 6 months
- Distances between 0.2 and 2.0 miles
- Realistic price variation (within 20% of subject)
- Each comp should have a brief note explaining similarity/difference
- pricePerSqft = salePrice / sqft (null if sqft is null)
- pricePerAcre = salePrice / acreage (null if acreage is null)`;

  const result = await cachedVision(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Generate comparable sales for this property:\n\n${formatPropertySummary(property)}` },
    ],
    { temperature: 0.5, jsonSchema: COMPS_SCHEMA },
  );

  const parsed = JSON.parse(result);
  return parsed.comps;
}

// ── Negotiation report generation ──────────────────────────────────────

export async function generateNegotiationReport(
  property: PropertyData,
  companyName?: string,
  comps?: ComparableProperty[],
): Promise<NegotiationReport> {
  const company = companyName || '448 Developments';

  const compsContext = comps && comps.length > 0
    ? `\n\nCOMPARABLE SALES DATA:\n${comps.map((c, i) =>
        `${i + 1}. ${c.address} — $${c.salePrice.toLocaleString()}${c.pricePerSqft ? ` ($${c.pricePerSqft}/sqft)` : ''}${c.pricePerAcre ? ` ($${c.pricePerAcre.toLocaleString()}/acre)` : ''} — ${c.distanceMiles}mi away — ${c.notes}`
      ).join('\n')}`
    : '';

  const systemPrompt = `You are an expert real estate investment analyst working for ${company}.
Your job is to analyze a property and produce a detailed negotiation playbook to help the buyer purchase below asking price.

Use the 70% Rule for investment properties: Maximum Offer = (ARV x 70%) - Rehab Costs.
For retail/move-in-ready properties, target 5-15% below asking depending on market conditions and leverage points.
For land deals, focus on price per acre comparisons and development potential.

Be specific with dollar amounts. Analyze the property's weaknesses as negotiation leverage.
Consider days on market, condition, property type, and local market dynamics.
${comps && comps.length > 0 ? 'Use the comparable sales data provided to justify your pricing analysis.' : ''}
Provide actionable, concrete strategies — not generic advice.

Important:
- recommendedOffer should be a specific dollar amount
- discountPercent is the % below asking price
- roiProjection.purchasePrice should equal recommendedOffer
- All dollar amounts should be whole numbers (no cents)
- roiPercent should be calculated as (potentialProfit / totalInvestment) x 100
- dealType should be one of: "Flip", "Buy & Hold", "Wholesale", "Development", "Land Bank", "Value-Add"
- confidenceScore should be 1-10 based on data quality and market certainty`;

  const userPrompt = `Analyze this property and generate a complete negotiation playbook:

${formatPropertySummary(property)}${compsContext}`;

  const result = await cachedVision(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.4, jsonSchema: REPORT_SCHEMA },
  );

  return JSON.parse(result);
}

// ── Seller message generation ───────────────────────────────────────────

export async function generateSellerMessages(
  property: PropertyData,
  report: NegotiationReport,
  comps: ComparableProperty[],
): Promise<SellerMessage[]> {
  const avgCompPrice = comps.length > 0
    ? Math.round(comps.reduce((s, c) => s + c.salePrice, 0) / comps.length)
    : null;

  const systemPrompt = `You are a real estate investor writing messages to a property seller/listing agent.
Generate exactly 6 messages: 3 types (initial, follow_up, counter_offer) x 2 formats (sms, email).

CRITICAL STYLE RULES:
- Sound like a real human, warm and genuine — NOT a template or sales pitch
- Reference SPECIFIC details about this property (address, features, neighborhood)
- No buzzwords like "win-win", "synergy", "opportunity of a lifetime"
- No excessive exclamation marks
- SMS: 3-5 sentences max, casual and direct
- Email: 5-8 sentences with a proper subject line, professional but personable
- Each message should feel like it could be from a real person who actually looked at the property

DEAL CONTEXT:
- Property: ${property.address}
- Asking: $${property.askingPrice.toLocaleString()}
- Our offer: $${report.recommendedOffer.toLocaleString()} (${report.discountPercent}% below asking)
${avgCompPrice ? `- Comparable avg: $${avgCompPrice.toLocaleString()}` : ''}
${property.daysOnMarket ? `- Days on market: ${property.daysOnMarket}` : ''}
${property.sellerMotivation ? `- Seller motivation: ${property.sellerMotivation}` : ''}
${property.condition !== 'unknown' ? `- Condition: ${property.condition}` : ''}

MESSAGE TYPES:
- initial: First contact, express genuine interest, soft mention of our price range
- follow_up: Check back in after no response, add urgency without being pushy
- counter_offer: Respond to their counter, justify our number with comps/condition data

TONE for each:
- initial: friendly, curious
- follow_up: persistent but respectful
- counter_offer: firm but fair`;

  const result = await cachedVision(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the 6 seller messages.' },
    ],
    { temperature: 0.7, jsonSchema: MESSAGES_SCHEMA },
  );

  const parsed = JSON.parse(result);
  return parsed.messages;
}
