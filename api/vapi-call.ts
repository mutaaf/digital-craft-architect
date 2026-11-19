import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, takeToken, truncate, upstream, type GuardContext } from './_lib/guard.js';
import { checkOutboundNumber } from './_lib/phone.js';

export const config = { maxDuration: 10 };

// Toll-fraud guard rails (per instance; see the caveat in _lib/guard.ts):
//  - 3 outbound calls per IP per 10 minutes (guard rate limit)
//  - 30 outbound calls per hour across all IPs (GLOBAL_* below)
//  - NANP numbers only, premium + Caribbean/Pacific area codes refused (_lib/phone.ts)
//  - calls end after 5 minutes
const GLOBAL_LIMIT = 30;
const GLOBAL_WINDOW_MS = 60 * 60_000;
const ASSISTANT_ID = /^[A-Za-z0-9-]{1,100}$/;

export default guard(
  'vapi-call',
  { methods: ['POST'], rate: { limit: 3, windowMs: 10 * 60_000 }, maxBodyBytes: 2_048 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.VAPI_API_KEY;
    const phoneNumberId = process.env.VAPI_PHONE_NUMBER_ID;

    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'Vapi API key not configured' });
    }
    if (!phoneNumberId) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'Vapi phone number not configured' });
    }

    const { assistantId, phoneNumber } = req.body ?? {};

    if (!assistantId || !phoneNumber) {
      ctx.err = 'missing_fields';
      return res.status(400).json({ error: 'assistantId and phoneNumber are required' });
    }
    if (typeof assistantId !== 'string' || !ASSISTANT_ID.test(assistantId)) {
      ctx.err = 'invalid_assistant';
      return res.status(400).json({ error: 'Invalid assistantId' });
    }

    const phone = checkOutboundNumber(phoneNumber);
    if (phone.ok === false) {
      ctx.err = 'phone_rejected';
      return res.status(422).json({ error: 'phone_not_allowed', message: phone.reason });
    }

    const retry = takeToken('vapi-call|global', GLOBAL_LIMIT, GLOBAL_WINDOW_MS);
    if (retry > 0) {
      ctx.err = 'global_cap';
      res.setHeader('Retry-After', String(retry));
      return res.status(429).json({
        error: 'rate_limited',
        message: 'The demo line is busy right now. Please try a browser call or come back later.',
        retryAfter: retry,
      });
    }

    const resp = await upstream(
      ctx,
      'https://api.vapi.ai/call/phone',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          assistantId,
          phoneNumberId,
          customer: { number: phone.e164 },
          maxDurationSeconds: 300,
        }),
      },
      8_000,
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      ctx.err = `upstream_${resp.status}`;
      console.error(JSON.stringify({ t: 'vapi_error', route: 'vapi-call', id: ctx.id, status: resp.status, err: truncate(JSON.stringify(err), 500) }));
      // Keep a `message` field: src/utils/vapiClient.ts shows it to the user.
      return res.status(resp.status).json({
        message: truncate(err.message, 300) || truncate(err.error, 300) || 'Vapi phone call failed',
        error: truncate(err.error, 300),
        statusCode: err.statusCode,
      });
    }

    const data = await resp.json();
    return res.status(200).json({ callId: data.id });
  },
);
