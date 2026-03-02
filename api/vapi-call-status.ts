import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VAPI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Vapi API key not configured' });
  }

  const callId = req.query.callId as string;
  if (!callId) {
    return res.status(400).json({ error: 'callId query parameter is required' });
  }

  try {
    const resp = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(callId)}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json(err);
    }

    const data = await resp.json();

    // Map Vapi call status to our status format
    // Vapi statuses: queued, ringing, in-progress, forwarding, ended
    let status = data.status;
    if (status === 'in-progress') status = 'in_progress';

    // Vapi stores messages in artifact.messages (post-call) or messages (during/after)
    // Vapi uses role "bot" for assistant and "user" for the caller
    const rawMessages: Array<Record<string, unknown>> =
      data.artifact?.messages || data.messages || [];

    const messages = rawMessages
      .filter((m) => m.role === 'bot' || m.role === 'assistant' || m.role === 'user')
      .map((m) => ({
        role: (m.role === 'bot' || m.role === 'assistant') ? 'assistant' : 'user',
        message: m.message || m.content || '',
        time: m.time || m.startTime || 0,
        secondsFromStart: m.secondsFromStart || 0,
      }));

    // Also grab the plain-text transcript if Vapi provides one
    const transcript = data.artifact?.transcript
      || messages
        .map((m) => `${m.role === 'assistant' ? 'AGENT' : 'SELLER'}: ${m.message}`)
        .join('\n');

    return res.status(200).json({
      status,
      transcript,
      messages,
      endedReason: data.endedReason || null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
