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
  endPhoneCall,
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
  endedReason: null,
};

interface VapiStatus {
  available: boolean;
  hasPublicKey: boolean;
  hasPhoneNumber: boolean;
  publicKey: string | null;
}

/** Map Vapi endedReason to a human-readable label */
function getEndedReasonLabel(reason: string | null): string | null {
  if (!reason) return null;
  const map: Record<string, string> = {
    'customer-did-not-answer': 'No Answer',
    'customer-busy': 'Line Busy',
    'customer-did-not-give-microphone-permission': 'No Mic Permission',
    'assistant-ended-call': 'Agent Ended Call',
    'assistant-said-end-call-phrase': 'Agent Ended Call',
    'assistant-forwarded-call': 'Call Forwarded',
    'assistant-join-timed-out': 'Connection Timeout',
    'customer-ended-call': 'Other Party Hung Up',
    'silence-timed-out': 'No Response (Silence)',
    'voicemail': 'Went to Voicemail',
    'max-duration-reached': 'Max Duration Reached',
    'manually-canceled': 'Call Cancelled',
    'phone-call-provider-closed-websocket': 'Connection Lost',
    'pipeline-error-openai-llm-failed': 'AI Service Error',
    'pipeline-error-deepgram-transcriber-failed': 'Transcription Error',
  };
  return map[reason] || reason.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
  const stoppingRef = useRef(false); // prevents race between polling ended + user clicking End
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
              { role: 'system', content: 'You are an expert conversation analyst. Produce valid JSON.' },
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
                    sellerEmail: { type: ['string', 'null'] },
                    sellerPhone: { type: ['string', 'null'] },
                  },
                  required: [
                    'sellerPosition', 'lowestAcceptable', 'sellerTimeline', 'sellerMotivation',
                    'keyInsights', 'recommendedNextSteps', 'agreedPrice', 'callDurationSeconds', 'overallSentiment',
                    'sellerEmail', 'sellerPhone',
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

  /** Fetch transcript with retries and exponential backoff */
  const fetchFinalTranscript = useCallback(async (callId: string): Promise<TranscriptEntry[]> => {
    const delays = [2000, 4000, 6000]; // retry delays
    for (let attempt = 0; attempt <= delays.length; attempt++) {
      try {
        if (attempt > 0) {
          await new Promise((r) => setTimeout(r, delays[attempt - 1]));
        }
        const data = await pollCallStatus(callId);
        const entries = parsePollMessages(data.messages);
        if (entries.length > 0) {
          transcriptRef.current = entries;
          setState((prev) => ({ ...prev, transcript: entries }));
          return entries;
        }
        // If we got a transcript string but no parsed messages, use the string
        if (data.transcript && data.transcript.trim()) {
          // Parse the plain-text transcript into entries
          const lines = data.transcript.split('\n').filter((l: string) => l.trim());
          const parsed: TranscriptEntry[] = lines.map((line: string) => {
            const isAgent = line.startsWith('AGENT:') || line.startsWith('AI:') || line.startsWith('Bot:');
            const text = line.replace(/^(AGENT|SELLER|AI|Bot|User):\s*/i, '');
            return {
              role: isAgent ? 'assistant' as const : 'user' as const,
              text,
              timestamp: Date.now(),
              isFinal: true,
            };
          });
          if (parsed.length > 0) {
            transcriptRef.current = parsed;
            setState((prev) => ({ ...prev, transcript: parsed }));
            return parsed;
          }
        }
        // If the call hasn't been finalized yet and we have more retries, continue
        if (attempt < delays.length) continue;
      } catch {
        if (attempt >= delays.length) break;
      }
    }
    return transcriptRef.current;
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
      property: config.property,
      report: config.report,
      comps: config.comps,
    });
  }, []);

  /** Handle call ended — fetch final transcript, generate summary, handle empty transcript */
  const handleCallEnded = useCallback(async (
    callId: string,
    config: VoiceCallConfig,
    endedReason: string | null,
  ) => {
    // Prevent double-processing
    if (stoppingRef.current) return;
    stoppingRef.current = true;

    // Clear polling
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    const reasonLabel = getEndedReasonLabel(endedReason);

    setState((prev) => ({
      ...prev,
      status: 'ended',
      endTime: Date.now(),
      endedReason: reasonLabel,
    }));

    // Fetch final transcript with retries
    const finalEntries = await fetchFinalTranscript(callId);

    // If we have transcript, generate a proper summary
    if (finalEntries.length > 0) {
      const summary = await generateSummary(config);
      if (summary) {
        setState((prev) => ({ ...prev, summary }));
        autoSaveConversation(config, summary, false);
        stoppingRef.current = false;
        return;
      }
    }

    // No transcript or summary generation failed — create a fallback summary
    const noConversation = endedReason === 'customer-did-not-answer'
      || endedReason === 'customer-busy'
      || endedReason === 'voicemail'
      || endedReason === 'silence-timed-out'
      || endedReason === 'manually-canceled'
      || finalEntries.length === 0;

    const fallbackSummary: CallSummary = {
      sellerPosition: noConversation
        ? 'No conversation took place — the call was not connected or ended before a conversation could happen.'
        : 'Call ended but the full conversation could not be processed.',
      lowestAcceptable: null,
      sellerTimeline: 'Unknown',
      sellerMotivation: 'Unknown — follow up needed',
      keyInsights: noConversation
        ? [
            `Call outcome: ${reasonLabel || 'Call ended'}`,
            'No conversation was recorded during this call',
            'A follow-up attempt should be scheduled',
          ]
        : [
            `Call outcome: ${reasonLabel || 'Call ended'}`,
            'Conversation took place but transcript processing failed',
            'Try calling again or follow up via email',
          ],
      recommendedNextSteps: [
        'Schedule a follow-up call at a different time',
        'Send an introductory email or text message',
        'Research the best time to reach this seller',
      ],
      agreedPrice: null,
      callDurationSeconds: Math.floor(
        ((Date.now()) - (state.startTime || Date.now())) / 1000,
      ),
      overallSentiment: 'neutral',
      sellerEmail: null,
      sellerPhone: config.sellerPhone || null,
    };

    setState((prev) => ({ ...prev, summary: fallbackSummary }));
    stoppingRef.current = false;
  }, [fetchFinalTranscript, generateSummary, autoSaveConversation, state.startTime]);

  const startCall = useCallback(async (config: VoiceCallConfig) => {
    configRef.current = config;
    transcriptRef.current = [];
    stoppingRef.current = false;
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
        const systemPrompt = config.promptOverride || generateVoiceSystemPrompt(config);
        const firstName = config.sellerName?.split(' ')[0] || '';
        const willBePhoneCall = !!(config.sellerPhone && vapiStatus.hasPhoneNumber);

        // For phone calls: no firstMessage — wait for the other party to say hello
        // For browser calls: agent speaks first since it's a demo
        // If config provides a firstMessage, always use it (allows verticals to customize)
        let firstMessage: string | undefined;
        if (willBePhoneCall) {
          firstMessage = undefined;
        } else if (config.firstMessage) {
          firstMessage = config.firstMessage;
        } else {
          const shortAddr = config.property.address.split(',')[0];
          firstMessage = config.companyName && config.companyName !== 'DigitalCraft AI'
            ? `Hi${firstName ? ` ${firstName}` : ' there'}! This is calling from ${config.companyName}. I saw your property listing on ${shortAddr} and I'm really interested — do you have a minute to chat?`
            : `Hi${firstName ? ` ${firstName}` : ' there'}! I saw your property listing on ${shortAddr} and I'm really interested — do you have a minute to chat?`;
        }

        // Create assistant server-side
        const assistantResp = await fetch('/api/vapi-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt, firstMessage, isPhoneCall: willBePhoneCall }),
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
            if (stoppingRef.current) return; // don't poll while stopping
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

              // Call ended on the other side
              if (data.status === 'ended') {
                if (configRef.current) {
                  handleCallEnded(callId, configRef.current, data.endedReason);
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
  }, [vapiStatus, handleTranscript, handleStatusChange, generateSummary, autoSaveConversation, handleCallEnded, parsePollMessages]);

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

    if (wasPhoneCall && callId) {
      // Actually terminate the phone call on Vapi's side
      endPhoneCall(callId);
      // handleCallEnded will manage everything: polling cleanup, transcript fetch, summary
      if (configRef.current) {
        handleCallEnded(callId, configRef.current, 'manually-canceled');
      }
    } else {
      // Browser or demo call — set ended and generate summary immediately
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      setState((prev) => ({
        ...prev,
        status: 'ended',
        endTime: Date.now(),
      }));

      if (configRef.current) {
        const config = configRef.current;
        const isDemo = !vapiRef.current;
        generateSummary(config).then((summary) => {
          if (summary) {
            setState((prev) => ({ ...prev, summary }));
            autoSaveConversation(config, summary, isDemo);
          }
        });
      }
    }

    phoneCallIdRef.current = null;
  }, [generateSummary, autoSaveConversation, handleCallEnded]);

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
    stoppingRef.current = false;
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
