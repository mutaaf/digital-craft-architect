import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { messages, temperature, max_tokens, response_format } = req.body;

    const body: Record<string, unknown> = {
      model: 'gpt-4o',
      temperature: temperature ?? 0.4,
      max_tokens: max_tokens ?? 4096,
      messages,
    };

    if (response_format) {
      body.response_format = response_format;
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
      return res.status(resp.status).json(err);
    }

    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
