import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, isTimeout, upstream, type GuardContext } from './_lib/guard.js';
import { OPENAI_URL, forwardOpenAIError } from './_lib/openai.js';

export const config = { maxDuration: 60 };

const MAX_TRANSCRIPT = 100_000;
// The prompt embeds the transcript plus instructions (src/utils/voicePromptGenerator.ts).
const MAX_PROMPT = 120_000;

const RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'call_summary',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        sellerPosition: { type: 'string' },
        lowestAcceptable: { type: ['number', 'null'] },
        sellerTimeline: { type: 'string' },
        sellerMotivation: { type: 'string' },
        keyInsights: { type: 'array', items: { type: 'string' } },
        recommendedNextSteps: { type: 'array', items: { type: 'string' } },
        agreedPrice: { type: ['number', 'null'] },
        callDurationSeconds: { type: 'number' },
        overallSentiment: { type: 'string', enum: ['positive', 'neutral', 'negative'] },
      },
      required: [
        'sellerPosition',
        'lowestAcceptable',
        'sellerTimeline',
        'sellerMotivation',
        'keyInsights',
        'recommendedNextSteps',
        'agreedPrice',
        'callDurationSeconds',
        'overallSentiment',
      ],
      additionalProperties: false,
    },
  },
};

export default guard(
  'call-summary',
  { methods: ['POST'], rate: { limit: 20, windowMs: 60_000 }, maxBodyBytes: 300_000 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { transcript, prompt } = req.body ?? {};

    if (!transcript || !prompt || typeof transcript !== 'string' || typeof prompt !== 'string') {
      ctx.err = 'missing_fields';
      return res.status(400).json({ error: 'transcript and prompt are required' });
    }
    if (transcript.length > MAX_TRANSCRIPT || prompt.length > MAX_PROMPT) {
      ctx.err = 'too_long';
      return res.status(413).json({ error: 'Transcript is too long to summarize' });
    }

    let resp: Response;
    try {
      resp = await upstream(
        ctx,
        OPENAI_URL,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o',
            temperature: 0.3,
            max_tokens: 2048,
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert real estate negotiation analyst. Analyze call transcripts and produce structured JSON summaries.',
              },
              { role: 'user', content: prompt },
            ],
            response_format: RESPONSE_FORMAT,
          }),
        },
        55_000,
      );
    } catch (err) {
      if (isTimeout(err)) {
        ctx.err = 'upstream_timeout';
        return res.status(504).json({ error: { message: 'The summary took too long. Please try again.' } });
      }
      throw err;
    }

    if (!resp.ok) {
      ctx.err = `upstream_${resp.status}`;
      return forwardOpenAIError(resp, res);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      ctx.err = 'empty_summary';
      return res.status(500).json({ error: 'No summary generated' });
    }

    const summary = JSON.parse(content);
    return res.status(200).json({ summary });
  },
);
