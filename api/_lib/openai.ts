/** Validation + error shaping for the GPT-4o proxies (chat.ts, stream.ts). */
import type { VercelResponse } from '@vercel/node';
import { truncate } from './guard.js';

export const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const ROLES = new Set(['system', 'user', 'assistant']);
const MAX_MESSAGES = 60;
const MAX_TEXT_CHARS = 120_000;
const MAX_IMAGES = 8;

export interface ChatLimits {
  maxTokensCap: number;
  defaultMaxTokens: number;
  defaultTemperature: number;
  allowResponseFormat: boolean;
}

export type ChatValidation =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; error: string };

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Builds the upstream request body from an untrusted client body, or explains why not. */
export function buildChatBody(input: unknown, limits: ChatLimits): ChatValidation {
  if (!input || typeof input !== 'object') return { ok: false, error: 'Body must be a JSON object' };
  const { messages, temperature, max_tokens, response_format } = input as Record<string, unknown>;

  if (!Array.isArray(messages) || messages.length < 1 || messages.length > MAX_MESSAGES) {
    return { ok: false, error: `messages must be an array of 1-${MAX_MESSAGES} items` };
  }

  let textChars = 0;
  let images = 0;
  const clean: Array<{ role: string; content: unknown }> = [];
  for (const m of messages) {
    if (!m || typeof m !== 'object') return { ok: false, error: 'Invalid message' };
    const { role, content } = m as Record<string, unknown>;
    if (typeof role !== 'string' || !ROLES.has(role)) return { ok: false, error: 'Invalid message role' };
    if (typeof content === 'string') {
      textChars += content.length;
      clean.push({ role, content });
    } else if (Array.isArray(content)) {
      const parts: unknown[] = [];
      for (const p of content) {
        if (!p || typeof p !== 'object') return { ok: false, error: 'Invalid content part' };
        const part = p as Record<string, unknown>;
        if (part.type === 'text' && typeof part.text === 'string') {
          textChars += part.text.length;
          parts.push({ type: 'text', text: part.text });
        } else if (part.type === 'image_url') {
          const iu = part.image_url as Record<string, unknown> | undefined;
          const url = iu && typeof iu.url === 'string' ? iu.url : '';
          if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(url) && !/^https:\/\//i.test(url)) {
            return { ok: false, error: 'Invalid image_url' };
          }
          if (++images > MAX_IMAGES) return { ok: false, error: `At most ${MAX_IMAGES} images` };
          const out: Record<string, unknown> = { url };
          if (iu && (iu.detail === 'low' || iu.detail === 'high' || iu.detail === 'auto')) out.detail = iu.detail;
          parts.push({ type: 'image_url', image_url: out });
        } else {
          return { ok: false, error: 'Unsupported content part' };
        }
      }
      clean.push({ role, content: parts });
    } else {
      return { ok: false, error: 'Message content must be a string or an array' };
    }
  }
  if (textChars > MAX_TEXT_CHARS) return { ok: false, error: 'Messages are too long' };

  const maxTokens =
    typeof max_tokens === 'number' && Number.isFinite(max_tokens)
      ? clamp(Math.floor(max_tokens), 1, limits.maxTokensCap)
      : limits.defaultMaxTokens;
  const temp =
    typeof temperature === 'number' && Number.isFinite(temperature)
      ? clamp(temperature, 0, 1.5)
      : limits.defaultTemperature;

  const body: Record<string, unknown> = {
    model: 'gpt-4o',
    temperature: temp,
    max_tokens: maxTokens,
    messages: clean,
  };

  if (response_format !== undefined && response_format !== null) {
    if (!limits.allowResponseFormat) return { ok: false, error: 'response_format is not supported here' };
    const rf = response_format as Record<string, unknown>;
    if (typeof rf !== 'object' || (rf.type !== 'json_object' && rf.type !== 'json_schema')) {
      return { ok: false, error: 'response_format.type must be json_object or json_schema' };
    }
    body.response_format = rf;
  }

  return { ok: true, body };
}

/** Forward OpenAI's status, but only its (truncated) message string. */
export async function forwardOpenAIError(resp: Response, res: VercelResponse): Promise<void> {
  const err = (await resp.json().catch(() => ({}))) as { error?: { message?: unknown } };
  const message = truncate(err?.error?.message, 300) ?? `OpenAI request failed (${resp.status})`;
  res.status(resp.status).json({ error: { message } });
}
