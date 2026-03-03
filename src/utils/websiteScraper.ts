import type { Vertical } from '@/contexts/DemoContext';

export interface CompanyProfile {
  companyName: string;
  ownerName: string;
  tagline: string;
  location: string;
  phone: string;
  email: string;
  website: string;
  services: string[];
  avgJobValue: number;
  bookingUrl: string;
  primaryColor: string;
}

const VERTICAL_DEFAULTS: Record<Vertical, { services: string[]; tagline: string; avgJobValue: number; primaryColor: string }> = {
  construction: {
    services: ['Kitchen Remodeling', 'Bathroom Renovation', 'Home Additions', 'General Construction'],
    tagline: 'Quality Construction & Remodeling',
    avgJobValue: 35000,
    primaryColor: '#0ea5e9',
  },
  realestate: {
    services: ['Buyer Representation', 'Seller Representation', 'Property Management', 'Market Analysis'],
    tagline: 'Expert Real Estate Services',
    avgJobValue: 15000,
    primaryColor: '#f59e0b',
  },
  events: {
    services: ['DJ / Entertainment', 'Catering / Food Cart', 'Decoration / Florals', 'Photography / Video'],
    tagline: 'Unforgettable Event Experiences',
    avgJobValue: 5000,
    primaryColor: '#8b5cf6',
  },
};

function buildDefaults(domain: string, vertical: Vertical): CompanyProfile {
  const v = VERTICAL_DEFAULTS[vertical];
  return {
    companyName: domain.replace(/^www\./, '').split('.')[0],
    ownerName: 'the team',
    tagline: v.tagline,
    location: 'your area',
    phone: '(555) 000-0000',
    email: `info@${domain.replace(/^www\./, '')}`,
    website: domain,
    services: v.services,
    avgJobValue: v.avgJobValue,
    bookingUrl: '',
    primaryColor: v.primaryColor,
  };
}

const EXTRACTION_SCHEMA = {
  name: 'company_profile',
  strict: true,
  schema: {
    type: 'object',
    required: [
      'companyName',
      'ownerName',
      'tagline',
      'location',
      'phone',
      'email',
      'services',
      'avgJobValue',
      'bookingUrl',
      'primaryColor',
    ],
    additionalProperties: false,
    properties: {
      companyName: { type: 'string', description: 'The company name' },
      ownerName: {
        type: 'string',
        description: 'Owner/founder first name, or "the team" if unknown',
      },
      tagline: {
        type: 'string',
        description: 'Company tagline or short description',
      },
      location: {
        type: 'string',
        description: 'City, State (e.g. "Austin, TX") or "your area" if unknown',
      },
      phone: {
        type: 'string',
        description: 'Phone number or "(555) 000-0000" if not found',
      },
      email: {
        type: 'string',
        description: 'Contact email or "info@domain.com" as fallback',
      },
      services: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of services offered (e.g. "Kitchen Remodeling")',
      },
      avgJobValue: {
        type: 'number',
        description: 'Estimated average job value in USD, default 35000',
      },
      bookingUrl: {
        type: 'string',
        description: 'Calendly or booking URL if found, empty string if none',
      },
      primaryColor: {
        type: 'string',
        description: 'Brand primary color hex (e.g. "#0ea5e9"), extract from site or default',
      },
    },
  },
};

async function scrapeUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.content ? data.content.slice(0, 12000) : null;
  } catch {
    return null;
  }
}

const VERTICAL_EXTRACTION_PROMPTS: Record<Vertical, string> = {
  construction:
    'Extract construction/contractor company information from this website content. Return accurate data found on the site. For missing fields use sensible defaults: ownerName="the team", location="your area", phone="(555) 000-0000", email="info@domain.com", services=common construction services (e.g. Kitchen Remodeling, Bathroom Renovation), avgJobValue=35000, bookingUrl="", primaryColor="#0ea5e9".',
  realestate:
    'Extract real estate company/agent information from this website content. Return accurate data found on the site. For missing fields use sensible defaults: ownerName="the team", location="your area", phone="(555) 000-0000", email="info@domain.com", services=common real estate services (e.g. Buyer Representation, Seller Representation), avgJobValue=15000, bookingUrl="", primaryColor="#f59e0b".',
  events:
    'Extract event services company information from this website content. Return accurate data found on the site. For missing fields use sensible defaults: ownerName="the team", location="your area", phone="(555) 000-0000", email="info@domain.com", services=common event services (e.g. DJ / Entertainment, Catering, Decoration, Photography), avgJobValue=5000, bookingUrl="", primaryColor="#8b5cf6".',
};

const VERTICAL_LABELS: Record<Vertical, string> = {
  construction: 'a construction company',
  realestate: 'a real estate company',
  events: 'an event services company',
};

async function extractWithOpenAI(
  content: string,
  url: string,
  vertical: Vertical,
): Promise<Partial<CompanyProfile>> {
  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: VERTICAL_EXTRACTION_PROMPTS[vertical],
        },
        {
          role: 'user',
          content: `Website URL: ${url}\n\n${content}`,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: EXTRACTION_SCHEMA,
      },
      temperature: 0.1,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`OpenAI API error: ${resp.status} — ${err}`);
  }

  const data = await resp.json();
  return JSON.parse(data.choices[0].message.content);
}

export async function scrapeWebsite(input: string, vertical: Vertical = 'construction'): Promise<CompanyProfile> {
  // Normalize input into a URL
  const isUrl = input.includes('.') && !input.includes(' ');
  const url = isUrl
    ? input.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : input;
  const fullUrl = isUrl ? `https://${url}` : '';

  const domain = isUrl ? url.replace(/^www\./, '').split('/')[0] : '';
  const defaults = buildDefaults(domain || input, vertical);

  // Step 1: Scrape content with Jina
  let content: string;
  if (fullUrl) {
    const scraped = await scrapeUrl(fullUrl);
    content = scraped || `(Scraping failed — only the URL is available: ${fullUrl})`;
  } else {
    content = `(No URL provided — company name only: "${input}". Infer reasonable data for ${VERTICAL_LABELS[vertical]} with this name.)`;
  }

  // Step 2: Extract structured data with OpenAI
  const extracted = await extractWithOpenAI(content, fullUrl || input, vertical);

  // Merge with defaults
  return {
    ...defaults,
    ...extracted,
    website: fullUrl || input,
    services:
      extracted.services && extracted.services.length > 0
        ? extracted.services
        : defaults.services,
    avgJobValue: extracted.avgJobValue || defaults.avgJobValue,
    primaryColor: extracted.primaryColor || defaults.primaryColor,
  };
}
