import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CompanyProfile } from '@/utils/websiteScraper';
import { scrapeWebsite } from '@/utils/websiteScraper';
import { trackCompanyUrlSubmission } from '@/utils/analytics';

export type Vertical = 'construction' | 'realestate' | 'events' | 'homeservices' | 'healthcare' | 'legal' | 'restaurant' | 'kidsplay' | 'fitness' | 'dental' | 'salon' | 'autorepair';

interface DemoContextValue {
  company: CompanyProfile | null;
  isLoading: boolean;
  error: string | null;
  vertical: Vertical;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromName: (name: string) => Promise<void>;
  updateField: <K extends keyof CompanyProfile>(field: K, value: CompanyProfile[K]) => void;
  reset: () => void;
  isCustomized: boolean;
}

const DemoContext = createContext<DemoContextValue | null>(null);

function storageKey(vertical: Vertical) {
  return `dca_demo_company_${vertical}`;
}

// Persistence lives in localStorage so a personalized demo profile survives a new
// browser session (ticket 0010). Key scoping stays per-vertical and reset clears
// the same key; all access is guarded so storage being unavailable is non-fatal.
function loadProfile(vertical: Vertical): CompanyProfile | null {
  try {
    const raw = localStorage.getItem(storageKey(vertical));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfile(vertical: Vertical, profile: CompanyProfile | null) {
  try {
    const key = storageKey(vertical);
    if (profile) {
      localStorage.setItem(key, JSON.stringify(profile));
    } else {
      localStorage.removeItem(key);
    }
  } catch {
    /* storage unavailable - non-fatal */
  }
}

export function DemoContextProvider({ vertical = 'construction', children }: { vertical?: Vertical; children: ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile | null>(() => loadProfile(vertical));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist to localStorage on change so the profile survives across sessions.
  useEffect(() => {
    saveProfile(vertical, company);
  }, [company, vertical]);

  const load = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    try {
      trackCompanyUrlSubmission(vertical);
      const profile = await scrapeWebsite(input, vertical);
      setCompany(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
    } finally {
      setIsLoading(false);
    }
  }, [vertical]);

  const loadFromUrl = useCallback((url: string) => load(url), [load]);
  const loadFromName = useCallback((name: string) => load(name), [load]);

  const updateField = useCallback(<K extends keyof CompanyProfile>(field: K, value: CompanyProfile[K]) => {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const reset = useCallback(() => {
    setCompany(null);
    setError(null);
    saveProfile(vertical, null);
  }, [vertical]);

  return (
    <DemoContext.Provider
      value={{
        company,
        isLoading,
        error,
        vertical,
        loadFromUrl,
        loadFromName,
        updateField,
        reset,
        isCustomized: company !== null,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoContext must be used within DemoContextProvider');
  return ctx;
}
