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
  startPhoneCall,
  pollCallStatus,
  endCall,
  cleanup,
  setupVapiListeners,
  sendCoachingMessage,
} from '@/utils/vapiClient';
import { saveConversation } from '@/utils/conversationStore';

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

  const [coachingMessages, setCoachingMessages] = useState<{ text: string; timestamp: number }[]>([]);

  const vapiRef = useRef<Awaited<ReturnType<typeof createVapiInstance>>>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const configRef = useRef<VoiceCallConfig | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const phoneCallIdRef = useRef<string | null>(null);
  const [isPhoneCall, setIsPhoneCall] = useState(false);

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

  const sendCoaching = useCallback((text: string) => {
    const msg = { text, timestamp: Date.now() };
    setCoachingMessages((prev) => [...prev, msg]);
    // Only send to Vapi if we have a live connection (not demo)
    if (vapiRef.current) {
      sendCoachingMessage(vapiRef.current, text);
    }
  }, []);

  /** Parse poll response messages into TranscriptEntry[] */
  const parsePollMessages = useCallback((messages: unknown[]): TranscriptEntry[] => {
    const entries: TranscriptEntry[] = [];
    for (const msg of messages as Array<Record<string, unknown>>) {
      const role = msg.role as string;
      if (role === 'assistant' || role === 'user') {
        const text = (msg.message || msg.content || '') as string;
        if (text) {
          entries.push({
            role: role as 'assistant' | 'user',
            text,
            timestamp: typeof msg.time === 'number' ? msg.time : Date.now(),
            isFinal: true,
          });
        }
      }
    }
    return entries;
  }, []);

  /** Do a final poll to grab the complete transcript after call ends */
  const fetchFinalTranscript = useCallback(async (callId: string): Promise<TranscriptEntry[]> => {
    try {
      const data = await pollCallStatus(callId);
      const entries = parsePollMessages(data.messages);
      if (entries.length > 0) {
        transcriptRef.current = entries;
        setState((prev) => ({ ...prev, transcript: entries }));
      }
      return entries;
    } catch {
      return transcriptRef.current;
    }
  }, [parsePollMessages]);

  const autoSaveConversation = useCallback((config: VoiceCallConfig, summary: CallSummary, isDemo: boolean) => {
    const finalTranscript = transcriptRef.current.filter((e) => e.isFinal);
    if (finalTranscript.length === 0) return;
    saveConversation({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      propertyAddress: config.property.address,
      askingPrice: config.property.askingPrice,
      bidRange: {
        min: config.bidRange.minOffer,
        target: config.bidRange.targetOffer,
        max: config.bidRange.maxOffer,
      },
      transcript: finalTranscript,
      summary,
      isDemo,
      companyName: config.companyName,
    });
  }, []);

  const startCall = useCallback(async (config: VoiceCallConfig) => {
    configRef.current = config;
    transcriptRef.current = [];
    setCoachingMessages([]);

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

        const usePhoneCall = config.sellerPhone && vapiStatus.hasPhoneNumber;

        if (usePhoneCall) {
          // ─── PHONE CALL PATH ───
          setIsPhoneCall(true);
          setState((prev) => ({ ...prev, status: 'connecting' }));
          const { callId } = await startPhoneCall(assistantId, config.sellerPhone!);
          phoneCallIdRef.current = callId;
          setState((prev) => ({ ...prev, callId, status: 'ringing' }));

          // Poll for status and transcript every 3s
          pollRef.current = setInterval(async () => {
            try {
              const data = await pollCallStatus(callId);

              // Update call status
              if (data.status === 'in_progress') {
                handleStatusChange('in_progress');
              } else if (data.status === 'ringing' || data.status === 'queued') {
                handleStatusChange('ringing');
              }

              // Parse any available messages (role already normalized by API)
              if (Array.isArray(data.messages) && data.messages.length > 0) {
                const entries = parsePollMessages(data.messages);
                if (entries.length > 0) {
                  transcriptRef.current = entries;
                  setState((prev) => ({ ...prev, transcript: entries }));
                }
              }

              // Call ended on the other side — stop polling, fetch final transcript, summarize
              if (data.status === 'ended') {
                if (pollRef.current) {
                  clearInterval(pollRef.current);
                  pollRef.current = null;
                }
                // Final fetch to get complete transcript
                await fetchFinalTranscript(callId);
                handleStatusChange('ended');
                setState((prev) => ({ ...prev, endTime: Date.now() }));
                // Generate summary from final transcript
                if (configRef.current) {
                  const summary = await generateSummary(configRef.current);
                  if (summary) {
                    setState((prev) => ({ ...prev, summary }));
                    autoSaveConversation(configRef.current, summary, false);
                  }
                }
              }
            } catch {
              // Silently continue polling on transient errors
            }
          }, 3000);
        } else {
          // ─── BROWSER CALL PATH (existing) ───
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
        }
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
          autoSaveConversation(config, summary, true);
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
  }, [vapiStatus, handleTranscript, handleStatusChange, generateSummary, autoSaveConversation]);

  const stopCall = useCallback(() => {
    // Capture refs before clearing
    const callId = phoneCallIdRef.current;
    const wasPhoneCall = !!callId;

    if (vapiRef.current) {
      endCall(vapiRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      status: 'ended',
      endTime: Date.now(),
    }));

    // For phone calls, do a final poll to grab transcript, then summarize
    if (wasPhoneCall && configRef.current) {
      const config = configRef.current;
      // Small delay to let Vapi finalize, then fetch transcript
      setTimeout(async () => {
        await fetchFinalTranscript(callId);
        const summary = await generateSummary(config);
        if (summary) {
          setState((prev) => ({ ...prev, summary }));
          autoSaveConversation(config, summary, false);
        }
      }, 2000);
    } else if (configRef.current) {
      // Browser or demo call — generate summary immediately
      const config = configRef.current;
      const isDemo = !vapiRef.current;
      generateSummary(config).then((summary) => {
        if (summary) {
          setState((prev) => ({ ...prev, summary }));
          autoSaveConversation(config, summary, isDemo);
        }
      });
    }

    phoneCallIdRef.current = null;
  }, [generateSummary, autoSaveConversation, fetchFinalTranscript]);

  const reset = useCallback(() => {
    if (vapiRef.current) {
      cleanup(vapiRef.current);
      vapiRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    phoneCallIdRef.current = null;
    transcriptRef.current = [];
    configRef.current = null;
    setCoachingMessages([]);
    setIsPhoneCall(false);
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
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, []);

  return {
    state,
    startCall,
    endCall: stopCall,
    reset,
    sendCoaching,
    coachingMessages,
    isVapiAvailable: vapiStatus?.available ?? false,
    isPhoneCall,
  };
}
