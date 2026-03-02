import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  VoiceCallState,
  VoiceCallConfig,
  CallStatus,
  TranscriptEntry,
  CallSummary,
} from '@/data/voiceNegotiation';
import { generateVoiceSystemPrompt, generateCallSummaryPrompt } from '@/utils/voicePromptGenerator';
import { runDemoConversation } from '@/utils/voiceDemoSimulator';
import {
  createVapiInstance,
  startBrowserCall,
  endCall,
  cleanup,
  setupVapiListeners,
} from '@/utils/vapiClient';

const INITIAL_STATE: VoiceCallState = {
  status: 'idle',
  callId: null,
  transcript: [],
  startTime: null,
  endTime: null,
  elapsedSeconds: 0,
  summary: null,
  error: null,
  isDemo: false,
};

interface VapiStatus {
  available: boolean;
  hasPublicKey: boolean;
  hasPhoneNumber: boolean;
  publicKey: string | null;
}

export function useVoiceCall() {
  const [state, setState] = useState<VoiceCallState>(INITIAL_STATE);
  const [vapiStatus, setVapiStatus] = useState<VapiStatus | null>(null);

  const vapiRef = useRef<Awaited<ReturnType<typeof createVapiInstance>>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const configRef = useRef<VoiceCallConfig | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  // Check Vapi availability on mount
  useEffect(() => {
    fetch('/api/vapi-status')
      .then((r) => r.json())
      .then((data) => setVapiStatus(data))
      .catch(() => setVapiStatus({ available: false, hasPublicKey: false, hasPhoneNumber: false, publicKey: null }));
  }, []);

  // Elapsed timer
  useEffect(() => {
    if (state.status === 'in_progress' || state.status === 'connecting' || state.status === 'ringing') {
      if (!timerRef.current && state.startTime) {
        timerRef.current = setInterval(() => {
          setState((prev) => ({
            ...prev,
            elapsedSeconds: Math.floor((Date.now() - (prev.startTime || Date.now())) / 1000),
          }));
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.status, state.startTime]);

  const handleTranscript = useCallback((entry: TranscriptEntry) => {
    setState((prev) => {
      // For interim transcripts, replace the last entry of the same role if not final
      if (!entry.isFinal) {
        const existing = [...prev.transcript];
        const lastIdx = existing.length - 1;
        if (lastIdx >= 0 && existing[lastIdx].role === entry.role && !existing[lastIdx].isFinal) {
          existing[lastIdx] = entry;
          return { ...prev, transcript: existing };
        }
        return { ...prev, transcript: [...existing, entry] };
      }

      // Final transcript: replace last interim of same role, or append
      const existing = [...prev.transcript];
      const lastIdx = existing.length - 1;
      if (lastIdx >= 0 && existing[lastIdx].role === entry.role && !existing[lastIdx].isFinal) {
        existing[lastIdx] = entry;
      } else {
        existing.push(entry);
      }
      transcriptRef.current = existing;
      return { ...prev, transcript: existing };
    });
  }, []);

  const handleStatusChange = useCallback((status: CallStatus) => {
    setState((prev) => ({
      ...prev,
      status,
      ...(status === 'ended' ? { endTime: Date.now() } : {}),
    }));
  }, []);

  const generateSummary = useCallback(async (config: VoiceCallConfig): Promise<CallSummary | null> => {
    const finalTranscript = transcriptRef.current
      .filter((e) => e.isFinal)
      .map((e) => `${e.role === 'assistant' ? 'AGENT' : 'SELLER'}: ${e.text}`)
      .join('\n');

    if (!finalTranscript.trim()) return null;

    const prompt = generateCallSummaryPrompt(finalTranscript, config);

    try {
      const resp = await fetch('/api/call-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: finalTranscript, prompt }),
      });

      if (!resp.ok) {
        // Fall back to /api/chat if call-summary fails
        const chatResp = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: 'You are an expert real estate negotiation analyst. Produce valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
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
                    'sellerPosition', 'lowestAcceptable', 'sellerTimeline', 'sellerMotivation',
                    'keyInsights', 'recommendedNextSteps', 'agreedPrice', 'callDurationSeconds', 'overallSentiment',
                  ],
                  additionalProperties: false,
                },
              },
            },
          }),
        });
        if (chatResp.ok) {
          const chatData = await chatResp.json();
          return JSON.parse(chatData.choices[0].message.content);
        }
        return null;
      }

      const data = await resp.json();
      return data.summary;
    } catch {
      return null;
    }
  }, []);

  const startCall = useCallback(async (config: VoiceCallConfig) => {
    configRef.current = config;
    transcriptRef.current = [];

    const isVapiMode = vapiStatus?.available && vapiStatus.hasPublicKey;

    setState({
      ...INITIAL_STATE,
      status: 'configuring',
      startTime: Date.now(),
      isDemo: !isVapiMode,
    });

    if (isVapiMode && vapiStatus.publicKey) {
      // Real Vapi mode
      try {
        const systemPrompt = generateVoiceSystemPrompt(config);
        const firstName = config.sellerName?.split(' ')[0] || '';
        const firstMessage = `Hi${firstName ? ` ${firstName}` : ' there'}! This is calling from ${config.companyName}. I saw your property listing at ${config.property.address} and I'm really interested — do you have a minute to chat?`;

        // Create assistant server-side
        const assistantResp = await fetch('/api/vapi-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, firstMessage }),
        });

        if (!assistantResp.ok) throw new Error('Failed to create assistant');
        const { assistantId } = await assistantResp.json();

        // Create Vapi instance
        const vapi = await createVapiInstance(vapiStatus.publicKey);
        if (!vapi) throw new Error('Failed to initialize Vapi SDK');

        vapiRef.current = vapi;

        setupVapiListeners(vapi, {
          onStatusChange: handleStatusChange,
          onTranscript: handleTranscript,
          onError: (error) => {
            setState((prev) => ({ ...prev, error, status: 'error' }));
          },
        });

        setState((prev) => ({ ...prev, status: 'connecting' }));
        await startBrowserCall(vapi, assistantId);
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to start call',
        }));
      }
    } else {
      // Demo mode
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await runDemoConversation(
          config,
          handleTranscript,
          handleStatusChange,
          controller.signal,
        );

        // Generate summary after demo ends
        setState((prev) => ({ ...prev, status: 'ended', endTime: Date.now() }));
        const summary = await generateSummary(config);
        if (summary) {
          setState((prev) => ({ ...prev, summary }));
        }
      } catch (err) {
        if (!(err instanceof Error && err.name === 'AbortError')) {
          setState((prev) => ({
            ...prev,
            status: 'error',
            error: err instanceof Error ? err.message : 'Demo failed',
          }));
        }
      }
    }
  }, [vapiStatus, handleTranscript, handleStatusChange, generateSummary]);

  const stopCall = useCallback(() => {
    if (vapiRef.current) {
      endCall(vapiRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    setState((prev) => ({
      ...prev,
      status: 'ended',
      endTime: Date.now(),
    }));

    // Generate summary
    if (configRef.current) {
      generateSummary(configRef.current).then((summary) => {
        if (summary) {
          setState((prev) => ({ ...prev, summary }));
        }
      });
    }
  }, [generateSummary]);

  const reset = useCallback(() => {
    if (vapiRef.current) {
      cleanup(vapiRef.current);
      vapiRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    transcriptRef.current = [];
    configRef.current = null;
    setState(INITIAL_STATE);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        cleanup(vapiRef.current);
      }
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    state,
    startCall,
    endCall: stopCall,
    reset,
    isVapiAvailable: vapiStatus?.available ?? false,
  };
}
