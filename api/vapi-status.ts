import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard } from './_lib/guard.js';

export const config = { maxDuration: 10 };

/**
 * GET /api/vapi-status         -> voice feature flags (read by useVoiceCall + voiceDemoSimulator;
 *                                 the shape must not change)
 * GET /api/vapi-status?full=1  -> health report: which integrations are configured (booleans
 *                                 only, never values) plus region/commit/env.
 */
export default guard('vapi-status', { methods: ['GET'], rate: { limit: 120, windowMs: 60_000 } }, (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  if (req.query.full === '1') {
    return res.status(200).json({
      ok: true,
      time: new Date().toISOString(),
      region: process.env.VERCEL_REGION ?? null,
      commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
      env: process.env.VERCEL_ENV ?? null,
      integrations: {
        openai: Boolean(process.env.OPENAI_API_KEY),
        vapi: Boolean(process.env.VAPI_API_KEY),
        vapiPhone: Boolean(process.env.VAPI_PHONE_NUMBER_ID),
        firecrawl: Boolean(process.env.FIRECRAWL_API_KEY),
        edgeConfig: Boolean(process.env.EDGE_CONFIG),
      },
    });
  }

  const available = Boolean(process.env.VAPI_API_KEY);
  const hasPublicKey = Boolean(process.env.VAPI_PUBLIC_KEY);
  const hasPhoneNumber = Boolean(process.env.VAPI_PHONE_NUMBER_ID);

  return res.status(200).json({
    available,
    hasPublicKey,
    hasPhoneNumber,
    publicKey: hasPublicKey ? process.env.VAPI_PUBLIC_KEY : null,
  });
});
