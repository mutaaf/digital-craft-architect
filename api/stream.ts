import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, isTimeout, upstream, type GuardContext } from './_lib/guard.js';
import { OPENAI_URL, buildChatBody, forwardOpenAIError } from './_lib/openai.js';

export const config = { maxDuration: 60 };

export default guard(
  'stream',
  { methods: ['POST'], rate: { limit: 30, windowMs: 60_000 }, maxBodyBytes: 200_000 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const built = buildChatBody(req.body, {
      maxTokensCap: 2048,
      defaultMaxTokens: 1024,
      defaultTemperature: 0.7,
      allowResponseFormat: false,
    });
    if (built.ok === false) {
      ctx.err = 'invalid_body';
      return res.status(400).json({ error: { message: built.error } });
    }

    // One 55s budget (maxDuration is 60) covering connect AND the streamed body:
    // the abort signal stays attached to resp.body.
    let resp: Response;
    try {
      resp = await upstream(
        ctx,
        OPENAI_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ ...built.body, stream: true }),
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

    // Stream SSE back to the client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const reader = resp.body as unknown as NodeJS.ReadableStream;
      for await (const chunk of reader) {
        res.write(chunk);
      }
    } catch (err) {
      // Mid-stream failure (timeout or upstream reset): headers are already
      // sent, so just close; the client sees a truncated stream.
      ctx.err = isTimeout(err) ? 'stream_timeout' : 'stream_aborted';
    }
    res.end();
  },
);
