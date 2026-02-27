import { chatWithVision, type VisionMessage, type VisionOptions } from './openaiVision';
import { streamChat, type ChatMessage } from './openaiChat';

const PREFIX = 'dca_deal_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

// ── djb2 hash ───────────────────────────────────────────────────────────

function djb2(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

/** Build a cache key from messages, truncating base64 image data. */
function buildKey(messages: unknown[]): string {
  const simplified = JSON.stringify(messages, (_key, value) => {
    if (typeof value === 'string' && value.startsWith('data:image/') && value.length > 200) {
      return value.slice(0, 200);
    }
    return value;
  });
  return PREFIX + djb2(simplified);
}

// ── Storage helpers ─────────────────────────────────────────────────────

interface CacheEntry {
  value: string;
  ts: number;
}

function getEntry(key: string, ttl: number): string | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > ttl) {
      sessionStorage.removeItem(key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

function setEntry(key: string, value: string) {
  const entry: CacheEntry = { value, ts: Date.now() };
  try {
    sessionStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // QuotaExceededError — evict oldest entries and retry
    evictOldest(3);
    try {
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // give up silently
    }
  }
}

function evictOldest(count: number) {
  const entries: { key: string; ts: number }[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    try {
      const { ts } = JSON.parse(sessionStorage.getItem(key)!) as CacheEntry;
      entries.push({ key, ts });
    } catch {
      entries.push({ key, ts: 0 });
    }
  }
  entries.sort((a, b) => a.ts - b.ts);
  for (let i = 0; i < Math.min(count, entries.length); i++) {
    sessionStorage.removeItem(entries[i].key);
  }
}

// ── Public API ──────────────────────────────────────────────────────────

interface CacheOpts {
  ttl?: number;
}

/** Wraps chatWithVision with sessionStorage caching. */
export async function cachedVision(
  messages: VisionMessage[],
  opts?: VisionOptions,
  cacheOpts?: CacheOpts,
): Promise<string> {
  const key = buildKey(messages);
  const ttl = cacheOpts?.ttl ?? DEFAULT_TTL;
  const hit = getEntry(key, ttl);
  if (hit) return hit;

  const result = await chatWithVision(messages, opts);
  setEntry(key, result);
  return result;
}

/** Wraps streamChat with caching. On cache hit, replays full text instantly. */
export async function cachedStream(
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  cacheOpts?: CacheOpts,
): Promise<string> {
  const key = buildKey(messages);
  const ttl = cacheOpts?.ttl ?? DEFAULT_TTL;
  const hit = getEntry(key, ttl);
  if (hit) {
    onChunk(hit);
    return hit;
  }

  const result = await streamChat(messages, onChunk, signal);
  setEntry(key, result);
  return result;
}

/** Clear all deal cache entries from sessionStorage. */
export function clearDealCache() {
  const keys: string[] = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(PREFIX)) keys.push(key);
  }
  keys.forEach((k) => sessionStorage.removeItem(k));
}
