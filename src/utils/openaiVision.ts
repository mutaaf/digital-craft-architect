export type VisionContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface VisionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | VisionContentPart[];
}

export interface VisionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: { name: string; strict: boolean; schema: object };
}

/**
 * Non-streaming GPT-4o call that supports image content parts.
 * Routes through /api/chat serverless proxy to avoid CORS.
 */
export async function chatWithVision(
  messages: VisionMessage[],
  opts?: VisionOptions,
): Promise<string> {
  const body: Record<string, unknown> = {
    messages,
    temperature: opts?.temperature ?? 0.4,
    max_tokens: opts?.maxTokens ?? 4096,
  };

  if (opts?.jsonSchema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: opts.jsonSchema,
    };
  }

  const resp = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI request failed (${resp.status})`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}
