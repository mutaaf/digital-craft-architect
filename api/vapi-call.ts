import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

  if (!apiKey) {
    return res.status(500).json({ error: 'Vapi API key not configured' });
  }
  if (!phoneNumberId) {
    return res.status(500).json({ error: 'Vapi phone number not configured' });
  }

  try {
    const { assistantId, phoneNumber } = req.body;

    if (!assistantId || !phoneNumber) {
      return res.status(400).json({ error: 'assistantId and phoneNumber are required' });
    }

    const resp = await fetch('https://api.vapi.ai/call/phone', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        assistantId,
        phoneNumberId,
        customer: {
          number: phoneNumber,
        },
        maxDurationSeconds: 600,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json(err);
    }

    const data = await resp.json();
    return res.status(200).json({ callId: data.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
