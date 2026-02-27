import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link2, Camera, PenLine, Loader2, Search } from 'lucide-react';
import ImageDropZone from './ImageDropZone';
import { PROPERTY_TYPES, CONDITION_OPTIONS, emptyProperty, type PropertyData } from '@/data/propertyNegotiation';

interface PropertyInputPanelProps {
  onSubmitUrl: (url: string) => void;
  onSubmitImage: (base64: string) => void;
  onSubmitManual: (data: PropertyData) => void;
  disabled?: boolean;
  scrapeError?: string | null;
}

const PropertyInputPanel = ({
  onSubmitUrl,
  onSubmitImage,
  onSubmitManual,
  disabled,
  scrapeError,
}: PropertyInputPanelProps) => {
  const [url, setUrl] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [manual, setManual] = useState(emptyProperty);

  const updateManual = (field: keyof PropertyData, value: string | number | null) => {
    setManual((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Tabs defaultValue="url" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="url" disabled={disabled} className="gap-1.5 text-xs sm:text-sm">
          <Link2 size={14} /> URL
        </TabsTrigger>
        <TabsTrigger value="screenshot" disabled={disabled} className="gap-1.5 text-xs sm:text-sm">
          <Camera size={14} /> Screenshot
        </TabsTrigger>
        <TabsTrigger value="manual" disabled={disabled} className="gap-1.5 text-xs sm:text-sm">
          <PenLine size={14} /> Manual
        </TabsTrigger>
      </TabsList>

      {/* URL Tab */}
      <TabsContent value="url" className="mt-4 space-y-4">
        <div>
          <Label htmlFor="listing-url">Property Listing URL</Label>
          <div className="flex gap-2 mt-1.5">
            <Input
              id="listing-url"
              placeholder="https://www.realtor.com/realestateandhomes-detail/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
            <Button
              onClick={() => onSubmitUrl(url)}
              disabled={disabled || !url.trim()}
              className="gap-1.5 shrink-0"
            >
              {disabled ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Analyze
            </Button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">
            Works with Zillow, Realtor.com, Redfin, and wholesaler sites.
          </p>
          {scrapeError && (
            <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-950/30 rounded-md p-2">
              {scrapeError}
            </p>
          )}
        </div>
      </TabsContent>

      {/* Screenshot Tab */}
      <TabsContent value="screenshot" className="mt-4 space-y-4">
        <ImageDropZone onImage={setImageData} disabled={disabled} />
        <Button
          onClick={() => imageData && onSubmitImage(imageData)}
          disabled={disabled || !imageData}
          className="w-full gap-1.5"
        >
          {disabled ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Analyze Screenshot
        </Button>
      </TabsContent>

      {/* Manual Tab */}
      <TabsContent value="manual" className="mt-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="m-address">Address</Label>
            <Input
              id="m-address"
              placeholder="123 Main St, City, ST 12345"
              value={manual.address}
              onChange={(e) => updateManual('address', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-price">Asking Price ($)</Label>
            <Input
              id="m-price"
              type="number"
              placeholder="250000"
              value={manual.askingPrice || ''}
              onChange={(e) => updateManual('askingPrice', Number(e.target.value))}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-sqft">Square Feet</Label>
            <Input
              id="m-sqft"
              type="number"
              placeholder="1800"
              value={manual.sqft || ''}
              onChange={(e) => updateManual('sqft', Number(e.target.value))}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-beds">Bedrooms</Label>
            <Input
              id="m-beds"
              type="number"
              placeholder="3"
              value={manual.bedrooms || ''}
              onChange={(e) => updateManual('bedrooms', Number(e.target.value))}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-baths">Bathrooms</Label>
            <Input
              id="m-baths"
              type="number"
              placeholder="2"
              value={manual.bathrooms || ''}
              onChange={(e) => updateManual('bathrooms', Number(e.target.value))}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-year">Year Built</Label>
            <Input
              id="m-year"
              type="number"
              placeholder="1995"
              value={manual.yearBuilt || ''}
              onChange={(e) => updateManual('yearBuilt', Number(e.target.value))}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="m-dom">Days on Market</Label>
            <Input
              id="m-dom"
              type="number"
              placeholder="45"
              value={manual.daysOnMarket ?? ''}
              onChange={(e) =>
                updateManual('daysOnMarket', e.target.value ? Number(e.target.value) : null)
              }
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Property Type</Label>
            <Select
              value={manual.propertyType}
              onValueChange={(v) => updateManual('propertyType', v)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Condition</Label>
            <Select
              value={manual.condition}
              onValueChange={(v) => updateManual('condition', v)}
              disabled={disabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPTIONS.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="m-lot">Lot Size</Label>
            <Input
              id="m-lot"
              placeholder="0.25 acres"
              value={manual.lotSize}
              onChange={(e) => updateManual('lotSize', e.target.value)}
              disabled={disabled}
              className="mt-1"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="m-notes">Additional Notes</Label>
            <Textarea
              id="m-notes"
              placeholder="Motivated seller, needs new roof, etc."
              value={manual.notes}
              onChange={(e) => updateManual('notes', e.target.value)}
              disabled={disabled}
              className="mt-1"
              rows={2}
            />
          </div>
        </div>
        <Button
          onClick={() => onSubmitManual({ ...manual, listingSource: 'manual' })}
          disabled={disabled || !manual.address || !manual.askingPrice}
          className="w-full gap-1.5"
        >
          {disabled ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Analyze Property
        </Button>
      </TabsContent>
    </Tabs>
  );
};

export default PropertyInputPanel;
