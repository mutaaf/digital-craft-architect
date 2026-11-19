import type { VercelRequest, VercelResponse } from '@vercel/node';
import { guard, truncate, upstream, type GuardContext } from './_lib/guard.js';

export const config = { maxDuration: 30 };

const MAX_PROMPT = 20_000;
const MAX_FIRST_MESSAGE = 500;
const MAX_NAME = 80;
const VOICE_ID = /^[A-Za-z0-9]{1,64}$/;

export default guard(
  'vapi-assistant',
  { methods: ['POST'], rate: { limit: 10, windowMs: 10 * 60_000 }, maxBodyBytes: 64_000 },
  async (req: VercelRequest, res: VercelResponse, ctx: GuardContext) => {
    const apiKey = process.env.VAPI_API_KEY;
    if (!apiKey) {
      ctx.err = 'not_configured';
      return res.status(500).json({ error: 'Vapi API key not configured' });
    }

    const { systemPrompt, firstMessage, voiceId, isPhoneCall, assistantName } = req.body ?? {};

    if (!systemPrompt || typeof systemPrompt !== 'string') {
      ctx.err = 'missing_prompt';
      return res.status(400).json({ error: 'systemPrompt is required' });
    }
    if (systemPrompt.length > MAX_PROMPT) {
      ctx.err = 'prompt_too_long';
      return res.status(413).json({ error: 'systemPrompt is too long' });
    }
    if (firstMessage !== undefined && firstMessage !== null && firstMessage !== '' &&
        (typeof firstMessage !== 'string' || firstMessage.length > MAX_FIRST_MESSAGE)) {
      ctx.err = 'invalid_first_message';
      return res.status(400).json({ error: `firstMessage must be a string of at most ${MAX_FIRST_MESSAGE} characters` });
    }
    if (voiceId !== undefined && voiceId !== null && voiceId !== '' &&
        (typeof voiceId !== 'string' || !VOICE_ID.test(voiceId))) {
      ctx.err = 'invalid_voice';
      return res.status(400).json({ error: 'Invalid voiceId' });
    }
    const name = typeof assistantName === 'string' && assistantName.trim()
      ? assistantName.trim().slice(0, MAX_NAME)
      : 'AI Voice Agent';

    // For phone calls: no firstMessage — the agent waits for the seller to speak
    // For browser calls: firstMessage kicks off the conversation
    const assistantConfig: Record<string, unknown> = {
      name,
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        systemPrompt,
        temperature: 0.85,
        maxTokens: 150,
      },
      voice: {
        provider: '11labs',
        voiceId: voiceId || '56AoDkrOh6qfVPDXZ7Pt', // Cassidy — crisp podcaster female
        model: 'eleven_turbo_v2_5',
        stability: 0.4,
        similarityBoost: 0.75,
        speed: 0.95,
        style: 0.5,
        optimizeStreamingLatency: 3,
        chunkPlan: {
          enabled: true,
          minCharacters: 30,
          punctuationBoundaries: ['.', '!', '?', ','],
          formatPlan: {
            enabled: true,
          },
        },
      },
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en',
      },
      endCallFunctionEnabled: true,
      maxDurationSeconds: 600,
      silenceTimeoutSeconds: 10,
      responseDelaySeconds: 0.8,
      backchannelingEnabled: true,
      backgroundDenoisingEnabled: true,
      numWordsToInterruptAssistant: 3,
      startSpeakingPlan: {
        waitSeconds: 1.2,
        smartEndpointingEnabled: true,
        transcriptionEndpointingPlan: {
          onPunctuationSeconds: 0.8,
          onNoPunctuationSeconds: 1.5,
          onNumberSeconds: 1.0,
        },
      },
    };

    // Only set firstMessage if provided (browser calls)
    if (firstMessage) {
      assistantConfig.firstMessage = firstMessage;
    }

    // For phone calls: longer wait before responding so it doesn't cut off the seller
    if (isPhoneCall) {
      assistantConfig.responseDelaySeconds = 1.2;
    }

    const resp = await upstream(
      ctx,
      'https://api.vapi.ai/assistant',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(assistantConfig),
      },
      20_000,
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      ctx.err = `upstream_${resp.status}`;
      // Full Vapi error goes to the logs (keyed by request id), not to the browser.
      console.error(JSON.stringify({ t: 'vapi_error', route: 'vapi-assistant', id: ctx.id, status: resp.status, err: truncate(JSON.stringify(err), 1000) }));
      const msg = Array.isArray(err.message) ? err.message.join('; ') : err.message;
      return res.status(resp.status).json({
        error: truncate(msg, 300) || truncate(err.error, 300) || 'Vapi assistant creation failed',
        requestId: ctx.id,
      });
    }

    const data = await resp.json();
    return res.status(200).json({ assistantId: data.id });
  },
);
