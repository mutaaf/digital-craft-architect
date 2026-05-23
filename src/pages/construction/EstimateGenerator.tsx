import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import StepIndicator from '@/components/construction/estimate/StepIndicator';
import ProjectTypeSelector from '@/components/construction/estimate/ProjectTypeSelector';
import EstimateCard from '@/components/construction/estimate/EstimateCard';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  PROJECT_TYPES,
  FINISH_LEVELS,
  EXTRAS,
  calculateEstimate,
} from '@/data/estimatePricing';
import {
  decodeEstimateParams,
  encodeEstimateParams,
} from './estimateShareParams';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

const STEP_LABELS = ['Project', 'Size', 'Finish', 'Extras'];

const RESULT_STEP = 5;

const EstimateGenerator = () => {
  const { company } = useDemoContext();
  const possessive = company?.companyName ? `${company.companyName}'s` : "DigitalCraft AI's";
  const [searchParams] = useSearchParams();

  // Parse-safe rehydration: a valid share link jumps straight to the result
  // view; anything malformed, absent, or out of range falls back to step 1.
  const shared = useMemo(
    () => decodeEstimateParams(searchParams),
    // Read once on mount; later state changes do not re-derive from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [step, setStep] = useState(shared ? RESULT_STEP : 1);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(
    shared?.selectedTypeId ?? null
  );
  const [sqft, setSqft] = useState<number>(shared?.sqft ?? 0);
  const [selectedFinishId, setSelectedFinishId] = useState<string>(
    shared?.selectedFinishId ?? 'mid_range'
  );
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(
    new Set(shared?.selectedExtraIds ?? [])
  );

  const projectType = PROJECT_TYPES.find((t) => t.id === selectedTypeId);
  const finish = FINISH_LEVELS.find((f) => f.id === selectedFinishId)!;

  const handleTypeSelect = (id: string) => {
    setSelectedTypeId(id);
    const pt = PROJECT_TYPES.find((t) => t.id === id)!;
    setSqft(pt.defaultSqft);
  };

  const toggleExtra = (id: string) => {
    setSelectedExtraIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const canNext = () => {
    if (step === 1) return !!selectedTypeId;
    if (step === 2) return sqft > 0;
    return true;
  };

  const reset = () => {
    setStep(1);
    setSelectedTypeId(null);
    setSqft(0);
    setSelectedFinishId('mid_range');
    setSelectedExtraIds(new Set());
  };

  const selectedExtras = EXTRAS.filter((e) => selectedExtraIds.has(e.id));
  const showEstimate = step === RESULT_STEP;

  // Build a same-origin, same-route share link from the current selection.
  const buildShareUrl = () => {
    if (!selectedTypeId) return window.location.href;
    const params = encodeEstimateParams({
      selectedTypeId,
      sqft,
      selectedFinishId,
      selectedExtraIds: [...selectedExtraIds],
    });
    const url = new URL(window.location.href);
    url.search = params.toString();
    return url.toString();
  };

  const extrasTotal = useMemo(
    () =>
      selectedExtras.reduce(
        (sum, e) => sum + (e.flatCost ?? e.perSqftCost! * sqft),
        0
      ),
    [selectedExtras, sqft]
  );

  const breakdown =
    showEstimate && projectType
      ? calculateEstimate(projectType, sqft, finish, selectedExtras)
      : null;

  const validationHint = () => {
    if (step === 1 && !selectedTypeId) return 'Select a project type to continue';
    if (step === 2 && sqft === 0) return 'Enter the square footage';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>Smart Estimate Generator Demo | DigitalCraft AI</title>
        <meta name="description" content="Generate branded construction estimates in under 60 seconds. Enter project type and square footage for an instant ballpark estimate." />
        <meta property="og:title" content="Smart Estimate Generator Demo | DigitalCraft AI" />
        <meta property="og:description" content="Generate branded construction estimates in under 60 seconds using AI-powered pricing." />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI Construction Estimate Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Get a ballpark estimate in 60 seconds using {possessive} real pricing.
          </p>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto text-center mb-6">
          This AI estimate generator demo shows how construction and remodeling companies can give prospects instant ballpark pricing. Select a project type — kitchen remodel, bathroom renovation, outdoor build, or full home renovation — enter the square footage, choose your finish level, and get a detailed cost breakdown in seconds. The estimate includes labor, materials, and optional add-ons like design consultations and permit assistance, all calculated from real contractor pricing. For construction business owners, this tool converts curious website visitors into qualified leads by giving them immediate value instead of a generic "request a quote" form. Try the AI construction cost calculator below and see how automated estimates help contractors close more jobs faster.
        </p>

        {!showEstimate && (
          <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />
        )}

        {/* Step 1: Project Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">What type of project?</h2>
            <ProjectTypeSelector
              types={PROJECT_TYPES}
              selected={selectedTypeId}
              onSelect={handleTypeSelect}
            />
          </div>
        )}

        {/* Step 2: Square Footage */}
        {step === 2 && projectType && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center">
              How big is the {projectType.label.toLowerCase()} area?
            </h2>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Input
                  type="number"
                  value={sqft}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setSqft(Math.min(v, projectType.maxSqft));
                  }}
                  className="w-24 sm:w-32 text-center text-xl sm:text-2xl font-bold h-12 sm:h-14"
                  min={projectType.minSqft}
                  max={projectType.maxSqft}
                />
                <span className="text-base sm:text-lg text-gray-500">sq ft</span>
              </div>
              <Slider
                value={[sqft]}
                onValueChange={([v]) => setSqft(v)}
                min={projectType.minSqft}
                max={projectType.maxSqft}
                step={10}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{projectType.minSqft} sqft</span>
                <span>{projectType.maxSqft} sqft</span>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Finish Level */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center">Select finish level</h2>
            <div className="grid gap-4">
              {FINISH_LEVELS.map((f) => (
                <Card
                  key={f.id}
                  onClick={() => setSelectedFinishId(f.id)}
                  className={`cursor-pointer p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-md ${
                    selectedFinishId === f.id
                      ? 'ring-2 ring-primary bg-primary/5 border-primary'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedFinishId === f.id ? 'border-primary' : 'border-gray-300'
                    }`}
                  >
                    {selectedFinishId === f.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{f.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {f.multiplier}x
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{f.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Extras */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">Any add-ons?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              {selectedExtraIds.size > 0
                ? `${selectedExtraIds.size} add-on${selectedExtraIds.size > 1 ? 's' : ''} selected — $${extrasTotal.toLocaleString()}`
                : 'Optional — skip if none apply'}
            </p>
            <div className="grid gap-4">
              {EXTRAS.map((e) => {
                const checked = selectedExtraIds.has(e.id);
                const cost = e.flatCost
                  ? `$${e.flatCost.toLocaleString()}`
                  : `$${e.perSqftCost}/sqft`;
                return (
                  <Card
                    key={e.id}
                    onClick={() => toggleExtra(e.id)}
                    className={`cursor-pointer p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all hover:shadow-md ${
                      checked
                        ? 'ring-2 ring-primary bg-primary/5 border-primary'
                        : 'hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleExtra(e.id)} />
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold">{e.label}</span>
                      <p className="text-sm text-gray-500 mt-0.5">{e.description}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{cost}</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Estimate Output */}
        {showEstimate && breakdown && projectType && (
          <div className="animate-fade-in">
            <EstimateCard
              breakdown={breakdown}
              projectType={projectType}
              finish={finish}
              sqft={sqft}
              buildShareUrl={buildShareUrl}
            />
            <div className="text-center mt-8 print:hidden">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw size={16} /> Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!showEstimate && (
          <div className="mt-10">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 1}
                className="gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="gap-2"
              >
                {step === 4 ? 'Generate Estimate' : 'Next'} <ArrowRight size={16} />
              </Button>
            </div>
            {!canNext() && validationHint() && (
              <p className="text-center text-sm text-gray-400 mt-3">{validationHint()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EstimateGenerator;
