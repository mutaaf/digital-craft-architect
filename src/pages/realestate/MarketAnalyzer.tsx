import { useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import DataDisclosureChip from '@/components/DataDisclosureChip';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  BarChart3,
  Sparkles,
  RotateCcw,
  Loader2,
  MapPin,
} from 'lucide-react';
import { streamChat } from '@/utils/openaiChat';
import type { ChatMessage } from '@/utils/openaiChat';

const PROPERTY_TYPES = [
  'Single Family Home',
  'Condo / Townhouse',
  'Multi-Family (2-4 units)',
  'Commercial',
  'Vacant Land',
];

function buildSystemPrompt(companyName: string): string {
  return `You are a real estate market analyst for ${companyName}.

Given a zip code and property type, generate a realistic market snapshot in HTML.

RULES:
- Output ONLY HTML content (no <html>, <head>, or <body> tags)
- Use inline styles for all formatting
- Structure the report with these sections:
  1. Market Overview (area name, state, population estimate)
  2. Pricing Trends (median list price, median sold price, price per sqft, YoY change)
  3. Market Activity (days on market, inventory level, months of supply, list-to-sale ratio)
  4. Rent Analysis (median rent, rent-to-price ratio, cap rate estimate)
  5. Market Temperature (buyer's market / balanced / seller's market with reasoning)
  6. Investment Outlook (1-2 paragraph summary with recommendations)
- Use a clean layout with card-style sections
- Include a mix of metrics displayed as large numbers with labels and trend arrows (▲ ▼)
- Use green for positive trends, red for negative, gray for neutral
- Format all currency with $ and commas
- Use realistic but clearly estimated data — include a disclaimer that values are AI-generated estimates
- Color scheme: professional with #0ea5e9 accent
- Do NOT include markdown — only valid HTML`;
}

const MarketAnalyzer = () => {
  const location = useLocation();
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';

  const [zipCode, setZipCode] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family Home');
  const [reportHtml, setReportHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const canGenerate = /^\d{5}$/.test(zipCode.trim());

  const generate = useCallback(async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setReportHtml('');

    const userMessage = `Generate a market analysis snapshot for:

Zip Code: ${zipCode}
Property Type: ${propertyType}
Brokerage: ${companyName}
Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Include realistic estimated data for median prices, days on market, inventory, rent-to-price ratios, and investment outlook for this area.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(companyName) },
      { role: 'user', content: userMessage },
    ];

    abortRef.current = new AbortController();

    try {
      let accumulated = '';
      await streamChat(
        messages,
        (chunk) => {
          accumulated += chunk;
          setReportHtml(accumulated);
        },
        abortRef.current.signal,
      );
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Market analysis error:', err);
        setReportHtml('<p style="color:red;text-align:center;">Failed to generate analysis. Please try again.</p>');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, zipCode, propertyType, companyName]);

  const reset = () => {
    abortRef.current?.abort();
    setZipCode('');
    setPropertyType('Single Family Home');
    setReportHtml('');
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Market Analyzer | {companyName} Demo | DigitalCraft AI</title>
        <meta name="description" content="Get an instant AI-powered real estate market snapshot for any zip code. See median prices, days on market, rent-to-own ratios, and investment outlook — generated in seconds by GPT-4o." />
      </Helmet>
      <DemoNavbar />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
        <div className="relative mb-8">
          <DataDisclosureChip demoPath={location.pathname} />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            AI Market Analyzer
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl">
            Enter a zip code and property type to get an AI-generated market snapshot with pricing
            trends, days on market, rent-to-price ratios, and investment outlook.
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Data is AI-estimated for demonstration purposes. Always verify with local MLS data and a licensed agent.
          </p>
        </div>

        {/* Input */}
        <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <MapPin size={14} className="inline mr-1" />
                Zip Code
              </label>
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="75201"
                maxLength={5}
                className="bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm h-10"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={generate} disabled={!canGenerate || isGenerating} className="gap-2 whitespace-nowrap">
                {isGenerating ? (
                  <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                ) : (
                  <><Sparkles size={18} /> Analyze Market</>
                )}
              </Button>
              <Button variant="outline" onClick={reset} size="icon">
                <RotateCcw size={16} />
              </Button>
            </div>
          </div>
        </Card>

        {/* Report */}
        {reportHtml ? (
          <Card className="p-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-primary" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market Report</h2>
            </div>
            <div
              className="market-report bg-white rounded-lg border border-gray-200 p-6 overflow-auto max-h-[70vh]"
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          </Card>
        ) : !isGenerating ? (
          <Card className="p-12 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
              <BarChart3 size={48} className="mb-3 opacity-50" />
              <p className="text-sm">Enter a zip code and click Analyze Market to get started</p>
            </div>
          </Card>
        ) : null}
      </main>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default MarketAnalyzer;
