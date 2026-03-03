import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Vapi API key not configured' });
  }

  const { callId } = req.body;
  if (!callId) {
    return res.status(400).json({ error: 'callId is required' });
  }

  try {
    // Vapi's API: DELETE /call/{id} terminates an active call
    const resp = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(callId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      // 404 means the call already ended — that's fine
      if (resp.status === 404) {
        return res.status(200).json({ success: true, alreadyEnded: true });
      }
      return res.status(resp.status).json({
        error: err.message || err.error || 'Failed to end call',
      });
    }

    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
