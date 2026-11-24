import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, truncate, upstream, type GuardContext } from './_lib/guard.js';

export const config = { maxDuration: 10 };

const CALL_ID = /^[A-Za-z0-9-]{1,100}$/;

export default guard(
  'vapi-call-status',
  // The phone path polls every 3s (40/min); 120/min leaves room for two tabs.
  { methods: ['GET'], rate: { limit: 120, windowMs: 60_000 } },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    res.setHeader('Cache-Control', 'no-store');
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'Vapi API key not configured' });
    }

    const callId = req.query.callId;
    if (!callId) {
      ctx.err = 'missing_call_id';
      return res.status(400).json({ error: 'callId query parameter is required' });
    }
    if (typeof callId !== 'string' || !CALL_ID.test(callId)) {
      ctx.err = 'invalid_call_id';
      return res.status(400).json({ error: 'Invalid callId' });
    }

    const resp = await upstream(
      ctx,
      `https://api.vapi.ai/call/${encodeURIComponent(callId)}`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
      8_000,
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      ctx.err = `upstream_${resp.status}`;
      return res.status(resp.status).json({
        error: truncate(err.message, 300) || truncate(err.error, 300) || 'Failed to fetch call status',
      });
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
  },
);
