import { useState, useMemo } from 'react';
import DemoNavbar from '@/components/construction/DemoNavbar';
import StepIndicator from '@/components/construction/estimate/StepIndicator';
import ProposalCard from '@/components/events/proposal/ProposalCard';
import { useDemoContext } from '@/contexts/DemoContext';
import {
  SERVICE_TYPES,
  PROPOSAL_TIERS,
  PROPOSAL_EXTRAS,
  calculateProposal,
} from '@/data/proposalPricing';
import type { ProposalServiceType } from '@/data/proposalPricing';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Music,
  UtensilsCrossed,
  Flower2,
  Camera,
  ClipboardList,
  Landmark,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Music: <Music size={24} />,
  UtensilsCrossed: <UtensilsCrossed size={24} />,
  Flower2: <Flower2 size={24} />,
  Camera: <Camera size={24} />,
  ClipboardList: <ClipboardList size={24} />,
  Landmark: <Landmark size={24} />,
};

const STEP_LABELS = ['Service', 'Guests', 'Package', 'Add-ons'];

const ServiceTypeSelector = ({
  types,
  selected,
  onSelect,
}: {
  types: ProposalServiceType[];
  selected: string | null;
  onSelect: (id: string) => void;
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
    {types.map((t, i) => (
      <Card
        key={t.id}
        onClick={() => onSelect(t.id)}
        className={`cursor-pointer p-4 sm:p-5 flex flex-col items-center gap-2.5 sm:gap-3 text-center transition-all hover:shadow-md animate-fade-in ${
          selected === t.id
            ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-md'
            : 'hover:border-gray-300 dark:hover:border-gray-600'
        }`}
        style={{ animationDelay: `${i * 75}ms`, animationFillMode: 'both' }}
      >
        <div
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors ${
            selected === t.id
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-primary/50'
          }`}
        >
          {iconMap[t.icon]}
        </div>
        <span className="text-xs sm:text-sm font-medium leading-tight">{t.label}</span>
        <span className="text-[10px] sm:text-xs text-gray-400">
          ${t.lowPerGuest}–${t.highPerGuest}/guest
        </span>
      </Card>
    ))}
  </div>
);

const ProposalGenerator = () => {
  const { company } = useDemoContext();
  const possessive = company?.companyName ? `${company.companyName}'s` : "DigitalCraft AI's";
  const [step, setStep] = useState(1);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [guests, setGuests] = useState<number>(0);
  const [selectedTierId, setSelectedTierId] = useState<string>('premium');
  const [selectedExtraIds, setSelectedExtraIds] = useState<Set<string>>(new Set());

  const serviceType = SERVICE_TYPES.find((t) => t.id === selectedTypeId);
  const tier = PROPOSAL_TIERS.find((t) => t.id === selectedTierId)!;

  const handleTypeSelect = (id: string) => {
    setSelectedTypeId(id);
    const st = SERVICE_TYPES.find((t) => t.id === id)!;
    setGuests(st.defaultGuests);
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
    if (step === 2) return guests > 0;
    return true;
  };

  const reset = () => {
    setStep(1);
    setSelectedTypeId(null);
    setGuests(0);
    setSelectedTierId('premium');
    setSelectedExtraIds(new Set());
  };

  const selectedExtras = PROPOSAL_EXTRAS.filter((e) => selectedExtraIds.has(e.id));
  const showProposal = step === 5;

  const extrasTotal = useMemo(
    () => selectedExtras.reduce((sum, e) => sum + e.flatCost, 0),
    [selectedExtras]
  );

  const breakdown =
    showProposal && serviceType
      ? calculateProposal(serviceType, guests, tier, selectedExtras)
      : null;

  const validationHint = () => {
    if (step === 1 && !selectedTypeId) return 'Select a service type to continue';
    if (step === 2 && guests === 0) return 'Enter the number of guests';
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> POC Demo
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Smart Proposal Generator</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Get a branded event proposal in 60 seconds using {possessive} real pricing.
          </p>
        </div>

        {!showProposal && (
          <StepIndicator currentStep={step} totalSteps={4} labels={STEP_LABELS} />
        )}

        {/* Step 1: Service Type */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">What service do you need?</h2>
            <ServiceTypeSelector
              types={SERVICE_TYPES}
              selected={selectedTypeId}
              onSelect={handleTypeSelect}
            />
          </div>
        )}

        {/* Step 2: Guest Count */}
        {step === 2 && serviceType && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center">
              How many guests are expected?
            </h2>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-center gap-3 mb-8">
                <Input
                  type="number"
                  value={guests}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setGuests(Math.min(v, serviceType.maxGuests));
                  }}
                  className="w-24 sm:w-32 text-center text-xl sm:text-2xl font-bold h-12 sm:h-14"
                  min={serviceType.minGuests}
                  max={serviceType.maxGuests}
                />
                <span className="text-base sm:text-lg text-gray-500">guests</span>
              </div>
              <Slider
                value={[guests]}
                onValueChange={([v]) => setGuests(v)}
                min={serviceType.minGuests}
                max={serviceType.maxGuests}
                step={5}
                className="mb-4"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>{serviceType.minGuests} guests</span>
                <span>{serviceType.maxGuests} guests</span>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Package Tier */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-6 text-center">Select package tier</h2>
            <div className="grid gap-4">
              {PROPOSAL_TIERS.map((t) => (
                <Card
                  key={t.id}
                  onClick={() => setSelectedTierId(t.id)}
                  className={`cursor-pointer p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-md ${
                    selectedTierId === t.id
                      ? 'ring-2 ring-primary bg-primary/5 border-primary'
                      : 'hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedTierId === t.id ? 'border-primary' : 'border-gray-300'
                    }`}
                  >
                    {selectedTierId === t.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{t.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {t.multiplier}x
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{t.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Add-ons */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-center">Any add-ons?</h2>
            <p className="text-gray-400 text-center text-sm mb-6">
              {selectedExtraIds.size > 0
                ? `${selectedExtraIds.size} add-on${selectedExtraIds.size > 1 ? 's' : ''} selected — $${extrasTotal.toLocaleString()}`
                : 'Optional — skip if none apply'}
            </p>
            <div className="grid gap-4">
              {PROPOSAL_EXTRAS.map((e) => {
                const checked = selectedExtraIds.has(e.id);
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
                    <Badge variant="outline" className="shrink-0">${e.flatCost.toLocaleString()}</Badge>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Proposal Output */}
        {showProposal && breakdown && serviceType && (
          <div className="animate-fade-in">
            <ProposalCard
              breakdown={breakdown}
              serviceType={serviceType}
              tier={tier}
              guests={guests}
            />
            <div className="text-center mt-8 print:hidden">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RotateCcw size={16} /> Start Over
              </Button>
            </div>
          </div>
        )}

        {/* Navigation */}
        {!showProposal && (
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
                {step === 4 ? 'Generate Proposal' : 'Next'} <ArrowRight size={16} />
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

export default ProposalGenerator;
