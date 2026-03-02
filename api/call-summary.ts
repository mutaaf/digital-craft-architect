import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 60 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const { transcript, prompt } = req.body;

    if (!transcript || !prompt) {
      return res.status(400).json({ error: 'transcript and prompt are required' });
    }

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0.3,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: 'You are an expert real estate negotiation analyst. Analyze call transcripts and produce structured JSON summaries.' },
          { role: 'user', content: prompt },
        ],
        response_format: {
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
        },
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return res.status(resp.status).json(err);
    }

    const data = await resp.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'No summary generated' });
    }

    const summary = JSON.parse(content);
    return res.status(200).json({ summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: { message } });
  }
}
