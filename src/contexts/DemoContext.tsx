import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CompanyProfile } from '@/utils/websiteScraper';
import { scrapeWebsite } from '@/utils/websiteScraper';

export type Vertical = 'construction' | 'realestate' | 'events';

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

function sessionKey(vertical: Vertical) {
  return `dca_demo_company_${vertical}`;
}

function loadFromSession(vertical: Vertical): CompanyProfile | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(vertical));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToSession(vertical: Vertical, profile: CompanyProfile | null) {
  const key = sessionKey(vertical);
  if (profile) {
    sessionStorage.setItem(key, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(key);
  }
}

export function DemoContextProvider({ vertical = 'construction', children }: { vertical?: Vertical; children: ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile | null>(() => loadFromSession(vertical));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist to sessionStorage on change
  useEffect(() => {
    saveToSession(vertical, company);
  }, [company, vertical]);

  const load = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    try {
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
    sessionStorage.removeItem(sessionKey(vertical));
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
