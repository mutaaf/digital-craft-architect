import type { TranscriptEntry, CallSummary } from '@/data/voiceNegotiation';

export interface StoredConversation {
  id: string;
  timestamp: number;
  propertyAddress: string;
  askingPrice: number;
  bidRange: { min: number; target: number; max: number };
  transcript: TranscriptEntry[];
  summary: CallSummary;
  isDemo: boolean;
  companyName: string;
}

const STORAGE_KEY = 'dca_voice_conversations';
const MAX_ITEMS = 20;

export function saveConversation(conv: StoredConversation): void {
  const existing = getConversations();
  existing.unshift(conv);
  // Cap at MAX_ITEMS (FIFO)
  const capped = existing.slice(0, MAX_ITEMS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    // Storage full — drop oldest and retry
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(capped.slice(0, 10)));
    } catch {
      // give up silently
    }
  }
}

export function getConversations(): StoredConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredConversation[];
    return parsed.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

export function deleteConversation(id: string): void {
  const existing = getConversations();
  const filtered = existing.filter((c) => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
