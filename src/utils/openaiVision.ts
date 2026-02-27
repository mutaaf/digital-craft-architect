export type VisionContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export interface VisionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | VisionContentPart[];
}

interface VisionOptions {
  temperature?: number;
  maxTokens?: number;
  jsonSchema?: { name: string; strict: boolean; schema: object };
}

/**
 * Non-streaming GPT-4o call that supports image content parts.
 * Returns the raw text content from the model response.
 */
export async function chatWithVision(
  messages: VisionMessage[],
  opts?: VisionOptions,
): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing VITE_OPENAI_API_KEY');

  const body: Record<string, unknown> = {
    model: 'gpt-4o',
    temperature: opts?.temperature ?? 0.4,
    max_tokens: opts?.maxTokens ?? 4096,
    messages,
  };

  if (opts?.jsonSchema) {
    body.response_format = {
      type: 'json_schema',
      json_schema: opts.jsonSchema,
    };
  }

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error?.message || `OpenAI request failed (${resp.status})`);
  }

  const data = await resp.json();
  return data.choices[0].message.content;
}
