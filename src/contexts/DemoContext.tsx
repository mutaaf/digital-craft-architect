import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { CompanyProfile } from '@/utils/websiteScraper';
import { scrapeWebsite } from '@/utils/websiteScraper';

interface DemoContextValue {
  company: CompanyProfile | null;
  isLoading: boolean;
  error: string | null;
  loadFromUrl: (url: string) => Promise<void>;
  loadFromName: (name: string) => Promise<void>;
  updateField: <K extends keyof CompanyProfile>(field: K, value: CompanyProfile[K]) => void;
  reset: () => void;
  isCustomized: boolean;
}

const DemoContext = createContext<DemoContextValue | null>(null);

const SESSION_KEY = 'dca_demo_company';

function loadFromSession(): CompanyProfile | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToSession(profile: CompanyProfile | null) {
  if (profile) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function DemoContextProvider({ children }: { children: ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile | null>(loadFromSession);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persist to sessionStorage on change
  useEffect(() => {
    saveToSession(company);
  }, [company]);

  const load = useCallback(async (input: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const profile = await scrapeWebsite(input);
      setCompany(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadFromUrl = useCallback((url: string) => load(url), [load]);
  const loadFromName = useCallback((name: string) => load(name), [load]);

  const updateField = useCallback(<K extends keyof CompanyProfile>(field: K, value: CompanyProfile[K]) => {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev));
  }, []);

  const reset = useCallback(() => {
    setCompany(null);
    setError(null);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  return (
    <DemoContext.Provider
      value={{
        company,
        isLoading,
        error,
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
