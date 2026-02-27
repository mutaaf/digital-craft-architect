import { useState } from 'react';
import DemoNavbar from '@/components/construction/DemoNavbar';
import StepIndicator from '@/components/construction/estimate/StepIndicator';
import ProjectTypeSelector from '@/components/construction/estimate/ProjectTypeSelector';
import EstimateCard from '@/components/construction/estimate/EstimateCard';
import {
  PROJECT_TYPES,
  FINISH_LEVELS,
  EXTRAS,
  calculateEstimate,
} from '@/data/estimatePricing';
import type { ProjectType, FinishLevel, Extra } from '@/data/estimatePricing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';

const STEP_LABELS = ['Project', 'Size', 'Finish', 'Extras'];

const EstimateGenerator = () => {
  const [step, setStep] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [sqft, setSqft] = useState<number>(0);
  const [selectedFinishId, setSelectedFinishId] = useState<string>('mid_range');
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());

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
  const showEstimate = step === 5;

  const breakdown =
    showEstimate && projectType
      ? calculateEstimate(projectType, sqft, finish, selectedExtras)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Smart Estimate Generator</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Get a ballpark estimate in 60 seconds using 448's real pricing.
          </p>
        </div>

        {!showEstimate && (
          <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />
        )}

        {/* Step 1: Project Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-4 text-center">What type of project?</h2>
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
            <h2 className="text-xl font-semibold mb-6 text-center">
              How big is the {projectType.label.toLowerCase()} area?
            </h2>
            <Card className="p-8">
              <div className="flex items-center justify-center gap-4 mb-8">
                <Input
                  type="number"
                  value={sqft}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setSqft(Math.min(v, projectType.maxSqft));
                  }}
                  className="w-32 text-center text-2xl font-bold h-14"
                  min={projectType.minSqft}
                  max={projectType.maxSqft}
                />
                <span className="text-lg text-gray-500">sq ft</span>
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
            <h2 className="text-xl font-semibold mb-6 text-center">Select finish level</h2>
            <div className="grid gap-4">
              {FINISH_LEVELS.map((f) => (
                <Card
                  key={f.id}
                  onClick={() => setSelectedFinishId(f.id)}
                  className={`cursor-pointer p-5 flex items-center gap-4 transition-all ${
                    selectedFinishId === f.id
                      ? 'ring-2 ring-primary bg-primary/5 border-primary'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedFinishId === f.id ? 'border-primary' : 'border-gray-300'
                    }`}
                  >
                    {selectedFinishId === f.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
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
            <h2 className="text-xl font-semibold mb-2 text-center">Any add-ons?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">Optional — skip if none apply</p>
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
                    className={`cursor-pointer p-5 flex items-center gap-4 transition-all ${
                      checked
                        ? 'ring-2 ring-primary bg-primary/5 border-primary'
                        : 'hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleExtra(e.id)} />
                    <div className="flex-1">
                      <span className="font-semibold">{e.label}</span>
                      <p className="text-sm text-gray-500 mt-0.5">{e.description}</p>
                    </div>
                    <Badge variant="outline">{cost}</Badge>
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
          <div className="flex justify-between mt-10">
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
        )}
      </div>
    </div>
  );
};

export default EstimateGenerator;
