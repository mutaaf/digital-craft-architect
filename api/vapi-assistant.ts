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
    const { systemPrompt, firstMessage, voiceId, isPhoneCall } = req.body;

    if (!systemPrompt) {
      return res.status(400).json({ error: 'systemPrompt is required' });
    }

    // For phone calls: no firstMessage — the agent waits for the seller to speak
    // For browser calls: firstMessage kicks off the conversation
    const assistantConfig: Record<string, unknown> = {
      name: 'Property Negotiator',
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt,
        temperature: 0.8,
      },
      voice: {
        provider: '11labs',
        voiceId: voiceId || 'paula',
        stability: 0.3,
        similarityBoost: 0.75,
        speed: 0.92,
        style: 0.4,
        useSpeakerBoost: true,
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
      endCallFunctionEnabled: true,
      maxDurationSeconds: 600,
      silenceTimeoutSeconds: 30,
      responseDelaySeconds: 0.5,
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
    };

    // Only set firstMessage if provided (browser calls)
    if (firstMessage) {
      assistantConfig.firstMessage = firstMessage;
    }

    // For phone calls: add a short delay before responding so it sounds natural
    if (isPhoneCall) {
      assistantConfig.responseDelaySeconds = 0.8;
    }

    const resp = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(assistantConfig),
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
