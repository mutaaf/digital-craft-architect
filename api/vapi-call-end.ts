import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, truncate, upstream, type GuardContext } from './_lib/guard.js';

export const config = { maxDuration: 10 };

const CALL_ID = /^[A-Za-z0-9-]{1,100}$/;

export default guard(
  'vapi-call-end',
  { methods: ['POST'], rate: { limit: 20, windowMs: 60_000 }, maxBodyBytes: 1_024 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'Vapi API key not configured' });
    }

    const { callId } = req.body ?? {};
    if (!callId) {
      ctx.err = 'missing_call_id';
      return res.status(400).json({ error: 'callId is required' });
    }
    if (typeof callId !== 'string' || !CALL_ID.test(callId)) {
      ctx.err = 'invalid_call_id';
      return res.status(400).json({ error: 'Invalid callId' });
    }

    // Vapi's API: DELETE /call/{id} terminates an active call
    const resp = await upstream(
      ctx,
      `https://api.vapi.ai/call/${encodeURIComponent(callId)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${apiKey}` } },
      8_000,
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      // 404 means the call already ended — that's fine
      if (resp.status === 404) {
        return res.status(200).json({ success: true, alreadyEnded: true });
      }
      ctx.err = `upstream_${resp.status}`;
      return res.status(resp.status).json({
        error: truncate(err.message, 300) || truncate(err.error, 300) || 'Failed to end call',
      });
    }

    return res.status(200).json({ success: true });
  },
);
