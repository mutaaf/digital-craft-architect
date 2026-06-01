import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import DemoNavbar from '@/components/construction/DemoNavbar';
import RelatedDemos from '@/components/RelatedDemos';
import { useDemoContext } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { streamChat } from '@/utils/openaiChat';
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Loader2,
  AlertTriangle,
  Printer,
} from 'lucide-react';

const ContractDrafter = () => {
  const location = useLocation();
  const { company } = useDemoContext();
  const companyName = company?.companyName || 'DigitalCraft AI';

  const [step, setStep] = useState(1);
  const [buyerName, setBuyerName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [earnestMoney, setEarnestMoney] = useState('');
  const [contingencies, setContingencies] = useState('Financing, inspection, appraisal');
  const [additionalTerms, setAdditionalTerms] = useState('');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const canAdvance = () => {
    if (step === 1) return buyerName.length >= 2 && sellerName.length >= 2 && propertyAddress.length >= 5;
    if (step === 2) return purchasePrice.length >= 1 && closingDate.length >= 1;
    return true;
  };

  const generateContract = async () => {
    setIsGenerating(true);
    setDraft('');
    setStep(3);

    const prompt = `Draft a professional residential real estate purchase agreement with the following terms:

- Buyer: ${buyerName}
- Seller: ${sellerName}
- Property Address: ${propertyAddress}
- Purchase Price: $${purchasePrice}
- Closing Date: ${closingDate}
- Earnest Money Deposit: $${earnestMoney || 'TBD'}
- Contingencies: ${contingencies}
${additionalTerms ? `- Additional Terms: ${additionalTerms}` : ''}

Format it as a professional legal document with numbered sections: 1) Parties, 2) Property Description, 3) Purchase Price and Payment, 4) Earnest Money, 5) Contingencies, 6) Closing, 7) Possession, 8) Default, 9) Miscellaneous, 10) Signatures.

Use formal legal language. Include placeholder signature lines with dates. This is for demonstration purposes only.`;

    try {
      await streamChat(
        [{ role: 'system', content: 'You are a real estate document assistant. Generate professional contract drafts for demonstration purposes. Always include a disclaimer that this is a draft and not legal advice.' },
         { role: 'user', content: prompt }],
        (chunk) => setDraft((prev) => prev + chunk),
      );
    } catch {
      setDraft('Error generating contract. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStep(1);
    setBuyerName('');
    setSellerName('');
    setPropertyAddress('');
    setPurchasePrice('');
    setClosingDate('');
    setEarnestMoney('');
    setContingencies('Financing, inspection, appraisal');
    setAdditionalTerms('');
    setDraft('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Helmet>
        <title>AI Contract Drafter Demo | {companyName} | DigitalCraft AI</title>
        <meta name="description" content="Generate a draft real estate purchase agreement with AI. Enter deal terms and get a professional contract draft instantly." />
      </Helmet>
      <DemoNavbar />

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        <div className="text-center mb-8 animate-fade-in">
          <Badge variant="secondary" className="mb-3">
            <Sparkles size={14} className="mr-1" /> AI Contract Tool
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            AI Contract Drafter
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            Enter deal terms and get a professional purchase agreement draft powered by GPT-4o.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6 text-sm">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={18} />
          <p className="text-amber-800 dark:text-amber-300">
            This is a demo tool. Generated drafts are for illustration only and do not constitute legal advice. Always have contracts reviewed by a licensed attorney.
          </p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Parties', 'Terms', 'Draft'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i + 1 <= step ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>{i + 1}</div>
              <span className={`text-sm hidden sm:inline ${i + 1 <= step ? 'text-primary font-medium' : 'text-gray-400'}`}>{label}</span>
              {i < 2 && <div className={`w-8 h-px ${i + 1 < step ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Parties & Property</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Buyer Name *</label>
              <Input value={buyerName} onChange={(e) => setBuyerName(e.target.value)} placeholder="John & Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Seller Name *</label>
              <Input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Robert Williams" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Address *</label>
              <Input value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="456 Oak Lane, Dallas, TX 75201" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Deal Terms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purchase Price ($) *</label>
                <Input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="350000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Closing Date *</label>
                <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Earnest Money ($)</label>
                <Input type="number" value={earnestMoney} onChange={(e) => setEarnestMoney(e.target.value)} placeholder="5000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contingencies</label>
              <Input value={contingencies} onChange={(e) => setContingencies(e.target.value)} placeholder="Financing, inspection, appraisal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Terms</label>
              <Textarea value={additionalTerms} onChange={(e) => setAdditionalTerms(e.target.value)} placeholder="Seller to leave appliances, closing cost credits, etc." rows={3} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
              {isGenerating && !draft && (
                <div className="flex items-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm font-medium">Drafting contract...</span>
                </div>
              )}
              {draft && (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                  {draft}
                  {isGenerating && <span className="animate-pulse text-primary">▊</span>}
                </div>
              )}
            </div>
            {!isGenerating && draft && (
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer size={16} className="mr-2" /> Print / Save PDF
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={step === 1 ? reset : () => setStep((s) => s - 1)} disabled={step === 1 || isGenerating}>
            {step === 1 ? <><RotateCcw size={16} className="mr-1" /> Reset</> : <><ArrowLeft size={16} className="mr-1" /> Back</>}
          </Button>
          {step === 1 && (
            <Button onClick={() => setStep(2)} disabled={!canAdvance()}>
              Next <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
          {step === 2 && (
            <Button onClick={generateContract} disabled={!canAdvance() || isGenerating}>
              {isGenerating ? <><Loader2 size={16} className="mr-1 animate-spin" /> Generating...</> : <><FileText size={16} className="mr-1" /> Generate Draft</>}
            </Button>
          )}
          {step === 3 && !isGenerating && (
            <Button variant="outline" onClick={reset}>
              <RotateCcw size={16} className="mr-1" /> Start Over
            </Button>
          )}
        </div>
      </div>
      <RelatedDemos currentPath={location.pathname} />
    </div>
  );
};

export default ContractDrafter;
