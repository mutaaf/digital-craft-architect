import { useState } from 'react';
import { useDemoContext } from '@/contexts/DemoContext';
import type { Vertical } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Globe, Loader2, CheckCircle2, Pencil, RotateCcw, AlertCircle } from 'lucide-react';
import type { CompanyProfile } from '@/utils/websiteScraper';

const VERTICAL_PLACEHOLDERS: Record<Vertical, string> = {
  construction: 'e.g. premierbuilds.com or Premier Builds',
  realestate: 'e.g. luxuryrealty.com or Luxury Realty Group',
  events: 'e.g. djrubyru.com or Ruby Ru Events',
};

const EDITABLE_FIELDS: { key: keyof CompanyProfile; label: string; type?: string }[] = [
  { key: 'companyName', label: 'Company Name' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'tagline', label: 'Tagline' },
  { key: 'location', label: 'Location' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'bookingUrl', label: 'Booking URL' },
  { key: 'avgJobValue', label: 'Avg Job Value ($)', type: 'number' },
  { key: 'primaryColor', label: 'Brand Color', type: 'color' },
];

const CompanySetupForm = () => {
  const { company, isLoading, error, loadFromUrl, reset, updateField, isCustomized, vertical } =
    useDemoContext();
  const [input, setInput] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const placeholder = VERTICAL_PLACEHOLDERS[vertical];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    loadFromUrl(input.trim());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 size={20} className="text-primary animate-spin" />
          <div>
            <p className="text-sm font-semibold">Analyzing your website...</p>
            <p className="text-xs text-gray-400">Scraping content and extracting company info</p>
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  // Customized state — show company name + edit/reset
  if (isCustomized && company) {
    return (
      <>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-primary/20 p-4 sm:p-5 mb-8 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: company.primaryColor + '20' }}>
                <CheckCircle2 size={20} style={{ color: company.primaryColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{company.companyName}</p>
                <p className="text-xs text-gray-400 truncate">
                  {company.location} &middot; {company.services.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                <Pencil size={12} /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-gray-400">
                <RotateCcw size={12} /> Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Edit modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {EDITABLE_FIELDS.map((f) => {
                const val = company[f.key];
                return (
                  <div key={f.key} className="grid gap-1.5">
                    <Label htmlFor={f.key} className="text-xs">
                      {f.label}
                    </Label>
                    {f.key === 'services' ? null : (
                      <Input
                        id={f.key}
                        type={f.type || 'text'}
                        value={String(val ?? '')}
                        onChange={(e) => {
                          const v = f.type === 'number' ? Number(e.target.value) : e.target.value;
                          updateField(f.key, v as never);
                        }}
                      />
                    )}
                  </div>
                );
              })}
              {/* Services as comma-separated */}
              <div className="grid gap-1.5">
                <Label htmlFor="services" className="text-xs">
                  Services (comma-separated)
                </Label>
                <Input
                  id="services"
                  value={company.services.join(', ')}
                  onChange={(e) =>
                    updateField(
                      'services',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setEditOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Default: input form
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-6 mb-8 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Globe size={16} className="text-primary" />
        <p className="text-sm font-semibold">Customize for Your Business</p>
        <Badge variant="outline" className="text-[10px] ml-auto">
          Optional
        </Badge>
      </div>
      <p className="text-xs text-gray-400 mb-4">
        Enter your company website or name to see all demos personalized to your business.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="submit" disabled={!input.trim()} className="gap-1.5 shrink-0">
          Customize Demos
        </Button>
      </form>
      {error && (
        <div className="flex items-center gap-2 mt-3 text-red-500">
          <AlertCircle size={14} />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CompanySetupForm;
