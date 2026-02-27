import type {
  PropertyData,
  AgentStep,
  AgentResult,
  ComparableProperty,
  NegotiationReport,
  SellerMessage,
} from '@/data/propertyNegotiation';
import {
  extractFromUrl,
  extractFromImage,
  generateComps,
  generateNegotiationReport,
  generateSellerMessages,
} from './propertyExtractor';

interface PipelineInput {
  mode: 'url' | 'image' | 'manual';
  url?: string;
  imageBase64?: string;
  manualData?: PropertyData;
  companyName?: string;
}

function initialSteps(): AgentStep[] {
  return [
    { id: 'extract', label: 'Extracting Property Data', status: 'pending', summary: '', durationMs: null },
    { id: 'comps', label: 'Finding Comparables', status: 'pending', summary: '', durationMs: null },
    { id: 'analysis', label: 'Analyzing Deal', status: 'pending', summary: '', durationMs: null },
    { id: 'messages', label: 'Drafting Seller Messages', status: 'pending', summary: '', durationMs: null },
  ];
}

function formatPrice(n: number): string {
  return '$' + n.toLocaleString();
}

function buildExtractSummary(p: PropertyData): string {
  const isLand = p.propertyType === 'land';
  if (isLand) {
    const parts = [];
    if (p.acreage) parts.push(`${p.acreage} acre`);
    parts.push('vacant land');
    parts.push(`at ${p.address}`);
    parts.push(`asking ${formatPrice(p.askingPrice)}`);
    return `Found ${parts.join(' ')}`;
  }
  const parts = [];
  if (p.bedrooms != null) parts.push(`${p.bedrooms}bd`);
  if (p.bathrooms != null) parts.push(`${p.bathrooms}ba`);
  parts.push(p.propertyType.replace(/_/g, ' '));
  parts.push(`at ${p.address}`);
  parts.push(`asking ${formatPrice(p.askingPrice)}`);
  return `Found ${parts.join(' ')}`;
}

export async function runAgentPipeline(
  input: PipelineInput,
  onStepUpdate: (steps: AgentStep[]) => void,
  signal?: AbortSignal,
): Promise<AgentResult> {
  const pipelineStart = Date.now();
  const steps = initialSteps();

  const update = (id: AgentStep['id'], patch: Partial<AgentStep>) => {
    const idx = steps.findIndex((s) => s.id === id);
    if (idx >= 0) steps[idx] = { ...steps[idx], ...patch };
    onStepUpdate([...steps]);
  };

  const checkAbort = () => {
    if (signal?.aborted) throw new DOMException('Pipeline aborted', 'AbortError');
  };

  // ── Step 1: Extract ──────────────────────────────────────────────────
  let property: PropertyData;
  const t1 = Date.now();
  update('extract', { status: 'running' });

  try {
    if (input.mode === 'url' && input.url) {
      property = await extractFromUrl(input.url);
    } else if (input.mode === 'image' && input.imageBase64) {
      property = await extractFromImage(input.imageBase64);
    } else if (input.mode === 'manual' && input.manualData) {
      property = input.manualData;
    } else {
      throw new Error('Invalid pipeline input');
    }
    update('extract', {
      status: 'complete',
      summary: buildExtractSummary(property),
      durationMs: Date.now() - t1,
    });
  } catch (err) {
    update('extract', { status: 'error', summary: err instanceof Error ? err.message : 'Extraction failed', durationMs: Date.now() - t1 });
    throw err;
  }

  checkAbort();

  // ── Step 2: Comps ────────────────────────────────────────────────────
  let comps: ComparableProperty[];
  const t2 = Date.now();
  update('comps', { status: 'running' });

  try {
    comps = await generateComps(property);
    const isLand = property.propertyType === 'land';
    const avgMetric = isLand
      ? comps.filter((c) => c.pricePerAcre).length > 0
        ? `avg $${Math.round(comps.reduce((s, c) => s + (c.pricePerAcre || 0), 0) / comps.filter((c) => c.pricePerAcre).length).toLocaleString()}/acre`
        : ''
      : comps.filter((c) => c.pricePerSqft).length > 0
        ? `avg $${Math.round(comps.reduce((s, c) => s + (c.pricePerSqft || 0), 0) / comps.filter((c) => c.pricePerSqft).length)}/sqft`
        : '';
    const maxDist = Math.max(...comps.map((c) => c.distanceMiles));
    update('comps', {
      status: 'complete',
      summary: `Found ${comps.length} comparable sales within ${maxDist}mi${avgMetric ? ', ' + avgMetric : ''}`,
      durationMs: Date.now() - t2,
    });
  } catch (err) {
    update('comps', { status: 'error', summary: 'Failed to generate comps', durationMs: Date.now() - t2 });
    throw err;
  }

  checkAbort();

  // ── Step 3: Analysis ─────────────────────────────────────────────────
  let report: NegotiationReport;
  const t3 = Date.now();
  update('analysis', { status: 'running' });

  try {
    report = await generateNegotiationReport(property, input.companyName, comps);
    update('analysis', {
      status: 'complete',
      summary: `Recommend offering ${formatPrice(report.recommendedOffer)} (${report.discountPercent}% below). ROI: ${report.roiProjection.roiPercent.toFixed(0)}%. Confidence: ${report.confidenceScore}/10`,
      durationMs: Date.now() - t3,
    });
  } catch (err) {
    update('analysis', { status: 'error', summary: 'Analysis failed', durationMs: Date.now() - t3 });
    throw err;
  }

  checkAbort();

  // ── Step 4: Messages ─────────────────────────────────────────────────
  let sellerMessages: SellerMessage[];
  const t4 = Date.now();
  update('messages', { status: 'running' });

  try {
    sellerMessages = await generateSellerMessages(property, report, comps);
    const smsCount = sellerMessages.filter((m) => m.format === 'sms').length;
    const emailCount = sellerMessages.filter((m) => m.format === 'email').length;
    update('messages', {
      status: 'complete',
      summary: `Drafted ${sellerMessages.length} seller messages (${smsCount} SMS + ${emailCount} email)`,
      durationMs: Date.now() - t4,
    });
  } catch (err) {
    update('messages', { status: 'error', summary: 'Message generation failed', durationMs: Date.now() - t4 });
    throw err;
  }

  return {
    property,
    comps,
    report,
    sellerMessages,
    elapsedMs: Date.now() - pipelineStart,
  };
}
