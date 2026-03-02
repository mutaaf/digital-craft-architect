import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Vapi API key not configured' });
  }

  try {
    const { systemPrompt, firstMessage, voiceId } = req.body;

    if (!systemPrompt || !firstMessage) {
      return res.status(400).json({ error: 'systemPrompt and firstMessage are required' });
    }

    const resp = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: 'Property Negotiator',
        model: {
          provider: 'openai',
          model: 'gpt-4o',
          systemPrompt,
          temperature: 0.7,
        },
        voice: {
          provider: '11labs',
          voiceId: voiceId || 'sarah',
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en',
        },
        firstMessage,
        endCallFunctionEnabled: true,
        maxDurationSeconds: 600,
        silenceTimeoutSeconds: 30,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      console.error('Vapi assistant creation failed:', JSON.stringify(err));
      return res.status(resp.status).json({ error: err.message || err.error || JSON.stringify(err) });
    }

    const data = await resp.json();
    return res.status(200).json({ assistantId: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
