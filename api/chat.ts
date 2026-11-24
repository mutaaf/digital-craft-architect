import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, isTimeout, upstream, type GuardContext } from './_lib/guard.js';
import { OPENAI_URL, buildChatBody, forwardOpenAIError } from './_lib/openai.js';

export const config = { maxDuration: 60 };

// Body cap is large on purpose: the deal analyzer sends screenshots as base64
// data URLs (src/utils/propertyExtractor.ts). Vercel itself stops at 4.5 MB.
// Text is separately capped at 120k chars in buildChatBody.
export default guard(
  'chat',
  { methods: ['POST'], rate: { limit: 30, windowMs: 60_000 }, maxBodyBytes: 4_400_000 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const built = buildChatBody(req.body, {
      maxTokensCap: 4096,
      defaultMaxTokens: 4096,
      defaultTemperature: 0.4,
      allowResponseFormat: true,
    });
    if (built.ok === false) {
      ctx.err = 'invalid_body';
      return res.status(400).json({ error: { message: built.error } });
    }

    let resp: Response;
    try {
      resp = await upstream(
        ctx,
        OPENAI_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify(built.body),
        },
        55_000,
      );
    } catch (err) {
      if (isTimeout(err)) {
        ctx.err = 'upstream_timeout';
        return res.status(504).json({ error: { message: 'The AI took too long to respond. Please try again.' } });
      }
      throw err;
    }

    if (!resp.ok) {
      ctx.err = `upstream_${resp.status}`;
      return forwardOpenAIError(resp, res);
    }

    const data = await resp.json();
    return res.status(200).json(data);
  },
);
