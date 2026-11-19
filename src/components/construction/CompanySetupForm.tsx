import { useState } from 'react';
import { useDemoContext } from '@/contexts/DemoContext';
import type { Vertical } from '@/contexts/DemoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Globe, Loader2, CheckCircle2, Pencil, RotateCcw, AlertCircle } from 'lucide-react';
import type { CompanyProfile } from '@/utils/websiteScraper';

const VERTICAL_PLACEHOLDERS: Partial<Record<Vertical, string>> = {
  construction: 'e.g. premierbuilds.com or Premier Builds',
  realestate: 'e.g. luxuryrealty.com or Luxury Realty Group',
  events: 'e.g. eliteeventsco.com or Elite Events Co',
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
  const placeholder = VERTICAL_PLACEHOLDERS[vertical] ?? 'e.g. yourcompany.com';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    loadFromUrl(input.trim());
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mb-8 rounded-[28px] bg-[#f5f5f7] p-6 sm:p-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-4">
          <Loader2 size={20} className="text-primary animate-spin" />
          <div>
            <p className="text-sm font-semibold">Analyzing your website...</p>
            <p className="text-xs text-[#6e6e73]">Scraping content and extracting company info</p>
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
        <div className="mb-8 rounded-[28px] bg-[#f5f5f7] p-5 sm:p-6 animate-fade-in">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: company.primaryColor + '20' }}>
                <CheckCircle2 size={20} style={{ color: company.primaryColor }} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{company.companyName}</p>
                <p className="truncate text-xs text-[#6e6e73]">
                  {company.location} &middot; {company.services.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
                <Pencil size={12} /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1.5 text-[#6e6e73]">
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

  // Default: input form (keynote: one rounded field, one pill)
  return (
    <div className="mb-8 rounded-[28px] bg-[#f5f5f7] p-6 text-center sm:p-8 animate-fade-in">
      <p className="mb-1 flex items-center justify-center gap-2 text-[19px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
        <Globe size={18} className="text-aurora" aria-hidden /> Make every demo yours
      </p>
      <p className="mx-auto mb-5 text-balance text-[15px] text-[#6e6e73]">Optional. Add your website or company name.</p>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-[560px] flex-col gap-2.5 sm:flex-row">
        <label htmlFor="dc-setup-site" className="sr-only">Your website or company name</label>
        <input
          id="dc-setup-site"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          inputMode="url"
          autoCapitalize="none"
          spellCheck={false}
          className="h-[50px] w-full min-w-0 rounded-full sm:flex-1 border border-[#d2d2d7] bg-white px-5 text-[16px] text-[#1d1d1f] outline-none transition placeholder:text-[#86868b] focus:border-aurora focus:ring-4 focus:ring-aurora/15"
        />
        <button type="submit" disabled={!input.trim()} className="k-pill k-pill-brand !min-h-[50px] disabled:opacity-40">
          Personalize
        </button>
      </form>
      {error && (
        <div className="mt-3 flex items-center justify-center gap-2 text-red-600">
          <AlertCircle size={14} />
          <p className="text-[13px]">{error}</p>
        </div>
      )}
    </div>
  );
};

export default CompanySetupForm;
