import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Phone, Mic, Info, FileText, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { PropertyData, NegotiationReport, ComparableProperty } from '@/data/propertyNegotiation';
import type { BidRange, VoiceCallConfig } from '@/data/voiceNegotiation';
import { generateVoiceSystemPrompt } from '@/utils/voicePromptGenerator';

interface VoiceCallSetupProps {
  property: PropertyData;
  report: NegotiationReport;
  comps: ComparableProperty[];
  companyName: string;
  onStartCall: (config: VoiceCallConfig) => void;
  isVapiAvailable: boolean;
}

const VoiceCallSetup = ({
  property,
  report,
  comps,
  companyName,
  onStartCall,
  isVapiAvailable,
}: VoiceCallSetupProps) => {
  const defaultMin = Math.round(report.recommendedOffer * 0.9);
  const defaultTarget = report.recommendedOffer;
  const defaultMax = Math.round(report.recommendedOffer * 1.15);

  const [bidRange, setBidRange] = useState<BidRange>({
    minOffer: defaultMin,
    targetOffer: defaultTarget,
    maxOffer: defaultMax,
  });
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [hasEditedPrompt, setHasEditedPrompt] = useState(false);

  // Generate the default prompt based on current config
  const defaultPrompt = useMemo(() => {
    return generateVoiceSystemPrompt({
      property,
      report,
      comps,
      bidRange,
      sellerName: sellerName || undefined,
      companyName,
    });
  }, [property, report, comps, bidRange, sellerName, companyName]);

  // When prompt panel opens for the first time, populate with default
  const handleTogglePrompt = () => {
    if (!showPrompt && !hasEditedPrompt) {
      setPromptText(defaultPrompt);
    }
    setShowPrompt(!showPrompt);
  };

  const handleResetPrompt = () => {
    setPromptText(defaultPrompt);
    setHasEditedPrompt(false);
  };

  const handlePromptChange = (value: string) => {
    setPromptText(value);
    setHasEditedPrompt(true);
  };

  const handleSliderChange = (values: number[]) => {
    setBidRange({
      minOffer: values[0],
      targetOffer: values[1],
      maxOffer: values[2],
    });
  };

  const handleStart = () => {
    onStartCall({
      property,
      report,
      comps,
      bidRange,
      sellerPhone: sellerPhone || undefined,
      sellerName: sellerName || undefined,
      companyName,
      promptOverride: hasEditedPrompt ? promptText : undefined,
    });
  };

  // Use askingPrice if available, otherwise fall back to recommendedOffer or max bid
  const basePrice = property.askingPrice || report.recommendedOffer || bidRange.maxOffer;
  const sliderMin = Math.round(basePrice * 0.5);
  const sliderMax = Math.round(basePrice * 1.3);

  return (
    <div className="space-y-5 animate-fade-in">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <Phone size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-base">AI Voice Negotiator</h3>
            <p className="text-xs text-gray-500">Configure your bid range and start the call</p>
          </div>
          {!isVapiAvailable && (
            <Badge variant="secondary" className="ml-auto text-xs">
              <Mic size={10} className="mr-1" /> Demo Mode
            </Badge>
          )}
        </div>

        {/* Bid Range Inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
              Bid Range
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Min Offer</label>
                <Input
                  type="number"
                  value={bidRange.minOffer}
                  onChange={(e) =>
                    setBidRange((prev) => ({ ...prev, minOffer: Number(e.target.value) }))
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Target Offer</label>
                <Input
                  type="number"
                  value={bidRange.targetOffer}
                  onChange={(e) =>
                    setBidRange((prev) => ({ ...prev, targetOffer: Number(e.target.value) }))
                  }
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Max Offer</label>
                <Input
                  type="number"
                  value={bidRange.maxOffer}
                  onChange={(e) =>
                    setBidRange((prev) => ({ ...prev, maxOffer: Number(e.target.value) }))
                  }
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Visual Slider */}
          <div className="px-1">
            <Slider
              min={sliderMin}
              max={sliderMax}
              step={1000}
              value={[bidRange.minOffer, bidRange.targetOffer, bidRange.maxOffer]}
              onValueChange={handleSliderChange}
              className="mt-2"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>${sliderMin.toLocaleString()}</span>
              <span>
                {property.askingPrice
                  ? `Asking: $${property.askingPrice.toLocaleString()}`
                  : `Est. Value: $${basePrice.toLocaleString()}`}
              </span>
              <span>${sliderMax.toLocaleString()}</span>
            </div>
          </div>

          {/* Seller Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-gray-400 block mb-1">Seller Name (optional)</label>
              <Input
                placeholder="e.g., John Smith"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="text-sm"
              />
            </div>
            {isVapiAvailable && (
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">Seller Phone</label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="text-sm"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Enter a number to call the seller directly, or leave blank for browser demo
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Strategy Preview */}
      <Card className="p-4 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-2 mb-2">
          <Info size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500">Strategy Preview</span>
        </div>
        <ul className="space-y-1.5">
          {report.leveragePoints.slice(0, 3).map((point, i) => (
            <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
              <span className="text-primary mt-0.5">&#8226;</span>
              {point}
            </li>
          ))}
          <li className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
            <span className="text-primary mt-0.5">&#8226;</span>
            Opening at ${bidRange.minOffer.toLocaleString()}, targeting ${bidRange.targetOffer.toLocaleString()}
          </li>
        </ul>
      </Card>

      {/* Prompt Editor */}
      <Card className="overflow-hidden">
        <button
          onClick={handleTogglePrompt}
          className="w-full p-4 flex items-center gap-2 text-left hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
        >
          <FileText size={14} className="text-gray-400" />
          <span className="text-xs font-medium text-gray-500 flex-1">
            Agent Instructions
            {hasEditedPrompt && (
              <Badge variant="secondary" className="ml-2 text-[10px]">edited</Badge>
            )}
          </span>
          {showPrompt ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </button>

        {showPrompt && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-[11px] text-gray-400">
              This is what the AI agent will follow during the call. Edit it to change the agent's behavior, tone, or strategy.
            </p>
            <textarea
              value={promptText}
              onChange={(e) => handlePromptChange(e.target.value)}
              className="w-full h-80 text-xs font-mono bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
              spellCheck={false}
            />
            {hasEditedPrompt && (
              <Button variant="ghost" size="sm" onClick={handleResetPrompt} className="text-xs gap-1.5">
                <RotateCcw size={12} /> Reset to Default
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Start Button */}
      <Button onClick={handleStart} size="lg" className="w-full gap-2">
        <Phone size={18} />
        {isVapiAvailable ? 'Start Call' : 'Start Demo Call'}
      </Button>
    </div>
  );
};

export default VoiceCallSetup;
